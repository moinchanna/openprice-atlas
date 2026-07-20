import React from 'react'
import type { CalculationResult, FormSettings } from '../types/pricing'

interface SummaryCardsProps {
  results: CalculationResult[]
  settings: FormSettings
  baseCurrencyFxPerUsd: number
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  results,
  settings,
  baseCurrencyFxPerUsd,
}) => {
  if (results.length === 0) return null

  const { displayMode, basePrice, baseCurrency } = settings

  // Calculate Median Discount Percent
  const ratios = results
    .map(r => (r.fxConvertedPrice > 0 ? (r.recommendedPrice / r.fxConvertedPrice) * 100 : 100))
    .sort((a, b) => a - b)
  
  let medianPercentOfFX = 100
  if (ratios.length > 0) {
    const mid = Math.floor(ratios.length / 2)
    medianPercentOfFX = ratios.length % 2 !== 0 ? ratios[mid] : (ratios[mid - 1] + ratios[mid]) / 2
  }

  const discountPercent = 100 - medianPercentOfFX
  const discountLabel = discountPercent >= 0
    ? `${discountPercent.toFixed(0)}% LOWER`
    : `${Math.abs(discountPercent).toFixed(0)}% HIGHER`

  // Helper to resolve comparable USD price for sorting price ranges
  const getUSDPrice = (r: CalculationResult) => {
    if (r.isOverride && r.overrideValue !== null) return r.overrideValue
    const basePriceUSD = basePrice / baseCurrencyFxPerUsd
    return basePriceUSD * r.factor
  }

  // Sort by comparable USD value
  const sortedByUSD = [...results].sort((a, b) => getUSDPrice(a) - getUSDPrice(b))
  const lowestMarket = sortedByUSD[0]
  const highestMarket = sortedByUSD[sortedByUSD.length - 1]

  const totalCountries = results.length

  // Helper to format values for range strip
  const formatRangeValue = (r: CalculationResult) => {
    if (displayMode === 'one-currency') {
      return `${r.country.iso3}: ${r.recommendedPriceFormatted}`
    } else {
      // Local currencies mode: show local price with USD equivalent in parentheses
      const usdPrice = getUSDPrice(r)
      const usdFormatted = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
      }).format(usdPrice)
      return `${r.country.iso3}: ${r.recommendedPriceFormatted} (${usdFormatted})`
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border-2 border-[#0A0A0A] dark:border-[#525252] bg-white dark:bg-[#121212] divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#0A0A0A] dark:divide-[#525252] transition-colors duration-300">
      
      {/* Base Price Card */}
      <div className="p-5 flex flex-col justify-between">
        <span className="block text-[14px] font-bold text-[#404040] dark:text-[#D4D4D4] uppercase tracking-wider mb-2">Base Price</span>
        <div>
          <span className="font-mono text-[30px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA]">
            {basePrice.toFixed(2)}
          </span>
          <span className="text-[14px] font-bold text-[#666666] dark:text-[#A3A3A3] ml-1 uppercase">{baseCurrency}</span>
        </div>
        <p className="text-[14px] text-[#666666] dark:text-[#A3A3A3] mt-1.5 font-bold uppercase truncate">
          {settings.productName || 'My SaaS'}
        </p>
      </div>

      {/* Countries Covered */}
      <div className="p-5 flex flex-col justify-between">
        <span className="block text-[14px] font-bold text-[#404040] dark:text-[#D4D4D4] uppercase tracking-wider mb-2">Countries covered</span>
        <span className="font-mono text-[30px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA]">{totalCountries}</span>
        <p className="text-[14px] text-[#666666] dark:text-[#A3A3A3] mt-1.5 font-bold uppercase">
          {settings.billingPeriod === 'monthly' ? 'MONTHLY' : 'YEARLY'}
        </p>
      </div>

      {/* Typical Discount */}
      <div className="p-5 flex flex-col justify-between">
        <span className="block text-[14px] font-bold text-[#404040] dark:text-[#D4D4D4] uppercase tracking-wider mb-2">Typical discount</span>
        <span className="font-mono text-[30px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA]">
          {discountLabel}
        </span>
        <p className="text-[14px] text-[#666666] dark:text-[#A3A3A3] mt-1.5 font-bold uppercase leading-normal">
          VS DIRECT CONVERSION
        </p>
      </div>

      {/* Price Range */}
      <div className="p-5 flex flex-col justify-between">
        <span className="block text-[14px] font-bold text-[#404040] dark:text-[#D4D4D4] uppercase tracking-wider mb-2">Price range</span>
        <div className="space-y-1 font-mono text-[14px] font-bold">
          {lowestMarket && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#EF4444] uppercase">LOW</span>
              <span className="text-[#0A0A0A] dark:text-[#FAFAFA] truncate max-w-[170px]" title={formatRangeValue(lowestMarket)}>
                {formatRangeValue(lowestMarket)}
              </span>
            </div>
          )}
          {highestMarket && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#0A0A0A] dark:text-[#FAFAFA] uppercase">HIGH</span>
              <span className="text-[#0A0A0A] dark:text-[#FAFAFA] truncate max-w-[170px]" title={formatRangeValue(highestMarket)}>
                {formatRangeValue(highestMarket)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default SummaryCards
