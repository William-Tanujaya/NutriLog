export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';
export type Goal = 'cutting' | 'maintenance' | 'bulking';

export interface UserProfile {
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  activity: ActivityLevel;
  goal: Goal;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

export const calculateBMR = (p: UserProfile): number => {
  const base = 10 * p.weight + 6.25 * p.height - 5 * p.age;
  return p.gender === 'male' ? base + 5 : base - 161;
};

export const calculateTDEE = (p: UserProfile): number => {
  return Math.round(calculateBMR(p) * ACTIVITY_MULTIPLIER[p.activity]);
};

export const calculateDailyGoals = (p: UserProfile): DailyGoals => {
  const tdee = calculateTDEE(p);
  const calories =
    p.goal === 'cutting' ? tdee - 500 :
    p.goal === 'bulking' ? tdee + 300 : tdee;
  const protein = Math.round(
    p.goal === 'cutting' ? p.weight * 2.2 :
    p.goal === 'bulking' ? p.weight * 1.8 :
    p.weight * 1.6
  );
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);
  return { calories, protein, carbs: Math.max(carbs, 50), fat };
};

export const calculateBMI = (p: UserProfile): number =>
  p.weight / Math.pow(p.height / 100, 2);

export interface BMIInfo {
  value: number;
  category: string;
  color: string;
  advice: string;
}

export const getBMIInfo = (p: UserProfile): BMIInfo => {
  const bmi = calculateBMI(p);
  if (bmi < 18.5) return { value: bmi, category: 'Underweight', color: '#4fa3d1', advice: 'Consider increasing calorie intake with nutritious foods.' };
  if (bmi < 25)   return { value: bmi, category: 'Normal Weight', color: '#4CAF50', advice: 'Great! Maintain your current healthy lifestyle.' };
  if (bmi < 30)   return { value: bmi, category: 'Overweight', color: '#FF8C42', advice: 'A slight calorie deficit with regular exercise is recommended.' };
  return { value: bmi, category: 'Obese', color: '#ef4444', advice: 'Consult a doctor and aim for a consistent calorie deficit.' };
};

export const GOAL_INFO = {
  cutting:     { label: 'Cutting 🔥',     desc: 'Lose fat while preserving muscle',  color: '#ef4444', bg: 'bg-red-500/10',       border: 'border-red-500/20',        filter: (cal: number) => cal <= 400 },
  maintenance: { label: 'Maintenance ⚖️', desc: 'Stay healthy and balanced',         color: '#4CAF50', bg: 'bg-[#4CAF50]/10',     border: 'border-[#4CAF50]/20',      filter: (cal: number) => cal >= 250 && cal <= 550 },
  bulking:     { label: 'Bulking 💪',     desc: 'Build muscle with calorie surplus', color: '#FF8C42', bg: 'bg-[#FF8C42]/10',     border: 'border-[#FF8C42]/20',      filter: (cal: number) => cal >= 400 },
};

export const ACTIVITY_INFO: Record<ActivityLevel, { label: string; desc: string }> = {
  sedentary: { label: 'Sedentary',         desc: 'Little or no exercise' },
  light:     { label: 'Lightly Active',    desc: 'Exercise 1–3 days/week' },
  moderate:  { label: 'Moderately Active', desc: 'Exercise 3–5 days/week' },
  active:    { label: 'Very Active',       desc: 'Exercise 6–7 days/week' },
};
