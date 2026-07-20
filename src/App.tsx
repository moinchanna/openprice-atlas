import React, { useState, useEffect, useMemo } from 'react'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { CalculatorForm } from './components/CalculatorForm'
import { SummaryCards } from './components/SummaryCards'
import { ResultsTable } from './components/ResultsTable'
import { Methodology } from './components/Methodology'
import { Footer } from './components/Footer'

import type { CountryData, CalculationResult, FormSettings } from './types/pricing'
import { calculateRegionalPrice } from './lib/pricing'
import { downloadCSV } from './lib/csv'
import { downloadPDF } from './lib/pdf'

import rawCountriesData from './data/countries.generated.json'
const countriesData = rawCountriesData as CountryData[]

const LOCAL_STORAGE_KEY_SETTINGS = 'openprice_atlas_settings'
const LOCAL_STORAGE_KEY_OVERRIDES = 'openprice_atlas_overrides'
const LOCAL_STORAGE_KEY_THEME = 'openprice_atlas_theme'

const DEFAULT_SETTINGS: FormSettings = {
  productName: 'My SaaS',
  basePrice: 6.99,
  billingPeriod: 'monthly',
  strategy: 'balanced',
  adjustmentStrength: 0.70,
  enablePsychologicalPricing: true,
  priceFloor: 0.20,
  priceCeiling: 1.20,
}

export const App: React.FC = () => {
  // --- Dark Mode State ---
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME)
    if (savedTheme) return savedTheme === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'light')
    }
  }, [darkMode])

  // --- Calculator Settings State ---
  const [settings, setSettings] = useState<FormSettings>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Ensure all properties are properly defined
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

  // --- Manual Overrides State ---
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

  // --- Calculations Trigger State ---
  // We compute automatically when settings or overrides change
  const results: CalculationResult[] = useMemo(() => {
    return countriesData.map(country => {
      const overrideVal = overrides[country.iso3] !== undefined ? overrides[country.iso3] : null
      return calculateRegionalPrice(country, settings, overrideVal)
    })
  }, [settings, overrides])

  // Handle setting/reverting overrides
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
    if (window.confirm('Are you sure you want to clear all saved settings and manual overrides?')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY_SETTINGS)
      localStorage.removeItem(LOCAL_STORAGE_KEY_OVERRIDES)
      setSettings(DEFAULT_SETTINGS)
      setOverrides({})
      alert('Local storage data cleared.')
    }
  }

  // --- Exporters ---
  const handleDownloadCSV = () => {
    downloadCSV(results, settings)
  }

  const handleDownloadPDF = () => {
    downloadPDF(results, settings)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans antialiased text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero />

        {/* Form and Summary Container */}
        <section id="calculator-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-12">
            {/* Form Column */}
            <div className="lg:col-span-1">
              <CalculatorForm
                settings={settings}
                onChange={setSettings}
                onCalculate={() => {
                  const resultsSection = document.getElementById('results-section')
                  if (resultsSection) {
                    resultsSection.scrollIntoView({ behavior: 'smooth' })
                  }
                }}
              />

              {/* Data Controls Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 mt-4 text-center">
                <span className="text-xs text-slate-500 dark:text-slate-450 block mb-3">
                  All adjustments are stored in your browser's local storage.
                </span>
                <button
                  type="button"
                  onClick={handleClearSavedData}
                  className="py-2 px-4 rounded-xl text-xs font-bold border border-red-200 dark:border-red-900/30 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-95 transition-all"
                >
                  Clear Saved Data
                </button>
              </div>
            </div>

            {/* Results & Statistics Column */}
            <div id="results-section" className="lg:col-span-2 scroll-mt-16">
              <SummaryCards results={results} settings={settings} />
              <ResultsTable
                results={results}
                onOverrideChange={handleOverrideChange}
                onClearAllOverrides={handleClearAllOverrides}
                onDownloadCSV={handleDownloadCSV}
                onDownloadPDF={handleDownloadPDF}
              />
            </div>
          </div>
        </section>

        {/* Methodology explanation section */}
        <Methodology />
      </main>

      <Footer />
    </div>
  )
}

export default App
