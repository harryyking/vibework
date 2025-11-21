// components/sessionModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Pressable, Animated } from 'react-native';
import { VideoView } from 'expo-video';
import { StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { usePomodoro } from '@/context/PomodoroContext';
import CustomText from './ui/customtext';
import * as ScreenOrientation from 'expo-screen-orientation';

interface SessionModalProps {
  visible: boolean;
  onClose: () => void;
}

const SessionModal: React.FC<SessionModalProps> = ({ visible, onClose }) => {
  const {
    phase,
    timeLeft,
    currentCycle,
    videoPlayer,
    handleStop,
    formatTime,
  } = usePomodoro();

  const progress = useRef(new Animated.Value(0)).current;
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    if (visible) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      ScreenOrientation.unlockAsync();
    }

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, [visible]);

  const handlePressIn = () => {
    setIsHolding(true);
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        handleClose();
      } else {
        setIsHolding(false);
      }
    });
  };

  const handlePressOut = () => {
    progress.stopAnimation();
    setIsHolding(false);
    progress.setValue(0);
  };

  const handleClose = async () => {
    await handleStop(); // Clean up media and reset state
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
      transparent={false}
    >
      <View className="flex-1 bg-black">
        {/* Background Video */}
        {videoPlayer && (
          <VideoView
            player={videoPlayer}
            style={StyleSheet.absoluteFill}
            nativeControls={false}
          />
        )}

        {/* Dark overlay + full-screen pressable area */}
        <View className="flex-1 bg-black/40">
          {/* Full-screen hold detector */}
          <Pressable
            className="absolute inset-0"
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          />

          {/* Timer – perfectly centered */}
          <View className="absolute inset-0 justify-center items-center" pointerEvents="none">
            <Text className="text-white font-Bangers text-[120px] font-bold tracking-wider drop-shadow-2xl">
              {formatTime(timeLeft)}
            </Text>
            {/* Optional phase + cycle */}
            {/* <Text className="text-white text-4xl mt-8 opacity-80">
              {phase === 'work' ? 'FOCUS' : 'BREAK'} · Cycle {currentCycle}
            </Text> */}
          </View>

          {/* Hold to Stop – near bottom */}
          <View className="absolute bottom-24 left-0 right-0 items-center" pointerEvents="none">
            <CustomText className="text-white text-xl font-medium mb-6 opacity-80">
              Hold anywhere to stop
            </CustomText>

            {isHolding && (
              <View className="w-52 h-3 bg-zinc-800 rounded-full overflow-hidden shadow-lg">
                <Animated.View
                  style={{
                    height: '100%',
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: '#ff3b30', // Red = clear "stop" signal
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SessionModal;