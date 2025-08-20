import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotifItem = { id: string; title?: string | null; body?: string | null; data?: any; receivedAt: number };

type Ctx = {
  items: NotifItem[];
  clear: () => Promise<void>;
  removeAt: (idx: number) => Promise<void>;
};

const NotificationsContext = createContext<Ctx>({ items: [], clear: async () => {}, removeAt: async () => {} });

const STORAGE_KEY = 'notif_history_list_v1';

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<NotifItem[]>([]);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        try { setItems(JSON.parse(raw)); } catch {}
      }
    })();
  }, []);

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notif) => {
      const n: NotifItem = {
        id: `${Date.now()}`,
        title: notif.request.content.title,
        body: notif.request.content.body,
        data: notif.request.content.data,
        receivedAt: Date.now(),
      };
      setItems((prev) => {
        const next = [n, ...prev].slice(0, 200);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    });
    return () => { sub.remove(); };
  }, []);

  const clear = async () => {
    setItems([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const removeAt = async (idx: number) => {
    setItems((prev) => {
      const next = prev.slice();
      next.splice(idx, 1);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const value = useMemo(() => ({ items, clear, removeAt }), [items]);
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotificationsCenter = () => useContext(NotificationsContext);