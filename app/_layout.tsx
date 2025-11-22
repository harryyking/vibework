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
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GestureHandlerRootView} from 'react-native-gesture-handler'
import { SQLiteProvider } from 'expo-sqlite';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications'
import { registerForPushNotificationsAsync, setupNotificationHandler } from '@/lib/constants';
export {
  ErrorBoundary,
} from 'expo-router';


setupNotificationHandler();
registerForPushNotificationsAsync().catch(() => {}); // silent fail = user denied

SplashScreen.preventAutoHideAsync();

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
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
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