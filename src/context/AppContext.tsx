import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Category, Recipe, Addon } from '../data/recipes';
import { useAuth } from './AuthContext';

export interface CartItem {
  recipe: Recipe;
  selectedAddons: Addon[];
  quantity: number;
  ingredientScales: Record<number, number>;
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
const dailyLogKey = (u: string) => `nutrilog_daily_log_${u}`;
const wishlistKey = (u: string) => `nutrilog_wishlist_${u}`;

const loadDailyLog = (u: string): DailyLogStore => {
  try { return JSON.parse(localStorage.getItem(dailyLogKey(u)) || '{}'); } catch { return {}; }
};
const loadWishlist = (u: string): string[] => {
  try { return JSON.parse(localStorage.getItem(wishlistKey(u)) || '[]'); } catch { return []; }
};

interface AppContextType {
  selectedCategory: Category | null;
  setSelectedCategory: (cat: Category) => void;
  cart: CartItem[];
  addToCart: (recipe: Recipe, addons: Addon[], ingredientScales: Record<number, number>) => void;
  updateCartItem: (index: number, addons: Addon[], ingredientScales: Record<number, number>) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  dailyLog: DailyLogEntry[];
  allDailyLogs: DailyLogStore;
  logFromCart: () => void;
  clearTodayLog: () => void;
  deleteLogEntry: (index: number) => void;
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

  const addToCart = (recipe: Recipe, addons: Addon[], ingredientScales: Record<number, number>) => {
    setCart(prev => [...prev, { recipe, selectedAddons: addons, quantity: 1, ingredientScales }]);
  };

  const updateCartItem = (index: number, addons: Addon[], ingredientScales: Record<number, number>) => {
    setCart(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], selectedAddons: addons, ingredientScales };
      return updated;
    });
  };

  const removeFromCart = (index: number) => setCart(prev => prev.filter((_, i) => i !== index));
  const clearCart = () => setCart([]);

  const logFromCart = () => {
    const entries: DailyLogEntry[] = cart.map(item => {
      const avgScale = item.recipe.ingredients.length > 0
        ? Object.keys(item.ingredientScales).length > 0
          ? item.recipe.ingredients.reduce((s, _, i) => s + (item.ingredientScales[i] ?? 1), 0) / item.recipe.ingredients.length
          : 1
        : 1;
      const ac = item.selectedAddons.reduce((s, a) => s + a.calories, 0);
      const ap = item.selectedAddons.reduce((s, a) => s + a.protein, 0);
      const ab = item.selectedAddons.reduce((s, a) => s + a.carbs, 0);
      const af = item.selectedAddons.reduce((s, a) => s + a.fat, 0);
      return {
        recipe: item.recipe,
        selectedAddons: item.selectedAddons,
        quantity: item.quantity,
        loggedAt: new Date().toISOString(),
        totalCalories: Math.round((item.recipe.calories * avgScale + ac) * item.quantity),
        totalProtein: Math.round((item.recipe.protein * avgScale + ap) * item.quantity),
        totalCarbs: Math.round((item.recipe.carbs * avgScale + ab) * item.quantity),
        totalFat: Math.round((item.recipe.fat * avgScale + af) * item.quantity),
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

  const deleteLogEntry = (index: number) => {
    const key = todayKey();
    setAllDailyLogs(prev => ({
      ...prev,
      [key]: (prev[key] ?? []).filter((_, i) => i !== index),
    }));
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
      dailyLog, allDailyLogs, logFromCart, clearTodayLog, deleteLogEntry,
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
