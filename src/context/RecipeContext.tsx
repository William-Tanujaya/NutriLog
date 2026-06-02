import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { recipes as defaultRecipes } from '../data/recipes';
import type { Recipe } from '../data/recipes';

export const RECIPES_KEY = 'nutrilog_recipes';

const cp1252Bytes = new Map<number, number>([
  [0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84],
  [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88],
  [0x2030, 0x89], [0x0160, 0x8a], [0x2039, 0x8b], [0x0152, 0x8c],
  [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92], [0x201c, 0x93],
  [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b],
  [0x0153, 0x9c], [0x017e, 0x9e], [0x0178, 0x9f],
]);

const mojibakePattern = /[ðâÂÃ�]|[\u0080-\u009f]/;

const encodeWindows1252 = (value: string) => {
  const bytes: number[] = [];

  for (const char of value) {
    const code = char.codePointAt(0);
    if (code === undefined) continue;
    if (code <= 0xff) {
      bytes.push(code);
      continue;
    }

    const byte = cp1252Bytes.get(code);
    if (byte === undefined) throw new Error('Unsupported mojibake byte');
    bytes.push(byte);
  }

  return new Uint8Array(bytes);
};

const repairText = (value: string): string => {
  if (!mojibakePattern.test(value)) return value;
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(encodeWindows1252(value));
  } catch {
    return value;
  }
};

const repairDeep = (value: unknown): unknown => {
  if (typeof value === 'string') return repairText(value);
  if (Array.isArray(value)) return value.map(repairDeep);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, repairDeep(entry)]),
    );
  }
  return value;
};

const isRecipe = (value: unknown): value is Recipe => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Recipe>;
  return typeof candidate.id === 'string'
    && typeof candidate.name === 'string'
    && typeof candidate.category === 'string';
};

const normalizeStoredRecipes = (stored: Recipe[]) => {
  const repaired = stored.map(recipe => repairDeep(recipe)).filter(isRecipe);
  const storedDefaults = new Map(
    repaired
      .filter(recipe => !recipe.id.startsWith('custom_'))
      .map(recipe => [recipe.id, recipe]),
  );
  const customRecipes = repaired.filter(recipe => recipe.id.startsWith('custom_'));

  const normalizedDefaults = defaultRecipes.map(defaultRecipe => {
    const storedRecipe = storedDefaults.get(defaultRecipe.id);
    if (!storedRecipe) return defaultRecipe;

    return {
      ...storedRecipe,
      image: defaultRecipe.image,
      emoji: defaultRecipe.emoji,
    };
  });

  return [...normalizedDefaults, ...customRecipes];
};

const saveRecipes = (recipes: Recipe[]) => {
  localStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
};

const loadRecipes = (): Recipe[] => {
  try {
    const raw = localStorage.getItem(RECIPES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const normalized = normalizeStoredRecipes(parsed);
        saveRecipes(normalized);
        return normalized;
      }
    }

    saveRecipes(defaultRecipes);
    return defaultRecipes;
  } catch {
    return defaultRecipes;
  }
};

interface RecipeContextType {
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  resetToDefault: () => void;
}

const RecipeContext = createContext<RecipeContextType | null>(null);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>(loadRecipes);

  useEffect(() => {
    saveRecipes(recipes);
  }, [recipes]);

  const addRecipe = (recipe: Omit<Recipe, 'id'>) => {
    const newRecipe: Recipe = repairDeep({ ...recipe as Recipe, id: `custom_${Date.now()}` }) as Recipe;
    setRecipes(prev => [...prev, newRecipe]);
  };

  const updateRecipe = (id: string, updates: Partial<Recipe>) => {
    setRecipes(prev => prev.map(r => r.id === id ? repairDeep({ ...r, ...updates }) as Recipe : r));
  };

  const deleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  const resetToDefault = () => {
    setRecipes(defaultRecipes);
    saveRecipes(defaultRecipes);
  };

  return (
    <RecipeContext.Provider value={{ recipes, addRecipe, updateRecipe, deleteRecipe, resetToDefault }}>
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error('useRecipes must be inside RecipeProvider');
  return ctx;
}
