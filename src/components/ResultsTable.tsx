import React, { useState, useMemo } from 'react'
import type { CalculationResult } from '../types/pricing'
import { Search, X, RotateCcw, AlertCircle, Info, Download } from 'lucide-react'

interface ResultsTableProps {
  results: CalculationResult[]
  onOverrideChange: (iso3: string, value: number | null) => void
  onClearAllOverrides: () => void
  onDownloadCSV: () => void
  onDownloadPDF: () => void
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  onOverrideChange,
  onClearAllOverrides,
  onDownloadCSV,
  onDownloadPDF,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedIncome, setSelectedIncome] = useState('')
  const [selectedQuality, setSelectedQuality] = useState('')
  const [sortOrder, setSortOrder] = useState('country_az')

  // Get unique options for filter dropdowns based on complete dataset
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
          r.country.currencyCode.toLowerCase().includes(r.country.currencyCode.toLowerCase() === q ? q : ` ${q}`) ||
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

    // Quality filter
    if (selectedQuality) {
      list = list.filter(r => r.country.quality === selectedQuality)
    }

    // Sorting
    list.sort((a, b) => {
      const aFinal = a.isOverride && a.overrideValue !== null ? a.overrideValue : a.recommendedPrice
      const bFinal = b.isOverride && b.overrideValue !== null ? b.overrideValue : b.recommendedPrice

      switch (sortOrder) {
        case 'country_az':
          return a.country.name.localeCompare(b.country.name)
        case 'country_za':
          return b.country.name.localeCompare(a.country.name)
        case 'price_low':
          // Compare in USD values for fair sorting
          return (aFinal / a.country.fx) - (bFinal / b.country.fx)
        case 'price_high':
          return (bFinal / b.country.fx) - (aFinal / a.country.fx)
        case 'discount_large':
          return b.discountPercent - a.discountPercent
        default:
          return 0
      }
    })

    return list
  }, [results, searchQuery, selectedRegion, selectedIncome, selectedQuality, sortOrder])

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedRegion('')
    setSelectedIncome('')
    setSelectedQuality('')
    setSortOrder('country_az')
  }

  const hasActiveFilters = searchQuery || selectedRegion || selectedIncome || selectedQuality || sortOrder !== 'country_az'
  const overriddenCount = results.filter(r => r.isOverride).length

  // Columns description tooltips
  const tooltipContent = {
    fx: 'Base price converted directly using the market exchange rate.',
    ppp: 'Blended price index reflecting raw purchasing power (blend of FX and PPP rates).',
    rec: 'Final recommendation clamped by bounds (floor/ceiling) and formatted with smart rounding.',
    diff: 'Percentage change of recommended price compared to standard FX conversion. Positive discount means cheaper.',
    quality: 'Economic data quality level: Direct Household PPP is the most accurate; other estimates serve as fallback models.',
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors duration-300">
      {/* Header actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Global Recommendations</h3>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
            Displaying {filteredAndSortedResults.length} of {results.length} countries
            {overriddenCount > 0 && ` (${overriddenCount} manual overrides active)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDownloadCSV}
            className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-95 transition-all"
            title="Download UTF-8 CSV"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
          <button
            onClick={onDownloadPDF}
            className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-95 transition-all"
            title="Download landscape PDF report"
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </button>
          {overriddenCount > 0 && (
            <button
              onClick={onClearAllOverrides}
              className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-650 hover:bg-amber-100 dark:hover:bg-amber-950/40 active:scale-95 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Overrides
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by country, currency..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-450 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Region Filter */}
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-650 transition-all"
        >
          <option value="" className="dark:bg-slate-900">All Regions</option>
          {regions.map(r => (
            <option key={r} value={r} className="dark:bg-slate-900">{r}</option>
          ))}
        </select>

        {/* Income Group Filter */}
        <select
          value={selectedIncome}
          onChange={(e) => setSelectedIncome(e.target.value)}
          className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-indigo-650 transition-all"
        >
          <option value="" className="dark:bg-slate-900">All Income Levels</option>
          {incomeGroups.map(i => (
            <option key={i} value={i} className="dark:bg-slate-900">{i}</option>
          ))}
        </select>

        {/* Sorting selector */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-sm text-slate-750 dark:text-slate-250 focus:outline-none focus:ring-2 focus:ring-indigo-650 transition-all"
        >
          <option value="country_az" className="dark:bg-slate-900">Sort: Country A-Z</option>
          <option value="country_za" className="dark:bg-slate-900">Sort: Country Z-A</option>
          <option value="price_low" className="dark:bg-slate-900">Sort: Price (Lowest)</option>
          <option value="price_high" className="dark:bg-slate-900">Sort: Price (Highest)</option>
          <option value="discount_large" className="dark:bg-slate-900">Sort: Discount (Largest)</option>
        </select>
      </div>

      {/* Advanced sub-filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pt-3 border-t border-slate-100 dark:border-slate-850">
        <div className="flex flex-wrap gap-2">
          {/* Data Quality badges */}
          <button
            onClick={() => setSelectedQuality(selectedQuality === 'Direct household PPP' ? '' : 'Direct household PPP')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedQuality === 'Direct household PPP'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-350 dark:hover:border-slate-700'
            }`}
          >
            Direct Household PPP
          </button>
          <button
            onClick={() => setSelectedQuality(selectedQuality === 'GDP PPP fallback' ? '' : 'GDP PPP fallback')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedQuality === 'GDP PPP fallback'
                ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-350 dark:hover:border-slate-700'
            }`}
          >
            GDP Fallback
          </button>
          <button
            onClick={() => setSelectedQuality(selectedQuality === 'Income-group estimate' ? '' : 'Income-group estimate')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedQuality === 'Income-group estimate'
                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-900 dark:text-blue-300'
                : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-350 dark:hover:border-slate-700'
            }`}
          >
            Estimated Data
          </button>
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Filters
          </button>
        )}
      </div>

      {/* Main Results Table */}
      <div className="overflow-x-auto -mx-6">
        <div className="inline-block min-w-full align-middle px-6">
          <div className="overflow-hidden border border-slate-100 dark:border-slate-850 rounded-xl">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-55/60 dark:bg-slate-950/30 sticky top-0 backdrop-blur-md">
                <tr>
                  <th scope="col" className="py-3 px-4 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Country
                  </th>
                  <th scope="col" className="py-3 px-4 text-left text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Currency
                  </th>
                  <th scope="col" className="py-3 px-4 text-right text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1 group cursor-help" title={tooltipContent.fx}>
                      FX Converted Price
                      <Info className="h-3 w-3 text-slate-400" />
                    </span>
                  </th>
                  <th scope="col" className="py-3 px-4 text-right text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1 group cursor-help" title={tooltipContent.ppp}>
                      Blended PPP Price
                      <Info className="h-3 w-3 text-slate-400" />
                    </span>
                  </th>
                  <th scope="col" className="py-3 px-4 text-right text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider min-w-[150px]">
                    <span className="inline-flex items-center gap-1 group cursor-help" title={tooltipContent.rec}>
                      Recommended Price *
                      <Info className="h-3 w-3 text-slate-400" />
                    </span>
                  </th>
                  <th scope="col" className="py-3 px-4 text-right text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1 group cursor-help" title={tooltipContent.diff}>
                      Difference
                      <Info className="h-3 w-3 text-slate-400" />
                    </span>
                  </th>
                  <th scope="col" className="py-3 px-4 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Data Year
                  </th>
                  <th scope="col" className="py-3 px-4 text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <span className="inline-flex items-center gap-1 group cursor-help" title={tooltipContent.quality}>
                      Data Quality
                      <Info className="h-3 w-3 text-slate-400" />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-transparent">
                {filteredAndSortedResults.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-450 dark:text-slate-500">
                        <AlertCircle className="h-10 w-10 text-slate-300 dark:text-slate-700 mb-2" />
                        <span className="text-sm font-semibold">No countries found matching the filters.</span>
                        <button onClick={resetFilters} className="text-xs text-indigo-650 hover:underline mt-1 font-bold">
                          Clear search and filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedResults.map((r) => {
                    const finalPrice = r.isOverride && r.overrideValue !== null ? r.overrideValue : r.recommendedPrice
                    const diffVal = finalPrice - r.fxConvertedPrice
                    const percentDiff = r.fxConvertedPrice > 0 ? (diffVal / r.fxConvertedPrice) * 100 : 0
                    const prefix = diffVal > 0 ? '+' : ''
                    const isDiffNeg = diffVal < 0
                    const isDiffZero = Math.abs(diffVal) < 0.001

                    // Formatting helper
                    const format = (v: number) =>
                      new Intl.NumberFormat(undefined, {
                        style: 'currency',
                        currency: r.country.currencyCode,
                        minimumFractionDigits: r.country.currencyDecimals,
                        maximumFractionDigits: r.country.currencyDecimals,
                      }).format(v)

                    return (
                      <tr
                        key={r.country.iso3}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/35 transition-colors ${
                          r.isOverride ? 'bg-amber-50/10 dark:bg-amber-950/5' : ''
                        }`}
                      >
                        {/* Country */}
                        <td className="py-3.5 px-4 text-sm font-semibold text-slate-850 dark:text-slate-200">
                          <span className="flex items-center gap-2">
                            <span className="text-slate-400 text-xs font-normal uppercase tracking-wider select-all">{r.country.iso2}</span>
                            <span className="truncate max-w-[150px]" title={r.country.name}>
                              {r.country.name}
                            </span>
                          </span>
                        </td>

                        {/* Currency */}
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                          <span className="flex flex-col">
                            <span className="font-bold text-slate-700 dark:text-slate-350">{r.country.currencyCode}</span>
                            <span className="text-[10px] truncate max-w-[120px]" title={r.country.currencyName}>
                              {r.country.currencyName}
                            </span>
                          </span>
                        </td>

                        {/* FX price */}
                        <td className="py-3.5 px-4 text-sm text-right font-medium text-slate-600 dark:text-slate-400">
                          {format(r.fxConvertedPrice)}
                        </td>

                        {/* Blended PPP price */}
                        <td className="py-3.5 px-4 text-sm text-right font-medium text-slate-600 dark:text-slate-400">
                          {format(r.rawRegionalPrice)}
                        </td>

                        {/* Recommended Price (Editable Input) */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {r.isOverride && (
                              <button
                                onClick={() => onOverrideChange(r.country.iso3, null)}
                                className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Reset manual override"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </button>
                            )}
                            <div className="relative max-w-[110px]">
                              <input
                                type="number"
                                step={r.country.currencyDecimals === 0 ? '1' : '0.01'}
                                min="0.01"
                                value={r.overrideValue !== null ? r.overrideValue : r.recommendedPrice}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value)
                                  onOverrideChange(r.country.iso3, isNaN(val) ? null : val)
                                }}
                                className={`w-full py-1 px-2 rounded-lg border text-right text-sm font-bold bg-transparent focus:outline-none focus:ring-1 transition-all ${
                                  r.isOverride
                                    ? 'border-amber-400 ring-1 ring-amber-400 text-amber-650 bg-amber-500/5 focus:ring-amber-500'
                                    : 'border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-indigo-600'
                                }`}
                              />
                            </div>
                          </div>
                          {r.isOverride && (
                            <span className="block text-[9px] text-amber-550 font-bold mt-0.5">
                              Calculated: {format(r.recommendedPrice)}
                            </span>
                          )}
                        </td>

                        {/* Difference */}
                        <td className="py-3.5 px-4 text-sm text-right font-semibold">
                          {isDiffZero ? (
                            <span className="text-slate-400">—</span>
                          ) : (
                            <span className={isDiffNeg ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}>
                              {prefix}
                              {format(Math.abs(diffVal))}
                              <span className="text-[10px] font-normal ms-1">({prefix}{percentDiff.toFixed(0)}%)</span>
                            </span>
                          )}
                        </td>

                        {/* Data Year */}
                        <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 select-all">
                          {r.country.pppYear || r.country.fxYear || 'N/A'}
                        </td>

                        {/* Data Quality label */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${
                              r.country.quality === 'Direct household PPP'
                                ? 'bg-indigo-50/50 border-indigo-100 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-900/40 dark:text-indigo-400'
                                : r.country.quality === 'GDP PPP fallback'
                                ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400'
                                : r.country.quality === 'Income-group estimate' || r.country.quality === 'Regional estimate'
                                ? 'bg-blue-50/50 border-blue-100 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-400'
                                : 'bg-slate-50/80 border-slate-200 text-slate-600 dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-400'
                            }`}
                          >
                            {r.country.quality}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-4 leading-relaxed">
        * You can manually adjust the recommended price for any country directly in the table. Rows with manual overrides will be labeled and included in exports. Click the reset icon next to any overridden value to revert back to the original recommendation.
      </p>
    </div>
  )
}
