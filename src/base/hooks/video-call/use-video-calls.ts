import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/base/hooks/socket/use-socket';
import { useMediaStream } from '@/base/hooks/media-stream/use-media-stream';
import { useWebRTC } from '@/base/hooks/web-rtc/use-web-rtc';
import { socketService } from '@/base/services/socket/socket.service';
import { Room, User, EmojiReaction } from '@/base/types/interfaces/interfaces.types';

export const useVideoCall = (roomId: string) => {
  const { socket, isConnected } = useSocket();
  const { stream, cameraStream, screenStream, mediaState, error, backgroundFilter, setBackgroundFilter, getMediaStream, toggleVideo, toggleAudio, startScreenShare, stopScreenShare, stopStream } = useMediaStream();
  const webRTC = useWebRTC();

  const [room, setRoom] = useState<Room | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [reactions, setReactions] = useState<EmojiReaction[]>([]);

  // CRITICAL: Track what we've sent to server to prevent loops
  const lastSentVideoState = useRef<boolean | null>(null);
  const lastSentAudioState = useRef<boolean | null>(null);
  const isUpdatingFromServerRef = useRef(false);

  // Set local stream for WebRTC when stream changes
  useEffect(() => {
    if (stream && isJoined) {
      console.log('Setting local stream for WebRTC');
      webRTC.setLocalStream(stream, roomId);
    }
  }, [stream, webRTC, roomId, isJoined]);

  // CRITICAL: Only sync when local state changes AND it's different from what we sent
  useEffect(() => {
    if (!socket || !currentUser || !isJoined || isUpdatingFromServerRef.current) return;

    const videoChanged = mediaState.isVideoOn !== lastSentVideoState.current;
    const audioChanged = mediaState.isAudioOn !== lastSentAudioState.current;

    if (videoChanged) {
      console.log(`[VideoCall] Syncing video state to server: ${mediaState.isVideoOn}`);
      lastSentVideoState.current = mediaState.isVideoOn;
      socketService.toggleVideo(roomId, mediaState.isVideoOn);
    }

    if (audioChanged) {
      console.log(`[VideoCall] Syncing audio state to server: ${mediaState.isAudioOn}`);
      lastSentAudioState.current = mediaState.isAudioOn;
      socketService.toggleAudio(roomId, mediaState.isAudioOn);
    }
  }, [mediaState.isVideoOn, mediaState.isAudioOn, socket, currentUser, roomId, isJoined]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    socket.on('joined-room', (data: { room: Room; user: User }) => {
      console.log('[VideoCall] Joined room:', data);
      setRoom(data.room);
      setCurrentUser(data.user);
      setUsers(data.room.users);
      setIsJoined(true);
      
      // Initialize refs with current state
      lastSentVideoState.current = data.user.isVideoOn;
      lastSentAudioState.current = data.user.isAudioOn;
    });

    socket.on('user-joined', (data: { user: User; room: Room }) => {
      console.log('[VideoCall] User joined:', data.user.name);
      setRoom(data.room);
      setUsers(data.room.users);

      // Create offer for new user
      if (currentUser && data.user.socketId !== socket.id) {
        setTimeout(() => {
          console.log('[VideoCall] Creating offer for new user:', data.user.socketId);
          webRTC.createOffer(data.user.socketId, roomId);
        }, 1000);
      }
    });

    socket.on('user-left', (data: { userId: string; room: Room }) => {
      console.log('[VideoCall] User left:', data.userId);
      setRoom(data.room);
      setUsers(data.room.users);
      webRTC.removePeerConnection(data.userId);
    });

    socket.on('users-list', (data: { users: User[] }) => {
      console.log('[VideoCall] Users list updated:', data.users.length);
      setUsers(data.users);
    });

    socket.on('user-video-toggled', (data: { userId: string; isVideoOn: boolean }) => {
      console.log(`[VideoCall] User ${data.userId} video toggled to:`, data.isVideoOn);
      
      // CRITICAL: Mark that we're updating from server
      isUpdatingFromServerRef.current = true;
      
      setUsers(prev => prev.map(user =>
        user.id === data.userId ? { ...user, isVideoOn: data.isVideoOn } : user
      ));
      
      // Also update current user if it's them (in case of echo from server)
      setCurrentUser(prev => 
        prev && prev.id === data.userId ? { ...prev, isVideoOn: data.isVideoOn } : prev
      );
      
      // Release lock after state updates
      setTimeout(() => {
        isUpdatingFromServerRef.current = false;
      }, 50);
    });

    socket.on('user-audio-toggled', (data: { userId: string; isAudioOn: boolean }) => {
      console.log(`[VideoCall] User ${data.userId} audio toggled to:`, data.isAudioOn);
      
      // CRITICAL: Mark that we're updating from server
      isUpdatingFromServerRef.current = true;
      
      setUsers(prev => prev.map(user =>
        user.id === data.userId ? { ...user, isAudioOn: data.isAudioOn } : user
      ));
      
      // Also update current user if it's them (in case of echo from server)
      setCurrentUser(prev => 
        prev && prev.id === data.userId ? { ...prev, isAudioOn: data.isAudioOn } : prev
      );
      
      // Release lock after state updates
      setTimeout(() => {
        isUpdatingFromServerRef.current = false;
      }, 50);
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
      
      setUsers(prev => prev.map(user =>
        user.id === data.userId ? { 
          ...user, 
          lastReaction: { 
            emoji: data.emoji, 
            timestamp: new Date(data.timestamp) 
          } 
        } : user
      ));

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
      console.log('[VideoCall] Received offer from:', data.fromUserId);
      webRTC.handleOffer(data.offer, data.fromUserId, roomId);
    });

    socket.on('answer', (data: { answer: RTCSessionDescriptionInit; fromUserId: string }) => {
      console.log('[VideoCall] Received answer from:', data.fromUserId);
      webRTC.handleAnswer(data.answer, data.fromUserId);
    });

    socket.on('ice-candidate', (data: { candidate: RTCIceCandidateInit; fromUserId: string }) => {
      webRTC.handleIceCandidate(data.candidate, data.fromUserId);
    });

    socket.on('error', (data: { message: string }) => {
      console.error('[VideoCall] Socket error:', data.message);
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
      console.log('[VideoCall] Joining room:', roomId, 'as', userName);
      socketService.joinRoom(roomId, userName);
    } catch (error) {
      console.error('[VideoCall] Failed to join room:', error);
    }
  }, [socket, isConnected, roomId]);

  const handleToggleVideo = useCallback(async () => {
    console.log('[VideoCall] handleToggleVideo called');
    const newVideoState = await toggleVideo();
    console.log('[VideoCall] New video state:', newVideoState);
    return newVideoState;
  }, [toggleVideo]);

  const handleToggleAudio = useCallback(async () => {
    console.log('[VideoCall] handleToggleAudio called');
    const newAudioState = await toggleAudio();
    console.log('[VideoCall] New audio state:', newAudioState);
    return newAudioState;
  }, [toggleAudio]);

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
      console.error('[VideoCall] Failed to start screen share:', error);
    }
  }, [startScreenShare]);

  const handleStopScreenShare = useCallback(async () => {
    try {
      await stopScreenShare();
    } catch (error) {
      console.error('[VideoCall] Failed to stop screen share:', error);
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
    lastSentVideoState.current = null;
    lastSentAudioState.current = null;
  }, [stopStream, webRTC]);

  return {
    socket,
    isConnected,
    isJoined,
    room,
    users,
    currentUser,
    reactions,
    stream,
    cameraStream,
    screenStream,
    mediaState,
    remoteStreams: webRTC.remoteStreams,
    error,
    backgroundFilter,
    setBackgroundFilter,
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