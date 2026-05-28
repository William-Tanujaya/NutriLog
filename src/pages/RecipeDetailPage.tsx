import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { recipes, veganAddons, nonVeganAddons } from '../data/recipes';
import type { Addon } from '../data/recipes';
import { useApp } from '../context/AppContext';
import {
  Clock, ChefHat, Flame, ArrowLeft, Check,
  ShoppingCart, ChevronDown, ChevronUp, Users,
  Zap, Heart, Search, X, Minus, Plus
} from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const recipe = recipes.find(r => r.id === id);
  const { addToCart, totalCartItems, wishlist, toggleWishlist } = useApp();
  const navigate = useNavigate();

  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showIngredients, setShowIngredients] = useState(false);
  const [added, setAdded] = useState(false);
  const [addonSearch, setAddonSearch] = useState('');
  // ingredientScales: index -> multiplier (0 = removed, 0.5 = half, 1 = full)
  const [ingredientScales, setIngredientScales] = useState<Record<number, number>>({});

  if (!recipe) return (
    <div className="min-h-screen bg-[#0f1a0f] flex items-center justify-center">
      <p className="text-[#6a8a68]">Recipe not found</p>
    </div>
  );

  const isVegan = recipe.category === 'vegan';
  const accent = isVegan ? '#4CAF50' : '#FF8C42';
  const accentLight = isVegan ? '#7bc97e' : '#d4956a';
  const isWishlisted = wishlist.includes(recipe.id);

  // Ingredient scaling logic
  const getScale = (i: number) => ingredientScales[i] ?? 1;
  const avgScale = recipe.ingredients.length > 0
    ? recipe.ingredients.reduce((s, _, i) => s + getScale(i), 0) / recipe.ingredients.length
    : 1;
  const cycleScale = (i: number) => {
    const cur = getScale(i);
    const next = cur === 1 ? 0.5 : cur === 0.5 ? 0 : 1;
    setIngredientScales(prev => ({ ...prev, [i]: next }));
  };

  const scaledCalories = Math.round(recipe.calories * avgScale);
  const scaledProtein = Math.round(recipe.protein * avgScale);
  const scaledCarbs = Math.round(recipe.carbs * avgScale);
  const scaledFat = Math.round(recipe.fat * avgScale);

  const addonCalories = selectedAddons.reduce((s, a) => s + a.calories, 0);
  const addonProtein = selectedAddons.reduce((s, a) => s + a.protein, 0);
  const addonCarbs = selectedAddons.reduce((s, a) => s + a.carbs, 0);
  const addonFat = selectedAddons.reduce((s, a) => s + a.fat, 0);

  const totalCalories = scaledCalories + addonCalories;
  const totalProtein = scaledProtein + addonProtein;
  const totalCarbs = scaledCarbs + addonCarbs;
  const totalFat = scaledFat + addonFat;

  const filterAddons = (list: Addon[]) =>
    addonSearch === '' ? list : list.filter(a => a.name.toLowerCase().includes(addonSearch.toLowerCase()));

  const filteredVegan = filterAddons(veganAddons);
  const filteredNonVegan = filterAddons(nonVeganAddons);

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons(prev =>
      prev.find(a => a.id === addon.id) ? prev.filter(a => a.id !== addon.id) : [...prev, addon]
    );
  };

  const handleAddToCart = () => {
    addToCart(recipe, selectedAddons);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const scaleLabel = (s: number) => s === 0 ? 'Removed' : s === 0.5 ? '½' : 'Full';
  const scaleBg = (s: number) => s === 0 ? 'bg-red-500/20 text-red-400' : s === 0.5 ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-[#7a9a78]';

  return (
    <div className="min-h-screen bg-[#0f1a0f] pb-28">
      {/* Hero */}
      <div className="relative h-72">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-full object-cover object-center"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=100'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#0f1a0f]" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <button onClick={() => toggleWishlist(recipe.id)} className="absolute top-4 right-14 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-400 text-red-400' : 'text-white'}`} />
        </button>
        {totalCartItems > 0 && (
          <button onClick={() => navigate('/cart')} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF8C42] rounded-full text-white text-[10px] flex items-center justify-center font-bold">{totalCartItems}</span>
          </button>
        )}
      </div>

      <div className="px-4 -mt-4 relative">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-xs font-medium tracking-wider uppercase" style={{ color: accent }}>
            {recipe.category === 'vegan' ? '🌱 Vegan' : '🍖 Non-Vegan'} · {recipe.difficulty}
          </span>
          <h1 className="text-2xl font-bold text-white mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>
            {recipe.name}
          </h1>
          <p className="text-[#7a9a78] text-sm mt-1">{recipe.description}</p>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { icon: <Clock className="w-4 h-4" />, label: 'Total', val: `${recipe.prepTime + recipe.cookTime}m` },
            { icon: <Users className="w-4 h-4" />, label: 'Servings', val: `${recipe.servings}` },
            { icon: <Flame className="w-4 h-4" />, label: 'Kcal', val: `${totalCalories}` },
            { icon: <Zap className="w-4 h-4" />, label: 'Protein', val: `${totalProtein}g` },
          ].map(s => (
            <div key={s.label} className="bg-[#141f13] rounded-xl p-2.5 text-center border border-white/5">
              <div className="flex justify-center mb-1" style={{ color: accentLight }}>{s.icon}</div>
              <p className="text-white text-sm font-bold">{s.val}</p>
              <p className="text-[#4a6b48] text-[10px]">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Nutrition */}
        {avgScale < 1 && (
          <div className="mt-2 text-center text-xs text-amber-400 bg-amber-500/10 rounded-xl py-2 border border-amber-500/20">
            ⚠️ Nutrition adjusted to {Math.round(avgScale * 100)}% based on ingredient changes
          </div>
        )}
        <div className="mt-4 bg-[#141f13] rounded-2xl p-4 border border-white/5">
          <p className="text-[#7a9a78] text-xs font-medium mb-3 uppercase tracking-wider">Nutrition Info</p>
          <div className="space-y-2.5">
            {[
              { label: 'Protein', val: totalProtein, max: 60, color: accent },
              { label: 'Carbs', val: totalCarbs, max: 100, color: '#4fa3d1' },
              { label: 'Fat', val: totalFat, max: 50, color: '#d4a030' },
              { label: 'Fiber', val: recipe.fiber, max: 30, color: '#7bc97e' },
            ].map(n => (
              <div key={n.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#7a9a78]">{n.label}</span>
                  <span className="text-white font-medium">{n.val}g</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((n.val / n.max) * 100, 100)}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full rounded-full"
                    style={{ background: n.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ingredients with scaling */}
        <div className="mt-4 bg-[#141f13] rounded-2xl overflow-hidden border border-white/5">
          <button onClick={() => setShowIngredients(v => !v)} className="w-full flex items-center justify-between p-4">
            <div>
              <span className="text-white font-semibold">🛒 Ingredients ({recipe.ingredients.length})</span>
              <p className="text-[#4a6b48] text-xs mt-0.5">Tap ingredient to adjust portion</p>
            </div>
            {showIngredients ? <ChevronUp className="w-4 h-4 text-[#6a8a68]" /> : <ChevronDown className="w-4 h-4 text-[#6a8a68]" />}
          </button>
          <AnimatePresence>
            {showIngredients && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="px-4 pb-4 space-y-2">
                  {recipe.ingredients.map((ing, i) => {
                    const scale = getScale(i);
                    return (
                      <div key={i} className={`flex items-center justify-between gap-2 p-2 rounded-xl transition-colors ${scale === 0 ? 'opacity-40' : ''}`}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: scale === 0 ? '#6a8a68' : accent }} />
                          <span className={`text-sm ${scale === 0 ? 'line-through text-[#4a6b48]' : 'text-[#c5d9c3]'}`}>{ing}</span>
                        </div>
                        <button
                          onClick={() => cycleScale(i)}
                          className={`text-[10px] px-2 py-1 rounded-lg font-medium flex-shrink-0 ${scaleBg(scale)}`}
                        >
                          {scaleLabel(scale)}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cooking steps */}
        <div className="mt-4 bg-[#141f13] rounded-2xl overflow-hidden border border-white/5">
          <button onClick={() => setShowInstructions(v => !v)} className="w-full flex items-center justify-between p-4">
            <span className="text-white font-semibold">👨‍🍳 How to Cook ({recipe.steps.length} steps)</span>
            {showInstructions ? <ChevronUp className="w-4 h-4 text-[#6a8a68]" /> : <ChevronDown className="w-4 h-4 text-[#6a8a68]" />}
          </button>
          <AnimatePresence>
            {showInstructions && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <div className="px-4 pb-4 space-y-4">
                  {recipe.steps.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" style={{ background: accent }}>
                        {i + 1}
                      </div>
                      <p className="text-[#c5d9c3] text-sm leading-relaxed pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Add-ons */}
        <div className="mt-4">
          <h2 className="text-white font-semibold mb-1">✨ Add-ons</h2>
          <p className="text-[#6a8a68] text-xs mb-3">Choose extras to complete your meal</p>

          {/* Addon search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a6b48]" />
            <input
              type="text"
              placeholder="Search add-ons..."
              value={addonSearch}
              onChange={e => setAddonSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-[#4a6b48] outline-none focus:border-[#4CAF50]/40"
            />
            {addonSearch && (
              <button onClick={() => setAddonSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-[#4a6b48]" />
              </button>
            )}
          </div>

          {/* Two columns: Vegan | Non-Vegan */}
          <div className="grid grid-cols-2 gap-3">
            {/* Vegan column */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] font-bold text-[#4CAF50] uppercase tracking-wider">🌱 Vegan</span>
              </div>
              <div className="space-y-2">
                {filteredVegan.map(addon => {
                  const isSelected = !!selectedAddons.find(a => a.id === addon.id);
                  return (
                    <motion.button
                      key={addon.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggleAddon(addon)}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${isSelected ? 'border-[#4CAF50] bg-[#4CAF50]/10' : 'border-white/10 bg-[#141f13]'}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xl">{addon.emoji}</span>
                        {isSelected && <div className="w-4 h-4 rounded-full bg-[#4CAF50] flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>}
                      </div>
                      <p className="text-white text-xs font-semibold leading-tight">{addon.name}</p>
                      <p className="text-[#4a6b48] text-[10px] mt-0.5">{addon.portionLabel}</p>
                      <p className="text-[#6a8a68] text-[10px]">{addon.calories} kcal</p>
                    </motion.button>
                  );
                })}
                {filteredVegan.length === 0 && <p className="text-[#4a6b48] text-xs text-center py-2">No results</p>}
              </div>
            </div>

            {/* Non-vegan column */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] font-bold text-[#FF8C42] uppercase tracking-wider">🍖 Non-Vegan</span>
              </div>
              <div className="space-y-2">
                {filteredNonVegan.map(addon => {
                  const isSelected = !!selectedAddons.find(a => a.id === addon.id);
                  return (
                    <motion.button
                      key={addon.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggleAddon(addon)}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${isSelected ? 'border-[#FF8C42] bg-[#FF8C42]/10' : 'border-white/10 bg-[#141f13]'}`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xl">{addon.emoji}</span>
                        {isSelected && <div className="w-4 h-4 rounded-full bg-[#FF8C42] flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white" /></div>}
                      </div>
                      <p className="text-white text-xs font-semibold leading-tight">{addon.name}</p>
                      <p className="text-[#4a6b48] text-[10px] mt-0.5">{addon.portionLabel}</p>
                      <p className="text-[#6a8a68] text-[10px]">{addon.calories} kcal</p>
                    </motion.button>
                  );
                })}
                {filteredNonVegan.length === 0 && <p className="text-[#4a6b48] text-xs text-center py-2">No results</p>}
              </div>
            </div>
          </div>

          {selectedAddons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl p-3 border text-sm"
              style={{ borderColor: `${accent}40`, background: `${accent}10` }}
            >
              <p className="font-medium mb-1" style={{ color: accentLight }}>Selected add-ons:</p>
              <p className="text-[#c5d9c3]">{selectedAddons.map(a => `${a.emoji} ${a.name}`).join(' • ')}</p>
              <p className="mt-1" style={{ color: accentLight }}>Total: {totalCalories} kcal | Protein: {totalProtein}g</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Add to cart */}
      <div className="fixed bottom-16 left-0 right-0 px-4 z-30">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAddToCart}
          className="w-full py-4 rounded-2xl font-bold text-white text-base shadow-lg flex items-center justify-center gap-2 transition-all"
          style={{ background: added ? '#22c55e' : accent }}
        >
          {added ? (
            <><Check className="w-5 h-5" />Added to Cart!</>
          ) : (
            <><ShoppingCart className="w-5 h-5" />Add to Cart{selectedAddons.length > 0 && ` (+${selectedAddons.length} add-ons)`}</>
          )}
        </motion.button>
      </div>

      <BottomNav />
    </div>
  );
}
