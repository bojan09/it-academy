import React, { useState } from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_TCPIP_1 = `# On Ubuntu Server — check IP configuration
ip addr show ens33
ip route show

# Calculate: what is the broadcast address for 192.168.100.0/24?
# Network: 192.168.100.0
# Broadcast: 192.168.100.255
# Host range: 192.168.100.1 – 192.168.100.254
# Confirm with ipcalc:
sudo apt install ipcalc -y
ipcalc 192.168.100.20/24`
const CODE_TCPIP_2 = `Address:   192.168.100.20        11000000.10101000.01100100. 00010100
Netmask:   255.255.255.0 = 24   11111111.11111111.11111111. 00000000
Network:   192.168.100.0/24
HostMin:   192.168.100.1
HostMax:   192.168.100.254
Broadcast: 192.168.100.255
Hosts/Net: 254`
const CODE_TCPIP_3 = `# Terminal 1 on Ubuntu — start capture on port 22
sudo tcpdump -i ens33 -n "port 22 and host 192.168.100.10" &

# Terminal 2 — initiate SSH from DC01 (PowerShell):
# ssh Administrator@192.168.100.20

# The capture will show SYN, SYN-ACK, ACK
# Then the SSH encrypted data exchange
sudo tcpdump -i ens33 -n -c 6 "port 22" 2>/dev/null`
const CODE_TCPIP_4 = `10:30:15.001 192.168.100.10.54321 > 192.168.100.20.22: Flags [S]  seq 1234567  ← SYN
10:30:15.002 192.168.100.20.22    > 192.168.100.10.54321: Flags [S.] seq 9876543  ← SYN-ACK
10:30:15.003 192.168.100.10.54321 > 192.168.100.20.22:    Flags [.]              ← ACK
10:30:15.004 192.168.100.10.54321 > 192.168.100.20.22:    Flags [P.] length 28   ← Data
10:30:15.005 192.168.100.20.22    > 192.168.100.10.54321: Flags [P.] length 44   ← Data`
const CODE_TCPIP_5 = `# Capture DNS traffic (UDP port 53)
sudo tcpdump -i ens33 -n -c 4 "port 53" &

# Trigger a DNS lookup
dig @192.168.100.10 dc01.lab.local`
const CODE_TCPIP_6 = `10:30:20.001 192.168.100.20.51234 > 192.168.100.10.53: A? dc01.lab.local  ← Query (no handshake!)
10:30:20.002 192.168.100.10.53   > 192.168.100.20.51234: A 192.168.100.10      ← Answer (no ACK!)
# UDP: request + response only. No connection setup, no teardown.`
const CODE_TCPIP_7 = `# Ubuntu — all TCP states
ss -tn state established

# See all states (LISTEN, ESTABLISHED, TIME_WAIT, etc.)
ss -tan | awk '{print $1}' | sort | uniq -c | sort -rn

# Windows DC01 (PowerShell):
# Get-NetTCPConnection | Group-Object State | Select-Object Name, Count`
const CODE_TCPIP_8 = `State     Recv-Q  Send-Q  Local Address:Port     Peer Address:Port
ESTAB     0       0       192.168.100.20:22     192.168.100.10:54321

  6 LISTEN
  2 ESTABLISHED
  0 TIME-WAIT`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'How many usable host addresses are in a /26 subnet?',
    options: ['32', '62', '64', '126'],
    correct: 1,
    explanation: 'A /26 subnet has 26 network bits and 6 host bits. Total addresses = 2^6 = 64. Usable hosts = 64 - 2 = 62 (subtract network address and broadcast address). Subnet mask: 255.255.255.192.',
  },
  {
    id: 'q2',
    question: 'What does TCP\'s three-way handshake accomplish?',
    options: [
      'It encrypts the connection before data is transferred',
      'It establishes a reliable, ordered connection by synchronising sequence numbers between client and server',
      'It verifies the identity of both endpoints using certificates',
      'It negotiates the data transfer rate between client and server',
    ],
    correct: 1,
    explanation: 'The TCP three-way handshake (SYN → SYN-ACK → ACK) establishes connection parameters — primarily synchronising Initial Sequence Numbers (ISN) so both sides can track which bytes have been received and reorder out-of-order segments. It does not encrypt or authenticate — that\'s TLS\'s job.',
  },
  {
    id: 'q3',
    question: 'Which statement best describes the difference between TCP and UDP?',
    options: [
      'TCP is faster; UDP is more reliable',
      'TCP guarantees ordered, reliable delivery with error checking; UDP is connectionless with no guaranteed delivery',
      'TCP is for text data; UDP is for binary data',
      'TCP requires a static IP; UDP works with DHCP',
    ],
    correct: 1,
    explanation: 'TCP provides reliable, ordered, error-checked delivery through acknowledgements, sequence numbers, and retransmission. This overhead makes it slower but dependable. UDP is connectionless — it sends packets with no handshake, acknowledgement, or retransmission. UDP is faster and used for DNS, VoIP, gaming, and streaming where speed matters more than perfect delivery.',
  },
  {
    id: 'q4',
    question: 'A host has IP 172.16.45.200 with subnet mask 255.255.240.0. What is the network address?',
    options: ['172.16.45.0', '172.16.32.0', '172.16.0.0', '172.16.48.0'],
    correct: 1,
    explanation: '255.255.240.0 = /20. The third octet mask is 240 (11110000 in binary). 45 in binary is 00101101. AND with 11110000 = 00100000 = 32. So the network address is 172.16.32.0. The host range is 172.16.32.1 – 172.16.47.254, broadcast is 172.16.47.255.',
  },
  {
    id: 'q5',
    question: 'What is the purpose of a default gateway?',
    options: [
      'To assign IP addresses to hosts on the local network',
      'To resolve hostnames to IP addresses',
      'To forward packets from the local subnet to other networks when no more-specific route exists',
      'To encrypt traffic leaving the local network',
    ],
    correct: 2,
    explanation: 'The default gateway is a router\'s IP address that a host sends packets to when the destination IP is not on the local subnet. The host checks its routing table — if no specific route matches, it sends the packet to the default gateway (0.0.0.0/0 route), which then makes the next routing decision.',
  },
]

// ─── Interactive subnet calculator ───────────────────────────────────────────
function SubnetCalculator() {
  const [cidr, setCidr] = useState(24)

  const hostBits   = 32 - cidr
  const totalAddrs = Math.pow(2, hostBits)
  const usableHosts = cidr <= 30 ? totalAddrs - 2 : cidr === 31 ? 2 : 1

  // Build subnet mask from cidr
  const maskBinary = '1'.repeat(cidr).padEnd(32, '0')
  const maskOctets = [0,8,16,24].map(i => parseInt(maskBinary.slice(i, i+8), 2))
  const maskStr    = maskOctets.join('.')

  // Wildcard mask
  const wildcardOctets = maskOctets.map(o => 255 - o)
  const wildcardStr    = wildcardOctets.join('.')

  // Visual bit diagram
  const bits = Array.from({ length: 32 }, (_, i) => ({
    value: i < cidr ? 1 : 0,
    isNetwork: i < cidr,
    octetStart: i % 8 === 0 && i > 0,
  }))

  return (
    <div className="card p-6 mt-4">
      <h3 className="text-base font-bold text-white mb-4">Interactive Subnet Calculator</h3>

      {/* CIDR slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-300">Prefix Length</label>
          <span className="font-mono text-xl font-bold text-brand-300">/{cidr}</span>
        </div>
        <input
          type="range" min={1} max={32} value={cidr}
          onChange={e => setCidr(Number(e.target.value))}
          className="w-full accent-brand-500 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-600 font-mono mt-1">
          <span>/1</span>
          <span>/8</span>
          <span>/16</span>
          <span>/24</span>
          <span>/32</span>
        </div>
      </div>

      {/* Bit diagram */}
      <div className="mb-5">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
          Bit Diagram (network bits = blue, host bits = green)
        </p>
        <div className="flex flex-wrap gap-0.5">
          {bits.map((bit, i) => (
            <React.Fragment key={i}>
              {bit.octetStart && <div className="w-2" />}
              <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold
                                ${bit.isNetwork
                                  ? 'bg-brand-500/30 text-brand-300 border border-brand-500/50'
                                  : 'bg-accent-green/15 text-accent-green border border-accent-green/30'}`}>
                {bit.value}
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="flex gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-3 h-3 rounded bg-brand-500/30 border border-brand-500/50" />
            Network bits ({cidr})
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-3 h-3 rounded bg-accent-green/15 border border-accent-green/30" />
            Host bits ({hostBits})
          </span>
        </div>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Subnet Mask',    value: maskStr,                    mono: true },
          { label: 'Wildcard Mask',  value: wildcardStr,                mono: true },
          { label: 'Total Addresses',value: totalAddrs.toLocaleString(), mono: true },
          { label: 'Usable Hosts',   value: usableHosts.toLocaleString(), mono: true, highlight: true },
          { label: 'Network Bits',   value: cidr,                       mono: true },
          { label: 'Host Bits',      value: hostBits,                   mono: true },
        ].map(r => (
          <div key={r.label} className={`rounded-xl p-3 border
                                          ${r.highlight
                                            ? 'bg-brand-500/10 border-brand-500/25'
                                            : 'bg-surface-700/50 border-surface-700'}`}>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">{r.label}</p>
            <p className={`text-sm font-bold ${r.highlight ? 'text-brand-300' : 'text-white'} font-mono`}>
              {r.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Callout({ type = 'info', icon, title, children }) {
  const s = { info: 'callout-info', warning: 'callout-warning', success: 'callout-success' }
  return (
    <div className={`callout ${s[type]}`}>
      <span className="callout-icon">{icon}</span>
      <div className="callout-body">{title && <strong>{title}</strong>}{children}</div>
    </div>
  )
}

function LabStep({ number, description, command, language = 'bash', output }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 rounded-full bg-accent-amber/20 border border-accent-amber/30
                         text-accent-amber text-[11px] font-bold font-mono flex items-center
                         justify-center flex-shrink-0 mt-0.5">{number}</span>
        <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
      </div>
      {command && <div className="ml-9"><CodeBlock code={command} language={language} showCopy /></div>}
      {output && (
        <div className="ml-9 rounded-xl bg-surface-950 border border-surface-700 px-4 py-3
                        font-mono text-xs text-accent-green leading-6">
          {output.split('\n').map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  )
}

export default function TCPIP() {
  return (
    <LessonLayout
      lessonId="net-02"
      courseId="networking"
      title="TCP/IP & the Internet Protocol Suite"
      courseTitle="Network Fundamentals"
      courseHref="/networking"
      xp={70}
      readTime="~30 min"
      icon="🌐"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Networking', href: '/networking' },
        { label: 'TCP/IP & Subnetting' },
      ]}
      prev={{ title: 'The OSI Model',          href: '/networking/osi-model' }}
      next={{ title: 'Subnetting & CIDR',      href: '/networking/subnetting' }}
      objectives={[
        'Understand the TCP/IP model layers and how they map to OSI',
        'Explain the TCP three-way handshake and four-way teardown',
        'Know when to use TCP vs UDP for different applications',
        'Calculate network address, broadcast, and host ranges from CIDR notation',
        'Use the interactive subnet calculator for fast calculations',
        'Analyse TCP connections with ss and packet captures',
      ]}
    >
      {/* ── OVERVIEW ── */}
      <section>
        <h2>Overview</h2>
        <p>
          TCP/IP is the foundational protocol suite that powers the internet and virtually
          every modern network. Understanding it at a deep level — not just memorising that
          "HTTP runs on port 80" — separates engineers who can diagnose problems from those
          who can only follow checklists.
        </p>
        <p className="mt-4">
          This lesson covers the TCP/IP model, the mechanics of TCP and UDP, IP addressing
          and subnetting with an interactive calculator, and real-world packet analysis
          commands you'll use daily.
        </p>
      </section>

      {/* ── TCP/IP MODEL ── */}
      <section>
        <h2>The TCP/IP Model</h2>
        <p>TCP/IP uses a 4-layer model (vs OSI's 7). Here's how they map:</p>
        <div className="info-card mt-4 overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-5 text-xs font-mono divide-x divide-surface-700">
            <div className="p-3 bg-surface-700/30">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">OSI Layer</p>
              {['7 Application','6 Presentation','5 Session','4 Transport','3 Network','2 Data Link','1 Physical'].map(l => (
                <div key={l} className="py-1 text-slate-400 border-b border-surface-700/50 last:border-0">{l}</div>
              ))}
            </div>
            <div className="p-3 col-span-1 sm:col-span-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">TCP/IP Layer</p>
              <div className="bg-brand-500/10 border border-brand-500/20 rounded-lg p-2 mb-1 text-brand-300 text-center">Application</div>
              <div className="h-4" />
              <div className="h-4" />
              <div className="bg-accent-cyan/10 border border-accent-cyan/20 rounded-lg p-2 mb-1 text-accent-cyan text-center">Transport</div>
              <div className="bg-accent-green/10 border border-accent-green/20 rounded-lg p-2 mb-1 text-accent-green text-center">Internet</div>
              <div className="bg-accent-amber/10 border border-accent-amber/20 rounded-lg p-2 text-accent-amber text-center">Network Access</div>
            </div>
            <div className="p-3 col-span-1 sm:col-span-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Key Protocols</p>
              <div className="py-1 text-slate-400 border-b border-surface-700/50">HTTP, HTTPS, FTP, SSH, SMTP, DNS</div>
              <div className="py-1 text-slate-400 border-b border-surface-700/50 text-slate-600">—</div>
              <div className="py-1 text-slate-400 border-b border-surface-700/50 text-slate-600">—</div>
              <div className="py-1 text-slate-400 border-b border-surface-700/50">TCP, UDP, SCTP</div>
              <div className="py-1 text-slate-400 border-b border-surface-700/50">IP, ICMP, ARP, OSPF, BGP</div>
              <div className="py-1 text-slate-400">Ethernet, Wi-Fi, Fibre</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TCP vs UDP ── */}
      <section>
        <h2>TCP vs UDP</h2>
        <div className="grid sm:grid-cols-2 gap-5 mt-4">
          {[
            {
              proto: 'TCP',
              full: 'Transmission Control Protocol',
              color: 'border-brand-500/25 bg-brand-500/5',
              text: 'text-brand-300',
              features: ['Connection-oriented (three-way handshake)', 'Guaranteed delivery (ACKs + retransmission)', 'Ordered delivery (sequence numbers)', 'Flow control & congestion control', 'Higher overhead, lower throughput'],
              uses: ['HTTP/HTTPS (web)', 'SSH (remote admin)', 'FTP (file transfer)', 'SMTP/IMAP (email)', 'Database connections'],
            },
            {
              proto: 'UDP',
              full: 'User Datagram Protocol',
              color: 'border-accent-amber/25 bg-accent-amber/5',
              text: 'text-accent-amber',
              features: ['Connectionless (no handshake)', 'No guaranteed delivery', 'No ordering guarantee', 'No flow control', 'Lower overhead, higher throughput'],
              uses: ['DNS queries (fast lookups)', 'DHCP (IP assignment)', 'NTP (time sync)', 'VoIP and video streaming', 'Online gaming'],
            },
          ].map(p => (
            <div key={p.proto} className={`card p-5 border ${p.color}`}>
              <div className="flex items-center gap-2 mb-4">
                <span className={`text-2xl font-extrabold font-mono ${p.text}`}>{p.proto}</span>
                <span className="text-xs text-slate-500">{p.full}</span>
              </div>
              <div className="mb-4">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Characteristics</p>
                <ul className="space-y-1">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className={`flex-shrink-0 font-bold ${p.text}`}>→</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Used By</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.uses.map(u => <span key={u} className="tag text-[10px]">{u}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3>TCP Three-Way Handshake</h3>
        <div className="info-card mt-3 overflow-hidden">
          <div className="font-mono text-xs leading-8 p-4 overflow-x-auto">
            <div className="min-w-[420px]">
              <div className="grid grid-cols-3 gap-4 text-center mb-2">
                <div className="text-accent-cyan font-bold">Client</div>
                <div className="text-slate-600"></div>
                <div className="text-accent-green font-bold">Server</div>
              </div>
              {[
                { from: 'client', msg: 'SYN (seq=x)', label: '1. Client requests connection', color: 'text-accent-cyan' },
                { from: 'server', msg: 'SYN-ACK (seq=y, ack=x+1)', label: '2. Server acknowledges + sends own SYN', color: 'text-accent-green' },
                { from: 'client', msg: 'ACK (ack=y+1)', label: '3. Client acknowledges → connection open', color: 'text-accent-cyan' },
                { from: 'both',   msg: 'DATA ↔ DATA', label: '4. Bidirectional data transfer', color: 'text-white' },
              ].map((s, i) => (
                <div key={i} className="grid grid-cols-3 gap-4 items-center mb-1">
                  <div className={`text-right text-xs ${s.from === 'client' ? s.color : s.from === 'both' ? s.color : 'text-slate-600'}`}>
                    {s.from === 'client' ? s.msg : s.from === 'both' ? '←DATA' : ''}
                  </div>
                  <div className="text-center text-[10px] text-slate-500">{s.label}</div>
                  <div className={`text-left text-xs ${s.from === 'server' ? s.color : s.from === 'both' ? s.color : 'text-slate-600'}`}>
                    {s.from === 'server' ? s.msg : s.from === 'both' ? 'DATA→' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SUBNETTING ── */}
      <section>
        <h2>IP Addressing & Subnetting</h2>
        <p>
          An IPv4 address is 32 bits split into 4 octets. CIDR (Classless Inter-Domain Routing)
          notation uses a prefix length (e.g. <code className="font-mono text-accent-cyan text-sm">/24</code>)
          to define how many bits belong to the <em>network</em> portion — the rest are <em>host</em> bits.
        </p>
        <Callout type="info" icon="📐" title="The formula you must memorise">
          Usable hosts = 2^(host bits) - 2.
          Subtract 2: one for the network address (all host bits 0) and one for broadcast (all host bits 1).
        </Callout>

        {/* Interactive calculator */}
        <SubnetCalculator />

        {/* Subnet cheat table */}
        <div className="info-card mt-6 overflow-hidden">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest p-4 pb-2">
            Quick Reference — Common CIDR Prefixes
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-surface-700 text-left">
                  {['CIDR', 'Subnet Mask', 'Total Addresses', 'Usable Hosts', 'Common Use'].map(h => (
                    <th key={h} className="px-4 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700">
                {[
                  { cidr: '/30', mask: '255.255.255.252', total: '4',       usable: '2',    use: 'Point-to-point links (routers)' },
                  { cidr: '/29', mask: '255.255.255.248', total: '8',       usable: '6',    use: 'Small office networks' },
                  { cidr: '/28', mask: '255.255.255.240', total: '16',      usable: '14',   use: 'Small server segments' },
                  { cidr: '/27', mask: '255.255.255.224', total: '32',      usable: '30',   use: 'Department networks' },
                  { cidr: '/26', mask: '255.255.255.192', total: '64',      usable: '62',   use: 'Medium segments' },
                  { cidr: '/25', mask: '255.255.255.128', total: '128',     usable: '126',  use: 'Half a Class C' },
                  { cidr: '/24', mask: '255.255.255.0',   total: '256',     usable: '254',  use: 'Standard LAN — very common', highlight: true },
                  { cidr: '/23', mask: '255.255.254.0',   total: '512',     usable: '510',  use: 'Medium enterprise LAN' },
                  { cidr: '/22', mask: '255.255.252.0',   total: '1024',    usable: '1022', use: 'Large branch office' },
                  { cidr: '/20', mask: '255.255.240.0',   total: '4096',    usable: '4094', use: 'Data centre segment' },
                  { cidr: '/16', mask: '255.255.0.0',     total: '65536',   usable: '65534',use: 'Class B — large campus' },
                ].map(r => (
                  <tr key={r.cidr} className={`${r.highlight ? 'bg-brand-500/5' : 'hover:bg-surface-700/30'} transition-colors`}>
                    <td className={`px-4 py-2.5 font-bold ${r.highlight ? 'text-brand-300' : 'text-white'}`}>{r.cidr}</td>
                    <td className="px-4 py-2.5 text-slate-400">{r.mask}</td>
                    <td className="px-4 py-2.5 text-slate-400">{r.total}</td>
                    <td className={`px-4 py-2.5 font-semibold ${r.highlight ? 'text-brand-300' : 'text-accent-green'}`}>{r.usable}</td>
                    <td className="px-4 py-2.5 text-slate-500 font-sans text-[11px]">{r.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── VMware LAB ── */}
      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB NET-2</span>
            <span className="text-sm font-semibold text-white">Analyse TCP/IP in Your Lab Network</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">

            <LabStep number={1}
              description="Verify the TCP/IP configuration of both lab VMs and validate subnetting."
              command={CODE_TCPIP_1}
              output={CODE_TCPIP_2}
            />

            <LabStep number={2}
              description="Observe the TCP three-way handshake with tcpdump while establishing an SSH connection."
              command={CODE_TCPIP_3}
              output={CODE_TCPIP_4}
            />

            <LabStep number={3}
              description="Observe UDP with a DNS query — notice no handshake, no ACK."
              command={CODE_TCPIP_5}
              output={CODE_TCPIP_6}
            />

            <LabStep number={4}
              description="View active TCP connections and their states on both VMs."
              command={CODE_TCPIP_7}
              output={CODE_TCPIP_8}
            />

            <Callout type="success" icon="✅" title="Lab Complete">
              You've used ipcalc to verify subnetting, captured the TCP three-way handshake,
              confirmed UDP's connectionless nature with DNS, and analysed active connection states.
            </Callout>
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to earn bonus XP.</p>
        <Quiz lessonId="net-02" title="TCP/IP & Subnetting Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={35} />
      </section>
    </LessonLayout>
  )
}
