import { describe, it, expect } from 'vitest'
import { roundPrice } from './rounding'

describe('Psychological Rounding Tests', () => {
  it('should round 2-decimal currencies (like USD, EUR) to attractive endings', () => {
    // USD 7.12 may become 6.99 (within 8% boundary)
    expect(roundPrice(7.12, 'USD', 2)).toBe(6.99)
    // USD 6.76 may become 6.99 (within 8% boundary)
    expect(roundPrice(6.76, 'EUR', 2)).toBe(6.99)
    // USD 9.55 may become 9.99 (within 8% boundary)
    expect(roundPrice(9.55, 'USD', 2)).toBe(9.99)
    // Large 2-decimal values
    expect(roundPrice(124.0, 'USD', 2)).toBe(123.99) // rounds down slightly to attractive ending
  })

  it('should round 0-decimal currencies (like JPY, KRW) properly without decimals', () => {
    // JPY 843 may become 849 (approx +0.7% change, ends in 49)
    expect(roundPrice(843, 'JPY', 0)).toBe(849)
    // JPY 802 may become 790 (approx -1.5% change, ends in 90)
    expect(roundPrice(802, 'JPY', 0)).toBe(790)
    // Very small zero-decimal values
    expect(roundPrice(4, 'JPY', 0)).toBe(4)
    // Large zero-decimal values
    expect(roundPrice(12400, 'JPY', 0)).toBe(12000) // matches near 1000 step
  })

  it('should handle Kuwaiti Dinar (3-decimal currency) correctly', () => {
    // BHD 2.345
    expect(roundPrice(2.345, 'BHD', 3)).toBe(2.299)
  })

  it('should prevent zero or negative values', () => {
    expect(roundPrice(0, 'USD', 2)).toBe(0.01)
    expect(roundPrice(-10, 'JPY', 0)).toBe(1)
  })
})
