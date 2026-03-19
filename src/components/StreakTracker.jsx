import React from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

// Build last 7 days array
function getLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toDateString())
  }
  return days
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function StreakTracker({ compact = false }) {
  const [progress] = useLocalStorage('sysadminpro_progress', null)

  const streak      = progress?.streak ?? 0
  const lastDate    = progress?.lastStudyDate ?? null
  const studiedDays = new Set()

  // Reconstruct which of the last 7 days had activity
  // (we store only lastStudyDate; for full accuracy the progress hook
  //  can be extended to store a studyHistory array in Phase 7)
  if (lastDate) studiedDays.add(lastDate)

  const days    = getLast7Days()
  const today   = new Date().toDateString()
  const studied = lastDate === today

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-lg">🔥</span>
        <div>
          <span className="text-white font-semibold">{streak}</span>
          <span className="text-slate-500"> day streak</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Daily Streak</h3>
        <div className="flex items-center gap-1.5 text-sm font-mono">
          <span className="text-xl">🔥</span>
          <span className="text-white font-bold">{streak}</span>
          <span className="text-slate-500 text-xs">days</span>
        </div>
      </div>

      {/* 7-day grid */}
      <div className="flex items-end gap-1.5 justify-between">
        {days.map((day, i) => {
          const isToday  = day === today
          const active   = studiedDays.has(day)
          return (
            <div key={day} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs
                            transition-all duration-200
                            ${active
                              ? 'bg-brand-500 text-white shadow-glow-sm'
                              : isToday
                                ? 'bg-surface-700 border border-brand-500/50 text-slate-400'
                                : 'bg-surface-700 text-slate-600'}`}
              >
                {active ? '✓' : ''}
              </div>
              <span className={`text-[10px] font-mono ${isToday ? 'text-brand-400' : 'text-slate-600'}`}>
                {DAY_LABELS[(new Date(day).getDay())]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Status */}
      <p className="text-xs text-slate-500 mt-3">
        {studied
          ? '✅ You\'ve studied today. Keep it up!'
          : '📚 Complete a lesson today to maintain your streak.'}
      </p>
    </div>
  )
}
