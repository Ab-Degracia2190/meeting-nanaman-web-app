import { X, Mic, MicOff, Video, VideoOff, Crown, Hand } from 'lucide-react';
import { User } from '@/base/types';

interface ParticipantsPanelProps {
  users: User[];
  currentUser: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  users,
  currentUser,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-xl z-50 transform transition-transform duration-300 ease-in-out border-l border-white/20 dark:border-gray-700/20">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Participants ({users.length})
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Participants List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {users.map((user, index) => {
                const isCurrentUser = user.id === currentUser?.id;
                const isHost = index === 0; // First user is considered host
                
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors border border-white/20 dark:border-gray-700/20"
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-orange-300 flex items-center justify-center text-white font-medium text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        {user.isHandRaised && (
                          <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                            <Hand className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {/* Name and Status */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </span>
                          {isCurrentUser && (
                            <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100/70 dark:bg-gray-700/70 px-2 py-1 rounded">
                              You
                            </span>
                          )}
                          {isHost && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                          {user.isHandRaised && (
                            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                              Hand raised
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <div className={`w-2 h-2 rounded-full ${
                            user.isVideoOn && user.isAudioOn
                              ? 'bg-green-500'
                              : user.isVideoOn || user.isAudioOn
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`} />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {user.isVideoOn && user.isAudioOn
                              ? 'Active'
                              : user.isVideoOn || user.isAudioOn
                              ? 'Partially active'
                              : 'Inactive'
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Media Status */}
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${
                        user.isAudioOn 
                          ? 'bg-green-100/80 dark:bg-green-800/50 text-green-600 dark:text-green-400' 
                          : 'bg-red-100/80 dark:bg-red-800/50 text-red-600 dark:text-red-400'
                      }`}>
                        {user.isAudioOn ? (
                          <Mic className="w-3 h-3" />
                        ) : (
                          <MicOff className="w-3 h-3" />
                        )}
                      </div>
                      
                      <div className={`p-1.5 rounded ${
                        user.isVideoOn 
                          ? 'bg-green-100/80 dark:bg-green-800/50 text-green-600 dark:text-green-400' 
                          : 'bg-red-100/80 dark:bg-red-800/50 text-red-600 dark:text-red-400'
                      }`}>
                        {user.isVideoOn ? (
                          <Video className="w-3 h-3" />
                        ) : (
                          <VideoOff className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-rose-50/50 to-orange-50/50 dark:from-gray-700/50 dark:to-gray-600/50">
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Share the meeting link to invite others
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ParticipantsPanel;