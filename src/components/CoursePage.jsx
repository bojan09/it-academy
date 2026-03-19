import React from 'react'
import { Link } from 'react-router-dom'
import Breadcrumb from './Breadcrumb.jsx'
import LessonCard from './LessonCard.jsx'
import ProgressBar from './ProgressBar.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

/**
 * CoursePage — shared template for every learning-path category page.
 *
 * @param {string}   id           — course id (matches courses.json)
 * @param {string}   title        — display title
 * @param {string}   icon         — emoji
 * @param {string}   tagline      — one-line description
 * @param {string}   description  — longer paragraph
 * @param {Array}    lessons      — [{ id, title, description, href, xp, readTime, icon }]
 * @param {Array}    highlights   — bullet points shown in the hero
 * @param {string}   accentColor  — tailwind color class for accent (e.g. 'text-brand-400')
 * @param {Array}    prereqs      — [{ label, href }]
 * @param {Array}    breadcrumbs  — passed to <Breadcrumb>
 */
export default function CoursePage({
  id,
  title,
  icon,
  tagline,
  description,
  lessons = [],
  highlights = [],
  accentColor = 'text-brand-400',
  prereqs = [],
  breadcrumbs = [],
}) {
  const [progress] = useLocalStorage('sysadminpro_progress', null)

  const completedLessons = progress?.completedLessons ?? []
  const totalLessons     = lessons.length
  const completedCount   = lessons.filter(l => completedLessons.includes(l.id)).length
  const courseProgress   = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  // Unlock logic: first lesson always unlocked; each subsequent unlocks when previous is complete
  const lessonsWithLock = lessons.map((lesson, i) => ({
    ...lesson,
    locked: i > 0 && !completedLessons.includes(lessons[i - 1].id),
    completed: completedLessons.includes(lesson.id),
  }))

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <Breadcrumb crumbs={breadcrumbs} />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-surface-800 border border-surface-600
                      p-8 lg:p-12 mb-10">
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-brand-600/10 rounded-full
                        blur-[80px] pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{icon}</span>
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">
                Learning Path
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              {title}
            </h1>
            <p className={`text-base font-medium mb-3 ${accentColor}`}>{tagline}</p>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-lg">{description}</p>

            {/* Highlights */}
            {highlights.length > 0 && (
              <ul className="space-y-2 mb-6">
                {highlights.map(h => (
                  <li key={h} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <svg className="w-4 h-4 text-accent-green flex-shrink-0" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {h}
                  </li>
                ))}
              </ul>
            )}

            {/* Start / continue button */}
            {totalLessons > 0 && (
              <Link
                to={lessonsWithLock.find(l => !l.completed && !l.locked)?.href || lessons[0].href}
                className="btn-primary"
              >
                {completedCount > 0 ? 'Continue Learning' : 'Start Course'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>

          {/* Stats panel */}
          <div className="space-y-4">
            {/* Progress */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">Course Progress</span>
                <span className="text-xs font-mono text-accent-amber">{completedCount}/{totalLessons} lessons</span>
              </div>
              <ProgressBar value={courseProgress} showPercent size="md" />
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Lessons',   value: totalLessons || '—' },
                { label: 'Total XP',  value: lessons.reduce((a, l) => a + (l.xp || 0), 0) + ' XP' },
                { label: 'Completed', value: completedCount },
                { label: 'Status',    value: courseProgress === 100 ? '✅ Done' : courseProgress > 0 ? '⚡ In Progress' : '🔒 Not Started' },
              ].map(m => (
                <div key={m.label} className="bg-surface-700/50 rounded-xl p-3 border border-surface-600">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">{m.label}</p>
                  <p className="text-sm font-semibold text-white font-mono">{m.value}</p>
                </div>
              ))}
            </div>

            {/* Prerequisites */}
            {prereqs.length > 0 && (
              <div className="card p-4">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
                  Prerequisites
                </p>
                <div className="flex flex-wrap gap-2">
                  {prereqs.map(p => (
                    <Link key={p.label} to={p.href} className="tag hover:border-brand-500/40 hover:text-white transition-colors">
                      {p.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── LESSONS GRID ──────────────────────────────────────────── */}
      {totalLessons > 0 ? (
        <div>
          <h2 className="text-xl font-bold text-white mb-5">Lessons</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessonsWithLock.map((lesson) => (
              <LessonCard
                key={lesson.id}
                title={lesson.title}
                description={lesson.description}
                href={lesson.locked ? '#' : lesson.href}
                xp={lesson.xp}
                readTime={lesson.readTime}
                icon={lesson.icon || '📄'}
                progress={lesson.completed ? 100 : 0}
                locked={lesson.locked}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 card">
          <div className="text-5xl mb-4">🚧</div>
          <h3 className="text-lg font-bold text-white mb-2">Lessons Coming Soon</h3>
          <p className="text-slate-400 text-sm">This course is being built. Check back after Phase 12.</p>
        </div>
      )}
    </div>
  )
}
