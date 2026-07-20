import React from 'react'

export const Hero: React.FC = () => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Decorative ambient backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-30">
        <div className="absolute top-12 left-10 w-72 h-72 rounded-full bg-indigo-400 blur-3xl dark:bg-indigo-600 dark:opacity-20" />
        <div className="absolute bottom-12 right-10 w-96 h-96 rounded-full bg-blue-300 blur-3xl dark:bg-indigo-800 dark:opacity-10" />
      </div>

      <div className="relative max-w-4xl mx-auto text-center">
        <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 mb-6">
          Pricing Intelligence for Global Products
        </span>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none mb-6">
          Set smarter prices for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-400 dark:to-indigo-300">every market</span>.
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Enter your base subscription price and generate purchasing-power-adjusted price recommendations for countries around the world.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            onClick={() => scrollToSection('calculator-section')}
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all"
          >
            Calculate regional prices
          </button>
          <button
            onClick={() => scrollToSection('methodology-section')}
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all"
          >
            View methodology
          </button>
        </div>

        <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500">
          Free · Open Source · No signup · No data tracking
        </p>
      </div>
    </section>
  )
}
