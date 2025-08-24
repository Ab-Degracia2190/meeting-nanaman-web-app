import { io, Socket } from 'socket.io-client';
import { Room } from '../types';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(import.meta.env.VITE_APP_URL_CHAT_SOCKET, {
        extraHeaders: {
          'x-api-key': import.meta.env.VITE_APP_API_KEY,
        },
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
      this.socket.emit('join-room', { roomId, userName });
    }
  }

  toggleVideo(roomId: string, isVideoOn: boolean): void {
    if (this.socket) {
      this.socket.emit('toggle-video', { roomId, isVideoOn });
    }
  }

  toggleAudio(roomId: string, isAudioOn: boolean): void {
    if (this.socket) {
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

// API Service
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_APP_URL_CHAT_SOCKET;
  }

  async createRoom(name?: string): Promise<{ roomId: string; room: Room }> {
    const response = await fetch(`${this.baseUrl}/api/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_APP_API_KEY,
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      throw new Error('Failed to create room');
    }

    return response.json();
  }

  async checkRoomExists(roomId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rooms/${roomId}/exists`, {
        headers: {
          'x-api-key': import.meta.env.VITE_APP_API_KEY,
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.exists;
    } catch {
      return false;
    }
  }

  async getRoomInfo(roomId: string): Promise<Room | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/rooms/${roomId}`, {
        headers: {
          'x-api-key': import.meta.env.VITE_APP_API_KEY,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.room;
    } catch {
      return null;
    }
  }
}

export const apiService = new ApiService();