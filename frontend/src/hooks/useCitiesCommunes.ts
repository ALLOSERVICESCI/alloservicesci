import { useState, useCallback, useEffect } from 'react';
import { apiFetch } from '../utils/api';

export interface CityCommuneResult {
  name: string;
  type: 'city' | 'commune';
}

export interface UseCitiesCommunesReturn {
  cities: string[];
  communes: string[];
  searchResults: CityCommuneResult[];
  loading: boolean;
  error: string | null;
  searchCitiesCommunes: (query: string) => Promise<void>;
  loadCities: () => Promise<void>;
  loadCommunes: (city?: string) => Promise<void>;
}

export function useCitiesCommunes(): UseCitiesCommunesReturn {
  const [cities, setCities] = useState<string[]>([]);
  const [communes, setCommunes] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<CityCommuneResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch('/cities');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setCities(data.cities || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des villes:', err);
      setError('Erreur lors du chargement des villes');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCommunes = useCallback(async (city?: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = city ? `/communes?city=${encodeURIComponent(city)}` : '/communes';
      const response = await apiFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setCommunes(data.communes || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des communes:', err);
      setError('Erreur lors du chargement des communes');
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCitiesCommunes = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch(`/cities-communes/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (err: any) {
      console.error('Erreur lors de la recherche:', err);
      setError('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    cities,
    communes,
    searchResults,
    loading,
    error,
    searchCitiesCommunes,
    loadCities,
    loadCommunes,
  };
}