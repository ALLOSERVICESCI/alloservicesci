import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch } from '../utils/api';

export type NotifItem = { id: string; title?: string | null; body?: string | null; data?: any; receivedAt: number };

type Ctx = {
  items: NotifItem[];
  clear: () => Promise<void>;
  removeAt: (idx: number) => Promise<void>;
  alertsUnreadCount: number | null;
  setAlertsUnreadCount: (n: number) => void;
  refreshAlertsUnread: (userId?: string) => Promise<void>;
  addLocal: (n: Omit<NotifItem, 'id' | 'receivedAt'> & Partial<Pick<NotifItem, 'id' | 'receivedAt'>>) => Promise<void>;
};

const NotificationsContext = createContext<Ctx>({
  items: [],
  clear: async () => {},
  removeAt: async () => {},
  alertsUnreadCount: null,
  setAlertsUnreadCount: () => {},
  refreshAlertsUnread: async () => {},
  addLocal: async () => {},
});

const STORAGE_KEY = 'notif_history_list_v1';
const DAY_MS = 24 * 60 * 60 * 1000;

const pruneOlderThan24h = (list: NotifItem[]) => list.filter((n) => (Date.now() - (n.receivedAt || 0)) <= DAY_MS);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<NotifItem[]>([]);
  const [alertsUnreadCount, setAlertsUnreadCount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          const parsed: NotifItem[] = JSON.parse(raw);
          const pruned = pruneOlderThan24h(parsed);
          if (pruned.length !== parsed.length) {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
          }
          setItems(pruned);
        } catch {}
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
        const next = pruneOlderThan24h([n, ...prev]).slice(0, 200);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
      setAlertsUnreadCount((prev) => typeof prev === 'number' ? prev + 1 : prev);
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

  const refreshAlertsUnread = async (userId?: string) => {
    try {
      const url = userId ? `/api/alerts/unread_count?user_id=${userId}` : '/api/alerts/unread_count';
      const res = await apiFetch(url);
      const json = await res.json().catch(() => ({}));
      if (res.ok && typeof json.count === 'number') setAlertsUnreadCount(json.count);
    } catch {}
  };

  const addLocal: Ctx['addLocal'] = async (n) => {
    const item: NotifItem = {
      id: n.id || `${Date.now()}`,
      title: n.title || 'Alerte',
      body: n.body || '',
      data: n.data,
      receivedAt: n.receivedAt || Date.now(),
    };
    setItems((prev) => {
      const next = pruneOlderThan24h([item, ...prev]).slice(0, 200);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const value = useMemo(() => ({ items, clear, removeAt, alertsUnreadCount, setAlertsUnreadCount, refreshAlertsUnread, addLocal }), [items, alertsUnreadCount]);
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotificationsCenter = () => useContext(NotificationsContext);