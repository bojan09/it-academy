import React from 'react'

/**
 * ProgressBar
 * @param {number}  value       - 0–100
 * @param {string}  label       - optional label
 * @param {boolean} showPercent - show percentage text
 * @param {string}  size        - 'sm' | 'md' | 'lg'
 * @param {string}  color       - tailwind gradient class override
 */
export default function ProgressBar({
  value = 0,
  label = '',
  showPercent = true,
  size = 'md',
  color = null,
}) {
  const clamped = Math.min(100, Math.max(0, value))

  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' }
  const h = heights[size] || heights.md

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-slate-400">{label}</span>}
          {showPercent && (
            <span className="text-xs font-mono font-medium text-slate-300 ml-auto">
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div className={`progress-track ${h}`}>
        <div
          className={`progress-fill ${color || ''}`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
