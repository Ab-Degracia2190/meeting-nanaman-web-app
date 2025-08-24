// Animated.tsx
import React from "react";

const AnimatedBackground: React.FC = () => {
  return (
    <>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-400 via-orange-300 to-amber-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
        {/* Floating Chat Bubbles */}
        <div className="absolute top-20 left-10 w-16 h-10 bg-white/15 dark:bg-white/5 rounded-full animate-float opacity-50"></div>
        <div className="absolute top-40 right-20 w-12 h-8 bg-white/15 dark:bg-white/5 rounded-full animate-float delay-100 opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-12 bg-white/15 dark:bg-white/5 rounded-full animate-float delay-200 opacity-45"></div>
        <div className="absolute bottom-20 right-1/3 w-14 h-9 bg-white/15 dark:bg-white/5 rounded-full animate-float delay-300 opacity-35"></div>

        {/* Animated Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-to-r from-pink-300/40 to-rose-400/40 dark:from-pink-900/20 dark:to-rose-800/20 rounded-full mix-blend-soft-light filter blur-2xl animate-slow-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-r from-orange-200/40 to-amber-300/40 dark:from-orange-900/20 dark:to-amber-800/20 rounded-full mix-blend-soft-light filter blur-2xl animate-slow-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-gradient-to-r from-yellow-200/30 to-orange-300/30 dark:from-yellow-900/10 dark:to-orange-800/10 rounded-full mix-blend-soft-light filter blur-2xl animate-slow-pulse delay-500"></div>

        {/* Gentle Moving Lines */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent dark:via-white/5 transform -skew-x-6 animate-slow-pulse"></div>
          <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent dark:via-white/5 transform skew-x-6 animate-slow-pulse delay-700"></div>
        </div>
      </div>

      {/* Additional Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-100/30 via-transparent to-rose-100/20 dark:from-gray-900/20 dark:via-transparent dark:to-gray-800/20 pointer-events-none"></div>

      {/* Particle Effect (CSS only) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-orange-300 dark:bg-orange-500 rounded-full animate-gentle-ping opacity-40"></div>
        <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-rose-300 dark:bg-rose-500 rounded-full animate-gentle-ping delay-500 opacity-50"></div>
        <div className="absolute top-2/3 left-2/3 w-1 h-1 bg-amber-300 dark:bg-amber-500 rounded-full animate-gentle-ping delay-1000 opacity-45"></div>
      </div>

      {/* Custom CSS for smoother animations */}
      <style>{`
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes slow-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes gentle-ping {
          0% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
          100% { opacity: 0.4; transform: scale(1); }
        }
        @keyframes gentle-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .animate-float {
          animation: gentle-float 4s ease-in-out infinite;
        }
        .animate-slow-pulse {
          animation: slow-pulse 6s ease-in-out infinite;
        }
        .animate-gentle-ping {
          animation: gentle-ping 3s ease-in-out infinite;
        }
        .animate-gentle-pulse {
          animation: gentle-pulse 2s ease-in-out infinite;
        }
        .animate-gentle-float {
          animation: gentle-float 6s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default AnimatedBackground;