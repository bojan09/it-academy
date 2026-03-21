import React from 'react'
import { Link } from 'react-router-dom'

const COURSES = [
  { label: 'Windows Server 2025', href: '/windows-server-2025', icon: '🖥️' },
  { label: 'Linux Fundamentals',  href: '/linux',               icon: '🐧' },
  { label: 'Network Fundamentals',href: '/networking',           icon: '🌐' },
  { label: 'Cybersecurity',       href: '/cybersecurity',        icon: '🛡️' },
  { label: 'Python for SysAdmins',href: '/python',               icon: '🐍' },
  { label: 'PowerShell',          href: '/powershell',           icon: '⚡' },
  { label: 'DevOps',              href: '/devops',               icon: '🔧' },
  { label: 'Troubleshooting',     href: '/troubleshooting',      icon: '🔍' },
  { label: 'Windows Desktop',     href: '/windows',              icon: '💻' },
  { label: 'Unix',                href: '/unix',                 icon: '🖤' },
]

const TOOLS = [
  { label: 'Cheat Sheets',     href: '/cheatsheets',   icon: '📋' },
  { label: 'Port Lookup',      href: '/port-lookup',   icon: '🔌' },
  { label: 'Glossary',         href: '/glossary',      icon: '📖' },
  { label: 'VMware Lab Setup', href: '/vmware-setup',  icon: '🧪' },
  { label: 'IT Models',        href: '/it-models',     icon: '📐' },
]

const PLATFORM = [
  { label: 'Home',         href: '/' },
  { label: 'My Progress', href: '/dashboard' },
  { label: 'Certificate', href: '/certificate' },
  { label: 'Search',      href: '/search' },
]

const STATS = [
  { value: '10',   label: 'Courses' },
  { value: '82',   label: 'Lessons' },
  { value: '82',   label: 'VMware Labs' },
  { value: '400+', label: 'Quiz Questions' },
]

export default function Footer() {
  return (
    <footer className="border-t border-surface-700 bg-surface-900 mt-20 no-print">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10">

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-surface-700/60
                        divide-x divide-surface-700/60">
          {STATS.map(s => (
            <div key={s.label} className="py-6 flex flex-col items-center gap-1 text-center">
              <span className="text-2xl font-extrabold gradient-text">{s.value}</span>
              <span className="text-[11px] text-slate-500 uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="py-12 lg:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1 space-y-5">
            <Link to="/" className="flex items-center gap-2.5 group w-fit">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center
                              group-hover:bg-brand-400 transition-colors duration-200">
                <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]">
                  <path d="M4 6h16M4 10h10M4 14h12" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                  <circle cx="20" cy="14" r="2.5" fill="white"/>
                </svg>
              </div>
              <span className="font-bold text-white text-[15px] tracking-tight">
                SysAdmin<span className="text-brand-400">Pro</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Production-quality IT training for sysadmins, DevOps engineers,
              and infrastructure professionals. Built on real lab environments.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-accent-green font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
                All 82 lessons free during open beta
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                No account required · stored locally
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg
                            bg-surface-800 border border-surface-700 text-xs text-slate-500">
              <kbd className="font-mono text-slate-400 bg-surface-700 px-1.5 py-0.5
                              rounded text-[10px] border border-surface-600">⌘K</kbd>
              <span>Command palette — search anywhere</span>
            </div>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
              Learning Paths
            </h3>
            <ul className="space-y-2.5">
              {COURSES.map(c => (
                <li key={c.href}>
                  <Link to={c.href} className="flex items-center gap-2 text-sm text-slate-400
                                               hover:text-white transition-colors duration-150 group">
                    <span className="group-hover:scale-110 transition-transform duration-200">
                      {c.icon}
                    </span>
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools + Platform */}
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
              Tools & Reference
            </h3>
            <ul className="space-y-2.5 mb-8">
              {TOOLS.map(t => (
                <li key={t.href}>
                  <Link to={t.href} className="flex items-center gap-2 text-sm text-slate-400
                                               hover:text-white transition-colors duration-150 group">
                    <span className="group-hover:scale-110 transition-transform duration-200">
                      {t.icon}
                    </span>
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5">
              {PLATFORM.map(p => (
                <li key={p.href}>
                  <Link to={p.href} className="text-sm text-slate-400 hover:text-white
                                               transition-colors duration-150">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick start */}
          <div>
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
              Start Learning
            </h3>
            <div className="space-y-3">
              {[
                { icon:'🖥️', label:'Windows Server 2025', sub:'Most in-demand skill',  href:'/windows-server-2025' },
                { icon:'🐧', label:'Linux Fundamentals',   sub:'Essential foundation',  href:'/linux' },
                { icon:'🛡️', label:'Cybersecurity',        sub:'10 complete lessons',   href:'/cybersecurity' },
              ].map(c => (
                <Link key={c.href} to={c.href}
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface-800
                                 border border-surface-700 hover:border-brand-500/30
                                 hover:bg-surface-700/80 transition-all duration-200 group">
                  <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                    {c.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate
                                  group-hover:text-brand-300 transition-colors">{c.label}</p>
                    <p className="text-[10px] text-slate-500">{c.sub}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-600 flex-shrink-0
                                  group-hover:text-brand-400 group-hover:translate-x-0.5
                                  transition-all duration-200"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              ))}
            </div>
            <Link to="/dashboard"
                  className="mt-4 w-full flex items-center justify-center gap-2 py-2.5
                             rounded-xl border border-surface-700 text-sm text-slate-400
                             hover:text-white hover:border-brand-500/30
                             transition-all duration-200">
              📊 View My Dashboard
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-surface-700/60 py-6 flex flex-col sm:flex-row
                        items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SysAdminPro · Built for IT professionals ·
            <span className="text-slate-600 ml-1">Phase 17 Complete · 82/82 Lessons</span>
          </p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {['React 18', 'Vite', 'Tailwind CSS', 'localStorage'].map(t => (
              <span key={t} className="tag text-[10px] px-2 py-0.5">{t}</span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  )
}
