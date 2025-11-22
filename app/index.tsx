import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    (async () => {
      const value = await AsyncStorage.getItem('onboarded');
      setOnboarded(value === 'true');
      setIsReady(true);
    })();
  }, []);

  if (!isReady) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return <Redirect href={onboarded ? '/(tabs)/home' : '/onboarding'} />;
}