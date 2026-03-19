import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import LessonCard from '../components/LessonCard.jsx'
import ProgressBar from '../components/ProgressBar.jsx'

// ─── Learning path data ───────────────────────────────────────────────────────
const LEARNING_PATHS = [
  {
    icon: '🖥️',
    title: 'Windows Server 2025',
    description: 'Active Directory, Group Policy, DHCP, DNS, Hyper-V and enterprise administration.',
    href: '/windows-server-2025',
    xp: 500,
    lessonCount: 12,
    readTime: '~6 hrs',
    progress: 0,
  },
  {
    icon: '🐧',
    title: 'Linux Fundamentals',
    description: 'Shell mastery, file system, permissions, networking, and server hardening.',
    href: '/linux',
    xp: 350,
    lessonCount: 10,
    readTime: '~5 hrs',
    progress: 0,
  },
  {
    icon: '🌐',
    title: 'Network Fundamentals',
    description: 'TCP/IP, subnetting, VLANs, routing protocols, and network troubleshooting.',
    href: '/networking',
    xp: 400,
    lessonCount: 8,
    readTime: '~4 hrs',
    progress: 0,
  },
  {
    icon: '🛡️',
    title: 'Cybersecurity',
    description: 'Threat modeling, hardening, firewalls, intrusion detection, and incident response.',
    href: '/cybersecurity',
    xp: 600,
    lessonCount: 14,
    readTime: '~7 hrs',
    progress: 0,
  },
  {
    icon: '🐍',
    title: 'Python for SysAdmins',
    description: 'Automation scripts, API integration, monitoring tools, and infrastructure as code.',
    href: '/python',
    xp: 450,
    lessonCount: 9,
    readTime: '~5 hrs',
    progress: 0,
  },
  {
    icon: '⚡',
    title: 'PowerShell',
    description: 'Scripting, automation, Active Directory management, and remote administration.',
    href: '/powershell',
    xp: 380,
    lessonCount: 8,
    readTime: '~4 hrs',
    progress: 0,
  },
  {
    icon: '🔧',
    title: 'DevOps',
    description: 'CI/CD pipelines, Docker, Kubernetes, Terraform, and infrastructure automation.',
    href: '/devops',
    xp: 700,
    lessonCount: 16,
    readTime: '~8 hrs',
    progress: 0,
  },
  {
    icon: '🔍',
    title: 'Troubleshooting',
    description: 'Systematic diagnostic methodology for Windows, Linux, network, and application issues.',
    href: '/troubleshooting',
    xp: 300,
    lessonCount: 6,
    readTime: '~3 hrs',
    progress: 0,
  },
]

const STATS = [
  { value: '15+', label: 'Learning Paths' },
  { value: '80+', label: 'Lessons' },
  { value: '500+', label: 'Lab Exercises' },
  { value: '100%', label: 'Free to Start' },
]

const FEATURES = [
  {
    icon: '🧪',
    title: 'Real VMware Labs',
    desc: 'Every lesson ships with hands-on VMware exercises. No theory without practice.',
  },
  {
    icon: '🏆',
    title: 'XP & Level System',
    desc: 'Earn XP to level up from Junior SysAdmin to Infrastructure Pro. Six levels total.',
  },
  {
    icon: '🔐',
    title: 'Progressive Unlocking',
    desc: 'Structured learning paths. Each lesson unlocks when the previous one is mastered.',
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    desc: 'Track every lesson, quiz score, and completion rate. All stored locally — no account needed.',
  },
  {
    icon: '📖',
    title: 'Glossary Tooltips',
    desc: 'Hover over any technical term to see a clear, contextual definition inline.',
  },
  {
    icon: '📋',
    title: 'Printable Cheat Sheets',
    desc: 'Quick-reference command sheets for Linux, PowerShell, networking. Print-optimised.',
  },
  {
    icon: '⌘',
    title: 'Command Palette',
    desc: 'Press Cmd+K to instantly jump to any lesson, topic, or glossary term across the platform.',
  },
  {
    icon: '🔥',
    title: 'Daily Streak',
    desc: 'Build a learning habit. Track consecutive study days and earn streak badges.',
  },
  {
    icon: '🔌',
    title: 'Port & Protocol Lookup',
    desc: 'Search any port number — get the service, risk level, security notes, and the check command.',
  },
]

const TOOLS = [
  { icon: '🔌', label: 'Port Lookup',       href: '/port-lookup',   desc: 'Search 35+ ports & protocols' },
  { icon: '🧪', label: 'VMware Lab Setup',  href: '/vmware-setup',  desc: 'Step-by-step environment guide' },
  { icon: '📋', label: 'Cheat Sheets',      href: '/cheatsheets',   desc: 'Linux, PowerShell, Networking' },
  { icon: '🔍', label: 'Troubleshooting',   href: '/troubleshooting',desc: 'Systematic diagnostic steps' },
]

// ─── Hero terminal animation ─────────────────────────────────────────────────
const TERMINAL_LINES = [
  { text: '$ ssh admin@server01.lab.local', delay: 0 },
  { text: 'Connected to server01 — Windows Server 2025', delay: 800, color: 'text-accent-green' },
  { text: '$ Get-ADUser -Filter * | Select Name', delay: 1600 },
  { text: 'Retrieving Active Directory users...', delay: 2400, color: 'text-accent-cyan' },
  { text: 'CN=Administrator, DC=lab, DC=local', delay: 3200, color: 'text-slate-300' },
  { text: 'CN=sysadmin, DC=lab, DC=local', delay: 3600, color: 'text-slate-300' },
  { text: '$ _', delay: 4200, blink: true },
]

function TerminalWindow() {
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    TERMINAL_LINES.forEach((line, i) => {
      setTimeout(() => setVisibleLines(i + 1), line.delay + 400)
    })
  }, [])

  return (
    <div className="w-full max-w-lg bg-surface-900 rounded-2xl border border-surface-600
                    shadow-card-lg overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-surface-800 border-b border-surface-700">
        <div className="w-3 h-3 rounded-full bg-accent-red/70" />
        <div className="w-3 h-3 rounded-full bg-accent-amber/70" />
        <div className="w-3 h-3 rounded-full bg-accent-green/70" />
        <span className="ml-2 text-xs font-mono text-slate-500">terminal — ssh session</span>
      </div>
      {/* Body */}
      <div className="p-4 min-h-[180px] font-mono text-sm space-y-1">
        {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
          <div
            key={i}
            className={`${line.color || 'text-slate-300'} leading-relaxed
                        ${line.blink ? 'animate-pulse' : ''}`}
          >
            {line.text}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ children, className = '' }) {
  return (
    <section className={`px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </section>
  )
}

// ─── Home page ────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center
                          px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950" />
        <div className="absolute inset-0 bg-dot-pattern opacity-100" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-10 w-64 h-64 bg-accent-cyan/5 rounded-full
                        blur-[80px] pointer-events-none animate-float" />

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — copy */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                              bg-brand-500/10 border border-brand-500/20 text-brand-300
                              text-xs font-semibold mb-6 animate-fade-up">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                Production-Quality IT Training — Free Beta
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6
                             animate-fade-up animate-delay-100">
                <span className="text-white">Master IT</span><br />
                <span className="gradient-text">Infrastructure</span><br />
                <span className="text-white">Like a Pro</span>
              </h1>

              <p className="text-slate-400 text-lg sm:text-xl leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0
                            animate-fade-up animate-delay-200">
                Hands-on labs, real VMware exercises, progressive lesson unlocking,
                and an XP system that rewards every step forward.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start
                              gap-3 mb-10 animate-fade-up animate-delay-300">
                <Link to="/windows-server-2025" className="btn-primary text-base px-6 py-3 w-full sm:w-auto justify-center">
                  Start with Windows Server 2025
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link to="/linux" className="btn-secondary text-base px-6 py-3 w-full sm:w-auto justify-center">
                  Explore All Paths
                </Link>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-up animate-delay-400">
                {STATS.map((s) => (
                  <div key={s.label} className="text-center lg:text-left">
                    <div className="text-2xl font-extrabold gradient-text">{s.value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — terminal */}
            <div className="flex justify-center lg:justify-end animate-fade-up animate-delay-300">
              <TerminalWindow />
            </div>
          </div>
        </div>
      </section>

      {/* ── LEARNING PATHS ────────────────────────────────────────── */}
      <Section className="py-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">
              Learning Paths
            </p>
            <h2 className="section-title">Choose Your Path</h2>
            <p className="text-slate-400 mt-2 text-sm max-w-lg">
              Structured courses built for real-world sysadmin and DevOps work. Start anywhere.
            </p>
          </div>
          <Link to="/linux" className="btn-ghost text-sm flex-shrink-0">
            View all paths →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {LEARNING_PATHS.map((path) => (
            <LessonCard key={path.title} {...path} />
          ))}
        </div>
      </Section>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <Section className="py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">
            Platform Features
          </p>
          <h2 className="section-title">Built for Working Professionals</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm">
            Every feature is designed around how real IT teams learn and operate.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="card p-6 group">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-200 w-fit">
                {f.icon}
              </div>
              <h3 className="font-semibold text-white mb-2 text-[15px]">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── SAMPLE LAB PREVIEW ────────────────────────────────────── */}
      <Section className="py-20">
        <div className="card-glass rounded-2xl overflow-hidden border border-brand-500/10">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left */}
            <div className="p-8 lg:p-12">
              <span className="badge bg-brand-500/10 text-brand-300 border border-brand-500/20 mb-4">
                🧪 Lab Preview
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
                Real VMware Lab Exercises
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Every lesson ends with a hands-on VMware lab. Follow step-by-step instructions,
                run real commands, and see real output — just like a production environment.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Step-by-step VMware instructions',
                  'Real commands with expected output',
                  'Production-accurate sysadmin scenarios',
                  'Checkpoint quizzes after each lab',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                    <svg className="w-4 h-4 text-accent-green flex-shrink-0" fill="none"
                         viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/windows-server-2025" className="btn-primary">
                Try a Lab Exercise
              </Link>
            </div>

            {/* Right — mini code block */}
            <div className="bg-surface-900 p-8 lg:p-12 border-t lg:border-t-0 lg:border-l border-surface-700">
              <div className="text-xs font-mono text-slate-500 mb-3 uppercase tracking-widest">
                Lab 3 — Active Directory Setup
              </div>
              <div className="code-block text-xs leading-6 space-y-1">
                <div><span className="text-slate-500"># Step 1: Install AD DS role</span></div>
                <div><span className="text-accent-cyan">Install-WindowsFeature</span> <span className="text-accent-amber">-Name</span> AD-Domain-Services <span className="text-accent-amber">-IncludeManagementTools</span></div>
                <div className="mt-2"><span className="text-slate-500"># Step 2: Promote to Domain Controller</span></div>
                <div><span className="text-accent-cyan">Install-ADDSForest</span> \</div>
                <div className="ml-4"><span className="text-accent-amber">-DomainName</span> <span className="text-accent-green">"lab.local"</span> \</div>
                <div className="ml-4"><span className="text-accent-amber">-DomainNetBIOSName</span> <span className="text-accent-green">"LAB"</span> \</div>
                <div className="ml-4"><span className="text-accent-amber">-InstallDNS</span> <span className="text-accent-amber">-Force</span></div>
                <div className="mt-2 text-accent-green">✔ Domain controller promoted successfully</div>
                <div className="text-slate-500">Restarting in 10 seconds...</div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── TOOLS ROW ─────────────────────────────────────────────── */}
      <Section className="py-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">
              Quick Tools
            </p>
            <h2 className="section-title">Reference Tools</h2>
            <p className="text-slate-400 mt-2 text-sm">Practical utilities you'll use every day on the job.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOOLS.map(tool => (
            <Link key={tool.label} to={tool.href}
                  className="card p-5 group flex flex-col gap-3">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200 w-fit">
                {tool.icon}
              </span>
              <div>
                <p className="font-semibold text-white text-sm group-hover:text-brand-300 transition-colors">
                  {tool.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{tool.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ── CTA BANNER ────────────────────────────────────────────── */}
      <Section className="py-20">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br
                        from-brand-600 via-brand-700 to-brand-900 p-10 lg:p-16 text-center">
          <div className="absolute inset-0 bg-dot-pattern opacity-50" />
          <div className="relative z-10">
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Ready to level up?
            </h2>
            <p className="text-brand-200 text-lg mb-8 max-w-xl mx-auto">
              Start with Windows Server 2025 — the most in-demand enterprise skill in 2025.
            </p>
            <Link to="/windows-server-2025"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white
                             text-brand-700 font-bold text-base hover:bg-brand-50
                             transition-all duration-200 shadow-card hover:shadow-card-lg active:scale-95">
              Begin Windows Server 2025 →
            </Link>
          </div>
        </div>
      </Section>

    </div>
  )
}
