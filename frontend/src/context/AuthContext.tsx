import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiFetch } from '../utils/api';

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  preferred_lang?: string;
  city?: string;
  avatar?: string; // base64 without data: prefix
};

type AuthContextType = {
  user: User | null;
  expoPushToken: string | null;
  register: (input: { first_name: string; last_name: string; email?: string; phone: string; preferred_lang?: string }) => Promise<void>;
  updateProfile: (input: Partial<User>) => Promise<User>;
  logout: () => Promise<void>;
  refreshUserData?: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  expoPushToken: null,
  register: async () => {},
  updateProfile: async () => ({ id: '' } as any),
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('auth_user');
      if (raw) setUser(JSON.parse(raw));
    })();
  }, []);

  // Skip Expo Go Android remote notifications to avoid SDK 53 error
  const canInitRemotePush = !(Platform.OS === 'android' && Constants.appOwnership === 'expo');

  useEffect(() => {
    if (!canInitRemotePush) return;
    (async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', { name: 'Default', importance: Notifications.AndroidImportance.MAX });
        }
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        setExpoPushToken(token);
      } catch (e) {
        console.log('Notifications init error', e);
      }
    })();
  }, [canInitRemotePush]);

  useEffect(() => {
    (async () => {
      try {
        if (expoPushToken) {
          await apiFetch('/api/notifications/register', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: expoPushToken, user_id: user?.id, platform: Platform.OS, city: user?.city })
          });
        }
      } catch (e) {
        console.log('Register push token failed', e);
      }
    })();
  }, [expoPushToken, user?.id, user?.city]);

  const register = async (input: { first_name: string; last_name: string; email?: string; phone: string; preferred_lang?: string }) => {
    const res = await apiFetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
    if (!res.ok) {
      const j = await res.json().catch(() => ({} as any));
      throw new Error((j as any).detail || 'Inscription échouée');
    }
    const u = await res.json();
    setUser(u);
    await AsyncStorage.setItem('auth_user', JSON.stringify(u));
  };

  const refreshUserData = async () => {
    try {
      const raw = await AsyncStorage.getItem('auth_user');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  };

  const updateProfile = async (input: Partial<User>) => {
    if (!user?.id) throw new Error('Not logged in');
    const res = await apiFetch(`/api/users/${user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
    const updated = await res.json();
    const merged = { ...updated, ...input } as User;
    setUser(merged);
    await AsyncStorage.setItem('auth_user', JSON.stringify(merged));
    return merged;
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('auth_user');
  };

  const value = useMemo(() => ({ user, expoPushToken, register, updateProfile, logout, refreshUserData }), [user, expoPushToken]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);