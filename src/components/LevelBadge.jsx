import React from 'react'
import { getLevelForXP } from '../hooks/useProgress.js'
import ProgressBar from './ProgressBar.jsx'

/**
 * LevelBadge — shows current level, XP, and progress to next level.
 * @param {number}  xp       — total XP
 * @param {boolean} compact  — small inline version for navbar
 */
export default function LevelBadge({ xp = 0, compact = false }) {
  const { current, next, progress } = getLevelForXP(xp)

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={`text-xs font-mono font-semibold ${current.color}`}>
          Lv.{current.level}
        </span>
        <span className="text-xs font-mono text-accent-amber">{xp} XP</span>
      </div>
    )
  }

  return (
    <div className="card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Current Level</p>
          <h3 className={`text-base font-bold ${current.color}`}>{current.title}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-surface-700 flex items-center justify-center
                        border border-surface-600 text-xl font-bold text-white font-mono">
          {current.level}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-accent-amber font-semibold">{xp} XP</span>
          {next && <span className="text-slate-500">{next.minXP} XP to {next.title}</span>}
        </div>
        <ProgressBar value={progress} showPercent={false} size="md" />
      </div>

      {next && (
        <p className="text-[11px] text-slate-500">
          {next.minXP - xp} XP until <span className={next.color}>{next.title}</span>
        </p>
      )}
    </div>
  )
}
