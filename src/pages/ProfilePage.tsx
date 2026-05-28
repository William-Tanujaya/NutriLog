import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { calculateDailyGoals, calculateTDEE, getBMIInfo, GOAL_INFO, ACTIVITY_INFO } from '../utils/calculations';
import type { UserProfile, ActivityLevel, Goal } from '../utils/calculations';
import { ArrowLeft, Pencil, Check, X } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function ProfilePage() {
  const { user, profile, saveProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile | null>(profile);

  if (!profile || !draft) return (
    <div className="min-h-screen bg-[#0f1a0f] flex items-center justify-center">
      <p className="text-[#6a8a68]">No profile found.</p>
    </div>
  );

  const bmiInfo = getBMIInfo(profile);
  const goals = calculateDailyGoals(profile);
  const tdee = calculateTDEE(profile);
  const goalInfo = GOAL_INFO[profile.goal];

  const handleSave = () => {
    if (draft) { saveProfile(draft); setEditing(false); }
  };

  const Field = ({ label, value, unit, field, min, max }: {
    label: string; value: number; unit: string;
    field: 'age' | 'height' | 'weight'; min: number; max: number;
  }) => (
    <div className="bg-[#141f13] rounded-xl p-3 border border-white/5">
      <p className="text-[#4a6b48] text-xs mb-1">{label}</p>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            type="number" value={draft[field]} min={min} max={max}
            onChange={e => setDraft(d => d ? { ...d, [field]: +e.target.value } : d)}
            className="w-full bg-white/5 border border-[#4CAF50]/40 rounded-lg px-3 py-1.5 text-white text-sm outline-none"
          />
          <span className="text-[#4a6b48] text-xs flex-shrink-0">{unit}</span>
        </div>
      ) : (
        <p className="text-white font-bold text-lg">{value} <span className="text-[#4a6b48] text-xs font-normal">{unit}</span></p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1a0f] pb-28">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0f1a0f]/95 backdrop-blur-sm border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>My Profile</h1>
            <p className="text-xs text-[#6a8a68]">@{user?.username}</p>
          </div>
          {editing ? (
            <div className="flex gap-2">
              <button onClick={() => { setDraft(profile); setEditing(false); }} className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center">
                <X className="w-4 h-4 text-red-400" />
              </button>
              <button onClick={handleSave} className="w-9 h-9 rounded-full bg-[#4CAF50]/20 flex items-center justify-center">
                <Check className="w-4 h-4 text-[#4CAF50]" />
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-[#7a9a78]" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* BMI Card */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 border" style={{ borderColor: `${bmiInfo.color}40`, background: `${bmiInfo.color}10` }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[#7a9a78] text-xs uppercase tracking-wider mb-1">Body Mass Index</p>
              <p className="text-5xl font-bold" style={{ color: bmiInfo.color }}>{bmiInfo.value.toFixed(1)}</p>
              <span className="inline-block mt-2 text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: `${bmiInfo.color}25`, color: bmiInfo.color }}>
                {bmiInfo.category}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[#6a8a68] text-xs">{profile.weight} kg</p>
              <p className="text-[#6a8a68] text-xs">{profile.height} cm</p>
            </div>
          </div>
          {/* BMI scale */}
          <div className="mt-4">
            <div className="h-3 rounded-full overflow-hidden relative" style={{ background: 'linear-gradient(to right, #4fa3d1 0%, #4CAF50 30%, #FF8C42 60%, #ef4444 100%)' }}>
              <div className="absolute top-0 w-1 h-full bg-white rounded-full shadow-lg transition-all"
                style={{ left: `${Math.min(Math.max(((bmiInfo.value - 10) / 30) * 100, 0), 98)}%` }} />
            </div>
            <div className="flex justify-between text-[9px] text-[#4a6b48] mt-1.5">
              <span>Underweight</span><span>Normal</span><span>Overweight</span><span>Obese</span>
            </div>
          </div>
          <p className="text-[#7a9a78] text-xs mt-3 leading-relaxed">{bmiInfo.advice}</p>
        </motion.div>

        {/* Goal banner */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className={`rounded-2xl p-4 border ${goalInfo.bg} ${goalInfo.border}`}>
          <p className="text-[#7a9a78] text-xs uppercase tracking-wider mb-1">Current Goal</p>
          <p className="text-white font-bold text-xl">{goalInfo.label}</p>
          <p className="text-[#7a9a78] text-sm mt-0.5">{goalInfo.desc}</p>
          {editing && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {(Object.entries(GOAL_INFO) as [Goal, typeof GOAL_INFO[Goal]][]).map(([key, info]) => (
                <button key={key} onClick={() => setDraft(d => d ? { ...d, goal: key } : d)}
                  className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                    draft?.goal === key ? `${info.bg} ${info.border} text-white` : 'border-white/10 text-[#6a8a68]'
                  }`}>
                  {key === 'cutting' ? '🔥' : key === 'bulking' ? '💪' : '⚖️'} {key}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Daily Targets */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-[#141f13] rounded-2xl p-4 border border-white/5">
          <p className="text-[#7a9a78] text-xs uppercase tracking-wider mb-3">Daily Targets</p>
          <div className="flex items-end gap-2 mb-3">
            <p className="text-4xl font-bold text-white">{goals.calories}</p>
            <p className="text-[#4a6b48] text-sm mb-1">kcal / day</p>
          </div>
          <p className="text-[#4a6b48] text-xs mb-3">
            TDEE: {tdee} kcal
            {profile.goal === 'cutting' && ' · −500 calorie deficit'}
            {profile.goal === 'bulking' && ' · +300 calorie surplus'}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Protein', val: goals.protein, color: '#4CAF50' },
              { label: 'Carbs', val: goals.carbs, color: '#4fa3d1' },
              { label: 'Fat', val: goals.fat, color: '#d4a030' },
            ].map(m => (
              <div key={m.label} className="bg-white/5 rounded-xl p-3 text-center">
                <p className="font-bold" style={{ color: m.color }}>{m.val}g</p>
                <p className="text-[#4a6b48] text-xs mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-[#141f13] rounded-2xl p-4 border border-white/5">
          <p className="text-[#7a9a78] text-xs uppercase tracking-wider mb-3">Body Stats</p>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Age" value={profile.age} unit="yrs" field="age" min={10} max={100} />
            <Field label="Height" value={profile.height} unit="cm" field="height" min={100} max={250} />
            <Field label="Weight" value={profile.weight} unit="kg" field="weight" min={20} max={300} />
          </div>

          {/* Gender */}
          <div className="mt-3 bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-[#4a6b48] text-xs mb-1.5">Gender</p>
            {editing ? (
              <div className="flex gap-2">
                {(['male', 'female'] as const).map(g => (
                  <button key={g} onClick={() => setDraft(d => d ? { ...d, gender: g } : d)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      draft?.gender === g ? 'bg-[#4CAF50] text-white' : 'bg-white/5 text-[#6a8a68]'
                    }`}>
                    {g === 'male' ? '👨 Male' : '👩 Female'}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-white font-medium text-sm">{profile.gender === 'male' ? '👨 Male' : '👩 Female'}</p>
            )}
          </div>

          {/* Activity */}
          <div className="mt-2 bg-white/5 rounded-xl p-3 border border-white/5">
            <p className="text-[#4a6b48] text-xs mb-1.5">Activity Level</p>
            {editing ? (
              <div className="space-y-1.5">
                {(Object.entries(ACTIVITY_INFO) as [ActivityLevel, { label: string; desc: string }][]).map(([key, info]) => (
                  <button key={key} onClick={() => setDraft(d => d ? { ...d, activity: key } : d)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                      draft?.activity === key ? 'bg-[#4CAF50]/15 border border-[#4CAF50]/30' : 'bg-white/5'
                    }`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${draft?.activity === key ? 'bg-[#4CAF50]' : 'bg-[#4a6b48]'}`} />
                    <span className={`text-xs ${draft?.activity === key ? 'text-white' : 'text-[#6a8a68]'}`}>{info.label}</span>
                    <span className="text-[#4a6b48] text-[10px]">· {info.desc}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-white font-medium text-sm">{ACTIVITY_INFO[profile.activity].label}</p>
            )}
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
