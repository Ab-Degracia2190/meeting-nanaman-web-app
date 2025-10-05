import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      // FIXED: Add withCredentials to send cookies
      this.socket = io(import.meta.env.VITE_APP_URL_CHAT_SOCKET, {
        withCredentials: true, // CRITICAL: Send session cookies
        extraHeaders: {
          'x-api-key': import.meta.env.VITE_APP_API_KEY,
        },
        // FIXED: Add reconnection settings
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      // FIXED: Add connection error handlers
      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully:', this.socket?.id);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });
    }
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  joinRoom(roomId: string, userName: string): void {
    if (this.socket) {
      console.log('Emitting join-room:', { roomId, userName });
      this.socket.emit('join-room', { roomId, userName });
    }
  }

  toggleVideo(roomId: string, isVideoOn: boolean): void {
    if (this.socket) {
      console.log('Emitting toggle-video:', { roomId, isVideoOn });
      this.socket.emit('toggle-video', { roomId, isVideoOn });
    }
  }

  toggleAudio(roomId: string, isAudioOn: boolean): void {
    if (this.socket) {
      console.log('Emitting toggle-audio:', { roomId, isAudioOn });
      this.socket.emit('toggle-audio', { roomId, isAudioOn });
    }
  }

  raiseHand(roomId: string, isHandRaised: boolean): void {
    if (this.socket) {
      this.socket.emit('raise-hand', { roomId, isHandRaised });
    }
  }

  sendReaction(roomId: string, emoji: string): void {
    if (this.socket) {
      this.socket.emit('send-reaction', { roomId, emoji });
    }
  }

  sendOffer(roomId: string, offer: RTCSessionDescriptionInit, targetUserId: string): void {
    if (this.socket) {
      this.socket.emit('offer', { roomId, offer, targetUserId });
    }
  }

  sendAnswer(roomId: string, answer: RTCSessionDescriptionInit, targetUserId: string): void {
    if (this.socket) {
      this.socket.emit('answer', { roomId, answer, targetUserId });
    }
  }

  sendIceCandidate(roomId: string, candidate: RTCIceCandidateInit, targetUserId: string): void {
    if (this.socket) {
      this.socket.emit('ice-candidate', { roomId, candidate, targetUserId });
    }
  }
}

export const socketService = new SocketService();