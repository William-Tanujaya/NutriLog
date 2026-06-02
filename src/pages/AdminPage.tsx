import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth, USERS_KEY } from '../context/AuthContext';
import { useRecipes } from '../context/RecipeContext';
import type { Recipe } from '../data/recipes';
import {
  ArrowLeft, Users, UtensilsCrossed, BarChart2,
  Trash2, Pencil, Plus, X, Check, RefreshCw,
  ShieldCheck, User
} from 'lucide-react';

type Tab = 'stats' | 'users' | 'recipes';

// ─── Stats Tab ────────────────────────────────────────────────────────────────
function StatsTab() {
  const { recipes } = useRecipes();

  const getAllUsers = () => {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); } catch { return {}; }
  };

  const getAllWishlists = () => {
    const all: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('nutrilog_wishlist_')) {
        try {
          const ids: string[] = JSON.parse(localStorage.getItem(key) || '[]');
          all.push(...ids);
        } catch { /* skip */ }
      }
    }
    return all;
  };

  const users = getAllUsers();
  const wishlists = getAllWishlists();
  const totalUsers = Object.keys(users).length;
  const veganCount = recipes.filter(r => r.category === 'vegan').length;
  const nonVeganCount = recipes.filter(r => r.category === 'non-vegan').length;

  const wishlistCounts = wishlists.reduce<Record<string, number>>((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  const topWishlisted = recipes
    .filter(r => wishlistCounts[r.id])
    .sort((a, b) => (wishlistCounts[b.id] || 0) - (wishlistCounts[a.id] || 0))
    .slice(0, 5);

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: '👥', color: '#4CAF50' },
    { label: 'Total Recipes', value: recipes.length, icon: '🍽️', color: '#4fa3d1' },
    { label: 'Vegan Recipes', value: veganCount, icon: '🌱', color: '#7bc97e' },
    { label: 'Non-Vegan Recipes', value: nonVeganCount, icon: '🍖', color: '#FF8C42' },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-[#141f13] rounded-2xl p-4 border border-white/5">
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[#6a8a68] text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Top wishlisted */}
      <div className="bg-[#141f13] rounded-2xl p-4 border border-white/5">
        <p className="text-white font-semibold mb-3">❤️ Most Wishlisted Recipes</p>
        {topWishlisted.length === 0 ? (
          <p className="text-[#4a6b48] text-sm">No wishlist data yet</p>
        ) : (
          <div className="space-y-2">
            {topWishlisted.map((r, i) => (
              <div key={r.id} className="flex items-center gap-3">
                <span className="text-[#4a6b48] text-sm w-5 text-right">{i + 1}.</span>
                <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={r.image} alt={r.name} className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80'; }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm truncate">{r.name}</p>
                  <p className="text-[#6a8a68] text-xs">{r.category}</p>
                </div>
                <span className="text-red-400 text-sm font-semibold">
                  {wishlistCounts[r.id]} ❤️
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recipe category bar */}
      <div className="bg-[#141f13] rounded-2xl p-4 border border-white/5">
        <p className="text-white font-semibold mb-3">📊 Recipe Distribution</p>
        <div className="flex gap-1 h-6 rounded-full overflow-hidden">
          <div className="bg-[#4CAF50] transition-all" style={{ width: `${(veganCount / recipes.length) * 100}%` }} />
          <div className="bg-[#FF8C42] transition-all" style={{ width: `${(nonVeganCount / recipes.length) * 100}%` }} />
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#4CAF50]" /><span className="text-[#6a8a68] text-xs">Vegan ({veganCount})</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#FF8C42]" /><span className="text-[#6a8a68] text-xs">Non-Vegan ({nonVeganCount})</span></div>
        </div>
      </div>
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const getAllUsers = () => {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); } catch { return {}; }
  };

  const users = getAllUsers();
  const userList = Object.entries(users).map(([username, data]: [string, any]) => ({
    username,
    email: data.email,
    createdAt: data.createdAt,
    isAdmin: username === 'admin',
  }));

  return (
    <div className="space-y-3">
      <p className="text-[#6a8a68] text-xs">{userList.length} registered accounts</p>
      {userList.map((u) => (
        <div key={u.username} className="bg-[#141f13] rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${u.isAdmin ? 'bg-[#4CAF50]/20' : 'bg-white/5'}`}>
              {u.isAdmin ? <ShieldCheck className="w-5 h-5 text-[#4CAF50]" /> : <User className="w-5 h-5 text-[#6a8a68]" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-medium text-sm">@{u.username}</p>
                {u.isAdmin && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]/30">ADMIN</span>
                )}
              </div>
              <p className="text-[#6a8a68] text-xs truncate">{u.email}</p>
              <p className="text-[#3a5a38] text-[10px] mt-0.5">
                Joined {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Recipe Form Modal ────────────────────────────────────────────────────────
function RecipeFormModal({ initial, onSave, onClose }: {
  initial?: Recipe;
  onSave: (data: Omit<Recipe, 'id'>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    category: initial?.category || 'vegan',
    emoji: initial?.emoji || '🍽️',
    image: initial?.image || '',
    description: initial?.description || '',
    prepTime: initial?.prepTime?.toString() || '10',
    cookTime: initial?.cookTime?.toString() || '20',
    servings: initial?.servings?.toString() || '2',
    difficulty: initial?.difficulty || 'Easy',
    calories: initial?.calories?.toString() || '300',
    protein: initial?.protein?.toString() || '15',
    carbs: initial?.carbs?.toString() || '40',
    fat: initial?.fat?.toString() || '10',
    fiber: initial?.fiber?.toString() || '3',
    tags: initial?.tags?.join(', ') || '',
    ingredients: initial?.ingredients?.join('\n') || '',
    steps: initial?.steps?.join('\n') || '',
  });

  const set = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  const handleSave = () => {
    if (!form.name.trim() || !form.description.trim()) return;
    onSave({
      name: form.name.trim(),
      category: form.category as 'vegan' | 'non-vegan',
      emoji: form.emoji,
      image: form.image || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=90',
      description: form.description.trim(),
      prepTime: parseInt(form.prepTime) || 10,
      cookTime: parseInt(form.cookTime) || 20,
      servings: parseInt(form.servings) || 2,
      difficulty: form.difficulty as 'Easy' | 'Medium' | 'Hard',
      calories: parseInt(form.calories) || 300,
      protein: parseInt(form.protein) || 15,
      carbs: parseInt(form.carbs) || 40,
      fat: parseInt(form.fat) || 10,
      fiber: parseInt(form.fiber) || 3,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      ingredients: form.ingredients.split('\n').map(s => s.trim()).filter(Boolean),
      steps: form.steps.split('\n').map(s => s.trim()).filter(Boolean),
    });
    onClose();
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#4a6b48] outline-none focus:border-[#4CAF50]/50";
  const labelCls = "text-[#7a9a78] text-xs mb-1 block";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end"
      onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full bg-[#141f13] rounded-t-3xl max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-white/5 flex-shrink-0">
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
              {initial ? 'Edit Recipe' : 'Add New Recipe'}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Recipe Name *</label>
              <input className={inputCls} placeholder="e.g. Nasi Goreng" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Emoji</label>
              <input className={inputCls} placeholder="🍽️" value={form.emoji} onChange={e => set('emoji', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Category</label>
              <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="vegan">🌱 Vegan</option>
                <option value="non-vegan">🍖 Non-Vegan</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Difficulty</label>
              <select className={inputCls} value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Description *</label>
            <textarea className={inputCls} rows={2} placeholder="Brief description..." value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Image URL</label>
            <input className={inputCls} placeholder="https://images.unsplash.com/..." value={form.image} onChange={e => set('image', e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={labelCls}>Prep (min)</label>
              <input className={inputCls} type="number" value={form.prepTime} onChange={e => set('prepTime', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Cook (min)</label>
              <input className={inputCls} type="number" value={form.cookTime} onChange={e => set('cookTime', e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Servings</label>
              <input className={inputCls} type="number" value={form.servings} onChange={e => set('servings', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {[
              { key: 'calories', label: 'Kcal' },
              { key: 'protein', label: 'Protein' },
              { key: 'carbs', label: 'Carbs' },
              { key: 'fat', label: 'Fat' },
              { key: 'fiber', label: 'Fiber' },
            ].map(f => (
              <div key={f.key}>
                <label className={labelCls}>{f.label}</label>
                <input className={inputCls} type="number" value={form[f.key as keyof typeof form]} onChange={e => set(f.key, e.target.value)} />
              </div>
            ))}
          </div>

          <div>
            <label className={labelCls}>Tags (comma separated)</label>
            <input className={inputCls} placeholder="indonesian, rice, quick" value={form.tags} onChange={e => set('tags', e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Ingredients (one per line)</label>
            <textarea className={inputCls} rows={5} placeholder={"2 cups rice\n1 egg\n2 cloves garlic"} value={form.ingredients} onChange={e => set('ingredients', e.target.value)} />
          </div>

          <div>
            <label className={labelCls}>Cooking Steps (one per line)</label>
            <textarea className={inputCls} rows={5} placeholder={"Heat oil in a wok.\nAdd garlic and stir-fry.\nAdd rice and season."} value={form.steps} onChange={e => set('steps', e.target.value)} />
          </div>
        </div>

        {/* Save button */}
        <div className="px-5 py-4 border-t border-white/5 flex-shrink-0">
          <button onClick={handleSave} className="w-full py-3.5 rounded-2xl font-bold text-white bg-[#4CAF50] flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> {initial ? 'Save Changes' : 'Add Recipe'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Recipes Tab ──────────────────────────────────────────────────────────────
function RecipesTab() {
  const { recipes, addRecipe, updateRecipe, deleteRecipe, resetToDefault } = useRecipes();
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'vegan' | 'non-vegan'>('all');

  const displayed = filter === 'all' ? recipes : recipes.filter(r => r.category === filter);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {(['all', 'vegan', 'non-vegan'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? 'bg-[#4CAF50] text-white' : 'bg-white/5 text-[#6a8a68]'}`}>
              {f === 'all' ? 'All' : f === 'vegan' ? '🌱 Vegan' : '🍖 Non-Vegan'}
            </button>
          ))}
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4CAF50] text-white text-xs font-semibold">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      <p className="text-[#4a6b48] text-xs">{displayed.length} recipes</p>

      {displayed.map(recipe => (
        <div key={recipe.id} className="bg-[#141f13] rounded-xl p-3 border border-white/5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover object-center"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80'; }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-white text-sm font-medium truncate">{recipe.emoji} {recipe.name}</p>
              {recipe.id.startsWith('custom_') && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#4fa3d1]/20 text-[#4fa3d1] border border-[#4fa3d1]/30 flex-shrink-0">NEW</span>
              )}
            </div>
            <p className="text-[#6a8a68] text-xs">{recipe.calories} kcal · {recipe.difficulty} · {recipe.category}</p>
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <button onClick={() => setEditingRecipe(recipe)}
              className="w-7 h-7 rounded-lg bg-[#4CAF50]/15 flex items-center justify-center">
              <Pencil className="w-3.5 h-3.5 text-[#4CAF50]" />
            </button>
            <button onClick={() => setConfirmDelete(recipe.id)}
              className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        </div>
      ))}

      {/* Reset button */}
      <button onClick={resetToDefault}
        className="w-full py-2.5 rounded-xl text-xs font-medium text-[#6a8a68] bg-white/5 border border-white/10 flex items-center justify-center gap-1.5">
        <RefreshCw className="w-3.5 h-3.5" /> Reset to Default Recipes
      </button>

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-6"
            onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-[#141f13] rounded-2xl p-5 w-full max-w-sm border border-white/10"
              onClick={e => e.stopPropagation()}>
              <p className="text-white font-bold mb-2">Delete this recipe?</p>
              <p className="text-[#6a8a68] text-sm mb-4">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl bg-white/5 text-[#7a9a78] text-sm font-medium">Cancel</button>
                <button onClick={() => { deleteRecipe(confirmDelete); setConfirmDelete(null); }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium">Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit modal */}
      <AnimatePresence>
        {adding && <RecipeFormModal onSave={addRecipe} onClose={() => setAdding(false)} />}
        {editingRecipe && (
          <RecipeFormModal
            initial={editingRecipe}
            onSave={(data) => updateRecipe(editingRecipe.id, data)}
            onClose={() => setEditingRecipe(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('stats');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'stats', label: 'Stats', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'recipes', label: 'Recipes', icon: <UtensilsCrossed className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0f1a0f] pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0f1a0f]/95 backdrop-blur-sm border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/profile')} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                Admin Panel
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]/30">
                ADMIN
              </span>
            </div>
            <p className="text-xs text-[#6a8a68]">@{user?.username}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mt-3">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${tab === t.id ? 'bg-[#4CAF50] text-white' : 'bg-white/5 text-[#6a8a68]'}`}>
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {tab === 'stats' && <StatsTab />}
            {tab === 'users' && <UsersTab />}
            {tab === 'recipes' && <RecipesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
