import React, { useState, useMemo } from 'react'
import type { FormSettings, PricingStrategy, BillingPeriod } from '../types/pricing'
import { HelpCircle, Shield, Settings, Sliders } from 'lucide-react'

interface CalculatorFormProps {
  settings: FormSettings
  onChange: (settings: FormSettings) => void
  onCalculate: () => void
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  settings,
  onChange,
  onCalculate,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Update adjustment strength slider based on selected strategy
  const handleStrategyChange = (strategy: PricingStrategy) => {
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

  // Handle individual fields
  const handleFieldChange = (field: keyof FormSettings, value: any) => {
    onChange({
      ...settings,
      [field]: value,
    })
  }

  // Validation logic computed dynamically during render
  const errors = useMemo(() => {
    const nextErrors: { [key: string]: string } = {}

    if (isNaN(settings.basePrice) || settings.basePrice <= 0) {
      nextErrors.basePrice = 'Base price must be a positive number.'
    } else if (settings.basePrice < 0.01) {
      nextErrors.basePrice = 'Minimum base price is $0.01.'
    } else if (settings.basePrice > 100000) {
      nextErrors.basePrice = 'Maximum base price is $100,000.'
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

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-100 dark:shadow-none transition-colors duration-300">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <Sliders className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Calculator Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Product Name */}
        <div>
          <label htmlFor="productName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Product Name <span className="text-xs font-normal text-slate-400 dark:text-slate-500">(Optional)</span>
          </label>
          <input
            type="text"
            id="productName"
            value={settings.productName}
            onChange={(e) => handleFieldChange('productName', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
            placeholder="My SaaS"
          />
        </div>

        {/* Base Monthly Price */}
        <div>
          <label htmlFor="basePrice" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Base Monthly Price (USD) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-medium">$</span>
            <input
              type="number"
              id="basePrice"
              step="0.01"
              min="0.01"
              max="100000"
              required
              value={isNaN(settings.basePrice) ? '' : settings.basePrice}
              onChange={(e) => handleFieldChange('basePrice', parseFloat(e.target.value))}
              className={`w-full pl-8 pr-4 py-2.5 rounded-xl border ${
                errors.basePrice ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800'
              } bg-transparent text-slate-900 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all`}
              placeholder="6.99"
            />
          </div>
          {errors.basePrice && <p className="text-xs text-red-500 mt-1">{errors.basePrice}</p>}
        </div>
      </div>

      {/* Billing Period & Strategy Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Billing Period */}
        <div>
          <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Billing Period</span>
          <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl">
            {(['monthly', 'yearly'] as BillingPeriod[]).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => handleFieldChange('billingPeriod', period)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                  settings.billingPeriod === period
                    ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Smart Rounding Toggle */}
        <div>
          <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Smart Psychological Pricing</span>
          <label className="inline-flex items-center cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={settings.enablePsychologicalPricing}
              onChange={(e) => handleFieldChange('enablePsychologicalPricing', e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
            <span className="ms-3 text-sm font-medium text-slate-600 dark:text-slate-300 select-none">
              Format prices as attractive numbers (e.g. .99 / .49)
            </span>
          </label>
        </div>
      </div>

      {/* Pricing Strategy Selector Cards */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Pricing Strategy Preset</label>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { id: 'revenue', label: 'Revenue Focused', desc: '40% regional strength. Minimizes discounts in lower-income regions.', strength: '40%' },
            { id: 'balanced', label: 'Balanced (Default)', desc: '70% regional strength. Moderately discounts based on purchasing power.', strength: '70%' },
            { id: 'accessibility', label: 'Accessibility Focused', desc: '90% regional strength. Maximizes discounts in lower-income regions.', strength: '90%' },
            { id: 'custom', label: 'Custom Strategy', desc: 'Control the adjustment strength slider manually to design your formula.', strength: 'Slider' },
          ].map((strat) => (
            <button
              key={strat.id}
              type="button"
              onClick={() => handleStrategyChange(strat.id as PricingStrategy)}
              className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                settings.strategy === strat.id
                  ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/25 ring-2 ring-indigo-650'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <div>
                <span className="block text-sm font-bold text-slate-900 dark:text-white mb-1">{strat.label}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-450 leading-normal">{strat.desc}</span>
              </div>
              <span className="inline-block mt-3 text-xs font-bold text-indigo-600 dark:text-indigo-400">{strat.strength} strength</span>
            </button>
          ))}
        </div>
      </div>

      {/* Regional Adjustment Strength Slider */}
      <div className="mb-6 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="adjustmentStrength" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Regional Adjustment Strength
          </label>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
            {(settings.adjustmentStrength * 100).toFixed(0)}%
          </span>
        </div>
        <input
          type="range"
          id="adjustmentStrength"
          min="0"
          max="1"
          step="0.01"
          disabled={settings.strategy !== 'custom'}
          value={settings.adjustmentStrength}
          onChange={(e) => handleFieldChange('adjustmentStrength', parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 select-none">
          <span>0% (Standard FX Conversion Only)</span>
          <span>100% (Pure Purchasing Power Parity Only)</span>
        </div>
      </div>

      {/* Advanced Settings Toggle */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <Settings className={`h-4 w-4 transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
          {showAdvanced ? 'Hide advanced settings' : 'Show advanced settings'}
        </button>

        {showAdvanced && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 animate-fadeIn">
            {/* Price Floor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="priceFloor" className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  Minimum Price Floor
                  <span className="group relative">
                    <HelpCircle className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 cursor-help" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-48 p-2 text-[10px] font-normal bg-slate-900 text-white rounded shadow-md z-10 leading-normal">
                      Prevents prices from falling below this percentage of the normal FX-converted price.
                    </span>
                  </span>
                </label>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
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
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              {errors.priceFloor && <p className="text-xs text-red-500 mt-1">{errors.priceFloor}</p>}
            </div>

            {/* Price Ceiling */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="priceCeiling" className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  Maximum Price Ceiling
                  <span className="group relative">
                    <HelpCircle className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 cursor-help" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-48 p-2 text-[10px] font-normal bg-slate-900 text-white rounded shadow-md z-10 leading-normal">
                      Prevents prices from exceeding this percentage of the normal FX-converted price.
                    </span>
                  </span>
                </label>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
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
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              {errors.priceCeiling && <p className="text-xs text-red-500 mt-1">{errors.priceCeiling}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={Object.keys(errors).length > 0}
        className="w-full py-4 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99] transition-all"
      >
        Generate Global Pricing
      </button>

      <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-slate-455 font-medium">
        <Shield className="h-3.5 w-3.5 text-indigo-650" />
        No inputs or overrides are stored on any server. Data is stored entirely locally.
      </div>
    </form>
  )
}
