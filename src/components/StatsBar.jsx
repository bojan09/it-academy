import React, { useEffect, useState } from 'react'

/**
 * Reads progress from localStorage and renders live platform statistics.
 * Used in the Home hero and Dashboard header.
 * Props:
 *   variant: 'hero' | 'compact'   — layout variant
 */
const STAT_DEFINITIONS = [
  {
    key: 'lessonsCompleted',
    icon: '📚',
    label: 'Lessons Done',
    defaultValue: 0,
    color: 'text-brand-300',
    max: 82,
  },
  {
    key: 'xp',
    icon: '⚡',
    label: 'XP Earned',
    defaultValue: 0,
    color: 'text-accent-amber',
    format: v => v.toLocaleString(),
  },
  {
    key: 'quizzesPassed',
    icon: '✅',
    label: 'Quizzes Passed',
    defaultValue: 0,
    color: 'text-accent-green',
  },
  {
    key: 'streak',
    icon: '🔥',
    label: 'Day Streak',
    defaultValue: 0,
    color: 'text-accent-red',
    suffix: 'd',
  },
]

function useProgressStats() {
  const [stats, setStats] = useState({ lessonsCompleted: 0, xp: 0, quizzesPassed: 0, streak: 0 })

  useEffect(() => {
    try {
      const raw = localStorage.getItem('sysadminpro_progress')
      if (!raw) return
      const data = JSON.parse(raw)
      const completed   = Array.isArray(data.completedLessons) ? data.completedLessons.length : 0
      const xp          = typeof data.xp === 'number' ? data.xp : 0
      const scores      = data.quizScores || {}
      const passed      = Object.values(scores).filter(s => s?.passed).length
      const streak      = typeof data.streak === 'number' ? data.streak : 0
      setStats({ lessonsCompleted: completed, xp, quizzesPassed: passed, streak })
    } catch {}
  }, [])

  return stats
}

export default function StatsBar({ variant = 'hero' }) {
  const stats = useProgressStats()
  const hasProgress = stats.lessonsCompleted > 0 || stats.xp > 0

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap gap-4">
        {STAT_DEFINITIONS.map(def => {
          const raw = stats[def.key] ?? def.defaultValue
          const val = def.format ? def.format(raw) : raw
          return (
            <div key={def.key} className="flex items-center gap-1.5">
              <span className="text-base">{def.icon}</span>
              <span className={`font-bold font-mono text-sm ${def.color}`}>
                {val}{def.suffix || ''}
              </span>
              <span className="text-xs text-slate-500">{def.label}</span>
            </div>
          )
        })}
      </div>
    )
  }

  // Hero variant — large cards
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {STAT_DEFINITIONS.map(def => {
        const raw = stats[def.key] ?? def.defaultValue
        const val = def.format ? def.format(raw) : raw
        const pct = def.max ? Math.min(100, Math.round((raw / def.max) * 100)) : null

        return (
          <div key={def.key}
               className="card p-4 text-center group hover:border-brand-500/30 transition-all">
            <div className="text-2xl mb-2">{def.icon}</div>
            <div className={`text-2xl font-black font-mono ${def.color} tabular-nums`}>
              {hasProgress ? `${val}${def.suffix || ''}` : '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">{def.label}</div>
            {pct !== null && hasProgress && (
              <div className="progress-track mt-2 h-1">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-accent-cyan rounded-full
                             transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
