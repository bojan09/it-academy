import React, { useState, useEffect, useRef, useCallback } from 'react'
import { fireXPToast } from './XPToast.jsx'
import { useProgress } from '../hooks/useProgress.js'

// ─── Timer presets ────────────────────────────────────────────────────────────
const PRESETS = [
  { label: '25 min',  seconds: 25 * 60, xp: 30, type: 'focus',  desc: 'Classic Pomodoro' },
  { label: '50 min',  seconds: 50 * 60, xp: 60, type: 'focus',  desc: 'Deep work session' },
  { label: '5 min',   seconds:  5 * 60, xp:  0, type: 'break',  desc: 'Short break' },
  { label: '15 min',  seconds: 15 * 60, xp:  0, type: 'break',  desc: 'Long break' },
]

// ─── Format seconds → MM:SS ───────────────────────────────────────────────────
function fmt(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ─── SVG ring progress ────────────────────────────────────────────────────────
function TimerRing({ progress, type, children }) {
  const r    = 58
  const circ = 2 * Math.PI * r
  const dash = circ * (1 - progress / 100)

  const strokeColor = type === 'break'
    ? 'stroke-accent-green'
    : 'stroke-brand-400'

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        {/* Track */}
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        {/* Progress arc */}
        <circle
          cx="64" cy="64" r={r} fill="none" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${circ - dash} ${circ}`}
          className={`${strokeColor} transition-all duration-1000`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}

// ─── Session history dot ──────────────────────────────────────────────────────
function SessionDot({ type, completed }) {
  return (
    <div className={`w-3 h-3 rounded-full border transition-all duration-300
                      ${completed
                        ? type === 'focus'
                          ? 'bg-brand-400 border-brand-400'
                          : 'bg-accent-green border-accent-green'
                        : 'bg-surface-700 border-surface-600'}`}
    />
  )
}

// ─── Main StudyTimer component ────────────────────────────────────────────────
export default function StudyTimer({ onClose }) {
  const { addXP } = useProgress()

  // Preset state
  const [presetIdx, setPresetIdx] = useState(0)
  const preset   = PRESETS[presetIdx]

  // Timer state
  const [remaining, setRemaining] = useState(preset.seconds)
  const [running,   setRunning]   = useState(false)
  const [completed, setCompleted] = useState(false)

  // Session history (max 8 dots)
  const [sessions, setSessions] = useState([])

  // Stats
  const [totalFocusMins, setTotalFocusMins] = useState(() => {
    try { return parseInt(localStorage.getItem('sysadminpro_focus_mins') || '0', 10) } catch { return 0 }
  })

  const intervalRef = useRef(null)
  const audioRef    = useRef(null)

  const totalSecs  = preset.seconds
  const elapsed    = totalSecs - remaining
  const progress   = Math.round((elapsed / totalSecs) * 100)

  // ── Tick ──────────────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    setRemaining(prev => {
      if (prev <= 1) {
        clearInterval(intervalRef.current)
        setRunning(false)
        setCompleted(true)
        return 0
      }
      return prev - 1
    })
  }, [])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running, tick])

  // ── On completion ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!completed) return

    const isFocus = preset.type === 'focus'

    // Add session to history
    setSessions(prev => [...prev.slice(-7), { type: preset.type, done: true }])

    // Award XP and update stats for focus sessions
    if (isFocus && preset.xp > 0) {
      addXP(preset.xp)
      fireXPToast(preset.xp, `Focus session complete — ${preset.label}!`)

      const focusMins = totalFocusMins + Math.floor(preset.seconds / 60)
      setTotalFocusMins(focusMins)
      try { localStorage.setItem('sysadminpro_focus_mins', String(focusMins)) } catch {}
    }

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('SysAdminPro ⏱️', {
        body: isFocus
          ? `Focus session done! +${preset.xp} XP earned. Time for a break.`
          : 'Break over — ready to focus again!',
        icon: '/favicon.ico',
      })
    }
  }, [completed]) // eslint-disable-line

  // ── Controls ──────────────────────────────────────────────────────────────
  const handleStart = () => {
    if (completed) return
    setRunning(true)
    // Request notification permission on first start
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const handlePause = () => setRunning(false)

  const handleReset = () => {
    setRunning(false)
    setCompleted(false)
    setRemaining(preset.seconds)
  }

  const handleSelectPreset = (idx) => {
    setPresetIdx(idx)
    setRunning(false)
    setCompleted(false)
    setRemaining(PRESETS[idx].seconds)
  }

  // ── Update document title while running ───────────────────────────────────
  useEffect(() => {
    if (running) {
      document.title = `${fmt(remaining)} — SysAdminPro`
    } else {
      document.title = 'SysAdminPro'
    }
    return () => { document.title = 'SysAdminPro' }
  }, [running, remaining])

  const isFocus = preset.type === 'focus'

  return (
    <div className="card p-6 w-full max-w-sm mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-white text-sm">Study Timer</h3>
          <p className="text-[11px] text-slate-500 font-mono">{totalFocusMins} min focused today</p>
        </div>
        {onClose && (
          <button onClick={onClose}
                  className="w-7 h-7 rounded-lg bg-surface-700 hover:bg-surface-600
                             flex items-center justify-center text-slate-400 hover:text-white
                             transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Preset selector ── */}
      <div className="grid grid-cols-4 gap-1.5 mb-6">
        {PRESETS.map((p, idx) => (
          <button
            key={p.label}
            onClick={() => handleSelectPreset(idx)}
            disabled={running}
            className={`px-2 py-2 rounded-xl text-[11px] font-semibold border transition-all duration-150
                        ${presetIdx === idx
                          ? p.type === 'focus'
                            ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                            : 'bg-accent-green/15 border-accent-green/30 text-accent-green'
                          : 'bg-surface-700 border-surface-600 text-slate-500 hover:text-slate-300 hover:border-slate-500'}
                        disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Timer ring ── */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <TimerRing progress={progress} type={preset.type}>
          <span className={`text-3xl font-black font-mono tracking-tight
                             ${completed ? 'text-accent-green' : 'text-white'}`}>
            {completed ? '✓' : fmt(remaining)}
          </span>
          <span className={`text-[10px] font-semibold uppercase tracking-widest mt-0.5
                             ${isFocus ? 'text-brand-400' : 'text-accent-green'}`}>
            {completed ? 'Done!' : preset.desc}
          </span>
        </TimerRing>

        {/* XP reward badge (focus sessions only) */}
        {isFocus && preset.xp > 0 && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono
                            transition-all duration-300
                            ${completed
                              ? 'bg-accent-amber/20 border-accent-amber/40 text-accent-amber'
                              : 'bg-surface-700 border-surface-600 text-slate-500'}`}>
            <span>⚡</span>
            <span>{completed ? `+${preset.xp} XP earned!` : `+${preset.xp} XP on completion`}</span>
          </div>
        )}
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center gap-3 mb-5">
        {!completed && (
          <button
            onClick={running ? handlePause : handleStart}
            className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl
                         font-semibold text-sm transition-all duration-150
                         ${isFocus
                           ? 'bg-brand-500 hover:bg-brand-400 text-white'
                           : 'bg-accent-green/20 hover:bg-accent-green/30 text-accent-green border border-accent-green/30'}`}
          >
            {running ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7L8 5z"/>
                </svg>
                {remaining === totalSecs ? 'Start' : 'Resume'}
              </>
            )}
          </button>
        )}

        <button
          onClick={handleReset}
          className={`h-11 rounded-xl border border-surface-600 bg-surface-700
                       hover:bg-surface-600 text-slate-400 hover:text-white
                       transition-all duration-150
                       ${completed ? 'flex-1 text-sm font-semibold' : 'w-11'}`}
        >
          {completed ? 'Start Another' : (
            <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Session dots ── */}
      {sessions.length > 0 && (
        <div>
          <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-2">Session history</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            {sessions.map((s, i) => (
              <SessionDot key={i} type={s.type} completed={s.done} />
            ))}
          </div>
        </div>
      )}

      {/* ── Tips ── */}
      <div className="mt-4 pt-4 border-t border-surface-700">
        <p className="text-[11px] text-slate-600 leading-relaxed">
          {isFocus
            ? '🎯 Close distractions, put on headphones, focus on one lesson at a time.'
            : '☕ Step away from the screen. Hydrate. Your brain consolidates learning during breaks.'}
        </p>
      </div>
    </div>
  )
}
