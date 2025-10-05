// src/components/pages/contents/home/layouts/meetings/controls-panel/video-player.tsx
import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, VideoOff, Hand } from 'lucide-react';
import { User } from '@/base/types';

interface VideoPlayerProps {
  stream?: MediaStream | null;
  user: User;
  isLocal?: boolean;
  className?: string;
  backgroundFilter?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  stream, 
  user, 
  isLocal = false, 
  className = "",
  backgroundFilter = 'none'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVideoActive, setIsVideoActive] = useState(false);

  // CRITICAL: Monitor the actual video track state and user state
  useEffect(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      
      if (videoTrack) {
        // CRITICAL: Check both track.enabled AND user.isVideoOn
        // For local user: use track.enabled (source of truth)
        // For remote user: use user.isVideoOn (from server state)
        const checkTrackState = () => {
          if (isLocal) {
            // Local: track.enabled is the source of truth
            setIsVideoActive(videoTrack.enabled);
          } else {
            // Remote: user.isVideoOn from server + track exists
            setIsVideoActive(videoTrack.enabled && user.isVideoOn);
          }
        };
        
        // Set initial state
        checkTrackState();
        
        // Monitor track state changes
        const interval = setInterval(checkTrackState, 100);
        
        return () => clearInterval(interval);
      } else {
        setIsVideoActive(false);
      }
    } else {
      setIsVideoActive(false);
    }
  }, [stream, user.isVideoOn, isLocal]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      
      // Ensure video plays when track becomes active
      if (isVideoActive) {
        videoRef.current.play().catch(err => {
          console.log('Video play failed:', err);
        });
      }
    }
  }, [stream, isVideoActive]);

  const getBackgroundStyle = () => {
    switch (backgroundFilter) {
      case 'office':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'nature':
        return 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)';
      case 'gradient1':
        return 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)';
      case 'gradient2':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'gradient3':
        return 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
      case 'gradient4':
        return 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
      case 'blur':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      default:
        return null;
    }
  };

  const shouldShowBackground = isLocal && backgroundFilter !== 'none' && isVideoActive;

  // CRITICAL: Get audio state from user object (server state)
  const isAudioOn = user.isAudioOn;

  return (
    <div className={`relative bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black rounded-lg overflow-hidden ${className}`}>
      {/* Background Layer */}
      {shouldShowBackground && (
        <div 
          className="absolute inset-0 z-0"
          style={{ background: getBackgroundStyle() || undefined }}
        >
          {backgroundFilter === 'blur' && (
            <div className="absolute inset-0 backdrop-blur-md bg-white/10"></div>
          )}
        </div>
      )}

      {/* Video Display */}
      {isVideoActive && stream ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className={`w-full h-full object-cover ${
              isLocal ? 'scale-x-[-1]' : ''
            } ${shouldShowBackground ? 'relative z-10 mix-blend-multiply' : ''}`}
            style={shouldShowBackground ? { 
              opacity: backgroundFilter === 'blur' ? 0.8 : 1,
            } : {}}
          />
          
          <canvas
            ref={canvasRef}
            className="hidden"
            width="1280"
            height="720"
          />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 dark:from-gray-800 dark:to-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-400 to-orange-300 flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <VideoOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-white font-medium">{user.name}</p>
            <p className="text-gray-400 text-sm mt-1">
              {isLocal ? 'Camera off' : 'Camera is off'}
            </p>
          </div>
        </div>
      )}
      
      {/* Raised Hand Indicator */}
      {user.isHandRaised && (
        <div className="absolute top-3 right-3 z-30">
          <div className="bg-yellow-500 text-white p-2 rounded-full shadow-lg animate-bounce">
            <Hand className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Reaction Overlay */}
      {user.lastReaction && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <div className="text-6xl animate-ping">
            {user.lastReaction.emoji}
          </div>
        </div>
      )}
      
      {/* User info overlay - CRITICAL: Use user.isAudioOn from server state */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium bg-black/70 px-2 py-1 rounded backdrop-blur-sm">
            {user.name} {isLocal && '(Ikaw to tanga)'}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* CRITICAL: Display audio state from user.isAudioOn */}
          <div className={`p-1 rounded ${
            isAudioOn 
              ? 'bg-green-600' 
              : 'bg-red-600'
          }`}>
            {isAudioOn ? (
              <Mic className="w-3 h-3 text-white" />
            ) : (
              <MicOff className="w-3 h-3 text-white" />
            )}
          </div>
          
          {/* Only show video off indicator when video is actually off */}
          {!isVideoActive && (
            <div className="p-1 rounded bg-red-600">
              <VideoOff className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;