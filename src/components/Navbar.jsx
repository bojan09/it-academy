import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

// ─── Consolidated nav — 3 top-level dropdowns + right cluster ─────────────────
// Pattern: Logo | [Courses ▾] [IT Models ▾] [Tools ▾]   →   [Search] [XP] [CTA]
// Everything fits without overflow at any reasonable desktop width.

const NAV_ITEMS = [
  {
    label: 'Courses',
    mega: true,
    columns: [
      {
        heading: 'Windows',
        icon: '🖥️',
        items: [
          { label: 'Windows Desktop',     href: '/windows',             desc: 'OS fundamentals & Registry' },
          { label: 'Windows Server 2025', href: '/windows-server-2025', desc: 'AD, DNS, DHCP, Hyper-V' },
          { label: 'PowerShell',          href: '/powershell',          desc: 'Scripting & automation' },
        ],
      },
      {
        heading: 'Linux / Unix',
        icon: '🐧',
        items: [
          { label: 'Linux Fundamentals', href: '/linux', desc: 'Shell, fs, permissions' },
          { label: 'Ubuntu Server',      href: '/linux', desc: 'Debian-based server setup' },
          { label: 'Kali Linux',         href: '/linux', desc: 'Penetration testing OS' },
          { label: 'Unix',               href: '/unix',  desc: 'POSIX, BSD, Solaris' },
        ],
      },
      {
        heading: 'Infrastructure',
        icon: '🌐',
        items: [
          { label: 'Networking',    href: '/networking',    desc: 'TCP/IP, VLANs, routing' },
          { label: 'Cybersecurity', href: '/cybersecurity', desc: 'Hardening, firewalls, IR' },
          { label: 'DevOps',        href: '/devops',        desc: 'Docker, K8s, Terraform' },
          { label: 'Python',        href: '/python',        desc: 'Automation scripting' },
        ],
      },
    ],
  },
  {
    label: 'IT Models',
    mega: false,
    children: [
      { label: 'OSI Model',        href: '/it-models', desc: '7-layer network reference' },
      { label: 'TCP/IP Model',     href: '/it-models', desc: 'Internet protocol suite' },
      { label: 'ITIL Framework',   href: '/it-models', desc: 'Service management' },
      { label: 'CIA Triad',        href: '/it-models', desc: 'Core security model' },
      { label: 'Zero Trust',       href: '/it-models', desc: 'Never trust, always verify' },
      { label: 'DevOps Lifecycle', href: '/it-models', desc: 'Plan → build → deploy' },
    ],
  },
  {
    label: 'Tools',
    mega: false,
    children: [
      { label: 'Cheat Sheets',     href: '/cheatsheets',    desc: 'Linux, PS, Networking' },
      { label: 'Port Lookup',      href: '/port-lookup',    desc: 'Search 35+ ports' },
      { label: 'VMware Lab Setup', href: '/vmware-setup',   desc: 'Configure your lab' },
      { label: 'Troubleshooting',  href: '/troubleshooting', desc: 'Diagnostic methodology' },
    ],
  },
]

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
      <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center
                      shadow-glow-sm group-hover:bg-brand-400 transition-colors duration-200">
        <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]">
          <path d="M4 6h16M4 10h10M4 14h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="20" cy="14" r="2.5" fill="white"/>
        </svg>
      </div>
      <span className="font-bold text-white text-[15px] tracking-tight leading-none">
        SysAdmin<span className="text-brand-400">Pro</span>
      </span>
    </Link>
  )
}

// ─── Mega-panel (3-column grid for Courses) ───────────────────────────────────
function MegaPanel({ item, onClose }) {
  return (
    <div className="absolute top-full left-0 mt-2 z-50 w-[700px]
                    bg-surface-900 border border-surface-700 rounded-2xl
                    shadow-card-lg overflow-hidden">
      <div className="grid grid-cols-3 divide-x divide-surface-700/60">
        {item.columns.map((col) => (
          <div key={col.heading} className="p-4">
            {/* Column heading */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="text-sm">{col.icon}</span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                {col.heading}
              </span>
            </div>
            {/* Column items */}
            <div className="space-y-0.5">
              {col.items.map((child) => (
                <Link
                  key={child.label}
                  to={child.href}
                  onClick={onClose}
                  className="flex flex-col px-3 py-2.5 rounded-xl hover:bg-surface-700
                             transition-colors duration-150 group/item"
                >
                  <span className="text-[13px] font-medium text-slate-200
                                   group-hover/item:text-white transition-colors">
                    {child.label}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5
                                   group-hover/item:text-slate-400 transition-colors leading-tight">
                    {child.desc}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Footer hint */}
      <div className="px-5 py-3 bg-surface-800/50 border-t border-surface-700
                      flex items-center justify-between">
        <span className="text-[11px] text-slate-500">
          Every course includes VMware labs &amp; quizzes
        </span>
        <Link
          to="/vmware-setup"
          onClick={onClose}
          className="text-[11px] font-medium text-brand-400 hover:text-brand-300 transition-colors"
        >
          Set up your lab →
        </Link>
      </div>
    </div>
  )
}

// ─── Standard dropdown panel ──────────────────────────────────────────────────
function DropdownPanel({ item, onClose }) {
  const twoCol = item.children.length >= 4
  return (
    <div
      className="absolute top-full left-0 mt-2 z-50 bg-surface-900 border border-surface-700
                 rounded-2xl shadow-card-lg overflow-hidden"
      style={{ minWidth: twoCol ? '380px' : '220px' }}
    >
      <div className="px-4 py-2 border-b border-surface-700/60">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          {item.label}
        </span>
      </div>
      <div className={`p-2 ${twoCol ? 'grid grid-cols-2 gap-0.5' : 'flex flex-col gap-0.5'}`}>
        {item.children.map((child) => (
          <Link
            key={child.label}
            to={child.href}
            onClick={onClose}
            className="flex flex-col px-3 py-2.5 rounded-xl hover:bg-surface-700
                       transition-colors duration-150 group/item"
          >
            <span className="text-[13px] font-medium text-slate-200
                             group-hover/item:text-white transition-colors">
              {child.label}
            </span>
            {child.desc && (
              <span className="text-[11px] text-slate-500 mt-0.5
                               group-hover/item:text-slate-400 transition-colors leading-tight">
                {child.desc}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

// ─── Desktop nav item (dropdown trigger) ─────────────────────────────────────
function DesktopNavItem({ item }) {
  const [open, setOpen] = useState(false)
  const ref   = useRef(null)
  const timer = useRef(null)

  const show = () => { clearTimeout(timer.current); setOpen(true) }
  const hide = () => { timer.current = setTimeout(() => setOpen(false), 130) }
  useEffect(() => () => clearTimeout(timer.current), [])

  if (!item.mega && !item.children) {
    return (
      <NavLink
        to={item.href}
        className={({ isActive }) =>
          `px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-150
           ${isActive
             ? 'text-white bg-surface-700'
             : 'text-slate-300 hover:text-white hover:bg-surface-700/60'}`
        }
      >
        {item.label}
      </NavLink>
    )
  }

  return (
    <div ref={ref} className="relative" onMouseEnter={show} onMouseLeave={hide}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium
                    transition-all duration-150 select-none
                    ${open
                      ? 'text-white bg-surface-700'
                      : 'text-slate-300 hover:text-white hover:bg-surface-700/60'}`}
      >
        {item.label}
        <svg
          className={`w-3 h-3 flex-shrink-0 transition-transform duration-200
                      ${open ? 'rotate-180 text-brand-400' : 'text-slate-500'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Panel with CSS transition */}
      <div
        className={`transition-all duration-200 origin-top-left
                    ${open
                      ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'}`}
      >
        {item.mega
          ? <MegaPanel     item={item} onClose={() => setOpen(false)} />
          : <DropdownPanel item={item} onClose={() => setOpen(false)} />
        }
      </div>
    </div>
  )
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────
function MobileMenu({ open, onClose, onOpenSearch }) {
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Flatten mega columns into one list per top-level item
  const mobileItems = NAV_ITEMS.map(item => ({
    label:    item.label,
    children: item.mega
      ? item.columns.flatMap(col => col.items)
      : item.children ?? [],
  }))

  return (
    <div className={`fixed inset-0 z-40 lg:hidden transition-all duration-300
                     ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300
                    ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`absolute top-0 right-0 h-full w-[300px] bg-surface-900 border-l border-surface-700
                    flex flex-col shadow-card-lg overflow-y-auto transition-transform duration-300 ease-out
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-700">
          <Logo />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mobile search */}
        <div className="px-4 pt-4">
          <button
            onClick={() => { onOpenSearch?.(); onClose() }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-800
                       border border-surface-700 text-slate-400 text-sm hover:text-white
                       hover:border-slate-600 transition-all duration-150"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="flex-1 text-left text-[13px]">Search lessons…</span>
            <kbd className="text-[10px] font-mono text-slate-600 bg-surface-700 border
                            border-surface-600 px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
        </div>

        {/* XP pill */}
        <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-800
                        border border-surface-700 text-xs font-mono text-accent-green w-fit">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse-slow" />
          0 XP earned
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-0.5 mt-2">
          <NavLink
            to="/"
            onClick={onClose}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-xl text-sm font-medium transition-colors
               ${isActive ? 'text-white bg-surface-700' : 'text-slate-200 hover:bg-surface-700'}`
            }
          >
            Home
          </NavLink>

          {mobileItems.map((item) => {
            const isExp = expanded === item.label
            return (
              <div key={item.label}>
                <button
                  onClick={() => setExpanded(isExp ? null : item.label)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl
                             text-slate-200 hover:bg-surface-700 text-sm font-medium transition-colors"
                >
                  {item.label}
                  <svg
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isExp ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`overflow-hidden transition-all duration-200
                                 ${isExp ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="ml-3 mb-2 space-y-0.5 border-l border-surface-600 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.label + child.href}
                        to={child.href}
                        onClick={onClose}
                        className="block px-3 py-2 text-sm text-slate-400 hover:text-white
                                   hover:bg-surface-700 rounded-lg transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </nav>

        {/* CTA */}
        <div className="p-4 border-t border-surface-700">
          <Link to="/" onClick={onClose} className="btn-primary w-full justify-center">
            Start Learning Free
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── Main Navbar export ───────────────────────────────────────────────────────
export default function Navbar({ onOpenSearch }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled]     = useState(false)
  const { pathname } = useLocation()

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      <header
        className={`sticky top-0 z-30 transition-all duration-300
          ${scrolled
            ? 'bg-surface-950/92 backdrop-blur-xl border-b border-surface-700/80 shadow-card'
            : 'bg-surface-950/70 backdrop-blur-md border-b border-transparent'}`}
      >
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="flex items-center h-[62px] gap-6">

            {/* Logo — fixed left */}
            <Logo />

            {/* Divider */}
            <div className="hidden lg:block w-px h-5 bg-surface-700 flex-shrink-0" />

            {/* Desktop nav — takes remaining space, left-aligned */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 min-w-0">
              {NAV_ITEMS.map((item) => (
                <DesktopNavItem key={item.label} item={item} />
              ))}
            </nav>

            {/* Right cluster — fixed right */}
            <div className="hidden lg:flex items-center gap-2 flex-shrink-0 ml-auto">
              {/* Search */}
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800/80
                           border border-surface-700 text-slate-400 hover:text-white
                           hover:border-slate-500 transition-all duration-150"
                aria-label="Search (Cmd+K)"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-[12px] text-slate-500">Search</span>
                <kbd className="flex items-center px-1.5 py-0.5 rounded bg-surface-700
                                border border-surface-600 text-[10px] font-mono text-slate-600">
                  ⌘K
                </kbd>
              </button>

              {/* XP */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-800/80
                              border border-surface-700 text-[11px] font-mono text-accent-green
                              whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-slow" />
                0 XP
              </div>

              {/* CTA */}
              <Link to="/" className="btn-primary text-[13px] px-4 py-2 whitespace-nowrap">
                Start Learning
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white
                         hover:bg-surface-700 transition-colors ml-auto"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onOpenSearch={onOpenSearch}
      />
    </>
  )
}
