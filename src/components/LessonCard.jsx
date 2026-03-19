import React from 'react'
import { Link } from 'react-router-dom'
import ProgressBar from './ProgressBar.jsx'

/**
 * LessonCard
 * @param {string}  title
 * @param {string}  description
 * @param {string}  href
 * @param {number}  xp          - XP reward
 * @param {number}  progress    - 0–100
 * @param {string}  icon        - emoji
 * @param {number}  lessonCount
 * @param {string}  readTime    - e.g. "~25 min"
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
}) {
  const CardContent = () => (
    <div className="card p-5 flex flex-col gap-4 h-full cursor-pointer group">

      {/* Icon */}
      <div className="w-11 h-11 rounded-xl bg-surface-700 flex items-center justify-center
                      text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200 w-fit">
        {icon}
      </div>

      {/* Title + desc */}
      <div className="flex-1">
        <h3 className="font-semibold text-white text-[15px] leading-snug mb-1.5
                       group-hover:text-brand-300 transition-colors duration-150">
          {title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{description}</p>
      </div>

      {/* Progress bar (only when started) */}
      {progress > 0 && (
        <ProgressBar value={progress} showPercent={true} size="sm" />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-surface-700">
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
        <div className="flex items-center gap-1 font-mono text-xs text-accent-amber font-medium">
          <span>+{xp}</span>
          <span className="text-slate-500">XP</span>
        </div>
      </div>
    </div>
  )

  return (
    <Link to={href} className="block h-full">
      <CardContent />
    </Link>
  )
}

