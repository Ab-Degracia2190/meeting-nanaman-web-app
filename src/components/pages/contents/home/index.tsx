import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Plus, Calendar, Users, ArrowRight, LogOut } from 'lucide-react';
import { useAuth } from '@/components/pages/contents/home/auth/provider';
import { apiService } from '@/base/services';
import AnimatedBackground from '@/components/partials/background/Animated';
import TextInput from '@/components/partials/inputs/Text';
import PrimaryButton from '@/components/partials/buttons/Primary';
import ThemeToggle from '@/components/partials/buttons/ThemeToggle';
import NotFoundModal from '@/components/pages/errors/modals/404';
import ShareVia from '@/components/pages/contents/home/layouts/meetings/actions/index';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, signIn, signOut, isLoading } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [recentMeeting, setRecentMeeting] = useState<string | null>(null);
  const [showNotFoundModal, setShowNotFoundModal] = useState(false);

  const createNewMeeting = async () => {
    if (!isAuthenticated) {
      signIn();
      return;
    }

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

    if (!isAuthenticated) {
      // Extract room ID and redirect to auth with room context
      let roomId = joinRoomId.trim();
      const urlMatch = roomId.match(/\/room\/([^/?]+)/);
      if (urlMatch) {
        roomId = urlMatch[1];
      }
      signIn(roomId);
      return;
    }

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

  if (isLoading) {
    return (
      <div className="min-h-screen relative bg-white dark:bg-gray-900 transition-colors">
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-rose-200 dark:border-rose-800 border-t-rose-600 dark:border-t-rose-400 rounded-full animate-spin mx-auto mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
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
              Sign in with Google to start or join meetings
            </p>
            
            {/* Primary Sign-in Button */}
            <div className="mb-8">
              <PrimaryButton
                onClick={() => signIn()}
                className="text-xs md:text-sm mb-4"
              >
                Sign in with Google
              </PrimaryButton>
            </div>

            {/* Alternative Sign-in for Meetings */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20 max-w-md mx-auto">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Join a Meeting
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Have a meeting link? Sign in with Google to join
              </p>
              <PrimaryButton
                onClick={() => signIn()}
                className="text-xs md:text-sm"
              >
                Sign in with Google to start or join meetings
              </PrimaryButton>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-200/80 dark:bg-orange-800/80 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Video className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold text-black dark:text-white mb-2">HD Video & Audio</h3>
              <p className="text-black/70 dark:text-white/70 text-sm">Malinaw camera tas audio nito pag may problema sayo na yon</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-rose-200/80 dark:bg-rose-800/80 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="font-semibold text-black dark:text-white mb-2">Multiple Participants</h3>
              <p className="text-black/70 dark:text-white/70 text-sm">Pwede marami dito try nyo para maraming tanga</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-200/80 dark:bg-amber-800/80 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold text-black dark:text-white mb-2">Instant Meetings</h3>
              <p className="text-black/70 dark:text-white/70 text-sm">Start meetings instantly or join with a link try nyo</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2">
                  <img 
                    src={user.picture} 
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="hidden md:block text-black dark:text-white text-sm">
                    {user.name}
                  </span>
                </div>
              )}
              <button
                onClick={signOut}
                className="p-2 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-xl md:text-4xl font-bold text-black dark:text-white mb-2">
            Welcome back, {user?.name}!
          </h2>
          <h3 className="text-lg md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600 mb-4">
            Ready for another meeting?
          </h3>
          <p className="text-xs md:text-xl text-black/80 dark:text-white/80 mb-8 max-w-2xl mx-auto">
            Create a new meeting or join an existing one
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Plus className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-4">New Meeting</h3>
              <p className="text-sm md:text-lg text-gray-600 dark:text-gray-300 mb-8">Start a new meeting instantly</p>
              <PrimaryButton
                onClick={createNewMeeting}
                disabled={isCreating}
                loading={isCreating}
                className="text-xs md:text-sm"
              >
                Create Meeting
              </PrimaryButton>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20 dark:border-gray-700/20 hover:shadow-xl transition-all duration-300">
            <div className="text-center">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-r from-rose-400 to-orange-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-4">Join Meeting</h3>
              <p className="text-sm md:text-lg text-gray-600 dark:text-gray-300 mb-6">Join a meeting with ID or link</p>
              
              <form onSubmit={joinMeeting} className="space-y-2">
                <TextInput
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  placeholder="Enter meeting ID or paste link"
                  className="w-full text-xs md:text-sm"
                  disabled={isJoining}
                />
                <PrimaryButton
                  type="submit"
                  disabled={isJoining || !joinRoomId.trim()}
                  loading={isJoining}
                  className="text-xs md:text-sm"
                >
                  Join Meeting
                </PrimaryButton>
              </form>
            </div>
          </div>
        </div>

        {/* QR Code Section */}
        {recentMeeting && (
          <ShareVia meetingLink={recentMeeting} />
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
            <p className="text-black/70 dark:text-white/70 text-sm">Malinaw camera tas audio nito pag may problema sayo na yon</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-rose-200/80 dark:bg-rose-800/80 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="font-semibold text-black dark:text-white mb-2">Multiple Participants</h3>
            <p className="text-black/70 dark:text-white/70 text-sm">Pwede marami dito try nyo para maraming tanga</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-amber-200/80 dark:bg-amber-800/80 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold text-black dark:text-white mb-2">Instant Meetings</h3>
            <p className="text-black/70 dark:text-white/70 text-sm">Start meetings instantly or join with a link try nyo</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;