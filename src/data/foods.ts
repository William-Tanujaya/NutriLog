export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  category: "grain" | "protein" | "fruit" | "vegetable" | "dairy" | "other";
  /** Nutrition per 100g */
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

export interface MealEntry {
  id: string;
  food: FoodItem;
  grams: number;
}

export const foodDatabase: FoodItem[] = [
  {
    id: "white-rice",
    name: "White Rice (cooked)",
    emoji: "🍚",
    category: "grain",
    caloriesPer100g: 130,
    proteinPer100g: 2.7,
    carbsPer100g: 28.2,
    fatPer100g: 0.3,
  },
  {
    id: "chicken-breast",
    name: "Chicken Breast",
    emoji: "🍗",
    category: "protein",
    caloriesPer100g: 165,
    proteinPer100g: 31,
    carbsPer100g: 0,
    fatPer100g: 3.6,
  },
  {
    id: "egg",
    name: "Egg (whole)",
    emoji: "🥚",
    category: "protein",
    caloriesPer100g: 155,
    proteinPer100g: 13,
    carbsPer100g: 1.1,
    fatPer100g: 11,
  },
  {
    id: "tofu",
    name: "Tofu (firm)",
    emoji: "🧈",
    category: "protein",
    caloriesPer100g: 76,
    proteinPer100g: 8,
    carbsPer100g: 1.9,
    fatPer100g: 4.8,
  },
  {
    id: "tempeh",
    name: "Tempeh",
    emoji: "🫘",
    category: "protein",
    caloriesPer100g: 192,
    proteinPer100g: 20,
    carbsPer100g: 7.6,
    fatPer100g: 11,
  },
  {
    id: "banana",
    name: "Banana",
    emoji: "🍌",
    category: "fruit",
    caloriesPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 22.8,
    fatPer100g: 0.3,
  },
  {
    id: "oats",
    name: "Oats (dry)",
    emoji: "🥣",
    category: "grain",
    caloriesPer100g: 389,
    proteinPer100g: 16.9,
    carbsPer100g: 66.3,
    fatPer100g: 6.9,
  },
  {
    id: "broccoli",
    name: "Broccoli",
    emoji: "🥦",
    category: "vegetable",
    caloriesPer100g: 34,
    proteinPer100g: 2.8,
    carbsPer100g: 7,
    fatPer100g: 0.4,
  },
  {
    id: "salmon",
    name: "Salmon",
    emoji: "🐟",
    category: "protein",
    caloriesPer100g: 208,
    proteinPer100g: 20,
    carbsPer100g: 0,
    fatPer100g: 13,
  },
  {
    id: "sweet-potato",
    name: "Sweet Potato",
    emoji: "🍠",
    category: "vegetable",
    caloriesPer100g: 86,
    proteinPer100g: 1.6,
    carbsPer100g: 20,
    fatPer100g: 0.1,
  },
  {
    id: "avocado",
    name: "Avocado",
    emoji: "🥑",
    category: "fruit",
    caloriesPer100g: 160,
    proteinPer100g: 2,
    carbsPer100g: 8.5,
    fatPer100g: 14.7,
  },
  {
    id: "greek-yogurt",
    name: "Greek Yogurt",
    emoji: "🥛",
    category: "dairy",
    caloriesPer100g: 59,
    proteinPer100g: 10,
    carbsPer100g: 3.6,
    fatPer100g: 0.7,
  },
];

export function calculateNutrition(food: FoodItem, grams: number) {
  const factor = grams / 100;
  return {
    calories: Math.round(food.caloriesPer100g * factor),
    protein: +(food.proteinPer100g * factor).toFixed(1),
    carbs: +(food.carbsPer100g * factor).toFixed(1),
    fat: +(food.fatPer100g * factor).toFixed(1),
  };
}
