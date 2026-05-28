import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setFeedback(null);
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // simulate async

    const result = mode === 'login'
      ? login(username, password)
      : register(username, email, password);

    setLoading(false);

    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      setTimeout(() => navigate('/'), 800);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const switchMode = (m: 'login' | 'register') => {
    setMode(m);
    setFeedback(null);
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-[#0f1a0f] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-80px] left-[-60px] w-[280px] h-[280px] rounded-full bg-[#2d5a27] opacity-20 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-40px] w-[220px] h-[220px] rounded-full bg-[#8b5e1a] opacity-20 blur-3xl" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <span className="text-5xl">🥗</span>
        <h1 className="text-3xl font-bold text-white mt-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          NutriLog
        </h1>
        <p className="text-[#8ab388] text-xs tracking-widest uppercase mt-1">Eat well, live healthy</p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Tab switcher */}
        <div className="flex bg-white/5 rounded-2xl p-1 mb-6 border border-white/10">
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                mode === m ? 'bg-[#4CAF50] text-white shadow-lg' : 'text-[#6a8a68]'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Username */}
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a6b48]" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-[#4a6b48] outline-none focus:border-[#4CAF50]/60 transition-colors"
              />
            </div>

            {/* Email (register only) */}
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a6b48]" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder-[#4a6b48] outline-none focus:border-[#4CAF50]/60 transition-colors"
                />
              </motion.div>
            )}

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a6b48]" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Password (min. 6 characters)' : 'Password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3.5 text-sm text-white placeholder-[#4a6b48] outline-none focus:border-[#4CAF50]/60 transition-colors"
              />
              <button
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4a6b48]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm ${
                    feedback.type === 'error'
                      ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                      : 'bg-[#4CAF50]/10 border border-[#4CAF50]/20 text-[#7bc97e]'
                  }`}
                >
                  {feedback.type === 'error'
                    ? <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    : <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  }
                  {feedback.message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-white text-base bg-[#4CAF50] flex items-center justify-center gap-2 mt-2 disabled:opacity-60 transition-opacity"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </motion.button>
          </motion.div>
        </AnimatePresence>

        {/* Switch hint */}
        <p className="text-center text-[#4a6b48] text-xs mt-5">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => switchMode(mode === 'login' ? 'register' : 'login')} className="text-[#7bc97e] font-medium underline-offset-2 hover:underline">
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
