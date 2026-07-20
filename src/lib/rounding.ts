/**
 * Smart currency-aware psychological rounding system.
 * Returns the closest "attractive" price within roughly 8% of the input price.
 * Never returns zero or a negative value.
 */
export function roundPrice(price: number, _currencyCode: string, decimals: number): number {
  if (price <= 0) {
    return decimals === 0 ? 1 : Number((0.01).toFixed(decimals))
  }

  // Define candidate generator based on decimal settings
  if (decimals === 0) {
    return roundZeroDecimals(price)
  } else if (decimals === 3) {
    return roundThreeDecimals(price)
  } else {
    return roundTwoDecimals(price)
  }
}

/**
 * Rounds zero-decimal currencies like JPY, KRW
 */
function roundZeroDecimals(price: number): number {
  const p = Math.round(price)
  if (p < 10) return Math.max(1, p)

  const candidates: { value: number; score: number }[] = []

  // Helper to add candidate and calculate score
  const addCandidate = (val: number, baseScore: number) => {
    const diffPercent = Math.abs(val - p) / p
    if (diffPercent <= 0.08 && val > 0) {
      // Score balances attractiveness (baseScore) with closeness
      const score = baseScore - diffPercent * 50
      candidates.push({ value: val, score })
    }
  }

  if (p < 100) {
    // Endings: 9, 5, 0
    for (let i = Math.floor(p / 10) - 1; i <= Math.floor(p / 10) + 1; i++) {
      addCandidate(i * 10 + 9, 10) // e.g. 79, 89
      addCandidate(i * 10 + 5, 6)  // e.g. 75, 85
      addCandidate(i * 10, 4)      // e.g. 70, 80
    }
  } else if (p < 1000) {
    // Endings: 90, 99, 49, 50, 00
    for (let i = Math.floor(p / 10) - 5; i <= Math.floor(p / 10) + 5; i++) {
      const val = i * 10
      if (val % 100 === 90) addCandidate(val, 10) // e.g. 890
      else if (val % 50 === 0) addCandidate(val, 5) // e.g. 850
      else addCandidate(val, 2)
    }
    // Also check ending in 99 and 49
    for (let i = Math.floor(p / 50) - 2; i <= Math.floor(p / 50) + 2; i++) {
      addCandidate(i * 50 - 1, 9)  // e.g. 849, 799
    }
  } else if (p < 10000) {
    // Endings: 900, 990, 500, 000
    // Try rounding to nearest 50, 100, 500, 1000
    const steps = [10, 50, 100, 500, 1000]
    for (const step of steps) {
      const rounded = Math.round(p / step) * step
      if (rounded % 1000 === 900) addCandidate(rounded, 10)
      else if (rounded % 100 === 90) addCandidate(rounded, 8)
      else if (rounded % 500 === 0) addCandidate(rounded, 7)
      else addCandidate(rounded, 3)

      addCandidate(rounded - 10, 9) // ends in 90 (if rounded to 100)
      addCandidate(rounded - 1, 8)  // ends in 99 (if rounded to 100)
    }
  } else {
    // Large values >= 10000
    // Round to nearest 100, 500, 1000, 5000, 10000
    const steps = [100, 500, 1000, 5000, 10000]
    for (const step of steps) {
      const rounded = Math.round(p / step) * step
      if (rounded % 10000 === 9000) addCandidate(rounded, 10)
      else if (rounded % 1000 === 900) addCandidate(rounded, 8)
      else if (rounded % 1000 === 0) addCandidate(rounded, 7)
      else addCandidate(rounded, 4)
    }
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score)
    return candidates[0].value
  }

  return p
}

/**
 * Rounds standard two-decimal currencies like USD, EUR, GBP
 */
function roundTwoDecimals(price: number): number {
  if (price < 1) {
    // Keep decimal precision, round to nearest 0.05 or 0.09
    const cents = Math.round(price * 100)
    if (cents <= 0) return 0.01
    const endings = [9, 5, 0]
    let bestVal = cents
    let minDist = 100
    for (const ending of endings) {
      const candidate = Math.round((cents - ending) / 10) * 10 + ending
      const dist = Math.abs(candidate - cents)
      if (dist < minDist && candidate > 0) {
        minDist = dist
        bestVal = candidate
      }
    }
    return Number((bestVal / 100).toFixed(2))
  }

  const p = price
  const candidates: { value: number; score: number }[] = []

  const addCandidate = (val: number, baseScore: number) => {
    const diffPercent = Math.abs(val - p) / p
    if (diffPercent <= 0.08 && val > 0) {
      const score = baseScore - diffPercent * 50
      candidates.push({ value: val, score })
    }
  }

  const whole = Math.floor(p)

  // Test psychological decimal endings: .99, .49, .95, .90, .00
  const checkDecimals = (w: number) => {
    addCandidate(w + 0.99, 10)
    addCandidate(w + 0.49, 8)
    addCandidate(w + 0.95, 7)
    addCandidate(w + 0.90, 6)
    addCandidate(w + 0.00, 5)
  }

  checkDecimals(whole)
  checkDecimals(whole - 1)
  checkDecimals(whole + 1)

  // If price is large (e.g. > 100), also consider rounding to nearest 5 or 10 minus .01
  if (p > 50) {
    const roundToStep = (val: number, step: number) => {
      const rounded = Math.round(val / step) * step
      addCandidate(rounded - 0.01, 9) // ends in 9.99, 4.99 etc
      addCandidate(rounded, 4)
    }
    roundToStep(p, 5)
    roundToStep(p, 10)
  }

  if (candidates.length > 0) {
    candidates.sort((a, b) => b.score - a.score)
    return Number(candidates[0].value.toFixed(2))
  }

  return Number(p.toFixed(2))
}

/**
 * Rounds three-decimal currencies like BHD, OMR, KWD
 */
function roundThreeDecimals(price: number): number {
  // Multiply by 10 to treat as 2-decimal, round, then divide back
  const p = price * 10
  const rounded = roundTwoDecimals(p)
  return Number((rounded / 10).toFixed(3))
}
