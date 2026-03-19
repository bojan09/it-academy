import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { GLOSSARY } from '../data/glossary.js'

// ─── Search index ─────────────────────────────────────────────────────────────
const PAGES = [
  { type: 'page', label: 'Home',                  href: '/',                    icon: '🏠', desc: 'Platform home' },
  { type: 'page', label: 'My Progress Dashboard', href: '/dashboard',           icon: '📊', desc: 'XP, levels, badges, course progress' },
  { type: 'page', label: 'Glossary',              href: '/glossary',            icon: '📖', desc: '70+ IT terms defined & searchable' },
  { type: 'page', label: 'Windows Server 2025',   href: '/windows-server-2025', icon: '🖥️', desc: 'AD, DNS, DHCP, Hyper-V' },
  { type: 'page', label: 'Windows Desktop',       href: '/windows',             icon: '💻', desc: 'Windows OS fundamentals' },
  { type: 'page', label: 'PowerShell',            href: '/powershell',          icon: '⚡', desc: 'Scripting & automation' },
  { type: 'page', label: 'Linux Fundamentals',    href: '/linux',               icon: '🐧', desc: 'Shell, fs, permissions' },
  { type: 'page', label: 'Unix',                  href: '/unix',                icon: '🔩', desc: 'POSIX, BSD, Solaris' },
  { type: 'page', label: 'Networking',            href: '/networking',          icon: '🌐', desc: 'TCP/IP, VLANs, routing' },
  { type: 'page', label: 'Cybersecurity',         href: '/cybersecurity',       icon: '🛡️', desc: 'Hardening, firewalls, IR' },
  { type: 'page', label: 'Python for SysAdmins',  href: '/python',              icon: '🐍', desc: 'Automation scripting' },
  { type: 'page', label: 'DevOps',                href: '/devops',              icon: '🔧', desc: 'CI/CD, Docker, K8s' },
  { type: 'page', label: 'IT Models',             href: '/it-models',           icon: '📐', desc: 'OSI, TCP/IP, ITIL, Zero Trust' },
  { type: 'page', label: 'Cheat Sheets',          href: '/cheatsheets',         icon: '📋', desc: 'Quick-reference guides' },
  { type: 'page', label: 'Troubleshooting',       href: '/troubleshooting',     icon: '🔍', desc: 'Diagnostic methodology' },
  { type: 'page', label: 'VMware Lab Setup',      href: '/vmware-setup',        icon: '🧪', desc: 'Configure your lab environment' },
  { type: 'page', label: 'Port Lookup',           href: '/port-lookup',         icon: '🔌', desc: 'Search ports & protocols' },
]

const GLOSSARY_ITEMS = Object.entries(GLOSSARY).map(([term, def]) => ({
  type:  'glossary',
  label: term,
  desc:  def.length > 80 ? def.slice(0, 80) + '…' : def,
  icon:  '📖',
  href:  null,
}))

const ALL_ITEMS = [...PAGES, ...GLOSSARY_ITEMS]

function highlight(text, query) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-brand-500/30 text-brand-200 rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export default function CommandPalette({ open, onClose }) {
  const [query,   setQuery]   = useState('')
  const [cursor,  setCursor]  = useState(0)
  const navigate  = useNavigate()
  const inputRef  = useRef(null)
  const listRef   = useRef(null)

  const results = query.trim()
    ? ALL_ITEMS.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.desc?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
    : PAGES.slice(0, 8)

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Keyboard nav
  const handleKeyDown = useCallback((e) => {
    if (!open) return
    if (e.key === 'Escape')     { onClose(); return }
    if (e.key === 'ArrowDown')  { e.preventDefault(); setCursor(c => Math.min(c + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)) }
    if (e.key === 'Enter') {
      // If item has href, navigate to it; otherwise go to search results
      const item = results[cursor]
      if (item?.href) { navigate(item.href); onClose() }
      else if (query.trim()) { navigate(`/search?q=${encodeURIComponent(query)}`); onClose() }
    }
  }, [open, results, cursor, navigate, onClose, query])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.children[cursor]
    el?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-xl bg-surface-850 border border-surface-600
                      rounded-2xl shadow-card-lg overflow-hidden animate-fade-up">

        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-700">
          <svg className="w-4 h-4 text-slate-500 flex-shrink-0" fill="none"
               viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setCursor(0) }}
            placeholder="Search lessons, topics, glossary…"
            className="flex-1 bg-transparent text-white text-sm placeholder-slate-500
                       outline-none font-sans"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md
                          bg-surface-700 border border-surface-600 text-[10px]
                          font-mono text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-500 text-sm">
              No results for "<span className="text-slate-300">{query}</span>"
            </div>
          ) : (
            results.map((item, i) => (
              <button
                key={item.label + i}
                onClick={() => {
                  if (item.href) { navigate(item.href); onClose() }
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left
                            transition-colors duration-100
                            ${i === cursor ? 'bg-surface-700' : 'hover:bg-surface-700/60'}`}
                onMouseEnter={() => setCursor(i)}
              >
                <span className="text-lg w-6 text-center flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {highlight(item.label, query)}
                  </div>
                  {item.desc && (
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {highlight(item.desc, query)}
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0
                                  ${item.type === 'glossary'
                                    ? 'bg-accent-purple/10 text-accent-purple'
                                    : 'bg-brand-500/10 text-brand-400'}`}>
                  {item.type}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-surface-700 flex items-center gap-4
                        text-[10px] font-mono text-slate-600">
          <span><kbd className="text-slate-500">↑↓</kbd> navigate</span>
          <span><kbd className="text-slate-500">↵</kbd> open</span>
          <span><kbd className="text-slate-500">esc</kbd> close</span>
          <span className="ml-auto">{results.length} results</span>
        </div>
      </div>
    </div>
  )
}
