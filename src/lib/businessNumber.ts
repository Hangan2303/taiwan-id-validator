export interface BizCalcStep {
  position: string;
  digit: number;
  weight: number;
  product: number;
  afterSplit: number;
  note?: string;
}

export interface BizValidationResult {
  valid: boolean;
  steps: BizCalcStep[];
  d7Special: boolean;
  sum1: number;
  sum2: number | null; // only when d7Special
  error?: string;
}

export interface BizGenerationResult {
  number: string;
  steps: BizCalcStep[];
  d7Special: boolean;
  sum1: number;
  sum2: number | null;
}

const WEIGHTS = [1, 2, 1, 2, 1, 2, 4, 1];

// Apply one level of digit-splitting: if product >= 10, sum its digits once.
function splitSum(n: number): number {
  if (n < 10) return n;
  return Math.floor(n / 10) + (n % 10);
}

function buildBizSteps(digits: number[]): { steps: BizCalcStep[]; d7Special: boolean; sum1: number; sum2: number | null } {
  const d7Special = digits[6] === 7;
  const steps: BizCalcStep[] = [];

  let baseSum = 0; // sum excluding position 6 when d7Special
  let pos6Contribution = 0;

  for (let i = 0; i < 8; i++) {
    const digit = digits[i];
    const weight = WEIGHTS[i];
    const product = digit * weight;
    const afterSplit = splitSum(product);

    let note: string | undefined;
    let contribution = afterSplit;

    if (i === 6 && d7Special) {
      // D7=7: 7×4=28 → 2+8=10 → two interpretations: 1+0=1 (sum1) or 0 (sum2)
      note = '7×4=28 → 2+8=10 → counts as 1 or 0 (special)';
      pos6Contribution = 1; // sum1 uses 1 (1+0)
      contribution = 1;
    } else if (product >= 10) {
      note = `${product} → ${Math.floor(product / 10)}+${product % 10}=${afterSplit}`;
    }

    steps.push({ position: `D${i + 1}`, digit, weight, product, afterSplit, note });
    if (i !== 6 || !d7Special) {
      baseSum += contribution;
    }
  }

  if (d7Special) {
    const sum1 = baseSum + 1; // position 6 contributes 1
    const sum2 = baseSum + 0; // position 6 contributes 0
    return { steps, d7Special, sum1, sum2 };
  }

  return { steps, d7Special, sum1: baseSum, sum2: null };
}

export function validateBusinessNumber(input: string): BizValidationResult {
  const s = input.trim();

  if (s.length !== 8) {
    return { valid: false, steps: [], d7Special: false, sum1: 0, sum2: null, error: 'Must be exactly 8 digits.' };
  }
  if (!/^\d{8}$/.test(s)) {
    return { valid: false, steps: [], d7Special: false, sum1: 0, sum2: null, error: 'Must contain only digits.' };
  }

  const digits = s.split('').map(Number);
  const { steps, d7Special, sum1, sum2 } = buildBizSteps(digits);

  const valid = d7Special
    ? sum1 % 5 === 0 || (sum2 as number) % 5 === 0
    : sum1 % 5 === 0;

  return { valid, steps, d7Special, sum1, sum2 };
}

export function generateBusinessNumber(): BizGenerationResult {
  for (let attempt = 0; attempt < 50; attempt++) {
    const d1to7 = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10));
    const d7Special = d1to7[6] === 7;

    // Partial sum for D1–D7
    let partialBase = 0;
    let pos6Contrib = 0;
    for (let i = 0; i < 7; i++) {
      const product = d1to7[i] * WEIGHTS[i];
      const after = splitSum(product);
      if (i === 6 && d7Special) {
        pos6Contrib = 1; // sum1 path: contributes 1
      } else {
        partialBase += after;
      }
    }

    // Find D8 (0–9) such that (partialBase + pos6Contrib + D8) % 5 === 0
    // or, if d7Special, also check the sum2 path (pos6Contrib=0)
    let foundD8 = -1;
    for (let d8 = 0; d8 <= 9; d8++) {
      const s1 = partialBase + pos6Contrib + d8;
      const s2 = d7Special ? partialBase + 0 + d8 : null;
      if (s1 % 5 === 0 || (s2 !== null && s2 % 5 === 0)) {
        foundD8 = d8;
        break;
      }
    }

    if (foundD8 === -1) continue;

    const digits = [...d1to7, foundD8];
    const { steps, sum1, sum2 } = buildBizSteps(digits);
    return { number: digits.join(''), steps, d7Special, sum1, sum2 };
  }

  // Fallback: guaranteed valid — D7=1, find D8
  const digits = [1, 2, 3, 4, 5, 6, 1, 0];
  let partialBase = 0;
  for (let i = 0; i < 7; i++) {
    partialBase += splitSum(digits[i] * WEIGHTS[i]);
  }
  for (let d8 = 0; d8 <= 9; d8++) {
    if ((partialBase + d8) % 5 === 0) { digits[7] = d8; break; }
  }
  const { steps, sum1, sum2 } = buildBizSteps(digits);
  return { number: digits.join(''), steps, d7Special: false, sum1, sum2 };
}
