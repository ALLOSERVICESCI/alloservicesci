import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const API = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

type User = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  preferred_lang?: string;
};

type AuthContextType = {
  user: User | null;
  expoPushToken: string | null;
  register: (input: { first_name: string; last_name: string; email?: string; phone: string; preferred_lang?: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  expoPushToken: null,
  register: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    // load persisted user
    (async () => {
      const raw = await AsyncStorage.getItem('auth_user');
      if (raw) setUser(JSON.parse(raw));
    })();
  }, []);

  useEffect(() => {
    // setup notifications and get token
    (async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
          });
        }
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return;
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        setExpoPushToken(token);
      } catch (e) {
        console.log('Notifications init error', e);
      }
    })();
  }, []);

  useEffect(() => {
    // register token with backend when both token and user available
    (async () => {
      try {
        if (expoPushToken) {
          await fetch(`${API}/notifications/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: expoPushToken, user_id: user?.id, platform: Platform.OS })
          });
        }
      } catch (e) {
        console.log('Register push token failed', e);
      }
    })();
  }, [expoPushToken, user?.id]);

  const register = async (input: { first_name: string; last_name: string; email?: string; phone: string; preferred_lang?: string }) => {
    const res = await fetch(`${API}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.detail || 'Inscription échouée');
    }
    const u = await res.json();
    setUser(u);
    await AsyncStorage.setItem('auth_user', JSON.stringify(u));
    // re-register push with user_id if token exists
    if (expoPushToken) {
      try {
        await fetch(`${API}/notifications/register`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: expoPushToken, user_id: u.id, platform: Platform.OS })
        });
      } catch {}
    }
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('auth_user');
  };

  const value = useMemo(() => ({ user, expoPushToken, register, logout }), [user, expoPushToken]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);