export type IdType = 'national' | 'newui';

export interface CalcStep {
  position: string;
  value: number;
  weight: number;
  contribution: number;
}

export interface NationalIdValidationResult {
  valid: boolean;
  idType: IdType | null;
  steps: CalcStep[];
  total: number;
  error?: string;
}

export interface NationalIdGenerationResult {
  id: string;
  idType: IdType;
  steps: CalcStep[];
  total: number;
}

// Letter-to-2-digit-code map per Taiwan area table
const LETTER_CODES: Record<string, number> = {
  A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, G: 16, H: 17, I: 34,
  J: 18, K: 19, L: 20, M: 21, N: 22, O: 35, P: 23, Q: 24, R: 25,
  S: 26, T: 27, U: 28, V: 29, W: 32, X: 30, Y: 31, Z: 33,
};

const LETTERS = Object.keys(LETTER_CODES);

function buildSteps(x1: number, x2: number, digits: number[]): CalcStep[] {
  return [
    { position: 'X₁ (letter, high)', value: x1, weight: 1, contribution: x1 * 1 },
    { position: 'X₂ (letter, low)',  value: x2, weight: 9, contribution: x2 * 9 },
    { position: 'D1 (gender/type)',  value: digits[0], weight: 8, contribution: digits[0] * 8 },
    { position: 'D2', value: digits[1], weight: 7, contribution: digits[1] * 7 },
    { position: 'D3', value: digits[2], weight: 6, contribution: digits[2] * 6 },
    { position: 'D4', value: digits[3], weight: 5, contribution: digits[3] * 5 },
    { position: 'D5', value: digits[4], weight: 4, contribution: digits[4] * 4 },
    { position: 'D6', value: digits[5], weight: 3, contribution: digits[5] * 3 },
    { position: 'D7', value: digits[6], weight: 2, contribution: digits[6] * 2 },
    { position: 'D8', value: digits[7], weight: 1, contribution: digits[7] * 1 },
    { position: 'D9 (checksum)',     value: digits[8], weight: 1, contribution: digits[8] * 1 },
  ];
}

export function validateNationalId(input: string): NationalIdValidationResult {
  const id = input.trim().toUpperCase();

  if (id.length !== 10) {
    return { valid: false, idType: null, steps: [], total: 0, error: 'Must be exactly 10 characters (1 letter + 9 digits).' };
  }

  const letter = id[0];
  if (!(letter in LETTER_CODES)) {
    return { valid: false, idType: null, steps: [], total: 0, error: 'First character must be a letter A–Z.' };
  }

  const rest = id.slice(1);
  if (!/^\d{9}$/.test(rest)) {
    return { valid: false, idType: null, steps: [], total: 0, error: 'Characters 2–10 must all be digits.' };
  }

  const code = LETTER_CODES[letter];
  const x1 = Math.floor(code / 10);
  const x2 = code % 10;
  const digits = rest.split('').map(Number);
  const d1 = digits[0];

  let idType: IdType | null = null;
  if (d1 === 1 || d1 === 2) idType = 'national';
  else if (d1 === 8 || d1 === 9) idType = 'newui';
  else {
    return { valid: false, idType: null, steps: [], total: 0, error: 'Second character must be 1 or 2 (National ID) or 8 or 9 (New UI Number).' };
  }

  const steps = buildSteps(x1, x2, digits);
  const total = steps.reduce((sum, s) => sum + s.contribution, 0);
  const valid = total % 10 === 0;

  return { valid, idType, steps, total };
}

export function generateNationalId(idType: IdType): NationalIdGenerationResult {
  const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  const code = LETTER_CODES[letter];
  const x1 = Math.floor(code / 10);
  const x2 = code % 10;

  const d1Options = idType === 'national' ? [1, 2] : [8, 9];
  const d1 = d1Options[Math.floor(Math.random() * 2)];
  const bodyDigits = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10));
  const digits8 = [d1, ...bodyDigits];

  // S without D9 = X1*1 + X2*9 + D1*8 + D2*7 + ... + D8*1
  const partial =
    x1 * 1 + x2 * 9 +
    digits8[0] * 8 + digits8[1] * 7 + digits8[2] * 6 + digits8[3] * 5 +
    digits8[4] * 4 + digits8[5] * 3 + digits8[6] * 2 + digits8[7] * 1;

  const d9 = (10 - (partial % 10)) % 10;
  const allDigits = [...digits8, d9];

  const steps = buildSteps(x1, x2, allDigits);
  const total = steps.reduce((sum, s) => sum + s.contribution, 0);
  const id = letter + allDigits.join('');

  return { id, idType, steps, total };
}
