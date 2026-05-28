import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserProfile } from '../utils/calculations';

export interface User {
  username: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  login: (username: string, password: string) => { success: boolean; message: string };
  register: (username: string, email: string, password: string) => { success: boolean; message: string };
  saveProfile: (p: UserProfile) => void;
  logout: () => void;
  isLoggedIn: boolean;
  hasProfile: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = 'nutrilog_users';
const SESSION_KEY = 'nutrilog_session';
const profileKey = (u: string) => `nutrilog_profile_${u}`;

const loadUsers = () => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); } catch { return {}; }
};
const saveUsers = (u: object) => localStorage.setItem(USERS_KEY, JSON.stringify(u));
const loadSession = (): User | null => {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
};
const loadProfile = (username: string): UserProfile | null => {
  try { return JSON.parse(localStorage.getItem(profileKey(username)) || 'null'); } catch { return null; }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadSession);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const s = loadSession();
    return s ? loadProfile(s.username) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  }, [user]);

  const register = (username: string, email: string, password: string) => {
    const u = username.trim().toLowerCase();
    const e = email.trim().toLowerCase();
    if (!u || !e || !password) return { success: false, message: 'All fields are required.' };
    if (u.length < 3) return { success: false, message: 'Username must be at least 3 characters.' };
    if (password.length < 6) return { success: false, message: 'Password must be at least 6 characters.' };
    if (!e.includes('@')) return { success: false, message: 'Please enter a valid email.' };
    const users = loadUsers();
    if (users[u]) return { success: false, message: 'Username already taken.' };
    if (Object.values(users).some((x: any) => x.email === e)) return { success: false, message: 'Email already registered.' };
    users[u] = { email: e, password, createdAt: new Date().toISOString() };
    saveUsers(users);
    const newUser: User = { username: u, email: e, createdAt: users[u].createdAt };
    setUser(newUser);
    setProfile(null);
    return { success: true, message: 'Account created!' };
  };

  const login = (username: string, password: string) => {
    const u = username.trim().toLowerCase();
    if (!u || !password) return { success: false, message: 'Please fill in all fields.' };
    const users = loadUsers();
    const found = users[u];
    if (!found) return { success: false, message: 'Username not found.' };
    if (found.password !== password) return { success: false, message: 'Incorrect password.' };
    const loggedIn: User = { username: u, email: found.email, createdAt: found.createdAt };
    setUser(loggedIn);
    setProfile(loadProfile(u));
    return { success: true, message: 'Welcome back!' };
  };

  const saveProfile = (p: UserProfile) => {
    if (!user) return;
    localStorage.setItem(profileKey(user.username), JSON.stringify(p));
    setProfile(p);
  };

  const logout = () => { setUser(null); setProfile(null); };

  return (
    <AuthContext.Provider value={{
      user, profile, login, register, saveProfile, logout,
      isLoggedIn: !!user, hasProfile: !!profile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
