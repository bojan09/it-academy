import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useProgress, getLevelForXP, BADGES, LEVELS } from '../hooks/useProgress.js'
import ProgressBar from '../components/ProgressBar.jsx'
import CourseProgressRing from '../components/CourseProgressRing.jsx'
import PlatformProgress from '../components/PlatformProgress.jsx'
import StreakTracker from '../components/StreakTracker.jsx'
import Breadcrumb from '../components/Breadcrumb.jsx'
import StudyTimer from '../components/StudyTimer.jsx'

// ─── All courses with their lesson IDs — used to calculate per-course progress ─
const COURSES = [
  {
    id: 'windows-server-2025',
    title: 'Windows Server 2025',
    icon: '🖥️',
    href: '/windows-server-2025',
    color: 'from-brand-600 to-brand-800',
    accent: 'text-brand-300',
    lessonIds: ['ws2025-01','ws2025-02','ws2025-03','ws2025-04','ws2025-05',
                'ws2025-06','ws2025-07','ws2025-08','ws2025-09','ws2025-10',
                'ws2025-11','ws2025-12'],
    totalXP: 1090,
  },
  {
    id: 'linux',
    title: 'Linux Fundamentals',
    icon: '🐧',
    href: '/linux',
    color: 'from-accent-green/60 to-emerald-800',
    accent: 'text-accent-green',
    lessonIds: ['linux-01','linux-02','linux-03','linux-04','linux-05',
                'linux-06','linux-07','linux-08','linux-09','linux-10'],
    totalXP: 760,
  },
  {
    id: 'networking',
    title: 'Network Fundamentals',
    icon: '🌐',
    href: '/networking',
    color: 'from-accent-cyan/60 to-cyan-900',
    accent: 'text-accent-cyan',
    lessonIds: ['net-01','net-02','net-03','net-04','net-05','net-06','net-07','net-08'],
    totalXP: 620,
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    icon: '🛡️',
    href: '/cybersecurity',
    color: 'from-accent-red/60 to-red-900',
    accent: 'text-accent-red',
    lessonIds: ['sec-01','sec-02','sec-03','sec-04','sec-05',
                'sec-06','sec-07','sec-08','sec-09','sec-10'],
    totalXP: 900,
  },
  {
    id: 'python',
    title: 'Python for SysAdmins',
    icon: '🐍',
    href: '/python',
    color: 'from-accent-amber/60 to-yellow-900',
    accent: 'text-accent-amber',
    lessonIds: ['py-01','py-02','py-03','py-04','py-05','py-06','py-07','py-08','py-09'],
    totalXP: 730,
  },
  {
    id: 'powershell',
    title: 'PowerShell',
    icon: '⚡',
    href: '/powershell',
    color: 'from-accent-cyan/40 to-blue-900',
    accent: 'text-accent-cyan',
    lessonIds: ['ps-01','ps-02','ps-03','ps-04','ps-05','ps-06','ps-07','ps-08'],
    totalXP: 630,
  },
  {
    id: 'devops',
    title: 'DevOps',
    icon: '🔧',
    href: '/devops',
    color: 'from-accent-purple/60 to-purple-900',
    accent: 'text-accent-purple',
    lessonIds: ['devops-01','devops-02','devops-03','devops-04',
                'devops-05','devops-06','devops-07','devops-08'],
    totalXP: 750,
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: '🔍',
    href: '/troubleshooting',
    color: 'from-orange-600/60 to-orange-900',
    accent: 'text-orange-300',
    lessonIds: ['trouble-01','trouble-02','trouble-03','trouble-04','trouble-05','trouble-06'],
    totalXP: 480,
  },
]

// ─── Level colours for the ring ───────────────────────────────────────────────
const LEVEL_RING_COLORS = {
  1: 'stroke-slate-500',
  2: 'stroke-accent-green',
  3: 'stroke-accent-cyan',
  4: 'stroke-brand-400',
  5: 'stroke-accent-amber',
  6: 'stroke-accent-purple',
}

function LevelRing({ xp }) {
  const { current, next, progress } = getLevelForXP(xp)
  const r   = 54
  const circ = 2 * Math.PI * r
  const dash = circ * (progress / 100)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          {/* Track */}
          <circle cx="64" cy="64" r={r} fill="none" stroke="#1a2640" strokeWidth="10" />
          {/* Progress */}
          <circle
            cx="64" cy="64" r={r} fill="none" strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            className={`transition-all duration-1000 ${LEVEL_RING_COLORS[current.level] || 'stroke-brand-400'}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-white font-mono">{current.level}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Level</span>
        </div>
      </div>
      <div className="text-center">
        <p className={`font-bold text-base ${current.color}`}>{current.title}</p>
        {next && (
          <p className="text-xs text-slate-500 mt-0.5">
            {(next.minXP - xp).toLocaleString()} XP to {next.title}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Stat card — upgraded with accent border ──────────────────────────────────
function StatCard({ icon, label, value, sub, color = 'text-white', borderColor = '' }) {
  return (
    <div className={`card p-5 flex items-start gap-4 relative overflow-hidden
                     ${borderColor ? `border-l-2 ${borderColor}` : ''}`}>
      {/* subtle bg glow */}
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10
                      bg-current pointer-events-none" style={{ color: 'inherit' }} />
      <div className="w-10 h-10 rounded-xl bg-surface-700/80 flex items-center justify-center
                      text-xl flex-shrink-0 relative z-10">
        {icon}
      </div>
      <div className="relative z-10 min-w-0">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5 font-semibold">
          {label}
        </p>
        <p className={`text-2xl font-bold font-mono leading-none ${color}`}>{value}</p>
        {sub && <p className="text-[11px] text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Badge card ───────────────────────────────────────────────────────────────
function BadgeCard({ badge, earned }) {
  return (
    <div className={`card p-4 flex flex-col items-center gap-2 text-center transition-all duration-200
                     ${earned ? 'border-brand-500/30 bg-brand-500/5' : 'opacity-40'}`}>
      <span className={`text-3xl transition-all duration-200 ${earned ? '' : 'grayscale'}`}>
        {badge.icon}
      </span>
      <div>
        <p className={`text-xs font-semibold ${earned ? 'text-white' : 'text-slate-500'}`}>
          {badge.label}
        </p>
        <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">{badge.desc}</p>
      </div>
      {earned && (
        <span className="text-[10px] font-semibold text-accent-green bg-accent-green/10
                         border border-accent-green/20 px-2 py-0.5 rounded-full">
          Earned ✓
        </span>
      )}
    </div>
  )
}

// ─── Quiz score row ───────────────────────────────────────────────────────────
function QuizRow({ lessonId, score, passed, date }) {
  const label = lessonId
    .replace(/-/g, ' ')
    .replace(/([a-z])(\d)/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase())

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-surface-700 last:border-0">
      <span className={`text-base flex-shrink-0 ${passed ? '' : 'grayscale'}`}>
        {passed ? '✅' : '❌'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-300 font-medium truncate">{label}</p>
        <p className="text-[11px] text-slate-500">
          {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-bold font-mono ${
          score >= 90 ? 'text-accent-green' :
          score >= 70 ? 'text-accent-amber' : 'text-accent-red'
        }`}>{score}%</p>
        <p className="text-[10px] text-slate-500">{passed ? 'Passed' : 'Failed'}</p>
      </div>
    </div>
  )
}

// ─── Dashboard page ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { state, reset } = useProgress()
  const [confirmReset, setConfirmReset] = useState(false)

  const { totalXP, completedLessons, earnedBadges, quizScores, streak } = state
  const { current: level, next: nextLevel, progress: levelProgress } = getLevelForXP(totalXP)

  const totalCompleted   = completedLessons.length
  const totalQuizzes     = Object.keys(quizScores).length
  const totalQuizPassed  = Object.values(quizScores).filter(q => q.passed).length
  const avgQuizScore     = totalQuizzes
    ? Math.round(Object.values(quizScores).reduce((a, q) => a + q.score, 0) / totalQuizzes)
    : 0

  const courseStats = COURSES.map(c => {
    const done  = c.lessonIds.filter(id => completedLessons.includes(id)).length
    const pct   = Math.round((done / c.lessonIds.length) * 100)
    return { ...c, done, pct }
  })

  const activeCourses   = courseStats.filter(c => c.done > 0 && c.pct < 100)
  const completedCourses = courseStats.filter(c => c.pct === 100)
  const notStarted      = courseStats.filter(c => c.done === 0)

  const quizEntries = Object.entries(quizScores)
    .map(([id, data]) => ({ lessonId: id, ...data }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'My Progress' }]} />

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">
            Dashboard
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            My Progress
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Track your XP, level, badge collection, and course completion.
          </p>
        </div>
        <button
          onClick={() => setConfirmReset(true)}
          className="btn-ghost text-xs text-slate-500 hover:text-accent-red"
        >
          Reset Progress
        </button>
      </div>

      {/* ── TOP ROW: level ring + stat cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
        {/* Level ring */}
        <div className="card p-6 flex flex-col items-center justify-center gap-4 lg:row-span-1">
          <LevelRing xp={totalXP} />
          <div className="w-full space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Level Progress</span>
              <span className="font-mono text-white">{levelProgress}%</span>
            </div>
            <ProgressBar value={levelProgress} showPercent={false} size="md" />
            <div className="flex justify-between text-[10px] text-slate-600 font-mono">
              <span>{totalXP.toLocaleString()} XP</span>
              {nextLevel && <span>{nextLevel.minXP.toLocaleString()} XP</span>}
            </div>
          </div>
        </div>

        {/* Stat cards grid */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <StatCard icon="⚡" label="Total XP"       value={totalXP.toLocaleString()}
                    color="text-accent-amber"  borderColor="border-accent-amber/60"
                    sub="experience points" />
          <StatCard icon="📚" label="Lessons Done"   value={totalCompleted}
                    color="text-accent-green"  borderColor="border-accent-green/60"
                    sub={`of 82 lessons`} />
          <StatCard icon="🔥" label="Day Streak"     value={streak}
                    color="text-orange-400"    borderColor="border-orange-500/60"
                    sub="consecutive days" />
          <StatCard icon="📝" label="Quizzes Passed" value={`${totalQuizPassed}/${totalQuizzes}`}
                    color="text-brand-300"     borderColor="border-brand-500/60"
                    sub="quiz attempts" />
          <StatCard icon="🎯" label="Avg Quiz Score" value={totalQuizzes ? `${avgQuizScore}%` : '—'}
                    color={avgQuizScore >= 80 ? 'text-accent-green' : 'text-accent-amber'}
                    borderColor={avgQuizScore >= 80 ? 'border-accent-green/60' : 'border-accent-amber/60'}
                    sub="across all quizzes" />
          <StatCard icon="🏆" label="Badges Earned"  value={`${earnedBadges.length}/${BADGES.length}`}
                    color="text-accent-purple" borderColor="border-accent-purple/60"
                    sub="achievements" />
        </div>
      </div>

      {/* ── PLATFORM PROGRESS OVERVIEW ── */}
      <PlatformProgress completedLessons={completedLessons} />

      {/* ── COURSE RINGS OVERVIEW ── */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
            Course Overview
          </p>
          <span className="text-[11px] text-slate-500 font-mono">
            {courseStats.filter(c=>c.pct===100).length}/{courseStats.length} complete
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {courseStats.map(c => {
            const ringColor = c.pct === 100 ? 'text-accent-green'
              : c.pct > 0 ? 'text-brand-400' : 'text-slate-400'
            return (
              <Link key={c.id} to={c.href}
                    className="flex flex-col items-center gap-1.5 group">
                <CourseProgressRing
                  percent={c.pct}
                  size={52}
                  stroke={5}
                  color={ringColor}
                  label={c.pct === 100 ? '✓' : `${c.pct}%`}
                  animate
                />
                <p className="text-[9px] text-slate-500 text-center leading-tight
                               group-hover:text-slate-300 transition-colors line-clamp-2">
                  {c.title.replace('Fundamentals','').replace('for SysAdmins','').trim()}
                </p>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── STREAK TRACKER + STUDY TIMER ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <StreakTracker />
        <StudyTimer />
      </div>

      {/* ── LEVEL ROADMAP ── */}
      <div className="card p-5 mb-10">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Level Roadmap
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {LEVELS.map(lv => {
            const isCurrentOrPast = totalXP >= lv.minXP
            const isCurrent       = level.level === lv.level
            return (
              <div key={lv.level}
                   className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200
                                ${isCurrent ? 'bg-surface-700 border border-brand-500/20' : ''}`}>
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center
                                 text-[12px] font-bold font-mono
                                 ${isCurrentOrPast
                                   ? 'bg-brand-500/20 border-brand-500/30 text-brand-300'
                                   : 'bg-surface-700 border-surface-600 text-slate-600'}`}>
                  {lv.level}
                </div>
                <p className={`text-[10px] font-semibold text-center leading-tight
                               ${isCurrent ? lv.color : isCurrentOrPast ? 'text-slate-400' : 'text-slate-600'}`}>
                  {lv.title}
                </p>
                <p className="text-[9px] text-slate-600 font-mono">{lv.minXP.toLocaleString()} XP</p>
                {isCurrent && <span className="text-[9px] text-brand-400 font-semibold">← You</span>}
                {isCurrentOrPast && !isCurrent && <span className="text-accent-green text-[10px]">✓</span>}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── COURSE PROGRESS ── */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-5">Course Progress</h2>

        {/* In Progress */}
        {activeCourses.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              In Progress
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCourses.map(c => (
                <Link key={c.id} to={c.href} className="card p-5 group hover:border-brand-500/30
                                                         flex items-center gap-4">
                  <CourseProgressRing
                    percent={c.pct}
                    size={64}
                    stroke={6}
                    color="text-brand-400"
                    sublabel={`${c.done}/${c.lessonIds.length}`}
                    animate
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm group-hover:text-brand-300
                                  transition-colors truncate">{c.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      {c.lessonIds.length - c.done} lessons left
                    </p>
                    <div className="mt-2">
                      <ProgressBar value={c.pct} showPercent={false} size="sm" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completedCourses.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              Completed
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedCourses.map(c => (
                <div key={c.id} className="card p-5 border-accent-green/20 bg-accent-green/5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{c.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{c.title}</p>
                      <p className="text-xs text-accent-green mt-0.5">
                        ✓ All {c.lessonIds.length} lessons complete
                      </p>
                    </div>
                    <span className="text-accent-amber text-xs font-mono font-semibold flex-shrink-0">
                      +{c.totalXP} XP
                    </span>
                  </div>
                  <Link
                    to={`/certificate?course=${c.id}`}
                    className="btn-secondary w-full justify-center text-xs py-1.5"
                  >
                    🎓 Get Certificate
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Not started */}
        {notStarted.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              Not Started
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {notStarted.map(c => (
                <Link key={c.id} to={c.href}
                      className="card p-4 opacity-50 hover:opacity-80 transition-opacity group">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{c.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-400 truncate
                                   group-hover:text-white transition-colors">{c.title}</p>
                      <p className="text-[10px] text-slate-600 font-mono">
                        {c.lessonIds.length} lessons
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {totalCompleted === 0 && (
          <div className="card p-10 text-center">
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-lg font-bold text-white mb-2">No lessons completed yet</h3>
            <p className="text-slate-400 text-sm mb-5">
              Start with Windows Server 2025 — the most in-demand enterprise skill.
            </p>
            <Link to="/windows-server-2025/active-directory" className="btn-primary">
              Start First Lesson
            </Link>
          </div>
        )}
      </div>

      {/* ── BADGES ── */}
      <div className="mb-10">
        <div className="flex items-end justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Badges</h2>
          <p className="text-sm text-slate-500">
            {earnedBadges.length} / {BADGES.length} earned
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {BADGES.map(badge => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              earned={earnedBadges.includes(badge.id)}
            />
          ))}
        </div>
      </div>

      {/* ── QUIZ HISTORY ── */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-5">Quiz History</h2>
        {quizEntries.length > 0 ? (
          <div className="card p-5">
            {quizEntries.map(q => (
              <QuizRow key={q.lessonId + q.date} {...q} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <div className="text-3xl mb-2">📝</div>
            <p className="text-slate-400 text-sm">No quizzes attempted yet.</p>
          </div>
        )}
      </div>

      {/* ── Reset confirm modal ── */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
               onClick={() => setConfirmReset(false)} />
          <div className="relative card p-8 max-w-sm w-full text-center animate-fade-up">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-white mb-2">Reset All Progress?</h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              This will permanently delete all XP, completed lessons, quiz scores, streaks,
              and badges. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmReset(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => { reset(); setConfirmReset(false) }}
                className="btn-primary bg-accent-red hover:bg-red-400 shadow-none"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
