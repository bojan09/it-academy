import React from 'react'
import { Link } from 'react-router-dom'

/**
 * PlatformProgress — compact visual showing completion across all courses.
 * Used on the Dashboard above the per-course breakdown.
 */
const ALL_COURSES = [
  { id:'windows-server-2025', label:'WS 2025',      icon:'🖥️', href:'/windows-server-2025', color:'#6366f1', ids:['ws2025-01','ws2025-02','ws2025-03','ws2025-04','ws2025-05','ws2025-06','ws2025-07','ws2025-08','ws2025-09','ws2025-10','ws2025-11','ws2025-12'] },
  { id:'linux',               label:'Linux',         icon:'🐧', href:'/linux',               color:'#10b981', ids:['linux-01','linux-02','linux-03','linux-04','linux-05','linux-06','linux-07','linux-08','linux-09','linux-10'] },
  { id:'cybersecurity',       label:'Cybersecurity', icon:'🛡️', href:'/cybersecurity',       color:'#ef4444', ids:['sec-01','sec-02','sec-03','sec-04','sec-05','sec-06','sec-07','sec-08','sec-09','sec-10'] },
  { id:'devops',              label:'DevOps',        icon:'🔧', href:'/devops',              color:'#a78bfa', ids:['devops-01','devops-02','devops-03','devops-04','devops-05','devops-06','devops-07','devops-08'] },
  { id:'networking',          label:'Networking',    icon:'🌐', href:'/networking',          color:'#22d3ee', ids:['net-01','net-02','net-03','net-04','net-05','net-06','net-07','net-08'] },
  { id:'python',              label:'Python',        icon:'🐍', href:'/python',              color:'#fbbf24', ids:['py-01','py-02','py-03','py-04','py-05','py-06','py-07','py-08','py-09'] },
  { id:'powershell',          label:'PowerShell',    icon:'⚡', href:'/powershell',          color:'#818cf8', ids:['ps-01','ps-02','ps-03','ps-04','ps-05','ps-06','ps-07','ps-08'] },
  { id:'troubleshooting',     label:'Troubleshoot',  icon:'🔬', href:'/troubleshooting',     color:'#fb923c', ids:['trouble-01','trouble-02','trouble-03','trouble-04','trouble-05','trouble-06'] },
  { id:'windows',             label:'Windows',       icon:'🪟', href:'/windows',             color:'#38bdf8', ids:['win-01','win-02','win-03','win-04','win-05','win-06'] },
  { id:'unix',                label:'Unix',          icon:'🖤', href:'/unix',                color:'#94a3b8', ids:['unix-01','unix-02','unix-03','unix-04','unix-05'] },
]

const TOTAL = ALL_COURSES.reduce((s, c) => s + c.ids.length, 0)

export default function PlatformProgress({ completedLessons = [] }) {
  const done       = completedLessons.length
  const overallPct = Math.round((done / TOTAL) * 100)
  const completed  = ALL_COURSES.filter(c => c.ids.every(id => completedLessons.includes(id))).length

  return (
    <div className="card p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">
            Platform Overview
          </p>
          <p className="text-white font-bold text-sm">
            {done} / {TOTAL} lessons &nbsp;·&nbsp;
            <span className="text-accent-green">{completed} / {ALL_COURSES.length} courses complete</span>
          </p>
        </div>
        <div className="text-3xl font-black font-mono text-white tabular-nums">
          {overallPct}<span className="text-slate-500 text-lg">%</span>
        </div>
      </div>

      {/* Master progress bar */}
      <div className="h-2 rounded-full bg-surface-700 overflow-hidden mb-5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 via-accent-cyan to-accent-green transition-all duration-1000"
          style={{ width: `${overallPct}%` }}
        />
      </div>

      {/* Per-course mini bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
        {ALL_COURSES.map(c => {
          const d   = c.ids.filter(id => completedLessons.includes(id)).length
          const pct = Math.round((d / c.ids.length) * 100)
          const done100 = pct === 100
          return (
            <Link key={c.id} to={c.href} className="group flex items-center gap-2.5 min-w-0">
              <span className="text-base flex-shrink-0">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-medium truncate transition-colors
                                    ${done100 ? 'text-accent-green' : 'text-slate-400 group-hover:text-white'}`}>
                    {c.label}
                  </span>
                  <span className={`text-[10px] font-mono ml-2 flex-shrink-0
                                    ${done100 ? 'text-accent-green' : 'text-slate-600'}`}>
                    {done100 ? '✓ Done' : `${d}/${c.ids.length}`}
                  </span>
                </div>
                <div className="h-1 rounded-full bg-surface-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: done100 ? '#4ade80' : c.color }}
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
