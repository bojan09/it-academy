import React from 'react'
import { Link } from 'react-router-dom'
import ProgressBar from './ProgressBar.jsx'

/**
 * LessonCard — used in two modes:
 *   1. course-card  (on home page / course listing) — icon, title, desc, xp, readTime, lessonCount
 *   2. lesson-card  (on course page lesson grid)    — same + locked + completed states
 *
 * @param {string}  title
 * @param {string}  description
 * @param {string}  href
 * @param {number}  xp
 * @param {number}  progress      0–100
 * @param {string}  icon          emoji
 * @param {number}  lessonCount   show "N lessons" footer chip when > 0
 * @param {string}  readTime      e.g. "~25 min"
 * @param {boolean} locked        greys out + shows lock overlay
 * @param {boolean} completed     shows green completed state
 */
export default function LessonCard({
  title,
  description,
  href = '/',
  xp = 100,
  progress = 0,
  icon = '📄',
  lessonCount = 0,
  readTime = '',
  locked = false,
  completed = false,
}) {
  // ── Inner card markup (shared between locked/unlocked) ──────────────────────
  const inner = (
    <div
      className={`
        relative flex flex-col gap-4 h-full rounded-2xl border p-5
        transition-all duration-300 overflow-hidden
        ${locked
          ? 'bg-surface-800/50 border-surface-700 opacity-60 cursor-not-allowed select-none'
          : completed
            ? 'bg-surface-800 border-accent-green/25 cursor-pointer group hover:border-accent-green/50 hover:shadow-card-lg hover:-translate-y-0.5'
            : 'bg-surface-800 border-surface-600 cursor-pointer group hover:border-brand-600/50 hover:shadow-card-lg hover:-translate-y-0.5 shadow-card'
        }
      `}
    >
      {/* ── Completed ribbon ── */}
      {completed && (
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-2xl">
          <div className="absolute top-3 right-[-14px] rotate-45 bg-accent-green/80
                          text-white text-[9px] font-bold py-0.5 w-20 text-center tracking-wide">
            DONE
          </div>
        </div>
      )}

      {/* ── Header row: icon + status ── */}
      <div className="flex items-start justify-between gap-3">
        <div
          className={`
            w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0
            transition-transform duration-200
            ${locked    ? 'bg-surface-700' : 'bg-surface-700 group-hover:scale-110'}
            ${completed ? 'bg-accent-green/15 border border-accent-green/20' : ''}
          `}
        >
          {locked ? (
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            icon
          )}
        </div>

        {/* Status badge */}
        {completed && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-accent-green
                           bg-accent-green/10 border border-accent-green/20 px-2 py-0.5 rounded-full
                           flex-shrink-0">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Complete
          </span>
        )}
        {locked && (
          <span className="text-[10px] font-semibold text-slate-500 bg-surface-700
                           border border-surface-600 px-2 py-0.5 rounded-full flex-shrink-0">
            Locked
          </span>
        )}
      </div>

      {/* ── Title + description ── */}
      <div className="flex-1">
        <h3
          className={`
            font-semibold text-[15px] leading-snug mb-1.5 transition-colors duration-150
            ${locked    ? 'text-slate-500' : ''}
            ${completed ? 'text-white group-hover:text-accent-green' : ''}
            ${!locked && !completed ? 'text-white group-hover:text-brand-300' : ''}
          `}
        >
          {title}
        </h3>
        <p className={`text-xs leading-relaxed line-clamp-2
                        ${locked ? 'text-slate-600' : 'text-slate-400'}`}>
          {description}
        </p>
      </div>

      {/* ── Progress bar (shown when in-progress) ── */}
      {progress > 0 && progress < 100 && (
        <ProgressBar value={progress} showPercent size="sm" />
      )}

      {/* ── Locked hint ── */}
      {locked && (
        <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Complete the previous lesson to unlock
        </p>
      )}

      {/* ── Footer ── */}
      <div className={`flex items-center justify-between pt-2 border-t
                        ${locked ? 'border-surface-700' : 'border-surface-700'}`}>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {lessonCount > 0 && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {lessonCount} lessons
            </span>
          )}
          {readTime && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {readTime}
            </span>
          )}
        </div>
        <div className={`flex items-center gap-1 font-mono text-xs font-medium
                          ${locked ? 'text-slate-600' : 'text-accent-amber'}`}>
          +{xp} <span className={locked ? 'text-slate-700' : 'text-slate-500'}>XP</span>
        </div>
      </div>
    </div>
  )

  // Locked cards are not clickable
  if (locked) return <div className="h-full">{inner}</div>

  return (
    <Link to={href} className="block h-full">
      {inner}
    </Link>
  )
}
