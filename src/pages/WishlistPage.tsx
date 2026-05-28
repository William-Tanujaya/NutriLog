import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { recipes } from '../data/recipes';
import { Heart, Clock, Flame, ArrowLeft } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useApp();
  const navigate = useNavigate();

  const saved = recipes.filter(r => wishlist.includes(r.id));

  return (
    <div className="min-h-screen bg-[#0f1a0f] pb-24">
      <div className="sticky top-0 z-20 bg-[#0f1a0f]/95 backdrop-blur-sm border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              ❤️ Wishlist
            </h1>
            <p className="text-xs text-[#6a8a68]">{saved.length} saved recipes</p>
          </div>
        </div>
      </div>

      {saved.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="text-6xl mb-4">🤍</div>
          <h2 className="text-white font-bold text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            No saved recipes yet
          </h2>
          <p className="text-[#6a8a68] text-sm mt-2">Tap the ❤️ icon on any recipe to save it here</p>
          <button onClick={() => navigate('/recipes')} className="mt-6 px-6 py-3 bg-[#4CAF50] text-white rounded-xl font-semibold">
            Browse Recipes
          </button>
        </div>
      ) : (
        <div className="px-4 pt-4 space-y-3">
          {saved.map((recipe, i) => {
            const isVegan = recipe.category === 'vegan';
            const accent = isVegan ? '#4CAF50' : '#FF8C42';
            return (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-[#141f13] rounded-2xl overflow-hidden border border-white/5 flex"
              >
                {/* Thumbnail */}
                <div
                  className="w-24 flex-shrink-0 relative cursor-pointer"
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                >
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-full object-cover object-center"
                    onError={(e) => { (e.target as HTMLImageElement).src = `${import.meta.env.BASE_URL}placeholder.svg`; }}
                  />
                </div>

                {/* Content */}
                <div className="p-3 flex-1 min-w-0" onClick={() => navigate(`/recipe/${recipe.id}`)}>
                  <span className="text-[10px] font-medium" style={{ color: accent }}>
                    {isVegan ? '🌱 Vegan' : '🍖 Non-Vegan'} · {recipe.difficulty}
                  </span>
                  <h3 className="text-white font-semibold text-sm mt-0.5 leading-tight line-clamp-1">
                    {recipe.name}
                  </h3>
                  <div className="flex gap-3 mt-1.5">
                    <div className="flex items-center gap-1 text-[#6a8a68] text-[10px]">
                      <Clock className="w-3 h-3" />{recipe.prepTime + recipe.cookTime}m
                    </div>
                    <div className="flex items-center gap-1 text-[#6a8a68] text-[10px]">
                      <Flame className="w-3 h-3" />{recipe.calories} kcal
                    </div>
                  </div>
                </div>

                {/* Remove wishlist */}
                <button
                  onClick={() => toggleWishlist(recipe.id)}
                  className="w-10 flex items-center justify-center flex-shrink-0"
                >
                  <Heart className="w-5 h-5 fill-red-400 text-red-400" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
      <BottomNav />
    </div>
  );
}
