import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { CalculationResult, FormSettings } from '../types/pricing'

/**
 * Generates and downloads a polished PDF report of the regional prices.
 */
export function downloadPDF(results: CalculationResult[], settings: FormSettings): void {
  // Use landscape orientation for spacious columns
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  const genDate = new Date().toISOString().split('T')[0]

  // Page tracking for footer
  const totalPagesExp = '{total_pages_count_string}'

  // 1. Cover / Header Information
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(79, 70, 229) // Indigo-600
  doc.text('OpenPrice Atlas', margin, margin + 5)

  doc.setFontSize(10)
  doc.setFont('Helvetica', 'normal')
  doc.setTextColor(100, 116, 139) // Slate-500
  doc.text('Set smarter regional prices based on purchasing power parity', margin, margin + 10)

  // Divider Line
  doc.setDrawColor(226, 232, 240) // Slate-200
  doc.setLineWidth(0.5)
  doc.line(margin, margin + 14, pageWidth - margin, margin + 14)

  // Report Metadata Grid
  doc.setFont('Helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105) // Slate-600
  
  // Left Column
  doc.text('REPORT DETAILS', margin, margin + 22)
  doc.setFont('Helvetica', 'normal')
  doc.text(`Product Name: ${settings.productName}`, margin, margin + 27)
  doc.text(`Base Price: $${settings.basePrice.toFixed(2)} USD`, margin, margin + 32)
  doc.text(`Billing Period: ${settings.billingPeriod === 'monthly' ? 'Monthly' : 'Yearly'}`, margin, margin + 37)

  // Middle Column
  doc.setFont('Helvetica', 'bold')
  doc.text('PRICING STRATEGY', margin + 80, margin + 22)
  doc.setFont('Helvetica', 'normal')
  doc.text(`Strategy Preset: ${settings.strategy.charAt(0).toUpperCase() + settings.strategy.slice(1)}`, margin + 80, margin + 27)
  doc.text(`Adjustment Strength: ${(settings.adjustmentStrength * 100).toFixed(0)}%`, margin + 80, margin + 32)
  doc.text(`Rounding: ${settings.enablePsychologicalPricing ? 'Enabled' : 'Disabled'}`, margin + 80, margin + 37)

  // Right Column
  doc.setFont('Helvetica', 'bold')
  doc.text('BOUNDS & DATE', margin + 160, margin + 22)
  doc.setFont('Helvetica', 'normal')
  doc.text(`Price Floor: ${(settings.priceFloor * 100).toFixed(0)}%`, margin + 160, margin + 27)
  doc.text(`Price Ceiling: ${(settings.priceCeiling * 100).toFixed(0)}%`, margin + 160, margin + 32)
  doc.text(`Generated On: ${genDate}`, margin + 160, margin + 37)

  // Formula Summary
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text(
    'Blended Formula: rawLocalPrice = Base USD * FX^(1-S) * PPP^S  [Where S = adjustment strength, clamped to floor/ceiling]',
    margin,
    margin + 44
  )

  // 2. Generate the country pricing table
  const columns = [
    'Country',
    'Currency',
    'FX Price',
    'Recommended Price',
    'Difference',
    'Data Year',
    'Data Quality',
  ]

  const tableBody = results.map(r => {
    const finalPrice = r.isOverride && r.overrideValue !== null ? r.overrideValue : r.recommendedPrice
    const diffVal = finalPrice - r.fxConvertedPrice
    const diffPercent = r.fxConvertedPrice > 0 ? (diffVal / r.fxConvertedPrice) * 100 : 0
    const prefix = diffVal > 0 ? '+' : ''

    const formattedFX = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: r.country.currencyCode,
      minimumFractionDigits: r.country.currencyDecimals,
      maximumFractionDigits: r.country.currencyDecimals,
    }).format(r.fxConvertedPrice)

    const formattedRec = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: r.country.currencyCode,
      minimumFractionDigits: r.country.currencyDecimals,
      maximumFractionDigits: r.country.currencyDecimals,
    }).format(finalPrice)

    const formattedDiff = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: r.country.currencyCode,
      minimumFractionDigits: r.country.currencyDecimals,
      maximumFractionDigits: r.country.currencyDecimals,
    }).format(diffVal)

    // Append percentage
    const diffString = `${prefix}${formattedDiff} (${prefix}${diffPercent.toFixed(0)}%)`

    return [
      r.country.name + (r.isOverride ? ' *' : ''),
      `${r.country.currencyCode} (${r.country.currencySymbol})`,
      formattedFX,
      formattedRec,
      diffString,
      r.country.pppYear || r.country.fxYear || 'N/A',
      r.country.quality + (r.isOverride ? ' (Override)' : ''),
    ]
  })

  autoTable(doc, {
    head: [columns],
    body: tableBody,
    startY: margin + 48,
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo-600
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85], // Slate-700
    },
    columnStyles: {
      0: { cellWidth: 50 }, // Country
      1: { cellWidth: 30 }, // Currency
      2: { cellWidth: 35 }, // FX
      3: { cellWidth: 35 }, // Recommended
      4: { cellWidth: 45 }, // Difference
      5: { cellWidth: 20 }, // Year
      6: { cellWidth: 45 }, // Quality
    },
    margin: { left: margin, right: margin },
    didDrawPage: () => {
      // Footer text and page numbers
      doc.setFont('Helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(148, 163, 184) // Slate-400

      // Page numbers
      const str = `Page ${doc.internal.pages.length - 1} of ${totalPagesExp}`
      doc.text(str, pageWidth - margin - 20, pageHeight - 10)

      // Disclaimer & Credits
      const disclaimer = 'Disclaimer: OpenPrice Atlas is an independent open-source project. Not affiliated with Netflix. All prices are estimates.'
      doc.text(disclaimer, margin, pageHeight - 12)
      doc.text('GitHub: https://github.com/YOUR_GITHUB_USERNAME/openprice-atlas', margin, pageHeight - 8)
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
