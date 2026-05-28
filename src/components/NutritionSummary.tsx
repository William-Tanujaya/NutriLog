import { MealEntry, calculateNutrition } from "@/data/foods";
import { motion } from "framer-motion";

interface NutritionSummaryProps {
  entries: MealEntry[];
}

export function NutritionSummary({ entries }: NutritionSummaryProps) {
  const totals = entries.reduce(
    (acc, entry) => {
      const n = calculateNutrition(entry.food, entry.grams);
      return {
        calories: acc.calories + n.calories,
        protein: +(acc.protein + n.protein).toFixed(1),
        carbs: +(acc.carbs + n.carbs).toFixed(1),
        fat: +(acc.fat + n.fat).toFixed(1),
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const macros = [
    { label: "Calories", value: totals.calories, unit: "kcal", color: "bg-calories" },
    { label: "Protein", value: totals.protein, unit: "g", color: "bg-protein" },
    { label: "Carbs", value: totals.carbs, unit: "g", color: "bg-carbs" },
    { label: "Fat", value: totals.fat, unit: "g", color: "bg-fat" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {macros.map((macro) => (
        <motion.div
          key={macro.label}
          layout
          className="relative overflow-hidden rounded-xl border border-border bg-card p-4"
        >
          <div className={`absolute top-0 left-0 w-1 h-full ${macro.color}`} />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {macro.label}
          </p>
          <motion.p
            key={macro.value}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold font-display text-foreground mt-1"
          >
            {macro.value}
            <span className="text-sm font-normal text-muted-foreground ml-1">{macro.unit}</span>
          </motion.p>
        </motion.div>
      ))}
    </div>
  );
}
