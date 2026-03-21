import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * Displays a congratulatory banner when all lessons in a course are complete.
 * Props:
 *   courseTitle  — human-readable course name
 *   courseHref   — link back to course page
 *   totalXP      — total XP earned in this course
 *   onDismiss    — optional callback when user dismisses
 */
export default function CourseCompletionBanner({ courseTitle, courseHref, totalXP = 0, onDismiss }) {
  const [visible, setVisible] = useState(false)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    // Slight delay so the banner enters smoothly
    const t = setTimeout(() => setVisible(true), 100)
    // Generate random confetti particles
    setParticles(
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: `${5 + Math.random() * 90}%`,
        animDelay: `${Math.random() * 0.8}s`,
        color: ['text-brand-400', 'text-accent-cyan', 'text-accent-green',
                'text-accent-amber', 'text-accent-purple'][Math.floor(Math.random() * 5)],
        icon: ['✦', '✧', '★', '◆', '●', '▲'][Math.floor(Math.random() * 6)],
      }))
    )
    return () => clearTimeout(t)
  }, [])

  function handleDismiss() {
    setVisible(false)
    setTimeout(() => onDismiss?.(), 300)
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-accent-green/30
                  bg-gradient-to-br from-accent-green/10 via-brand-500/5 to-accent-cyan/10
                  transition-all duration-500 ease-out
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
    >
      {/* Confetti particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {particles.map(p => (
          <span
            key={p.id}
            className={`absolute top-0 text-xs ${p.color} animate-bounce opacity-60`}
            style={{ left: p.left, animationDelay: p.animDelay, animationDuration: '1.5s' }}
          >
            {p.icon}
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="relative px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Trophy icon */}
        <div className="w-14 h-14 rounded-2xl bg-accent-green/15 border border-accent-green/30
                        flex items-center justify-center text-3xl flex-shrink-0">
          🏆
        </div>

        {/* Text */}
        <div className="flex-1">
          <p className="text-xs font-semibold text-accent-green uppercase tracking-widest mb-1">
            Course Complete!
          </p>
          <h3 className="text-lg font-bold text-white leading-tight">
            You've mastered {courseTitle}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Every lesson completed.
            {totalXP > 0 && (
              <span className="text-accent-amber font-semibold ml-1">+{totalXP} XP earned.</span>
            )}
            {' '}Your certificate is ready.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          <Link
            to="/certificate"
            className="btn-primary text-xs px-4 py-2"
          >
            🎓 Get Certificate
          </Link>
          <Link
            to={courseHref}
            className="btn-secondary text-xs px-4 py-2"
          >
            Review Course
          </Link>
          {onDismiss && (
            <button
              onClick={handleDismiss}
              className="btn-ghost text-xs px-3 py-2"
              aria-label="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Bottom progress bar — full */}
      <div className="h-1 bg-surface-700">
        <div className="h-full bg-gradient-to-r from-accent-green to-accent-cyan w-full" />
      </div>
    </div>
  )
}
