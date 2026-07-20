import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Static mapping of ISO3 country code to currency details
// Supports over 200 countries to ensure we meet the "at least 190 entries" target.
const COUNTRY_CURRENCY_MAP = {
  AFG: { code: 'AFN', name: 'Afghan Afghani', symbol: '؋', decimals: 2 },
  ALB: { code: 'ALL', name: 'Albanian Lek', symbol: 'L', decimals: 2 },
  DZA: { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', decimals: 2 },
  ASM: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  AND: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  AGO: { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', decimals: 2 },
  ATG: { code: 'XCD', name: 'East Caribbean Dollar', symbol: '$', decimals: 2 },
  ARG: { code: 'ARS', name: 'Argentine Peso', symbol: '$', decimals: 2 },
  ARM: { code: 'AMD', name: 'Armenian Dram', symbol: '֏', decimals: 2 },
  ABW: { code: 'AWG', name: 'Aruban Florin', symbol: 'ƒ', decimals: 2 },
  AUS: { code: 'AUD', name: 'Australian Dollar', symbol: '$', decimals: 2 },
  AUT: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  AZE: { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', decimals: 2 },
  BHS: { code: 'BSD', name: 'Bahamian Dollar', symbol: '$', decimals: 2 },
  BHR: { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', decimals: 3 },
  BGD: { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', decimals: 2 },
  BRB: { code: 'BBD', name: 'Barbadian Dollar', symbol: '$', decimals: 2 },
  BLR: { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br', decimals: 2 },
  BEL: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  BLZ: { code: 'BZD', name: 'Belize Dollar', symbol: '$', decimals: 2 },
  BEN: { code: 'XOF', name: 'West African CFA Franc', symbol: 'Fr', decimals: 0 },
  BMU: { code: 'BMD', name: 'Bermudian Dollar', symbol: '$', decimals: 2 },
  BTN: { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu.', decimals: 2 },
  BOL: { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.', decimals: 2 },
  BIH: { code: 'BAM', name: 'Bosnia-Herzegovina Mark', symbol: 'KM', decimals: 2 },
  BWA: { code: 'BWP', name: 'Botswana Pula', symbol: 'P', decimals: 2 },
  BRA: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2 },
  BRN: { code: 'BND', name: 'Brunei Dollar', symbol: '$', decimals: 2 },
  BGR: { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', decimals: 2 },
  BFA: { code: 'XOF', name: 'West African CFA Franc', symbol: 'Fr', decimals: 0 },
  BDI: { code: 'BIF', name: 'Burundian Franc', symbol: 'Fr', decimals: 0 },
  CPV: { code: 'CVE', name: 'Cape Verdean Escudo', symbol: 'Esc', decimals: 2 },
  KHM: { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', decimals: 2 },
  CMR: { code: 'XAF', name: 'Central African CFA Franc', symbol: 'Fr', decimals: 0 },
  CAN: { code: 'CAD', name: 'Canadian Dollar', symbol: '$', decimals: 2 },
  CYM: { code: 'KYD', name: 'Cayman Islands Dollar', symbol: '$', decimals: 2 },
  CAF: { code: 'XAF', name: 'Central African CFA Franc', symbol: 'Fr', decimals: 0 },
  TCD: { code: 'XAF', name: 'Central African CFA Franc', symbol: 'Fr', decimals: 0 },
  CHL: { code: 'CLP', name: 'Chilean Peso', symbol: '$', decimals: 0 },
  CHN: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2 },
  COL: { code: 'COP', name: 'Colombian Peso', symbol: '$', decimals: 2 },
  COM: { code: 'KMF', name: 'Comorian Franc', symbol: 'Fr', decimals: 0 },
  COG: { code: 'XAF', name: 'Central African CFA Franc', symbol: 'Fr', decimals: 0 },
  COD: { code: 'CDF', name: 'Congolese Franc', symbol: 'Fr', decimals: 2 },
  CRI: { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡', decimals: 2 },
  CIV: { code: 'XOF', name: 'West African CFA Franc', symbol: 'Fr', decimals: 0 },
  HRV: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  CUB: { code: 'CUP', name: 'Cuban Peso', symbol: '$', decimals: 2 },
  CUW: { code: 'ANG', name: 'Antillean Guilder', symbol: 'ƒ', decimals: 2 },
  CYP: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  CZE: { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', decimals: 2 },
  DNK: { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimals: 2 },
  DJI: { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fr', decimals: 0 },
  DMA: { code: 'XCD', name: 'East Caribbean Dollar', symbol: '$', decimals: 2 },
  DOM: { code: 'DOP', name: 'Dominican Peso', symbol: '$', decimals: 2 },
  ECU: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  EGY: { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', decimals: 2 },
  SLV: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  GNQ: { code: 'XAF', name: 'Central African CFA Franc', symbol: 'Fr', decimals: 0 },
  ERI: { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nkf', decimals: 2 },
  EST: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  SWZ: { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'L', decimals: 2 },
  ETH: { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', decimals: 2 },
  FRO: { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimals: 2 },
  FJI: { code: 'FJD', name: 'Fijian Dollar', symbol: '$', decimals: 2 },
  FIN: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  FRA: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  PYF: { code: 'XPF', name: 'CFP Franc', symbol: 'Fr', decimals: 0 },
  GAB: { code: 'XAF', name: 'Central African CFA Franc', symbol: 'Fr', decimals: 0 },
  GMB: { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D', decimals: 2 },
  GEO: { code: 'GEL', name: 'Georgian Lari', symbol: '₾', decimals: 2 },
  DEU: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  GHA: { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', decimals: 2 },
  GIB: { code: 'GIP', name: 'Gibraltar Pound', symbol: '£', decimals: 2 },
  GRC: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  GRL: { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimals: 2 },
  GRD: { code: 'XCD', name: 'East Caribbean Dollar', symbol: '$', decimals: 2 },
  GUM: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  GTM: { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', decimals: 2 },
  GIN: { code: 'GNF', name: 'Guinean Franc', symbol: 'Fr', decimals: 0 },
  GNB: { code: 'XOF', name: 'West African CFA Franc', symbol: 'Fr', decimals: 0 },
  GUY: { code: 'GYD', name: 'Guyanese Dollar', symbol: '$', decimals: 2 },
  HTI: { code: 'HTG', name: 'Haitian Gourde', symbol: 'G', decimals: 2 },
  HND: { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', decimals: 2 },
  HKG: { code: 'HKD', name: 'Hong Kong Dollar', symbol: '$', decimals: 2 },
  HUN: { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', decimals: 2 },
  ISL: { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr', decimals: 0 },
  IND: { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2 },
  IDN: { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimals: 2 },
  IRN: { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', decimals: 2 },
  IRQ: { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ع.د', decimals: 3 },
  IRL: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  IMN: { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 },
  ISR: { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪', decimals: 2 },
  ITA: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  JAM: { code: 'JMD', name: 'Jamaican Dollar', symbol: '$', decimals: 2 },
  JPN: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0 },
  JOR: { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', decimals: 3 },
  KAZ: { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', decimals: 2 },
  KEN: { code: 'KES', name: 'Kenyan Shilling', symbol: 'Sh', decimals: 2 },
  KIR: { code: 'AUD', name: 'Australian Dollar', symbol: '$', decimals: 2 },
  PRK: { code: 'KPW', name: 'North Korean Won', symbol: '₩', decimals: 2 },
  KOR: { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimals: 0 },
  KWT: { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', decimals: 3 },
  KGZ: { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'с', decimals: 2 },
  LAO: { code: 'LAK', name: 'Lao Kip', symbol: '₭', decimals: 2 },
  LVA: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  LBN: { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', decimals: 2 },
  LSO: { code: 'LSL', name: 'Lesotho Loti', symbol: 'L', decimals: 2 },
  LBR: { code: 'LRD', name: 'Liberian Dollar', symbol: '$', decimals: 2 },
  LBY: { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د', decimals: 3 },
  LIE: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2 },
  LTU: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  LUX: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  MAC: { code: 'MOP', name: 'Macanese Pataca', symbol: 'P', decimals: 2 },
  MDG: { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', decimals: 2 },
  MWI: { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', decimals: 2 },
  MYS: { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', decimals: 2 },
  MDV: { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: '.ރ', decimals: 2 },
  MLI: { code: 'XOF', name: 'West African CFA Franc', symbol: 'Fr', decimals: 0 },
  MLT: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  MHL: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  MRT: { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'UM', decimals: 2 },
  MUS: { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', decimals: 2 },
  MEX: { code: 'MXN', name: 'Mexican Peso', symbol: '$', decimals: 2 },
  FSM: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  MDA: { code: 'MDL', name: 'Moldovan Leu', symbol: 'L', decimals: 2 },
  MCO: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  MNG: { code: 'MNT', name: 'Mongolian Tögrög', symbol: '₮', decimals: 2 },
  MNE: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  MAR: { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', decimals: 2 },
  MOZ: { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', decimals: 2 },
  MMR: { code: 'MMK', name: 'Myanmar Kyat', symbol: 'Ks', decimals: 2 },
  NAM: { code: 'NAD', name: 'Namibian Dollar', symbol: '$', decimals: 2 },
  NRU: { code: 'AUD', name: 'Australian Dollar', symbol: '$', decimals: 2 },
  NPL: { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨', decimals: 2 },
  NLD: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  NCL: { code: 'XPF', name: 'CFP Franc', symbol: 'Fr', decimals: 0 },
  NZL: { code: 'NZD', name: 'New Zealand Dollar', symbol: '$', decimals: 2 },
  NIC: { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$', decimals: 2 },
  NER: { code: 'XOF', name: 'West African CFA Franc', symbol: 'Fr', decimals: 0 },
  NGA: { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', decimals: 2 },
  MKD: { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден', decimals: 2 },
  MNP: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  NOR: { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimals: 2 },
  OMN: { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', decimals: 3 },
  PAK: { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', decimals: 2 },
  PLW: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  PAN: { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.', decimals: 2 },
  PNG: { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K', decimals: 2 },
  PRY: { code: 'PYG', name: 'Paraguayan Guaraní', symbol: '₲', decimals: 0 },
  PER: { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/.', decimals: 2 },
  PHL: { code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimals: 2 },
  POL: { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', decimals: 2 },
  PRT: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  PRI: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  QAT: { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', decimals: 2 },
  ROU: { code: 'RON', name: 'Romanian Leu', symbol: 'lei', decimals: 2 },
  RUS: { code: 'RUB', name: 'Russian Ruble', symbol: '₽', decimals: 2 },
  RWA: { code: 'RWF', name: 'Rwandan Franc', symbol: 'Fr', decimals: 0 },
  WSM: { code: 'WST', name: 'Samoan Tālā', symbol: 'T', decimals: 2 },
  SMR: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  STP: { code: 'STN', name: 'São Tomé Dobra', symbol: 'Db', decimals: 2 },
  SAU: { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', decimals: 2 },
  SEN: { code: 'XOF', name: 'West African CFA Franc', symbol: 'Fr', decimals: 0 },
  SRB: { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин.', decimals: 2 },
  SYC: { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨', decimals: 2 },
  SLE: { code: 'SLE', name: 'Sierra Leonean Leone', symbol: 'Le', decimals: 2 },
  SGP: { code: 'SGD', name: 'Singapore Dollar', symbol: '$', decimals: 2 },
  SXM: { code: 'ANG', name: 'Antillean Guilder', symbol: 'ƒ', decimals: 2 },
  SVK: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  SVN: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  SLB: { code: 'SBD', name: 'Solomon Islands Dollar', symbol: '$', decimals: 2 },
  SOM: { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh', decimals: 2 },
  ZAF: { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimals: 2 },
  SSD: { code: 'SSP', name: 'South Sudanese Pound', symbol: '£', decimals: 2 },
  ESP: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  LKA: { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', decimals: 2 },
  KNA: { code: 'XCD', name: 'East Caribbean Dollar', symbol: '$', decimals: 2 },
  LCA: { code: 'XCD', name: 'East Caribbean Dollar', symbol: '$', decimals: 2 },
  VCT: { code: 'XCD', name: 'East Caribbean Dollar', symbol: '$', decimals: 2 },
  SDN: { code: 'SDG', name: 'Sudanese Pound', symbol: 'ج.س.', decimals: 2 },
  SUR: { code: 'SRD', name: 'Surinamese Dollar', symbol: '$', decimals: 2 },
  SWE: { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimals: 2 },
  CHE: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2 },
  SYR: { code: 'SYP', name: 'Syrian Pound', symbol: '£', decimals: 2 },
  TWN: { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$', decimals: 2 },
  TJK: { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'ЅМ', decimals: 2 },
  TZA: { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'Sh', decimals: 2 },
  THA: { code: 'THB', name: 'Thai Baht', symbol: '฿', decimals: 2 },
  TLS: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  TGO: { code: 'XOF', name: 'West African CFA Franc', symbol: 'Fr', decimals: 0 },
  TON: { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$', decimals: 2 },
  TTO: { code: 'TTD', name: 'Trinidad & Tobago Dollar', symbol: '$', decimals: 2 },
  TUN: { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', decimals: 3 },
  TUR: { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimals: 2 },
  TKM: { code: 'TMT', name: 'Turkmenistan Manat', symbol: 'm', decimals: 2 },
  TUV: { code: 'AUD', name: 'Australian Dollar', symbol: '$', decimals: 2 },
  UGA: { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', decimals: 0 },
  UKR: { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', decimals: 2 },
  ARE: { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimals: 2 },
  GBR: { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 },
  USA: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  URY: { code: 'UYU', name: 'Uruguayan Peso', symbol: '$', decimals: 2 },
  UZB: { code: 'UZS', name: 'Uzbekistani Som', symbol: "so'm", decimals: 2 },
  VUT: { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'Vt', decimals: 0 },
  VEN: { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.S', decimals: 2 },
  VNM: { code: 'VND', name: 'Vietnamese Đồng', symbol: '₫', decimals: 0 },
  VIR: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  PSE: { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪', decimals: 2 },
  YEM: { code: 'YER', name: 'Yemeni Rial', symbol: '﷼', decimals: 2 },
  ZMB: { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', decimals: 2 },
  ZWE: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 }
}

const INDICATORS = {
  householdPpp: 'PA.NUS.PRVT.PP',
  gdpPpp: 'PA.NUS.PPP',
  exchangeRate: 'PA.NUS.FCRF'
}

// Helpers to get median values
function getMedian(values) {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

async function fetchWorldBankData(endpoint) {
  console.log(`Fetching: ${endpoint}`)
  try {
    const res = await fetch(endpoint)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data[1] || []
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error)
    return []
  }
}

async function main() {
  console.log('Starting World Bank country data update script...')

  // 1. Fetch country metadata (regions, income levels, names)
  const countriesMetadataRaw = await fetchWorldBankData(
    'https://api.worldbank.org/v2/country?format=json&per_page=300'
  )
  
  // 2. Fetch Indicator data
  const householdPppRaw = await fetchWorldBankData(
    `https://api.worldbank.org/v2/country/all/indicator/${INDICATORS.householdPpp}?format=json&per_page=20000`
  )
  const gdpPppRaw = await fetchWorldBankData(
    `https://api.worldbank.org/v2/country/all/indicator/${INDICATORS.gdpPpp}?format=json&per_page=20000`
  )
  const exchangeRateRaw = await fetchWorldBankData(
    `https://api.worldbank.org/v2/country/all/indicator/${INDICATORS.exchangeRate}?format=json&per_page=20000`
  )

  console.log(`Fetched metadata for ${countriesMetadataRaw.length} records.`)

  // Helper to extract the latest non-null value for each country code
  function parseIndicator(rawRecords) {
    const map = {}
    for (const record of rawRecords) {
      if (!record.country) continue
      const iso3 = record.countryiso3code
      if (!iso3) continue
      const year = parseInt(record.date, 10)
      const val = record.value

      if (val === null || val === undefined) continue

      const upperIso3 = iso3.toUpperCase()
      if (!map[upperIso3] || map[upperIso3].year < year) {
        map[upperIso3] = { value: val, year: year }
      }
    }
    return map
  }

  const householdPppMap = parseIndicator(householdPppRaw)
  const gdpPppMap = parseIndicator(gdpPppRaw)
  const exchangeRateMap = parseIndicator(exchangeRateRaw)

  // Filter out aggregates. World Bank aggregates have region.id === 'NA' or region.value === 'Aggregates'
  const rawCountries = countriesMetadataRaw.filter(c => c.region && c.region.id !== 'NA')

  console.log(`Filtered out aggregates. Found ${rawCountries.length} candidate countries.`)

  // Process data points
  const mergedCountries = []

  for (const c of rawCountries) {
    const iso3 = c.id
    const name = c.name
    const iso2 = c.iso2Code
    const region = c.region ? c.region.value : 'Unknown'
    const incomeGroup = c.incomeLevel ? c.incomeLevel.value : 'Unknown'

    // We require the country to be in our static currency map to resolve currency
    const currency = COUNTRY_CURRENCY_MAP[iso3]
    if (!currency) {
      // Skipping countries without a registered currency mapping
      continue
    }

    const hhData = householdPppMap[iso3]
    const gdpData = gdpPppMap[iso3]
    const fxData = exchangeRateMap[iso3]

    mergedCountries.push({
      name,
      iso2,
      iso3,
      region,
      incomeGroup,
      currencyCode: currency.code,
      currencyName: currency.name,
      currencySymbol: currency.symbol,
      currencyDecimals: currency.decimals,
      rawHouseholdPpp: hhData ? hhData.value : null,
      rawHouseholdPppYear: hhData ? hhData.year : null,
      rawGdpPpp: gdpData ? gdpData.value : null,
      rawGdpPppYear: gdpData ? gdpData.year : null,
      rawFx: fxData ? fxData.value : null,
      rawFxYear: fxData ? fxData.year : null,
    })
  }

  // Calculate Medians of PPP-to-FX ratio for Fallbacks
  // Group ratios by incomeGroup and region
  const incomeGroupRatios = {}
  const regionRatios = {}

  for (const c of mergedCountries) {
    if (c.rawFx && c.rawHouseholdPpp) {
      const ratio = c.rawHouseholdPpp / c.rawFx
      if (!incomeGroupRatios[c.incomeGroup]) incomeGroupRatios[c.incomeGroup] = []
      if (!regionRatios[c.region]) regionRatios[c.region] = []
      incomeGroupRatios[c.incomeGroup].push(ratio)
      regionRatios[c.region].push(ratio)
    } else if (c.rawFx && c.rawGdpPpp) {
      const ratio = c.rawGdpPpp / c.rawFx
      if (!incomeGroupRatios[c.incomeGroup]) incomeGroupRatios[c.incomeGroup] = []
      if (!regionRatios[c.region]) regionRatios[c.region] = []
      incomeGroupRatios[c.incomeGroup].push(ratio)
      regionRatios[c.region].push(ratio)
    }
  }

  const incomeGroupMedians = {}
  for (const group in incomeGroupRatios) {
    incomeGroupMedians[group] = getMedian(incomeGroupRatios[group])
  }

  const regionMedians = {}
  for (const reg in regionRatios) {
    regionMedians[reg] = getMedian(regionRatios[reg])
  }

  // Resolve final ppp, fx, and quality labels for each country
  const finalCountriesList = []

  let countDirectHh = 0
  let countGdpFallback = 0
  let countIncomeEstimate = 0
  let countRegionalEstimate = 0
  let countFxOnly = 0
  let countMissingEssential = 0

  for (const c of mergedCountries) {
    let ppp = null
    let pppYear = null
    let fx = c.rawFx
    let fxYear = c.rawFxYear
    let quality = ''
    let dataSourceType = ''

    // USD is the base currency (exchange rate = 1.0, PPP = 1.0, Direct household PPP)
    if (c.iso3 === 'USA') {
      ppp = 1.0
      pppYear = new Date().getFullYear()
      fx = 1.0
      fxYear = new Date().getFullYear()
      quality = 'Direct household PPP'
      dataSourceType = 'USD Base'
    } else if (fx && c.rawHouseholdPpp) {
      // Fallback 1: Direct household PPP
      ppp = c.rawHouseholdPpp
      pppYear = c.rawHouseholdPppYear
      quality = 'Direct household PPP'
      dataSourceType = 'household'
      countDirectHh++
    } else if (fx && c.rawGdpPpp) {
      // Fallback 2: GDP PPP fallback
      ppp = c.rawGdpPpp
      pppYear = c.rawGdpPppYear
      quality = 'GDP PPP fallback'
      dataSourceType = 'gdp_fallback'
      countGdpFallback++
    } else if (fx) {
      // No direct PPP, we have FX.
      const incomeMedian = incomeGroupMedians[c.incomeGroup]
      const regionMedian = regionMedians[c.region]

      if (incomeMedian !== undefined && incomeMedian !== null) {
        // Fallback 3: Income-group estimate
        ppp = fx * incomeMedian
        pppYear = new Date().getFullYear() // estimate year
        quality = 'Income-group estimate'
        dataSourceType = 'income_estimate'
        countIncomeEstimate++
      } else if (regionMedian !== undefined && regionMedian !== null) {
        // Fallback 4: Regional estimate
        ppp = fx * regionMedian
        pppYear = new Date().getFullYear() // estimate year
        quality = 'Regional estimate'
        dataSourceType = 'regional_estimate'
        countRegionalEstimate++
      } else {
        // Fallback 5: FX-only fallback
        ppp = fx // PPP-to-FX ratio is 1.0
        pppYear = fxYear
        quality = 'FX-only fallback'
        dataSourceType = 'fx_fallback'
        countFxOnly++
      }
    } else {
      // No exchange rate available! This is missing essential data.
      countMissingEssential++
      continue
    }

    // Double check: if ppp is 0 or negative (extremely rare in indicators), skip
    if (ppp <= 0 || fx <= 0) {
      countMissingEssential++
      continue
    }

    finalCountriesList.push({
      name: c.name,
      iso2: c.iso2,
      iso3: c.iso3,
      region: c.region,
      incomeGroup: c.incomeGroup,
      currencyCode: c.currencyCode,
      currencyName: c.currencyName,
      currencySymbol: c.currencySymbol,
      currencyDecimals: c.currencyDecimals,
      ppp,
      pppYear,
      fx,
      fxYear,
      quality,
      dataSourceType,
    })
  }

  // Sort countries alphabetically by English country name
  finalCountriesList.sort((a, b) => a.name.localeCompare(b.name))

  // Validate output records
  for (const c of finalCountriesList) {
    if (!c.name || !c.iso3 || !c.currencyCode) {
      throw new Error(`Validation failed for record: ${JSON.stringify(c)}`)
    }
  }

  // Write JSON file
  const outDir = path.join(__dirname, '../src/data')
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }
  const outFile = path.join(outDir, 'countries.generated.json')
  fs.writeFileSync(outFile, JSON.stringify(finalCountriesList, null, 2), 'utf-8')

  console.log(`Saved generated data to ${outFile}`)
  console.log('--------------------------------------------------')
  console.log('SUMMARY OF GENERATION:')
  console.log(`- Total candidate countries processed: ${mergedCountries.length}`)
  console.log(`- Total valid countries written: ${finalCountriesList.length}`)
  console.log(`- Countries using Direct Household PPP: ${countDirectHh + (finalCountriesList.some(c => c.iso3 === 'USA') ? 1 : 0)}`)
  console.log(`- Countries using GDP PPP Fallback: ${countGdpFallback}`)
  console.log(`- Countries using Income-Group Estimates: ${countIncomeEstimate}`)
  console.log(`- Countries using Regional Estimates: ${countRegionalEstimate}`)
  console.log(`- Countries using FX-Only Fallback: ${countFxOnly}`)
  console.log(`- Countries missing essential data (skipped): ${countMissingEssential}`)
  console.log('--------------------------------------------------')
}

main().catch(err => {
  console.error('Fatal error running update script:', err)
  process.exit(1)
})
