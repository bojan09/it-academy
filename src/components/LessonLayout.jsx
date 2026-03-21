import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Breadcrumb from './Breadcrumb.jsx'
import ProgressBar from './ProgressBar.jsx'
import { useProgress } from '../hooks/useProgress.js'
import { fireXPToast } from './XPToast.jsx'

/**
 * LessonLayout — the shell every individual lesson page sits inside.
 *
 * Handles:
 *   - Breadcrumb navigation
 *   - Lesson header (title, meta, XP, read time)
 *   - Sticky progress sidebar (desktop)
 *   - "Mark complete" button wired to useProgress
 *   - Previous / Next lesson navigation
 *   - setLastVisited tracking
 *
 * @param {string}   lessonId        — unique ID for this lesson
 * @param {string}   courseId        — parent course ID
 * @param {string}   title           — lesson title
 * @param {string}   courseTitle     — parent course title
 * @param {string}   courseHref      — link back to course index
 * @param {number}   xp              — XP reward for completion
 * @param {string}   readTime        — e.g. "~45 min"
 * @param {string}   icon            — emoji
 * @param {Array}    breadcrumbs     — [{ label, href }]
 * @param {object}   prev            — { title, href } | null
 * @param {object}   next            — { title, href } | null
 * @param {Array}    objectives      — string[] shown in sidebar
 * @param {React.ReactNode} children — lesson body content
 */
export default function LessonLayout({
  lessonId,
  courseId,
  title,
  courseTitle,
  courseHref,
  xp = 100,
  readTime = '',
  icon = '📄',
  breadcrumbs = [],
  prev = null,
  next = null,
  objectives = [],
  children,
}) {
  const { state, completeLesson, setLastVisited } = useProgress()
  const navigate = useNavigate()

  const isCompleted = state.completedLessons.includes(lessonId)
  const [justCompleted, setJustCompleted] = useState(false)

  // Track last visited
  useEffect(() => {
    setLastVisited({
      courseId,
      lessonId,
      lessonTitle: title,
      courseTitle,
      href: window.location.pathname,
    })
  }, [lessonId, courseId, title, courseTitle, setLastVisited])

  const handleComplete = () => {
    if (isCompleted) return
    completeLesson(lessonId, xp)
    setJustCompleted(true)
    fireXPToast(xp, `${title} complete!`)
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
      <Breadcrumb crumbs={breadcrumbs} />

      {/* ── Main grid: content | sidebar ── */}
      <div className="flex flex-col lg:flex-row gap-10">

        {/* ── LEFT — lesson content ── */}
        <article className="flex-1 min-w-0">

          {/* Lesson header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-3xl">{icon}</span>
              <span className="tag">
                {courseTitle}
              </span>
              {readTime && (
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0114 0z" />
                  </svg>
                  {readTime}
                </span>
              )}
              <span className="flex items-center gap-1 text-xs font-mono text-accent-amber">
                +{xp} XP
              </span>
              {isCompleted && (
                <span className="flex items-center gap-1.5 text-xs text-accent-green font-semibold">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Completed
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {title}
            </h1>
          </div>

          {/* ── Lesson body ── */}
          <div className="lesson-content space-y-12">
            {children}
          </div>

          {/* ── Complete / next navigation ── */}
          <div className="mt-14 pt-8 border-t border-surface-700">

            {/* XP completion card */}
            {!isCompleted && (
              <div className="card p-6 mb-6 border-brand-500/20 bg-brand-500/5">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white mb-1">
                      Ready to mark this lesson complete?
                    </p>
                    <p className="text-sm text-slate-400">
                      You'll earn <span className="text-accent-amber font-mono font-semibold">+{xp} XP</span> and unlock the next lesson.
                    </p>
                  </div>
                  <button
                    onClick={handleComplete}
                    className="btn-primary flex-shrink-0"
                  >
                    ✓ Mark Complete &amp; Earn XP
                  </button>
                </div>
              </div>
            )}

            {/* Completed celebration */}
            {(isCompleted || justCompleted) && (
              <div className="card p-5 mb-6 border-accent-green/20 bg-accent-green/5 flex items-center gap-4">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="font-semibold text-accent-green">Lesson Complete!</p>
                  <p className="text-sm text-slate-400">
                    You earned <span className="font-mono text-accent-amber">+{xp} XP</span>.
                    {next && ' Continue to the next lesson below.'}
                  </p>
                </div>
              </div>
            )}

            {/* Prev / Next nav */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {prev ? (
                <Link to={prev.href} className="btn-secondary group">
                  <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Previous</p>
                    <p className="text-sm font-medium text-slate-200">{prev.title}</p>
                  </div>
                </Link>
              ) : <div />}

              {next && (
                <Link to={next.href} className="btn-primary group ml-auto">
                  <div className="text-right">
                    <p className="text-[10px] text-white/60 uppercase tracking-widest">Next Lesson</p>
                    <p className="text-sm font-medium">{next.title}</p>
                  </div>
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </article>

        {/* ── RIGHT — sticky sidebar ── */}
        <aside className="lg:w-64 xl:w-72 flex-shrink-0 no-print" aria-label="Lesson sidebar">
          <div className="lg:sticky lg:top-[78px] space-y-4">

            {/* Lesson progress card */}
            <div className="card p-4">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
                This Lesson
              </p>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{icon}</span>
                <p className="text-sm font-medium text-white leading-snug">{title}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Status</span>
                  <span className={isCompleted ? 'text-accent-green font-medium' : 'text-slate-400'}>
                    {isCompleted ? '✓ Complete' : 'In Progress'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">XP Reward</span>
                  <span className="text-accent-amber font-mono font-medium">+{xp}</span>
                </div>
                {readTime && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Read Time</span>
                    <span className="text-slate-400">{readTime}</span>
                  </div>
                )}
              </div>
              {!isCompleted && (
                <button
                  onClick={handleComplete}
                  className="btn-primary w-full justify-center mt-4 text-xs py-2"
                >
                  ✓ Mark Complete
                </button>
              )}
            </div>

            {/* Learning objectives */}
            {objectives.length > 0 && (
              <div className="card p-4">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
                  Learning Objectives
                </p>
                <ul className="space-y-2">
                  {objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <svg className="w-3.5 h-3.5 text-brand-400 flex-shrink-0 mt-0.5"
                           fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                              d="M5 13l4 4L19 7" />
                      </svg>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Course nav */}
            <div className="card p-4">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Navigation
              </p>
              <div className="space-y-2">
                <Link to={courseHref}
                      className="flex items-center gap-2 text-xs text-slate-400 hover:text-white
                                 transition-colors group">
                  <svg className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to {courseTitle}
                </Link>
                {prev && (
                  <Link to={prev.href}
                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-white
                                   transition-colors truncate">
                    ← {prev.title}
                  </Link>
                )}
                {next && (
                  <Link to={next.href}
                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-white
                                   transition-colors truncate">
                    → {next.title}
                  </Link>
                )}
              </div>
            </div>

          </div>
        </aside>
      </div>
    </div>
  )
}
