import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Category, Recipe, Addon } from '../data/recipes';

export interface CartItem {
  recipe: Recipe;
  selectedAddons: Addon[];
  quantity: number;
}

export interface DailyLogEntry {
  recipe: Recipe;
  selectedAddons: Addon[];
  quantity: number;
  loggedAt: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

type DailyLogStore = Record<string, DailyLogEntry[]>;

const todayKey = () => new Date().toISOString().split('T')[0];

const loadDailyLog = (): DailyLogStore => {
  try {
    const raw = localStorage.getItem('nutrilog_daily_log');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const loadWishlist = (): string[] => {
  try {
    const raw = localStorage.getItem('nutrilog_wishlist');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

interface AppContextType {
  selectedCategory: Category | null;
  setSelectedCategory: (cat: Category) => void;
  cart: CartItem[];
  addToCart: (recipe: Recipe, addons: Addon[]) => void;
  updateCartItem: (index: number, addons: Addon[]) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  dailyLog: DailyLogEntry[];
  allDailyLogs: DailyLogStore;
  logFromCart: () => void;
  clearTodayLog: () => void;
  totalCartItems: number;
  wishlist: string[];
  toggleWishlist: (recipeId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [allDailyLogs, setAllDailyLogs] = useState<DailyLogStore>(loadDailyLog);
  const [wishlist, setWishlist] = useState<string[]>(loadWishlist);

  // Persist daily log to localStorage
  useEffect(() => {
    localStorage.setItem('nutrilog_daily_log', JSON.stringify(allDailyLogs));
  }, [allDailyLogs]);

  // Persist wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('nutrilog_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const dailyLog = allDailyLogs[todayKey()] ?? [];

  const addToCart = (recipe: Recipe, addons: Addon[]) => {
    setCart(prev => [...prev, { recipe, selectedAddons: addons, quantity: 1 }]);
  };

  const updateCartItem = (index: number, addons: Addon[]) => {
    setCart(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], selectedAddons: addons };
      return updated;
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setCart([]);

  const logFromCart = () => {
    const entries: DailyLogEntry[] = cart.map(item => {
      const addonCalories = item.selectedAddons.reduce((s, a) => s + a.calories, 0);
      const addonProtein = item.selectedAddons.reduce((s, a) => s + a.protein, 0);
      const addonCarbs = item.selectedAddons.reduce((s, a) => s + a.carbs, 0);
      const addonFat = item.selectedAddons.reduce((s, a) => s + a.fat, 0);
      return {
        recipe: item.recipe,
        selectedAddons: item.selectedAddons,
        quantity: item.quantity,
        loggedAt: new Date().toISOString(),
        totalCalories: (item.recipe.calories + addonCalories) * item.quantity,
        totalProtein: (item.recipe.protein + addonProtein) * item.quantity,
        totalCarbs: (item.recipe.carbs + addonCarbs) * item.quantity,
        totalFat: (item.recipe.fat + addonFat) * item.quantity,
      };
    });
    const key = todayKey();
    setAllDailyLogs(prev => ({
      ...prev,
      [key]: [...(prev[key] ?? []), ...entries],
    }));
    clearCart();
  };

  const clearTodayLog = () => {
    const key = todayKey();
    setAllDailyLogs(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const toggleWishlist = (recipeId: string) => {
    setWishlist(prev =>
      prev.includes(recipeId) ? prev.filter(id => id !== recipeId) : [...prev, recipeId]
    );
  };

  const totalCartItems = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <AppContext.Provider value={{
      selectedCategory, setSelectedCategory,
      cart, addToCart, updateCartItem, removeFromCart, clearCart,
      dailyLog, allDailyLogs, logFromCart, clearTodayLog,
      totalCartItems,
      wishlist, toggleWishlist,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
