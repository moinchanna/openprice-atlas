import React, { useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export const Header: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'calculator' | 'methodology' | ''>('calculator')
  const [isDark, setIsDark] = useState(() => {
    return typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  })

  const scrollToSection = (id: string, section: 'calculator' | 'methodology') => {
    setActiveSection(section)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (nextDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('openprice_atlas_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('openprice_atlas_theme', 'light')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-[#0A0A0A] dark:border-[#525252] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAFAFA] transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Brand logo & name */}
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
            setActiveSection('calculator')
          }}
        >
          <span className="font-display text-lg tracking-tight text-[#0A0A0A] dark:text-[#FAFAFA] uppercase">
            OPENPRICE ATLAS
          </span>
        </div>

        {/* Right: Navigation controls and theme switcher */}
        <div className="flex items-center gap-6 h-full">
          <nav className="flex items-center h-full gap-6 text-[15px] font-bold font-sans tracking-wide">
            <button
              onClick={() => scrollToSection('calculator-section', 'calculator')}
              className={`h-full px-1 border-b-[3px] transition-colors cursor-pointer flex items-center ${
                activeSection === 'calculator'
                  ? 'border-[#EF4444] text-[#0A0A0A] dark:text-[#FAFAFA]'
                  : 'border-transparent text-[#404040] dark:text-[#D4D4D4] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]'
              }`}
            >
              CALCULATOR
            </button>
            <button
              onClick={() => scrollToSection('methodology-section', 'methodology')}
              className={`h-full px-1 border-b-[3px] transition-colors cursor-pointer flex items-center ${
                activeSection === 'methodology'
                  ? 'border-[#EF4444] text-[#0A0A0A] dark:text-[#FAFAFA]'
                  : 'border-transparent text-[#404040] dark:text-[#D4D4D4] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]'
              }`}
            >
              HOW IT WORKS
            </button>
            <a
              href="https://github.com/moeenchanna/openprice-atlas"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setActiveSection('')}
              className="h-full px-1 border-b-[3px] border-transparent text-[#404040] dark:text-[#D4D4D4] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              GITHUB
            </a>
          </nav>

          {/* Accessible Stark Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center border-2 border-[#0A0A0A] dark:border-[#525252] bg-transparent text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] focus:outline-none focus-ring rounded-none transition-colors cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-[#EF4444]" aria-hidden="true" />
            ) : (
              <Moon className="w-5 h-5 text-[#0A0A0A]" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
export default Header
