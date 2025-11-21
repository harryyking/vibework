// context/PomodoroContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useVideoPlayer, VideoPlayer } from 'expo-video';
import { useKeepAwake } from 'expo-keep-awake';

// Define preset types with customizable durations
export type Preset = {
  tag: string;
  videoSource: any; // require path or null (updated to any for flexibility)
  musicSource: any; // require (number) or URI (string) or null
  workDuration: number; // seconds
  shortBreak: number;
  longBreak: number;
  cycles: number; // e.g., 4 work sessions before long break
  isCustom?: boolean;
};

const defaultPresets: Preset[] = [
  {
    tag: 'STUDY',
    videoSource: require('../assets/videos/study.mp4'),
    musicSource: require('../assets/music/girl.mp3'),
    workDuration: 1500, // 25 min
    shortBreak: 300, // 5 min
    longBreak: 900, // 15 min
    cycles: 4,
  },

  {
    tag: 'FITNESS',
    videoSource: require('../assets/videos/fitness.mp4'),
    musicSource: require('../assets/music/background.mp3'),
    workDuration: 1500,
    shortBreak: 300,
    longBreak: 900,
    cycles: 4,
  },
  {
    tag: 'FOCUS',
    videoSource: require('../assets/videos/focus.mp4'),
    musicSource: require('../assets/music/ambient.mp3'),
    workDuration: 1500,
    shortBreak: 300,
    longBreak: 900,
    cycles: 4,
  },
  {
    tag: 'READ',
    videoSource: require('../assets/videos/reading.mp4'),
    musicSource: require('../assets/music/study.mp3'),
    workDuration: 1500,
    shortBreak: 300,
    longBreak: 900,
    cycles: 4,
  },
  // {
  //   tag: 'CUSTOM',
  //   isCustom: true,
  //   videoSource: null,
  //   musicSource: null,
  //   workDuration: 1500,
  //   shortBreak: 300,
  //   longBreak: 900,
  //   cycles: 4,
  // },
];

type Phase = 'work' | 'shortBreak' | 'longBreak';

type PomodoroContextType = {
  presets: Preset[];
  selectedPreset: Preset | null;
  setSelectedPreset: (preset: Preset | null) => void;
  phase: Phase;
  timeLeft: number;
  isPaused: boolean;
  currentCycle: number;
  videoPlayer: VideoPlayer | null;
  audioPlayer: any | null; // Adjust type based on expo-audio's AudioPlayer
  handlePauseResume: () => Promise<void>;
  handleStop: () => Promise<void>;
  formatTime: (seconds: number) => string;
};

export const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);
  const [phase, setPhase] = useState<Phase>('work');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [audioVolume] = useState(0.25);

  const videoPlayer = useVideoPlayer(null);
  const audioPlayer = useAudioPlayer(null);
  const audioStatus = useAudioPlayerStatus(audioPlayer);

  useKeepAwake(); // Keep screen awake during sessions

  useEffect(() => {
    if (selectedPreset) {
      setTimeLeft(selectedPreset.workDuration);
      setPhase('work');
      setCurrentCycle(1);
      loadMedia();
    }

    // No manual cleanup needed; hooks handle release on unmount
  }, [selectedPreset]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handlePhaseEnd();
    }
    return () => clearInterval(interval);
  }, [isPaused, timeLeft, phase]);

  const loadMedia = async () => {
    try {
      if (selectedPreset?.musicSource) {
        audioPlayer.replace(selectedPreset.musicSource);
        audioPlayer.loop = true;
        audioPlayer.volume = 0.25
        if (!isPaused) {
          await audioPlayer.play();
        }
      }

      if (selectedPreset?.videoSource) {
        await videoPlayer.replaceAsync(selectedPreset.videoSource); // Use async to avoid deprecation warning
        videoPlayer.loop = true;
        videoPlayer.muted = true
        if (!isPaused) {
          await videoPlayer.play();
        }
      }
    } catch (error) {
      console.error('Failed to load media:', error);
    }
  };

  const handlePauseResume = async () => {
    const newPaused = !isPaused;
    setIsPaused(newPaused);

    if (newPaused) {
      await videoPlayer?.pause();
      await audioPlayer?.pause();
    } else {
      await videoPlayer?.play();
      await audioPlayer?.play();
    }
  };

  const handleStop = async () => {
    await cleanupMedia();
    setSelectedPreset(null);
    setTimeLeft(0);
    setIsPaused(false);
    setPhase('work');
    setCurrentCycle(1);
  };

  const cleanupMedia = async () => {
    videoPlayer.pause();
    audioPlayer.pause();

    await videoPlayer.replaceAsync(null);
  

    // For audio: Avoid replace(null) entirely to prevent iOS casting error; just pause (source remains but inactive)
    // If full unload needed, consider audioPlayer.remove(), but this reuses the player
  };

  const handlePhaseEnd = async () => {
    if (phase === 'work') {
      if (currentCycle < (selectedPreset?.cycles || 4)) {
        setPhase('shortBreak');
        setTimeLeft(selectedPreset?.shortBreak || 300);
        setCurrentCycle((prev) => prev + 1);
      } else {
        setPhase('longBreak');
        setTimeLeft(selectedPreset?.longBreak || 900);
        setCurrentCycle(1); // Reset cycles after long break
      }
    } else {
      setPhase('work');
      setTimeLeft(selectedPreset?.workDuration || 1500);
    }
    // Optional: Play notification sound or vibrate on phase change
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <PomodoroContext.Provider
      value={{
        presets: defaultPresets,
        selectedPreset,
        setSelectedPreset,
        phase,
        timeLeft,
        isPaused,
        currentCycle,
        videoPlayer: selectedPreset?.videoSource ? videoPlayer : null,
        audioPlayer: selectedPreset?.musicSource ? audioPlayer : null,
        handlePauseResume,
        handleStop,
        formatTime,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

// Hook for using context
export const usePomodoro = () => {
  const context = React.useContext(PomodoroContext);
  if (undefined === context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};