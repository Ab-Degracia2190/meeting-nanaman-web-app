import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/pages/contents/home/auth/provider';
import VideoPlayer from '@/components/pages/contents/home/layouts/meetings/controls-panel/video-player';
import MeetingControls from '@/components/pages/contents/home/layouts/meetings/controls-panel/meeting-controls';
import ParticipantsPanel from '@/components/pages/contents/home/layouts/meetings/controls-panel/participants';
import ChatPanel, { ChatMessage } from '@/components/pages/contents/home/layouts/meetings/controls-panel/chat';
import BackgroundFilters from '@/components/pages/contents/home/layouts/meetings/controls-panel/background-filter';
import EmojiReactionPanel from '@/components/pages/contents/home/layouts/meetings/controls-panel/emoji-reaction';
import AnimatedBackground from '@/components/partials/background/Animated';
import ThemeToggle from '@/components/partials/buttons/ThemeToggle';
import PrimaryButton from '@/components/partials/buttons/Primary';
import { useVideoCall } from '@/base/hooks';
import { apiService } from '@/base/services';
import { v4 as uuidv4 } from 'uuid';

const VideoCallRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, signIn, isLoading } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
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
  
  // CRITICAL: Track if we've already joined to prevent duplicate joins
  const hasJoinedRef = useRef(false);
  const isRequestingMediaRef = useRef(false);

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
    
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4';
  };

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

  // CRITICAL: Request permissions only once when authenticated
  useEffect(() => {
    const requestPermissions = async () => {
      if (!isAuthenticated || isRequestingMediaRef.current || permissionGranted) {
        return;
      }

      isRequestingMediaRef.current = true;
      console.log('[Meeting] Requesting media permissions...');

      try {
        await videoCall.getMediaStream(true, true);
        console.log('[Meeting] Media permissions granted');
        setPermissionGranted(true);
      } catch (error) {
        console.error('[Meeting] Failed to get media permissions:', error);
        setPermissionGranted(false);
      } finally {
        isRequestingMediaRef.current = false;
      }
    };

    requestPermissions();
  }, [isAuthenticated, videoCall, permissionGranted]);

  // CRITICAL: Auto-join room only once when all conditions are met
  useEffect(() => {
    const autoJoin = async () => {
      if (
        !isAuthenticated || 
        !user || 
        !permissionGranted || 
        !roomExists || 
        videoCall.isJoined ||
        hasJoinedRef.current
      ) {
        return;
      }

      hasJoinedRef.current = true;
      setIsJoining(true);
      console.log('[Meeting] Auto-joining room as:', user.name);

      try {
        // CRITICAL: Small delay to ensure media stream is fully ready
        await new Promise(resolve => setTimeout(resolve, 500));
        await videoCall.joinRoom(user.name);
        console.log('[Meeting] Successfully joined room');
      } catch (error) {
        console.error('[Meeting] Failed to join room:', error);
        hasJoinedRef.current = false;
      } finally {
        setIsJoining(false);
      }
    };

    autoJoin();
  }, [isAuthenticated, user, permissionGranted, roomExists, videoCall.isJoined]);

  // Socket event handlers for chat
  useEffect(() => {
    if (!videoCall.socket) return;

    const handleChatMessage = (data: {
      id: string;
      userId: string;
      userName: string;
      message: string;
      timestamp: string;
    }) => {
      console.log('[Meeting] Received chat message:', data);
      const newMessage: ChatMessage = {
        ...data,
        timestamp: new Date(data.timestamp)
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      if (!showChat) {
        setUnreadMessages(prev => prev + 1);
      }
    };

    videoCall.socket.on('chat-message', handleChatMessage);

    return () => {
      videoCall.socket?.off('chat-message', handleChatMessage);
    };
  }, [videoCall.socket, showChat]);

  // Reset unread messages when chat is opened
  useEffect(() => {
    if (showChat) {
      setUnreadMessages(0);
    }
  }, [showChat]);

  const handleLeaveCall = () => {
    console.log('[Meeting] Leaving call');
    hasJoinedRef.current = false;
    videoCall.leaveRoom();
    navigate('/');
  };

  const toggleParticipants = () => {
    setShowParticipants(!showParticipants);
    setShowChat(false);
    setShowBackgroundFilters(false);
    setShowEmojiReactions(false);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    setShowParticipants(false);
    setShowBackgroundFilters(false);
    setShowEmojiReactions(false);
    if (!showChat) {
      setUnreadMessages(0);
    }
  };

  const toggleBackgroundFilters = () => {
    setShowBackgroundFilters(!showBackgroundFilters);
    setShowParticipants(false);
    setShowChat(false);
    setShowEmojiReactions(false);
  };

  const toggleEmojiReactions = () => {
    setShowEmojiReactions(!showEmojiReactions);
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

      console.log('[Meeting] Sending chat message:', messageData);
      videoCall.socket.emit('chat-message', messageData);
      
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

  // Show loading while checking authentication and room existence
  if (isLoading || roomExists === null) {
    return (
      <div className="min-h-screen relative bg-white dark:bg-gray-900 transition-colors">
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-rose-200 dark:border-rose-800 border-t-rose-600 dark:border-t-rose-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-black dark:text-white font-medium">
              {isLoading ? 'Checking authentication...' : 'Checking meeting room...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show sign in requirement
  if (!isAuthenticated) {
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
                    Sign In Required
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                    You need to sign in with Google to join this meeting
                  </p>
                </div>

                <PrimaryButton
                  onClick={() => signIn(roomId)}
                  className="text-xs md:text-sm mb-4"
                >
                  Sign In with Google
                </PrimaryButton>

                <button
                  onClick={() => navigate('/')}
                  className="w-full text-xs md:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show joining state
  if (isJoining || !permissionGranted || !videoCall.isJoined) {
    return (
      <div className="min-h-screen relative bg-white dark:bg-gray-900 transition-colors">
        <AnimatedBackground />
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-rose-200 dark:border-rose-800 border-t-rose-600 dark:border-t-rose-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-black dark:text-white font-medium">
              {!permissionGranted ? 'Requesting camera and microphone access...' : 'Joining meeting...'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {!permissionGranted ? 'Please allow access to continue' : 'Please wait...'}
            </p>
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
      
      {/* Main video grid */}
      <div className="relative z-10 min-h-screen p-2 sm:p-4">
        <div className="h-full max-h-screen overflow-auto">
          <div className={`
            grid gap-2 sm:gap-4 
            ${gridClasses}
            items-center justify-items-center
            min-h-full
            ${totalParticipants === 1 ? 'place-content-center' : 'place-content-start'}
          `}>
            {/* Local video */}
            {videoCall.currentUser && (
              <div className={videoContainerClasses} key={`local-${videoCall.currentUser.id}`}>
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
                  <div key={`remote-${user.id}`} className={videoContainerClasses}>
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

      {/* Meeting header */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-black/50 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg backdrop-blur-sm z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs sm:text-sm font-medium truncate max-w-[150px] sm:max-w-none">
            {videoCall.room?.name || 'Meeting Room'}
          </span>
        </div>
      </div>

      {/* User info */}
      <div className="absolute top-2 sm:top-4 right-16 sm:right-20 bg-black/50 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg backdrop-blur-sm z-20">
        <div className="flex items-center gap-2">
          <img 
            src={user?.picture} 
            alt={user?.name}
            className="w-6 h-6 rounded-full"
          />
          <span className="text-xs sm:text-sm font-medium hidden sm:block">
            {user?.name}
          </span>
        </div>
      </div>

      {/* Theme toggle */}
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

      {/* Panels */}
      <ParticipantsPanel
        users={videoCall.users}
        currentUser={videoCall.currentUser}
        isOpen={showParticipants}
        onClose={() => setShowParticipants(false)}
      />

      <ChatPanel
        users={videoCall.users}
        currentUser={videoCall.currentUser}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        onSendMessage={handleSendMessage}
        messages={messages}
      />

      <BackgroundFilters
        isOpen={showBackgroundFilters}
        onClose={() => setShowBackgroundFilters(false)}
        onSelectBackground={handleSelectBackground}
        currentBackground={backgroundFilter}
      />

      <EmojiReactionPanel
        isOpen={showEmojiReactions}
        onClose={() => setShowEmojiReactions(false)}
        onSelectEmoji={handleSendReaction}
      />
    </div>
  );
};

export default VideoCallRoom;