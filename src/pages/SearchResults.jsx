import React, { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb.jsx'
import { GLOSSARY_DATA } from '../data/glossary.js'

// ─── Full searchable content index ───────────────────────────────────────────
const CONTENT_INDEX = [
  // ── Course pages ──
  { type: 'course', title: 'Windows Server 2025',  href: '/windows-server-2025', icon: '🖥️', desc: 'Active Directory, Group Policy, DHCP, DNS, Hyper-V and enterprise administration.' },
  { type: 'course', title: 'Linux Fundamentals',   href: '/linux',               icon: '🐧', desc: 'Shell mastery, file system, permissions, networking, and server hardening.' },
  { type: 'course', title: 'Network Fundamentals', href: '/networking',          icon: '🌐', desc: 'TCP/IP, subnetting, VLANs, routing protocols, and network troubleshooting.' },
  { type: 'course', title: 'Cybersecurity',        href: '/cybersecurity',       icon: '🛡️', desc: 'Threat modelling, hardening, firewalls, intrusion detection, and incident response.' },
  { type: 'course', title: 'Python for SysAdmins', href: '/python',              icon: '🐍', desc: 'Automation scripts, API integration, monitoring tools, and infrastructure as code.' },
  { type: 'course', title: 'PowerShell',           href: '/powershell',          icon: '⚡', desc: 'Scripting, automation, Active Directory management, and remote administration.' },
  { type: 'course', title: 'DevOps',               href: '/devops',              icon: '🔧', desc: 'CI/CD pipelines, Docker, Kubernetes, Terraform, and infrastructure automation.' },
  { type: 'course', title: 'Troubleshooting',      href: '/troubleshooting',     icon: '🔍', desc: 'Systematic diagnostic methodology for Windows, Linux, network, and application issues.' },
  { type: 'course', title: 'Unix',                 href: '/unix',                icon: '🔩', desc: 'POSIX, BSD, Solaris — the roots of modern computing.' },
  { type: 'course', title: 'Windows Desktop',      href: '/windows',             icon: '💻', desc: 'Windows OS fundamentals, Registry, users, permissions, and networking.' },

  // ── Lessons ──
  { type: 'lesson', title: 'Active Directory & Domain Services', href: '/windows-server-2025/active-directory', icon: '🏢', desc: 'Deploy AD DS, promote a domain controller, create OUs, users, and groups. LDAP, Kerberos, SYSVOL.', tags: ['active directory', 'ad ds', 'domain controller', 'ldap', 'kerberos', 'windows server'] },
  { type: 'lesson', title: 'DHCP Server Configuration',          href: '/windows-server-2025/dhcp',             icon: '📡', desc: 'DORA handshake, scopes, reservations, exclusions, failover, and troubleshooting.', tags: ['dhcp', 'ip address', 'scope', 'windows server'] },
  { type: 'lesson', title: 'DNS Server Configuration',           href: '/windows-server-2025/dns',              icon: '🌐', desc: 'Forward/reverse zones, record types, forwarders, AD-integrated DNS, troubleshooting.', tags: ['dns', 'a record', 'ptr', 'srv', 'zone', 'windows server'] },
  { type: 'lesson', title: 'Group Policy Management',            href: '/windows-server-2025/group-policy',     icon: '🔧', desc: 'LSDOU processing, GPO creation, drive mappings, security settings, gpresult.', tags: ['group policy', 'gpo', 'lsdou', 'gpresult', 'windows server'] },
  { type: 'lesson', title: 'Hyper-V Virtualisation',             href: '/windows-server-2025/hyper-v',          icon: '⚙️', desc: 'Type-1 hypervisor, virtual switches, Generation 2 VMs, checkpoints, Dynamic Memory.', tags: ['hyper-v', 'virtualisation', 'vm', 'vhdx', 'checkpoint', 'windows server'] },
  { type: 'lesson', title: 'Windows Firewall & Security',        href: '/windows-server-2025/firewall',         icon: '🛡️', desc: 'Three profiles, inbound/outbound rules, Connection Security Rules, GPO deployment.', tags: ['firewall', 'windows firewall', 'security', 'rules', 'windows server'] },
  { type: 'lesson', title: 'Linux File System Hierarchy',        href: '/linux/filesystem',                     icon: '📁', desc: 'FHS standard, /etc, /var, /proc, /sys, hard and symbolic links, disk usage.', tags: ['linux', 'filesystem', 'fhs', '/etc', '/var', 'ln', 'symlink'] },
  { type: 'lesson', title: 'Linux Networking',                   href: '/linux/networking',                     icon: '🌐', desc: 'ip command, Netplan static IP, DNS resolv.conf, routing tables, tcpdump diagnostics.', tags: ['linux', 'networking', 'ip addr', 'netplan', 'ss', 'tcpdump'] },
  { type: 'lesson', title: 'SSH & Remote Access',                href: '/linux/ssh',                            icon: '🔐', desc: 'Ed25519 keys, sshd_config hardening, SSH client config, ProxyJump, fail2ban.', tags: ['ssh', 'key auth', 'sshd_config', 'fail2ban', 'linux'] },
  { type: 'lesson', title: 'Firewall with iptables & ufw',       href: '/linux/firewall',                       icon: '🛡️', desc: 'Netfilter chains, iptables rules, ufw management, rate limiting, persistence.', tags: ['iptables', 'ufw', 'firewall', 'linux', 'netfilter'] },
  { type: 'lesson', title: 'The OSI Model',                      href: '/networking/osi-model',                 icon: '📐', desc: '7 layers, protocols per layer, PDU names, troubleshooting framework.', tags: ['osi', 'layers', 'networking', 'protocols'] },
  { type: 'lesson', title: 'TCP/IP & the Internet Protocol Suite',href: '/networking/tcp-ip',                   icon: '🌐', desc: 'TCP vs UDP, three-way handshake, subnetting, CIDR, interactive calculator.', tags: ['tcp', 'udp', 'ip', 'subnetting', 'cidr', 'networking'] },
  { type: 'lesson', title: 'PowerShell Fundamentals',            href: '/powershell/fundamentals',              icon: '⚡', desc: 'Object pipeline, Get-Help, variables, operators, execution policy, first script.', tags: ['powershell', 'scripting', 'pipeline', 'get-help', 'windows'] },
  { type: 'lesson', title: 'CIA Triad & Security Models',        href: '/cybersecurity/cia-triad',              icon: '🛡️', desc: 'Confidentiality, Integrity, Availability, Zero Trust, Least Privilege, Defence in Depth.', tags: ['cia triad', 'security', 'zero trust', 'least privilege', 'defence in depth'] },
  { type: 'lesson', title: 'File System Automation (Python)',     href: '/python/filesystem',                    icon: '🐍', desc: 'pathlib, shutil, log cleanup script, disk space monitor with email alerting.', tags: ['python', 'automation', 'pathlib', 'shutil', 'scripting'] },
  { type: 'lesson', title: 'Docker Containers',                  href: '/devops/docker',                        icon: '🐳', desc: 'Images, containers, Dockerfile, docker-compose, volumes, production best practices.', tags: ['docker', 'containers', 'dockerfile', 'docker-compose', 'devops'] },

  // ── Tools ──
  { type: 'tool', title: 'Port & Protocol Lookup',  href: '/port-lookup',    icon: '🔌', desc: 'Search 35+ ports — get the service, risk level, security notes, and check command.' },
  { type: 'tool', title: 'Cheat Sheets',            href: '/cheatsheets',    icon: '📋', desc: 'Linux, PowerShell, Networking, and Troubleshooting quick-reference command guides.' },
  { type: 'tool', title: 'Glossary',                href: '/glossary',       icon: '📖', desc: '70+ IT terms defined — Windows, Linux, Networking, Security, DevOps, Scripting.' },
  { type: 'tool', title: 'VMware Lab Setup',        href: '/vmware-setup',   icon: '🧪', desc: '8-step guide to configure your VMware lab environment before starting lessons.' },
  { type: 'tool', title: 'IT Models',               href: '/it-models',      icon: '📐', desc: 'Interactive OSI, TCP/IP, ITIL, CIA Triad, Zero Trust, and DevOps Lifecycle reference.' },
  { type: 'tool', title: 'My Progress Dashboard',   href: '/dashboard',      icon: '📊', desc: 'Track XP, level, badges, streaks, course completion, and quiz history.' },
  { type: 'tool', title: 'Certificate Generator',   href: '/certificate',    icon: '🎓', desc: 'Generate a printable completion certificate for any finished course.' },
]

// Map glossary terms into search results
const GLOSSARY_RESULTS = GLOSSARY_DATA.map(g => ({
  type: 'glossary',
  title: g.term,
  href: `/glossary#${g.term.replace(/\s+/g, '-')}`,
  icon: '📖',
  desc: g.def,
  tags: [g.term.toLowerCase(), g.category.toLowerCase()],
}))

const ALL_ITEMS = [...CONTENT_INDEX, ...GLOSSARY_RESULTS]

const TYPE_STYLES = {
  course:   { label: 'Course',   color: 'bg-brand-500/10 text-brand-300 border-brand-500/20' },
  lesson:   { label: 'Lesson',   color: 'bg-accent-green/10 text-accent-green border-accent-green/20' },
  tool:     { label: 'Tool',     color: 'bg-accent-amber/10 text-accent-amber border-accent-amber/20' },
  glossary: { label: 'Glossary', color: 'bg-accent-purple/10 text-accent-purple border-accent-purple/20' },
}

const TYPE_FILTERS = ['All', 'Course', 'Lesson', 'Tool', 'Glossary']

function Highlight({ text, query }) {
  if (!query?.trim()) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-brand-500/30 text-brand-200 rounded-sm px-0.5 not-italic">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams()
  const query      = searchParams.get('q') || ''
  const typeFilter = searchParams.get('type') || 'All'

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    return ALL_ITEMS.filter(item => {
      const matchType = typeFilter === 'All' || item.type === typeFilter.toLowerCase()
      const matchQ = [item.title, item.desc, ...(item.tags || [])]
        .some(field => field?.toLowerCase().includes(q))
      return matchType && matchQ
    }).sort((a, b) => {
      // Boost exact title matches to top
      const aTitle = a.title.toLowerCase().includes(q) ? 0 : 1
      const bTitle = b.title.toLowerCase().includes(q) ? 0 : 1
      if (aTitle !== bTitle) return aTitle - bTitle
      // Then sort by type priority: lesson > course > tool > glossary
      const typePriority = { lesson: 0, course: 1, tool: 2, glossary: 3 }
      return (typePriority[a.type] ?? 4) - (typePriority[b.type] ?? 4)
    })
  }, [query, typeFilter])

  const countByType = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return {}
    return ALL_ITEMS.reduce((acc, item) => {
      const matchQ = [item.title, item.desc, ...(item.tags || [])]
        .some(f => f?.toLowerCase().includes(q))
      if (matchQ) acc[item.type] = (acc[item.type] || 0) + 1
      return acc
    }, {})
  }, [query])

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Search Results' }]} />

      {/* ── Search bar ── */}
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none"
               fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={query}
            onChange={e => setSearchParams({ q: e.target.value, type: typeFilter })}
            placeholder="Search lessons, courses, glossary…"
            className="input pl-12 text-base h-12"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setSearchParams({ q: '', type: typeFilter })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500
                         hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Type filters ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TYPE_FILTERS.map(t => {
          const count = t === 'All'
            ? Object.values(countByType).reduce((a, b) => a + b, 0)
            : countByType[t.toLowerCase()] || 0
          return (
            <button
              key={t}
              onClick={() => setSearchParams({ q: query, type: t })}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold
                          border transition-all duration-150
                          ${typeFilter === t
                            ? 'bg-brand-500 border-brand-500 text-white shadow-glow-sm'
                            : 'bg-surface-800 border-surface-700 text-slate-400 hover:text-white hover:border-slate-500'}`}
            >
              {t}
              {query && <span className={`${typeFilter === t ? 'text-white/70' : 'text-slate-600'} font-mono`}>
                {count}
              </span>}
            </button>
          )
        })}
      </div>

      {/* ── Results ── */}
      {!query ? (
        <div className="card p-16 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-slate-400 font-medium mb-2">Type something to search</p>
          <p className="text-xs text-slate-600">
            Search across {ALL_ITEMS.length} lessons, courses, tools, and glossary terms
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-4xl mb-3">🤔</div>
          <p className="text-slate-300 font-semibold mb-2">
            No results for "<span className="text-white">{query}</span>"
          </p>
          <p className="text-sm text-slate-500 mb-5">
            Try different keywords or browse the courses directly.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['active directory', 'linux', 'firewall', 'docker', 'subnetting'].map(s => (
              <button
                key={s}
                onClick={() => setSearchParams({ q: s, type: 'All' })}
                className="tag hover:border-brand-500/40 hover:text-white cursor-pointer transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <p className="text-xs font-mono text-slate-500 mb-5">
            {results.length} result{results.length !== 1 ? 's' : ''} for
            "<span className="text-slate-300">{query}</span>"
          </p>
          <div className="space-y-3">
            {results.map((item, i) => {
              const typeStyle = TYPE_STYLES[item.type] || TYPE_STYLES.tool
              return (
                <Link
                  key={item.href + i}
                  to={item.type === 'glossary' ? '/glossary' : item.href}
                  className="card p-5 flex items-start gap-4 group hover:border-brand-500/30
                             transition-all duration-200 block"
                >
                  <div className="w-10 h-10 rounded-xl bg-surface-700 flex items-center
                                   justify-center text-xl flex-shrink-0
                                   group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-white group-hover:text-brand-300
                                     transition-colors text-[15px]">
                        <Highlight text={item.title} query={query} />
                      </h3>
                      <span className={`badge border text-[10px] flex-shrink-0 ${typeStyle.color}`}>
                        {typeStyle.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                      <Highlight text={item.desc} query={query} />
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1 font-mono">{item.href}</p>
                  </div>
                  <svg className="w-4 h-4 text-slate-600 group-hover:text-brand-400 flex-shrink-0
                                   group-hover:translate-x-0.5 transition-all duration-150 mt-1"
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
