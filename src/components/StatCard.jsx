import React, { useEffect, useRef, useState } from 'react'

/**
 * StatCard — animated numeric metric display.
 * Counts up from 0 to `value` on mount.
 *
 * @param {string|number} value    — display value (animated if numeric)
 * @param {string}        label    — label below value
 * @param {string}        icon     — emoji icon
 * @param {string}        color    — Tailwind text-color class for icon/value accent
 * @param {string}        subtext  — optional small subtitle
 * @param {boolean}       animate  — whether to count up (default true)
 */
export default function StatCard({ value, label, icon, color = 'text-brand-300', subtext, animate = true }) {
  const isNumeric = typeof value === 'number'
  const [displayed, setDisplayed] = useState(isNumeric && animate ? 0 : value)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!isNumeric || !animate) return
    const target   = value
    const duration = 900
    const start    = performance.now()

    const tick = (now) => {
      const elapsed  = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, isNumeric, animate])

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {subtext && (
          <span className="text-[10px] font-mono text-slate-500 bg-surface-700 px-2 py-0.5 rounded-md">
            {subtext}
          </span>
        )}
      </div>
      <div className={`stat-card-value ${color}`}>
        {isNumeric ? displayed.toLocaleString() : value}
      </div>
      <div className="stat-card-label">{label}</div>
    </div>
  )
}
