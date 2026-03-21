import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProgress, getLevelForXP } from '../hooks/useProgress.js'

const COURSES = [
  { id:'windows-server-2025', icon:'🖥️', title:'Windows Server 2025', description:'Active Directory, DHCP, DNS, Group Policy, Hyper-V, RDS, backup, and server hardening.', href:'/windows-server-2025', totalXP:1090, lessonCount:12, readTime:'~6 hrs', badge:'Most Popular', badgeColor:'bg-brand-500/20 text-brand-300 border-brand-500/30', accent:'from-brand-500 to-brand-700', category:'server', lessonIds:['ws2025-01','ws2025-02','ws2025-03','ws2025-04','ws2025-05','ws2025-06','ws2025-07','ws2025-08','ws2025-09','ws2025-10','ws2025-11','ws2025-12'] },
  { id:'linux', icon:'🐧', title:'Linux Fundamentals', description:'Shell mastery, filesystem, permissions, systemd, networking, SSH, firewall, disk, and hardening.', href:'/linux', totalXP:760, lessonCount:10, readTime:'~5 hrs', badge:null, accent:'from-emerald-500 to-emerald-700', category:'os', lessonIds:['linux-01','linux-02','linux-03','linux-04','linux-05','linux-06','linux-07','linux-08','linux-09','linux-10'] },
  { id:'cybersecurity', icon:'🛡️', title:'Cybersecurity', description:'CIA triad, hardening, firewalls, PKI/TLS, IDS/SIEM, vulnerability scanning, and AD security.', href:'/cybersecurity', totalXP:900, lessonCount:10, readTime:'~7 hrs', badge:'High Demand', badgeColor:'bg-accent-red/10 text-accent-red border-accent-red/20', accent:'from-accent-red to-red-700', category:'security', lessonIds:['sec-01','sec-02','sec-03','sec-04','sec-05','sec-06','sec-07','sec-08','sec-09','sec-10'] },
  { id:'devops', icon:'🔧', title:'DevOps', description:'Docker, CI/CD, Terraform, Ansible, Kubernetes, and Prometheus & Grafana monitoring.', href:'/devops', totalXP:750, lessonCount:8, readTime:'~8 hrs', badge:'Career Booster', badgeColor:'bg-accent-purple/10 text-accent-purple border-accent-purple/20', accent:'from-accent-purple to-purple-700', category:'devops', lessonIds:['devops-01','devops-02','devops-03','devops-04','devops-05','devops-06','devops-07','devops-08'] },
  { id:'networking', icon:'🌐', title:'Network Fundamentals', description:'OSI model, TCP/IP, subnetting, VLANs, routing, DNS, wireless, and troubleshooting.', href:'/networking', totalXP:620, lessonCount:8, readTime:'~4 hrs', badge:null, accent:'from-accent-cyan to-cyan-700', category:'networking', lessonIds:['net-01','net-02','net-03','net-04','net-05','net-06','net-07','net-08'] },
  { id:'python', icon:'🐍', title:'Python for SysAdmins', description:'Automation, subprocess, network scripts, log parsing, monitoring, Ansible, and CLI tools.', href:'/python', totalXP:730, lessonCount:9, readTime:'~5 hrs', badge:null, accent:'from-yellow-500 to-yellow-700', category:'scripting', lessonIds:['py-01','py-02','py-03','py-04','py-05','py-06','py-07','py-08','py-09'] },
  { id:'powershell', icon:'⚡', title:'PowerShell', description:'Pipeline, scripting, AD management, remoting, DSC, filesystem, registry, and reporting.', href:'/powershell', totalXP:630, lessonCount:8, readTime:'~4 hrs', badge:null, accent:'from-brand-400 to-indigo-700', category:'scripting', lessonIds:['ps-01','ps-02','ps-03','ps-04','ps-05','ps-06','ps-07','ps-08'] },
  { id:'troubleshooting', icon:'🔬', title:'Troubleshooting', description:'Structured methodology for Windows, Linux, networking, Active Directory, and performance.', href:'/troubleshooting', totalXP:480, lessonCount:6, readTime:'~3 hrs', badge:null, accent:'from-accent-amber to-orange-700', category:'ops', lessonIds:['trouble-01','trouble-02','trouble-03','trouble-04','trouble-05','trouble-06'] },
  { id:'windows', icon:'🪟', title:'Windows Desktop', description:'Architecture, user permissions, registry, processes, networking, and event viewer & logging.', href:'/windows', totalXP:380, lessonCount:6, readTime:'~3 hrs', badge:null, accent:'from-sky-400 to-sky-700', category:'os', lessonIds:['win-01','win-02','win-03','win-04','win-05','win-06'] },
  { id:'unix', icon:'🖥️', title:'Unix Systems', description:'Unix philosophy, POSIX shell scripting, BSD systems, permissions, and process management.', href:'/unix', totalXP:330, lessonCount:5, readTime:'~3 hrs', badge:null, accent:'from-slate-400 to-slate-600', category:'os', lessonIds:['unix-01','unix-02','unix-03','unix-04','unix-05'] },
]

const TOTAL_LESSONS = COURSES.reduce((s, c) => s + c.lessonCount, 0)
const TOTAL_XP      = COURSES.reduce((s, c) => s + c.totalXP, 0)

const CATEGORIES = [
  { id:'all', label:'All Courses' },
  { id:'server', label:'Server' },
  { id:'os', label:'OS & Desktop' },
  { id:'security', label:'Security' },
  { id:'devops', label:'DevOps' },
  { id:'networking', label:'Networking' },
  { id:'scripting', label:'Scripting' },
  { id:'ops', label:'Operations' },
]

const FEATURES = [
  { icon:'🧪', title:'VMware Lab Exercises', desc:'Every lesson includes hands-on exercises on real virtual machines — not toy examples.' },
  { icon:'🏆', title:'XP & Achievements', desc:'Earn XP and unlock badges as you complete lessons and pass quizzes.' },
  { icon:'🔒', title:'Sequential Unlocking', desc:'Lessons unlock as you complete them — building real knowledge layer by layer.' },
  { icon:'📊', title:'Progress Tracking', desc:'Your progress is saved locally. Pick up exactly where you left off.' },
  { icon:'📖', title:'Glossary Engine', desc:'Key terms highlighted throughout lessons with instant tooltip definitions on hover.' },
  { icon:'📋', title:'Cheat Sheets', desc:'Command references, port tables, and troubleshooting guides always a click away.' },
]

function ProgressPill({ completed, total }) {
  const pct = Math.round((completed / total) * 100)
  if (completed === 0) return null
  const color = pct === 100 ? 'from-accent-green to-emerald-400' : 'from-brand-500 to-brand-400'
  return (
    <div className="mt-3">
      <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-mono">
        <span>{completed}/{total} lessons</span><span>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-700 overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
             style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function CourseCard({ course, completedLessons }) {
  const completed  = course.lessonIds.filter(id => completedLessons.includes(id)).length
  const total      = course.lessonIds.length
  const isComplete = completed === total && total > 0
  return (
    <Link to={course.href}
      className="course-card block group relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
      aria-label={`${course.title} — ${total} lessons`}>
      <div className={`course-card-accent bg-gradient-to-r ${course.accent}`} />
      <div className="pt-4 pb-5 px-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-2xl leading-none">{course.icon}</span>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {isComplete && <span className="tag text-[10px] bg-accent-green/10 text-accent-green border-accent-green/20 py-0.5">✓ Complete</span>}
            {course.badge && !isComplete && <span className={`tag text-[10px] border ${course.badgeColor} py-0.5`}>{course.badge}</span>}
          </div>
        </div>
        <h3 className="font-bold text-white text-sm leading-snug mb-1.5 group-hover:text-brand-300 transition-colors">{course.title}</h3>
        <p className="text-slate-400 text-[12px] leading-relaxed line-clamp-2 mb-3">{course.description}</p>
        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
          <span>{course.lessonCount} lessons</span>
          <span className="text-slate-700">·</span>
          <span>{course.readTime}</span>
          <span className="text-slate-700">·</span>
          <span className="text-accent-amber">{course.totalXP} XP</span>
        </div>
        <ProgressPill completed={completed} total={total} />
      </div>
    </Link>
  )
}

export default function Home() {
  const { progress } = useProgress()
  const completedLessons = progress?.completedLessons ?? []
  const xp               = progress?.xp ?? 0
  const level            = getLevelForXP(xp)
  const completedCount   = completedLessons.length
  const overallPct       = Math.round((completedCount / TOTAL_LESSONS) * 100)
  const hasStarted       = completedCount > 0

  const [activeCategory, setActiveCategory] = useState('all')

  const filteredCourses = useMemo(() =>
    activeCategory === 'all' ? COURSES : COURSES.filter(c => c.category === activeCategory),
    [activeCategory])

  const spotlightCourses = COURSES.filter(c =>
    ['windows-server-2025','cybersecurity','devops','linux'].includes(c.id))

  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-surface-700/50">
        <div className="absolute inset-0 pointer-events-none select-none" style={{ backgroundImage:'linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)', backgroundSize:'40px 40px' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-24 sm:pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 mb-6 fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span className="text-xs font-semibold text-brand-300 tracking-wide">
              {TOTAL_LESSONS} lessons · 10 complete courses · Production-quality IT training
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4 fade-up" style={{ animationDelay:'60ms' }}>
            Master Enterprise IT.<br />
            <span className="bg-gradient-to-r from-brand-400 to-accent-cyan bg-clip-text text-transparent">Learn by doing.</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-8 fade-up" style={{ animationDelay:'120ms' }}>
            A complete SysAdmin learning platform with hands-on VMware labs, XP progression, and real-world scenarios — covering Windows Server, Linux, Cybersecurity, DevOps, and more.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-10 fade-up" style={{ animationDelay:'180ms' }}>
            <Link to={hasStarted ? '/dashboard' : '/windows-server-2025/intro'} className="btn-primary">
              {hasStarted ? 'Resume Learning →' : 'Start for Free →'}
            </Link>
            <Link to="/dashboard" className="btn-secondary">
              {hasStarted ? 'View Progress' : 'Browse All Courses'}
            </Link>
          </div>

          {/* Platform stats strip */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-4 border-t border-b border-surface-700/40 fade-up" style={{ animationDelay:'240ms' }}>
            {[
              { v:`${TOTAL_LESSONS}`, l:'Lessons', i:'📚' },
              { v:'10', l:'Courses', i:'🗂️' },
              { v:TOTAL_XP.toLocaleString(), l:'Total XP Available', i:'⭐' },
              { v:'82', l:'Lab Exercises', i:'🧪' },
            ].map(s => (
              <div key={s.l} className="text-center px-2">
                <div className="text-lg sm:text-xl font-black text-white font-mono">{s.i} {s.v}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-widest">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Personal progress strip — only shown when user has started */}
          {hasStarted && (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 fade-up" style={{ animationDelay:'300ms' }}>
              {[
                { v:completedCount, l:'Lessons Done', c:'text-brand-300' },
                { v:xp, l:'XP Earned', c:'text-accent-amber' },
                { v:`${overallPct}%`, l:'Overall Progress', c:'text-accent-green' },
                { v:level.name, l:'Current Level', c:'text-accent-purple' },
              ].map(s => (
                <div key={s.l} className="card py-3 px-4 text-center">
                  <p className={`text-lg font-black font-mono ${s.c}`}>{s.v}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SPOTLIGHT ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-6">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest font-mono mb-1">Most popular</p>
            <h2 className="section-title">Start here</h2>
          </div>
          <Link to="/dashboard" className="btn-ghost text-sm">All courses →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {spotlightCourses.map((course, i) => (
            <div key={course.id} className="fade-up" style={{ animationDelay:`${i * 60}ms` }}>
              <CourseCard course={course} completedLessons={completedLessons} />
            </div>
          ))}
        </div>
      </section>

      {/* ── ALL COURSES + FILTER TABS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono mb-1">Complete library</p>
            <h2 className="section-title">All Learning Paths</h2>
          </div>
          <p className="text-slate-500 text-xs font-mono">
            {filteredCourses.length} courses · {filteredCourses.reduce((s,c) => s + c.lessonCount, 0)} lessons
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150',
                activeCategory === cat.id
                  ? 'bg-brand-500/20 text-brand-300 border-brand-500/40'
                  : 'bg-surface-800 text-slate-400 border-surface-700 hover:border-surface-600 hover:text-slate-300',
              ].join(' ')}>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCourses.map((course, i) => (
            <div key={course.id} className="fade-up" style={{ animationDelay:`${i * 50}ms` }}>
              <CourseCard course={course} completedLessons={completedLessons} />
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="border-t border-surface-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono text-center mb-2">What makes this different</p>
          <h2 className="section-title text-center mb-2">Built for real sysadmins</h2>
          <p className="text-slate-400 text-sm text-center mb-10 max-w-xl mx-auto leading-relaxed">
            Every lesson includes VMware lab exercises, real-world scenarios, and commands you'll use on the job — not toy examples.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="card p-6 fade-up" style={{ animationDelay:`${i * 80}ms` }}>
                <span className="text-3xl mb-3 block">{f.icon}</span>
                <h3 className="font-bold text-white text-sm mb-1.5">{f.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUICK ACCESS ── */}
      <section className="border-t border-surface-700/50 bg-surface-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="section-title mb-6">Quick Access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href:'/cheatsheets',  icon:'📋', label:'Cheat Sheets',  desc:'Command references' },
              { href:'/glossary',     icon:'📖', label:'Glossary',      desc:'70+ IT definitions' },
              { href:'/it-models',    icon:'🗂️', label:'IT Models',     desc:'OSI, ITIL, CIA…' },
              { href:'/port-lookup',  icon:'🔌', label:'Port Lookup',   desc:'Common port numbers' },
              { href:'/vmware-setup', icon:'🖥️', label:'VMware Setup',  desc:'Lab environment guide' },
              { href:'/dashboard',    icon:'📊', label:'Dashboard',     desc:'Progress & badges' },
              { href:'/certificate',  icon:'🏅', label:'Certificates',  desc:'Course completion' },
              { href:'/search',       icon:'🔍', label:'Search',        desc:'Find any lesson' },
            ].map(t => (
              <Link key={t.href} to={t.href}
                className="card p-4 flex flex-col gap-2 hover:border-brand-600/40 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
                <span className="text-2xl">{t.icon}</span>
                <div>
                  <p className="font-semibold text-white text-sm group-hover:text-brand-300 transition-colors">{t.label}</p>
                  <p className="text-slate-500 text-[11px] font-mono">{t.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <section className="border-t border-surface-700/50">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
            {hasStarted ? 'Keep the momentum going.' : 'Ready to level up?'}
          </h2>
          <p className="text-slate-400 mb-6 text-sm leading-relaxed max-w-lg mx-auto">
            {hasStarted
              ? `You've completed ${completedCount} lessons and earned ${xp} XP. The next lesson is waiting.`
              : 'Start with Windows Server 2025 — the most in-demand enterprise skill — or jump to whichever topic you need right now.'}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to={hasStarted ? '/dashboard' : '/windows-server-2025/intro'} className="btn-primary">
              {hasStarted ? 'Resume Learning →' : 'Start for Free →'}
            </Link>
            <Link to="/dashboard" className="btn-secondary">
              {hasStarted ? 'View Progress' : 'Browse All Courses'}
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
