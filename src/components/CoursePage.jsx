import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Breadcrumb from './Breadcrumb.jsx'
import LessonCard from './LessonCard.jsx'
import ProgressBar from './ProgressBar.jsx'
import CourseCompletionBanner from './CourseCompletionBanner.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

// ─── View toggle ──────────────────────────────────────────────────────────────
const GridIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round"
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
)
const ListIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
)

// ─── Lesson row — used in list view ──────────────────────────────────────────
function LessonRow({ lesson, index, total }) {
  const isLast = index === total - 1

  return (
    <div className="relative flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Circle node */}
        <div
          className={`
            w-9 h-9 rounded-xl border-2 flex items-center justify-center text-sm
            flex-shrink-0 z-10 transition-all duration-200
            ${lesson.completed
              ? 'bg-accent-green/20 border-accent-green/60 text-accent-green'
              : lesson.locked
                ? 'bg-surface-800 border-surface-700 text-slate-600'
                : 'bg-brand-500/15 border-brand-500/50 text-brand-300 shadow-glow-sm'
            }
          `}
        >
          {lesson.completed ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : lesson.locked ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            <span className="font-bold font-mono text-[12px]">{index + 1}</span>
          )}
        </div>
        {/* Vertical line connector */}
        {!isLast && (
          <div className={`w-0.5 flex-1 my-1 min-h-[24px]
                           ${lesson.completed ? 'bg-accent-green/30' : 'bg-surface-700'}`} />
        )}
      </div>

      {/* Card body */}
      <div className="flex-1 min-w-0 pb-4">
        {lesson.locked ? (
          <div className="card p-4 opacity-55 cursor-not-allowed select-none">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg flex-shrink-0 grayscale">{lesson.icon || '📄'}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500 truncate">{lesson.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5 truncate">{lesson.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] text-slate-600 font-mono">{lesson.readTime}</span>
                <span className="text-[10px] text-slate-600 font-mono">+{lesson.xp} XP</span>
                <span className="text-[10px] font-semibold text-slate-600 bg-surface-700
                                 border border-surface-600 px-2 py-0.5 rounded-full">
                  Locked
                </span>
              </div>
            </div>
          </div>
        ) : (
          <Link to={lesson.href} className="block group">
            <div className={`
              card p-4 transition-all duration-200
              ${lesson.completed
                ? 'border-accent-green/25 hover:border-accent-green/50'
                : 'hover:border-brand-500/40 hover:shadow-card-lg'
              }
            `}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {lesson.icon || '📄'}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate transition-colors
                                    ${lesson.completed
                                      ? 'text-white group-hover:text-accent-green'
                                      : 'text-white group-hover:text-brand-300'}`}>
                      {lesson.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{lesson.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {lesson.readTime && (
                    <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {lesson.readTime}
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-accent-amber">+{lesson.xp} XP</span>
                  {lesson.completed ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-accent-green
                                     bg-accent-green/10 border border-accent-green/20 px-2 py-0.5 rounded-full">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Done
                    </span>
                  ) : (
                    <svg className="w-4 h-4 text-slate-600 group-hover:text-brand-400 group-hover:translate-x-0.5
                                    transition-all duration-150"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── Main CoursePage component ────────────────────────────────────────────────
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
  const [progress]  = useLocalStorage('sysadminpro_progress', null)
  const [view, setView] = useState('list') // 'list' | 'grid'

  const completedLessons = progress?.completedLessons ?? []
  const quizScores       = progress?.quizScores ?? {}
  const totalLessons     = lessons.length
  const completedCount   = lessons.filter(l => completedLessons.includes(l.id)).length
  const courseProgress   = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  const totalXP          = lessons.reduce((a, l) => a + (l.xp || 0), 0)

  // ── Unlock logic ────────────────────────────────────────────────────────────
  // A lesson is unlocked if:
  //   (a) it is the first lesson, OR
  //   (b) the previous lesson is completed, OR
  //   (c) the previous lesson's quiz was passed
  const lessonsWithState = lessons.map((lesson, i) => {
    const isCompleted = completedLessons.includes(lesson.id)
    let locked = false
    if (i > 0) {
      const prev         = lessons[i - 1]
      const prevDone     = completedLessons.includes(prev.id)
      const prevQuizPass = quizScores[prev.id]?.passed === true
      locked = !prevDone && !prevQuizPass
    }
    return { ...lesson, locked, completed: isCompleted }
  })

  // First lesson that is unlocked and not yet completed
  const nextLesson = lessonsWithState.find(l => !l.completed && !l.locked)

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <Breadcrumb crumbs={breadcrumbs} />

      {/* ── Course completion banner ─────────────────────────────── */}
      {courseProgress === 100 && (
        <div className="mb-6">
          <CourseCompletionBanner
            courseTitle={title}
            courseHref={`/${id}`}
            totalXP={totalXP}
          />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════ */}
      <div className="relative rounded-2xl overflow-hidden bg-surface-800 border border-surface-600
                      p-8 lg:p-12 mb-10">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-600/8 rounded-full
                        blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r
                        from-transparent via-brand-500/20 to-transparent" />

        <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-start">
          {/* Left — copy */}
          <div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="text-4xl">{icon}</span>
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest
                               bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-full">
                Learning Path
              </span>
              {courseProgress === 100 && (
                <span className="text-xs font-semibold text-accent-green bg-accent-green/10
                                 border border-accent-green/20 px-3 py-1 rounded-full">
                  ✓ Completed
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              {title}
            </h1>
            <p className={`text-base font-medium mb-3 ${accentColor}`}>{tagline}</p>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-lg">{description}</p>

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

            {totalLessons > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                {nextLesson ? (
                  <Link to={nextLesson.href} className="btn-primary">
                    {completedCount > 0 ? 'Continue Learning' : 'Start Course'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : courseProgress === 100 ? (
                  <span className="btn-secondary cursor-default">
                    🎉 All lessons complete!
                  </span>
                ) : null}

                {completedCount > 0 && (
                  <Link to="/dashboard" className="btn-ghost text-sm">
                    View Progress →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right — stats */}
          <div className="space-y-4">
            {/* Progress ring card */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">Course Progress</span>
                <span className="text-xs font-mono text-accent-amber font-semibold">
                  {completedCount}/{totalLessons} lessons
                </span>
              </div>
              <ProgressBar value={courseProgress} showPercent size="md" />
              <div className="flex justify-between text-[11px] text-slate-600 font-mono mt-1.5">
                <span>{completedCount * Math.round(totalXP / (totalLessons || 1))} XP earned</span>
                <span>{totalXP} XP total</span>
              </div>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Lessons',   value: totalLessons || '—', icon: '📚' },
                { label: 'Total XP',  value: `${totalXP} XP`,     icon: '⚡' },
                { label: 'Completed', value: completedCount,       icon: '✅' },
                {
                  label: 'Status',
                  value: courseProgress === 100 ? 'Complete' : courseProgress > 0 ? 'In Progress' : 'Not Started',
                  icon: courseProgress === 100 ? '🏆' : courseProgress > 0 ? '⚡' : '🔒',
                },
              ].map(m => (
                <div key={m.label} className="bg-surface-700/50 rounded-xl p-3 border border-surface-700">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <span>{m.icon}</span>{m.label}
                  </p>
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
                    <Link key={p.label} to={p.href}
                          className="tag hover:border-brand-500/40 hover:text-white transition-colors">
                      {p.label} →
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          LESSONS SECTION
      ════════════════════════════════════════════════════════ */}
      {totalLessons > 0 ? (
        <div>
          {/* Section header + view toggle */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Lessons</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {completedCount > 0
                  ? `${completedCount} of ${totalLessons} complete — keep going!`
                  : 'Start from lesson 1 and work your way through.'}
              </p>
            </div>

            {/* Grid / List toggle */}
            <div className="flex items-center gap-1 bg-surface-800 border border-surface-700
                            rounded-lg p-1">
              <button
                onClick={() => setView('list')}
                className={`p-1.5 rounded-md transition-all duration-150
                            ${view === 'list' ? 'bg-surface-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                aria-label="List view"
              >
                <ListIcon />
              </button>
              <button
                onClick={() => setView('grid')}
                className={`p-1.5 rounded-md transition-all duration-150
                            ${view === 'grid' ? 'bg-surface-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                aria-label="Grid view"
              >
                <GridIcon />
              </button>
            </div>
          </div>

          {/* Unlock hint banner */}
          {completedCount === 0 && totalLessons > 1 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-800
                            border border-surface-700 mb-6 text-sm text-slate-400">
              <svg className="w-4 h-4 text-brand-400 flex-shrink-0" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Complete each lesson (or pass its quiz) to unlock the next one.
              Lessons unlock sequentially.
            </div>
          )}

          {/* ── LIST VIEW ── */}
          {view === 'list' && (
            <div>
              {lessonsWithState.map((lesson, i) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  index={i}
                  total={lessonsWithState.length}
                />
              ))}
            </div>
          )}

          {/* ── GRID VIEW ── */}
          {view === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessonsWithState.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  title={lesson.title}
                  description={lesson.description}
                  href={lesson.locked ? '#' : lesson.href}
                  xp={lesson.xp}
                  readTime={lesson.readTime}
                  icon={lesson.icon || '📄'}
                  locked={lesson.locked}
                  completed={lesson.completed}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 card">
          <div className="text-5xl mb-4">🚧</div>
          <h3 className="text-lg font-bold text-white mb-2">Lessons Coming Soon</h3>
          <p className="text-slate-400 text-sm">This course is actively being built.</p>
        </div>
      )}
    </div>
  )
}
