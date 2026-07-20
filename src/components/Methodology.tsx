import React from 'react'
import { Info, HelpCircle, AlertTriangle, ShieldCheck, Database, GitMerge } from 'lucide-react'

export const Methodology: React.FC = () => {
  return (
    <section id="methodology-section" className="py-16 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            How it works
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            Pricing Methodology
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-450 mt-2 max-w-xl mx-auto">
            A look under the hood at the purchasing power parity calculations, blending factors, rounding, and fallbacks.
          </p>
        </div>

        {/* Warning Block */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-5 rounded-r-xl mb-10 flex gap-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">Important Advisory Warning</h4>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1.5 leading-relaxed">
              Economic indicators cannot measure customer demand, local competition, taxes, payment fees, regulations, or product-market fit. Treat these results as a starting point for pricing research, not financial advice.
            </p>
          </div>
        </div>

        {/* Explanation Grid */}
        <div className="space-y-10 text-slate-700 dark:text-slate-350">
          {/* What is regional pricing */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Globe2Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              1. What is Regional Pricing?
            </h3>
            <p className="text-sm leading-relaxed">
              Regional pricing is the practice of adjusting the price of a digital good or subscription service in foreign markets to reflect local purchasing power. Rather than converting the base US price directly using standard currency exchange rates, regional pricing adjusts prices downward in markets with lower purchasing power and keeps them comparable (or slightly higher) in markets with equal or higher purchasing power.
            </p>
          </div>

          {/* Purchasing Power Parity (PPP) */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              2. Purchasing Power Parity & Exchange Rates
            </h3>
            <p className="text-sm leading-relaxed mb-4">
              To measure local purchasing power, we utilize economic datasets provided by the **World Bank Indicators API**:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>
                <strong>Household Private Consumption PPP Factor (<code>PA.NUS.PRVT.PP</code>)</strong>: Measures local currency units needed to buy the same basket of consumer goods that 1 USD buys in the United States. This is our primary indicator since it measures consumer-focused spending rather than industrial goods.
              </li>
              <li>
                <strong>Official Exchange Rate (<code>PA.NUS.FCRF</code>)</strong>: The official period-average exchange rate of local currency units per US dollar.
              </li>
              <li>
                <strong>GDP PPP Factor (<code>PA.NUS.PPP</code>)</strong>: The GDP-based PPP conversion factor, utilized as a secondary fallback when consumer-consumption PPP data is unavailable.
              </li>
            </ul>
          </div>

          {/* Blended pricing formula */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <GitMerge className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              3. The Blending Pricing Formula
            </h3>
            <p className="text-sm leading-relaxed mb-4">
              Pure exchange-rate pricing does not account for local income differences, while pure PPP pricing can cause significant revenue loss or arbitrage. OpenPrice Atlas blends these two approaches. Let:
            </p>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-350 space-y-2">
              <p>B = Base Price in USD</p>
              <p>FX = Local Currency per US Dollar (Official Exchange Rate)</p>
              <p>PPP = Local Currency per International Dollar (PPP Factor)</p>
              <p>S = Regional Adjustment Strength (from 0 to 1)</p>
              <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 font-bold text-indigo-600 dark:text-indigo-450 text-center">
                rawLocalPrice = B &times; FX &times; (PPP &divide; FX) <sup>S</sup>
              </div>
              <div className="text-center font-bold text-slate-650 dark:text-slate-400">
                Equivalent to: rawLocalPrice = B &times; FX <sup>(1 - S)</sup> &times; PPP <sup>S</sup>
              </div>
            </div>
            <p className="text-sm leading-relaxed mt-4">
              When the adjustment strength \(S = 0\), the formula outputs standard market exchange-rate conversion. When \(S = 1\), it outputs pure purchasing power parity pricing. At values in between (such as the Balanced default of 70%), it calculates a blended price that factors in both exchange rates and local affordability.
            </p>
          </div>

          {/* Floors and ceilings */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              4. Advanced Bounds (Floors & Ceilings)
            </h3>
            <p className="text-sm leading-relaxed">
              To prevent prices from falling too low (which could trigger heavy currency abuse/VPN shopping) or rising too high (which could alienate customers in high-cost-of-living countries), we apply configurable price floor and price ceiling bounds:
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="block font-bold text-slate-900 dark:text-white mb-1">Minimum Price Floor (Default: 20%)</span>
                <span className="block text-slate-500 leading-normal">
                  Ensures the regional price recommendation never drops below 20% of the normal FX-converted price.
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="block font-bold text-slate-900 dark:text-white mb-1">Maximum Price Ceiling (Default: 120%)</span>
                <span className="block text-slate-500 leading-normal">
                  Ensures the regional price recommendation never exceeds 120% of the normal FX-converted price.
                </span>
              </div>
            </div>
          </div>

          {/* Rounding */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              5. Smart Psychological Pricing Rounding
            </h3>
            <p className="text-sm leading-relaxed">
              Calculated regional prices are rarely ready for production. Standard math could recommend <code>$7.12</code> or <code>₹182</code>. OpenPrice Atlas rounds these outputs to clean numbers that end in attractive values (such as <code>.99</code>, <code>.49</code>, or values ending in <code>90</code> or <code>9</code>) depending on the currency's decimal precision.
            </p>
            <p className="text-sm leading-relaxed mt-2">
              For zero-decimal currencies like JPY and KRW, decimals are completely omitted, and values are rounded to the nearest attractive 90 or 900 interval. To protect price accuracy, the rounding system is restricted and will never adjust the price by more than 8% in either direction.
            </p>
          </div>

          {/* Fallbacks */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              6. Economic Data Fallback Hierarchy
            </h3>
            <p className="text-sm leading-relaxed mb-3">
              Because public datasets contain missing values for certain countries, we implement a strict fallback hierarchy to resolve missing data points without making up fictional records:
            </p>
            <ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed">
              <li>
                <strong>Direct Household PPP</strong>: The primary factor using private consumption PPP and official exchange rates.
              </li>
              <li>
                <strong>GDP PPP Fallback</strong>: Used when household PPP is missing, substituting GDP-based PPP conversions.
              </li>
              <li>
                <strong>Income-Group Estimate</strong>: Used when no PPP is available. We calculate the median PPP-to-FX ratio for countries in the same World Bank income classification (e.g. Upper Middle Income) and apply it to the country's official exchange rate.
              </li>
              <li>
                <strong>Regional Estimate</strong>: Used if income group data is missing, applying the median ratio for other countries in the same geographic region.
              </li>
              <li>
                <strong>FX-only Fallback</strong>: Used if no median ratios can be resolved. The tool falls back to a standard exchange rate conversion (representing a 0% PPP adjustment).
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

// Simple inline Globe icon since lucide-react might not export Globe2 under Globe2 name
const Globe2Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
)
