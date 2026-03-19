import React, { useState, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useProgress, getLevelForXP, BADGES } from '../hooks/useProgress.js'
import Breadcrumb from '../components/Breadcrumb.jsx'

// ─── Course catalogue (same as Dashboard) ────────────────────────────────────
const COURSES = [
  { id: 'windows-server-2025', title: 'Windows Server 2025',   icon: '🖥️', lessonIds: ['ws2025-01','ws2025-02','ws2025-03','ws2025-04','ws2025-05','ws2025-06','ws2025-07','ws2025-08','ws2025-09','ws2025-10','ws2025-11','ws2025-12'], totalXP: 1090 },
  { id: 'linux',               title: 'Linux Fundamentals',    icon: '🐧', lessonIds: ['linux-01','linux-02','linux-03','linux-04','linux-05','linux-06','linux-07','linux-08','linux-09','linux-10'], totalXP: 760 },
  { id: 'networking',          title: 'Network Fundamentals',  icon: '🌐', lessonIds: ['net-01','net-02','net-03','net-04','net-05','net-06','net-07','net-08'], totalXP: 620 },
  { id: 'cybersecurity',       title: 'Cybersecurity',         icon: '🛡️', lessonIds: ['sec-01','sec-02','sec-03','sec-04','sec-05','sec-06','sec-07','sec-08','sec-09','sec-10'], totalXP: 900 },
  { id: 'python',              title: 'Python for SysAdmins',  icon: '🐍', lessonIds: ['py-01','py-02','py-03','py-04','py-05','py-06','py-07','py-08','py-09'], totalXP: 730 },
  { id: 'powershell',          title: 'PowerShell',            icon: '⚡', lessonIds: ['ps-01','ps-02','ps-03','ps-04','ps-05','ps-06','ps-07','ps-08'], totalXP: 630 },
  { id: 'devops',              title: 'DevOps',                icon: '🔧', lessonIds: ['devops-01','devops-02','devops-03','devops-04','devops-05','devops-06','devops-07','devops-08'], totalXP: 750 },
  { id: 'troubleshooting',     title: 'Troubleshooting',       icon: '🔍', lessonIds: ['trouble-01','trouble-02','trouble-03','trouble-04','trouble-05','trouble-06'], totalXP: 480 },
]

// ─── Certificate design ───────────────────────────────────────────────────────
function CertificateCard({ name, course, xp, level, badges, completedDate, certId }) {
  return (
    <div
      id="certificate"
      className="relative w-full max-w-3xl mx-auto bg-surface-900 rounded-3xl overflow-hidden
                 border-2 border-brand-500/30 shadow-card-lg print:shadow-none
                 print:border-slate-300 print:bg-white print:rounded-none"
      style={{ aspectRatio: '1.414 / 1' }}
    >
      {/* Corner ornaments */}
      <div className="absolute top-0 left-0 w-24 h-24 print:hidden">
        <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-brand-500/40 rounded-tl-2xl" />
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 print:hidden">
        <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-brand-500/40 rounded-tr-2xl" />
      </div>
      <div className="absolute bottom-0 left-0 w-24 h-24 print:hidden">
        <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-brand-500/40 rounded-bl-2xl" />
      </div>
      <div className="absolute bottom-0 right-0 w-24 h-24 print:hidden">
        <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-brand-500/40 rounded-br-2xl" />
      </div>

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-96 h-96 bg-brand-600/8 rounded-full blur-[80px] pointer-events-none print:hidden" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-between p-8 sm:p-12 text-center">

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M4 6h16M4 10h10M4 14h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="20" cy="14" r="2.5" fill="white"/>
              </svg>
            </div>
            <span className="font-bold text-white text-sm tracking-tight print:text-black">
              SysAdmin<span className="text-brand-400 print:text-blue-700">Pro</span>
            </span>
          </div>
          <p className="text-[10px] font-semibold text-brand-400 uppercase tracking-[0.2em]
                         print:text-blue-700">
            Certificate of Completion
          </p>
        </div>

        {/* Main body */}
        <div className="space-y-4">
          <p className="text-xs text-slate-400 print:text-gray-600 uppercase tracking-widest">
            This certifies that
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight
                          print:text-black leading-tight">
            {name || 'SysAdmin Pro Student'}
          </h1>
          <p className="text-xs text-slate-400 print:text-gray-600 uppercase tracking-widest">
            has successfully completed
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl">{course?.icon || '🖥️'}</span>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-300 print:text-blue-700">
              {course?.title || 'Course'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 print:text-gray-500 max-w-sm mx-auto leading-relaxed">
            Demonstrated mastery through hands-on VMware lab exercises,
            quizzes, and structured lesson completion.
          </p>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-8 sm:gap-12">
          {[
            { label: 'XP Earned',  value: xp?.toLocaleString() || '0', icon: '⚡' },
            { label: 'Level',      value: level || 'Junior SysAdmin',  icon: '🏆' },
            { label: 'Badges',     value: badges || '0',               icon: '🎖️' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-lg mb-0.5">{s.icon}</div>
              <p className="text-base font-bold text-white print:text-black font-mono">{s.value}</p>
              <p className="text-[10px] text-slate-500 print:text-gray-500 uppercase tracking-widest">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between w-full">
          <div className="text-left">
            <div className="w-28 h-px bg-surface-600 print:bg-gray-300 mb-1.5" />
            <p className="text-[10px] text-slate-500 print:text-gray-500">Date Issued</p>
            <p className="text-xs text-slate-300 print:text-gray-700 font-mono">
              {completedDate || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-slate-600 print:text-gray-400 font-mono">
              ID: {certId}
            </p>
            <p className="text-[9px] text-slate-600 print:text-gray-400">
              sysadminpro.dev/verify
            </p>
          </div>
          <div className="text-right">
            <div className="w-28 h-px bg-surface-600 print:bg-gray-300 mb-1.5 ml-auto" />
            <p className="text-[10px] text-slate-500 print:text-gray-500">Platform</p>
            <p className="text-xs text-brand-400 print:text-blue-700 font-semibold">
              SysAdminPro
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Certificate page ────────────────────────────────────────────────────
export default function Certificate() {
  const { state } = useProgress()
  const [searchParams] = useSearchParams()
  const [name, setName] = useState('')
  const [selectedCourse, setSelectedCourse] = useState(null)

  const { totalXP, completedLessons, earnedBadges } = state
  const { current: level } = getLevelForXP(totalXP)

  // Determine which courses are complete
  const completedCourses = COURSES.filter(c =>
    c.lessonIds.every(id => completedLessons.includes(id))
  )

  // Auto-select from query param (?course=windows-server-2025)
  const qCourse = searchParams.get('course')
  const activeCourse = selectedCourse
    || COURSES.find(c => c.id === qCourse)
    || completedCourses[0]
    || null

  // Generate a deterministic cert ID from course + XP
  const certId = activeCourse
    ? `SAP-${activeCourse.id.slice(0, 3).toUpperCase()}${totalXP}-${Date.now().toString(36).slice(-5).toUpperCase()}`
    : 'SAP-000000'

  const handlePrint = () => window.print()

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10 no-print:block">
      <Breadcrumb crumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Certificate' },
      ]} />

      {/* ── Page header (hidden when printing) ── */}
      <div className="no-print mb-8">
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">Achievement</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Completion Certificate
        </h1>
        <p className="text-slate-400 text-sm max-w-xl">
          Generate a printable certificate for any course you've completed.
          Enter your name, select your course, and hit print.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 no-print:grid">

        {/* ── Controls (hidden when printing) ── */}
        <div className="no-print space-y-5">

          {/* Name input */}
          <div className="card p-5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
              Your Name
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name…"
              className="input"
              maxLength={50}
            />
            <p className="text-[11px] text-slate-600 mt-1.5">
              This appears on the certificate
            </p>
          </div>

          {/* Course selection */}
          <div className="card p-5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Select Course
            </label>
            {completedCourses.length > 0 ? (
              <div className="space-y-2">
                {completedCourses.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCourse(c)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border
                                text-left text-sm transition-all duration-150
                                ${(activeCourse?.id === c.id)
                                  ? 'border-brand-500/50 bg-brand-500/10 text-white'
                                  : 'border-surface-600 hover:border-slate-500 text-slate-300'}`}
                  >
                    <span className="text-lg flex-shrink-0">{c.icon}</span>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{c.title}</p>
                      <p className="text-[10px] text-slate-500">
                        {c.lessonIds.length} lessons · {c.totalXP} XP
                      </p>
                    </div>
                    {activeCourse?.id === c.id && (
                      <svg className="w-4 h-4 text-brand-400 flex-shrink-0 ml-auto" fill="none"
                           viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">🔒</div>
                <p className="text-sm text-slate-400 mb-1">No courses completed yet</p>
                <p className="text-xs text-slate-500">
                  Complete all lessons in a course to unlock its certificate.
                </p>
                <Link to="/windows-server-2025" className="btn-primary text-xs mt-4">
                  Start a Course
                </Link>
              </div>
            )}
          </div>

          {/* Progress towards certificates */}
          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              Course Progress
            </p>
            <div className="space-y-2">
              {COURSES.map(c => {
                const done = c.lessonIds.filter(id => completedLessons.includes(id)).length
                const pct  = Math.round(done / c.lessonIds.length * 100)
                return (
                  <div key={c.id} className="flex items-center gap-2">
                    <span className="text-base flex-shrink-0">{c.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-[11px] text-slate-400 truncate">{c.title}</span>
                        <span className="text-[11px] font-mono text-slate-500 flex-shrink-0 ml-2">
                          {done}/{c.lessonIds.length}
                        </span>
                      </div>
                      <div className="h-1 bg-surface-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500
                                       ${pct === 100
                                         ? 'bg-accent-green'
                                         : 'bg-gradient-to-r from-brand-500 to-accent-cyan'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    {pct === 100 && (
                      <span className="text-accent-green text-sm flex-shrink-0">✓</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Print button */}
          <button
            onClick={handlePrint}
            disabled={!activeCourse || !name.trim()}
            className="btn-primary w-full justify-center disabled:opacity-40
                       disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {!name.trim() ? 'Enter your name first' : !activeCourse ? 'Select a course' : 'Print Certificate'}
          </button>
        </div>

        {/* ── Certificate preview ── */}
        <div className="lg:col-span-2">
          {activeCourse ? (
            <>
              <CertificateCard
                name={name || 'Your Name'}
                course={activeCourse}
                xp={totalXP}
                level={level.title}
                badges={earnedBadges.length}
                certId={certId}
              />
              {!name.trim() && (
                <p className="text-center text-xs text-slate-500 mt-3">
                  ← Enter your name on the left to personalise the certificate
                </p>
              )}
            </>
          ) : (
            <div className="card p-16 text-center h-full flex flex-col items-center
                            justify-center gap-4">
              <div className="text-5xl">🎓</div>
              <h3 className="text-lg font-bold text-white">Complete a Course First</h3>
              <p className="text-slate-400 text-sm max-w-sm">
                Finish all lessons in any course to unlock its certificate.
                Start with Windows Server 2025 — 12 lessons, 1,090 XP.
              </p>
              <Link to="/windows-server-2025" className="btn-primary mt-2">
                Start Windows Server 2025 →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Print styles: show only the certificate ── */}
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          header, footer, nav { display: none !important; }
          #certificate {
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100vh !important;
            border-radius: 0 !important;
            border: 2px solid #94a3b8 !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  )
}
