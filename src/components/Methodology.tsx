import React from 'react'

export const Methodology: React.FC = () => {
  return (
    <section id="methodology-section" className="py-16 border-t-2 border-[#0A0A0A] dark:border-[#525252] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAFAFA] transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="mb-12">
          <span className="block font-sans text-sm sm:text-[15px] font-bold tracking-[0.1em] text-[#EF4444] uppercase mb-1">
            METHODOLOGY
          </span>
          <h2 className="font-display text-[28px] md:text-[34px] font-normal text-[#0A0A0A] dark:text-[#FAFAFA] uppercase tracking-tight">
            HOW THE ESTIMATE WORKS.
          </h2>
          <div className="w-12 h-0.5 bg-[#0A0A0A] dark:bg-[#FAFAFA] mt-3" />
        </div>

        {/* Warning Block */}
        <div className="border-l-4 border-l-[#EF4444] border-2 border-l-0 border-[#D4D4D4] dark:border-[#525252] p-5 rounded-none mb-12 bg-[#F5F5F5] dark:bg-[#121212]">
          <h4 className="text-[17px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA] uppercase tracking-wider mb-1.5">Important Advisory Disclaimer</h4>
          <p className="text-[15px] text-[#404040] dark:text-[#D4D4D4] leading-relaxed max-w-[75ch]">
            OpenPrice Atlas is an independent open-source project. It is not affiliated with Netflix or any other subscription platform. All prices are estimates based on public economic data and configurable pricing assumptions. Economic indicators cannot measure customer demand, local competition, taxes, payment fees, regulations, or product-market fit. Treat these results as a starting point for pricing research, not financial advice.
          </p>
        </div>

        {/* 5 Numbered Editorial Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-[18px] text-[#404040] dark:text-[#D4D4D4] font-sans leading-relaxed">
          
          {/* 01 — STARTING PRICE */}
          <div className="space-y-3 max-w-[70ch]">
            <span className="block font-mono text-[15px] font-bold text-[#EF4444]">
              01 — STARTING PRICE
            </span>
            <h3 className="text-[17px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA] uppercase tracking-wider">
              The Baseline Anchor
            </h3>
            <p className="text-[18px] leading-[1.6]">
              Every country price calculation starts with your baseline price, typically set in US Dollars. This serves as the anchor point for all regional adjustments.
            </p>
          </div>

          {/* 02 — LOCAL BUYING POWER */}
          <div className="space-y-3 max-w-[70ch]">
            <span className="block font-mono text-[15px] font-bold text-[#EF4444]">
              02 — LOCAL BUYING POWER
            </span>
            <h3 className="text-[17px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA] uppercase tracking-wider">
              Buying Power & Exchange Rates
            </h3>
            <p className="text-[18px] leading-[1.6]">
              To measure local buying power, we compare the official exchange rate of the local currency against the local Purchasing Power Parity (PPP) conversion factor provided by the World Bank. The PPP factor measures the units of currency needed to buy a representative basket of consumer goods in the local market.
            </p>
          </div>

          {/* 03 — PRICE LIMITS */}
          <div className="space-y-3 md:col-span-2 max-w-[70ch]">
            <span className="block font-mono text-[15px] font-bold text-[#EF4444]">
              03 — BLENDED PRICING & LIMITS
            </span>
            <h3 className="text-[17px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA] uppercase tracking-wider">
              The Blending Formula
            </h3>
            <p className="text-[18px] leading-[1.6] mb-4">
              To prevent prices from dropping too low or causing excessive arbitrage, we blend official exchange rate conversions with buying power factor variations.
            </p>
            
            {/* Blended pricing formula box */}
            <div className="bg-[#F5F5F5] dark:bg-[#1A1A1A] p-5 border-2 border-[#D4D4D4] dark:border-[#525252] rounded-none font-mono text-[15px] text-[#0A0A0A] dark:text-[#FAFAFA] space-y-2 select-all max-w-xl">
              <p>B   = Base Price in USD</p>
              <p>FX  = Official exchange rate (local units per USD)</p>
              <p>PPP = Purchasing Power Parity conversion factor</p>
              <p>S   = Local Price Adjustment Strength (0.00 to 1.00)</p>
              <div className="pt-3 mt-3 border-t border-[#D4D4D4] dark:border-[#525252] font-bold text-center">
                rawLocalPrice = B &times; FX &times; (PPP &divide; FX) <sup>S</sup>
              </div>
              <div className="text-center text-[13px] text-[#525252] dark:text-[#A3A3A3]">
                Equivalent to: rawLocalPrice = B &times; FX <sup>(1 - S)</sup> &times; PPP <sup>S</sup>
              </div>
            </div>

            <p className="text-[18px] leading-[1.6] mt-4">
              Adjustment strength settings govern the blend: a strength of 0% outputs standard currency conversion, a strength of 100% outputs pure buying-power parity pricing, and values in between (like the Balanced preset of 70%) create a hybrid price. Configuring a minimum price floor (e.g., 20%) and maximum price ceiling (e.g., 120%) enforces bounds on the final outputs.
            </p>
          </div>

          {/* 04 — FAMILIAR PRICE ENDINGS */}
          <div className="space-y-3 max-w-[70ch]">
            <span className="block font-mono text-[15px] font-bold text-[#EF4444]">
              04 — FAMILIAR PRICE ENDINGS
            </span>
            <h3 className="text-[17px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA] uppercase tracking-wider">
              Familiar Price Endings
            </h3>
            <p className="text-[18px] leading-[1.6]">
              Calculated regional prices are adjusted to match standard pricing conventions (such as `.99`, `.49`, or integer values ending in `90` or `9` depending on currency decimals). The rounding logic is constrained to adjust the final price by at most 8% in either direction.
            </p>
          </div>

          {/* 05 — DATA FALLBACKS */}
          <div className="space-y-3 max-w-[70ch]">
            <span className="block font-mono text-[15px] font-bold text-[#EF4444]">
              05 — DATA FALLBACKS
            </span>
            <h3 className="text-[17px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA] uppercase tracking-wider">
              Data Fallback Hierarchy
            </h3>
            <p className="text-[18px] leading-[1.6]">
              If primary consumer PPP factors are missing in a country, the tool applies a fallback hierarchy: first substituting GDP-based PPP conversions, then calculating the median PPP-to-FX ratio for countries in the same income classification or geographic region, and finally returning to standard currency conversions if no indicators are found.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
export default Methodology
