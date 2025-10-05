import { useState, useCallback } from 'react';
import { MediaState } from '@/base/types/interfaces/interfaces.types';

export const useMeetingControls = (
  initialMediaState: MediaState,
  roomId: string,
  onToggleVideo: () => Promise<boolean>,
  onToggleAudio: () => Promise<boolean>,
  onStartScreenShare: () => Promise<void>,
  onStopScreenShare: () => Promise<void>,
  onRaiseHand: () => void
) => {
  const [mediaState, setMediaState] = useState<MediaState>(initialMediaState);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleToggleVideo = useCallback(async () => {
    const newVideoState = await onToggleVideo();
    setMediaState(prev => ({ ...prev, isVideoOn: newVideoState }));
  }, [onToggleVideo]);

  const handleToggleAudio = useCallback(async () => {
    const newAudioState = await onToggleAudio();
    setMediaState(prev => ({ ...prev, isAudioOn: newAudioState }));
  }, [onToggleAudio]);

  const handleScreenShare = useCallback(async () => {
    if (mediaState.isScreenSharing) {
      await onStopScreenShare();
      setMediaState(prev => ({ ...prev, isScreenSharing: false }));
    } else {
      await onStartScreenShare();
      setMediaState(prev => ({ ...prev, isScreenSharing: true }));
    }
  }, [mediaState.isScreenSharing, onStartScreenShare, onStopScreenShare]);

  const handleRaiseHand = useCallback(() => {
    onRaiseHand();
    setIsHandRaised(prev => !prev);
  }, [onRaiseHand]);

  const copyMeetingLink = useCallback(async () => {
    try {
      const meetingLink = `${window.location.origin}/room/${roomId}`;
      await navigator.clipboard.writeText(meetingLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  }, [roomId]);

  return {
    mediaState,
    isHandRaised,
    linkCopied,
    handleToggleVideo,
    handleToggleAudio,
    handleScreenShare,
    handleRaiseHand,
    copyMeetingLink,
  };
};