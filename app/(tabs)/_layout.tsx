import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#22D3EE', // Cyan accent that matches your app
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)', // Semi-transparent white
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: 'rgba(45, 27, 105, 0.95)', // Your app's main purple color
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)', // Subtle white border
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: Platform.OS === 'ios' ? 34 : 16,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 88 : 72,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.1,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 30 : 28} 
              name="house.fill" 
              color={color}
              weight={focused ? 'semibold' : 'medium'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 30 : 28} 
              name="book.closed.fill" 
              color={color}
              weight={focused ? 'semibold' : 'medium'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 30 : 28} 
              name="person.2.fill" 
              color={color}
              weight={focused ? 'semibold' : 'medium'}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol 
              size={focused ? 30 : 28} 
              name="person.crop.circle.fill" 
              color={color}
              weight={focused ? 'semibold' : 'medium'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
