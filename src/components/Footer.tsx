import React from 'react'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#F5F5F5] dark:bg-[#121212] text-[#0A0A0A] dark:text-[#FAFAFA] py-12 px-4 sm:px-6 lg:px-8 border-t-2 border-[#0A0A0A] dark:border-[#525252] transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-[#D4D4D4] dark:border-[#525252]">
          {/* Logo & Disclaimer */}
          <div className="space-y-4">
            <span className="font-display text-[17px] tracking-tight text-[#0A0A0A] dark:text-[#FAFAFA] uppercase">
              OPENPRICE ATLAS
            </span>
            <p className="text-[15px] text-[#404040] dark:text-[#D4D4D4] leading-relaxed max-w-md font-sans">
              OpenPrice Atlas is an independent open-source project. It is not affiliated with Netflix or any other subscription platform. All prices are estimates based on public economic data and configurable pricing assumptions.
            </p>
          </div>

          {/* Data Transparency details */}
          <div className="space-y-3 md:text-right font-sans text-[15px]">
            <h4 className="font-bold text-[#0A0A0A] dark:text-[#FAFAFA] tracking-wider uppercase">Data Transparency</h4>
            <div className="space-y-1.5 leading-relaxed text-[#404040] dark:text-[#D4D4D4]">
              <p>
                <strong>Dataset Source:</strong> World Bank Indicators API
              </p>
              <p>
                <strong>Indicators:</strong> Private Consumption PPP, GDP PPP, Official FX Rate
              </p>
              <p>
                <strong>Bundled Generation:</strong> July 2026 (Methodology v1.0.0)
              </p>
              <p>
                <strong>License:</strong> MIT License (Open Source)
              </p>
            </div>
          </div>
        </div>
        {/* Privacy disclosure */}
        <p className="text-[13px] text-[#404040] dark:text-[#D4D4D4] leading-relaxed mt-4">
          Privacy-first analytics: aggregate traffic only, no cookies or personal visitor profiles.
        </p>
        {/* GitHub star CTA */}
        <div className="mt-4">
          <a
            href="https://github.com/moinchanna/openprice-atlas"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#EF4444] hover:text-[#DC2626] focus:outline-none focus:ring-2 focus:ring-[#EF4444] transition-colors"
            aria-label="Star OpenPrice Atlas on GitHub"
          >
            ★ Star it on GitHub
          </a>
        </div>

        {/* Bottom copyright & references */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[15px] text-[#525252] dark:text-[#D4D4D4] font-sans">
          <p>&copy; {currentYear} OpenPrice Atlas. Released under the MIT License.</p>
          <div className="flex items-center gap-4 font-bold uppercase tracking-wider">
            <a
              href="https://github.com/moinchanna/openprice-atlas/blob/main/METHODOLOGY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#EF4444] transition-colors cursor-pointer text-[15px]"
            >
              Methodology Docs
            </a>
            <span className="text-[#D4D4D4] dark:text-[#525252]">|</span>
            <a
              href="https://github.com/moinchanna/openprice-atlas"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#EF4444] transition-colors cursor-pointer text-[15px]"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
export default Footer
