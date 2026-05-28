import { useState } from "react";
import { FoodItem, MealEntry } from "@/data/foods";
import { FoodPicker } from "@/components/FoodPicker";
import { MealList } from "@/components/MealList";
import { NutritionSummary } from "@/components/NutritionSummary";
import { Leaf } from "lucide-react";

const Index = () => {
  const [entries, setEntries] = useState<MealEntry[]>([]);

  const handleAddFood = (food: FoodItem, grams: number) => {
    const existing = entries.find((e) => e.food.id === food.id);
    if (existing) {
      setEntries(entries.map((e) => (e.id === existing.id ? { ...e, grams: e.grams + grams } : e)));
    } else {
      setEntries([...entries, { id: crypto.randomUUID(), food, grams }]);
    }
  };

  const handleUpdateGrams = (id: string, grams: number) => {
    setEntries(entries.map((e) => (e.id === id ? { ...e, grams } : e)));
  };

  const handleRemove = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-display font-bold text-foreground">NutriLog</h1>
          </div>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        <section>
          <h2 className="text-lg font-display font-semibold text-foreground mb-3">Daily Summary</h2>
          <NutritionSummary entries={entries} />
        </section>

        <section>
          <h2 className="text-lg font-display font-semibold text-foreground mb-3">Add Food</h2>
          <FoodPicker onAddFood={handleAddFood} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display font-semibold text-foreground">
              Today's Meals
            </h2>
            {entries.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {entries.length} item{entries.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <MealList entries={entries} onUpdateGrams={handleUpdateGrams} onRemove={handleRemove} />
        </section>
      </main>
    </div>
  );
};

export default Index;
