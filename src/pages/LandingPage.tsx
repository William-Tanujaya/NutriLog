import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Leaf, Drumstick } from 'lucide-react';

export default function LandingPage() {
  const { setSelectedCategory } = useApp();
  const navigate = useNavigate();

  const choose = (cat: 'vegan' | 'non-vegan') => {
    setSelectedCategory(cat);
    navigate('/recipes');
  };

  return (
    <div className="min-h-screen bg-[#0f1a0f] flex flex-col items-center justify-between px-6 py-12 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-100px] left-[-80px] w-[300px] h-[300px] rounded-full bg-[#2d5a27] opacity-20 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-[250px] h-[250px] rounded-full bg-[#8b5e1a] opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#1a3d17] opacity-10 blur-3xl" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="text-4xl">🥗</span>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          NutriLog
        </h1>
        <p className="text-[#8ab388] mt-2 text-sm tracking-widest uppercase font-medium">
          Eat well, live healthy
        </p>
      </motion.div>

      {/* Choice cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="w-full max-w-sm space-y-4 relative z-10"
      >
        <p className="text-center text-[#c5d9c3] text-lg font-medium mb-6">
          Choose your food preference
        </p>

        {/* Vegan card */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => choose('vegan')}
          className="w-full rounded-2xl overflow-hidden relative group cursor-pointer"
        >
          <div className="bg-gradient-to-br from-[#1e4d1b] to-[#2d6b27] p-6 border border-[#3d7a35]/40">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#4CAF50]/20 flex items-center justify-center ring-2 ring-[#4CAF50]/30">
                <Leaf className="w-7 h-7 text-[#7bc97e]" />
              </div>
              <div className="text-left flex-1">
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                  🌱 Vegan
                </h2>
                <p className="text-[#9dc99b] text-sm mt-0.5">
                  No meat or animal products
                </p>
              </div>
              <div className="text-[#4CAF50] text-xl">›</div>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              {['Sayuran', 'Kacang-kacangan', 'Biji-bijian', 'Buah'].map(tag => (
                <span key={tag} className="text-xs bg-[#4CAF50]/15 text-[#7bc97e] px-2.5 py-1 rounded-full border border-[#4CAF50]/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.button>

        {/* Non-vegan card */}
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => choose('non-vegan')}
          className="w-full rounded-2xl overflow-hidden relative group cursor-pointer"
        >
          <div className="bg-gradient-to-br from-[#4a2810] to-[#6b3a15] p-6 border border-[#8b5e1a]/40">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#FF8C42]/20 flex items-center justify-center ring-2 ring-[#FF8C42]/30">
                <Drumstick className="w-7 h-7 text-[#FF8C42]" />
              </div>
              <div className="text-left flex-1">
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                  🍖 Non-Vegan
                </h2>
                <p className="text-[#d4a57a] text-sm mt-0.5">
                  Includes meat, fish & eggs
                </p>
              </div>
              <div className="text-[#FF8C42] text-xl">›</div>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              {['Ayam', 'Sapi', 'Ikan', 'Telur'].map(tag => (
                <span key={tag} className="text-xs bg-[#FF8C42]/15 text-[#d4956a] px-2.5 py-1 rounded-full border border-[#FF8C42]/20">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center relative z-10"
      >
        <p className="text-[#4a6b48] text-xs">
          All recipes include nutrition info & cooking instructions
        </p>
      </motion.div>
    </div>
  );
}
