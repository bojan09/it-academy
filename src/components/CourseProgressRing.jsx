import React from 'react'

/**
 * SVG progress ring component.
 * Props:
 *   percent   — 0-100
 *   size      — ring diameter in px (default 80)
 *   stroke    — ring stroke width (default 7)
 *   color     — tailwind colour string used in className (default 'text-brand-400')
 *   label     — text inside ring (defaults to percent%)
 *   sublabel  — smaller text below label
 *   animate   — whether to animate the fill on mount (default true)
 */
export default function CourseProgressRing({
  percent = 0,
  size = 80,
  stroke = 7,
  color = 'text-brand-400',
  label,
  sublabel,
  animate = true,
  className = '',
}) {
  const radius   = (size - stroke * 2) / 2
  const circum   = 2 * Math.PI * radius
  const progress = circum - (Math.min(percent, 100) / 100) * circum
  const centre   = size / 2

  // Pick colour class → actual hex for SVG stroke
  const colorMap = {
    'text-brand-400':       '#60a5fa',
    'text-brand-500':       '#3b82f6',
    'text-accent-cyan':     '#22d3ee',
    'text-accent-green':    '#4ade80',
    'text-accent-amber':    '#f59e0b',
    'text-accent-red':      '#f87171',
    'text-accent-purple':   '#a78bfa',
    'text-slate-400':       '#94a3b8',
  }
  const strokeColor = colorMap[color] ?? '#60a5fa'

  const displayLabel = label ?? `${Math.round(percent)}%`

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}
         style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Track */}
        <circle
          cx={centre}
          cy={centre}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        {/* Fill */}
        <circle
          cx={centre}
          cy={centre}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circum}
          strokeDashoffset={progress}
          style={animate ? {
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          } : undefined}
        />
      </svg>

      {/* Centre text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
        <span className={`font-bold font-mono ${color}`}
              style={{ fontSize: size < 64 ? 11 : size < 96 ? 14 : 18 }}>
          {displayLabel}
        </span>
        {sublabel && (
          <span className="text-slate-500 mt-0.5"
                style={{ fontSize: size < 96 ? 9 : 10 }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}
