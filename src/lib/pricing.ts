import type { CountryData, CalculationResult, FormSettings } from '../types/pricing'
import { roundPrice } from './rounding'

/**
 * Calculates regional price based on economic data, base currency, display currency, and bounds.
 */
export function calculateRegionalPrice(
  country: CountryData,
  settings: FormSettings,
  baseCurrencyFxPerUsd: number,
  displayCurrencyFxPerUsd: number,
  displayCurrencyCode: string,
  displayDecimals: number,
  displaySymbol: string,
  overrideValue: number | null = null, // Stored as neutral USD value!
): CalculationResult {
  const { basePrice, adjustmentStrength, priceFloor, priceCeiling, enablePsychologicalPricing, displayMode } = settings
  const { fx, ppp } = country

  // 1. Calculate regional affordability factor relative to US base factor (which is 1)
  const countryFactor = fx > 0 ? Math.pow(ppp / fx, adjustmentStrength) : 1
  let relativeFactor = countryFactor

  // 2. Apply configured minimum and maximum limits
  relativeFactor = Math.max(priceFloor, Math.min(priceCeiling, relativeFactor))

  // 3. Convert entered base price to USD
  const basePriceUSD = basePrice / baseCurrencyFxPerUsd

  // 4. Calculate country recommendation in USD
  let suggestedPriceUSD = 0
  if (overrideValue !== null) {
    // If override is present, it is already stored in neutral USD
    suggestedPriceUSD = overrideValue
  } else {
    suggestedPriceUSD = basePriceUSD * relativeFactor
  }

  // 5. Convert normalized recommendation to display currency
  let rawRecommendedPrice = 0
  if (displayMode === 'one-currency') {
    rawRecommendedPrice = suggestedPriceUSD * displayCurrencyFxPerUsd
  } else {
    rawRecommendedPrice = suggestedPriceUSD * fx
  }

  // 6. Apply psychological rounding according to display settings
  const roundingCurrency = displayMode === 'one-currency' ? displayCurrencyCode : country.currencyCode
  const roundingDecimals = displayMode === 'one-currency' ? displayDecimals : country.currencyDecimals

  let recommendedPrice = 0
  // Bypass psychological rounding for USA reference market when display matches base/USD
  if (country.iso3 === 'USA') {
    recommendedPrice = Number(rawRecommendedPrice.toFixed(roundingDecimals))
  } else if (enablePsychologicalPricing) {
    recommendedPrice = roundPrice(rawRecommendedPrice, roundingCurrency, roundingDecimals)
  } else {
    recommendedPrice = Number(rawRecommendedPrice.toFixed(roundingDecimals))
  }

  // 7. Calculate local suggested price (always in local currency, for checkout suggestion)
  const rawLocalPrice = suggestedPriceUSD * fx
  let recommendedLocalPrice = 0
  if (country.iso3 === 'USA') {
    recommendedLocalPrice = Number(rawLocalPrice.toFixed(country.currencyDecimals))
  } else if (enablePsychologicalPricing) {
    recommendedLocalPrice = roundPrice(rawLocalPrice, country.currencyCode, country.currencyDecimals)
  } else {
    recommendedLocalPrice = Number(rawLocalPrice.toFixed(country.currencyDecimals))
  }

  // 8. Calculate direct conversion of base price in the current display format
  let fxConvertedPrice = 0
  if (displayMode === 'one-currency') {
    fxConvertedPrice = basePriceUSD * displayCurrencyFxPerUsd
  } else {
    fxConvertedPrice = basePriceUSD * fx
  }

  // 9. Format display suggested price
  let recommendedPriceFormatted = ''
  try {
    recommendedPriceFormatted = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: roundingCurrency,
      minimumFractionDigits: roundingDecimals,
      maximumFractionDigits: roundingDecimals,
    }).format(recommendedPrice)
  } catch {
    const symbol = displayMode === 'one-currency' ? displaySymbol : (country.currencySymbol || country.currencyCode)
    recommendedPriceFormatted = `${symbol}${recommendedPrice.toFixed(roundingDecimals)}`
  }

  // 10. Format local suggested price
  let recommendedLocalPriceFormatted = ''
  try {
    recommendedLocalPriceFormatted = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: country.currencyCode,
      minimumFractionDigits: country.currencyDecimals,
      maximumFractionDigits: country.currencyDecimals,
    }).format(recommendedLocalPrice)
  } catch {
    const symbol = country.currencySymbol || country.currencyCode
    recommendedLocalPriceFormatted = `${symbol}${recommendedLocalPrice.toFixed(country.currencyDecimals)}`
  }

  // 11. Calculate difference relative to direct conversion
  const discountPercent = fxConvertedPrice > 0
    ? ((fxConvertedPrice - recommendedPrice) / fxConvertedPrice) * 100
    : 0

  const difference = recommendedPrice - fxConvertedPrice

  return {
    country,
    fxConvertedPrice,
    rawRegionalPrice: rawRecommendedPrice,
    recommendedPrice,
    recommendedPriceFormatted,
    rawRecommendedPrice,
    discountPercent,
    difference,
    isOverride: overrideValue !== null,
    overrideValue,
    recommendedLocalPrice,
    recommendedLocalPriceFormatted,
    factor: relativeFactor,
  }
}
