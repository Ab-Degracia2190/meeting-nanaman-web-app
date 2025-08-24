import { Link } from "react-router-dom";
import { Home, VideoOff } from "lucide-react";
import AnimatedBackground from "@/components/partials/background/Animated";

const NotFound = () => {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="mb-8">
              <VideoOff className="w-24 h-24 mx-auto text-gray-500 mb-4" />
              <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Meeting Not Found</h2>
              <p className="text-gray-600 mb-8">
                The meeting room you're looking for doesn't exist or may have expired.
              </p>
            </div>
            
            <div className="space-y-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-400 to-orange-300 text-white font-medium rounded-lg hover:from-rose-500 hover:to-orange-400 transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
              
              <div className="text-sm text-gray-600">
                <p>Need help? Contact support or try creating a new meeting.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;