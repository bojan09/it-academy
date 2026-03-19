import React, { useState } from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'At which OSI layer does IP addressing and routing occur?',
    options: ['Layer 2 — Data Link', 'Layer 3 — Network', 'Layer 4 — Transport', 'Layer 5 — Session'],
    correct: 1,
    explanation: 'Layer 3 (Network) handles logical IP addressing and routing. Routers operate at this layer, making forwarding decisions based on IP addresses. Layer 2 uses MAC addresses, Layer 4 handles TCP/UDP ports.',
  },
  {
    id: 'q2',
    question: 'A packet arrives at a switch. At which layer does the switch make its forwarding decision?',
    options: ['Layer 1 — Physical', 'Layer 2 — Data Link', 'Layer 3 — Network', 'Layer 4 — Transport'],
    correct: 1,
    explanation: 'Unmanaged and standard managed switches operate at Layer 2, using the destination MAC address in the Ethernet frame to make forwarding decisions. Layer 3 switches can also route based on IP addresses.',
  },
  {
    id: 'q3',
    question: 'Which protocol operates at Layer 7 of the OSI model?',
    options: ['TCP', 'IP', 'Ethernet', 'HTTP'],
    correct: 3,
    explanation: 'HTTP (and HTTPS) operate at Layer 7 — the Application layer. This is the layer that directly interfaces with end-user software. TCP is Layer 4, IP is Layer 3, and Ethernet is Layer 2.',
  },
  {
    id: 'q4',
    question: 'What is the PDU (Protocol Data Unit) name at Layer 4?',
    options: ['Frame', 'Packet', 'Segment', 'Bit'],
    correct: 2,
    explanation: 'Each OSI layer has a name for its data unit: Layer 7–5 = Data, Layer 4 = Segment, Layer 3 = Packet, Layer 2 = Frame, Layer 1 = Bit. Understanding PDU names helps when reading protocol documentation.',
  },
  {
    id: 'q5',
    question: 'SSL/TLS operates primarily at which OSI layer?',
    options: ['Layer 4 — Transport', 'Layer 5 — Session', 'Layer 6 — Presentation', 'Layer 7 — Application'],
    correct: 2,
    explanation: 'SSL/TLS is typically mapped to Layer 6 (Presentation) because it handles encryption, decryption, and data format translation — all Presentation layer responsibilities. Some models place it at Layer 5 or treat it as spanning multiple layers.',
  },
]

const LAYERS = [
  { num: 7, name: 'Application',  color: 'bg-brand-500',       textColor: 'text-brand-300',    pdu: 'Data',    protocols: ['HTTP', 'HTTPS', 'FTP', 'SMTP', 'DNS', 'SSH', 'Telnet'], devices: ['Servers', 'Applications'], role: 'End-user interfaces with network services. Provides protocols for email, web browsing, file transfer, and remote access.' },
  { num: 6, name: 'Presentation', color: 'bg-violet-500',      textColor: 'text-violet-300',   pdu: 'Data',    protocols: ['SSL/TLS', 'JPEG', 'MPEG', 'ASCII', 'Unicode'], devices: ['Gateways'], role: 'Translates data formats, handles encryption/decryption, and compression. Ensures data is readable by the receiving application.' },
  { num: 5, name: 'Session',      color: 'bg-accent-purple',   textColor: 'text-purple-300',   pdu: 'Data',    protocols: ['NetBIOS', 'RPC', 'PPTP', 'SAP'], devices: ['Gateways'], role: 'Establishes, maintains, and terminates communication sessions. Handles synchronisation checkpoints for long data transfers.' },
  { num: 4, name: 'Transport',    color: 'bg-accent-cyan',     textColor: 'text-cyan-300',     pdu: 'Segment', protocols: ['TCP', 'UDP', 'SCTP'], devices: ['Firewalls', 'Load Balancers'], role: 'End-to-end communication. TCP: reliable, ordered delivery with error recovery. UDP: fast, connectionless, best-effort delivery.' },
  { num: 3, name: 'Network',      color: 'bg-accent-green',    textColor: 'text-green-300',    pdu: 'Packet',  protocols: ['IP', 'ICMP', 'ARP', 'OSPF', 'BGP', 'RIP'], devices: ['Routers', 'Layer-3 Switches'], role: 'Logical IP addressing and routing. Determines the best path for packets to travel across multiple networks.' },
  { num: 2, name: 'Data Link',    color: 'bg-accent-amber',    textColor: 'text-amber-300',    pdu: 'Frame',   protocols: ['Ethernet', '802.11 Wi-Fi', '802.1Q VLAN', 'ARP', 'PPP'], devices: ['Switches', 'Bridges', 'WAPs'], role: 'Node-to-node delivery within the same network. Uses MAC addresses. Handles error detection (CRC) and flow control within a segment.' },
  { num: 1, name: 'Physical',     color: 'bg-accent-red',      textColor: 'text-red-300',      pdu: 'Bit',     protocols: ['RJ45', 'Fibre', 'DSL', 'Coax', 'Bluetooth', 'USB'], devices: ['Hubs', 'Cables', 'NICs', 'Repeaters'], role: 'Raw bit transmission over the physical medium. Defines electrical signals, light pulses, voltage levels, and cable specifications.' },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info: 'callout-info', warning: 'callout-warning', success: 'callout-success' }
  return (
    <div className={`callout ${s[type]}`}>
      <span className="callout-icon">{icon}</span>
      <div className="callout-body">{title && <strong>{title}</strong>}{children}</div>
    </div>
  )
}

export default function OSIModel() {
  const [selected, setSelected] = useState(null)

  return (
    <LessonLayout
      lessonId="net-01"
      courseId="networking"
      title="The OSI Model"
      courseTitle="Network Fundamentals"
      courseHref="/networking"
      xp={60}
      readTime="~25 min"
      icon="📐"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Networking', href: '/networking' },
        { label: 'The OSI Model' },
      ]}
      prev={null}
      next={{ title: 'TCP/IP & the Internet Protocol Suite', href: '/networking/tcp-ip' }}
      objectives={[
        'Name and explain all 7 OSI layers from memory',
        'Map real protocols to their correct layers',
        'Understand PDU names at each layer',
        'Apply OSI as a troubleshooting framework',
        'Know which devices operate at which layers',
      ]}
    >
      {/* ── OVERVIEW ── */}
      <section>
        <h2>Overview</h2>
        <p>
          The <strong>OSI Model</strong> (Open Systems Interconnection) is a 7-layer
          conceptual framework that standardises how network communication functions are
          divided and described. Created by ISO in 1984, it remains the universal language
          for describing network problems, protocols, and devices.
        </p>
        <p className="mt-4">
          You will be asked about the OSI model in every networking interview, every
          troubleshooting scenario, and every vendor certification. More importantly,
          it gives you a systematic mental model for diagnosing any network problem.
        </p>
        <Callout type="info" icon="💡" title="The real value of OSI">
          When something breaks, you start at Layer 1 and work up: "Is the cable plugged in?
          Does the switch see the MAC? Is the IP reachable? Is the port open? Is the service
          responding?" That's OSI troubleshooting in practice.
        </Callout>
      </section>

      {/* ── INTERACTIVE LAYERS ── */}
      <section>
        <h2>The 7 Layers — Click to Explore</h2>
        <div className="flex flex-col lg:flex-row gap-6 mt-4">
          {/* Layer stack */}
          <div className="space-y-1.5 lg:w-64 flex-shrink-0">
            {LAYERS.map(layer => (
              <button
                key={layer.num}
                onClick={() => setSelected(selected?.num === layer.num ? null : layer)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border
                            text-left transition-all duration-150
                            ${selected?.num === layer.num
                              ? 'border-brand-500/50 bg-surface-700'
                              : 'border-surface-600 bg-surface-800 hover:border-slate-500'}`}
              >
                <div className={`w-8 h-8 rounded-lg ${layer.color} flex items-center justify-center
                                  text-white font-bold font-mono text-sm flex-shrink-0`}>
                  {layer.num}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{layer.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">PDU: {layer.pdu}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <div className="flex-1">
            {selected ? (
              <div className="card p-6 h-full animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${selected.color} flex items-center
                                   justify-center text-white font-bold font-mono text-lg`}>
                    {selected.num}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${selected.textColor}`}>
                      Layer {selected.num} — {selected.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">PDU: {selected.pdu}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-5">{selected.role}</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Protocols
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.protocols.map(p => (
                        <span key={p} className="tag text-[11px]">{p}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
                      Devices
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.devices.map(d => (
                        <span key={d} className={`tag text-[11px] bg-surface-700 ${selected.textColor} border-current/20`}>{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-8 flex flex-col items-center justify-center text-center h-full min-h-48">
                <div className="text-3xl mb-2">👆</div>
                <p className="text-slate-400 text-sm">Click any layer to see details</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── MNEMONIC ── */}
      <section>
        <h2>Remembering the Layers</h2>
        <div className="grid sm:grid-cols-2 gap-6 mt-4">
          <div className="info-card">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
              Top → Bottom (7 to 1)
            </p>
            <p className="text-sm font-semibold text-brand-300 mb-3">"All People Seem To Need Data Processing"</p>
            <div className="space-y-2 font-mono text-xs">
              {['All → Application (7)', 'People → Presentation (6)', 'Seem → Session (5)', 'To → Transport (4)', 'Need → Network (3)', 'Data → Data Link (2)', 'Processing → Physical (1)'].map((m, i) => (
                <div key={i} className={`flex items-center gap-2 ${LAYERS[i].textColor}`}>
                  <span className={`w-5 h-5 rounded flex items-center justify-center text-white
                                    text-[10px] font-bold ${LAYERS[i].color}`}>{7-i}</span>
                  {m}
                </div>
              ))}
            </div>
          </div>
          <div className="info-card">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
              PDU Names by Layer
            </p>
            <div className="space-y-2">
              {LAYERS.map(l => (
                <div key={l.num} className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Layer {l.num} — {l.name}</span>
                  <span className={`tag text-[11px] font-mono font-semibold ${l.textColor}`}>
                    {l.pdu}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TROUBLESHOOTING WITH OSI ── */}
      <section>
        <h2>OSI as a Troubleshooting Framework</h2>
        <p>
          When a user reports "the internet is down", a structured sysadmin works through the
          layers systematically — never jumping to conclusions:
        </p>
        <div className="space-y-3 mt-4">
          {[
            { layer: 'L1 Physical',   check: 'Is the cable plugged in? Is the NIC showing link? Check the port LEDs on the switch.', cmd: 'ethtool eth0  # Linux\nGet-NetAdapter  # Windows' },
            { layer: 'L2 Data Link',  check: 'Is the MAC address visible on the switch? Any duplex mismatches?', cmd: 'arp -a\nip neigh show' },
            { layer: 'L3 Network',    check: 'Does the host have a valid IP? Can it ping the default gateway?', cmd: 'ip addr show\nping -c 4 192.168.100.1' },
            { layer: 'L4 Transport',  check: 'Can we reach the destination port? Is the service listening?', cmd: 'ss -tlnp\nTest-NetConnection -Port 443 google.com' },
            { layer: 'L7 Application',check: 'Is the service actually responding? Check DNS, HTTP response codes.', cmd: 'curl -I https://google.com\nnslookup google.com' },
          ].map(t => (
            <div key={t.layer} className="card p-4">
              <div className="flex items-start gap-3">
                <span className="tag text-[10px] flex-shrink-0 mt-0.5 whitespace-nowrap">{t.layer}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 mb-2">{t.check}</p>
                  <CodeBlock code={t.cmd} language="bash" showCopy />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUIZ ── */}
      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to earn bonus XP.</p>
        <Quiz lessonId="net-01" title="OSI Model Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={30} />
      </section>
    </LessonLayout>
  )
}
