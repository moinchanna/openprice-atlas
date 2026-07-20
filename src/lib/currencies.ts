import type { CountryData } from '../types/pricing'

export interface CurrencyInfo {
  code: string
  name: string
  symbol: string
  decimals: number
  fxPerUsd: number
}

// Ordered common currencies list
const COMMON_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'PKR']

/**
 * Parses countries list to find all unique currencies with reliable exchange rates.
 */
export function getSupportedCurrencies(countries: CountryData[]): CurrencyInfo[] {
  const currencyMap = new Map<string, CurrencyInfo>()

  // Always seed USD reference currency
  currencyMap.set('USD', {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    decimals: 2,
    fxPerUsd: 1.0,
  })

  for (const c of countries) {
    if (!c.currencyCode) continue
    
    const code = c.currencyCode.toUpperCase()
    const fx = Number(c.fx)

    // Skip if exchange rate is invalid/missing
    if (isNaN(fx) || fx <= 0) continue

    // If currency not added, or current record is more reliable (i.e. not USD if code isn't USD)
    const existing = currencyMap.get(code)
    if (!existing || (existing.fxPerUsd === 1.0 && code !== 'USD')) {
      currencyMap.set(code, {
        code,
        name: c.currencyName || code,
        symbol: c.currencySymbol || code,
        decimals: typeof c.currencyDecimals === 'number' ? c.currencyDecimals : 2,
        fxPerUsd: fx,
      })
    }
  }

  const allCurrencies = Array.from(currencyMap.values())

  // Sort: common currencies first in specified order, then others alphabetically by code
  allCurrencies.sort((a, b) => {
    const idxA = COMMON_CURRENCIES.indexOf(a.code)
    const idxB = COMMON_CURRENCIES.indexOf(b.code)

    if (idxA !== -1 && idxB !== -1) {
      return idxA - idxB
    }
    if (idxA !== -1) return -1
    if (idxB !== -1) return 1

    return a.code.localeCompare(b.code)
  })

  return allCurrencies
}
