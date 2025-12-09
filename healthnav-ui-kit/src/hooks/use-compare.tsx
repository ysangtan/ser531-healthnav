import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Provider } from "@/data/providers";

interface CompareContextType {
  compareList: Provider[];
  addToCompare: (provider: Provider) => boolean;
  removeFromCompare: (providerId: string) => void;
  clearCompare: () => void;
  isInCompare: (providerId: string) => boolean;
  isCompareOpen: boolean;
  setCompareOpen: (open: boolean) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

const STORAGE_KEY = "healthnav_compare_list";
const MAX_COMPARE = 3;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<Provider[]>([]);
  const [isCompareOpen, setCompareOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCompareList(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse compare list", e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
  }, [compareList]);

  const addToCompare = (provider: Provider): boolean => {
    if (compareList.length >= MAX_COMPARE) return false;
    if (compareList.some((p) => p.id === provider.id)) return false;
    setCompareList((prev) => [...prev, provider]);
    return true;
  };

  const removeFromCompare = (providerId: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== providerId));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isInCompare = (providerId: string) => {
    return compareList.some((p) => p.id === providerId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        isCompareOpen,
        setCompareOpen,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
