import React from 'react'
import type { CalculationResult, FormSettings } from '../types/pricing'
import { Landmark, Globe2, Percent, ArrowDown, ArrowUp, DollarSign } from 'lucide-react'

interface SummaryCardsProps {
  results: CalculationResult[]
  settings: FormSettings
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ results, settings }) => {
  if (results.length === 0) return null

  // Calculate Median Discount Percent (or price as % of FX price)
  // We want the median of (recommendedPrice / fxConvertedPrice)
  const ratios = results
    .map(r => (r.fxConvertedPrice > 0 ? (r.recommendedPrice / r.fxConvertedPrice) * 100 : 100))
    .sort((a, b) => a - b)
  
  let medianPercentOfFX = 100
  if (ratios.length > 0) {
    const mid = Math.floor(ratios.length / 2)
    medianPercentOfFX = ratios.length % 2 !== 0 ? ratios[mid] : (ratios[mid - 1] + ratios[mid]) / 2
  }

  // Find lowest and highest recommended markets relative to standard FX price (largest discount & markup)
  // Also we want to display the actual pricing in that market.
  // Sort results by discountPercent descending to find the lowest recommended market (relative to FX)
  const sortedByDiscount = [...results].sort((a, b) => b.discountPercent - a.discountPercent)
  const lowestMarket = sortedByDiscount[0]
  const highestMarket = sortedByDiscount[sortedByDiscount.length - 1]

  const totalCountries = results.length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Base Price Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Base Price</span>
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            ${settings.basePrice.toFixed(2)}
          </span>
          <span className="text-xs font-medium text-slate-400 dark:text-slate-500">USD</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 truncate">
          Product: {settings.productName} ({settings.billingPeriod})
        </p>
      </div>

      {/* Calculated Countries */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Markets Calculated</span>
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Globe2 className="h-4 w-4" />
          </div>
        </div>
        <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalCountries}</span>
        <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
          Strategy: {settings.strategy === 'custom' ? 'Custom' : settings.strategy.charAt(0).toUpperCase() + settings.strategy.slice(1)}
        </p>
      </div>

      {/* Median Regional Discount */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Median Price Index</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Percent className="h-4 w-4" />
          </div>
        </div>
        <span className="text-2xl font-bold text-slate-900 dark:text-white">
          {medianPercentOfFX.toFixed(0)}%
        </span>
        <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
          of standard exchange rate conversion
        </p>
      </div>

      {/* Extremes (Low / High) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm transition-colors duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pricing Ranges</span>
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Landmark className="h-4 w-4" />
          </div>
        </div>
        <div className="space-y-1">
          {lowestMarket && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-450 flex items-center gap-0.5 truncate max-w-[120px]">
                <ArrowDown className="h-3 w-3 text-emerald-500 shrink-0" />
                {lowestMarket.country.name}
              </span>
              <span className="font-bold text-slate-850 dark:text-slate-100">
                {lowestMarket.recommendedPriceFormatted}
              </span>
            </div>
          )}
          {highestMarket && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-450 flex items-center gap-0.5 truncate max-w-[120px]">
                <ArrowUp className="h-3 w-3 text-red-500 shrink-0" />
                {highestMarket.country.name}
              </span>
              <span className="font-bold text-slate-850 dark:text-slate-100">
                {highestMarket.recommendedPriceFormatted}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
