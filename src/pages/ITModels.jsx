import React, { useState } from 'react'
import Breadcrumb from '../components/Breadcrumb.jsx'

// ─── OSI Layers ───────────────────────────────────────────────────────────────
const OSI_LAYERS = [
  { num: 7, name: 'Application',  color: 'bg-brand-500',        protocols: ['HTTP', 'HTTPS', 'FTP', 'SMTP', 'DNS', 'SSH'],         desc: 'End-user facing protocols and applications. Where network services interface with software.',    example: 'Your browser making an HTTPS request to a web server.' },
  { num: 6, name: 'Presentation', color: 'bg-accent-purple',    protocols: ['SSL/TLS', 'JPEG', 'MPEG', 'ASCII', 'Encryption'],     desc: 'Data translation, encryption, and compression. Ensures data is in a usable format.',            example: 'TLS encrypting your HTTPS traffic before transmission.' },
  { num: 5, name: 'Session',      color: 'bg-accent-cyan',      protocols: ['NetBIOS', 'RPC', 'PPTP', 'SAP'],                      desc: 'Manages sessions between applications — opening, maintaining, and closing connections.',          example: 'A video call maintaining a persistent connection across packets.' },
  { num: 4, name: 'Transport',    color: 'bg-accent-green',     protocols: ['TCP', 'UDP', 'SCTP'],                                 desc: 'End-to-end communication, segmentation, flow control, and error recovery.',                     example: 'TCP breaking a file download into numbered segments and reassembling them.' },
  { num: 3, name: 'Network',      color: 'bg-accent-amber',     protocols: ['IP', 'ICMP', 'OSPF', 'BGP', 'RIP'],                  desc: 'Logical addressing and routing — determines the path packets take across networks.',              example: 'A router forwarding packets based on IP addresses and routing tables.' },
  { num: 2, name: 'Data Link',    color: 'bg-orange-500',       protocols: ['Ethernet', '802.11 Wi-Fi', 'ARP', 'PPP', '802.1Q'],  desc: 'Node-to-node delivery, MAC addressing, and error detection within a single network segment.',    example: 'A switch forwarding frames between devices based on MAC addresses.' },
  { num: 1, name: 'Physical',     color: 'bg-accent-red',       protocols: ['RJ45', 'Fibre', 'DSL', 'USB', 'Bluetooth', 'RS-232'],desc: 'Raw bit transmission over the physical medium — cables, radio waves, and electrical signals.',    example: 'An ethernet cable transmitting electrical signals between two devices.' },
]

const TCP_LAYERS = [
  { name: 'Application',  color: 'bg-brand-500',    protocols: ['HTTP', 'HTTPS', 'FTP', 'SMTP', 'SSH', 'DNS'],    desc: 'Combines OSI layers 5-7. High-level protocols used directly by applications.' },
  { name: 'Transport',    color: 'bg-accent-green', protocols: ['TCP', 'UDP'],                                     desc: 'Segments data, ensures reliable delivery (TCP) or fast delivery (UDP).' },
  { name: 'Internet',     color: 'bg-accent-amber', protocols: ['IP', 'ICMP', 'ARP', 'OSPF'],                     desc: 'Logical addressing and routing across interconnected networks.' },
  { name: 'Link',         color: 'bg-accent-red',   protocols: ['Ethernet', '802.11', 'MAC'],                     desc: 'Combines OSI layers 1-2. Physical transmission and node-to-node delivery.' },
]

const ITIL_PHASES = [
  { name: 'Service Strategy',  icon: '🎯', desc: 'Define the value of IT services and align with business objectives.' },
  { name: 'Service Design',    icon: '📐', desc: 'Design services, processes, and architectures to meet requirements.' },
  { name: 'Service Transition',icon: '🔄', desc: 'Build, test, and deploy changes with minimal risk to production.' },
  { name: 'Service Operation', icon: '⚙️', desc: 'Deliver and support services effectively. Includes incident and problem management.' },
  { name: 'Continual Improvement', icon: '📈', desc: 'Measure, analyse, and improve service quality over time.' },
]

const ZERO_TRUST = [
  { principle: 'Verify Explicitly',      icon: '🔐', desc: 'Always authenticate and authorise based on all available data points — identity, location, device, and behaviour.' },
  { principle: 'Use Least Privilege',    icon: '🔒', desc: 'Limit user access with Just-In-Time and Just-Enough-Access. Reduce lateral movement risk.' },
  { principle: 'Assume Breach',          icon: '🚨', desc: 'Minimise blast radius. Encrypt everything. Use analytics to detect anomalies fast.' },
]

// ─── Section tabs ─────────────────────────────────────────────────────────────
const TABS = ['OSI Model', 'TCP/IP Model', 'ITIL Framework', 'CIA Triad', 'Zero Trust', 'DevOps Lifecycle']

export default function ITModels() {
  const [activeTab, setActiveTab] = useState('OSI Model')
  const [expandedOSI, setExpandedOSI] = useState(null)

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'IT Models' }]} />

      <div className="mb-8">
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">Reference</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">IT Models</h1>
        <p className="text-slate-400 max-w-2xl">
          Interactive reference for the foundational frameworks every IT professional must know cold.
          Click any layer or section to expand it.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 flex-wrap mb-8 border-b border-surface-700 pb-4">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150
                        ${activeTab === tab
                          ? 'bg-brand-500 text-white shadow-glow-sm'
                          : 'bg-surface-800 text-slate-400 hover:text-white border border-surface-700 hover:border-slate-500'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── OSI Model ─────────────────────────────────────────────── */}
      {activeTab === 'OSI Model' && (
        <div>
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-2">
              {OSI_LAYERS.map(layer => (
                <div key={layer.num}>
                  <button
                    onClick={() => setExpandedOSI(expandedOSI === layer.num ? null : layer.num)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left
                                ${expandedOSI === layer.num
                                  ? 'bg-surface-700 border-brand-500/40'
                                  : 'bg-surface-800 border-surface-600 hover:border-slate-500'}`}
                  >
                    <div className={`w-9 h-9 rounded-lg ${layer.color} flex items-center justify-center
                                     text-white font-bold font-mono text-sm flex-shrink-0`}>
                      {layer.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm">{layer.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {layer.protocols.slice(0, 3).map(p => (
                          <span key={p} className="tag text-[10px] py-0">{p}</span>
                        ))}
                        {layer.protocols.length > 3 && (
                          <span className="text-[10px] text-slate-500">+{layer.protocols.length - 3} more</span>
                        )}
                      </div>
                    </div>
                    <svg className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform
                                     ${expandedOSI === layer.num ? 'rotate-180' : ''}`}
                         fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedOSI === layer.num && (
                    <div className="bg-surface-900 border border-surface-700 border-t-0 rounded-b-xl px-4 py-4 -mt-1">
                      <p className="text-sm text-slate-300 leading-relaxed mb-2">{layer.desc}</p>
                      <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-brand-500/5 border border-brand-500/10">
                        <span className="text-base flex-shrink-0">💡</span>
                        <p className="text-xs text-slate-400">{layer.example}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {layer.protocols.map(p => (
                          <span key={p} className="tag text-[11px]">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Mnemonic */}
            <div className="card p-6 lg:sticky lg:top-24">
              <h3 className="font-semibold text-white mb-4">Remember the Layers</h3>
              <p className="text-xs text-slate-500 mb-4 font-mono uppercase tracking-widest">Top → Bottom (7→1)</p>
              <div className="space-y-2 font-mono text-sm">
                {['All', 'People', 'Seem', 'To', 'Need', 'Data', 'Processing'].map((word, i) => (
                  <div key={word} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-md ${OSI_LAYERS[i].color} flex items-center justify-center
                                       text-white text-xs font-bold flex-shrink-0`}>{7 - i}</span>
                    <span className="text-white font-bold">{word[0]}</span>
                    <span className="text-slate-400">{word.slice(1)} — </span>
                    <span className="text-slate-300">{OSI_LAYERS[i].name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TCP/IP Model ──────────────────────────────────────────── */}
      {activeTab === 'TCP/IP Model' && (
        <div className="max-w-2xl space-y-4">
          <p className="text-slate-400 text-sm mb-6">
            The TCP/IP model is the practical 4-layer model that describes how data actually travels across the internet.
            It maps to the OSI model but collapses some layers.
          </p>
          {TCP_LAYERS.map((layer, i) => (
            <div key={layer.name} className="card p-5 flex gap-4 items-start">
              <div className={`w-10 h-10 rounded-xl ${layer.color} flex items-center justify-center
                               text-white font-bold font-mono flex-shrink-0`}>
                {4 - i}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">{layer.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-3">{layer.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {layer.protocols.map(p => <span key={p} className="tag text-[11px]">{p}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── ITIL Framework ────────────────────────────────────────── */}
      {activeTab === 'ITIL Framework' && (
        <div className="max-w-2xl">
          <p className="text-slate-400 text-sm mb-6">
            ITIL (Information Technology Infrastructure Library) is the most widely adopted IT service management framework.
            It describes five service lifecycle phases, each with defined processes and goals.
          </p>
          <div className="space-y-3">
            {ITIL_PHASES.map((phase, i) => (
              <div key={phase.name} className="card p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30
                                flex items-center justify-center text-xl flex-shrink-0">
                  {phase.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-brand-400">Phase {i + 1}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-1">{phase.name}</h3>
                  <p className="text-sm text-slate-400">{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CIA Triad ─────────────────────────────────────────────── */}
      {activeTab === 'CIA Triad' && (
        <div className="max-w-3xl">
          <p className="text-slate-400 text-sm mb-8">
            The CIA Triad is the core model for information security. Every security control, policy, and decision
            can be mapped back to one or more of these three principles.
          </p>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { letter: 'C', word: 'Confidentiality', color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20', icon: '🔒', desc: 'Ensuring that information is accessible only to those authorised to access it.', examples: ['Encryption at rest and in transit', 'Access control and RBAC', 'Data classification policies', 'Multi-factor authentication'] },
              { letter: 'I', word: 'Integrity',        color: 'text-accent-green', bg: 'bg-accent-green/10 border-accent-green/20', icon: '✅', desc: 'Safeguarding the accuracy and completeness of information and processing methods.', examples: ['Hashing and checksums', 'Digital signatures', 'Version control', 'Audit logging'] },
              { letter: 'A', word: 'Availability',     color: 'text-accent-amber', bg: 'bg-accent-amber/10 border-accent-amber/20', icon: '⚡', desc: 'Ensuring that authorised users have access to information and resources when needed.', examples: ['Redundancy and failover', 'DDoS protection', 'Backup and recovery', 'SLA monitoring'] },
            ].map(c => (
              <div key={c.letter} className={`card p-6 border ${c.bg}`}>
                <div className={`text-5xl font-extrabold mb-2 ${c.color} font-mono`}>{c.letter}</div>
                <h3 className={`text-lg font-bold mb-3 ${c.color}`}>{c.word}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{c.desc}</p>
                <ul className="space-y-1.5">
                  {c.examples.map(ex => (
                    <li key={ex} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.color.replace('text-', 'bg-')}`} />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Zero Trust ────────────────────────────────────────────── */}
      {activeTab === 'Zero Trust' && (
        <div className="max-w-2xl">
          <div className="card p-6 border-accent-red/20 bg-accent-red/5 mb-6">
            <p className="text-sm font-semibold text-white mb-1">Core Principle</p>
            <p className="text-base text-accent-red font-bold">"Never trust, always verify."</p>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Zero Trust eliminates the concept of a trusted internal network. Every access request is treated
              as if it originates from an untrusted network, regardless of location.
            </p>
          </div>
          <div className="space-y-4 mb-8">
            {ZERO_TRUST.map(p => (
              <div key={p.principle} className="card p-5 flex gap-4 items-start">
                <span className="text-2xl flex-shrink-0">{p.icon}</span>
                <div>
                  <h3 className="font-semibold text-white mb-1">{p.principle}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Pillars of Zero Trust</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {['Identity', 'Devices', 'Networks', 'Applications', 'Data', 'Infrastructure'].map(p => (
                <div key={p} className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-700 text-sm text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DevOps Lifecycle ──────────────────────────────────────── */}
      {activeTab === 'DevOps Lifecycle' && (
        <div className="max-w-3xl">
          <p className="text-slate-400 text-sm mb-8">
            The DevOps lifecycle is an infinite loop of continuous improvement — where development and operations
            work together across all phases to deliver faster, more reliable software.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { phase: 'Plan',     icon: '📋', color: 'bg-brand-500',     desc: 'Backlog, sprint planning, roadmap. Tools: Jira, GitHub Issues, Confluence.' },
              { phase: 'Code',     icon: '💻', color: 'bg-accent-cyan',   desc: 'Feature development, code review, branching strategy. Tools: Git, VS Code.' },
              { phase: 'Build',    icon: '🔨', color: 'bg-accent-green',  desc: 'Compile, unit test, package. Tools: Maven, Gradle, npm, Docker.' },
              { phase: 'Test',     icon: '🧪', color: 'bg-accent-amber',  desc: 'Integration, E2E, security scanning. Tools: Selenium, OWASP ZAP, SonarQube.' },
              { phase: 'Release',  icon: '🚀', color: 'bg-orange-500',    desc: 'Staging, approval gates, blue/green deployment. Tools: ArgoCD, Spinnaker.' },
              { phase: 'Deploy',   icon: '📦', color: 'bg-accent-red',    desc: 'Production deployment, rollback plans. Tools: Kubernetes, Terraform, Ansible.' },
              { phase: 'Operate',  icon: '⚙️', color: 'bg-purple-500',   desc: 'Infrastructure management, incident response. Tools: PagerDuty, Runbooks.' },
              { phase: 'Monitor',  icon: '📊', color: 'bg-accent-purple', desc: 'Metrics, logs, traces, alerts. Tools: Prometheus, Grafana, Datadog, ELK.' },
            ].map((p, i) => (
              <div key={p.phase} className="card p-4 flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl ${p.color} flex items-center justify-center
                                  text-white text-lg flex-shrink-0`}>
                  {p.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono text-slate-500">{String(i+1).padStart(2,'0')}</span>
                    <h3 className="font-semibold text-white text-sm">{p.phase}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
