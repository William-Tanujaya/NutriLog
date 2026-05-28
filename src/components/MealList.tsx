import { motion, AnimatePresence } from "framer-motion";
import { MealEntry, calculateNutrition } from "@/data/foods";
import { Trash2, Minus, Plus } from "lucide-react";

interface MealListProps {
  entries: MealEntry[];
  onUpdateGrams: (id: string, grams: number) => void;
  onRemove: (id: string) => void;
}

export function MealList({ entries, onUpdateGrams, onRemove }: MealListProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-4xl mb-3">🍽️</p>
        <p className="font-medium">No foods added yet</p>
        <p className="text-sm mt-1">Pick foods above to start tracking</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {entries.map((entry) => {
          const nutrition = calculateNutrition(entry.food, entry.grams);
          return (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
            >
              <span className="text-2xl shrink-0">{entry.food.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{entry.food.name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="text-calories font-semibold">{nutrition.calories} kcal</span>
                  <span>P {nutrition.protein}g</span>
                  <span>C {nutrition.carbs}g</span>
                  <span>F {nutrition.fat}g</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => onUpdateGrams(entry.id, Math.max(10, entry.grams - 10))}
                  className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-sm font-medium w-12 text-center text-foreground">{entry.grams}g</span>
                <button
                  onClick={() => onUpdateGrams(entry.id, entry.grams + 10)}
                  className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                onClick={() => onRemove(entry.id)}
                className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
