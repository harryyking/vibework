import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Linking, Share, Alert, Platform } from 'react-native';
import { Switch } from '@/components/ui/switch';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Bell, 
  Volume2, 
  Star, 
  Share2, 
  Mail, 
  Instagram, 
  HelpCircle, 
  MessageSquare, 
  Info,
  ChevronRight 
} from 'lucide-react-native';
import { useTheme } from '@react-navigation/native';
import CustomText from '@/components/ui/customtext';
import { Card, CardContent } from '@/components/ui/card';
import * as StoreReview from 'expo-store-review';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Helper Components Moved Outside to prevent re-renders and errors ---

interface SettingRowProps {
  label: string;
  description?: string;
  icon?: React.ComponentType<any>;
  rightElement?: React.ReactNode;
  onPress?: () => void;
}

const SettingRow = ({
  label,
  description,
  icon: Icon,
  rightElement,
  onPress,
}: SettingRowProps) => {
  const theme = useTheme();
  
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="px-5"
    >
      <View className="flex-row items-center min-h-[60px] py-3">
        {/* Left side: Icon + Text */}
        <View className="flex-row items-center flex-1">
          {Icon && (
            <View className="mr-4">
              <Icon size={22} color={theme.colors.text} />
            </View>
          )}
  
          <View className="flex-1">
            <CustomText className="text-foreground font-medium text-base leading-5">
              {label}
            </CustomText>
            {/* FIX: Use !!description to ensure we never render an empty string "" */}
            {!!description && (
              <CustomText
                variant="small"
                className="text-muted-foreground mt-0.5 leading-5"
              >
                {description}
              </CustomText>
            )}
          </View>
        </View>
  
        {/* Right side: Switch or Chevron */}
        <View className="ml-4 justify-center">
          {rightElement ?? (
            <ChevronRight size={22} color={theme.colors.text} className="opacity-50" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View className="mb-8">
    <CustomText className="text-muted-foreground font-semibold text-xs uppercase tracking-wider mb-3 px-1">
      {title}
    </CustomText>
    <Card className="rounded-3xl overflow-hidden">
      <CardContent className="p-0 divide-y divide-border">
        {children}
      </CardContent>
    </Card>
  </View>
);

// --- Main Component ---

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load saved preferences
  useEffect(() => {
    (async () => {
      const notifs = await AsyncStorage.getItem('notificationsEnabled');
      const sound = await AsyncStorage.getItem('soundEnabled');
      setNotificationsEnabled(notifs === 'true');
      setSoundEnabled(sound !== 'false'); // default true
    })();
  }, []);

  // Save preferences
  const toggleNotifications = async (value: boolean) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        setNotificationsEnabled(true);
        await AsyncStorage.setItem('notificationsEnabled', 'true');
      } else {
        Alert.alert(
          'Notifications Disabled',
          'You can enable them anytime in device settings.',
          [{ text: 'OK' }]
        );
        setNotificationsEnabled(false);
      }
    } else {
      setNotificationsEnabled(false);
      await AsyncStorage.setItem('notificationsEnabled', 'false');
    }
  };

  const toggleSound = async (value: boolean) => {
    setSoundEnabled(value);
    await AsyncStorage.setItem('soundEnabled', value.toString());
  };

  const handleRateApp = async () => {
    try {
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
      } else {
        const storeUrl = Platform.select({
          ios: 'https://apps.apple.com/app/idYOUR_APPLE_ID',
          android: 'https://play.google.com/store/apps/details?id=com.harryyking.vibework',
        });
        if (storeUrl) Linking.openURL(storeUrl);
      }
    } catch (error) {
      console.log('Review error:', error);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: 'I just found VibeWork — the best focus timer with beautiful vibes! 🎧✨\n\nhttps://vibework.app',
        url: 'https://vibework.app',
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share the app');
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 40 }}
      >
        {/* Header */}
        <View className="pt-4 pb-6">
          <CustomText variant="h2" className="font-bold">Settings</CustomText>
        </View>

        {/* Preferences */}
        <Section title="Preferences">
          <SettingRow
            label="Notifications"
            description="Session end alerts & daily reminders"
            icon={Bell}
            rightElement={
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={toggleNotifications}
              />
            }
          />
          <SettingRow
            label="Sound Effects"
            description="Chimes, bells, and session transitions"
            icon={Volume2}
            rightElement={
              <Switch
                checked={soundEnabled}
                onCheckedChange={toggleSound}
              />
            }
          />
        </Section>

        {/* Support Us */}
        <Section title="Support Us">
          <SettingRow
            label="Rate VibeWork"
            description="Love the app? Leave us a review ❤️"
            icon={Star}
            onPress={handleRateApp}
          />
          <SettingRow
            label="Share with Friends"
            description="Help others discover better focus"
            icon={Share2}
            onPress={handleShare}
          />
        </Section>

        {/* Feedback & Community */}
        <Section title="Feedback & Community">
          <SettingRow
            label="Email Us"
            description="hello@vibework.app"
            icon={Mail}
            onPress={() => Linking.openURL('mailto:hello@vibework.app')}
          />
          <SettingRow
            label="Instagram"
            description="@vibework"
            icon={Instagram}
            onPress={() => Linking.openURL('https://instagram.com/vibework')}
          />
          <SettingRow
            label="Suggest a Feature"
            description="We read every single one"
            icon={MessageSquare}
            onPress={() => Linking.openURL('mailto:hello@vibework.app?subject=Feature%20Request')}
          />
        </Section>

        {/* About */}
        <Section title="About">
          <SettingRow
            label="Help Center"
            icon={HelpCircle}
            onPress={() => Linking.openURL('https://vibework.app/help')}
          />
          <SettingRow
            label="About VibeWork"
            description="Beautiful focus sessions with calming visuals & music"
            icon={Info}
          />
          <View className="py-4 px-6">
            <CustomText className="text-muted-foreground text-center text-xs">
              Version 1.0.0 • Made with ❤️ for deep work
            </CustomText>
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}