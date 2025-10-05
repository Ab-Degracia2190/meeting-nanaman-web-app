import { Room } from '@/base/types/interfaces/interfaces.types';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_APP_URL_CHAT_SOCKET;
  }

  async createRoom(name?: string): Promise<{ roomId: string; room: Room }> {
    // FIXED: Add credentials to fetch
    const response = await fetch(`${this.baseUrl}/api/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_APP_API_KEY,
      },
      credentials: 'include', // CRITICAL: Send session cookies
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
        credentials: 'include', // FIXED: Add credentials
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
        credentials: 'include', // FIXED: Add credentials
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