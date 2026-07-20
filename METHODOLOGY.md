# OpenPrice Atlas - Methodology Documentation

This document explains the economic logic, mathematical formula, smart-rounding mechanisms, fallback hierarchies, and limitations of the **OpenPrice Atlas** regional pricing calculator.

---

## 1. Core Economic Concept

Regional pricing adjusts subscription or digital product prices to match local purchasing power. Simply converting a United States Dollar (USD) base price to a local currency via market exchange rates (FX) does not account for differences in local incomes, cost of living, or purchasing power.

For example, a subscription of **$9.99 USD** converted directly to Indian Rupees (INR) at an exchange rate of `83.5` equals `₹835`. However, in terms of purchasing power parity (PPP), `₹835` represents a much higher real-money burden to an Indian consumer than `$9.99` does to an American consumer.

OpenPrice Atlas calculates regional pricing recommendations by blending market exchange rates with Purchasing Power Parity values.

---

## 2. Mathematical Blending Formula

To balance local affordability with the risk of currency arbitrage (where users buy from cheaper regions via VPNs), we blend official exchange rates and PPP conversion factors.

Let:
*   $B$ = Base Price in USD
*   $FX$ = Official Exchange Rate (local currency units per US Dollar)
*   $PPP$ = Purchasing Power Parity Conversion Factor (local currency units per international dollar)
*   $S$ = Regional Adjustment Strength (value between 0 and 1, representing 0% to 100%)

The regional price calculation is defined by the following blended formula:

$$\text{rawLocalPrice} = B \times FX \times \left(\frac{PPP}{FX}\right)^S$$

Which is mathematically equivalent to:

$$\text{rawLocalPrice} = B \times FX^{(1 - S)} \times PPP^S$$

### Behavior of Adjustment Strength ($S$):
*   **$S = 0.0$ (0%)**: The formula collapses to a pure exchange rate conversion ($B \times FX$).
*   **$S = 1.0$ (100%)**: The formula uses pure Purchasing Power Parity pricing ($B \times PPP$).
*   **$0.0 < S < 1.0$**: Blends both metrics. A higher strength closer to `1.0` favors local affordability, while a lower strength closer to `0.0` protects dollar-equivalent revenue.

### Presets:
1.  **Revenue Focused ($S = 0.40$)**: Closer to FX conversion; recommended for markets with high arbitrage risks.
2.  **Balanced ($S = 0.70$)** (Default): A reasonable middle ground that grants meaningful discounts while mitigating VPN abuse.
3.  **Accessibility Focused ($S = 0.90$)**: Close to pure purchasing power, heavily prioritizing local market penetration.

---

## 3. Advanced Clamping Bounds

To protect business operations, we apply configurable minimum and maximum price clamps:

$$\text{minimumPrice} = \text{fxConvertedPrice} \times \text{priceFloor}$$
$$\text{maximumPrice} = \text{fxConvertedPrice} \times \text{priceCeiling}$$

Where:
*   **Price Floor** (Default: 20%): Prevents recommendations from falling below 20% of the raw FX-converted price, protecting against extreme devaluation.
*   **Price Ceiling** (Default: 120%): Prevents recommendations from exceeding 120% of the raw FX-converted price, protecting users in high-cost-of-living regions (like Switzerland) from excessive premiums.

---

## 4. Psychological Rounding Rules

Calculated prices are formatted using currency-aware smart rounding to suggest appealing price points (e.g. ending in `.99` or `.49` for USD/EUR, or `90`/`900` for JPY/KRW) while ensuring the adjustment does not distort the price by more than 8%.

### Precision Mapping:
*   **Zero-decimal currencies** (e.g., JPY, KRW, CLP): Decimals are omitted. Rounded to end in `9`, `90`, `99`, or `900` depending on the scale.
*   **Two-decimal currencies** (e.g., USD, EUR, GBP, INR, PKR): Rounded to end in `.99`, `.49`, `.95`, or `.90`.
*   **Three-decimal currencies** (e.g., BHD, KWD, OMR): Calculated via a 10x multiplier, rounded using two-decimal rules, and scaled back.

---

## 5. World Bank Data Sources & Fallback Hierarchy

The calculator utilizes economic datasets from the **World Bank Indicators API**:
1.  **Private consumption PPP conversion factor** (`PA.NUS.PRVT.PP`): Local currency units per international dollar. This measures household final consumption expenditure, making it the most accurate indicator of consumer purchasing power.
2.  **Official exchange rate** (`PA.NUS.FCRF`): Local currency units per US dollar.
3.  **GDP PPP conversion factor** (`PA.NUS.PPP`): Secondary fallback when private consumption PPP is missing.

### Fallback Priority Order:
If primary indicators are missing for a country, the calculator cascades down this fallback chain to maintain usability:
1.  **Direct Household PPP**: Primary calculation (Household PPP + Official Exchange Rate).
2.  **GDP PPP Fallback**: Uses GDP PPP + Official Exchange Rate.
3.  **Income-Group Estimate**: Calculates the median PPP-to-FX ratio of all countries in the same World Bank income group (e.g. Upper Middle Income) and applies it to the target country's exchange rate.
4.  **Regional Estimate**: Applies the median PPP-to-FX ratio of all countries in the same geographic region.
5.  **FX-only Fallback**: Performs standard exchange rate conversion (S is treated as 0).

---

## 6. Known Limitations

*   **Lagging Datasets**: World Bank statistics are published with a lag of 1–2 years. While exchange rates fluctuate daily, the PPP index is updated annually.
*   **Arbitrage Risk**: Blended pricing is an analytical estimate. SaaS products with high marginal costs must implement billing checks (e.g. local credit card checks) to prevent VPN purchase abuse.
*   **Other Factors**: Purchasing power does not measure localized competition, payment infrastructure fees, local tax regulations, or consumer product-market fit.
