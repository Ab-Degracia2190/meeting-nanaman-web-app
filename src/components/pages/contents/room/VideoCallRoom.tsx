import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoPlayer from '@/components/pages/contents/layouts/VideoPlayer';
import MeetingControls from '@/components/pages/contents/layouts/MeetingControls';
import ParticipantsPanel from '@/components/pages/contents/layouts/ParticipantsPanel';
import ChatPanel, { ChatMessage } from '@/components/pages/contents/layouts/ChatPanel';
import BackgroundFilters from '@/components/pages/contents/layouts/BackgroundFilters';
import EmojiReactionPanel from '@/components/pages/contents/layouts/EmojiReactionPanel';
import AnimatedBackground from '@/components/partials/background/Animated';
import ThemeToggle from '@/components/partials/buttons/ThemeToggle';
import { useVideoCall } from '@/base/hooks';
import { useTheme } from '@/base/hooks/useTheme';
import { apiService } from '@/base/services';
import TextInput from '@/components/partials/inputs/Text';
import PrimaryButton from '@/components/partials/buttons/Primary';
import { v4 as uuidv4 } from 'uuid';

const VideoCallRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [userName, setUserName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showBackgroundFilters, setShowBackgroundFilters] = useState(false);
  const [showEmojiReactions, setShowEmojiReactions] = useState(false);
  const [roomExists, setRoomExists] = useState<boolean | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [backgroundFilter, setBackgroundFilter] = useState('none');

  const videoCall = useVideoCall(roomId || '');

  // Helper function to get responsive grid classes
  const getResponsiveGridClasses = (totalParticipants: number) => {
    if (totalParticipants === 1) {
      return 'grid-cols-1';
    }
    
    if (totalParticipants === 2) {
      return 'grid-cols-1 sm:grid-cols-2';
    }
    
    if (totalParticipants <= 4) {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 lg:grid-rows-2';
    }
    
    if (totalParticipants <= 6) {
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 lg:grid-rows-2';
    }
    
    if (totalParticipants <= 9) {
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 xl:grid-rows-3';
    }
    
    // For more than 9 participants
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4';
  };

  // Helper function to get individual video container classes
  const getVideoContainerClasses = (totalParticipants: number) => {
    const baseClasses = 'w-full rounded-lg overflow-hidden';
    
    if (totalParticipants === 1) {
      return `${baseClasses} aspect-video h-full max-h-[70vh]`;
    }
    
    if (totalParticipants === 2) {
      return `${baseClasses} aspect-video h-auto min-h-[200px] sm:min-h-[300px] lg:min-h-[400px]`;
    }
    
    if (totalParticipants <= 4) {
      return `${baseClasses} aspect-video h-auto min-h-[150px] sm:min-h-[200px] lg:min-h-[250px]`;
    }
    
    if (totalParticipants <= 6) {
      return `${baseClasses} aspect-video h-auto min-h-[120px] sm:min-h-[150px] lg:min-h-[200px]`;
    }
    
    // For more participants, use smaller containers
    return `${baseClasses} aspect-video h-auto min-h-[100px] sm:min-h-[120px] lg:min-h-[150px]`;
  };

  // Check if room exists
  useEffect(() => {
    const checkRoom = async () => {
      if (!roomId) {
        navigate('/not-found');
        return;
      }

      try {
        const exists = await apiService.checkRoomExists(roomId);
        setRoomExists(exists);
        if (!exists) {
          navigate('/not-found');
        }
      } catch (error) {
        console.error('Error checking room:', error);
        navigate('/not-found');
      }
    };

    checkRoom();
  }, [roomId, navigate]);

  // Request camera and microphone permissions on mount
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await videoCall.getMediaStream(true, true);
        setPermissionGranted(true);
      } catch (error) {
        console.error('Failed to get media permissions:', error);
        setPermissionGranted(false);
      }
    };

    requestPermissions();
  }, []);

  // Socket event handlers for chat
  useEffect(() => {
    if (!videoCall.socket) return;

    videoCall.socket.on('chat-message', (data: {
      id: string;
      userId: string;
      userName: string;
      message: string;
      timestamp: string;
    }) => {
      const newMessage: ChatMessage = {
        ...data,
        timestamp: new Date(data.timestamp)
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Increment unread messages if chat is closed
      if (!showChat) {
        setUnreadMessages(prev => prev + 1);
      }
    });

    return () => {
      videoCall.socket?.off('chat-message');
    };
  }, [videoCall.socket, showChat]);

  // Reset unread messages when chat is opened
  useEffect(() => {
    if (showChat) {
      setUnreadMessages(0);
    }
  }, [showChat]);

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !roomId || !permissionGranted) return;

    setIsJoining(true);
    try {
      await videoCall.joinRoom(userName.trim());
      setShowJoinForm(false);
    } catch (error) {
      console.error('Failed to join room:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveCall = () => {
    videoCall.leaveRoom();
    navigate('/');
  };

  const toggleParticipants = () => {
    setShowParticipants(!showParticipants);
    // Close other panels
    setShowChat(false);
    setShowBackgroundFilters(false);
    setShowEmojiReactions(false);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    // Close other panels
    setShowParticipants(false);
    setShowBackgroundFilters(false);
    setShowEmojiReactions(false);
    // Reset unread messages
    if (!showChat) {
      setUnreadMessages(0);
    }
  };

  const toggleBackgroundFilters = () => {
    setShowBackgroundFilters(!showBackgroundFilters);
    // Close other panels
    setShowParticipants(false);
    setShowChat(false);
    setShowEmojiReactions(false);
  };

  const toggleEmojiReactions = () => {
    setShowEmojiReactions(!showEmojiReactions);
    // Close other panels
    setShowParticipants(false);
    setShowChat(false);
    setShowBackgroundFilters(false);
  };

  const handleSendMessage = (message: string) => {
    if (videoCall.socket && videoCall.currentUser) {
      const messageData = {
        id: uuidv4(),
        roomId: roomId!,
        userId: videoCall.currentUser.id,
        userName: videoCall.currentUser.name,
        message,
        timestamp: new Date().toISOString()
      };

      videoCall.socket.emit('chat-message', messageData);
      
      // Add message locally immediately
      setMessages(prev => [...prev, {
        ...messageData,
        timestamp: new Date(messageData.timestamp)
      }]);
    }
  };

  const handleSelectBackground = (background: string) => {
    setBackgroundFilter(background);
  };

  const handleSendReaction = (emoji: string) => {
    videoCall.sendReaction(emoji);
  };

  // Show loading while checking room existence
  if (roomExists === null) {
    return (
      <div className="min-h-screen relative bg-white dark:bg-gray-900 transition-colors">
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <svg className="w-10 h-10 animate-spin mx-auto mb-4" viewBox="0 0 40 40" height="40" width="40">
              <circle className="track" cx="20" cy="20" r="17.5" pathLength="100" strokeWidth="5" fill="none"
                  style={{ stroke: isDark ? "white" : "black", opacity: 0.1 }} />
              <circle className="car" cx="20" cy="20" r="17.5" pathLength="100" strokeWidth="5" fill="none"
                  style={{
                      stroke: isDark ? "white" : "black",
                      strokeDasharray: "25, 75",
                      strokeDashoffset: 0,
                      strokeLinecap: "round"
                  }} />
            </svg>
            <p className="text-black dark:text-white font-medium">Checking meeting room...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show join form
  if (showJoinForm) {
    return (
      <div className="min-h-screen relative bg-white dark:bg-gray-900 transition-colors">
        <AnimatedBackground />
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden">
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="w-full h-12 bg-gradient-to-r from-rose-400 to-orange-300 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-sm md:text-lg font-semibold">MEETING NANAMAN SHET!</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Salihan ang mga tanga
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                    Enter your name para tanga kana din
                  </p>
                  {!permissionGranted && (
                    <p className="text-red-600 dark:text-red-400 text-[10px] md:text-xs mt-2">
                      Allow mo camera tas microphone bobo
                    </p>
                  )}
                </div>

                <form onSubmit={handleJoinRoom} className="space-y-2">
                  <TextInput
                    label="Username"
                    placeholder="Enter your name here..."
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    disabled={isJoining || !permissionGranted}
                  />

                  <PrimaryButton
                    type="submit"
                    className='text-xs md:text-sm'
                    disabled={isJoining || !userName.trim() || !permissionGranted}
                    loading={isJoining}
                  >
                    {isJoining ? 'Joining...' : 'Join Now'}
                  </PrimaryButton>
                </form>

                {videoCall.error && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-700 dark:text-red-400 text-[10px] md:text-xs">{videoCall.error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total participants
  const totalParticipants = videoCall.users.length;
  const gridClasses = getResponsiveGridClasses(totalParticipants);
  const videoContainerClasses = getVideoContainerClasses(totalParticipants);

  // Show video call interface
  return (
    <div className="min-h-screen relative bg-white dark:bg-gray-900 transition-colors">
      <AnimatedBackground />
      
      {/* Main video grid - Improved responsive layout */}
      <div className="relative z-10 min-h-screen p-2 sm:p-4">
        <div className="h-full max-h-screen overflow-auto">
          {/* Video grid container */}
          <div className={`
            grid gap-2 sm:gap-4 
            ${gridClasses}
            items-center justify-items-center
            min-h-full
            ${totalParticipants === 1 ? 'place-content-center' : 'place-content-start'}
          `}>
            {/* Local video */}
            {videoCall.currentUser && (
              <div className={videoContainerClasses}>
                <VideoPlayer
                  stream={videoCall.stream}
                  user={videoCall.currentUser}
                  isLocal={true}
                  backgroundFilter={backgroundFilter}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Remote videos */}
            {videoCall.users
              .filter(user => user.id !== videoCall.currentUser?.id)
              .map((user) => {
                const remoteStream = videoCall.remoteStreams.get(user.socketId);
                return (
                  <div key={user.id} className={videoContainerClasses}>
                    <VideoPlayer
                      stream={remoteStream}
                      user={user}
                      isLocal={false}
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Meeting header info - Mobile responsive */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-black/50 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg backdrop-blur-sm z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-none">
            {videoCall.room?.name || 'Meeting Room'}
          </span>
        </div>
      </div>

      {/* Theme toggle in meeting */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Floating Reactions */}
      <div className="fixed top-20 left-4 right-4 pointer-events-none z-30">
        {videoCall.reactions.map((reaction) => (
          <div
            key={reaction.id}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 80}%`,
              animationDuration: '3s',
              animationFillMode: 'forwards'
            }}
          >
            <div className="text-4xl">{reaction.emoji}</div>
          </div>
        ))}
      </div>

      {/* Meeting controls */}
      {videoCall.isJoined && videoCall.currentUser && (
        <MeetingControls
          mediaState={videoCall.mediaState}
          participantCount={videoCall.users.length}
          roomId={roomId || ''}
          isHandRaised={videoCall.currentUser.isHandRaised}
          onToggleVideo={videoCall.toggleVideo}
          onToggleAudio={videoCall.toggleAudio}
          onStartScreenShare={videoCall.startScreenShare}
          onStopScreenShare={videoCall.stopScreenShare}
          onRaiseHand={videoCall.raiseHand}
          onShowReactions={toggleEmojiReactions}
          onLeaveCall={handleLeaveCall}
          onToggleParticipants={toggleParticipants}
          onToggleChat={toggleChat}
          onToggleBackgroundFilters={toggleBackgroundFilters}
          unreadMessages={unreadMessages}
        />
      )}

      {/* Participants panel */}
      <ParticipantsPanel
        users={videoCall.users}
        currentUser={videoCall.currentUser}
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
      />

      {/* Chat panel */}
      <ChatPanel
        users={videoCall.users}
        currentUser={videoCall.currentUser}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        onSendMessage={handleSendMessage}
        messages={messages}
      />

      {/* Background filters */}
      <BackgroundFilters
        isOpen={showBackgroundFilters}
        onClose={() => setShowBackgroundFilters(false)}
        onSelectBackground={handleSelectBackground}
        currentBackground={backgroundFilter}
      />

      {/* Emoji Reactions */}
      <EmojiReactionPanel
        isOpen={showEmojiReactions}
        onClose={() => setShowEmojiReactions(false)}
        onSelectEmoji={handleSendReaction}
      />
    </div>
  );
};

export default VideoCallRoom;