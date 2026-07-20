import React from 'react'
import { Globe } from 'lucide-react'

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-800">
          {/* Logo & Disclaimer */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Globe className="h-6 w-6 text-indigo-400" />
              <span className="text-xl font-bold tracking-tight">
                OpenPrice <span className="text-indigo-400">Atlas</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
              “OpenPrice Atlas is an independent open-source project. It is not affiliated with Netflix or any other subscription platform. All prices are estimates based on public economic data and configurable pricing assumptions.”
            </p>
          </div>

          {/* Data Transparency details */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">Data Transparency</h4>
            <div className="text-xs space-y-1.5 leading-relaxed">
              <p>
                <strong>Dataset Source:</strong> World Bank Indicators API
              </p>
              <p>
                <strong>Indicators:</strong> Private Consumption PPP (<code>PA.NUS.PRVT.PP</code>), GDP PPP (<code>PA.NUS.PPP</code>), Official FX Rate (<code>PA.NUS.FCRF</code>)
              </p>
              <p>
                <strong>Bundled Dataset Generation:</strong> July 2026 (Methodology v1.0.0)
              </p>
              <p>
                <strong>Source Code License:</strong> MIT License (Open Source)
              </p>
            </div>
          </div>
        </div>

        {/* Copyright & Github reference */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-550">
          <p>&copy; {currentYear} OpenPrice Atlas. Released under the MIT License.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/moeenchanna/openprice-atlas/blob/main/METHODOLOGY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 transition-colors"
            >
              Methodology Docs
            </a>
            <span className="text-slate-700">|</span>
            <a
              href="https://github.com/moeenchanna/openprice-atlas"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 transition-colors"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
