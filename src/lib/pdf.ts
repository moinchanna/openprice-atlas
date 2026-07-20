import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CalculationResult, FormSettings } from '../types/pricing'

/**
 * Generates and downloads a polished PDF report of the regional prices.
 */
export function downloadPDF(
  results: CalculationResult[],
  settings: FormSettings,
  displayCurrencyCode: string,
): void {
  // Use landscape orientation for spacious columns
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15

  // Page tracking for footer
  const totalPagesExp = '{total_pages_count_string}'

  // 1. Cover / Header Information
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(10, 10, 10) // Black #0A0A0A
  doc.text('OPENPRICE ATLAS', margin, margin + 5)

  doc.setFontSize(9)
  doc.setFont('Helvetica', 'normal')
  doc.setTextColor(82, 82, 82) // Neutral-600
  doc.text('ESTIMATE FAIR REGIONAL PRICES FOR YOUR APP OR SAAS PRODUCT', margin, margin + 11)

  // Red Accent Line
  doc.setDrawColor(239, 68, 68) // Red #EF4444
  doc.setLineWidth(1)
  doc.line(margin, margin + 14, margin + 25, margin + 14)

  // Black Divider Line
  doc.setDrawColor(10, 10, 10) // Black #0A0A0A
  doc.setLineWidth(0.5)
  doc.line(margin, margin + 16, pageWidth - margin, margin + 16)

  // Report Metadata Grid
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(10, 10, 10)
  
  // Left Column
  doc.text('REPORT DETAILS', margin, margin + 24)
  doc.setFont('Helvetica', 'normal')
  doc.text(`Product Name: ${settings.productName}`, margin, margin + 29)
  doc.text(`Base Price: ${settings.basePrice.toFixed(2)} ${settings.baseCurrency}`, margin, margin + 34)
  doc.text(`Billing Period: ${settings.billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'}`, margin, margin + 39)

  // Middle Column
  doc.setFont('Helvetica', 'bold')
  doc.text('PRICING STRATEGY', margin + 80, margin + 24)
  doc.setFont('Helvetica', 'normal')
  doc.text(`Style: ${settings.strategy.toUpperCase()}`, margin + 80, margin + 29)
  doc.text(`Adjustment Strength: ${(settings.adjustmentStrength * 100).toFixed(0)}%`, margin + 80, margin + 34)
  doc.text(`Rounding: ${settings.enablePsychologicalPricing ? 'Enabled' : 'Disabled'}`, margin + 80, margin + 39)

  // Right Column
  doc.setFont('Helvetica', 'bold')
  doc.text('DISPLAY MODE & BOUNDS', margin + 160, margin + 24)
  doc.setFont('Helvetica', 'normal')
  doc.text(`Display Mode: ${settings.displayMode.toUpperCase()}`, margin + 160, margin + 29)
  doc.text(`Display Currency: ${displayCurrencyCode}`, margin + 160, margin + 34)
  doc.text(`Bounds: Floor ${(settings.priceFloor * 100).toFixed(0)}% / Ceiling ${(settings.priceCeiling * 100).toFixed(0)}%`, margin + 160, margin + 39)

  // Formula Summary
  doc.setFontSize(8)
  doc.setTextColor(163, 163, 163) // Neutral-400
  doc.text(
    'Blended Formula: rawLocalPrice = Base USD * FX^(1-S) * PPP^S  [Where S = adjustment strength, clamped to floor/ceiling]',
    margin,
    margin + 45
  )

  // 2. Generate the country pricing table columns depending on displayMode
  let columns: string[] = []
  let tableBody: string[][] = []
  let columnStylesMap: { [key: number]: { cellWidth: number } } = {}

  if (settings.displayMode === 'one-currency') {
    // One Currency Mode PDF Columns
    columns = [
      'Country',
      `Suggested Price (${displayCurrencyCode})`,
      'Change from Base',
      settings.showLocalPrice ? 'Local Price Checkout' : '',
      'Data Quality',
    ].filter(col => col !== '')

    tableBody = results.map(r => {
      const diffVal = r.difference
      const percentDiff = r.discountPercent * -1
      
      const changeString = Math.abs(diffVal) < 0.001 
        ? 'Same as base' 
        : `${Math.abs(percentDiff).toFixed(0)}% ${diffVal < 0 ? 'lower' : 'higher'}`

      const rowData = [
        r.country.name + (r.isOverride ? ' *' : ''),
        r.recommendedPriceFormatted,
        changeString,
      ]

      if (settings.showLocalPrice) {
        rowData.push(r.recommendedLocalPriceFormatted)
      }

      rowData.push(r.country.quality + (r.isOverride ? ' (Override)' : ''))
      return rowData
    })

    if (settings.showLocalPrice) {
      columnStylesMap = {
        0: { cellWidth: 60 }, // Country
        1: { cellWidth: 50 }, // Suggested price
        2: { cellWidth: 50 }, // Change from base
        3: { cellWidth: 50 }, // Local checkout price
        4: { cellWidth: 55 }, // Quality
      }
    } else {
      columnStylesMap = {
        0: { cellWidth: 70 }, // Country
        1: { cellWidth: 65 }, // Suggested price
        2: { cellWidth: 65 }, // Change from base
        3: { cellWidth: 65 }, // Quality
      }
    }
  } else {
    // Local Currencies Mode PDF Columns
    columns = [
      'Country',
      'Currency',
      'Direct conversion',
      'Suggested local price',
      'Difference',
      'Data Quality',
    ]

    tableBody = results.map(r => {
      const diffVal = r.difference
      const percentDiff = r.discountPercent * -1
      const prefix = diffVal > 0 ? '+' : ''

      // Calculate local diff formatted string
      let diffStr = '—'
      if (Math.abs(diffVal) > 0.001) {
        diffStr = `${prefix}${percentDiff.toFixed(0)}%`
      }

      return [
        r.country.name + (r.isOverride ? ' *' : ''),
        `${r.country.currencyCode} (${r.country.currencySymbol})`,
        new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: r.country.currencyCode,
          minimumFractionDigits: r.country.currencyDecimals,
          maximumFractionDigits: r.country.currencyDecimals,
        }).format(r.fxConvertedPrice),
        r.recommendedPriceFormatted,
        diffStr,
        r.country.quality + (r.isOverride ? ' (Override)' : ''),
      ]
    })

    columnStylesMap = {
      0: { cellWidth: 60 }, // Country
      1: { cellWidth: 35 }, // Currency
      2: { cellWidth: 40 }, // Direct conversion
      3: { cellWidth: 40 }, // Suggested local price
      4: { cellWidth: 40 }, // Difference
      5: { cellWidth: 50 }, // Quality
    }
  }

  autoTable(doc, {
    head: [columns],
    body: tableBody,
    startY: margin + 49,
    theme: 'striped',
    headStyles: {
      fillColor: [10, 10, 10], // Black #0A0A0A
      textColor: 250, // Off-white #FAFAFA
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [10, 10, 10], // Black text
    },
    columnStyles: columnStylesMap,
    margin: { left: margin, right: margin },
    didDrawPage: () => {
      // Footer text and page numbers
      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(163, 163, 163) // Neutral-400

      // Page numbers
      const str = `Page ${doc.internal.pages.length - 1} of ${totalPagesExp}`
      doc.text(str, pageWidth - margin - 20, pageHeight - 10)

      // Disclaimer & Credits
      const disclaimer = 'Disclaimer: OpenPrice Atlas is an independent open-source project. Not affiliated with Netflix. All prices are estimates.'
      doc.text(disclaimer, margin, pageHeight - 12)
      doc.text('GitHub: https://github.com/moinchanna/openprice-atlas', margin, pageHeight - 8)
    },
  })

  // Replace total page count token
  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages(totalPagesExp)
  }

  // Save the PDF
  const sanitizedName = settings.productName.toLowerCase().replace(/[^a-z0-9]+/g, '_')
  doc.save(`${sanitizedName}_regional_pricing_report.pdf`)
}
