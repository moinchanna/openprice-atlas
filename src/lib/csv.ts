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
export function generateCSV(results: CalculationResult[], settings: FormSettings): string {
  const genDate = new Date().toISOString().split('T')[0]
  const methodologyVersion = '1.0.0'

  // Header metadata rows
  const metaRows = [
    ['Product Name', settings.productName],
    ['Billing Period', settings.billingPeriod],
    ['Base Currency', 'USD'],
    ['Base Price', settings.basePrice],
    ['Pricing Strategy', settings.strategy],
    ['Adjustment Strength', `${(settings.adjustmentStrength * 100).toFixed(0)}%`],
    ['Price Floor', `${(settings.priceFloor * 100).toFixed(0)}%`],
    ['Price Ceiling', `${(settings.priceCeiling * 100).toFixed(0)}%`],
    ['Generation Date', genDate],
    ['Methodology Version', methodologyVersion],
    [], // empty spacer row
  ]

  // Column headers
  const columns = [
    'Country',
    'ISO2',
    'ISO3',
    'Region',
    'Income Group',
    'Currency Code',
    'Currency Name',
    'FX Rate',
    'FX Data Year',
    'PPP Value',
    'PPP Data Year',
    'FX-converted Price',
    'Raw Regional Price',
    'Rounded Recommended Price',
    'Manual Override Price',
    'Final Exported Price',
    'Difference from FX Price',
    'Data-quality Label',
    'Generation Date',
    'Methodology Version',
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
    const finalPrice = r.isOverride && r.overrideValue !== null ? r.overrideValue : r.recommendedPrice
    const diffVal = finalPrice - r.fxConvertedPrice

    const rowData = [
      r.country.name,
      r.country.iso2,
      r.country.iso3,
      r.country.region,
      r.country.incomeGroup,
      r.country.currencyCode,
      r.country.currencyName,
      r.country.fx,
      r.country.fxYear,
      r.country.ppp,
      r.country.pppYear,
      r.fxConvertedPrice,
      r.rawRegionalPrice,
      r.recommendedPrice,
      r.isOverride ? r.overrideValue : '',
      finalPrice,
      diffVal,
      r.country.quality,
      genDate,
      methodologyVersion,
    ]

    csvRows.push(rowData.map(cell => escapeCSVField(cell)).join(','))
  }

  return csvRows.join('\r\n')
}

/**
 * Triggers a browser download of the CSV content.
 */
export function downloadCSV(results: CalculationResult[], settings: FormSettings): void {
  const csvContent = generateCSV(results, settings)
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
