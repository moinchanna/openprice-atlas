import React, { useState, useMemo } from 'react'
import type { CalculationResult, FormSettings } from '../types/pricing'
import type { CurrencyInfo } from '../lib/currencies'
import { Search, X, RotateCcw, AlertCircle } from 'lucide-react'

interface ResultsTableProps {
  results: CalculationResult[]
  settings: FormSettings
  onOverrideChange: (iso3: string, value: number | null) => void // Stored as neutral USD value!
  onClearAllOverrides: () => void
  onDownloadCSV: () => void
  onDownloadPDF: () => void
  supportedCurrencies: CurrencyInfo[]
  onSettingsChange: (settings: FormSettings) => void
  displayCurrencyFxPerUsd: number
  displayCurrencyCode: string
  displayDecimals: number
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  settings,
  onOverrideChange,
  onClearAllOverrides,
  onDownloadCSV,
  onDownloadPDF,
  supportedCurrencies,
  onSettingsChange,
  displayCurrencyFxPerUsd,
  displayCurrencyCode,
  displayDecimals,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedIncome, setSelectedIncome] = useState('')
  const [sortOrder, setSortOrder] = useState('country_az')

  // Track inline editing
  const [editingIso3, setEditingIso3] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  // Expandable details states
  const [expandedRowIso3, setExpandedRowIso3] = useState<string | null>(null)
  const [expandedCards, setExpandedCards] = useState<{ [iso3: string]: boolean }>({})
  const [showDetails, setShowDetails] = useState(false)

  const { displayMode, showLocalPrice } = settings

  // Filter lists based on complete dataset
  const regions = useMemo(() => {
    const set = new Set(results.map(r => r.country.region))
    return Array.from(set).sort()
  }, [results])

  const incomeGroups = useMemo(() => {
    const set = new Set(results.map(r => r.country.incomeGroup))
    return Array.from(set).sort()
  }, [results])

  // Filter and Sort results
  const filteredAndSortedResults = useMemo(() => {
    let list = [...results]

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        r =>
          r.country.name.toLowerCase().includes(q) ||
          r.country.currencyCode.toLowerCase().includes(q) ||
          r.country.iso3.toLowerCase().includes(q),
      )
    }

    // Region filter
    if (selectedRegion) {
      list = list.filter(r => r.country.region === selectedRegion)
    }

    // Income group filter
    if (selectedIncome) {
      list = list.filter(r => r.country.incomeGroup === selectedIncome)
    }

    // Sorting
    list.sort((a, b) => {
      const aUSD = a.isOverride && a.overrideValue !== null ? a.overrideValue : (a.recommendedPrice / (displayMode === 'one-currency' ? displayCurrencyFxPerUsd : a.country.fx))
      const bUSD = b.isOverride && b.overrideValue !== null ? b.overrideValue : (b.recommendedPrice / (displayMode === 'one-currency' ? displayCurrencyFxPerUsd : b.country.fx))

      switch (sortOrder) {
        case 'country_az':
          return a.country.name.localeCompare(b.country.name)
        case 'country_za':
          return b.country.name.localeCompare(a.country.name)
        case 'price_low':
          return aUSD - bUSD
        case 'price_high':
          return bUSD - aUSD
        case 'discount_large':
          return b.discountPercent - a.discountPercent
        default:
          return 0
      }
    })

    return list
  }, [results, searchQuery, selectedRegion, selectedIncome, sortOrder, displayMode, displayCurrencyFxPerUsd])

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedRegion('')
    setSelectedIncome('')
    setSortOrder('country_az')
  }

  const hasActiveFilters = searchQuery || selectedRegion || selectedIncome || sortOrder !== 'country_az'
  const overriddenCount = results.filter(r => r.isOverride).length

  // Start inline editing
  const startEdit = (r: CalculationResult) => {
    setEditingIso3(r.country.iso3)
    const decimals = displayMode === 'one-currency' ? displayDecimals : r.country.currencyDecimals
    setEditValue(r.recommendedPrice.toFixed(decimals))
  }

  // Save inline edit (stores neutral USD equivalent!)
  const saveEdit = (iso3: string, countryFx: number) => {
    const val = parseFloat(editValue)
    if (isNaN(val) || val <= 0) {
      onOverrideChange(iso3, null)
    } else {
      // Convert entered display price to neutral USD value
      const valUSD = displayMode === 'one-currency' ? (val / displayCurrencyFxPerUsd) : (val / countryFx)
      onOverrideChange(iso3, valUSD)
    }
    setEditingIso3(null)
  }

  // Toggle mobile card details
  const toggleCardExpansion = (iso3: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [iso3]: !prev[iso3],
    }))
  }

  // Toggle desktop row details
  const toggleRowExpansion = (iso3: string) => {
    setExpandedRowIso3(expandedRowIso3 === iso3 ? null : iso3)
  }

  // Format currency helpers
  const formatCurrency = (val: number, r: CalculationResult) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: r.country.currencyCode,
        minimumFractionDigits: r.country.currencyDecimals,
        maximumFractionDigits: r.country.currencyDecimals,
      }).format(val)
    } catch {
      const symbol = r.country.currencySymbol || r.country.currencyCode
      return `${symbol}${val.toFixed(r.country.currencyDecimals)}`
    }
  }

  const getCalculationMethod = (quality: string) => {
    if (quality === 'Direct household PPP') {
      return 'Blended Purchasing Power Parity (Household consumption model)'
    }
    if (quality === 'GDP PPP fallback') {
      return 'Blended GDP Purchasing Power Parity (Secondary fallback)'
    }
    if (quality === 'Income-group estimate') {
      return 'World Bank Income-Group median ratio estimation'
    }
    if (quality === 'Regional estimate') {
      return 'Geographic region median ratio estimation'
    }
    return 'Direct Exchange Rate Conversion (No buying power adjustment)'
  }

  const getQualityChipStyle = (quality: string) => {
    if (quality === 'Direct household PPP') {
      return 'bg-[#F0FDF4] dark:bg-[#1C3E24] text-[#16A34A] dark:text-[#4ADE80] border-2 border-[#16A34A] dark:border-[#4ADE80]'
    }
    if (quality === 'GDP PPP fallback' || quality === 'Income-group estimate' || quality === 'Regional estimate') {
      return 'bg-[#FEFCE8] dark:bg-[#3F3915] text-[#CA8A04] dark:text-[#FACC15] border-2 border-[#CA8A04] dark:border-[#FACC15]'
    }
    return 'bg-[#FEF2F2] dark:bg-[#3F1A1A] text-[#EF4444] dark:text-[#FCA5A5] border-2 border-[#EF4444] dark:border-[#FCA5A5]'
  }

  // Helper to render year gap status badge
  const getYearGapStatus = (r: CalculationResult) => {
    const pppYear = r.country.pppYear;
    const fxYear = r.country.fxYear;
    if (!pppYear || !fxYear) return null;
    const gap = Math.abs(pppYear - fxYear);
    let label: string;
    let colorClass: string;
    if (gap <= 1) {
      label = 'Closely matched years';
      colorClass = 'text-[#16A34A] dark:text-[#4ADE80]'; // green
    } else if (gap <= 3) {
      label = 'Mixed-year data';
      colorClass = 'text-[#F59E0B] dark:text-[#F59E0B]'; // amber
    } else {
      label = 'Stale or widely mixed-year data';
      colorClass = 'text-[#EF4444] dark:text-[#EF4444]'; // red
    }
    const info = `PPP: ${pppYear} · FX: ${fxYear} · ${gap}-year gap`;
    return (
      <span className={`ml-2 inline-flex items-center ${colorClass}`}>
        <AlertCircle className="w-4 h-4 mr-1" />
        {info} – {label}
      </span>
    );
  };

  const handleModeChange = (mode: 'one-currency' | 'local') => {
    onSettingsChange({
      ...settings,
      displayMode: mode,
    })
  }

  const handleDisplayCurrencyChange = (currency: string) => {
    onSettingsChange({
      ...settings,
      displayCurrency: currency,
    })
  }

  const handleShowLocalPriceChange = (val: boolean) => {
    onSettingsChange({
      ...settings,
      showLocalPrice: val,
    })
  }

  // Wording helper for Change from Base in One Currency mode
  const getChangeFromBaseLabel = (diffVal: number, percentDiff: number) => {
    if (Math.abs(diffVal) < 0.001) return 'Same as base'
    const direction = diffVal < 0 ? 'lower' : 'higher'
    return `${Math.abs(percentDiff).toFixed(0)}% ${direction}`
  }

  const currentDisplayCurrencyInputValue = settings.displayCurrency === 'same-as-base' ? 'SAME AS BASE' : settings.displayCurrency

  return (
    <div className="bg-[#F5F5F5] dark:bg-[#121212] border-2 border-[#0A0A0A] dark:border-[#525252] rounded-none p-5 sm:p-6 shadow-none transition-colors duration-300 max-w-full min-w-0">
      
      {/* 03 / COUNTRY PRICES */}
      <div className="mb-6">
        <span className="block font-sans text-sm sm:text-[15px] font-bold tracking-[0.1em] text-[#EF4444] uppercase mb-1">
          03 / COUNTRY PRICES
        </span>
        <h3 className="font-display text-[28px] md:text-[34px] font-normal text-[#0A0A0A] dark:text-[#FAFAFA] uppercase tracking-tight">
          SUGGESTED PRICES BY COUNTRY.
        </h3>
        <p className="text-[17px] text-[#404040] dark:text-[#D4D4D4] mt-1.5 leading-normal max-w-2xl font-sans">
          Use these estimates as a starting point for your pricing research. Showing {filteredAndSortedResults.length} of {results.length} countries.
          {overriddenCount > 0 && ` (${overriddenCount} edited)`}
        </p>
        <div className="w-12 h-0.5 bg-[#0A0A0A] dark:bg-[#FAFAFA] mt-3" />
      </div>

      {/* Results Display Mode Segmented Controls */}
      <div className="border-b border-[#D4D4D4] dark:border-[#525252] pb-5 mb-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Display Mode Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-[14px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA] uppercase tracking-wider">SHOW PRICES AS</span>
            <div className="flex border-2 border-[#0A0A0A] dark:border-[#525252]">
              <button
                type="button"
                onClick={() => handleModeChange('one-currency')}
                className={`py-1.5 px-3 text-[15px] font-bold uppercase tracking-wider rounded-none cursor-pointer ${
                  displayMode === 'one-currency' ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A]' : 'bg-transparent text-[#404040] dark:text-[#D4D4D4] hover:bg-[#E5E5E5] dark:hover:bg-[#262626]'
                }`}
              >
                ONE CURRENCY
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('local')}
                className={`py-1.5 px-3 text-[15px] font-bold uppercase tracking-wider rounded-none cursor-pointer ${
                  displayMode === 'local' ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A]' : 'bg-transparent text-[#404040] dark:text-[#D4D4D4] hover:bg-[#E5E5E5] dark:hover:bg-[#262626]'
                }`}
              >
                LOCAL CURRENCIES
              </button>
            </div>
          </div>

          {/* Conditional dropdown & checkbox selectors */}
          {displayMode === 'one-currency' && (
            <div className="flex flex-wrap items-center gap-4">
              {/* Searchable Display Currency dropdown */}
              <div className="flex items-center gap-2">
                <label htmlFor="displayCurrency" className="text-[14px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA] uppercase tracking-wider">DISPLAY CURRENCY</label>
                <div className="relative">
                  <input
                    type="text"
                    list="displayCurrencyList"
                    id="displayCurrency"
                    value={currentDisplayCurrencyInputValue}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase()
                      if (val === 'SAME AS BASE' || supportedCurrencies.some(c => c.code === val)) {
                        handleDisplayCurrencyChange(val === 'SAME AS BASE' ? 'same-as-base' : val)
                      } else {
                        handleDisplayCurrencyChange(e.target.value)
                      }
                    }}
                    onBlur={() => {
                      if (settings.displayCurrency !== 'same-as-base' && !supportedCurrencies.some(c => c.code === settings.displayCurrency.toUpperCase())) {
                        handleDisplayCurrencyChange('same-as-base')
                      }
                    }}
                    className="h-[50px] px-3 border-2 border-[#BDBDBD] dark:border-[#525252] bg-white dark:bg-[#1A1A1A] text-[17px] font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-[#FAFAFA] focus:outline-none focus:border-[#0A0A0A] dark:focus:border-[#FAFAFA] rounded-none w-48"
                  />
                  <datalist id="displayCurrencyList">
                    <option value="SAME AS BASE" />
                    {supportedCurrencies.map((curr) => (
                      <option key={curr.code} value={curr.code}>
                        {curr.name}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Show Local Price Toggle Checkbox */}
              <label className="inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showLocalPrice}
                  onChange={(e) => handleShowLocalPriceChange(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-[18px] h-[18px] border-2 border-[#0A0A0A] dark:border-[#FAFAFA] flex items-center justify-center transition-colors rounded-none ${
                  showLocalPrice ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA]' : 'bg-[#FAFAFA] dark:bg-[#1A1A1A] hover:bg-[#E5E5E5] dark:hover:bg-[#262626]'
                }`}>
                  {showLocalPrice && (
                    <svg className="w-3 h-3 text-[#FAFAFA] dark:text-[#0A0A0A] fill-current" viewBox="0 0 20 20">
                      <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                  )}
                </div>
                <span className="ml-[10px] text-[15px] font-bold text-[#404040] dark:text-[#D4D4D4] uppercase tracking-[0.04em]">
                  SHOW LOCAL PRICE TOO
                </span>
              </label>
            </div>
          )}
        </div>
      </div>
      
      {/* Exporter Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {overriddenCount > 0 && (
          <button
            onClick={onClearAllOverrides}
            className="flex items-center gap-1.5 h-12 px-5 rounded-none text-[16px] font-bold bg-[#FAFAFA] dark:bg-[#121212] border-2 border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444] hover:text-[#FAFAFA] dark:hover:text-[#FAFAFA] active:bg-[#DC2626] transition-colors duration-150 cursor-pointer select-none"
          >
            <RotateCcw className="h-4 w-4" />
            RESET OVERRIDES
          </button>
        )}
        <button
          onClick={onDownloadCSV}
          className="h-12 px-6 rounded-none text-[16px] font-bold border-2 border-[#0A0A0A] dark:border-[#FAFAFA] bg-transparent text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#0A0A0A] dark:hover:bg-[#FAFAFA] hover:text-[#FAFAFA] dark:hover:text-[#0A0A0A] active:bg-[#262626] transition-colors duration-150 cursor-pointer uppercase tracking-[0.06em] select-none"
          title="Download CSV report"
        >
          DOWNLOAD CSV
        </button>
        <button
          onClick={onDownloadPDF}
          className="h-12 px-6 rounded-none text-[16px] font-bold border-2 border-[#0A0A0A] dark:border-[#FAFAFA] bg-transparent text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#0A0A0A] dark:hover:bg-[#FAFAFA] hover:text-[#FAFAFA] dark:hover:text-[#0A0A0A] active:bg-[#262626] transition-colors duration-150 cursor-pointer uppercase tracking-[0.06em] select-none"
          title="Download PDF report"
        >
          DOWNLOAD PDF
        </button>
      </div>

      {/* Filter panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A3A3A3]" />
          <input
            type="text"
            placeholder="SEARCH COUNTRY OR CURRENCY"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 h-[50px] border-2 border-[#BDBDBD] dark:border-[#525252] bg-[#FAFAFA] dark:bg-[#1A1A1A] text-[17px] font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-[#FAFAFA] placeholder-[#737373] dark:placeholder-[#A3A3A3] focus:outline-none focus:border-[#0A0A0A] dark:focus:border-[#FAFAFA] rounded-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#404040] dark:text-[#D4D4D4] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Region */}
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="h-[50px] px-3 border-2 border-[#BDBDBD] dark:border-[#525252] bg-[#FAFAFA] dark:bg-[#1A1A1A] text-[17px] font-bold uppercase tracking-wider text-[#404040] dark:text-[#D4D4D4] focus:outline-none focus:border-[#0A0A0A] dark:focus:border-[#FAFAFA] rounded-none transition-all cursor-pointer"
        >
          <option value="" className="bg-[#FAFAFA] dark:bg-[#1A1A1A]">ALL REGIONS</option>
          {regions.map(r => (
            <option key={r} value={r} className="bg-[#FAFAFA] dark:bg-[#1A1A1A]">{r.toUpperCase()}</option>
          ))}
        </select>

        {/* Income Level */}
        <select
          value={selectedIncome}
          onChange={(e) => setSelectedIncome(e.target.value)}
          className="h-[50px] px-3 border-2 border-[#BDBDBD] dark:border-[#525252] bg-[#FAFAFA] dark:bg-[#1A1A1A] text-[17px] font-bold uppercase tracking-wider text-[#404040] dark:text-[#D4D4D4] focus:outline-none focus:border-[#0A0A0A] dark:focus:border-[#FAFAFA] rounded-none transition-all cursor-pointer"
        >
          <option value="" className="bg-[#FAFAFA] dark:bg-[#1A1A1A]">ALL INCOME LEVELS</option>
          {incomeGroups.map(i => (
            <option key={i} value={i} className="bg-[#FAFAFA] dark:bg-[#1A1A1A]">{i.toUpperCase()}</option>
          ))}
        </select>

        {/* Sorting */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="h-[50px] px-3 border-2 border-[#BDBDBD] dark:border-[#525252] bg-[#FAFAFA] dark:bg-[#1A1A1A] text-[17px] font-bold uppercase tracking-wider text-[#404040] dark:text-[#D4D4D4] focus:outline-none focus:border-[#0A0A0A] dark:focus:border-[#FAFAFA] rounded-none transition-all cursor-pointer"
        >
          <option value="country_az" className="bg-[#FAFAFA] dark:bg-[#1A1A1A]">SORT: COUNTRY A–Z</option>
          <option value="country_za" className="bg-[#FAFAFA] dark:bg-[#1A1A1A]">SORT: COUNTRY Z–A</option>
          <option value="price_low" className="bg-[#FAFAFA] dark:bg-[#1A1A1A]">SORT: PRICE (LOWEST)</option>
          <option value="price_high" className="bg-[#FAFAFA] dark:bg-[#1A1A1A]">SORT: PRICE (HIGHEST)</option>
          <option value="discount_large" className="bg-[#FAFAFA] dark:bg-[#1A1A1A]">SORT: DISCOUNT (LARGEST)</option>
        </select>
      </div>

      {/* Advanced sub-filters (Details toggle and Reset filter link) */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-[#D4D4D4] dark:border-[#525252]">
        <div>
          {/* Show details switch */}
          <label className="inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showDetails}
              onChange={(e) => setShowDetails(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-[18px] h-[18px] border-2 border-[#0A0A0A] dark:border-[#FAFAFA] flex items-center justify-center transition-colors rounded-none ${
              showDetails ? 'bg-[#0A0A0A] dark:bg-[#FAFAFA]' : 'bg-[#FAFAFA] dark:bg-[#1A1A1A] hover:bg-[#E5E5E5] dark:hover:bg-[#262626]'
            }`}>
              {showDetails && (
                <svg className="w-3 h-3 text-[#FAFAFA] dark:text-[#0A0A0A] fill-current" viewBox="0 0 20 20">
                  <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                </svg>
              )}
            </div>
            <span className="ms-2 text-[15px] font-bold text-[#404040] dark:text-[#D4D4D4] uppercase tracking-[0.04em]">
              Show data details
            </span>
          </label>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-[15px] font-bold text-[#EF4444] dark:text-[#EF4444] hover:underline flex items-center gap-1 cursor-pointer select-none uppercase tracking-wider"
          >
            <RotateCcw className="h-3 w-3" />
            RESET FILTERS
          </button>
        )}
      </div>

      {/* DESKTOP VIEW: FIXED COLUMN TABLE */}
      <div className="hidden md:block w-full min-w-0">
        <div className="overflow-hidden border-2 border-[#0A0A0A] dark:border-[#525252] rounded-none">
          <table className="w-full table-fixed divide-y-2 divide-[#0A0A0A] dark:divide-[#525252]">
            {displayMode === 'one-currency' ? (
              <colgroup>
                <col className="w-[30%]" />
                <col className="w-[30%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
              </colgroup>
            ) : (
              <colgroup>
                <col className="w-[24%]" />
                <col className="w-[14%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
                <col className="w-[13%]" />
                <col className="w-[13%]" />
              </colgroup>
            )}
            
            <thead className="bg-[#0A0A0A] dark:bg-[#FAFAFA] text-[#FAFAFA] dark:text-[#0A0A0A] font-sans">
              <tr className="text-[14px] font-bold uppercase tracking-[0.06em] text-left">
                <th scope="col" className="py-3.5 px-4">Country</th>
                {displayMode === 'one-currency' ? (
                  <>
                    <th scope="col" className="py-3.5 px-4 text-right">SUGGESTED PRICE — {displayCurrencyCode}</th>
                    <th scope="col" className="py-3.5 px-4 text-right">CHANGE FROM BASE</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
                  </>
                ) : (
                  <>
                    <th scope="col" className="py-3.5 px-4">Currency</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Direct conversion</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Suggested local price</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Difference</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
                  </>
                )}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-[#D4D4D4] dark:divide-[#525252] bg-white dark:bg-[#121212] text-[16px] text-[#0A0A0A] dark:text-[#FAFAFA]">
              {filteredAndSortedResults.length === 0 ? (
                <tr>
                  <td colSpan={displayMode === 'one-currency' ? 4 : 6} className="py-12 text-center bg-white dark:bg-[#121212]">
                    <div className="flex flex-col items-center justify-center text-[#404040] dark:text-[#D4D4D4]">
                      <AlertCircle className="h-8 w-8 mb-2 opacity-60" />
                      <span className="text-[15px] font-bold uppercase tracking-wider">No countries match your filter criteria.</span>
                      <button onClick={resetFilters} className="text-[15px] text-[#EF4444] hover:underline mt-1 font-bold cursor-pointer uppercase tracking-wider">
                        Clear search and filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedResults.map((r) => {
                  const isEditing = editingIso3 === r.country.iso3
                  const isExpanded = expandedRowIso3 === r.country.iso3
                  const diffVal = r.difference
                  const percentDiff = r.discountPercent * -1 // Difference value percentage
                  const prefix = diffVal > 0 ? '+' : ''
                  const isDiffNeg = diffVal < 0
                  const isDiffZero = Math.abs(diffVal) < 0.001

                  return (
                    <React.Fragment key={r.country.iso3}>
                      <tr
                        className={`relative group/row hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors duration-150 ${
                          r.isOverride ? 'bg-[#FEFCE8]/20 dark:bg-[#FEFCE8]/5' : ''
                        } ${isExpanded ? 'bg-[#F5F5F5] dark:bg-[#262626]' : ''}`}
                      >
                        {/* Country */}
                        <td className="relative py-[22px] px-4 font-bold text-[17px]">
                          {/* Left hover indicator red line */}
                          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#EF4444] opacity-0 group-hover/row:opacity-100 transition-opacity" />
                          <span className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[12px] font-mono text-[#666666] dark:text-[#A3A3A3] uppercase select-all shrink-0">{r.country.iso2}</span>
                            <span title={r.country.name}>
                              {r.country.name}
                            </span>
                          </span>
                        </td>

                        {displayMode === 'one-currency' ? (
                          /* ONE CURRENCY MODE COLUMNS */
                          <>
                            {/* Suggested price (with optional local checkout suggestion) */}
                            <td className="py-[22px] px-4 text-right whitespace-nowrap">
                              {isEditing ? (
                                <div className="flex items-center justify-end gap-1">
                                  <input
                                    type="number"
                                    step={displayDecimals === 0 ? '1' : '0.01'}
                                    min="0.01"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-24 h-10 px-1.5 border-2 border-[#0A0A0A] dark:border-[#FAFAFA] bg-transparent text-right text-[17px] font-mono font-bold focus:outline-none rounded-none text-[#0A0A0A] dark:text-[#FAFAFA]"
                                    autoFocus
                                  />
                                </div>
                              ) : (
                                <div className="flex flex-col items-end">
                                  <span className={`font-mono font-extrabold text-[19px] ${r.isOverride ? 'text-[#EF4444] dark:text-[#EF4444]' : 'text-[#0A0A0A] dark:text-[#FAFAFA]'}`}>
                                    {r.recommendedPriceFormatted}
                                  </span>
                                  {showLocalPrice && (
                                    <span className="block text-[14px] text-[#404040] dark:text-[#D4D4D4] font-semibold mt-0.5" title={r.recommendedLocalPriceFormatted}>
                                      About {r.recommendedLocalPriceFormatted} locally
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* Change from Base */}
                            <td className="py-[22px] px-4 text-right font-mono font-bold text-[16px] whitespace-nowrap">
                              <span className={isDiffNeg ? 'text-[#16A34A] dark:text-[#4ADE80]' : 'text-[#404040] dark:text-[#D4D4D4]'}>
                                {getChangeFromBaseLabel(diffVal, percentDiff)}
                              </span>
                            </td>
                          </>
                        ) : (
                          /* LOCAL CURRENCIES MODE COLUMNS */
                          <>
                            {/* Currency */}
                            <td className="py-[22px] px-4 text-[16px] font-semibold text-[#404040] dark:text-[#D4D4D4]">
                              <div className="flex flex-col min-w-0">
                                <span className="text-[#0A0A0A] dark:text-[#FAFAFA] font-bold text-[16px]">{r.country.currencyCode}</span>
                                <span className="text-[14px] font-normal text-[#666666] dark:text-[#A3A3A3]" title={r.country.currencyName}>
                                  {r.country.currencyName}
                                </span>
                              </div>
                            </td>

                            {/* Direct conversion */}
                            <td className="py-[22px] px-4 text-right font-mono font-medium text-[#404040] dark:text-[#D4D4D4] text-[16px] whitespace-nowrap">
                              {formatCurrency(r.fxConvertedPrice, r)}
                            </td>

                            {/* Suggested local price */}
                            <td className="py-[22px] px-4 text-right whitespace-nowrap">
                              {isEditing ? (
                                <div className="flex items-center justify-end gap-1">
                                  <input
                                    type="number"
                                    step={r.country.currencyDecimals === 0 ? '1' : '0.01'}
                                    min="0.01"
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-24 h-10 px-1.5 border-2 border-[#0A0A0A] dark:border-[#FAFAFA] bg-transparent text-right text-[17px] font-mono font-bold focus:outline-none rounded-none text-[#0A0A0A] dark:text-[#FAFAFA]"
                                    autoFocus
                                  />
                                </div>
                              ) : (
                                <span className={`font-mono font-extrabold text-[19px] ${r.isOverride ? 'text-[#EF4444] dark:text-[#EF4444]' : 'text-[#0A0A0A] dark:text-[#FAFAFA]'}`}>
                                  {r.recommendedPriceFormatted}
                                </span>
                              )}
                            </td>

                            {/* Difference */}
                            <td className="py-[22px] px-4 text-right font-mono font-bold text-[16px] whitespace-nowrap">
                              {isDiffZero ? (
                                <span className="text-[#666666] dark:text-[#A3A3A3]">—</span>
                              ) : (
                                <span className={isDiffNeg ? 'text-[#16A34A] dark:text-[#4ADE80]' : 'text-[#404040] dark:text-[#D4D4D4]'}>
                                  {prefix}{formatCurrency(Math.abs(diffVal), r)}
                                  <span className="text-[14px] font-normal ms-1">({prefix}{percentDiff.toFixed(0)}%)</span>
                                </span>
                              )}
                            </td>
                          </>
                        )}

                        {/* Actions Column (Common) */}
                        <td className="py-[22px] px-4 text-right">
                          <div className="flex items-center justify-end gap-2 text-[15px] font-bold font-sans tracking-wider">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveEdit(r.country.iso3, r.country.fx)}
                                  className="text-[#16A34A] dark:text-[#4ADE80] hover:underline cursor-pointer uppercase"
                                >
                                  SAVE
                                </button>
                                <button
                                  onClick={() => setEditingIso3(null)}
                                  className="text-[#404040] dark:text-[#D4D4D4] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA] hover:underline cursor-pointer uppercase"
                                >
                                  CANCEL
                                </button>
                              </>
                            ) : (
                              <>
                                {/* Reset manual override button */}
                                {r.isOverride && (
                                  <button
                                    onClick={() => onOverrideChange(r.country.iso3, null)}
                                    className="text-[#EF4444] hover:underline cursor-pointer uppercase"
                                    title="Reset price"
                                  >
                                    RESET
                                  </button>
                                )}

                                {/* Edit Button */}
                                <button
                                  onClick={() => startEdit(r)}
                                  className="text-[#0A0A0A] dark:text-[#FAFAFA] hover:text-[#EF4444] hover:underline cursor-pointer uppercase"
                                >
                                  EDIT
                                </button>

                                {/* Details Drawer Toggle */}
                                {showDetails && (
                                  <button
                                    onClick={() => toggleRowExpansion(r.country.iso3)}
                                    className="text-[#0A0A0A] dark:text-[#FAFAFA] hover:text-[#EF4444] hover:underline cursor-pointer uppercase"
                                  >
                                    {isExpanded ? 'CLOSE' : 'DETAILS'}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Desktop Details Row */}
                      {showDetails && isExpanded && (
                        <tr className="bg-[#F5F5F5] dark:bg-[#1A1A1A] select-none border-b border-[#D4D4D4] dark:border-[#525252]">
                          <td colSpan={displayMode === 'one-currency' ? 4 : 6} className="py-5 px-6 border-l-4 border-l-[#EF4444]">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-[15px] text-[#404040] dark:text-[#D4D4D4]">
                              <div>
                                <strong className="block text-[14px] uppercase font-bold text-[#666666] dark:text-[#A3A3A3] mb-1 tracking-wider">Buying-power price</strong>
                                <span className="font-mono font-extrabold text-[#0A0A0A] dark:text-[#FAFAFA] text-[18px]">
                                  {displayMode === 'one-currency' 
                                    ? new Intl.NumberFormat(undefined, { style: 'currency', currency: displayCurrencyCode, minimumFractionDigits: displayDecimals }).format(r.rawRegionalPrice)
                                    : formatCurrency(r.rawRegionalPrice, r)}
                                </span>
                              </div>
                              <div>
                                <strong className="block text-[14px] uppercase font-bold text-[#666666] dark:text-[#A3A3A3] mb-1 tracking-wider">Data Year</strong>
                                <span className="font-mono font-bold text-[#0A0A0A] dark:text-[#FAFAFA] text-[18px]">{r.country.pppYear || r.country.fxYear || 'N/A'}</span>{getYearGapStatus(r)}
                              </div>
                              <div>
                                <strong className="block text-[14px] uppercase font-bold text-[#666666] dark:text-[#A3A3A3] mb-1 tracking-wider">Data Quality</strong>
                                <span className={`inline-block px-2.5 py-0.5 rounded-none text-[14px] font-bold ${getQualityChipStyle(r.country.quality)}`}>
                                  {r.country.quality}
                                </span>
                              </div>
                              <div>
                                <strong className="block text-[14px] uppercase font-bold text-[#666666] dark:text-[#A3A3A3] mb-1 tracking-wider">PPP Data Source</strong>
                                <span className="font-semibold text-[#0A0A0A] dark:text-[#FAFAFA]">World Bank (Indicators: PA.NUS.PRVT.PP / PA.NUS.PPP)</span>
                              </div>
                              <div>
                                <strong className="block text-[14px] uppercase font-bold text-[#666666] dark:text-[#A3A3A3] mb-1 tracking-wider">Exchange-rate Source</strong>
                                <span className="font-semibold text-[#0A0A0A] dark:text-[#FAFAFA]">World Bank (Indicator: PA.NUS.FCRF)</span>
                              </div>
                              <div>
                                <strong className="block text-[14px] uppercase font-bold text-[#666666] dark:text-[#A3A3A3] mb-1 tracking-wider">Calculation Method</strong>
                                <span className="font-semibold text-[#0A0A0A] dark:text-[#FAFAFA]">{getCalculationMethod(r.country.quality)}</span>
                              </div>
                              {r.isOverride && (
                                <div className="lg:col-span-3 pt-3 border-t border-[#E5E5E5] dark:border-[#525252] flex justify-between items-center text-[#EF4444] font-bold">
                                  <span>MANUAL OVERRIDE ACTIVE</span>
                                  <span className="font-mono text-[17px]">
                                    Originally calculated: {r.recommendedPriceFormatted}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLET & MOBILE VIEW: RESPONSIVE CARDS */}
      <div className="block md:hidden space-y-4 max-w-full">
        {filteredAndSortedResults.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-[#D4D4D4] dark:border-[#525252] bg-white dark:bg-[#121212] rounded-none">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-[#666666] dark:text-[#A3A3A3] opacity-60" />
            <p className="text-[17px] font-bold uppercase tracking-wider text-[#404040] dark:text-[#D4D4D4]">No countries match your filter criteria.</p>
            <button onClick={resetFilters} className="text-[17px] text-[#EF4444] hover:underline mt-1 font-bold cursor-pointer uppercase tracking-wider">
              Clear search and filters
            </button>
          </div>
        ) : (
          filteredAndSortedResults.map((r) => {
            const isEditing = editingIso3 === r.country.iso3
            const expanded = !!expandedCards[r.country.iso3]
            const diffVal = r.difference
            const percentDiff = r.discountPercent * -1
            const prefix = diffVal > 0 ? '+' : ''
            const isDiffNeg = diffVal < 0
            const isDiffZero = Math.abs(diffVal) < 0.001

            return (
              <div
                key={r.country.iso3}
                className={`border-2 border-[#0A0A0A] dark:border-[#525252] bg-white dark:bg-[#121212] rounded-none p-4 transition-colors space-y-3 ${
                  r.isOverride ? 'bg-[#FEFCE8]/10 dark:bg-[#FEFCE8]/5' : ''
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-2">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[12px] font-mono text-[#666666] dark:text-[#A3A3A3] uppercase select-all mr-1.5">{r.country.iso2}</span>
                    <span className="text-[17px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA] leading-tight truncate">
                      {r.country.name}
                    </span>
                    <span className="block text-[14px] text-[#404040] dark:text-[#D4D4D4] leading-none truncate">
                      {r.country.currencyName} ({r.country.currencyCode})
                    </span>
                  </div>
                  {r.isOverride && (
                    <span className="text-[11px] font-bold text-[#EF4444] border border-[#EF4444] px-1.5 py-0.5 rounded-none select-none">
                      EDITED
                    </span>
                  )}
                </div>

                {/* Pricing Fields row */}
                <div className="grid grid-cols-2 gap-3 text-[17px]">
                  <div>
                    <span className="block text-[#404040] dark:text-[#D4D4D4] text-[14px] font-bold uppercase tracking-wider">Suggested price</span>
                    
                    {isEditing ? (
                      <div className="flex items-center gap-1 mt-1">
                        <input
                          type="number"
                          step={r.country.currencyDecimals === 0 ? '1' : '0.01'}
                          min="0.01"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-20 h-9 py-0.5 px-1.5 border-2 border-[#0A0A0A] dark:border-[#FAFAFA] bg-transparent text-right text-[16px] font-mono font-bold rounded-none focus:outline-none text-[#0A0A0A] dark:text-[#FAFAFA]"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEdit(r.country.iso3, r.country.fx)}
                          className="px-2 py-1 rounded-none bg-[#0A0A0A] dark:bg-[#FAFAFA] text-white dark:text-[#0A0A0A] text-[14px] font-bold uppercase cursor-pointer"
                        >
                          SAVE
                        </button>
                        <button
                          onClick={() => setEditingIso3(null)}
                          className="px-2 py-1 rounded-none border border-[#BDBDBD] dark:border-[#525252] text-[#404040] dark:text-[#D4D4D4] text-[14px] font-bold uppercase cursor-pointer"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start gap-1 mt-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-extrabold text-[22px] ${r.isOverride ? 'text-[#EF4444] dark:text-[#EF4444]' : 'text-[#0A0A0A] dark:text-[#FAFAFA]'}`}>
                            {r.recommendedPriceFormatted}
                          </span>
                          <button
                            onClick={() => startEdit(r)}
                            className="text-[14px] font-bold text-[#0A0A0A] dark:text-[#FAFAFA] hover:text-[#EF4444] hover:underline cursor-pointer uppercase"
                          >
                            EDIT
                          </button>
                        </div>
                        {displayMode === 'one-currency' && showLocalPrice && (
                          <span className="text-[14px] text-[#404040] dark:text-[#D4D4D4] font-semibold mt-0.5">
                            About {r.recommendedLocalPriceFormatted} locally
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="block text-[#404040] dark:text-[#D4D4D4] text-[14px] font-bold uppercase tracking-wider">
                      Direct conversion
                    </span>
                    <span className="block mt-1 font-mono font-medium text-[#404040] dark:text-[#D4D4D4] text-[17px]">
                      {displayMode === 'one-currency'
                        ? new Intl.NumberFormat(undefined, { style: 'currency', currency: displayCurrencyCode, minimumFractionDigits: displayDecimals }).format(r.fxConvertedPrice)
                        : formatCurrency(r.fxConvertedPrice, r)}
                    </span>
                  </div>
                </div>

                {/* Diff & Actions row */}
                <div className="flex items-center justify-between pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
                  <div className="text-[17px] font-bold font-mono">
                    {displayMode === 'one-currency' ? (
                      <span className={isDiffNeg ? 'text-[#16A34A] dark:text-[#4ADE80]' : 'text-[#404040] dark:text-[#D4D4D4]'}>
                        {getChangeFromBaseLabel(diffVal, percentDiff)}
                      </span>
                    ) : (
                      isDiffZero ? (
                        <span className="text-[#666666] dark:text-[#A3A3A3]">—</span>
                      ) : (
                        <span className={isDiffNeg ? 'text-[#16A34A] dark:text-[#4ADE80]' : 'text-[#404040] dark:text-[#D4D4D4]'}>
                          {prefix}{percentDiff.toFixed(0)}% ({isDiffNeg ? 'Discount' : 'Increase'})
                        </span>
                      )
                    )}
                  </div>

                  {/* Expansion & edit reset actions */}
                  <div className="flex items-center gap-2 text-[14px] font-bold uppercase tracking-wider">
                    {r.isOverride && (
                      <button
                        onClick={() => onOverrideChange(r.country.iso3, null)}
                        className="text-[#EF4444] hover:underline cursor-pointer"
                      >
                        RESET
                      </button>
                    )}
                    {showDetails && (
                      <button
                        onClick={() => toggleCardExpansion(r.country.iso3)}
                        className="text-[#0A0A0A] dark:text-[#FAFAFA] hover:text-[#EF4444] hover:underline cursor-pointer"
                      >
                        {expanded ? 'CLOSE' : 'DETAILS'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded mobile details drawer */}
                {showDetails && expanded && (
                  <div className="mt-3 p-3 rounded-none bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[15px] space-y-2 border-l-4 border-l-[#EF4444] animate-fadeIn text-[#404040] dark:text-[#D4D4D4]">
                    <div className="flex justify-between">
                      <span className="font-bold text-[#666666] dark:text-[#A3A3A3] uppercase">Buying-power price:</span>
                      <span className="font-mono font-bold text-[#0A0A0A] dark:text-[#FAFAFA]">
                        {displayMode === 'one-currency'
                          ? new Intl.NumberFormat(undefined, { style: 'currency', currency: displayCurrencyCode, minimumFractionDigits: displayDecimals }).format(r.rawRegionalPrice)
                          : formatCurrency(r.rawRegionalPrice, r)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-[#666666] dark:text-[#A3A3A3] uppercase">Difference:</span>
                      <span className="font-mono font-bold text-[#0A0A0A] dark:text-[#FAFAFA]">
                        {displayMode === 'one-currency'
                          ? new Intl.NumberFormat(undefined, { style: 'currency', currency: displayCurrencyCode, minimumFractionDigits: displayDecimals }).format(Math.abs(diffVal))
                          : formatCurrency(Math.abs(diffVal), r)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-[#666666] dark:text-[#A3A3A3] uppercase">Data year:</span>
                      <span className="font-mono font-bold text-[#0A0A0A] dark:text-[#FAFAFA]">{r.country.pppYear || 'N/A'}</span>{getYearGapStatus(r)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#666666] dark:text-[#A3A3A3] uppercase">Economic quality:</span>
                      <span className={`inline-block px-1.5 py-0.5 font-bold ${getQualityChipStyle(r.country.quality)}`}>
                        {r.country.quality}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-[#666666] dark:text-[#A3A3A3] uppercase">PPP Source:</span>
                      <span className="font-semibold text-[#0A0A0A] dark:text-[#FAFAFA]">World Bank</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-[#666666] dark:text-[#A3A3A3] uppercase">Exchange Source:</span>
                      <span className="font-semibold text-[#0A0A0A] dark:text-[#FAFAFA]">World Bank</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-[#666666] dark:text-[#A3A3A3] uppercase">Calculation:</span>
                      <span className="font-semibold text-[#0A0A0A] dark:text-[#FAFAFA]">{getCalculationMethod(r.country.quality)}</span>
                    </div>
                    {r.isOverride && (
                      <div className="flex justify-between text-[#EF4444] font-bold border-t border-[#E5E5E5] dark:border-[#262626] pt-1.5 mt-1.5">
                        <span>ORIGINALLY CALC:</span>
                        <span>{r.recommendedPriceFormatted}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <p className="text-[15px] text-[#666666] dark:text-[#A3A3A3] mt-4 leading-relaxed font-semibold uppercase tracking-wider select-none">
        * You can manually adjust the recommended price for any country directly in the table. Rows with manual overrides will be labeled and included in exports. Click the reset link next to any overridden value to revert back to the original recommendation.
      </p>
    </div>
  )
}
export default ResultsTable
