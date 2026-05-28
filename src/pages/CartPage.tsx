import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { CartItem } from '../context/AppContext';
import { allAddons } from '../data/recipes';
import type { Addon } from '../data/recipes';
import { ArrowLeft, Trash2, ShoppingBag, ChefHat, Pencil, Check, X, Search } from 'lucide-react';
import BottomNav from '../components/BottomNav';

function EditModal({ item, onSave, onClose }: {
  item: CartItem;
  onSave: (addons: Addon[], scales: Record<number, number>) => void;
  onClose: () => void;
}) {
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>(item.selectedAddons);
  const [ingredientScales, setIngredientScales] = useState<Record<number, number>>(item.ingredientScales ?? {});
  const [addonSearch, setAddonSearch] = useState('');
  const [tab, setTab] = useState<'addons' | 'ingredients'>('addons');

  const getScale = (i: number) => ingredientScales[i] ?? 1;
  const cycleScale = (i: number) => {
    const cur = getScale(i);
    const next = cur === 1 ? 0.5 : cur === 0.5 ? 0 : 1;
    setIngredientScales(prev => ({ ...prev, [i]: next }));
  };
  const scaleLabel = (s: number) => s === 0 ? 'Removed' : s === 0.5 ? '½' : 'Full';
  const scaleBg = (s: number) => s === 0 ? 'bg-red-500/20 text-red-400' : s === 0.5 ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-[#7a9a78]';

  const toggle = (addon: Addon) => {
    setSelectedAddons(prev =>
      prev.find(a => a.id === addon.id) ? prev.filter(a => a.id !== addon.id) : [...prev, addon]
    );
  };

  // Sort: selected first, then alphabetical
  const sortedAddons = (list: Addon[]) => {
    const filtered = addonSearch
      ? list.filter(a => a.name.toLowerCase().includes(addonSearch.toLowerCase()))
      : list;
    return [...filtered].sort((a, b) => {
      const aSelected = !!selectedAddons.find(x => x.id === a.id);
      const bSelected = !!selectedAddons.find(x => x.id === b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });
  };

  const veganList = sortedAddons(allAddons.filter(a => a.addonCategory === 'vegan'));
  const nonVeganList = sortedAddons(allAddons.filter(a => a.addonCategory === 'non-vegan'));

  const AddonCard = ({ addon }: { addon: Addon }) => {
    const isSelected = !!selectedAddons.find(a => a.id === addon.id);
    const color = addon.addonCategory === 'vegan' ? '#4CAF50' : '#FF8C42';
    return (
      <button onClick={() => toggle(addon)}
        className={`w-full p-3 rounded-xl border text-left transition-all ${isSelected ? '' : 'border-white/10 bg-[#0f1a0f]'}`}
        style={isSelected ? { borderColor: color, background: `${color}15` } : {}}>
        <div className="flex items-start justify-between mb-1">
          <span className="text-lg">{addon.emoji}</span>
          {isSelected && (
            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: color }}>
              <Check className="w-2.5 h-2.5 text-white" />
            </div>
          )}
        </div>
        <p className="text-white text-xs font-semibold">{addon.name}</p>
        <p className="text-[#4a6b48] text-[10px]">{addon.portionLabel}</p>
        <p className="text-[#6a8a68] text-[10px]">{addon.calories} kcal</p>
      </button>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end"
      onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full bg-[#141f13] rounded-t-3xl max-h-[88vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Handle + header */}
        <div className="px-5 pt-4 pb-3 border-b border-white/5 flex-shrink-0">
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              Edit — {item.recipe.name}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-3">
            {(['addons', 'ingredients'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${tab === t ? 'bg-[#4CAF50] text-white' : 'bg-white/5 text-[#6a8a68]'}`}>
                {t === 'addons' ? '✨ Add-ons' : '🛒 Ingredients'}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {tab === 'addons' && (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a6b48]" />
                <input type="text" placeholder="Search add-ons..." value={addonSearch}
                  onChange={e => setAddonSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#4a6b48] outline-none focus:border-[#4CAF50]/40" />
                {addonSearch && (
                  <button onClick={() => setAddonSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-4 h-4 text-[#4a6b48]" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-bold text-[#4CAF50] uppercase tracking-wider mb-2">🌱 Vegan</p>
                  <div className="space-y-2">{veganList.map(a => <AddonCard key={a.id} addon={a} />)}</div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#FF8C42] uppercase tracking-wider mb-2">🍖 Non-Vegan</p>
                  <div className="space-y-2">{nonVeganList.map(a => <AddonCard key={a.id} addon={a} />)}</div>
                </div>
              </div>
            </>
          )}

          {tab === 'ingredients' && (
            <div className="space-y-2">
              <p className="text-[#6a8a68] text-xs mb-3">Tap an ingredient to adjust its portion. Changes will affect calorie calculation.</p>
              {item.recipe.ingredients.map((ing, i) => {
                const scale = getScale(i);
                return (
                  <div key={i} className={`flex items-center justify-between gap-2 p-3 rounded-xl bg-white/5 transition-opacity ${scale === 0 ? 'opacity-40' : ''}`}>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: scale === 0 ? '#6a8a68' : '#4CAF50' }} />
                      <span className={`text-sm flex-1 ${scale === 0 ? 'line-through text-[#4a6b48]' : 'text-[#c5d9c3]'}`}>{ing}</span>
                    </div>
                    <button onClick={() => cycleScale(i)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg font-medium flex-shrink-0 ${scaleBg(scale)}`}>
                      {scaleLabel(scale)}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="px-5 py-4 border-t border-white/5 flex-shrink-0">
          <button onClick={() => { onSave(selectedAddons, ingredientScales); onClose(); }}
            className="w-full py-3.5 rounded-2xl font-bold text-white bg-[#4CAF50] flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CartPage() {
  const { cart, removeFromCart, updateCartItem, logFromCart, totalCartItems } = useApp();
  const navigate = useNavigate();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const totalCalories = cart.reduce((s, i) => {
    return s + (i.recipe.calories + i.selectedAddons.reduce((a, b) => a + b.calories, 0)) * i.quantity;
  }, 0);
  const totalProtein = cart.reduce((s, i) => {
    return s + (i.recipe.protein + i.selectedAddons.reduce((a, b) => a + b.protein, 0)) * i.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-[#0f1a0f] pb-24">
      <div className="sticky top-0 z-20 bg-[#0f1a0f]/95 backdrop-blur-sm border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>🛒 Cart</h1>
            <p className="text-xs text-[#6a8a68]">{totalCartItems} item selected</p>
          </div>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-white font-bold text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>Your cart is empty</h2>
          <p className="text-[#6a8a68] text-sm mt-2">Add some recipes to get started!</p>
          <button onClick={() => navigate('/recipes')} className="mt-6 px-6 py-3 bg-[#4CAF50] text-white rounded-xl font-semibold">
            Browse Recipes
          </button>
        </div>
      ) : (
        <>
          <div className="px-4 pt-4 space-y-3">
            <AnimatePresence>
              {cart.map((item, i) => {
                const itemCals = (item.recipe.calories + item.selectedAddons.reduce((s, a) => s + a.calories, 0)) * item.quantity;
                const itemProt = (item.recipe.protein + item.selectedAddons.reduce((s, a) => s + a.protein, 0)) * item.quantity;
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-[#141f13] rounded-2xl p-4 border border-white/5">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.recipe.image} alt={item.recipe.name}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=100'; }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="text-white font-semibold text-sm leading-tight">{item.recipe.emoji} {item.recipe.name}</h3>
                          <div className="flex gap-1 flex-shrink-0">
                            <button onClick={() => setEditingIndex(i)}
                              className="w-7 h-7 rounded-lg bg-[#4CAF50]/15 flex items-center justify-center">
                              <Pencil className="w-3.5 h-3.5 text-[#4CAF50]" />
                            </button>
                            <button onClick={() => removeFromCart(i)}
                              className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[#6a8a68] text-xs mt-0.5">{itemCals} kcal · {itemProt}g protein</p>
                        {item.selectedAddons.length > 0 ? (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {item.selectedAddons.map(a => (
                              <span key={a.id} className="text-[10px] bg-[#4CAF50]/15 text-[#7bc97e] px-1.5 py-0.5 rounded-full border border-[#4CAF50]/20">
                                {a.emoji} {a.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[#3a5a38] text-[10px] mt-1">No add-ons · tap ✏️ to add</p>
                        )}
                        <p className="text-[#3a5a38] text-[10px] mt-1">×{item.quantity}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="px-4 mt-4">
            <div className="bg-[#141f13] rounded-2xl p-4 border border-white/5">
              <h3 className="text-[#7a9a78] text-xs font-medium uppercase tracking-wider mb-3">Nutrition Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#4CAF50]/10 rounded-xl p-3 border border-[#4CAF50]/20">
                  <p className="text-2xl font-bold text-white">{totalCalories}</p>
                  <p className="text-[#7bc97e] text-xs">Total Calories (kcal)</p>
                </div>
                <div className="bg-[#4fa3d1]/10 rounded-xl p-3 border border-[#4fa3d1]/20">
                  <p className="text-2xl font-bold text-white">{totalProtein}g</p>
                  <p className="text-[#7baed1] text-xs">Total Protein</p>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => { logFromCart(); navigate('/summary'); }}
                className="w-full py-4 rounded-2xl font-bold text-white text-base bg-[#4CAF50] flex items-center justify-center gap-2">
                <ChefHat className="w-5 h-5" /> Log to Daily Summary
              </motion.button>
              <button onClick={() => navigate('/recipes')}
                className="w-full py-3 rounded-2xl font-medium text-[#7bc97e] text-sm bg-[#4CAF50]/10 border border-[#4CAF50]/20 flex items-center justify-center gap-2">
                <ShoppingBag className="w-4 h-4" /> Add More Recipes
              </button>
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {editingIndex !== null && (
          <EditModal
            item={cart[editingIndex]}
            onSave={(addons, scales) => updateCartItem(editingIndex, addons, scales)}
            onClose={() => setEditingIndex(null)}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
