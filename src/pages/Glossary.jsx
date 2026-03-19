import React, { useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb.jsx'
import { GLOSSARY_DATA, GLOSSARY_CATEGORIES } from '../data/glossary.js'

// ─── Category colour mapping ──────────────────────────────────────────────────
const CATEGORY_STYLES = {
  'Windows & AD':   'bg-brand-500/10   text-brand-300   border-brand-500/20',
  'Linux & Unix':   'bg-accent-green/10 text-accent-green border-accent-green/20',
  'Networking':     'bg-accent-cyan/10  text-accent-cyan  border-accent-cyan/20',
  'Security':       'bg-accent-red/10   text-accent-red   border-accent-red/20',
  'DevOps & Cloud': 'bg-accent-purple/10 text-accent-purple border-accent-purple/20',
  'Scripting':      'bg-accent-amber/10 text-accent-amber border-accent-amber/20',
  'Platform':       'bg-slate-500/10    text-slate-400    border-slate-600',
}

// Highlight matched text
function Highlight({ text, query }) {
  if (!query.trim()) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-brand-500/30 text-brand-200 rounded px-0.5 not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

// ─── Single term card ─────────────────────────────────────────────────────────
function TermCard({ term, def, category, query }) {
  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES['Platform']
  return (
    <div className="card p-5 group hover:border-brand-500/30 transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-bold text-white text-[15px] leading-snug group-hover:text-brand-300
                       transition-colors duration-150">
          <Highlight text={term} query={query} />
        </h3>
        <span className={`badge border text-[10px] flex-shrink-0 ${style}`}>
          {category}
        </span>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">
        <Highlight text={def} query={query} />
      </p>
    </div>
  )
}

// ─── Alphabet sidebar letter ──────────────────────────────────────────────────
function AlphaLink({ letter, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-7 h-7 rounded-lg text-[11px] font-bold font-mono transition-all duration-150
                  ${active
                    ? 'bg-brand-500 text-white shadow-glow-sm'
                    : 'text-slate-500 hover:text-white hover:bg-surface-700'}`}
    >
      {letter}
    </button>
  )
}

// ─── Main Glossary page ───────────────────────────────────────────────────────
export default function Glossary() {
  const [query,    setQuery]    = useState('')
  const [category, setCategory] = useState('All')
  const [alphaFilter, setAlphaFilter] = useState('')
  const searchRef = useRef(null)

  // Sorted A–Z
  const sorted = useMemo(
    () => [...GLOSSARY_DATA].sort((a, b) => a.term.localeCompare(b.term)),
    []
  )

  // Available letters
  const availableLetters = useMemo(
    () => new Set(sorted.map(t => t.term[0].toUpperCase())),
    [sorted]
  )

  // Filtered results
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sorted.filter(item => {
      const matchCat   = category === 'All' || item.category === category
      const matchAlpha = !alphaFilter || item.term[0].toUpperCase() === alphaFilter
      const matchQ     = !q || item.term.toLowerCase().includes(q) || item.def.toLowerCase().includes(q)
      return matchCat && matchAlpha && matchQ
    })
  }, [sorted, query, category, alphaFilter])

  // Group by first letter for display
  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach(item => {
      const letter = item.term[0].toUpperCase()
      if (!groups[letter]) groups[letter] = []
      groups[letter].push(item)
    })
    return groups
  }, [filtered])

  const handleAlpha = (letter) => {
    setAlphaFilter(prev => prev === letter ? '' : letter)
    setQuery('')
  }

  const clearAll = () => {
    setQuery('')
    setCategory('All')
    setAlphaFilter('')
    searchRef.current?.focus()
  }

  const hasFilters = query || category !== 'All' || alphaFilter

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Glossary' }]} />

      {/* ── Header ── */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">
          Reference
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          IT Glossary
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
          {GLOSSARY_DATA.length} technical terms across Windows, Linux, Networking, Security,
          DevOps, and Scripting — all with clear, practical definitions. Hover terms in any
          lesson to see inline definitions.
        </p>
      </div>

      {/* ── Search + filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500
                          pointer-events-none"
               fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setAlphaFilter('') }}
            placeholder="Search terms and definitions…"
            className="input pl-10"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500
                         hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {/* Clear */}
        {hasFilters && (
          <button onClick={clearAll} className="btn-ghost text-sm flex-shrink-0">
            Clear filters
          </button>
        )}
      </div>

      {/* ── Category filter pills ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {GLOSSARY_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setAlphaFilter('') }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150
                        ${category === cat
                          ? 'bg-brand-500 border-brand-500 text-white shadow-glow-sm'
                          : 'bg-surface-800 border-surface-700 text-slate-400 hover:text-white hover:border-slate-500'}`}
          >
            {cat}
            {cat !== 'All' && (
              <span className="ml-1.5 text-[10px] opacity-60">
                {GLOSSARY_DATA.filter(t => t.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── A–Z alphabet bar ── */}
      {!query && (
        <div className="flex flex-wrap gap-1 mb-8 p-3 bg-surface-800/50 rounded-xl
                        border border-surface-700">
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
            <AlphaLink
              key={letter}
              letter={letter}
              active={alphaFilter === letter}
              onClick={() => handleAlpha(letter)}
            />
          ))}
        </div>
      )}

      {/* ── Results count ── */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs font-mono text-slate-500">
          {filtered.length} term{filtered.length !== 1 ? 's' : ''}
          {hasFilters ? ' matching filters' : ' total'}
        </p>
        {!query && !alphaFilter && category === 'All' && (
          <p className="text-xs text-slate-600">Sorted A–Z</p>
        )}
      </div>

      {/* ── Term cards — grouped by letter ── */}
      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-slate-400 font-medium">No terms match your filters</p>
          <button onClick={clearAll} className="btn-ghost text-sm mt-3">
            Clear and show all →
          </button>
        </div>
      ) : query ? (
        // Flat list when searching (no letter groups)
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(item => (
            <TermCard key={item.term} {...item} query={query} />
          ))}
        </div>
      ) : (
        // Grouped by letter
        <div className="space-y-10">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([letter, terms]) => (
            <div key={letter} id={`letter-${letter}`}>
              {/* Letter heading */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/20
                                flex items-center justify-center font-mono font-black text-xl
                                text-brand-300 flex-shrink-0">
                  {letter}
                </div>
                <div className="flex-1 h-px bg-surface-700" />
                <span className="text-xs text-slate-600 font-mono flex-shrink-0">
                  {terms.length} term{terms.length !== 1 ? 's' : ''}
                </span>
              </div>
              {/* Terms grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {terms.map(item => (
                  <TermCard key={item.term} {...item} query={query} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Footer CTA ── */}
      <div className="mt-16 card p-6 flex flex-col sm:flex-row items-center gap-4
                      border-brand-500/10">
        <div className="flex-1">
          <p className="font-semibold text-white mb-1">
            Inline definitions in every lesson
          </p>
          <p className="text-sm text-slate-400">
            Any term marked with a dashed underline in a lesson will show its definition
            on hover. Start a lesson to see it in action.
          </p>
        </div>
        <Link to="/windows-server-2025/active-directory" className="btn-primary flex-shrink-0">
          Try it in a Lesson →
        </Link>
      </div>
    </div>
  )
}
