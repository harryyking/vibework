import { Platform, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import {NativeTabs} from 'expo-router/unstable-native-tabs'
import { Timer, BarChart, Calendar, Settings, Home } from 'lucide-react-native';
const TabsLayout = () => {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.primary,
        tabBarStyle: {
          backgroundColor: colors.background,
          height: Platform.OS === 'ios' ? 90 : 60,
          paddingBottom: Platform.OS === 'ios' ? 25 : 0,
          ...Platform.select({
            android: { elevation: 2 },
            ios: {
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: -2 },
              shadowRadius: 4,
            },
          }),
          position: 'absolute', // Optional: makes tab bar float
          bottom: 0,
          left: 0,
          right: 0,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '400',
          marginBottom: 4,
        },
        headerShown: false,
      }}>


      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <Home size={20} screenReaderFocusable={focused} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ focused, color }) => (
            <Calendar size={20} screenReaderFocusable={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused, color }) => (
            <Settings size={20} screenReaderFocusable={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;

const styles = StyleSheet.create({});
