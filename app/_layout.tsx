import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { PomodoroProvider } from '@/context/PomodoroContext';
import AsyncStorage from 'expo-sqlite/kv-store';
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import { SQLiteProvider } from 'expo-sqlite';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications'
export {
  ErrorBoundary,
} from 'expo-router';


SplashScreen.preventAutoHideAsync();

async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('events', {
      name: 'Event Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const router = useRouter()

  const [fontsLoaded, fontError] = useFonts({
    'Bangers': require('../assets/fonts/Bangers.ttf'),
    'Figtree': require('../assets/fonts/Figtree.ttf')
  });

  React.useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  React.useEffect(() => {
    const checkOnboarding = async () => {
      const onboarded = await AsyncStorage.getItem('onboarded');
      if (!onboarded) {
        router.replace('/');
      } else {
        router.replace('/(tabs)/home');
      }
    };
    checkOnboarding();
  }, []);


  React.useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    setupNotificationChannel();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null; // Keep splash screen visible
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SQLiteProvider databaseName='calendar.db'>
        <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
          <PomodoroProvider>
     <BottomSheetModalProvider>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <PortalHost />
        </BottomSheetModalProvider>
          </PomodoroProvider>
        </ThemeProvider>

        </SQLiteProvider>
        </GestureHandlerRootView>
  );
}