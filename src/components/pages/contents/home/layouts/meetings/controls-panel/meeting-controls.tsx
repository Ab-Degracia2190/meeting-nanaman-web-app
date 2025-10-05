import { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Users, 
  MoreHorizontal,
  Copy,
  Check,
  MessageCircle,
  Image,
  Monitor,
  MonitorOff,
  Hand,
  Smile
} from 'lucide-react';
import { MediaState } from '@/base/types';

interface MeetingControlsProps {
  mediaState: MediaState;
  participantCount: number;
  roomId: string;
  isHandRaised?: boolean;
  onToggleVideo: () => void;
  onToggleAudio: () => void;
  onStartScreenShare: () => void;
  onStopScreenShare: () => void;
  onRaiseHand: () => void;
  onShowReactions: () => void;
  onLeaveCall: () => void;
  onToggleParticipants?: () => void;
  onToggleChat?: () => void;
  onToggleBackgroundFilters?: () => void;
  unreadMessages?: number;
}

const MeetingControls: React.FC<MeetingControlsProps> = ({
  mediaState,
  participantCount,
  roomId,
  isHandRaised = false,
  onToggleVideo,
  onToggleAudio,
  onStartScreenShare,
  onStopScreenShare,
  onRaiseHand,
  onShowReactions,
  onLeaveCall,
  onToggleParticipants,
  onToggleChat,
  onToggleBackgroundFilters,
  unreadMessages = 0,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const copyMeetingLink = async () => {
    try {
      const meetingLink = `${window.location.origin}/room/${roomId}`;
      await navigator.clipboard.writeText(meetingLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleScreenShare = () => {
    if (mediaState.isScreenSharing) {
      onStopScreenShare();
    } else {
      onStartScreenShare();
    }
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm sm:max-w-none sm:w-auto px-4 sm:px-0">
      <div className="bg-gradient-to-r from-rose-400/90 via-orange-300/90 to-amber-200/90 dark:from-gray-800/90 dark:via-gray-700/90 dark:to-gray-600/90 backdrop-blur-md rounded-full px-3 sm:px-6 py-2 sm:py-3 shadow-lg border border-white/20 dark:border-gray-600/20">
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          {/* Primary Controls - Always visible */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Microphone Control */}
            <button
              onClick={onToggleAudio}
              className={`p-2 sm:p-3 rounded-full transition-all duration-200 cursor-pointer ${
                mediaState.isAudioOn
                  ? 'bg-white/20 hover:bg-white/30 text-white dark:bg-gray-600/50 dark:hover:bg-gray-500/50'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={mediaState.isAudioOn ? 'Mute microphone' : 'Unmute microphone'}
            >
              {mediaState.isAudioOn ? (
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            {/* Camera Control */}
            <button
              onClick={onToggleVideo}
              className={`p-2 sm:p-3 rounded-full transition-all duration-200 cursor-pointer ${
                mediaState.isVideoOn
                  ? 'bg-white/20 hover:bg-white/30 text-white dark:bg-gray-600/50 dark:hover:bg-gray-500/50'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
              title={mediaState.isVideoOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {mediaState.isVideoOn ? (
                <Video className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            {/* Screen Share */}
            <button
              onClick={handleScreenShare}
              className={`p-2 sm:p-3 rounded-full transition-all duration-200 cursor-pointer ${
                mediaState.isScreenSharing
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white dark:bg-gray-600/50 dark:hover:bg-gray-500/50'
              }`}
              title={mediaState.isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
            >
              {mediaState.isScreenSharing ? (
                <MonitorOff className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>

            {/* Raise Hand */}
            <button
              onClick={onRaiseHand}
              className={`p-2 sm:p-3 rounded-full transition-all duration-200 cursor-pointer ${
                isHandRaised
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white dark:bg-gray-600/50 dark:hover:bg-gray-500/50'
              }`}
              title={isHandRaised ? 'Lower hand' : 'Raise hand'}
            >
              <Hand className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Emoji Reactions */}
            <button
              onClick={onShowReactions}
              className="p-2 sm:p-3 rounded-full bg-white/20 hover:bg-white/30 text-white dark:bg-gray-600/50 dark:hover:bg-gray-500/50 transition-all duration-200 cursor-pointer"
              title="Send reaction"
            >
              <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Leave Call */}
            <button
              onClick={onLeaveCall}
              className="p-2 sm:p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 cursor-pointer"
              title="Leave call"
            >
              <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Secondary Controls - Hidden on very small screens, shown on larger screens */}
          <div className="hidden xs:flex items-center gap-2 sm:gap-3">
            {/* Chat - Only on larger screens */}
            {onToggleChat && (
              <button
                onClick={onToggleChat}
                className="hidden sm:flex p-2 sm:p-3 rounded-full bg-white/20 hover:bg-white/30 text-white dark:bg-gray-600/50 dark:hover:bg-gray-500/50 transition-all duration-200 cursor-pointer relative"
                title="Toggle chat"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </button>
            )}

            {/* Participants - Only on larger screens */}
            {onToggleParticipants && (
              <button
                onClick={onToggleParticipants}
                className="hidden sm:flex p-2 sm:p-3 rounded-full bg-white/20 hover:bg-white/30 text-white dark:bg-gray-600/50 dark:hover:bg-gray-500/50 transition-all duration-200 cursor-pointer relative"
                title="Show participants"
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                {participantCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                    {participantCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* More Options - Always visible */}
          <div className="relative">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 sm:p-3 rounded-full bg-white/20 hover:bg-white/30 text-white dark:bg-gray-600/50 dark:hover:bg-gray-500/50 transition-all duration-200 cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {showMoreMenu && (
              <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2 min-w-56 max-w-xs">
                {/* Mobile-only controls in menu */}
                <div className="xs:hidden">
                  {onToggleChat && (
                    <button
                      onClick={() => {
                        onToggleChat();
                        setShowMoreMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-sm cursor-pointer text-gray-900 dark:text-white"
                    >
                      <MessageCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      Chat
                      {unreadMessages > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-auto">
                          {unreadMessages > 9 ? '9+' : unreadMessages}
                        </span>
                      )}
                    </button>
                  )}

                  {onToggleParticipants && (
                    <button
                      onClick={() => {
                        onToggleParticipants();
                        setShowMoreMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-sm cursor-pointer text-gray-900 dark:text-white"
                    >
                      <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      Participants
                      {participantCount > 0 && (
                        <span className="bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-auto">
                          {participantCount}
                        </span>
                      )}
                    </button>
                  )}

                  {(onToggleChat || onToggleParticipants) && (
                    <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
                  )}
                </div>

                <button
                  onClick={copyMeetingLink}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-sm cursor-pointer text-gray-900 dark:text-white"
                >
                  {linkCopied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                  {linkCopied ? 'Copied!' : 'Copy Link'}
                </button>
                
                {onToggleBackgroundFilters && (
                  <button
                    onClick={() => {
                      onToggleBackgroundFilters();
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-sm cursor-pointer text-gray-900 dark:text-white"
                  >
                    <Image className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    Effects
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setShowMoreMenu(false)}
        />
      )}
    </div>
  );
};

export default MeetingControls;