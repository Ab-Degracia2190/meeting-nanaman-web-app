import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Plus, Calendar, Users, ArrowRight, Copy, Check } from 'lucide-react';
import { apiService } from '@/base/services';
import AnimatedBackground from '@/components/partials/background/Animated';
import TextInput from '@/components/partials/inputs/Text';
import PrimaryButton from '@/components/partials/buttons/Primary';
import ThemeToggle from '@/components/partials/buttons/ThemeToggle';
import NotFoundModal from '@/components/pages/errors/modals/404';

const Panel = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [recentMeeting, setRecentMeeting] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);

  const createNewMeeting = async () => {
    setIsCreating(true);
    try {
      const { roomId } = await apiService.createRoom();
      const meetingLink = `${window.location.origin}/room/${roomId}`;
      setRecentMeeting(meetingLink);
    } catch (error) {
      console.error('Failed to create meeting:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const joinMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinRoomId.trim()) return;

    setIsJoining(true);
    try {
      let roomId = joinRoomId.trim();
      const urlMatch = roomId.match(/\/room\/([^/?]+)/);
      if (urlMatch) {
        roomId = urlMatch[1];
      }

      const exists = await apiService.checkRoomExists(roomId);
      if (exists) {
        navigate(`/room/${roomId}`);
      } else {
        setShowNotFoundModal(true);
      }
    } catch (error) {
      console.error('Failed to join meeting:', error);
      setShowNotFoundModal(true);
    } finally {
      setIsJoining(false);
    }
  };

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  return (
    <div className="min-h-screen relative bg-white dark:bg-gray-900 transition-colors">
      <AnimatedBackground />
      
      <header className="relative z-10 bg-white/20 dark:bg-gray-800/20 backdrop-blur-md border-b border-white/10 dark:border-gray-700/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-rose-400 to-orange-300 rounded-lg flex items-center justify-center">
                <Video className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <h1 className="text-sm md:text-xl font-bold text-black dark:text-white">Meeting nanaman!</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-4xl font-bold text-black dark:text-white mb-2">
            Isa sa kinaiinisan mo.
          </h2>
          <h3 className="text-lg md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600 mb-4">
            Lalo na pag may ginagawa ka.
          </h3>
          <p className="text-xs md:text-xl text-black/80 dark:text-white/80 mb-8 max-w-2xl mx-auto">
            Halina't mangkupal, sumali sa meeting.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Plus className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-4">Bagong katangahan</h3>
              <p className="text-sm md:text-lg text-gray-600 dark:text-gray-300 mb-8">Simulan ang katangahan</p>
              <div className="relative group">
                <PrimaryButton
                  onClick={createNewMeeting}
                  disabled={isCreating}
                  loading={isCreating}
                  className="text-xs md:text-sm"
                >
                  Gumawa ng katangahan
                </PrimaryButton>
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 dark:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  Simulan ang katangahan
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-r from-rose-400 to-orange-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-4">Sumali sa mga tanga</h3>
              <p className="text-sm md:text-lg text-gray-600 dark:text-gray-300 mb-6">Sumali sa mga tanga gamit ang meeting ID or link</p>
              
              <form onSubmit={joinMeeting} className="space-y-2">
                <TextInput
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  placeholder="Enter meeting ID or paste link"
                  className="w-full text-xs md:text-sm"
                  disabled={isJoining}
                />
                <div className="relative group">
                  <PrimaryButton
                    type="submit"
                    disabled={isJoining || !joinRoomId.trim()}
                    loading={isJoining}
                    className="text-xs md:text-sm"
                  >
                    Sumali sa mga tanga
                  </PrimaryButton>
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 dark:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    Salihan ang meeting ng mga tanga
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>

        {recentMeeting && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20 mb-12">
            <div className="flex items-center justify-between">
              <div className="flex-1 w-full">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Oh bobo ito na meeting link mo
                </h4>
                <div className="flex items-center gap-3 w-full">
                  <code className="text-[10px] md:text-xs bg-gray-100/80 dark:bg-gray-700/80 px-3 py-2 rounded-lg font-mono text-gray-700 dark:text-gray-300 flex-1 truncate">
                    {recentMeeting}
                  </code>

                  <div className="relative group">
                    <PrimaryButton
                      onClick={() => copyLink(recentMeeting)}
                      className="!w-auto !px-3 !py-2 flex items-center justify-center bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                    >
                      {linkCopied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </PrimaryButton>
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 dark:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Copy meeting link
                    </span>
                  </div>

                  <div className="relative group">
                    <PrimaryButton
                      onClick={() =>
                        navigate(recentMeeting.split(window.location.origin)[1])
                      }
                      className="!w-auto !px-3 !py-2 flex items-center justify-center"
                    >
                      <ArrowRight className="w-4 h-4 text-white" />
                    </PrimaryButton>
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 dark:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      Join this meeting
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <NotFoundModal
          isOpen={showNotFoundModal}
          onClose={() => setShowNotFoundModal(false)}
        />

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-200/80 dark:bg-orange-800/80 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Video className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-black dark:text-white mb-2">HD Video & Audio</h3>
            <p className="text-black/70 dark:text-white/70 text-sm">Crystal clear video calls with high-quality audio</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-rose-200/80 dark:bg-rose-800/80 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="font-semibold text-black dark:text-white mb-2">Multiple Participants</h3>
            <p className="text-black/70 dark:text-white/70 text-sm">Connect with multiple people at once</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-amber-200/80 dark:bg-amber-800/80 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold text-black dark:text-white mb-2">Instant Meetings</h3>
            <p className="text-black/70 dark:text-white/70 text-sm">Start meetings instantly or join with a link</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Panel;