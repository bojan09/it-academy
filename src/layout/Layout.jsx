import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import CommandPalette from '../components/CommandPalette.jsx'
import ResumeBanner from '../components/ResumeBanner.jsx'
import XPToast from '../components/XPToast.jsx'
import SkipLink from '../components/SkipLink.jsx'

export default function Layout() {
  const { pathname } = useLocation()
  const [paletteOpen, setPaletteOpen] = useState(false)

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  // Keyboard shortcut: Ctrl/Cmd+K opens command palette
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(v => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-surface-950">
      {/* Accessibility: skip-to-content for keyboard users */}
      <SkipLink />

      <Navbar onOpenSearch={() => setPaletteOpen(true)} />
      <ResumeBanner />

      {/* id="main-content" is the target for the skip link */}
      <main id="main-content" className="flex-1 page-enter">
        <Outlet />
      </main>

      <Footer />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <XPToast />
    </div>
  )
}
