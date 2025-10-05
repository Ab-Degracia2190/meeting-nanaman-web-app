import { Video, Calendar, Users } from "lucide-react";
import AnimatedBackground from "@/components/partials/background/Animated";
import PrimaryButton from "@/components/partials/buttons/Primary";
import ThemeToggle from "@/components/partials/buttons/ThemeToggle";
import { useGoogleOAuth } from "@/base/hooks/auth/use-google-oauth";

const SignIn = () => {
  const { signInWithGoogle, isLoading, error } = useGoogleOAuth();

  const handleSignIn = () => {
    signInWithGoogle();
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
              <h1 className="text-sm md:text-xl font-bold text-black dark:text-white">
                Meeting nanaman!
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <PrimaryButton
                onClick={handleSignIn}
                disabled={isLoading}
                className="hidden md:flex text-sm !py-2"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </PrimaryButton>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-xl md:text-4xl font-bold text-black dark:text-white mb-2">
            Isa sa kinaiinisan mo.
          </h2>
          <h3 className="text-lg md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600 mb-4">
            Lalo na pag may ginagawa ka.
          </h3>
          <p className="text-xs md:text-xl text-black/80 dark:text-white/80 max-w-2xl mx-auto">
            Halina't mangkupal, sumali sa meeting.
          </p>
          {error && (
            <div className="mx-auto max-w-md mt-4 p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-800 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}
          <div className="flex items-center justify-center py-8 px-0 md:px-48">
            <PrimaryButton
              onClick={handleSignIn}
              disabled={isLoading}
              className="text-xs md:text-sm"
            >
              {isLoading ? 'Redirecting to Google...' : 'Sign in here to join meetings'}
            </PrimaryButton>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-200/80 dark:bg-orange-800/80 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Video className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-black dark:text-white mb-2">
              HD Video & Audio
            </h3>
            <p className="text-black/70 dark:text-white/70 text-sm">
              Malinaw camera tas audio nito pag may problema sayo na yon
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-rose-200/80 dark:bg-rose-800/80 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="font-semibold text-black dark:text-white mb-2">
              Multiple Participants
            </h3>
            <p className="text-black/70 dark:text-white/70 text-sm">
              Pwede marami dito try nyo para maraming tanga
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-amber-200/80 dark:bg-amber-800/80 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="font-semibold text-black dark:text-white mb-2">
              Instant Meetings
            </h3>
            <p className="text-black/70 dark:text-white/70 text-sm">
              Start meetings instantly or join with a link try nyo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;