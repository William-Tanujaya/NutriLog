import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserProfile } from '../utils/calculations';
import {
  hashPassword,
  normalizeEmail,
  normalizeUsername,
  validateEmail,
  validatePassword,
  validateUsername,
  verifyPassword,
} from '../lib/security';

export interface User {
  username: string;
  email: string;
  createdAt: string;
}

interface AuthResult {
  success: boolean;
  message: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<AuthResult>;
  register: (username: string, email: string, password: string) => Promise<AuthResult>;
  saveProfile: (p: UserProfile) => void;
  logout: () => void;
  isLoggedIn: boolean;
  hasProfile: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const USERS_KEY = 'nutrilog_users';
const SESSION_KEY = 'nutrilog_session';
const LOGIN_GUARD_KEY = 'nutrilog_login_guard';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_LOCK_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const profileKey = (u: string) => `nutrilog_profile_${u}`;

// Admin credentials (seeded on first load)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'Admin123!';
const ADMIN_EMAIL = 'admin@nutrilog.app';

interface StoredUser {
  email: string;
  passwordHash?: string;
  password?: string;
  createdAt: string;
  isAdmin?: boolean;
}

type StoredUsers = Record<string, StoredUser>;

interface LoginGuard {
  failedCount: number;
  firstFailedAt: number;
  lockUntil?: number;
}

type LoginGuards = Record<string, LoginGuard>;

const isStoredUser = (value: unknown): value is StoredUser => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as StoredUser;
  return typeof candidate.email === 'string'
    && typeof candidate.createdAt === 'string'
    && (typeof candidate.passwordHash === 'string' || typeof candidate.password === 'string');
};

const loadUsers = (): StoredUsers => {
  try {
    const parsed = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    if (!parsed || typeof parsed !== 'object') return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => isStoredUser(value)),
    );
  } catch {
    return {};
  }
};

const saveUsers = (u: StoredUsers) => localStorage.setItem(USERS_KEY, JSON.stringify(u));

const loadLoginGuards = (): LoginGuards => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LOGIN_GUARD_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const saveLoginGuards = (guards: LoginGuards) => localStorage.setItem(LOGIN_GUARD_KEY, JSON.stringify(guards));

const getLoginLockMessage = (username: string) => {
  const guard = loadLoginGuards()[username];
  if (!guard?.lockUntil || guard.lockUntil <= Date.now()) return null;
  const minutes = Math.ceil((guard.lockUntil - Date.now()) / 60000);
  return `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
};

const recordFailedLogin = (username: string) => {
  const guards = loadLoginGuards();
  const now = Date.now();
  const current = guards[username];
  const failedCount = current && now - current.firstFailedAt < LOGIN_WINDOW_MS
    ? current.failedCount + 1
    : 1;
  guards[username] = {
    failedCount,
    firstFailedAt: failedCount === 1 ? now : current.firstFailedAt,
    lockUntil: failedCount >= MAX_LOGIN_ATTEMPTS ? now + LOGIN_LOCK_MS : undefined,
  };
  saveLoginGuards(guards);
};

const clearLoginGuard = (username: string) => {
  const guards = loadLoginGuards();
  delete guards[username];
  saveLoginGuards(guards);
};

const loadSession = (): User | null => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    if (!parsed) return null;
    if (parsed.user && parsed.expiresAt) {
      if (parsed.expiresAt <= Date.now()) { localStorage.removeItem(SESSION_KEY); return null; }
      return parsed.user;
    }
    return parsed.username ? parsed : null;
  } catch { return null; }
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

  // Seed admin account on first load
  useEffect(() => {
    const seedAdmin = async () => {
      const users = loadUsers();
      if (!users[ADMIN_USERNAME]) {
        users[ADMIN_USERNAME] = {
          email: ADMIN_EMAIL,
          passwordHash: await hashPassword(ADMIN_PASSWORD),
          createdAt: new Date().toISOString(),
          isAdmin: true,
        };
        saveUsers(users);
      }
    };
    seedAdmin();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user, expiresAt: Date.now() + SESSION_MAX_AGE_MS }));
    } else localStorage.removeItem(SESSION_KEY);
  }, [user]);

  const register = async (username: string, email: string, password: string) => {
    const u = normalizeUsername(username);
    const e = normalizeEmail(email);
    if (u === ADMIN_USERNAME) return { success: false, message: 'Username not available.' };
    const usernameError = validateUsername(u);
    const emailError = validateEmail(e);
    const passwordError = validatePassword(password);
    if (usernameError) return { success: false, message: usernameError };
    if (emailError) return { success: false, message: emailError };
    if (passwordError) return { success: false, message: passwordError };
    const users = loadUsers();
    if (users[u]) return { success: false, message: 'Username already taken.' };
    if (Object.values(users).some(x => x.email === e)) return { success: false, message: 'Email already registered.' };
    users[u] = { email: e, passwordHash: await hashPassword(password), createdAt: new Date().toISOString() };
    saveUsers(users);
    const newUser: User = { username: u, email: e, createdAt: users[u].createdAt };
    clearLoginGuard(u);
    setUser(newUser);
    setProfile(null);
    return { success: true, message: 'Account created!' };
  };

  const login = async (username: string, password: string) => {
    const u = normalizeUsername(username);
    if (!u || !password) return { success: false, message: 'Invalid username or password.' };
    const lockMessage = getLoginLockMessage(u);
    if (lockMessage) return { success: false, message: lockMessage };
    const users = loadUsers();
    const found = users[u];
    const validPassword = found?.passwordHash
      ? await verifyPassword(password, found.passwordHash)
      : found?.password === password;
    if (!found || !validPassword) { recordFailedLogin(u); return { success: false, message: 'Invalid username or password.' }; }
    if (!found.passwordHash) {
      users[u] = { email: found.email, createdAt: found.createdAt, passwordHash: await hashPassword(password) };
      saveUsers(users);
    }
    clearLoginGuard(u);
    const loggedIn: User = { username: u, email: found.email, createdAt: found.createdAt };
    setUser(loggedIn);
    setProfile(loadProfile(u));
    return { success: true, message: u === ADMIN_USERNAME ? 'Welcome, Admin!' : 'Welcome back!' };
  };

  const saveProfile = (p: UserProfile) => {
    if (!user) return;
    localStorage.setItem(profileKey(user.username), JSON.stringify(p));
    setProfile(p);
  };

  const logout = () => { setUser(null); setProfile(null); };

  const isAdmin = user?.username === ADMIN_USERNAME;

  return (
    <AuthContext.Provider value={{
      user, profile, isAdmin, login, register, saveProfile, logout,
      isLoggedIn: !!user, hasProfile: !!profile || isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
