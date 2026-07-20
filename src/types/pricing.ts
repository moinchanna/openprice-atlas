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
  fxConvertedPrice: number // converted directly from base (to display currency or local currency)
  rawRegionalPrice: number
  recommendedPrice: number // final displayed suggested price (rounded to display or local currency)
  recommendedPriceFormatted: string
  rawRecommendedPrice: number
  discountPercent: number
  difference: number
  isOverride: boolean
  overrideValue: number | null // Stored as neutral USD value!
  recommendedLocalPrice: number // suggested local price
  recommendedLocalPriceFormatted: string
  factor: number // regional affordability factor
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
  baseCurrency: string
  displayMode: 'one-currency' | 'local'
  displayCurrency: string // e.g. 'same-as-base' or a specific code like 'EUR'
  showLocalPrice: boolean
}
