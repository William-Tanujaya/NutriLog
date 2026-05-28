import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Category, Recipe, Addon } from '../data/recipes';
import { useAuth } from './AuthContext';

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

// Keys scoped per user
const dailyLogKey = (username: string) => `nutrilog_daily_log_${username}`;
const wishlistKey = (username: string) => `nutrilog_wishlist_${username}`;

const loadDailyLog = (username: string): DailyLogStore => {
  try {
    const raw = localStorage.getItem(dailyLogKey(username));
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const loadWishlist = (username: string): string[] => {
  try {
    const raw = localStorage.getItem(wishlistKey(username));
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
  const { user } = useAuth();
  const username = user?.username ?? 'guest';

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [allDailyLogs, setAllDailyLogs] = useState<DailyLogStore>(() => loadDailyLog(username));
  const [wishlist, setWishlist] = useState<string[]>(() => loadWishlist(username));

  // Reload data when user switches
  useEffect(() => {
    setAllDailyLogs(loadDailyLog(username));
    setWishlist(loadWishlist(username));
    setCart([]);
    setSelectedCategory(null);
  }, [username]);

  useEffect(() => {
    localStorage.setItem(dailyLogKey(username), JSON.stringify(allDailyLogs));
  }, [allDailyLogs, username]);

  useEffect(() => {
    localStorage.setItem(wishlistKey(username), JSON.stringify(wishlist));
  }, [wishlist, username]);

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

  const removeFromCart = (index: number) => setCart(prev => prev.filter((_, i) => i !== index));
  const clearCart = () => setCart([]);

  const logFromCart = () => {
    const entries: DailyLogEntry[] = cart.map(item => {
      const ac = item.selectedAddons.reduce((s, a) => s + a.calories, 0);
      const ap = item.selectedAddons.reduce((s, a) => s + a.protein, 0);
      const ab = item.selectedAddons.reduce((s, a) => s + a.carbs, 0);
      const af = item.selectedAddons.reduce((s, a) => s + a.fat, 0);
      return {
        recipe: item.recipe,
        selectedAddons: item.selectedAddons,
        quantity: item.quantity,
        loggedAt: new Date().toISOString(),
        totalCalories: (item.recipe.calories + ac) * item.quantity,
        totalProtein: (item.recipe.protein + ap) * item.quantity,
        totalCarbs: (item.recipe.carbs + ab) * item.quantity,
        totalFat: (item.recipe.fat + af) * item.quantity,
      };
    });
    const key = todayKey();
    setAllDailyLogs(prev => ({ ...prev, [key]: [...(prev[key] ?? []), ...entries] }));
    clearCart();
  };

  const clearTodayLog = () => {
    const key = todayKey();
    setAllDailyLogs(prev => { const u = { ...prev }; delete u[key]; return u; });
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
      totalCartItems, wishlist, toggleWishlist,
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
