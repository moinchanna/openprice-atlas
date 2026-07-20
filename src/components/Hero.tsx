import React from 'react'

interface HeroProps {
  onStartCalculating: () => void
}

export const Hero: React.FC<HeroProps> = ({ onStartCalculating }) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#FAFAFA] border-b border-[#E5E5E5] dark:border-[#1A1A1A] transition-colors duration-300">
      <div className="relative max-w-[1200px] mx-auto text-center space-y-6 sm:space-y-8">
        
        {/* Overline label */}
        <span className="block font-sans text-sm sm:text-[15px] font-bold tracking-[0.1em] text-[#EF4444] uppercase">
          GLOBAL SAAS PRICING
        </span>

        {/* Short red editorial accent rule */}
        <div className="w-12 h-1 bg-[#EF4444] mx-auto mb-4" />

        {/* Display Heading: Responsive sizing clamp */}
        <h1 className="font-display text-[38px] sm:text-[48px] md:text-[64px] lg:text-[clamp(64px,7vw,108px)] font-normal leading-[1.05] tracking-tight text-[#0A0A0A] dark:text-[#FAFAFA] uppercase max-w-5xl mx-auto break-words">
          FIND A FAIR PRICE<br />FOR EVERY COUNTRY.
        </h1>

        {/* Supporting Leadin Text: Stronger contrast & size */}
        <p className="font-sans text-[19px] sm:text-[22px] md:text-[26px] text-[#404040] dark:text-[#D4D4D4] max-w-[850px] mx-auto leading-[1.45] text-center">
          Enter your base rate to calculate optimized localized price targets utilizing real Purchasing Power Parity (PPP) data models.
        </p>

        {/* Stark buttons: 48px height, 16px font size, clear states */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onStartCalculating}
            className="w-full sm:w-auto h-12 px-8 border-2 border-[#0A0A0A] dark:border-[#FAFAFA] bg-[#0A0A0A] dark:bg-[#FAFAFA] text-[#FAFAFA] dark:text-[#0A0A0A] hover:bg-[#EF4444] dark:hover:bg-[#EF4444] dark:hover:text-[#FAFAFA] hover:border-[#EF4444] dark:hover:border-[#EF4444] active:bg-[#DC2626] font-sans text-[16px] font-bold tracking-[0.04em] uppercase rounded-none transition-colors duration-150 cursor-pointer flex items-center justify-center select-none focus:outline-none focus-ring"
          >
            START CALCULATING
          </button>
          <button
            onClick={() => scrollToSection('methodology-section')}
            className="w-full sm:w-auto h-12 px-8 border-2 border-[#0A0A0A] dark:border-[#FAFAFA] bg-transparent text-[#0A0A0A] dark:text-[#FAFAFA] hover:bg-[#0A0A0A] dark:hover:bg-[#FAFAFA] hover:text-[#FAFAFA] dark:hover:text-[#0A0A0A] font-sans text-[16px] font-bold tracking-[0.04em] uppercase rounded-none transition-colors duration-150 cursor-pointer flex items-center justify-center select-none focus:outline-none focus-ring"
          >
            HOW IT WORKS
          </button>
        </div>

        {/* Trust block */}
        <p className="font-sans text-[15px] font-bold tracking-[0.06em] text-[#525252] dark:text-[#D4D4D4] pt-4 select-none leading-relaxed">
          FREE · OPEN SOURCE · NO SIGNUP · NO TRACKING
        </p>
      </div>
    </section>
  )
}
export default Hero
