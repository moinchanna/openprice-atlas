import React, { useMemo } from 'react'
import type { FormSettings, PricingStrategy, BillingPeriod } from '../types/pricing'
import type { CurrencyInfo } from '../lib/currencies'
import { Check } from 'lucide-react'

interface CalculatorFormProps {
  settings: FormSettings
  onChange: (settings: FormSettings) => void
  onCalculate: () => void
  supportedCurrencies: CurrencyInfo[]
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  settings,
  onChange,
  onCalculate,
  supportedCurrencies,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false)

  // Pricing strategy options list with Recommended designations
  const strategies: { id: Exclude<PricingStrategy, 'custom'>; label: string; desc: string; isRecommended?: boolean }[] = useMemo(() => [
    {
      id: 'revenue',
      label: 'Higher revenue',
      desc: 'Smaller discounts across countries.',
    },
    {
      id: 'balanced',
      label: 'Balanced',
      desc: 'A practical mix of affordability and revenue.',
      isRecommended: true,
    },
    {
      id: 'accessibility',
      label: 'More affordable',
      desc: 'Larger discounts in lower-income countries.',
    },
  ], [])

  // Update adjustment strength slider based on selected strategy
  const handleStrategyChange = (strategy: Exclude<PricingStrategy, 'custom'>) => {
    let strength = settings.adjustmentStrength
    if (strategy === 'revenue') strength = 0.4
    else if (strategy === 'balanced') strength = 0.7
    else if (strategy === 'accessibility') strength = 0.9

    onChange({
      ...settings,
      strategy,
      adjustmentStrength: strength,
    })
  }

  // Keyboard navigation for WAI-ARIA radio group pattern
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      nextIndex = (index + 1) % strategies.length
      e.preventDefault()
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + strategies.length) % strategies.length
      e.preventDefault()
    } else if (e.key === ' ' || e.key === 'Enter') {
      handleStrategyChange(strategies[index].id)
      e.preventDefault()
      return
    } else {
      return
    }
    const nextStrat = strategies[nextIndex].id
    handleStrategyChange(nextStrat)

    // Set focus on the newly selected radio button item
    setTimeout(() => {
      const btn = document.getElementById(`strategy-btn-${nextStrat}`)
      if (btn) btn.focus()
    }, 0)
  }

  // Handle individual fields
  const handleFieldChange = (field: keyof FormSettings, value: any) => {
    let nextStrategy = settings.strategy
    if (field === 'adjustmentStrength') {
      nextStrategy = 'custom'
    }
    onChange({
      ...settings,
      strategy: nextStrategy,
      [field]: value,
    })
  }

  // Validation logic computed dynamically during render
  const errors = useMemo(() => {
    const nextErrors: { [key: string]: string } = {}

    if (isNaN(settings.basePrice) || settings.basePrice <= 0) {
      nextErrors.basePrice = 'Base price must be a positive number.'
    } else if (settings.basePrice < 0.01) {
      nextErrors.basePrice = 'Minimum base price is 0.01.'
    } else if (settings.basePrice > 100000) {
      nextErrors.basePrice = 'Maximum base price is 100,000.'
    }

    if (settings.priceFloor < 0.01 || settings.priceFloor > 2.0) {
      nextErrors.priceFloor = 'Price floor must be between 1% and 200%.'
    }

    if (settings.priceCeiling < 0.5 || settings.priceCeiling > 5.0) {
      nextErrors.priceCeiling = 'Price ceiling must be between 50% and 500%.'
    }

    if (settings.priceFloor > settings.priceCeiling) {
      nextErrors.priceFloor = 'Floor cannot be greater than the ceiling.'
    }

    return nextErrors
  }, [settings])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (Object.keys(errors).length === 0) {
      onCalculate()
    }
  }

  // Check which preset card is active
  const isStrategyActive = (id: Exclude<PricingStrategy, 'custom'>) => {
    if (settings.strategy === 'custom') return false
    return settings.strategy === id
  }

  // Resolve base currency name/details
  const currentBaseCurrencyInfo = useMemo(() => {
    return supportedCurrencies.find(c => c.code === settings.baseCurrency)
  }, [supportedCurrencies, settings.baseCurrency])

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-[#121212] border-2 border-[#0A0A0A] dark:border-[#525252] rounded-none p-6 sm:p-8 shadow-none transition-colors duration-300 max-w-full"
    >
      {/* 01 / SET YOUR BASE PRICE */}
      <div className="mb-8">
        <span className="block font-sans text-sm sm:text-[15px] font-bold tracking-[0.1em] text-[#EF4444] uppercase mb-1">
          01 / SET YOUR BASE PRICE
        </span>
        <h2 className="font-display text-[28px] md:text-[36px] font-normal text-[#0A0A0A] dark:text-[#FAFAFA] uppercase tracking-tight">
          START WITH WHAT YOU CHARGE TODAY.
        </h2>
        <div className="w-12 h-0.5 bg-[#0A0A0A] dark:bg-[#FAFAFA] mt-3" />
      </div>

      {/* Two-Column Grid for Primary Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        
        {/* Left Column: Product Name & Base Price & Billing Period */}
        <div className="space-y-6">
          {/* Product Name */}
          <div>
            <label htmlFor="productName" className="block text-[14px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA] uppercase tracking-[0.06em] mb-2">
              Product name <span className="text-[12px] font-normal text-[#525252] dark:text-[#A3A3A3] lowercase italic">(optional)</span>
            </label>
            <input
              type="text"
              id="productName"
              value={settings.productName}
              onChange={(e) => handleFieldChange('productName', e.target.value)}
              className="w-full h-[50px] px-4 border-2 border-[#BDBDBD] dark:border-[#525252] bg-white dark:bg-[#1A1A1A] text-[17px] text-[#0A0A0A] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] focus:outline-none focus:border-[#0A0A0A] dark:focus:border-[#FAFAFA] rounded-none transition-all"
              placeholder="My SaaS"
            />
          </div>

          {/* Base Price & Currency Selector beside it */}
          <div>
            <label htmlFor="basePrice" className="block text-[14px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA] uppercase tracking-[0.06em] mb-2">
              YOUR CURRENT MONTHLY PRICE <span className="text-[#EF4444]">*</span>
            </label>
            
            <div className="flex gap-2">
              {/* Currency symbol and input */}
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[17px] font-mono font-bold text-[#0A0A0A] dark:text-[#FAFAFA] select-none">
                  {currentBaseCurrencyInfo?.symbol || settings.baseCurrency}
                </span>
                <input
                  type="number"
                  id="basePrice"
                  step="0.01"
                  min="0.01"
                  max="100000"
                  required
                  value={isNaN(settings.basePrice) ? '' : settings.basePrice}
                  onChange={(e) => handleFieldChange('basePrice', parseFloat(e.target.value))}
                  className={`w-full h-[50px] pl-18 pr-4 border-2 ${
                    errors.basePrice ? 'border-[#EF4444]' : 'border-[#BDBDBD] dark:border-[#525252]'
                  } bg-white dark:bg-[#1A1A1A] text-[17px] font-mono text-[#0A0A0A] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] focus:outline-none focus:border-[#0A0A0A] dark:focus:border-[#FAFAFA] rounded-none transition-all`}
                  placeholder="6.99"
                />
              </div>

              {/* Base Currency Searchable Selector */}
              <div className="w-40 relative">
                <input
                  type="text"
                  list="baseCurrencyList"
                  id="baseCurrency"
                  value={settings.baseCurrency}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase()
                    if (supportedCurrencies.some(c => c.code === val)) {
                      handleFieldChange('baseCurrency', val)
                    } else {
                      handleFieldChange('baseCurrency', e.target.value)
                    }
                  }}
                  onBlur={() => {
                    if (!supportedCurrencies.some(c => c.code === settings.baseCurrency.toUpperCase())) {
                      handleFieldChange('baseCurrency', 'USD')
                    }
                  }}
                  placeholder="USD"
                  className="w-full h-[50px] px-3 border-2 border-[#BDBDBD] dark:border-[#525252] bg-white dark:bg-[#1A1A1A] text-[17px] font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-[#FAFAFA] focus:outline-none focus:border-[#0A0A0A] dark:focus:border-[#FAFAFA] rounded-none"
                />
                <datalist id="baseCurrencyList">
                  {supportedCurrencies.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.code} — {curr.name}
                    </option>
                  ))}
                </datalist>
              </div>
            </div>

            {/* Helper notes: minimum 15px */}
            <p className="text-[15px] text-[#404040] dark:text-[#D4D4D4] mt-2 leading-normal">
              Enter the price customers currently pay in the United States.
            </p>
            {settings.baseCurrency !== 'USD' && (
              <p className="text-[15px] text-[#EF4444] mt-2 font-bold uppercase tracking-wider">
                Note: Entered amount is interpreted in {settings.baseCurrency} ({currentBaseCurrencyInfo?.name || ''}).
              </p>
            )}
            {errors.basePrice && <p className="text-[15px] text-[#EF4444] mt-2 font-bold">{errors.basePrice}</p>}
          </div>

          {/* Billing Period */}
          <div>
            <label className="block text-[14px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA] uppercase tracking-[0.06em] mb-2.5">Billing period</label>
            <div className="flex gap-1.5 bg-transparent rounded-none">
              {(['monthly', 'yearly'] as BillingPeriod[]).map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => handleFieldChange('billingPeriod', period)}
                  className={`h-11 px-5 border-2 border-[#BDBDBD] dark:border-[#525252] text-[#404040] dark:text-[#D4D4D4] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA] font-sans text-[15px] font-bold tracking-[0.06em] uppercase rounded-none transition-all cursor-pointer ${
                    settings.billingPeriod === period
                      ? '!bg-[#0A0A0A] dark:!bg-[#FAFAFA] !border-[#0A0A0A] dark:!border-[#FAFAFA] !text-[#FAFAFA] dark:!text-[#0A0A0A]'
                      : ''
                  }`}
                >
                  {period === 'monthly' ? 'MONTHLY' : 'YEARLY'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Styles & Actions */}
        <div className="space-y-6">
          {/* Pricing Style Options */}
          <div role="radiogroup" aria-label="Pricing style selector">
            <span className="block font-sans text-sm sm:text-[15px] font-bold tracking-[0.1em] text-[#EF4444] uppercase mb-1">
              02 / CHOOSE YOUR APPROACH
            </span>
            <label className="block text-[14px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA] uppercase tracking-[0.06em] mb-1">HOW MUCH SHOULD PRICES CHANGE?</label>
            
            {/* Supporting accessible description helper line */}
            <p className="text-[16px] md:text-[17px] text-[#404040] dark:text-[#D4D4D4] mb-3 leading-relaxed">
              Balanced works well for most SaaS products.
            </p>

            <div className="grid grid-cols-1 gap-3">
              {strategies.map((strat, index) => {
                const active = isStrategyActive(strat.id)
                return (
                  <button
                    key={strat.id}
                    id={`strategy-btn-${strat.id}`}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    tabIndex={active ? 0 : -1}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onClick={() => handleStrategyChange(strat.id)}
                    aria-label={`${strat.label}. ${strat.desc}${strat.isRecommended ? ' (Recommended)' : ''}`}
                    className={`group p-4 border-2 text-left flex flex-col justify-between transition-all cursor-pointer h-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-[#FAFAFA] focus-visible:ring-offset-2 rounded-none ${
                      active
                        ? 'border-[#0A0A0A] dark:border-[#FAFAFA] border-t-4 border-t-[#EF4444] dark:border-t-4 dark:border-t-[#EF4444] bg-[#0A0A0A] dark:bg-[#1A1A1A] text-[#FAFAFA] dark:text-[#FAFAFA]'
                        : 'bg-white dark:bg-[#121212] border-[#BDBDBD] dark:border-[#525252] text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#F5F5F5] dark:hover:bg-[#262626] hover:border-[#0A0A0A] dark:hover:border-[#FAFAFA]'
                    }`}
                  >
                    <div className="space-y-1 w-full">
                      <div className="flex items-start justify-between gap-3 w-full">
                        <span className={`block text-[22px] font-bold ${active ? 'text-white dark:text-[#FAFAFA]' : 'text-[#0A0A0A] dark:text-[#FAFAFA]'}`}>
                          {strat.label}
                        </span>
                        
                        {/* Right side badge container */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {strat.isRecommended && (
                            <span className="bg-[#EF4444] text-[#FAFAFA] text-[14px] font-bold uppercase rounded-none px-2 py-0.5 select-none tracking-wide">
                              RECOMMENDED
                            </span>
                          )}
                          {active && (
                            <div className="flex items-center gap-1 text-[#EF4444] dark:text-[#EF4444] font-bold text-[14px] uppercase select-none">
                              <span>SELECTED</span>
                              <Check className="h-4.5 w-4.5 shrink-0" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <span className={`block text-[17px] leading-[1.55] transition-colors ${
                        active
                          ? 'text-[#E5E5E5] dark:text-[#D4D4D4]'
                          : 'text-[#404040] dark:text-[#D4D4D4] group-hover:text-black dark:group-hover:text-white'
                      }`}>
                        {strat.desc}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Use Familiar Price Endings Checkbox: Minimum text size rules */}
      <div className="mb-6 pt-4 border-t border-[#E5E5E5] dark:border-[#1A1A1A]">
        <label className="inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={settings.enablePsychologicalPricing}
            onChange={(e) => handleFieldChange('enablePsychologicalPricing', e.target.checked)}
            className="sr-only"
          />
          <div className={`w-[18px] h-[18px] border-2 border-[#0A0A0A] dark:border-[#FAFAFA] flex items-center justify-center transition-colors rounded-none ${
            settings.enablePsychologicalPricing ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA]' : 'bg-[#FAFAFA] dark:bg-[#1A1A1A] hover:bg-[#F5F5F5]'
          }`}>
            {settings.enablePsychologicalPricing && (
              <svg className="w-3.5 h-3.5 text-[#FAFAFA] dark:text-[#0A0A0A] fill-current" viewBox="0 0 20 20">
                <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
              </svg>
            )}
          </div>
          <span className="ml-[10px] text-[15px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA] font-sans uppercase tracking-[0.04em]">
            USE FAMILIAR PRICE ENDINGS
          </span>
        </label>
        <p className="text-[15px] text-[#404040] dark:text-[#D4D4D4] mt-1.5 leading-normal ml-7">
          Automatically round calculations to customer-friendly thresholds (e.g. $6.99 or ₹199).
        </p>
      </div>

      {/* Collapsible Advanced Settings (Editorial Disclosure Strip) */}
      <div className="py-4 border-t-2 border-b-2 border-[#0A0A0A] dark:border-[#525252] mb-8">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-[15px] font-bold tracking-[0.1em] text-[#0A0A0A] dark:text-[#FAFAFA] uppercase cursor-pointer"
        >
          <span>ADVANCED SETTINGS</span>
          <span className="font-mono text-sm leading-none">{showAdvanced ? '−' : '+'}</span>
        </button>

        {showAdvanced && (
          <div className="mt-6 space-y-6 animate-fadeIn">
            {/* Regional Adjustment Strength */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="adjustmentStrength" className="text-[14px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA] uppercase tracking-[0.04em]">
                  LOCAL PRICE ADJUSTMENT
                </label>
                <span className="font-mono text-[14px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA] bg-[#F5F5F5] dark:bg-[#1A1A1A] px-2.5 py-0.5 border border-[#BDBDBD] dark:border-[#525252]">
                  {(settings.adjustmentStrength * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-[15px] text-[#404040] dark:text-[#D4D4D4] mb-3 leading-normal">
                Higher settings increase recommendations adjustments for regional purchasing power disparities.
              </p>
              <input
                type="range"
                id="adjustmentStrength"
                min="0"
                max="1"
                step="0.01"
                value={settings.adjustmentStrength}
                onChange={(e) => handleFieldChange('adjustmentStrength', parseFloat(e.target.value))}
                className="w-full h-1 bg-[#D4D4D4] dark:bg-[#525252] appearance-none cursor-pointer accent-[#EF4444] dark:accent-[#EF4444]"
              />
              <div className="flex justify-between text-[11px] text-[#666666] dark:text-[#A3A3A3] mt-1.5 select-none font-bold uppercase tracking-wider">
                <span>LESS CHANGE</span>
                <span>MORE CHANGE</span>
              </div>
            </div>

            {/* Price Floor & Ceiling Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#E5E5E5] dark:border-[#1A1A1A]">
              {/* Price Floor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="priceFloor" className="text-[14px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA] uppercase tracking-[0.04em]">
                    Minimum price floor
                  </label>
                  <span className="font-mono text-[14px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA]">
                    {(settings.priceFloor * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  id="priceFloor"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={settings.priceFloor}
                  onChange={(e) => handleFieldChange('priceFloor', parseFloat(e.target.value))}
                  className="w-full h-1 bg-[#D4D4D4] dark:bg-[#525252] appearance-none cursor-pointer accent-[#EF4444] dark:accent-[#EF4444]"
                />
                <p className="text-[15px] text-[#404040] dark:text-[#D4D4D4] mt-2 leading-normal">
                  Sets the lowest limit a suggested localized price can go relative to baseline.
                </p>
                {errors.priceFloor && <p className="text-xs text-[#EF4444] mt-1 font-bold">{errors.priceFloor}</p>}
              </div>

              {/* Price Ceiling */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="priceCeiling" className="text-[14px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA] uppercase tracking-[0.04em]">
                    Maximum price ceiling
                  </label>
                  <span className="font-mono text-[14px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA]">
                    {(settings.priceCeiling * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  id="priceCeiling"
                  min="1.0"
                  max="2.0"
                  step="0.05"
                  value={settings.priceCeiling}
                  onChange={(e) => handleFieldChange('priceCeiling', parseFloat(e.target.value))}
                  className="w-full h-1 bg-[#D4D4D4] dark:bg-[#525252] appearance-none cursor-pointer accent-[#EF4444] dark:accent-[#EF4444]"
                />
                <p className="text-[15px] text-[#404040] dark:text-[#D4D4D4] mt-2 leading-normal">
                  Sets the upper limit a suggested localized price can go relative to baseline.
                </p>
                {errors.priceCeiling && <p className="text-xs text-[#EF4444] mt-1 font-bold">{errors.priceCeiling}</p>}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="space-y-4">
        <button
          type="submit"
          disabled={Object.keys(errors).length > 0}
          className="w-full h-[54px] rounded-none font-sans text-[16px] font-bold tracking-[0.06em] bg-[#0A0A0A] dark:bg-[#FAFAFA] border-2 border-[#0A0A0A] dark:border-[#FAFAFA] text-[#FAFAFA] dark:text-[#0A0A0A] hover:bg-[#EF4444] dark:hover:bg-[#EF4444] dark:hover:text-[#FAFAFA] hover:border-[#EF4444] dark:hover:border-[#EF4444] disabled:opacity-35 disabled:cursor-not-allowed uppercase transition-colors duration-150 cursor-pointer text-center flex items-center justify-center"
        >
          CALCULATE COUNTRY PRICES
        </button>

        <p className="text-[15px] text-center text-[#525252] dark:text-[#A3A3A3] select-none font-medium">
          Calculation configurations are stored securely inside your local browser.
        </p>
      </div>
    </form>
  )
}
export default CalculatorForm
