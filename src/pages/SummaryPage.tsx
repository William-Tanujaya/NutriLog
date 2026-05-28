import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Trash2, TrendingUp, Zap, Droplets, Wheat } from 'lucide-react';
import BottomNav from '../components/BottomNav';

const DAILY_GOALS = { calories: 2000, protein: 60, carbs: 250, fat: 65 };

const todayLabel = () => new Date().toLocaleDateString('en-US', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

export default function SummaryPage() {
  const { dailyLog, clearTodayLog } = useApp();
  const navigate = useNavigate();

  const totals = dailyLog.reduce(
    (acc, e) => ({
      calories: acc.calories + e.totalCalories,
      protein: acc.protein + e.totalProtein,
      carbs: acc.carbs + e.totalCarbs,
      fat: acc.fat + e.totalFat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const caloriesPct = Math.min((totals.calories / DAILY_GOALS.calories) * 100, 100);
  const ringData = [{ name: 'Kcal', value: caloriesPct, fill: '#4CAF50' }];

  const macros = [
    { label: 'Protein', val: totals.protein, goal: DAILY_GOALS.protein, unit: 'g', color: '#4CAF50', icon: <Zap className="w-4 h-4" /> },
    { label: 'Carbs', val: totals.carbs, goal: DAILY_GOALS.carbs, unit: 'g', color: '#4fa3d1', icon: <Wheat className="w-4 h-4" /> },
    { label: 'Fat', val: totals.fat, goal: DAILY_GOALS.fat, unit: 'g', color: '#d4a030', icon: <Droplets className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0f1a0f] pb-24">
      <div className="sticky top-0 z-20 bg-[#0f1a0f]/95 backdrop-blur-sm border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>📊 Daily Summary</h1>
            <p className="text-xs text-[#6a8a68]">{todayLabel()}</p>
          </div>
          {dailyLog.length > 0 && (
            <button onClick={clearTodayLog} className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center">
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
      </div>

      {dailyLog.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-white font-bold text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>No meals logged today</h2>
          <p className="text-[#6a8a68] text-sm mt-2">Add food to your cart and log it here</p>
          <button onClick={() => navigate('/recipes')} className="mt-6 px-6 py-3 bg-[#4CAF50] text-white rounded-xl font-semibold">
            Pick a Recipe
          </button>
        </div>
      ) : (
        <div className="px-4 pt-4 space-y-4">
          {/* Calorie ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-[#141f13] rounded-2xl p-5 border border-white/5"
          >
            <div className="flex items-center gap-4">
              <div className="relative w-28 h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={ringData} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" cornerRadius={8} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-white font-bold text-lg leading-none">{Math.round(caloriesPct)}%</p>
                  <p className="text-[#4a6b48] text-[10px]">achieved</p>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[#7a9a78] text-xs uppercase tracking-wider">Calories Today</p>
                <p className="text-white text-3xl font-bold mt-1">{totals.calories}</p>
                <p className="text-[#4a6b48] text-sm">of {DAILY_GOALS.calories} kcal goal</p>
                <div className="mt-2 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${caloriesPct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full bg-[#4CAF50]"
                  />
                </div>
                <p className="text-[#6a8a68] text-xs mt-1">
                  {Math.max(DAILY_GOALS.calories - totals.calories, 0)} kcal remaining
                </p>
              </div>
            </div>
          </motion.div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-2">
            {macros.map((m, i) => {
              const pct = Math.min((m.val / m.goal) * 100, 100);
              return (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="bg-[#141f13] rounded-xl p-3 border border-white/5"
                >
                  <div className="flex items-center gap-1.5 mb-2" style={{ color: m.color }}>
                    {m.icon}
                    <span className="text-[10px] font-medium uppercase tracking-wider">{m.label}</span>
                  </div>
                  <p className="text-white font-bold text-lg">{m.val}<span className="text-xs font-normal text-[#6a8a68]">{m.unit}</span></p>
                  <p className="text-[#4a6b48] text-[10px]">/ {m.goal}{m.unit}</p>
                  <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                      className="h-full rounded-full"
                      style={{ background: m.color }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Meals logged */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[#4CAF50]" />
              <h2 className="text-white font-semibold">Meals Logged Today</h2>
            </div>
            <div className="space-y-2">
              {dailyLog.map((entry, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#141f13] rounded-xl p-3 border border-white/5 flex gap-3"
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={entry.recipe.image}
                      alt={entry.recipe.name}
                      className="w-full h-full object-cover object-center"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=90'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-white font-medium text-sm truncate">{entry.recipe.emoji} {entry.recipe.name}</h3>
                      <span className="text-[#4CAF50] text-xs font-semibold flex-shrink-0">{entry.totalCalories} kcal</span>
                    </div>
                    <p className="text-[#6a8a68] text-xs mt-0.5">
                      Protein: {entry.totalProtein}g · Carbs: {entry.totalCarbs}g · Fat: {entry.totalFat}g
                    </p>
                    {entry.selectedAddons.length > 0 && (
                      <p className="text-[#4a6b48] text-[10px] mt-1">+ {entry.selectedAddons.map(a => a.name).join(', ')}</p>
                    )}
                    <p className="text-[#3a5a38] text-[10px] mt-0.5">
                      {new Date(entry.loggedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <button onClick={() => navigate('/recipes')} className="w-full py-3 rounded-2xl font-medium text-[#7bc97e] text-sm bg-[#4CAF50]/10 border border-[#4CAF50]/20">
            + Add More Food
          </button>
        </div>
      )}
      <BottomNav />
    </div>
  );
}
