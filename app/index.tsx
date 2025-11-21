import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, Dimensions } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  interpolate,
  Extrapolate,
  withDelay,
} from 'react-native-reanimated';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import CustomText from '@/components/ui/customtext';

const { width, height: screenHeight } = Dimensions.get('window');

const WelcomeScreen = () => {
  const [step, setStep] = useState(0);

  // Slow infinite zoom (Ken Burns effect)
  const zoom = useSharedValue(1);
  zoom.value = withRepeat(
    withTiming(1.25, { duration: 24000 }), // 24 seconds out
    -1,
    true // reverse
  );

  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(zoom.value, [1, 1.25], [1, 1.25], Extrapolate.CLAMP) },
      { translateY: interpolate(zoom.value, [1, 1.25], [0, -80]) }, // subtle drift up
    ],
  }));

  const steps = [
    { title: 'VibeWork', subtitle: 'Focus. Flow. Finish.', buttonLabel: 'Get Started' },
    { title: 'Deep Work', subtitle: 'VibeWork helps you enter the flow state. Eliminate distractions and focus on what truly matters.', buttonLabel: 'Continue' },
    { title: 'Schedule & Execute', subtitle: 'Set a time on your calendar, create focused sessions, and execute your vision.', buttonLabel: "Let's Go" },
  ];

  const current = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else router.replace('/(tabs)/home');
  };

  return (
    <View className="flex-1">
      {/* 1. Animated Background */}
      <Animated.View style={StyleSheet.absoluteFill}>
        <ImageBackground
          source={require('../assets/images/onboarding.jpg')}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        >
          <Animated.View style={[StyleSheet.absoluteFillObject, backgroundStyle]}>
            <ImageBackground
              source={require('../assets/images/onboarding.jpg')}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
              blurRadius={2}
            />
          </Animated.View>

          {/* Floating abstract orbs (the "flow" effect) */}
          <FloatingOrbs />

          {/* Dark overlay + bottom gradient */}
          <View className="absolute inset-0 bg-black/65" />
          <View className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </ImageBackground>
      </Animated.View>

      {/* Content */}
      <View className="flex-1 justify-between px-6 pt-20 pb-10">
        <View className="flex-1 justify-center items-center">
          <Animated.View
            key={`title-${step}`}
            entering={FadeInDown.springify().mass(1).damping(18)}
            exiting={FadeOutUp.duration(300)}
          >
            <Text className="text-5xl font-Bangers font-bold text-white text-center mb-4 tracking-tighter">
              {current.title}
            </Text>
          </Animated.View>

          <Animated.View
            key={`sub-${step}`}
            entering={FadeInDown.delay(150).springify()}
            exiting={FadeOutUp.duration(300)}
          >
            <CustomText className="text-lg text-zinc-300 text-center leading-7 px-10">
              {current.subtitle}
            </CustomText>
          </Animated.View>
        </View>

        {/* Bottom */}
        <View className="gap-6">
          {/* Dots */}
          <View className="flex-row justify-center gap-2">
            {steps.map((_, i) => (
              <View
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-9 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </View>

          <Animated.View layout={LinearTransition.springify()}>
            <Button onPress={handleNext} size="lg" className="w-full">
              <CustomText className="text-primary-foreground text-lg font-semibold">
                {current.buttonLabel}
              </CustomText>
            </Button>
          </Animated.View>

          {step < steps.length - 1 && (
            <Button variant="ghost" onPress={() => router.replace('/(tabs)/home')}>
              <CustomText className="text-zinc-400">Skip Intro</CustomText>
            </Button>
          )}
        </View>
      </View>
    </View>
  );
};

// Tiny component for the dreamy floating particles
const FloatingOrbs = () => {
  const orbs = [
    { delay: 0,   size: 220, color: '#3b82f6', opacity: 0.12 }, // blue
    { delay: 8000, size: 280, color: '#8b5cf6', opacity: 0.10 }, // purple
    { delay: 4000, size: 180, color: '#ec4899', opacity: 0.08 }, // pink
  ];

  return (
    <>
      {orbs.map((orb, i) => (
        <Orb key={i} {...orb} />
      ))}
    </>
  );
};

const Orb = ({ delay, size, color, opacity }: any) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);

  translateY.value = withDelay(
    delay,
    withRepeat(
      withTiming(screenHeight, { duration: 60000 + Math.random() * 20000 }),
      -1,
      false
    )
  );
  translateX.value = withDelay(
    delay,
    withRepeat(
      withTiming(width * 0.3, { duration: 40000 + Math.random() * 20000 }),
      -1,
      true
    )
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value - screenHeight },
      { translateX: Math.sin(translateY.value * 0.001) * 80 + translateX.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          left: -size / 2 + Math.random() * width,
          top: screenHeight + size,
        },
        animatedStyle,
      ]}
    />
  );
};

export default WelcomeScreen;