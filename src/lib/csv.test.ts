import { describe, it, expect } from 'vitest'
import { escapeCSVField, generateCSV } from './csv'
import type { CalculationResult, FormSettings } from '../types/pricing'

describe('CSV Export Tests', () => {
  it('should properly escape CSV cells', () => {
    // Normal field
    expect(escapeCSVField('hello')).toBe('hello')
    expect(escapeCSVField(123)).toBe('123')
    expect(escapeCSVField(null)).toBe('')

    // Commas
    expect(escapeCSVField('hello, world')).toBe('"hello, world"')

    // Double quotes
    expect(escapeCSVField('He said "yes"')).toBe('"He said ""yes"""')

    // Newlines
    expect(escapeCSVField('line 1\nline 2')).toBe('"line 1\nline 2"')
  })

  it('should generate valid CSV structure', () => {
    const dummyCountry = {
      name: 'South Korea',
      iso2: 'KR',
      iso3: 'KOR',
      region: 'East Asia & Pacific',
      incomeGroup: 'High income',
      currencyCode: 'KRW',
      currencyName: 'South Korean Won',
      currencySymbol: '₩',
      currencyDecimals: 0,
      ppp: 850,
      pppYear: 2024,
      fx: 1300,
      fxYear: 2024,
      quality: 'Direct household PPP',
      dataSourceType: 'household',
    }

    const settings: FormSettings = {
      productName: 'My SaaS',
      basePrice: 9.99,
      billingPeriod: 'monthly',
      strategy: 'balanced',
      adjustmentStrength: 0.7,
      enablePsychologicalPricing: true,
      priceFloor: 0.2,
      priceCeiling: 1.2,
      baseCurrency: 'USD',
      displayMode: 'one-currency',
      displayCurrency: 'same-as-base',
      showLocalPrice: false,
    }

    const result: CalculationResult = {
      country: dummyCountry,
      fxConvertedPrice: 12987,
      rawRegionalPrice: 10450,
      recommendedPrice: 9900,
      recommendedPriceFormatted: '₩9,900',
      rawRecommendedPrice: 10450,
      discountPercent: 23.77,
      difference: -3087,
      isOverride: false,
      overrideValue: null,
      recommendedLocalPrice: 9900,
      recommendedLocalPriceFormatted: '₩9,900',
      factor: 0.8,
    }

    const csv = generateCSV([result], settings, 'USD')

    expect(csv).toContain('My SaaS')
    expect(csv).toContain('South Korea')
    expect(csv).toContain('KOR')
    expect(csv).toContain('9900')
  })
})
