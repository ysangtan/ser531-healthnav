import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Provider } from "@/data/providers";

interface SavedContextType {
  savedProviders: Provider[];
  saveProvider: (provider: Provider) => void;
  unsaveProvider: (providerId: string) => void;
  isSaved: (providerId: string) => boolean;
  recentSearches: RecentSearch[];
  addRecentSearch: (search: RecentSearch) => void;
  removeRecentSearch: (searchId: string) => void;
  clearRecentSearches: () => void;
}

export interface RecentSearch {
  id: string;
  symptom: string;
  radius: number;
  specialties: string[];
  minHcahps: number;
  timestamp: string;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

const PROVIDERS_KEY = "healthnav_saved_providers";
const SEARCHES_KEY = "healthnav_recent_searches";

export function SavedProvider({ children }: { children: ReactNode }) {
  const [savedProviders, setSavedProviders] = useState<Provider[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const storedProviders = localStorage.getItem(PROVIDERS_KEY);
    const storedSearches = localStorage.getItem(SEARCHES_KEY);
    
    if (storedProviders) {
      try {
        setSavedProviders(JSON.parse(storedProviders));
      } catch (e) {
        console.error("Failed to parse saved providers", e);
      }
    }
    
    if (storedSearches) {
      try {
        setRecentSearches(JSON.parse(storedSearches));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  // Save providers to localStorage
  useEffect(() => {
    localStorage.setItem(PROVIDERS_KEY, JSON.stringify(savedProviders));
  }, [savedProviders]);

  // Save searches to localStorage
  useEffect(() => {
    localStorage.setItem(SEARCHES_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  const saveProvider = (provider: Provider) => {
    if (!savedProviders.some((p) => p.id === provider.id)) {
      setSavedProviders((prev) => [...prev, provider]);
    }
  };

  const unsaveProvider = (providerId: string) => {
    setSavedProviders((prev) => prev.filter((p) => p.id !== providerId));
  };

  const isSaved = (providerId: string) => {
    return savedProviders.some((p) => p.id === providerId);
  };

  const addRecentSearch = (search: RecentSearch) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.id !== search.id);
      return [search, ...filtered].slice(0, 10); // Keep max 10
    });
  };

  const removeRecentSearch = (searchId: string) => {
    setRecentSearches((prev) => prev.filter((s) => s.id !== searchId));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  return (
    <SavedContext.Provider
      value={{
        savedProviders,
        saveProvider,
        unsaveProvider,
        isSaved,
        recentSearches,
        addRecentSearch,
        removeRecentSearch,
        clearRecentSearches,
      }}
    >
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error("useSaved must be used within a SavedProvider");
  }
  return context;
}
