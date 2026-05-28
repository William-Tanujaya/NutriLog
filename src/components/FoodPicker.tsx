import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FoodItem, foodDatabase } from "@/data/foods";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FoodPickerProps {
  onAddFood: (food: FoodItem, grams: number) => void;
}

const categories = [
  { key: "all", label: "All" },
  { key: "protein", label: "🥩 Protein" },
  { key: "grain", label: "🌾 Grains" },
  { key: "fruit", label: "🍎 Fruit" },
  { key: "vegetable", label: "🥬 Veggies" },
  { key: "dairy", label: "🥛 Dairy" },
];

export function FoodPicker({ onAddFood }: FoodPickerProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [grams, setGrams] = useState("100");

  const filtered = foodDatabase.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || f.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleAdd = () => {
    if (selectedFood && Number(grams) > 0) {
      onAddFood(selectedFood, Number(grams));
      setSelectedFood(null);
      setGrams("100");
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search foods..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              category === cat.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((food) => (
            <motion.button
              layout
              key={food.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setSelectedFood(food)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedFood?.id === food.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <span className="text-2xl">{food.emoji}</span>
              <p className="text-sm font-medium mt-1 text-foreground leading-tight">{food.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {food.caloriesPer100g} kcal / 100g
              </p>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedFood && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
          >
            <span className="text-3xl">{selectedFood.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{selectedFood.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="number"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  className="w-20 h-8 text-sm bg-background"
                  min="1"
                />
                <span className="text-sm text-muted-foreground">grams</span>
              </div>
            </div>
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
            >
              Add
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
