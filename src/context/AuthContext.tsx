import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  username: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => { success: boolean; message: string };
  register: (username: string, email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = 'nutrilog_users';
const SESSION_KEY = 'nutrilog_session';

const loadUsers = (): Record<string, { email: string; password: string; createdAt: string }> => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const saveUsers = (users: Record<string, { email: string; password: string; createdAt: string }>) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const loadSession = (): User | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadSession);

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  }, [user]);

  const register = (username: string, email: string, password: string) => {
    const trimUser = username.trim().toLowerCase();
    const trimEmail = email.trim().toLowerCase();

    if (!trimUser || !trimEmail || !password)
      return { success: false, message: 'All fields are required.' };
    if (trimUser.length < 3)
      return { success: false, message: 'Username must be at least 3 characters.' };
    if (password.length < 6)
      return { success: false, message: 'Password must be at least 6 characters.' };
    if (!trimEmail.includes('@'))
      return { success: false, message: 'Please enter a valid email.' };

    const users = loadUsers();
    if (users[trimUser])
      return { success: false, message: 'Username already taken.' };

    const emailTaken = Object.values(users).some(u => u.email === trimEmail);
    if (emailTaken)
      return { success: false, message: 'Email already registered.' };

    users[trimUser] = { email: trimEmail, password, createdAt: new Date().toISOString() };
    saveUsers(users);

    const newUser: User = { username: trimUser, email: trimEmail, createdAt: users[trimUser].createdAt };
    setUser(newUser);
    return { success: true, message: 'Account created!' };
  };

  const login = (username: string, password: string) => {
    const trimUser = username.trim().toLowerCase();
    if (!trimUser || !password)
      return { success: false, message: 'Please fill in all fields.' };

    const users = loadUsers();
    const found = users[trimUser];
    if (!found)
      return { success: false, message: 'Username not found.' };
    if (found.password !== password)
      return { success: false, message: 'Incorrect password.' };

    const loggedIn: User = { username: trimUser, email: found.email, createdAt: found.createdAt };
    setUser(loggedIn);
    return { success: true, message: 'Welcome back!' };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
