export type PricingStrategy = 'revenue' | 'balanced' | 'accessibility' | 'custom'

export type BillingPeriod = 'monthly' | 'yearly'

export interface CountryData {
  name: string
  iso2: string
  iso3: string
  region: string
  incomeGroup: string
  currencyCode: string
  currencyName: string
  currencySymbol: string
  currencyDecimals: number
  ppp: number
  pppYear: number | null
  fx: number
  fxYear: number | null
  quality: string
  dataSourceType: string
}

export interface CalculationResult {
  country: CountryData
  fxConvertedPrice: number
  rawRegionalPrice: number
  recommendedPrice: number
  recommendedPriceFormatted: string
  rawRecommendedPrice: number // before rounding
  discountPercent: number
  difference: number
  isOverride: boolean
  overrideValue: number | null
}

export interface FormSettings {
  productName: string
  basePrice: number
  billingPeriod: BillingPeriod
  strategy: PricingStrategy
  adjustmentStrength: number
  enablePsychologicalPricing: boolean
  priceFloor: number // e.g. 0.20 for 20%
  priceCeiling: number // e.g. 1.20 for 120%
}
