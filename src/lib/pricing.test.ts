import { describe, it, expect } from 'vitest'
import { calculateRegionalPrice } from './pricing'
import type { CountryData, FormSettings } from '../types/pricing'

describe('Pricing Formula and Calculation Tests', () => {
  const dummyCountry: CountryData = {
    name: 'Testland',
    iso2: 'TL',
    iso3: 'TLS',
    region: 'East Asia & Pacific',
    incomeGroup: 'Upper middle income',
    currencyCode: 'EUR',
    currencyName: 'Euro',
    currencySymbol: '€',
    currencyDecimals: 2,
    ppp: 0.8, // 1 USD = 0.8 international dollars
    pppYear: 2024,
    fx: 0.9, // 1 USD = 0.9 EUR
    fxYear: 2024,
    quality: 'Direct household PPP',
    dataSourceType: 'household',
  }

  const defaultSettings: FormSettings = {
    productName: 'My SaaS',
    basePrice: 10.0,
    billingPeriod: 'monthly',
    strategy: 'balanced',
    adjustmentStrength: 0.7,
    enablePsychologicalPricing: false, // disable to test raw math
    priceFloor: 0.2,
    priceCeiling: 1.2,
  }

  it('should calculate FX-only conversion when S = 0', () => {
    const settings: FormSettings = {
      ...defaultSettings,
      adjustmentStrength: 0.0,
    }
    const result = calculateRegionalPrice(dummyCountry, settings)
    // rawLocalPrice = B * FX = 10 * 0.9 = 9.0
    expect(result.recommendedPrice).toBe(9.0)
    expect(result.fxConvertedPrice).toBe(9.0)
    expect(result.discountPercent).toBe(0)
  })

  it('should calculate pure PPP conversion when S = 1', () => {
    const settings: FormSettings = {
      ...defaultSettings,
      adjustmentStrength: 1.0,
    }
    const result = calculateRegionalPrice(dummyCountry, settings)
    // rawLocalPrice = B * PPP = 10 * 0.8 = 8.0
    expect(result.recommendedPrice).toBe(8.0)
    expect(result.fxConvertedPrice).toBe(9.0)
    expect(result.discountPercent).toBeCloseTo(11.11, 2) // (9 - 8)/9 = 11.11%
  })

  it('should calculate balanced blended pricing when S = 0.7', () => {
    const settings: FormSettings = {
      ...defaultSettings,
      adjustmentStrength: 0.7,
    }
    const result = calculateRegionalPrice(dummyCountry, settings)
    // rawLocalPrice = B * FX^(1-S) * PPP^S = 10 * (0.9^0.3) * (0.8^0.7)
    // 0.9^0.3 = 0.9688
    // 0.8^0.7 = 0.8550
    // 10 * 0.9688 * 0.8550 = 8.2877
    expect(result.recommendedPrice).toBeCloseTo(8.29, 2)
  })

  it('should enforce the price floor', () => {
    // If PPP is very low, e.g. 0.1
    const cheapCountry: CountryData = {
      ...dummyCountry,
      ppp: 0.05,
    }
    const settings: FormSettings = {
      ...defaultSettings,
      adjustmentStrength: 1.0, // pure PPP
      priceFloor: 0.3, // floor is 30% of FX price
    }
    const result = calculateRegionalPrice(cheapCountry, settings)
    // fxPrice = 10 * 0.9 = 9.0
    // raw PPP price = 10 * 0.05 = 0.5
    // floor price = 9.0 * 0.3 = 2.7
    // recommended should be clamped to 2.7
    expect(result.recommendedPrice).toBe(2.7)
  })

  it('should enforce the price ceiling', () => {
    // If PPP is very high, e.g. 2.5
    const expensiveCountry: CountryData = {
      ...dummyCountry,
      ppp: 2.5,
      fx: 0.9,
    }
    const settings: FormSettings = {
      ...defaultSettings,
      adjustmentStrength: 1.0, // pure PPP
      priceCeiling: 1.1, // ceiling is 110% of FX price
    }
    const result = calculateRegionalPrice(expensiveCountry, settings)
    // fxPrice = 10 * 0.9 = 9.0
    // raw PPP price = 10 * 2.5 = 25.0
    // ceiling price = 9.0 * 1.1 = 9.9
    // recommended should be clamped to 9.9
    expect(result.recommendedPrice).toBe(9.9)
  })

  it('should apply manual overrides correctly', () => {
    const result = calculateRegionalPrice(dummyCountry, defaultSettings, 15.0)
    expect(result.recommendedPrice).toBe(15.0)
    expect(result.isOverride).toBe(true)
    expect(result.overrideValue).toBe(15.0)
  })
})
