import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useRecipes } from '../context/RecipeContext';
import { GOAL_INFO } from '../utils/calculations';
import { Clock, ChefHat, Flame, ShoppingCart, ArrowLeft, Search, Heart, X } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const FILTER_CHIPS = [
  { id: 'all',         label: 'All',        emoji: '🍽️', tags: [] },
  { id: 'chicken',     label: 'Chicken',    emoji: '🍗', tags: ['chicken'] },
  { id: 'fish',        label: 'Fish',       emoji: '🐟', tags: ['fish', 'salmon'] },
  { id: 'beef',        label: 'Beef',       emoji: '🥩', tags: ['beef'] },
  { id: 'rice',        label: 'Rice',       emoji: '🍚', tags: ['rice'] },
  { id: 'vegetables',  label: 'Veggies',    emoji: '🥗', tags: ['vegetables', 'salad'] },
  { id: 'soup',        label: 'Soup',       emoji: '🍜', tags: ['soup', 'noodle'] },
  { id: 'eggs',        label: 'Eggs',       emoji: '🥚', tags: ['eggs'] },
  { id: 'breakfast',   label: 'Breakfast',  emoji: '🌅', tags: ['breakfast', 'oats', 'smoothie'] },
  { id: 'grilled',     label: 'Grilled',    emoji: '🔥', tags: ['grilled'] },
];

export default function RecipesPage() {
  const { selectedCategory, setSelectedCategory, totalCartItems, wishlist, toggleWishlist } = useApp();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { recipes } = useRecipes();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const goalInfo = profile ? GOAL_INFO[profile.goal] : null;
  const recommended = profile
    ? recipes
        .filter(r => r.category === selectedCategory)
        .filter(r => GOAL_INFO[profile.goal].filter(r.calories))
        .slice(0, 3)
    : [];

  const filtered = recipes
    .filter(r => r.category === selectedCategory)
    .filter(r => {
      if (activeFilter === 'all') return true;
      const chip = FILTER_CHIPS.find(c => c.id === activeFilter);
      return chip ? chip.tags.some(t => r.tags.includes(t)) : true;
    })
    .filter(r =>
      query === '' ||
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
    );

  const isVegan = selectedCategory === 'vegan';
  const accent = isVegan ? '#4CAF50' : '#FF8C42';
  const accentText = isVegan ? 'text-[#4CAF50]' : 'text-[#FF8C42]';
  const tagBg = isVegan
    ? 'bg-[#4CAF50]/15 text-[#7bc97e] border-[#4CAF50]/20'
    : 'bg-[#FF8C42]/15 text-[#d4956a] border-[#FF8C42]/20';

  const difficultyColor = {
    'Easy': 'text-emerald-400',
    'Medium': 'text-amber-400',
    'Hard': 'text-red-400',
  } as const;

  return (
    <div className="min-h-screen bg-[#0f1a0f] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0f1a0f]/95 backdrop-blur-sm border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/')} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              {isVegan ? '🌱 Vegan Menu' : '🍖 Non-Vegan Menu'}
            </h1>
            <p className="text-xs text-[#6a8a68]">{filtered.length} recipes available</p>
          </div>
          {totalCartItems > 0 && (
            <button onClick={() => navigate('/cart')} className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold" style={{ background: accent }}>
                {totalCartItems}
              </span>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a6b48]" />
          <input
            type="text"
            placeholder="What are you craving today?"
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveFilter('all'); }}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-[#4a6b48] outline-none focus:border-[#4CAF50]/40"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-[#4a6b48]" />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mb-3">
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip.id}
              onClick={() => { setActiveFilter(chip.id); setQuery(''); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition-all ${
                activeFilter === chip.id
                  ? 'text-white shadow-sm'
                  : 'bg-white/5 text-[#6a8a68] border border-white/10'
              }`}
              style={activeFilter === chip.id ? { background: accent } : {}}
            >
              <span>{chip.emoji}</span>
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* Category toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => { setSelectedCategory('vegan'); setActiveFilter('all'); }}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'vegan' ? 'bg-[#4CAF50] text-white' : 'bg-white/5 text-[#6a8a68]'}`}
          >
            🌱 Vegan
          </button>
          <button
            onClick={() => { setSelectedCategory('non-vegan'); setActiveFilter('all'); }}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'non-vegan' ? 'bg-[#FF8C42] text-white' : 'bg-white/5 text-[#6a8a68]'}`}
          >
            🍖 Non-Vegan
          </button>
        </div>
      </div>

      {/* Recommendations */}
      {goalInfo && recommended.length > 0 && query === '' && activeFilter === 'all' && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base">🎯</span>
            <h2 className="text-white font-semibold text-sm">Recommended for You</h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${goalInfo.color}20`, color: goalInfo.color }}>
              {profile!.goal.charAt(0).toUpperCase() + profile!.goal.slice(1)}
            </span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {recommended.map(recipe => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => navigate(`/recipe/${recipe.id}`)}
                className="flex-shrink-0 w-40 bg-[#141f13] rounded-2xl overflow-hidden border border-white/5 cursor-pointer active:scale-95 transition-transform"
              >
                <div className="relative h-24 overflow-hidden">
                  <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover object-center"
                    onError={(e) => { (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}placeholder.svg`; }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141f13]/80 to-transparent" />
                  <button onClick={e => { e.stopPropagation(); toggleWishlist(recipe.id); }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                    <Heart className={`w-3 h-3 ${wishlist.includes(recipe.id) ? 'fill-red-400 text-red-400' : 'text-white'}`} />
                  </button>
                </div>
                <div className="p-2.5">
                  <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{recipe.name}</p>
                  <p className="text-[#6a8a68] text-[10px] mt-1">{recipe.calories} kcal · {recipe.protein}g protein</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recipe grid */}
      <div className="px-4 pt-4 space-y-4">
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-white font-medium">No recipes found</p>
            <p className="text-[#6a8a68] text-sm mt-1">Try a different keyword or filter</p>
            <button
              onClick={() => { setQuery(''); setActiveFilter('all'); }}
              className="mt-4 px-4 py-2 rounded-xl text-sm font-medium text-[#7bc97e] bg-[#4CAF50]/10 border border-[#4CAF50]/20"
            >
              Clear filters
            </button>
          </div>
        )}
        {filtered.map((recipe, i) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-[#141f13] rounded-2xl overflow-hidden border border-white/5"
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => navigate(`/recipe/${recipe.id}`)}>
              <img
                src={recipe.image}
                alt={recipe.name}
                className="w-full h-full object-cover object-center"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}placeholder.svg`; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141f13] via-transparent to-transparent" />
              <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm ${difficultyColor[recipe.difficulty]}`}>
                {recipe.difficulty}
              </span>
              <button
                onClick={e => { e.stopPropagation(); toggleWishlist(recipe.id); }}
                className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center"
              >
                <Heart className={`w-4 h-4 ${wishlist.includes(recipe.id) ? 'fill-red-400 text-red-400' : 'text-white'}`} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4" onClick={() => navigate(`/recipe/${recipe.id}`)}>
              <h3 className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {recipe.name}
              </h3>
              <p className="text-[#7a9a78] text-sm mt-1 line-clamp-2">{recipe.description}</p>

              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-[#6a8a68] text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{recipe.prepTime + recipe.cookTime} min</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#6a8a68] text-xs">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{recipe.calories} kcal</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#6a8a68] text-xs">
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>{recipe.servings} servings</span>
                </div>
              </div>

              <div className="flex gap-1.5 mt-3 flex-wrap">
                {recipe.tags.slice(0, 3).map(tag => (
                  <span key={tag} className={`text-xs px-2 py-0.5 rounded-full border ${tagBg}`}>{tag}</span>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: 'Protein', val: recipe.protein, color: accentText },
                  { label: 'Carbs',   val: recipe.carbs,   color: 'text-blue-400' },
                  { label: 'Fat',     val: recipe.fat,     color: 'text-yellow-400' },
                ].map(n => (
                  <div key={n.label} className="bg-white/5 rounded-xl p-2.5 text-center">
                    <p className={`text-sm font-bold ${n.color}`}>{n.val}g</p>
                    <p className="text-[#4a6b48] text-xs mt-0.5">{n.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 w-full py-2.5 rounded-xl text-center text-sm font-semibold text-white" style={{ background: accent }}>
                View Recipe & Add →
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <BottomNav />
    </div>
  );
}
