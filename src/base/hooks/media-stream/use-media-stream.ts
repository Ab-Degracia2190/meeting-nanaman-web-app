// src/base/hooks/media-stream/use-media-stream.ts
import { useState, useCallback, useRef } from 'react';
import { MediaState } from '@/base/types/interfaces/interfaces.types';

export const useMediaStream = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [mediaState, setMediaState] = useState<MediaState>({
    isVideoOn: true,
    isAudioOn: true,
    isScreenSharing: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [backgroundFilter, setBackgroundFilter] = useState<string>('none');

  const operationLockRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  const updateStream = useCallback((newStream: MediaStream | null) => {
    streamRef.current = newStream;
    setStream(newStream);
  }, []);

  const getMediaStream = useCallback(async (video = true, audio = true) => {
    try {
      setError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false,
        audio,
      });

      updateStream(mediaStream);
      setMediaState({ isVideoOn: video, isAudioOn: audio, isScreenSharing: false });
      return mediaStream;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access media devices';
      setError(errorMessage);
      console.error('Error accessing media devices:', err);
      throw err;
    }
  }, [updateStream]);

  const toggleVideo = useCallback(async () => {
    if (operationLockRef.current) {
      console.log('Operation in progress, skipping toggle video');
      return mediaState.isVideoOn;
    }

    operationLockRef.current = true;
    const currentStream = streamRef.current;

    try {
      if (!currentStream) {
        console.log('No stream, creating new one with video');
        await getMediaStream(true, mediaState.isAudioOn);
        operationLockRef.current = false;
        return true;
      }

      const videoTrack = currentStream.getVideoTracks()[0];
      
      if (videoTrack) {
        // CRITICAL FIX: Just toggle the track enable state
        const newState = !videoTrack.enabled;
        videoTrack.enabled = newState;
        
        setMediaState(prev => ({ ...prev, isVideoOn: newState }));
        
        console.log(`Video toggled to: ${newState}`);
        operationLockRef.current = false;
        return newState;
      } else {
        // CRITICAL FIX: Need to add video track without affecting audio
        console.log('No video track, adding video track while preserving audio');
        
        // Get the current audio track to preserve it
        const audioTrack = currentStream.getAudioTracks()[0];
        const currentAudioEnabled = audioTrack ? audioTrack.enabled : mediaState.isAudioOn;
        
        // Get new video stream
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false // Don't get audio, we'll reuse existing
        });

        const newVideoTrack = videoStream.getVideoTracks()[0];
        
        // Create new stream with new video track and existing audio track
        const newStream = new MediaStream();
        newStream.addTrack(newVideoTrack);
        
        if (audioTrack) {
          // Reuse existing audio track
          newStream.addTrack(audioTrack);
        } else {
          // Get new audio track if none exists
          const audioStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true
          });
          const newAudioTrack = audioStream.getAudioTracks()[0];
          newAudioTrack.enabled = currentAudioEnabled;
          newStream.addTrack(newAudioTrack);
        }

        // Stop old video tracks (but not audio)
        currentStream.getVideoTracks().forEach(track => track.stop());

        updateStream(newStream);
        setMediaState(prev => ({ ...prev, isVideoOn: true }));
        
        operationLockRef.current = false;
        return true;
      }
    } catch (error) {
      console.error('Failed to toggle video:', error);
      setError('Failed to toggle video');
      operationLockRef.current = false;
      return mediaState.isVideoOn;
    }
  }, [mediaState.isVideoOn, mediaState.isAudioOn, getMediaStream, updateStream]);

  const toggleAudio = useCallback(async () => {
    if (operationLockRef.current) {
      console.log('Operation in progress, skipping toggle audio');
      return mediaState.isAudioOn;
    }

    operationLockRef.current = true;
    const currentStream = streamRef.current;

    try {
      if (!currentStream) {
        console.log('No stream, creating new one with audio');
        await getMediaStream(mediaState.isVideoOn, true);
        operationLockRef.current = false;
        return true;
      }

      const audioTrack = currentStream.getAudioTracks()[0];
      
      if (audioTrack) {
        // CRITICAL FIX: Just toggle the track enable state
        const newState = !audioTrack.enabled;
        audioTrack.enabled = newState;
        
        setMediaState(prev => ({ ...prev, isAudioOn: newState }));
        
        console.log(`Audio toggled to: ${newState}`);
        operationLockRef.current = false;
        return newState;
      } else {
        // CRITICAL FIX: Need to add audio track without affecting video
        console.log('No audio track, adding audio track while preserving video');
        
        // Get the current video track to preserve it
        const videoTrack = currentStream.getVideoTracks()[0];
        const currentVideoEnabled = videoTrack ? videoTrack.enabled : mediaState.isVideoOn;
        
        // Get new audio stream
        const audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true
        });

        const newAudioTrack = audioStream.getAudioTracks()[0];
        
        // Create new stream with existing video track and new audio track
        const newStream = new MediaStream();
        
        if (videoTrack) {
          // Reuse existing video track
          newStream.addTrack(videoTrack);
        } else {
          // Get new video track if none exists
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user'
            },
            audio: false
          });
          const newVideoTrack = videoStream.getVideoTracks()[0];
          newVideoTrack.enabled = currentVideoEnabled;
          newStream.addTrack(newVideoTrack);
        }
        
        newStream.addTrack(newAudioTrack);

        // Stop old audio tracks (but not video)
        currentStream.getAudioTracks().forEach(track => track.stop());

        updateStream(newStream);
        setMediaState(prev => ({ ...prev, isAudioOn: true }));
        
        operationLockRef.current = false;
        return true;
      }
    } catch (error) {
      console.error('Failed to toggle audio:', error);
      setError('Failed to toggle audio');
      operationLockRef.current = false;
      return mediaState.isAudioOn;
    }
  }, [mediaState.isVideoOn, mediaState.isAudioOn, getMediaStream, updateStream]);

  const startScreenShare = useCallback(async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      setScreenStream(displayStream);
      setMediaState(prev => ({ ...prev, isScreenSharing: true }));

      const videoTrack = displayStream.getVideoTracks()[0];
      videoTrack.onended = async () => {
        setScreenStream(null);
        setMediaState(prev => ({ ...prev, isScreenSharing: false }));
        if (mediaState.isVideoOn) {
          await getMediaStream(true, mediaState.isAudioOn);
        }
      };

      return displayStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      setError('Failed to start screen sharing');
    }
    return null;
  }, [mediaState.isAudioOn, mediaState.isVideoOn, getMediaStream]);

  const stopScreenShare = useCallback(async () => {
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
      setMediaState(prev => ({ ...prev, isScreenSharing: false }));
      if (mediaState.isVideoOn) {
        await getMediaStream(true, mediaState.isAudioOn);
      }
    }
  }, [screenStream, mediaState.isVideoOn, mediaState.isAudioOn, getMediaStream]);

  const stopStream = useCallback(() => {
    const currentStream = streamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      updateStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    setMediaState({
      isVideoOn: false,
      isAudioOn: false,
      isScreenSharing: false,
    });
  }, [screenStream, updateStream]);

  const activeStream = screenStream || stream;

  return {
    stream: activeStream,
    cameraStream: stream,
    screenStream,
    mediaState,
    error,
    backgroundFilter,
    setBackgroundFilter,
    getMediaStream,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    stopStream,
  };
};