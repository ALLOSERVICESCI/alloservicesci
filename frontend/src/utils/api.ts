import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';

export function getBackendBase(): string {
  const envBase = process.env.EXPO_PUBLIC_BACKEND_URL || (Constants.expoConfig?.extra as any)?.backendUrl || '';
  return envBase;
}

function joinBaseAndPath(base: string, path: string): string {
  const b = (base || '').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!b) return p; // web preview fallback
  const withoutApi = p.replace(/^\/api/, '');
  if (b.endsWith('/api')) return `${b}${withoutApi}`;
  return `${b}/api${withoutApi}`;
}

export function makeApiUrl(path: string): string {
  return joinBaseAndPath(getBackendBase(), path);
}

export async function apiFetch(path: string, init?: RequestInit) {
  try {
    const url = makeApiUrl(path);
    const res = await fetch(url, init);
    return res;
  } catch (e: any) {
    if (e?.message === 'BACKEND_URL_MISSING') {
      Alert.alert(
        'Configuration requise',
        'EXPO_PUBLIC_BACKEND_URL est manquant dans la build. Veuillez le définir dans EAS.'
      );
    }
    throw e;
  }
}