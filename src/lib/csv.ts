import type { CalculationResult, FormSettings } from '../types/pricing'

/**
 * Escapes a cell value for CSV formatting.
 * Doubles any quotes and wraps the field in quotes if it contains commas, quotes, or newlines.
 */
export function escapeCSVField(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return ''
  const str = String(val)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Generates a CSV string with a UTF-8 BOM.
 */
export function generateCSV(results: CalculationResult[], settings: FormSettings, displayCurrencyCode: string): string {
  const genDate = new Date().toISOString().split('T')[0]
  const methodologyVersion = '1.0.0'

  // Resolve base and display currency exchange rates from the results
  const baseCountry = results.find(r => r.country.currencyCode === settings.baseCurrency)
  const baseCurrencyFxPerUsd = baseCountry ? baseCountry.country.fx : 1.0

  const displayCountry = results.find(r => r.country.currencyCode === displayCurrencyCode)
  const displayCurrencyFxPerUsd = displayCountry ? displayCountry.country.fx : 1.0

  const basePriceUSD = settings.basePrice / baseCurrencyFxPerUsd

  // Header metadata rows
  const metaRows = [
    ['Product Name', settings.productName],
    ['Billing Period', settings.billingPeriod],
    ['Base Price', settings.basePrice],
    ['Base Currency', settings.baseCurrency],
    ['Display Mode', settings.displayMode],
    ['Display Currency', displayCurrencyCode],
    ['Pricing Strategy', settings.strategy],
    ['Adjustment Strength', `${(settings.adjustmentStrength * 100).toFixed(0)}%`],
    ['Price Floor', `${(settings.priceFloor * 100).toFixed(0)}%`],
    ['Price Ceiling', `${(settings.priceCeiling * 100).toFixed(0)}%`],
    ['Generation Date', genDate],
    ['Methodology Version', methodologyVersion],
    [], // empty spacer row
  ]

  // Column headers matching core product changes
  const columns = [
    'Base Price',
    'Base Currency',
    'Display Mode',
    'Display Currency',
    'Country',
    'ISO2',
    'ISO3',
    'Local Currency',
    'Regional Affordability Factor',
    'Suggested Price in USD',
    'Suggested Price in Selected Display Currency',
    'Selected Display Currency Code',
    'Suggested Local Price',
    'Local Currency Code',
    'Manual Override USD Equivalent',
    'Final Displayed Price',
    'Difference from Base Price',
    'Data Quality',
    'Data Year',
  ]

  const csvRows: string[] = []

  // Add metadata rows
  for (const row of metaRows) {
    if (row.length === 0) {
      csvRows.push('')
    } else {
      csvRows.push(row.map(cell => escapeCSVField(cell)).join(','))
    }
  }

  // Add column headers
  csvRows.push(columns.map(col => escapeCSVField(col)).join(','))

  // Add data rows
  for (const r of results) {
    const finalPrice = r.recommendedPrice
    const suggestedPriceUSD = r.isOverride && r.overrideValue !== null 
      ? r.overrideValue 
      : basePriceUSD * r.factor

    const suggestedDisplayPrice = suggestedPriceUSD * displayCurrencyFxPerUsd
    const suggestedLocalPrice = r.recommendedLocalPrice

    const rowData = [
      settings.basePrice,
      settings.baseCurrency,
      settings.displayMode,
      displayCurrencyCode,
      r.country.name,
      r.country.iso2,
      r.country.iso3,
      r.country.currencyCode,
      r.factor.toFixed(4),
      suggestedPriceUSD.toFixed(4),
      suggestedDisplayPrice.toFixed(4),
      displayCurrencyCode,
      suggestedLocalPrice,
      r.country.currencyCode,
      r.isOverride ? r.overrideValue : '',
      finalPrice,
      r.difference,
      r.country.quality,
      r.country.pppYear || r.country.fxYear || 'N/A',
    ]

    csvRows.push(rowData.map(cell => escapeCSVField(cell)).join(','))
  }

  return csvRows.join('\r\n')
}

/**
 * Triggers a browser download of the CSV content.
 */
export function downloadCSV(results: CalculationResult[], settings: FormSettings, displayCurrencyCode: string): void {
  const csvContent = generateCSV(results, settings, displayCurrencyCode)
  // Prepended with UTF-8 BOM
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.setAttribute('href', url)
  
  const sanitizedName = settings.productName.toLowerCase().replace(/[^a-z0-9]+/g, '_')
  link.setAttribute('download', `${sanitizedName}_regional_prices.csv`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
