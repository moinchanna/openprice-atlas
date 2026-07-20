import React, { useState, useEffect, useMemo } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { CalculatorForm } from './components/CalculatorForm'
import { SummaryCards } from './components/SummaryCards'
import { ResultsTable } from './components/ResultsTable'
import { Methodology } from './components/Methodology'
import { Footer } from './components/Footer'

import type { CountryData, CalculationResult, FormSettings } from './types/pricing'
import { getSupportedCurrencies } from './lib/currencies'
import { calculateRegionalPrice } from './lib/pricing'
import { downloadCSV } from './lib/csv'
import { downloadPDF } from './lib/pdf'
import { Sliders, RotateCcw } from 'lucide-react'

import rawCountriesData from './data/countries.generated.json'
const countriesData = rawCountriesData as CountryData[]

const LOCAL_STORAGE_KEY_SETTINGS = 'openprice_atlas_settings_v2'
const LOCAL_STORAGE_KEY_OVERRIDES = 'openprice_atlas_overrides_v2'

const DEFAULT_SETTINGS: FormSettings = {
  productName: 'My SaaS',
  basePrice: 6.99,
  billingPeriod: 'monthly',
  strategy: 'balanced',
  adjustmentStrength: 0.70,
  enablePsychologicalPricing: true,
  priceFloor: 0.20,
  priceCeiling: 1.20,
  baseCurrency: 'USD',
  displayMode: 'one-currency',
  displayCurrency: 'same-as-base',
  showLocalPrice: false,
}

export const App: React.FC = () => {
  // --- Compile supported currencies lookup ---
  const supportedCurrencies = useMemo(() => {
    return getSupportedCurrencies(countriesData)
  }, [])

  // --- Calculator Settings State ---
  const [settings, setSettings] = useState<FormSettings>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return { ...DEFAULT_SETTINGS, ...parsed }
      } catch {
        return DEFAULT_SETTINGS
      }
    }
    return DEFAULT_SETTINGS
  })

  // Synchronize settings to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(settings))
  }, [settings])

  // --- Manual Overrides State (stored as neutral USD equivalent!) ---
  const [overrides, setOverrides] = useState<{ [iso3: string]: number }>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_OVERRIDES)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return {}
      }
    }
    return {}
  })

  // Synchronize overrides to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_OVERRIDES, JSON.stringify(overrides))
  }, [overrides])

  // --- Has Calculated State ---
  const [hasCalculated, setHasCalculated] = useState<boolean>(false)

  // Resolve base currency info
  const baseCurrencyInfo = useMemo(() => {
    return supportedCurrencies.find(c => c.code === settings.baseCurrency) || supportedCurrencies[0]
  }, [supportedCurrencies, settings.baseCurrency])

  // Resolve display currency info
  const displayCurrencyInfo = useMemo(() => {
    const code = settings.displayCurrency === 'same-as-base' ? settings.baseCurrency : settings.displayCurrency
    return supportedCurrencies.find(c => c.code === code) || baseCurrencyInfo
  }, [supportedCurrencies, settings.displayCurrency, settings.baseCurrency, baseCurrencyInfo])

  // --- Calculations Trigger State ---
  const results: CalculationResult[] = useMemo(() => {
    return countriesData.map(country => {
      const overrideVal = overrides[country.iso3] !== undefined ? overrides[country.iso3] : null
      return calculateRegionalPrice(
        country,
        settings,
        baseCurrencyInfo.fxPerUsd,
        displayCurrencyInfo.fxPerUsd,
        displayCurrencyInfo.code,
        displayCurrencyInfo.decimals,
        displayCurrencyInfo.symbol,
        overrideVal,
      )
    })
  }, [settings, overrides, baseCurrencyInfo, displayCurrencyInfo])

  // Handle setting/reverting overrides (value passed is in USD equivalent!)
  const handleOverrideChange = (iso3: string, value: number | null) => {
    setOverrides(prev => {
      const next = { ...prev }
      if (value === null || isNaN(value)) {
        delete next[iso3]
      } else {
        next[iso3] = value
      }
      return next
    })
  }

  const handleClearAllOverrides = () => {
    setOverrides({})
  }

  const handleClearSavedData = () => {
    if (window.confirm('Are you sure you want to reset all configurations and manual overrides?')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY_SETTINGS)
      localStorage.removeItem(LOCAL_STORAGE_KEY_OVERRIDES)
      setSettings(DEFAULT_SETTINGS)
      setOverrides({})
      setHasCalculated(false)
      alert('Settings reset successfully.')
    }
  }

  // --- Exporters ---
  const handleDownloadCSV = () => {
    downloadCSV(results, settings, displayCurrencyInfo.code)
  }

  const handleDownloadPDF = () => {
    downloadPDF(results, settings, displayCurrencyInfo.code)
  }

  // Handle Calculate trigger
  const triggerCalculate = () => {
    setHasCalculated(true)
    // Scroll to results section with slight delay to allow rendering
    setTimeout(() => {
      const resultsSection = document.getElementById('results-section')
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] flex flex-col font-sans antialiased text-[#0A0A0A] dark:text-[#FAFAFA] transition-colors duration-300">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero onStartCalculating={() => {
          const formSection = document.getElementById('calculator-section')
          if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }} />

        {/* Focused Centered Container */}
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 w-full min-w-0">
          
          {/* Main Calculator Box */}
          <section id="calculator-section" className="scroll-mt-20">
            <CalculatorForm
              settings={settings}
              onChange={setSettings}
              onCalculate={triggerCalculate}
              supportedCurrencies={supportedCurrencies}
            />
          </section>

          {/* Results Output Section */}
          <section id="results-section" className="scroll-mt-20 min-h-[300px]">
            {hasCalculated ? (
              <div className="space-y-8 animate-fadeIn">
                <SummaryCards
                  results={results}
                  settings={settings}
                  baseCurrencyFxPerUsd={baseCurrencyInfo.fxPerUsd}
                />
                <ResultsTable
                  results={results}
                  settings={settings}
                  onOverrideChange={handleOverrideChange}
                  onClearAllOverrides={handleClearAllOverrides}
                  onDownloadCSV={handleDownloadCSV}
                  onDownloadPDF={handleDownloadPDF}
                  supportedCurrencies={supportedCurrencies}
                  onSettingsChange={setSettings}
                  displayCurrencyFxPerUsd={displayCurrencyInfo.fxPerUsd}
                  displayCurrencyCode={displayCurrencyInfo.code}
                  displayDecimals={displayCurrencyInfo.decimals}
                />
              </div>
            ) : (
              <div className="text-center py-16 px-6 bg-white border-2 border-[#0A0A0A] rounded-none shadow-none transition-colors duration-300">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-12 h-12 bg-[#F5F5F5] border-2 border-[#0A0A0A] text-[#0A0A0A] rounded-none flex items-center justify-center mx-auto">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A]">Suggested country prices</h3>
                  <p className="text-xs text-[#525252] leading-relaxed">
                    Your country price recommendations will appear here. Click "CALCULATE COUNTRY PRICES" above to generate regional options based on local buying power.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Clear configurations / reset options */}
          {(hasCalculated || Object.keys(overrides).length > 0 || settings.basePrice !== DEFAULT_SETTINGS.basePrice || settings.baseCurrency !== DEFAULT_SETTINGS.baseCurrency) && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleClearSavedData}
                className="flex items-center gap-1.5 py-2 px-4 rounded-none border-2 border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-[#FAFAFA] active:bg-[#DC2626] text-xs font-bold uppercase tracking-wider transition-colors duration-150 cursor-pointer select-none"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset all configurations
              </button>
            </div>
          )}
        </div>

        {/* Methodology details */}
        <Methodology />
      </main>

      <Footer />
    </div>
  )
}

export default App
