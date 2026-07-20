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
    baseCurrency: 'USD',
    displayMode: 'one-currency',
    displayCurrency: 'same-as-base',
    showLocalPrice: false,
  }

  it('should calculate FX-only conversion when S = 0', () => {
    const settings: FormSettings = {
      ...defaultSettings,
      adjustmentStrength: 0.0,
    }
    const result = calculateRegionalPrice(
      dummyCountry,
      settings,
      1.0, // baseFx: USD = 1.0
      1.0, // displayFx: USD = 1.0
      'USD',
      2,
      '$'
    )
    // basePriceUSD = 10 / 1.0 = 10
    // raw PPP = (0.8 / 0.9) ^ 0 = 1
    // Clamp floor: 0.2, ceiling: 1.2. Factor = 1.
    // rawSuggestedUSD = 10 * 1 = 10
    // rawRecommendedPrice = 10 * 1.0 = 10
    expect(result.recommendedPrice).toBe(10.0)
    expect(result.fxConvertedPrice).toBe(10.0)
    expect(result.discountPercent).toBe(0)
  })

  it('should calculate pure PPP conversion when S = 1', () => {
    const settings: FormSettings = {
      ...defaultSettings,
      adjustmentStrength: 1.0,
    }
    const result = calculateRegionalPrice(
      dummyCountry,
      settings,
      1.0, // baseFx
      1.0, // displayFx
      'USD',
      2,
      '$'
    )
    // basePriceUSD = 10
    // Factor = 0.8 / 0.9 = 0.8888
    // Clamped = 0.8888
    // rawSuggestedUSD = 10 * 0.8888 = 8.888
    // displayPrice = 8.888 * 1.0 = 8.888
    expect(result.recommendedPrice).toBeCloseTo(8.89, 2)
  })

  it('should calculate balanced blended pricing when S = 0.7', () => {
    const settings: FormSettings = {
      ...defaultSettings,
      adjustmentStrength: 0.7,
    }
    const result = calculateRegionalPrice(
      dummyCountry,
      settings,
      1.0,
      1.0,
      'USD',
      2,
      '$'
    )
    // Factor = (0.8 / 0.9) ^ 0.7 = 0.9213
    // suggestedPriceUSD = 10 * 0.9213 = 9.213
    expect(result.recommendedPrice).toBeCloseTo(9.21, 2)
  })

  it('should enforce the price floor', () => {
    const cheapCountry: CountryData = {
      ...dummyCountry,
      ppp: 0.05,
    }
    const settings: FormSettings = {
      ...defaultSettings,
      adjustmentStrength: 1.0,
      priceFloor: 0.3, // floor is 30% of base
    }
    const result = calculateRegionalPrice(
      cheapCountry,
      settings,
      1.0,
      1.0,
      'USD',
      2,
      '$'
    )
    // Factor = 0.05 / 0.9 = 0.0555 -> clamped to 0.3
    // suggestedPriceUSD = 10 * 0.3 = 3.0
    expect(result.recommendedPrice).toBe(3.0)
  })

  it('should enforce the price ceiling', () => {
    const expensiveCountry: CountryData = {
      ...dummyCountry,
      ppp: 2.5,
    }
    const settings: FormSettings = {
      ...defaultSettings,
      adjustmentStrength: 1.0,
      priceCeiling: 1.1, // ceiling is 110% of base
    }
    const result = calculateRegionalPrice(
      expensiveCountry,
      settings,
      1.0,
      1.0,
      'USD',
      2,
      '$'
    )
    // Factor = 2.5 / 0.9 = 2.77 -> clamped to 1.1
    // suggestedPriceUSD = 10 * 1.1 = 11.0
    expect(result.recommendedPrice).toBe(11.0)
  })

  it('should apply manual overrides correctly', () => {
    // Stored as USD equivalent: overrideValue = 12.0
    const result = calculateRegionalPrice(
      dummyCountry,
      defaultSettings,
      1.0,
      1.0,
      'USD',
      2,
      '$',
      12.0 // USD equivalent override
    )
    expect(result.recommendedPrice).toBe(12.0)
    expect(result.isOverride).toBe(true)
    expect(result.overrideValue).toBe(12.0)
  })

  // ACCEPTANCE TEST 1: USA remains baseline
  it('should preserve base price for United States when base/display is USD', () => {
    const usaCountry: CountryData = {
      name: 'United States',
      iso2: 'US',
      iso3: 'USA',
      region: 'North America',
      incomeGroup: 'High income',
      currencyCode: 'USD',
      currencyName: 'US Dollar',
      currencySymbol: '$',
      currencyDecimals: 2,
      ppp: 1.0,
      pppYear: 2024,
      fx: 1.0,
      fxYear: 2024,
      quality: 'Direct household PPP',
      dataSourceType: 'household',
    }
    const result = calculateRegionalPrice(
      usaCountry,
      defaultSettings,
      1.0,
      1.0,
      'USD',
      2,
      '$'
    )
    expect(result.recommendedPrice).toBe(10.0) // Must match defaultSettings.basePrice exactly!
  })

  // ACCEPTANCE TEST 2: Pakistan USD recommendation differs from USA USD recommendation
  it('should differentiate Pakistan price from USA due to buying power factor adjustment', () => {
    const pakistanCountry: CountryData = {
      name: 'Pakistan',
      iso2: 'PK',
      iso3: 'PAK',
      region: 'South Asia',
      incomeGroup: 'Lower middle income',
      currencyCode: 'PKR',
      currencyName: 'Pakistan Rupee',
      currencySymbol: 'Rs',
      currencyDecimals: 2,
      ppp: 45.0,
      pppYear: 2024,
      fx: 278.0,
      fxYear: 2024,
      quality: 'Direct household PPP',
      dataSourceType: 'household',
    }
    const settings: FormSettings = {
      ...defaultSettings,
      adjustmentStrength: 0.7,
      priceFloor: 0.20,
    }
    const result = calculateRegionalPrice(
      pakistanCountry,
      settings,
      1.0,
      1.0,
      'USD',
      2,
      '$'
    )
    // Factor = (45 / 278)^0.7 = 0.1618^0.7 = 0.281
    // Since floor is 0.20, it is not clamped.
    // suggestedPriceUSD = 10 * 0.2795 = 2.80 USD
    // USA suggestion is 10.0 USD.
    expect(result.recommendedPrice).toBeLessThan(10.0)
    expect(result.recommendedPrice).toBeCloseTo(2.80, 2)
  })

  // ACCEPTANCE TEST 3: Switching display currency updates correctly
  it('should convert recommended price when switching display currency', () => {
    const resultUSD = calculateRegionalPrice(
      dummyCountry,
      defaultSettings,
      1.0,
      1.0, // displayFx USD
      'USD',
      2,
      '$'
    )

    const resultEUR = calculateRegionalPrice(
      dummyCountry,
      defaultSettings,
      1.0,
      0.9, // displayFx EUR (1 USD = 0.9 EUR)
      'EUR',
      2,
      '€'
    )

    // resultEUR should be resultUSD * 0.9
    expect(resultEUR.recommendedPrice).toBeCloseTo(resultUSD.recommendedPrice * 0.9, 1)
  })
})
