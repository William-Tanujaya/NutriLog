const HASH_PREFIX = "pbkdf2_sha256";
const PBKDF2_ITERATIONS = 210000;
const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_MAX_LENGTH = 128;
const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const encoder = new TextEncoder();

const toBase64 = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const fromBase64 = (value: string) => {
  const binary = atob(value);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
};

const constantTimeEqual = (left: Uint8Array, right: Uint8Array) => {
  const max = Math.max(left.length, right.length);
  let diff = left.length ^ right.length;

  for (let i = 0; i < max; i += 1) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }

  return diff === 0;
};

const derivePasswordHash = async (password: string, salt: Uint8Array, iterations: number) => {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    keyMaterial,
    256,
  );

  return new Uint8Array(bits);
};

export const normalizeUsername = (username: string) => username.trim().toLowerCase();

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const validateUsername = (username: string) => {
  if (!username) return "Username is required.";
  if (!USERNAME_PATTERN.test(username)) {
    return "Username must be 3-24 characters and use only lowercase letters, numbers, or underscores.";
  }
  return null;
};

export const validateEmail = (email: string) => {
  if (!email) return "Email is required.";
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return "Please enter a valid email address.";
  return null;
};

export const validatePassword = (password: string) => {
  if (!password) return "Password is required.";
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`;
  }
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return "Password must include uppercase, lowercase, and number characters.";
  }
  return null;
};

export const hashPassword = async (password: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasswordHash(password, salt, PBKDF2_ITERATIONS);
  return `${HASH_PREFIX}$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
};

export const verifyPassword = async (password: string, storedHash: string) => {
  const [prefix, iterationsValue, saltValue, hashValue] = storedHash.split("$");
  const iterations = Number(iterationsValue);

  if (prefix !== HASH_PREFIX || !Number.isInteger(iterations) || iterations < 100000 || !saltValue || !hashValue) {
    return false;
  }

  try {
    const expected = fromBase64(hashValue);
    const actual = await derivePasswordHash(password, fromBase64(saltValue), iterations);
    return constantTimeEqual(actual, expected);
  } catch {
    return false;
  }
};
