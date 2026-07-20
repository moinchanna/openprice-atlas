import type { CountryData, CalculationResult, FormSettings } from '../types/pricing'
import { roundPrice } from './rounding'

/**
 * Calculates regional price based on economic data, strategy strength, floor, ceiling, and rounding.
 */
export function calculateRegionalPrice(
  country: CountryData,
  settings: FormSettings,
  overrideValue: number | null = null,
): CalculationResult {
  const { basePrice, adjustmentStrength, priceFloor, priceCeiling, enablePsychologicalPricing } = settings
  const { fx, ppp } = country

  // 1. Calculate standard FX converted price
  const fxConvertedPrice = basePrice * fx

  let rawRegionalPrice = 0
  let rawRecommendedPrice = 0
  let recommendedPrice = 0

  if (overrideValue !== null) {
    // If there is a manual override, we use it directly
    rawRegionalPrice = basePrice * Math.pow(fx, 1 - adjustmentStrength) * Math.pow(ppp, adjustmentStrength)
    rawRecommendedPrice = overrideValue
    recommendedPrice = overrideValue
  } else {
    // 2. Blended regional pricing formula:
    // rawLocalPrice = B * FX^(1-S) * PPP^S
    rawRegionalPrice = basePrice * Math.pow(fx, 1 - adjustmentStrength) * Math.pow(ppp, adjustmentStrength)

    // 3. Apply floor and ceiling clamps
    const minimumPrice = fxConvertedPrice * priceFloor
    const maximumPrice = fxConvertedPrice * priceCeiling

    rawRecommendedPrice = Math.max(minimumPrice, Math.min(maximumPrice, rawRegionalPrice))

    // 4. Apply psychological pricing rounding
    if (enablePsychologicalPricing) {
      recommendedPrice = roundPrice(rawRecommendedPrice, country.currencyCode, country.currencyDecimals)
    } else {
      // Keep natural decimals based on currency
      recommendedPrice = Number(rawRecommendedPrice.toFixed(country.currencyDecimals))
    }
  }

  // Formatting using Intl.NumberFormat
  let recommendedPriceFormatted = ''
  try {
    recommendedPriceFormatted = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: country.currencyCode,
      minimumFractionDigits: country.currencyDecimals,
      maximumFractionDigits: country.currencyDecimals,
    }).format(recommendedPrice)
  } catch {
    // Fallback if browser does not support standard formatting
    const symbol = country.currencySymbol || country.currencyCode
    recommendedPriceFormatted = `${symbol}${recommendedPrice.toFixed(country.currencyDecimals)}`
  }

  // Calculate discount percentage relative to standard FX price
  // A positive discount percent means the regional price is cheaper than standard FX
  const discountPercent = fxConvertedPrice > 0
    ? ((fxConvertedPrice - recommendedPrice) / fxConvertedPrice) * 100
    : 0

  const difference = recommendedPrice - fxConvertedPrice

  return {
    country,
    fxConvertedPrice,
    rawRegionalPrice,
    recommendedPrice,
    recommendedPriceFormatted,
    rawRecommendedPrice,
    discountPercent,
    difference,
    isOverride: overrideValue !== null,
    overrideValue,
  }
}
