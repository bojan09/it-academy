import React from 'react'
import { Link } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

export default function ResumeBanner() {
  const [progress] = useLocalStorage('sysadminpro_progress', null)

  const lastVisited = progress?.lastVisited

  if (!lastVisited) return null

  return (
    <div className="w-full bg-brand-600/10 border-b border-brand-500/20">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-2.5 flex items-center gap-3">
        <span className="text-base">👋</span>
        <p className="text-sm text-slate-300 flex-1">
          Welcome back! Continue:{' '}
          <span className="text-white font-medium">{lastVisited.courseTitle}</span>
          {' → '}
          <span className="text-brand-300">{lastVisited.lessonTitle}</span>
        </p>
        <Link
          to={lastVisited.href}
          className="flex-shrink-0 text-xs font-semibold text-brand-300 hover:text-white
                     flex items-center gap-1 transition-colors"
        >
          Resume
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
