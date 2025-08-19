import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';

export function getBackendBase(): string {
  const envBase = process.env.EXPO_PUBLIC_BACKEND_URL || (Constants.expoConfig?.extra as any)?.backendUrl || '';
  if (envBase) return envBase;
  // Fallback for web preview only (proxy /api -> backend)
  if (Platform.OS === 'web') return '';
  throw new Error('BACKEND_URL_MISSING');
}

export function makeApiUrl(path: string): string {
  const base = getBackendBase();
  // If base is empty (web preview), path must already contain /api
  if (!base) return path.startsWith('/api') ? path : `/api${path}`;
  return `${base}${path.startsWith('/api') ? path : `/api${path}`}`;
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
        'EXPO_PUBLIC_BACKEND_URL est manquant dans la build. Veuillez définir cette variable dans EAS (ex: https://allo-ci.preview.emergentagent.com).'
      );
    }
    throw e;
  }
}