import { useState, useCallback, useRef, useEffect } from 'react';
import { socketService } from '@/base/services/socket/socket.service';
import { PeerConnection } from '@/base/types/interfaces/interfaces.types';

export const useWebRTC = () => {
  const [peerConnections, setPeerConnections] = useState<Map<string, PeerConnection>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  
  // CRITICAL: Use refs to avoid stale closures
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const isNegotiatingRef = useRef<Map<string, boolean>>(new Map());

  // Sync refs with state
  useEffect(() => {
    peerConnectionsRef.current = peerConnections;
  }, [peerConnections]);

  useEffect(() => {
    remoteStreamsRef.current = remoteStreams;
  }, [remoteStreams]);

  const createPeerConnection = useCallback((userId: string, roomId: string): RTCPeerConnection => {
    console.log(`[WebRTC] Creating peer connection for user: ${userId}`);

    // Close existing connection if any
    const existingPeer = peerConnectionsRef.current.get(userId);
    if (existingPeer) {
      console.log(`[WebRTC] Closing existing connection for ${userId}`);
      existingPeer.connection.close();
    }

    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    };

    const peerConnection = new RTCPeerConnection(configuration);

    // CRITICAL: Add tracks BEFORE setting up event handlers
    if (localStreamRef.current) {
      console.log(`[WebRTC] Adding ${localStreamRef.current.getTracks().length} local tracks to peer ${userId}`);
      localStreamRef.current.getTracks().forEach(track => {
        try {
          peerConnection.addTrack(track, localStreamRef.current!);
          console.log(`[WebRTC] Added ${track.kind} track (enabled: ${track.enabled})`);
        } catch (e) {
          console.error(`[WebRTC] Error adding track:`, e);
        }
      });
    }

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      console.log(`[WebRTC] Received track from ${userId}:`, event.track.kind, 'enabled:', event.track.enabled);
      
      if (event.streams && event.streams[0]) {
        const remoteStream = event.streams[0];
        console.log(`[WebRTC] Setting remote stream for ${userId}, tracks:`, remoteStream.getTracks().length);
        
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.set(userId, remoteStream);
          return newMap;
        });
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`[WebRTC] Sending ICE candidate to ${userId}`);
        socketService.sendIceCandidate(roomId, event.candidate, userId);
      } else {
        console.log(`[WebRTC] All ICE candidates sent to ${userId}`);
      }
    };

    // Handle connection state
    peerConnection.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state with ${userId}: ${peerConnection.connectionState}`);
      
      if (peerConnection.connectionState === 'failed') {
        console.log(`[WebRTC] Connection failed, restarting ICE for ${userId}`);
        peerConnection.restartIce();
      } else if (peerConnection.connectionState === 'disconnected') {
        console.log(`[WebRTC] Connection disconnected for ${userId}`);
      } else if (peerConnection.connectionState === 'connected') {
        console.log(`[WebRTC] Connection established with ${userId}`);
      }
    };

    // Handle ICE connection state
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE state with ${userId}: ${peerConnection.iceConnectionState}`);
    };

    // Handle signaling state
    peerConnection.onsignalingstatechange = () => {
      console.log(`[WebRTC] Signaling state with ${userId}: ${peerConnection.signalingState}`);
      
      if (peerConnection.signalingState === 'stable') {
        isNegotiatingRef.current.set(userId, false);
        
        // Process pending ICE candidates
        const pending = pendingCandidatesRef.current.get(userId);
        if (pending && pending.length > 0) {
          console.log(`[WebRTC] Processing ${pending.length} pending ICE candidates for ${userId}`);
          pending.forEach(async (candidate) => {
            try {
              await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
              console.error(`[WebRTC] Error adding pending ICE candidate:`, error);
            }
          });
          pendingCandidatesRef.current.delete(userId);
        }
      }
    };

    // CRITICAL: Handle negotiation needed
    peerConnection.onnegotiationneeded = async () => {
      if (isNegotiatingRef.current.get(userId)) {
        console.log(`[WebRTC] Negotiation already in progress for ${userId}, skipping`);
        return;
      }

      try {
        console.log(`[WebRTC] Negotiation needed for ${userId}`);
        isNegotiatingRef.current.set(userId, true);
        
        const offer = await peerConnection.createOffer();
        
        if (peerConnection.signalingState !== 'stable') {
          console.log(`[WebRTC] Signaling state changed, aborting negotiation for ${userId}`);
          return;
        }
        
        await peerConnection.setLocalDescription(offer);
        console.log(`[WebRTC] Sending offer to ${userId}`);
        socketService.sendOffer(roomId, offer, userId);
      } catch (error) {
        console.error(`[WebRTC] Error in negotiation for ${userId}:`, error);
        isNegotiatingRef.current.set(userId, false);
      }
    };

    // Store peer connection
    setPeerConnections(prev => {
      const newMap = new Map(prev);
      newMap.set(userId, { userId, connection: peerConnection });
      return newMap;
    });

    return peerConnection;
  }, []);

  const createOffer = useCallback(async (userId: string, roomId: string) => {
    try {
      console.log(`[WebRTC] Creating offer for user: ${userId}`);
      
      // Wait a bit for the remote peer to be ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const peerConnection = createPeerConnection(userId, roomId);
      
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await peerConnection.setLocalDescription(offer);
      console.log(`[WebRTC] Sending offer to ${userId}`);
      socketService.sendOffer(roomId, offer, userId);
    } catch (error) {
      console.error(`[WebRTC] Error creating offer for ${userId}:`, error);
    }
  }, [createPeerConnection]);

  const handleOffer = useCallback(async (
    offer: RTCSessionDescriptionInit,
    fromUserId: string,
    roomId: string
  ) => {
    try {
      console.log(`[WebRTC] Handling offer from ${fromUserId}`);
      
      let peerConnection = peerConnectionsRef.current.get(fromUserId)?.connection;

      // CRITICAL: Always create new connection for offers to avoid state issues
      peerConnection = createPeerConnection(fromUserId, roomId);

      if (peerConnection.signalingState !== 'stable') {
        console.log(`[WebRTC] Setting remote description to rollback for ${fromUserId}`);
        await peerConnection.setRemoteDescription({ type: 'rollback' } as RTCSessionDescriptionInit);
      }

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      console.log(`[WebRTC] Remote description set for ${fromUserId}`);
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      console.log(`[WebRTC] Sending answer to ${fromUserId}`);
      socketService.sendAnswer(roomId, answer, fromUserId);
    } catch (error) {
      console.error(`[WebRTC] Error handling offer from ${fromUserId}:`, error);
    }
  }, [createPeerConnection]);

  const handleAnswer = useCallback(async (
    answer: RTCSessionDescriptionInit,
    fromUserId: string
  ) => {
    try {
      console.log(`[WebRTC] Handling answer from ${fromUserId}`);
      
      const peerConnectionData = peerConnectionsRef.current.get(fromUserId);
      
      if (!peerConnectionData) {
        console.error(`[WebRTC] No peer connection found for ${fromUserId}`);
        return;
      }

      const { connection } = peerConnectionData;

      if (connection.signalingState === 'have-local-offer') {
        await connection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log(`[WebRTC] Answer processed for ${fromUserId}`);
      } else {
        console.log(`[WebRTC] Invalid signaling state for answer: ${connection.signalingState}`);
      }
    } catch (error) {
      console.error(`[WebRTC] Error handling answer from ${fromUserId}:`, error);
    }
  }, []);

  const handleIceCandidate = useCallback(async (
    candidate: RTCIceCandidateInit,
    fromUserId: string
  ) => {
    try {
      const peerConnectionData = peerConnectionsRef.current.get(fromUserId);
      
      if (!peerConnectionData) {
        console.log(`[WebRTC] No peer connection for ${fromUserId}, storing ICE candidate`);
        const pending = pendingCandidatesRef.current.get(fromUserId) || [];
        pending.push(candidate);
        pendingCandidatesRef.current.set(fromUserId, pending);
        return;
      }

      const { connection } = peerConnectionData;

      if (connection.remoteDescription && connection.remoteDescription.type) {
        await connection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log(`[WebRTC] ICE candidate added for ${fromUserId}`);
      } else {
        console.log(`[WebRTC] No remote description yet, storing ICE candidate for ${fromUserId}`);
        const pending = pendingCandidatesRef.current.get(fromUserId) || [];
        pending.push(candidate);
        pendingCandidatesRef.current.set(fromUserId, pending);
      }
    } catch (error) {
      console.error(`[WebRTC] Error handling ICE candidate from ${fromUserId}:`, error);
    }
  }, []);

  const setLocalStream = useCallback(async (stream: MediaStream, roomId: string) => {
    console.log(`[WebRTC] Setting local stream with ${stream.getTracks().length} tracks`);
    console.log(`[WebRTC] Tracks:`, roomId);
    localStreamRef.current = stream;

    // CRITICAL: Update all existing peer connections
    for (const [userId, peerConnectionData] of peerConnectionsRef.current) {
      const { connection } = peerConnectionData;
      
      try {
        console.log(`[WebRTC] Updating tracks for peer ${userId}`);
        
        const senders = connection.getSenders();

        // Handle video track
        const videoTrack = stream.getVideoTracks()[0];
        const videoSender = senders.find(s => s.track?.kind === 'video');

        if (videoTrack) {
          if (videoSender) {
            if (videoSender.track?.id !== videoTrack.id) {
              console.log(`[WebRTC] Replacing video track for ${userId}`);
              await videoSender.replaceTrack(videoTrack);
            }
          } else {
            console.log(`[WebRTC] Adding video track for ${userId}`);
            connection.addTrack(videoTrack, stream);
          }
        } else if (videoSender && videoSender.track) {
          console.log(`[WebRTC] Removing video track for ${userId}`);
          await videoSender.replaceTrack(null);
        }

        // Handle audio track
        const audioTrack = stream.getAudioTracks()[0];
        const audioSender = senders.find(s => s.track?.kind === 'audio');

        if (audioTrack) {
          if (audioSender) {
            if (audioSender.track?.id !== audioTrack.id) {
              console.log(`[WebRTC] Replacing audio track for ${userId}`);
              await audioSender.replaceTrack(audioTrack);
            }
          } else {
            console.log(`[WebRTC] Adding audio track for ${userId}`);
            connection.addTrack(audioTrack, stream);
          }
        } else if (audioSender && audioSender.track) {
          console.log(`[WebRTC] Removing audio track for ${userId}`);
          await audioSender.replaceTrack(null);
        }

        // CRITICAL: Don't trigger renegotiation here - let onnegotiationneeded handle it
        
      } catch (error) {
        console.error(`[WebRTC] Error updating tracks for ${userId}:`, error);
      }
    }
  }, []);

  const removePeerConnection = useCallback((userId: string) => {
    console.log(`[WebRTC] Removing peer connection for ${userId}`);
    
    const peerConnectionData = peerConnectionsRef.current.get(userId);
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
    isNegotiatingRef.current.delete(userId);
  }, []);

  const cleanup = useCallback(() => {
    console.log(`[WebRTC] Cleaning up all peer connections`);
    
    peerConnectionsRef.current.forEach((peerConnectionData) => {
      peerConnectionData.connection.close();
    });
    
    setPeerConnections(new Map());
    setRemoteStreams(new Map());
    pendingCandidatesRef.current.clear();
    isNegotiatingRef.current.clear();
    localStreamRef.current = null;
  }, []);

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