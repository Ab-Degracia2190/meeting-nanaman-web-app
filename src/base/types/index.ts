export interface User {
  id: string;
  name: string;
  isVideoOn: boolean;
  isAudioOn: boolean;
  socketId: string;
  isHandRaised?: boolean;
  lastReaction?: {
    emoji: string;
    timestamp: Date;
  };
}

export interface Room {
  id: string;
  name: string;
  users: User[];
  createdAt: Date;
  isActive: boolean;
}

export interface MediaState {
  isVideoOn: boolean;
  isAudioOn: boolean;
  isScreenSharing: boolean;
}

export interface PeerConnection {
  userId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

export interface EmojiReaction {
  id: string;
  userId: string;
  userName: string;
  emoji: string;
  timestamp: Date;
}

export interface SocketEvents {
  'join-room': (data: { roomId: string; userName: string }) => void;
  'joined-room': (data: { room: Room; user: User }) => void;
  'user-joined': (data: { user: User; room: Room }) => void;
  'user-left': (data: { userId: string; room: Room }) => void;
  'users-list': (data: { users: User[] }) => void;
  'toggle-video': (data: { roomId: string; isVideoOn: boolean }) => void;
  'toggle-audio': (data: { roomId: string; isAudioOn: boolean }) => void;
  'user-video-toggled': (data: { userId: string; isVideoOn: boolean }) => void;
  'user-audio-toggled': (data: { userId: string; isAudioOn: boolean }) => void;
  'raise-hand': (data: { roomId: string; isHandRaised: boolean }) => void;
  'user-hand-raised': (data: { userId: string; isHandRaised: boolean }) => void;
  'send-reaction': (data: { roomId: string; emoji: string }) => void;
  'user-reaction': (data: { userId: string; userName: string; emoji: string; timestamp: string }) => void;
  'offer': (data: { offer: RTCSessionDescriptionInit; fromUserId: string; targetUserId: string }) => void;
  'answer': (data: { answer: RTCSessionDescriptionInit; fromUserId: string; targetUserId: string }) => void;
  'ice-candidate': (data: { candidate: RTCIceCandidateInit; fromUserId: string; targetUserId: string }) => void;
  'error': (data: { message: string }) => void;
}