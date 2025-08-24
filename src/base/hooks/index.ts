import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { socketService } from '../services';
import { User, Room, MediaState, PeerConnection, EmojiReaction } from '../types';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = socketService.connect();
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socketService.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, []);

  return { socket, isConnected };
};

export const useMediaStream = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [mediaState, setMediaState] = useState<MediaState>({
    isVideoOn: true,
    isAudioOn: true,
    isScreenSharing: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [backgroundFilter, setBackgroundFilter] = useState<string>('none');

  const getMediaStream = useCallback(async (video = true, audio = true) => {
    try {
      setError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false,
        audio,
      });

      setStream(mediaStream);
      setMediaState(prev => ({ ...prev, isVideoOn: video, isAudioOn: audio }));
      return mediaStream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access media devices';
      setError(errorMessage);
      console.error('Error accessing media devices:', err);
      throw err;
    }
  }, []);

  const toggleVideo = useCallback(async () => {
    try {
      if (!mediaState.isVideoOn) {
        // If video is off, get a new stream with video enabled
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: mediaState.isAudioOn
        });

        // Stop the old stream if it exists
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        setStream(newStream);
        setMediaState(prev => ({ ...prev, isVideoOn: true }));
        return true;
      } else {
        // If video is on, create a new stream without video
        let newStream: MediaStream | null = null;

        if (mediaState.isAudioOn) {
          // Keep audio, remove video
          newStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
          });
        } else {
          // No audio or video needed
          newStream = new MediaStream();
        }

        // Stop the old stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        setStream(newStream);
        setMediaState(prev => ({ ...prev, isVideoOn: false }));
        return false;
      }
    } catch (error) {
      console.error('Failed to toggle video:', error);
      setError('Failed to toggle video');
      return mediaState.isVideoOn;
    }
  }, [stream, mediaState.isVideoOn, mediaState.isAudioOn]);

  const toggleAudio = useCallback(async () => {
    try {
      if (!mediaState.isAudioOn) {
        // If audio is off, get a new stream with audio enabled
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: mediaState.isVideoOn ? {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          } : false,
          audio: true
        });

        // Stop the old stream if it exists
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        setStream(newStream);
        setMediaState(prev => ({ ...prev, isAudioOn: true }));
        return true;
      } else {
        // If audio is on, create a new stream without audio
        let newStream: MediaStream | null = null;

        if (mediaState.isVideoOn) {
          // Keep video, remove audio
          newStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user'
            },
            audio: false
          });
        } else {
          // No audio or video needed
          newStream = new MediaStream();
        }

        // Stop the old stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        setStream(newStream);
        setMediaState(prev => ({ ...prev, isAudioOn: false }));
        return false;
      }
    } catch (error) {
      console.error('Failed to toggle audio:', error);
      setError('Failed to toggle audio');
      return mediaState.isAudioOn;
    }
  }, [stream, mediaState.isVideoOn, mediaState.isAudioOn]);

  const startScreenShare = useCallback(async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      setScreenStream(displayStream);
      setMediaState(prev => ({ ...prev, isScreenSharing: true }));

      // Handle screen share end
      const videoTrack = displayStream.getVideoTracks()[0];
      videoTrack.onended = async () => {
        setScreenStream(null);
        setMediaState(prev => ({ ...prev, isScreenSharing: false }));
        // Restart camera if it was on before screen sharing
        if (mediaState.isVideoOn) {
          await getMediaStream(true, mediaState.isAudioOn);
        }
      };

      return displayStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      setError('Failed to start screen sharing');
    }
    return null;
  }, [mediaState.isAudioOn, mediaState.isVideoOn, getMediaStream]);

  const stopScreenShare = useCallback(async () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setMediaState(prev => ({ ...prev, isScreenSharing: false }));
      // Restart camera if it was on before screen sharing
      if (mediaState.isVideoOn) {
        await getMediaStream(true, mediaState.isAudioOn);
      }
    }
  }, [screenStream, mediaState.isVideoOn, mediaState.isAudioOn, getMediaStream]);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    setMediaState({
      isVideoOn: false,
      isAudioOn: false,
      isScreenSharing: false,
    });
  }, [stream, screenStream]);

  // Get the active stream (screen share takes priority)
  const activeStream = screenStream || stream;

  return {
    stream: activeStream,
    cameraStream: stream,
    screenStream,
    mediaState,
    error,
    backgroundFilter,
    setBackgroundFilter,
    getMediaStream,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    stopStream,
  };
};

export const useWebRTC = () => {
  const [peerConnections, setPeerConnections] = useState<Map<string, PeerConnection>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const renegotiationPendingRef = useRef<Map<string, boolean>>(new Map());

  const createPeerConnection = useCallback((userId: string, roomId: string): RTCPeerConnection => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
        { urls: "stun:stun.stunprotocol.org:3478" },
        { urls: "stun:stun.sipgate.net:3478" },
        { urls: "stun:stun.ideasip.com:3478" },
        { urls: "stun:stun.ekiga.net" },
        { urls: "stun:stun.voipstunt.com" }
      ],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    // Add local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('Received remote track from:', userId, 'Tracks:', event.streams[0].getTracks().length);
      const [remoteStream] = event.streams;
      if (remoteStream) {
        setRemoteStreams(prev => new Map(prev).set(userId, remoteStream));
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.sendIceCandidate(roomId, event.candidate, userId);
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Peer connection state with ${userId}: ${peerConnection.connectionState}`);
      if (peerConnection.connectionState === 'failed') {
        peerConnection.restartIce();
      } else if (peerConnection.connectionState === 'disconnected') {
        console.log(`Peer ${userId} disconnected`);
      }
    };

    // Handle ICE connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state with ${userId}: ${peerConnection.iceConnectionState}`);
    };

    // Handle signaling state changes
    peerConnection.onsignalingstatechange = () => {
      console.log(`Signaling state with ${userId}: ${peerConnection.signalingState}`);
      if (peerConnection.signalingState === 'stable') {
        renegotiationPendingRef.current.set(userId, false);
      }
    };

    // Store peer connection
    setPeerConnections(prev => {
      const newMap = new Map(prev);
      newMap.set(userId, { userId, connection: peerConnection });
      return newMap;
    });

    // Process pending ICE candidates
    const pendingCandidates = pendingCandidatesRef.current.get(userId) || [];
    if (pendingCandidates.length > 0 && peerConnection.remoteDescription) {
      pendingCandidates.forEach(async (candidate) => {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Error adding pending ICE candidate:', error);
        }
      });
      pendingCandidatesRef.current.delete(userId);
    }

    return peerConnection;
  }, []);

  const createOffer = useCallback(async (userId: string, roomId: string) => {
    try {
      console.log('Creating offer for user:', userId);
      const peerConnection = createPeerConnection(userId, roomId);
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      await peerConnection.setLocalDescription(new RTCSessionDescription(offer));
      socketService.sendOffer(roomId, offer, userId);
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }, [createPeerConnection]);

  const handleOffer = useCallback(async (
    offer: RTCSessionDescriptionInit,
    fromUserId: string,
    roomId: string
  ) => {
    try {
      console.log('Handling offer from user:', fromUserId);
      const peerConnectionData = peerConnections.get(fromUserId);
      let peerConnection = peerConnectionData?.connection;

      if (!peerConnection) {
        peerConnection = createPeerConnection(fromUserId, roomId);
      }

      if (peerConnection.signalingState === 'stable') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(new RTCSessionDescription(answer));
        socketService.sendAnswer(roomId, answer, fromUserId);
      } else {
        console.log(`Skipping offer handling for ${fromUserId} due to signaling state: ${peerConnection.signalingState}`);
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }, [createPeerConnection, peerConnections]);

  const handleAnswer = useCallback(async (
    answer: RTCSessionDescriptionInit,
    fromUserId: string
  ) => {
    try {
      console.log('Handling answer from user:', fromUserId);
      const peerConnectionData = peerConnections.get(fromUserId);
      if (peerConnectionData && peerConnectionData.connection.signalingState === 'have-local-offer') {
        await peerConnectionData.connection.setRemoteDescription(new RTCSessionDescription(answer));
      } else {
        console.log(`Skipping answer handling for ${fromUserId} due to signaling state: ${peerConnectionData?.connection.signalingState || 'none'}`);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }, [peerConnections]);

  const handleIceCandidate = useCallback(async (
    candidate: RTCIceCandidateInit,
    fromUserId: string
  ) => {
    try {
      const peerConnectionData = peerConnections.get(fromUserId);
      if (peerConnectionData && peerConnectionData.connection.remoteDescription) {
        await peerConnectionData.connection.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        const pending = pendingCandidatesRef.current.get(fromUserId) || [];
        pending.push(candidate);
        pendingCandidatesRef.current.set(fromUserId, pending);
        console.log(`Stored pending ICE candidate for ${fromUserId}`);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }, [peerConnections]);

  const setLocalStream = useCallback(async (stream: MediaStream, roomId: string) => {
    console.log('Setting local stream, tracks:', stream.getTracks().length);
    localStreamRef.current = stream;

    // Update existing peer connections with new stream
    for (const [userId, peerConnectionData] of peerConnections) {
      const { connection } = peerConnectionData;
      let needsRenegotiation = false;

      // Get current senders
      const senders = connection.getSenders();

      // Replace or add video track
      const videoTrack = stream.getVideoTracks()[0];
      const videoSender = senders.find(s => s.track && s.track.kind === 'video');

      if (videoTrack) {
        if (videoSender) {
          if (videoSender.track !== videoTrack) {
            await videoSender.replaceTrack(videoTrack);
            needsRenegotiation = true;
          }
        } else {
          connection.addTrack(videoTrack, stream);
          needsRenegotiation = true;
        }
      } else if (videoSender && videoSender.track) {
        await videoSender.replaceTrack(null);
        needsRenegotiation = true;
      }

      // Replace or add audio track
      const audioTrack = stream.getAudioTracks()[0];
      const audioSender = senders.find(s => s.track && s.track.kind === 'audio');

      if (audioTrack) {
        if (audioSender) {
          if (audioSender.track !== audioTrack) {
            await audioSender.replaceTrack(audioTrack);
            needsRenegotiation = true;
          }
        } else {
          connection.addTrack(audioTrack, stream);
          needsRenegotiation = true;
        }
      } else if (audioSender && audioSender.track) {
        await audioSender.replaceTrack(null);
        needsRenegotiation = true;
      }

      // Trigger renegotiation only if needed and not already in progress
      if (needsRenegotiation && connection.signalingState === 'stable' && !renegotiationPendingRef.current.get(userId)) {
        try {
          renegotiationPendingRef.current.set(userId, true);
          const offer = await connection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          await connection.setLocalDescription(new RTCSessionDescription(offer));
          socketService.sendOffer(roomId, offer, userId);
        } catch (error) {
          console.error('Error creating renegotiation offer:', error);
          renegotiationPendingRef.current.set(userId, false);
        }
      }
    }
  }, [peerConnections]);

  const removePeerConnection = useCallback((userId: string) => {
    const peerConnectionData = peerConnections.get(userId);
    if (peerConnectionData) {
      peerConnectionData.connection.close();
    }

    setPeerConnections(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });

    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });

    pendingCandidatesRef.current.delete(userId);
    renegotiationPendingRef.current.delete(userId);
  }, [peerConnections]);

  const cleanup = useCallback(() => {
    peerConnections.forEach((peerConnectionData) => {
      peerConnectionData.connection.close();
    });
    setPeerConnections(new Map());
    setRemoteStreams(new Map());
    pendingCandidatesRef.current.clear();
    renegotiationPendingRef.current.clear();
  }, [peerConnections]);

  return {
    peerConnections,
    remoteStreams,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    setLocalStream,
    removePeerConnection,
    cleanup,
  };
};

export const useVideoCall = (roomId: string) => {
  const { socket, isConnected } = useSocket();
  const { stream, cameraStream, screenStream, mediaState, error, backgroundFilter, setBackgroundFilter, getMediaStream, toggleVideo, toggleAudio, startScreenShare, stopScreenShare, stopStream } = useMediaStream();
  const webRTC = useWebRTC();

  const [room, setRoom] = useState<Room | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [reactions, setReactions] = useState<EmojiReaction[]>([]);

  // Set local stream for WebRTC when stream changes
  useEffect(() => {
    if (stream) {
      webRTC.setLocalStream(stream, roomId);
    }
  }, [stream, webRTC, roomId]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    socket.on('joined-room', (data: { room: Room; user: User }) => {
      setRoom(data.room);
      setCurrentUser(data.user);
      setUsers(data.room.users);
      setIsJoined(true);
    });

    socket.on('user-joined', (data: { user: User; room: Room }) => {
      setRoom(data.room);
      setUsers(data.room.users);

      // Create offer for new user
      if (currentUser && data.user.socketId !== socket.id) {
        webRTC.createOffer(data.user.socketId, roomId);
      }
    });

    socket.on('user-left', (data: { userId: string; room: Room }) => {
      setRoom(data.room);
      setUsers(data.room.users);
      webRTC.removePeerConnection(data.userId);
    });

    socket.on('users-list', (data: { users: User[] }) => {
      setUsers(data.users);
    });

    socket.on('user-video-toggled', (data: { userId: string; isVideoOn: boolean }) => {
      setUsers(prev => prev.map(user =>
        user.id === data.userId ? { ...user, isVideoOn: data.isVideoOn } : user
      ));
    });

    socket.on('user-audio-toggled', (data: { userId: string; isAudioOn: boolean }) => {
      setUsers(prev => prev.map(user =>
        user.id === data.userId ? { ...user, isAudioOn: data.isAudioOn } : user
      ));
    });

    socket.on('user-hand-raised', (data: { userId: string; isHandRaised: boolean }) => {
      setUsers(prev => prev.map(user =>
        user.id === data.userId ? { ...user, isHandRaised: data.isHandRaised } : user
      ));
    });

    socket.on('user-reaction', (data: { userId: string; userName: string; emoji: string; timestamp: string }) => {
      const reaction: EmojiReaction = {
        id: `${data.userId}-${Date.now()}`,
        userId: data.userId,
        userName: data.userName,
        emoji: data.emoji,
        timestamp: new Date(data.timestamp)
      };
      
      setReactions(prev => [...prev, reaction]);
      
      // Update user's last reaction
      setUsers(prev => prev.map(user =>
        user.id === data.userId ? { 
          ...user, 
          lastReaction: { 
            emoji: data.emoji, 
            timestamp: new Date(data.timestamp) 
          } 
        } : user
      ));

      // Remove reaction after 3 seconds
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
        setUsers(prev => prev.map(user =>
          user.id === data.userId && user.lastReaction?.timestamp.getTime() === reaction.timestamp.getTime()
            ? { ...user, lastReaction: undefined }
            : user
        ));
      }, 3000);
    });

    // WebRTC signaling handlers
    socket.on('offer', (data: { offer: RTCSessionDescriptionInit; fromUserId: string }) => {
      webRTC.handleOffer(data.offer, data.fromUserId, roomId);
    });

    socket.on('answer', (data: { answer: RTCSessionDescriptionInit; fromUserId: string }) => {
      webRTC.handleAnswer(data.answer, data.fromUserId);
    });

    socket.on('ice-candidate', (data: { candidate: RTCIceCandidateInit; fromUserId: string }) => {
      webRTC.handleIceCandidate(data.candidate, data.fromUserId);
    });

    socket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data.message);
    });

    return () => {
      socket.off('joined-room');
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('users-list');
      socket.off('user-video-toggled');
      socket.off('user-audio-toggled');
      socket.off('user-hand-raised');
      socket.off('user-reaction');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('error');
    };
  }, [socket, roomId, currentUser, webRTC]);

  const joinRoom = useCallback(async (userName: string) => {
    if (!socket || !isConnected) return;

    try {
      socketService.joinRoom(roomId, userName);
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  }, [socket, isConnected, roomId]);

  const handleToggleVideo = useCallback(async () => {
    const newVideoState = await toggleVideo();
    if (socket && currentUser) {
      socketService.toggleVideo(roomId, newVideoState);
    }
    return newVideoState;
  }, [toggleVideo, socket, currentUser, roomId]);

  const handleToggleAudio = useCallback(async () => {
    const newAudioState = await toggleAudio();
    if (socket && currentUser) {
      socketService.toggleAudio(roomId, newAudioState);
    }
    return newAudioState;
  }, [toggleAudio, socket, currentUser, roomId]);

  const handleRaiseHand = useCallback(() => {
    if (socket && currentUser) {
      const newHandState = !currentUser.isHandRaised;
      socketService.raiseHand(roomId, newHandState);
      setCurrentUser(prev => prev ? { ...prev, isHandRaised: newHandState } : null);
    }
  }, [socket, currentUser, roomId]);

  const handleSendReaction = useCallback((emoji: string) => {
    if (socket && currentUser) {
      socketService.sendReaction(roomId, emoji);
    }
  }, [socket, currentUser, roomId]);

  const handleStartScreenShare = useCallback(async () => {
    try {
      await startScreenShare();
    } catch (error) {
      console.error('Failed to start screen share:', error);
    }
  }, [startScreenShare]);

  const handleStopScreenShare = useCallback(async () => {
    try {
      await stopScreenShare();
    } catch (error) {
      console.error('Failed to stop screen share:', error);
    }
  }, [stopScreenShare]);

  const leaveRoom = useCallback(() => {
    stopStream();
    webRTC.cleanup();
    setIsJoined(false);
    setCurrentUser(null);
    setRoom(null);
    setUsers([]);
    setReactions([]);
  }, [stopStream, webRTC]);

  return {
    // Connection state
    socket,
    isConnected,
    isJoined,

    // Room data
    room,
    users,
    currentUser,
    reactions,

    // Media state
    stream,
    cameraStream,
    screenStream,
    mediaState,
    remoteStreams: webRTC.remoteStreams,
    error,
    backgroundFilter,
    setBackgroundFilter,

    // Actions
    joinRoom,
    leaveRoom,
    toggleVideo: handleToggleVideo,
    toggleAudio: handleToggleAudio,
    raiseHand: handleRaiseHand,
    sendReaction: handleSendReaction,
    startScreenShare: handleStartScreenShare,
    stopScreenShare: handleStopScreenShare,
    getMediaStream,
  };
};