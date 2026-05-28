import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserProfile, ActivityLevel, Goal } from '../utils/calculations';
import { calculateBMI, calculateDailyGoals, calculateTDEE, getBMIInfo, GOAL_INFO, ACTIVITY_INFO } from '../utils/calculations';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const TOTAL_STEPS = 3;

export default function OnboardingPage() {
  const { user, saveProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintenance');
  const [error, setError] = useState('');

  const preview: UserProfile | null = age && height && weight ? {
    gender, age: +age, height: +height, weight: +weight, activity, goal,
  } : null;

  const bmi = preview ? calculateBMI(preview) : null;
  const bmiInfo = preview ? getBMIInfo(preview) : null;
  const goals = preview ? calculateDailyGoals(preview) : null;
  const tdee = preview ? calculateTDEE(preview) : null;

  const next = () => {
    setError('');
    if (step === 1) {
      if (!age || +age < 10 || +age > 100) return setError('Please enter a valid age (10–100).');
    }
    if (step === 2) {
      if (!height || +height < 100 || +height > 250) return setError('Please enter a valid height (100–250 cm).');
      if (!weight || +weight < 20 || +weight > 300) return setError('Please enter a valid weight (20–300 kg).');
    }
    if (step < TOTAL_STEPS) setStep(s => s + 1);
    else handleFinish();
  };

  const handleFinish = () => {
    if (!age || !height || !weight) return;
    const p: UserProfile = { gender, age: +age, height: +height, weight: +weight, activity, goal };
    saveProfile(p);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0f1a0f] flex flex-col px-6 py-10 relative overflow-hidden">
      {/* BG blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-80px] left-[-60px] w-[260px] h-[260px] rounded-full bg-[#2d5a27] opacity-20 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-40px] w-[200px] h-[200px] rounded-full bg-[#8b5e1a] opacity-20 blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 mb-8">
        <p className="text-[#4CAF50] text-xs font-bold uppercase tracking-widest mb-1">
          Welcome, @{user?.username}!
        </p>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
          Let's set up your profile
        </h1>
        <p className="text-[#6a8a68] text-sm mt-1">
          We'll calculate your personal daily goals
        </p>

        {/* Progress bar */}
        <div className="flex gap-1.5 mt-5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{ background: i < step ? '#4CAF50' : 'rgba(255,255,255,0.1)' }}
            />
          ))}
        </div>
        <p className="text-[#4a6b48] text-xs mt-1.5">Step {step} of {TOTAL_STEPS}</p>
      </div>

      {/* Steps */}
      <div className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          {/* STEP 1: Gender + Age */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-5">
              <h2 className="text-white font-semibold text-lg">Personal Info</h2>

              {/* Gender */}
              <div>
                <p className="text-[#7a9a78] text-sm mb-2">Gender</p>
                <div className="grid grid-cols-2 gap-3">
                  {(['male', 'female'] as const).map(g => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`py-4 rounded-2xl border text-center transition-all ${
                        gender === g ? 'border-[#4CAF50] bg-[#4CAF50]/15' : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="text-3xl mb-1">{g === 'male' ? '👨' : '👩'}</div>
                      <p className={`text-sm font-semibold capitalize ${gender === g ? 'text-[#7bc97e]' : 'text-[#6a8a68]'}`}>{g}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div>
                <p className="text-[#7a9a78] text-sm mb-2">Age</p>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="e.g. 22"
                    value={age}
                    onChange={e => setAge(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#4CAF50]/60 transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a6b48] text-sm">years</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Height + Weight + live BMI */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-5">
              <h2 className="text-white font-semibold text-lg">Body Stats</h2>

              <div>
                <p className="text-[#7a9a78] text-sm mb-2">Height</p>
                <div className="relative">
                  <input type="number" placeholder="e.g. 170" value={height} onChange={e => setHeight(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#4CAF50]/60 transition-colors" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a6b48] text-sm">cm</span>
                </div>
              </div>

              <div>
                <p className="text-[#7a9a78] text-sm mb-2">Weight</p>
                <div className="relative">
                  <input type="number" placeholder="e.g. 65" value={weight} onChange={e => setWeight(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm outline-none focus:border-[#4CAF50]/60 transition-colors" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a6b48] text-sm">kg</span>
                </div>
              </div>

              {/* Live BMI preview */}
              {bmiInfo && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl p-4 border" style={{ borderColor: `${bmiInfo.color}40`, background: `${bmiInfo.color}10` }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white text-sm font-semibold">Your BMI</p>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: `${bmiInfo.color}20`, color: bmiInfo.color }}>
                      {bmiInfo.category}
                    </span>
                  </div>
                  <p className="text-4xl font-bold" style={{ color: bmiInfo.color }}>{bmi!.toFixed(1)}</p>
                  <p className="text-[#7a9a78] text-xs mt-2">{bmiInfo.advice}</p>

                  {/* BMI scale */}
                  <div className="mt-3 h-2 rounded-full overflow-hidden bg-white/10 relative">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(((bmi! - 10) / 30) * 100, 100)}%`, background: bmiInfo.color }} />
                  </div>
                  <div className="flex justify-between text-[9px] text-[#4a6b48] mt-1">
                    <span>10</span><span>18.5</span><span>25</span><span>30</span><span>40+</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Activity + Goal + preview */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="space-y-5">
              <h2 className="text-white font-semibold text-lg">Your Goals</h2>

              {/* Activity level */}
              <div>
                <p className="text-[#7a9a78] text-sm mb-2">Activity Level</p>
                <div className="space-y-2">
                  {(Object.entries(ACTIVITY_INFO) as [ActivityLevel, { label: string; desc: string }][]).map(([key, info]) => (
                    <button key={key} onClick={() => setActivity(key)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        activity === key ? 'border-[#4CAF50] bg-[#4CAF50]/10' : 'border-white/10 bg-white/5'
                      }`}>
                      <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${activity === key ? 'bg-[#4CAF50] border-[#4CAF50]' : 'border-[#4a6b48]'}`} />
                      <div>
                        <p className={`text-sm font-medium ${activity === key ? 'text-white' : 'text-[#7a9a78]'}`}>{info.label}</p>
                        <p className="text-[#4a6b48] text-xs">{info.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal */}
              <div>
                <p className="text-[#7a9a78] text-sm mb-2">Fitness Goal</p>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(GOAL_INFO) as [Goal, typeof GOAL_INFO[Goal]][]).map(([key, info]) => (
                    <button key={key} onClick={() => setGoal(key)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        goal === key ? `${info.bg} ${info.border}` : 'border-white/10 bg-white/5'
                      }`}>
                      <p className="text-lg mb-1">{key === 'cutting' ? '🔥' : key === 'bulking' ? '💪' : '⚖️'}</p>
                      <p className={`text-xs font-semibold ${goal === key ? 'text-white' : 'text-[#6a8a68]'}`}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </p>
                      <p className="text-[#4a6b48] text-[9px] mt-0.5 leading-tight">{info.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Daily goals preview */}
              {goals && tdee && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-[#141f13] rounded-2xl p-4 border border-white/5">
                  <p className="text-[#7a9a78] text-xs uppercase tracking-wider mb-3">Your Daily Targets</p>
                  <div className="flex items-end gap-2 mb-1">
                    <p className="text-3xl font-bold text-white">{goals.calories}</p>
                    <p className="text-[#4a6b48] text-sm mb-1">kcal / day</p>
                  </div>
                  <p className="text-[#4a6b48] text-xs mb-3">
                    TDEE: {tdee} kcal
                    {goal === 'cutting' && ' (−500 deficit)'}
                    {goal === 'bulking' && ' (+300 surplus)'}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Protein', val: goals.protein, unit: 'g', color: '#4CAF50' },
                      { label: 'Carbs', val: goals.carbs, unit: 'g', color: '#4fa3d1' },
                      { label: 'Fat', val: goals.fat, unit: 'g', color: '#d4a030' },
                    ].map(m => (
                      <div key={m.label} className="bg-white/5 rounded-xl p-2.5 text-center">
                        <p className="font-bold text-sm" style={{ color: m.color }}>{m.val}{m.unit}</p>
                        <p className="text-[#4a6b48] text-[10px]">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-3 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
            {error}
          </motion.p>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="relative z-10 flex gap-3 mt-6">
        {step > 1 && (
          <button onClick={() => { setStep(s => s - 1); setError(''); }}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
            <ChevronLeft className="w-5 h-5 text-[#7a9a78]" />
          </button>
        )}
        <motion.button whileTap={{ scale: 0.97 }} onClick={next}
          className="flex-1 py-4 rounded-2xl font-bold text-white text-base bg-[#4CAF50] flex items-center justify-center gap-2">
          {step === TOTAL_STEPS ? '🎉 Get Started' : (<>Next <ChevronRight className="w-5 h-5" /></>)}
        </motion.button>
      </div>
    </div>
  );
}
