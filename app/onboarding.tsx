import React, { useRef } from 'react';
import Onboarding from 'react-native-onboarding-swiper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomText from '@/components/ui/customtext';
import { Button } from '@/components/ui/button';
import * as Haptics from 'expo-haptics';
import { View } from 'react-native';

export default function OnboardingScreen() {
  const router = useRouter();
  const onboardingRef = useRef<Onboarding>(null);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onboardingRef.current?.goNext();
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)/home');
  };

  const handleDone = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem('onboarded', 'true');
    router.replace('/(tabs)/home');
  };

  const NextButton = ({ isLight, nextLabel }: { isLight?: boolean; nextLabel?: string | React.ReactNode }) => (
    <Button onPress={handleNext} className="mx-4">
      <CustomText>{nextLabel || 'Next'}</CustomText>
    </Button>
  );

  const SkipButton = ({ isLight, skipLabel }: { isLight?: boolean; skipLabel?: string | React.ReactNode }) => (
    <Button variant="outline" onPress={handleSkip} className="mx-4">
      <CustomText>{skipLabel || 'Skip'}</CustomText>
    </Button>
  );

  const DoneButton = ({ isLight }: { isLight?: boolean }) => (
    <Button onPress={handleDone} className="mx-4">
      <CustomText>Done</CustomText>
    </Button>
  );

  const pages = [
    {
      backgroundColor: '#fff', // Adjust to your theme's background
      image: <CustomText>Image1</CustomText>, // Replace with Image component, e.g., <Image source={require('../assets/onboarding1.png')} className="w-64 h-64" />
      title: <CustomText className="text-foreground text-3xl font-bold">Welcome</CustomText>,
      subtitle: <CustomText className="text-muted-foreground text-center px-4">Start your productivity journey.</CustomText>,
    },
    {
      backgroundColor: '#fff',
      image: <CustomText>Image2</CustomText>,
      title: <CustomText className="text-foreground text-3xl font-bold">Pomodoro Technique</CustomText>,
      subtitle: <CustomText className="text-muted-foreground text-center px-4">Work in focused bursts with breaks.</CustomText>,
    },
    {
      backgroundColor: '#fff',
      image: <CustomText>Image3</CustomText>,
      title: <CustomText className="text-foreground text-3xl font-bold">Premium Features</CustomText>,
      subtitle: <CustomText className="text-muted-foreground text-center px-4">Unlock analytics and Spotify integration.</CustomText>,
    },
  ];

  return (
    <Onboarding
      ref={onboardingRef}
      pages={pages}
      bottomBarColor="transparent" // Set to match your theme, e.g., 'bg-background'
      bottomBarHighlight={false} // Optional: Disable highlight if not needed
      NextButtonComponent={NextButton}
      SkipButtonComponent={SkipButton}
      DoneButtonComponent={DoneButton}
      onSkip={handleSkip}
      onDone={handleDone}
      containerStyles={{ backgroundColor: 'bg-background' }} // Apply NativeWind class or inline style
      titleStyles={{ color: 'text-foreground' }} // Global style override
      subTitleStyles={{ color: 'text-muted-foreground' }}
    />
  );
}