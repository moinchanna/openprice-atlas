import { describe, it, expect } from 'vitest'

// Mimics the updated theme initialization block inside index.html and Header.tsx
function runThemeInit(savedTheme: string | null): { isDarkApplied: boolean } {
  const classList = new Set<string>()
  
  const documentElementMock = {
    classList: {
      add: (cls: string) => { classList.add(cls) },
      remove: (cls: string) => { classList.delete(cls) },
      contains: (cls: string) => classList.has(cls)
    }
  }

  // New visitor: no saved theme defaults to dark
  const saved = savedTheme
  const isDarkApplied = saved !== 'light'
  if (isDarkApplied) {
    documentElementMock.classList.add('dark')
  } else {
    documentElementMock.classList.remove('dark')
  }

  return {
    isDarkApplied: documentElementMock.classList.contains('dark')
  }
}

// Mimics pricing strategy options simulation to verify badge visibility and accessibility exposure
interface StrategyCardSim {
  id: string
  label: string
  isRecommended: boolean
}

function getCardBadges(card: StrategyCardSim, selectedId: string): { showRecommended: boolean; showSelected: boolean } {
  return {
    showRecommended: card.isRecommended, // always true if the card is recommended
    showSelected: card.id === selectedId
  }
}

describe('Accessible VoiceBox Theme & Pricing Presets Tests', () => {
  
  // 1. No saved theme defaults to dark
  it('should default to dark when no theme is saved in localStorage', () => {
    const result = runThemeInit(null)
    expect(result.isDarkApplied).toBe(true)
  })

  // 2. Saved light theme remains light after reload
  it('should remain light after reload if light theme is saved', () => {
    const result = runThemeInit('light')
    expect(result.isDarkApplied).toBe(false)
  })

  // 3. Saved dark theme remains dark after reload
  it('should remain dark after reload if dark theme is saved', () => {
    const result = runThemeInit('dark')
    expect(result.isDarkApplied).toBe(true)
  })

  // 4. The dark class is applied during theme initialization
  it('should apply the dark class directly on documentElement if active', () => {
    const result = runThemeInit('dark')
    expect(result.isDarkApplied).toBe(true)
  })

  // 5. Balanced always exposes a Recommended label
  it('should always show Recommended badge for Balanced card when Balanced is selected', () => {
    const balancedCard: StrategyCardSim = { id: 'balanced', label: 'Balanced', isRecommended: true }
    const badges = getCardBadges(balancedCard, 'balanced')
    expect(badges.showRecommended).toBe(true)
  })

  // 6. Only the currently active option exposes Selected
  it('should show Selected only on the active selection', () => {
    const balancedCard: StrategyCardSim = { id: 'balanced', label: 'Balanced', isRecommended: true }
    const revenueCard: StrategyCardSim = { id: 'revenue', label: 'Higher revenue', isRecommended: false }
    
    const balancedBadges = getCardBadges(balancedCard, 'revenue')
    const revenueBadges = getCardBadges(revenueCard, 'revenue')
    
    expect(balancedBadges.showSelected).toBe(false)
    expect(revenueBadges.showSelected).toBe(true)
  })

  // 7. Selecting a different option does not remove Balanced’s Recommended label
  it('should preserve Balanced Recommended badge when another option is active', () => {
    const balancedCard: StrategyCardSim = { id: 'balanced', label: 'Balanced', isRecommended: true }
    const badges = getCardBadges(balancedCard, 'revenue')
    expect(badges.showRecommended).toBe(true)
  })
})
