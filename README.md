# OpenPrice Atlas

[![GitHub License](https://img.shields.io/github/license/moinchanna/openprice-atlas)](https://github.com/moinchanna/openprice-atlas/blob/main/LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/moinchanna/openprice-atlas/deploy.yml?branch=main)](https://github.com/moinchanna/openprice-atlas/actions/workflows/deploy.yml)

> **Estimate fair regional prices for your app or SaaS product.**

OpenPrice Atlas is a production-quality, open-source static regional pricing calculator. It helps SaaS founders, mobile developers, and indie hackers estimate purchasing-power-parity (PPP) adjusted prices for global markets.

**Live Website Demo:** [https://moinchanna.github.io/openprice-atlas/](https://moinchanna.github.io/openprice-atlas/)

---

## Project Overview

OpenPrice Atlas is a pricing recommendation tool, not a simple currency converter. It calculates suggested local prices for every supported country using purchasing-power and exchange-rate data from the World Bank.

### Key Features
*   **Blended Pricing Formula**: Blends official exchange rates with purchasing power parity (PPP) using an adjustable strength slider.
*   **Strategy Presets**: Select from *Revenue Focused* (40% adjustment), *Balanced* (70% adjustment), or *Accessibility Focused* (90% adjustment) presets.
*   **Psychological Pricing**: Smart currency-aware rounding (e.g. `$9.99`, `₹179`, `¥890`) while protecting price accuracy within an 8% variance window.
*   **Advanced Bounds**: Configurable price floors and ceilings to prevent VPN shopping abuse or excessive premiums.
*   **Manual Overrides**: Edit calculated recommendations directly in the table. Active overrides are labeled and included in exports.
*   **No Backend / No Tracking**: Runs entirely in the browser with 100% data privacy. Saves configurations inside the browser's `localStorage`.
*   **Exporters**: Real browser-based CSV and landscape PDF exports of calculated global lists.
*   **Data Transparency**: Clear economic indicator listings, data years, and fallback labels showing how every price was estimated.

---

## The Formula

The calculator uses a blended regional pricing model:

$$\text{rawLocalPrice} = B \times FX^{(1 - S)} \times PPP^S$$

Where:
*   $B$ = Base USD Price
*   $FX$ = Market Exchange Rate (units per USD)
*   $PPP$ = Purchasing Power Parity factor (units per International USD)
*   $S$ = Adjustment Strength ($0.0 \le S \le 1.0$)

For a complete explanation, see our [Methodology Documentation](file:///Users/moeenchanna/Developer/Web/OpenPrice%20Atlas/METHODOLOGY.md).

---

## Project Structure

```text
openprice-atlas/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD Deployment Workflow
├── public/                     # Static SEO and PWA assets
│   ├── favicon.svg             # local SVG Favicon
│   ├── robots.txt
│   ├── sitemap.xml
│   └── manifest.json           # Web app manifest
├── scripts/
│   └── update-country-data.mjs # World Bank data generation script
├── src/
│   ├── components/             # React UI components
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── CalculatorForm.tsx
│   │   ├── SummaryCards.tsx
│   │   ├── ResultsTable.tsx
│   │   ├── Methodology.tsx
│   │   └── Footer.tsx
│   ├── data/
│   │   └── countries.generated.json # Pre-generated World Bank dataset
│   ├── lib/                    # Core mathematical and exporter libraries
│   │   ├── pricing.ts
│   │   ├── rounding.ts
│   │   ├── csv.ts
│   │   └── pdf.ts
│   ├── types/
│   │   └── pricing.ts
│   ├── App.tsx                 # Main layout and state container
│   ├── index.css               # CSS & Tailwind configuration
│   └── main.tsx
├── METHODOLOGY.md              # Pricing calculations and fallbacks detail
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## Development and Build Commands

### 1. Install Dependencies
Initialize the project dependencies:
```bash
npm install
```

### 2. Run Local Development Server
Launch the hot-reloading development server locally:
```bash
npm run dev
```

### 3. Update Country Economic Data
Re-fetch the latest indicators (PPP and FX) from the World Bank API and regenerate the static JSON file:
```bash
npm run update-data
```

### 4. Run Unit Tests
Execute the calculation, rounding, and CSV escaping test suite:
```bash
npm run test
```

### 5. Check Code Styles (Linting)
Run style checking and verify code formatting standards:
```bash
npm run lint
```

### 6. TypeScript Checks
Compile TypeScript code without writing outputs to verify compiler rules:
```bash
npm run typecheck
```

### 7. Compile for Production
Build the optimized static bundle in the `dist` directory:
```bash
npm run build
```

---

## Data Sources & Fallbacks

Economic indicators are loaded from the **World Bank Indicators API**:
*   Private consumption PPP conversion factor: `PA.NUS.PRVT.PP`
*   Official exchange rate: `PA.NUS.FCRF`
*   GDP PPP conversion factor: `PA.NUS.PPP`

If a country lacks primary consumption PPP statistics, the tool utilizes a strict fallback chain (GDP fallback, Income median group calculations, Regional group calculations, or raw FX rates) to estimate prices without fabricating information. Every fallback type is labeled.

---

## GitHub Actions & Pages Deployment

Deployment is fully automated using GitHub Actions. Upon pushing code to the `main` branch, the workflow:
1.  Installs project packages using `npm ci`.
2.  Typechecks the TypeScript source.
3.  Lints code rules.
4.  Runs all unit tests.
5.  Compiles the production static bundle.
6.  Deploys the static assets to **GitHub Pages** under the `/openprice-atlas/` subpath.

For manual steps to configure Pages in your repository settings, see [CONTRIBUTING.md](file:///Users/moeenchanna/Developer/Web/OpenPrice%20Atlas/CONTRIBUTING.md).

---

## Independent Project Disclaimer

“OpenPrice Atlas is an independent open-source project. It is not affiliated with Netflix or any other subscription platform. All prices are estimates based on public economic data and configurable pricing assumptions.”

Economic indicators cannot measure customer demand, local competition, taxes, payment fees, regulations, or product-market fit. Treat these results as a starting point for pricing research, not financial advice.

---

## License

This project is licensed under the terms of the [MIT License](file:///Users/moeenchanna/Developer/Web/OpenPrice%20Atlas/LICENSE).
