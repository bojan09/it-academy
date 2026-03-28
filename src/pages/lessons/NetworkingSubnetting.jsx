import React, { useState } from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_NETWORKINGSUBNETTING_1 = `sudo apt install ipcalc -y

# Calculate subnet info for each of our lab addresses
ipcalc 192.168.100.10/24
ipcalc 10.50.200.100/18
ipcalc 172.16.45.200/20`
const CODE_NETWORKINGSUBNETTING_2 = `Address:   192.168.100.10         11000000.10101000.01100100. 00001010
Netmask:   255.255.255.0 = 24      11111111.11111111.11111111. 00000000
Network:   192.168.100.0/24
HostMin:   192.168.100.1
HostMax:   192.168.100.254
Broadcast: 192.168.100.255
Hosts/Net: 254`
const CODE_NETWORKINGSUBNETTING_3 = `python3 << 'PYEOF'
import ipaddress

# Inspect a network
net = ipaddress.ip_network('192.168.100.0/24')
print(f'Network:   {net.network_address}')
print(f'Broadcast: {net.broadcast_address}')
print(f'Netmask:   {net.netmask}')
print(f'Hosts:     {net.num_addresses - 2}')

# Split into 4 subnets
print('\\
Subnets (/26):')
for subnet in net.subnets(prefixlen_diff=2):
    hosts = list(subnet.hosts())
    print(f'  {subnet}  first={hosts[0]}  last={hosts[-1]}')
PYEOF`
const CODE_NETWORKINGSUBNETTING_4 = `Network:   192.168.100.0
Broadcast: 192.168.100.255
Netmask:   255.255.255.0
Hosts:     254

Subnets (/26):
  192.168.100.0/26    first=192.168.100.1   last=192.168.100.62
  192.168.100.64/26   first=192.168.100.65  last=192.168.100.126
  192.168.100.128/26  first=192.168.100.129 last=192.168.100.190
  192.168.100.192/26  first=192.168.100.193 last=192.168.100.254`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'You need to subnet 192.168.10.0 into 4 equal subnets. What prefix length do you use?',
    options: ['/25', '/26', '/27', '/28'],
    correct: 1,
    explanation: 'To create 4 subnets from a /24, you need 2 additional bits (2² = 4). /24 + 2 = /26. Each /26 has 64 addresses (62 usable hosts). The 4 subnets are: 192.168.10.0/26, 192.168.10.64/26, 192.168.10.128/26, 192.168.10.192/26.',
  },
  {
    id: 'q2',
    question: 'What is the broadcast address for 172.16.32.0/20?',
    options: ['172.16.32.255', '172.16.47.255', '172.16.39.255', '172.16.48.0'],
    correct: 1,
    explanation: '/20 means 20 network bits and 12 host bits. The host portion for 172.16.32.0/20: last 12 bits are all zeros. The broadcast has all host bits set to 1: the third octet 32 in binary is 00100000, with the last 4 bits (from /20) being the start of the host portion. Network = 172.16.32.0, broadcast = 172.16.47.255 (32+16-1=47 in third octet, 255 in fourth).',
  },
  {
    id: 'q3',
    question: 'What is VLSM (Variable Length Subnet Masking)?',
    options: [
      'Using different subnet masks for different parts of a network to avoid wasting IP addresses',
      'A security feature that changes subnet masks dynamically to prevent scanning',
      'Assigning variable numbers of IP addresses to VLAN interfaces',
      'A routing protocol that supports multiple subnet mask lengths',
    ],
    correct: 0,
    explanation: 'VLSM allows different subnets within the same network to have different sizes (prefix lengths). For example: a point-to-point WAN link needs only 2 hosts → use /30. A server VLAN with 20 servers needs a /27 (30 hosts). A large user VLAN with 200 users needs a /24. VLSM avoids wasting addresses by right-sizing each subnet.',
  },
  {
    id: 'q4',
    question: 'Which address range is reserved for private use (RFC 1918) at the Class B range?',
    options: ['10.0.0.0 – 10.255.255.255', '172.16.0.0 – 172.31.255.255', '192.168.0.0 – 192.168.255.255', '169.254.0.0 – 169.254.255.255'],
    correct: 1,
    explanation: 'RFC 1918 defines three private ranges: 10.0.0.0/8 (Class A, 16M addresses), 172.16.0.0/12 (Class B range, 172.16.0.0–172.31.255.255, 1M addresses), 192.168.0.0/16 (Class C range, 65K addresses). 169.254.0.0/16 is APIPA (link-local), assigned when DHCP fails.',
  },
  {
    id: 'q5',
    question: 'A host has IP 10.50.200.100/18. What is the network address?',
    options: ['10.50.0.0', '10.50.192.0', '10.50.200.0', '10.50.128.0'],
    correct: 1,
    explanation: '/18 means 18 network bits. The third octet (200) contributes the last 2 bits to the network portion. 200 in binary = 11001000. /18 uses 16 bits for the first two octets + 2 more from the third octet. The first 2 bits of 200 (11) = 192. So network = 10.50.192.0/18. Host range: 10.50.192.1–10.50.255.254. Broadcast: 10.50.255.255.',
  },
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

// ─── Interactive subnet divider ───────────────────────────────────────────────
function SubnetDivider() {
  const [network, setNetwork] = useState('192.168.10.0')
  const [subnets, setSubnets] = useState(4)

  const bitsNeeded = Math.ceil(Math.log2(Math.max(subnets, 2)))
  const newPrefix   = 24 + bitsNeeded
  const hostsPerSubnet = Math.pow(2, 32 - newPrefix) - 2

  const parts = network.split('.')
  const baseThird = parseInt(parts[2] || '0')
  const blockSize  = 256 / Math.pow(2, bitsNeeded)

  const subnetList = Array.from({ length: subnets }, (_, i) => {
    const thirdOctet = baseThird + i * blockSize
    return {
      network: `${parts[0]}.${parts[1]}.${thirdOctet}.0/${newPrefix}`,
      first:   `${parts[0]}.${parts[1]}.${thirdOctet}.1`,
      last:    `${parts[0]}.${parts[1]}.${thirdOctet + blockSize - 1}.254`,
      bcast:   `${parts[0]}.${parts[1]}.${thirdOctet + blockSize - 1}.255`,
    }
  })

  return (
    <div className="card p-6 mt-4">
      <h3 className="text-base font-bold text-white mb-4">Subnet Divider — Split a /24 into equal parts</h3>
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            Base Network (/24)
          </label>
          <input
            value={network}
            onChange={e => setNetwork(e.target.value)}
            className="input font-mono"
            placeholder="192.168.10.0"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
            Number of Subnets
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range" min={2} max={16} value={subnets}
              onChange={e => setSubnets(Number(e.target.value))}
              className="flex-1 accent-brand-500"
            />
            <span className="font-mono font-bold text-brand-300 w-6 text-right">{subnets}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-4 mb-4 text-xs font-mono">
        <span className="text-slate-400">Prefix: <span className="text-brand-300">/{newPrefix}</span></span>
        <span className="text-slate-400">Bits borrowed: <span className="text-accent-amber">{bitsNeeded}</span></span>
        <span className="text-slate-400">Hosts/subnet: <span className="text-accent-green">{hostsPerSubnet}</span></span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-surface-700">
              {['#', 'Network', 'First Host', 'Last Host', 'Broadcast'].map(h => (
                <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-700/50">
            {subnetList.map((s, i) => (
              <tr key={i} className="hover:bg-surface-700/30">
                <td className="px-3 py-2 text-slate-600">{i + 1}</td>
                <td className="px-3 py-2 text-brand-300 font-bold">{s.network}</td>
                <td className="px-3 py-2 text-accent-green">{s.first}</td>
                <td className="px-3 py-2 text-accent-green">{s.last}</td>
                <td className="px-3 py-2 text-accent-amber">{s.bcast}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function NetworkingSubnetting() {
  return (
    <LessonLayout
      lessonId="net-03"
      courseId="networking"
      title="Subnetting & CIDR"
      courseTitle="Network Fundamentals"
      courseHref="/networking"
      xp={90}
      readTime="~40 min"
      icon="🔢"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Networking', href: '/networking' },
        { label: 'Subnetting & CIDR' },
      ]}
      prev={{ title: 'TCP/IP & the Internet Protocol Suite', href: '/networking/tcp-ip' }}
      next={{ title: 'VLANs & Switching',                   href: '/networking/vlans' }}
      objectives={[
        'Calculate network address, broadcast, and host range for any CIDR block',
        'Divide a network into equal or variable-sized subnets',
        'Apply VLSM to right-size subnets and avoid address waste',
        'Identify all RFC 1918 private ranges and special-purpose addresses',
        'Use ipcalc and Python to automate subnet calculations',
        'Design a subnetting scheme for a multi-site lab network',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Subnetting is the process of dividing a large IP network into smaller, more
          manageable segments. Every network engineer and sysadmin must be able to subnet
          quickly and confidently — in interviews, in the field at 3am, and when planning
          infrastructure.
        </p>
        <Callout type="info" icon="📐" title="The two skills you need">
          1. Given an IP and prefix, calculate the network address, broadcast, and host range.
          2. Given a network and a number of required subnets/hosts, choose the right prefix length.
          Everything else follows from these two.
        </Callout>
      </section>

      <section>
        <h2>The Binary Foundation</h2>
        <p>
          Every subnet calculation is fundamentally binary. You don't need to do it in your
          head, but understanding the binary basis prevents mistakes.
        </p>
        <div className="info-card mt-4 overflow-hidden">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            192.168.100.20/24 — step by step
          </p>
          <div className="font-mono text-xs space-y-2 overflow-x-auto">
            <div className="min-w-[480px] space-y-2">
              {[
                { label: 'IP address', value: '11000000.10101000.01100100.00010100', decimal: '192.168.100.20' },
                { label: 'Subnet mask', value: '11111111.11111111.11111111.00000000', decimal: '255.255.255.0' },
                { label: 'Network (AND)', value: '11000000.10101000.01100100.00000000', decimal: '192.168.100.0', color: 'text-brand-300' },
                { label: 'Broadcast', value: '11000000.10101000.01100100.11111111', decimal: '192.168.100.255', color: 'text-accent-amber' },
              ].map(r => (
                <div key={r.label} className="flex gap-4 items-center">
                  <span className={`w-28 flex-shrink-0 text-right text-[10px] text-slate-500`}>{r.label}</span>
                  <span className={r.color || 'text-slate-400'}>{r.value}</span>
                  <span className={`text-[11px] ${r.color || 'text-slate-500'}`}>({r.decimal})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>Subnetting Formula Reference</h2>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {[
            { formula: '2ⁿ', what: 'Number of subnets created', where: 'n = bits borrowed from host portion', example: 'Borrow 2 bits → 4 subnets' },
            { formula: '2ʰ − 2', what: 'Usable hosts per subnet', where: 'h = host bits remaining', example: '/26 has 6 host bits → 62 hosts' },
            { formula: '256 − mask', what: 'Block size (subnet increment)', where: 'mask = last non-255 octet of mask', example: 'Mask 224 → block 32' },
            { formula: 'N × block', what: 'Start of Nth subnet', where: 'N=0,1,2... × block size', example: '4th /26 → 3×64 = .192' },
          ].map(f => (
            <div key={f.formula} className="info-card py-4">
              <div className="flex items-center gap-3 mb-2">
                <code className="text-2xl font-black text-brand-300 font-mono">{f.formula}</code>
                <p className="text-sm font-semibold text-white">{f.what}</p>
              </div>
              <p className="text-xs text-slate-500 mb-1">{f.where}</p>
              <p className="text-xs text-accent-amber font-mono">{f.example}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Interactive Subnet Divider</h2>
        <p className="text-sm text-slate-400 mb-2">
          Enter a base /24 network and choose how many equal subnets to create.
        </p>
        <SubnetDivider />
      </section>

      <section>
        <h2>VLSM — Right-Sizing Your Subnets</h2>
        <p>
          Instead of equal-sized subnets, VLSM assigns each segment exactly as many
          addresses as it needs.
        </p>
        <div className="info-card mt-4 overflow-x-auto">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Example: Design subnets for 10.10.0.0/16
          </p>
          <table className="w-full text-xs font-mono min-w-[550px]">
            <thead>
              <tr className="border-b border-surface-700">
                {['Segment', 'Required Hosts', 'Prefix', 'Subnet', 'Usable Range'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-700/50">
              {[
                { seg: 'Data Centre',     hosts: 500,  prefix: '/23', subnet: '10.10.0.0/23',   range: '10.10.0.1–10.10.1.254' },
                { seg: 'Staff LAN',       hosts: 200,  prefix: '/24', subnet: '10.10.2.0/24',   range: '10.10.2.1–10.10.2.254' },
                { seg: 'Server VLAN',     hosts: 50,   prefix: '/26', subnet: '10.10.3.0/26',   range: '10.10.3.1–10.10.3.62' },
                { seg: 'Management',      hosts: 20,   prefix: '/27', subnet: '10.10.3.64/27',  range: '10.10.3.65–10.10.3.94' },
                { seg: 'DMZ',             hosts: 10,   prefix: '/28', subnet: '10.10.3.96/28',  range: '10.10.3.97–10.10.3.110' },
                { seg: 'WAN Link A↔B',  hosts: 2,    prefix: '/30', subnet: '10.10.3.112/30', range: '10.10.3.113–10.10.3.114' },
              ].map(r => (
                <tr key={r.seg} className="hover:bg-surface-700/30">
                  <td className="px-3 py-2 text-slate-300 font-sans">{r.seg}</td>
                  <td className="px-3 py-2 text-accent-amber">{r.hosts}</td>
                  <td className="px-3 py-2 text-brand-300 font-bold">{r.prefix}</td>
                  <td className="px-3 py-2 text-accent-cyan">{r.subnet}</td>
                  <td className="px-3 py-2 text-slate-400">{r.range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB NET-3</span>
            <span className="text-sm font-semibold text-white">Subnetting with ipcalc and Python</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Use ipcalc to verify subnet calculations on the Ubuntu VM."
              command={CODE_NETWORKINGSUBNETTING_1}
              output={CODE_NETWORKINGSUBNETTING_2}
            />
            <LabStep number={2}
              description="Use Python's ipaddress module — the production way to do subnet math."
              command={CODE_NETWORKINGSUBNETTING_3}
              output={CODE_NETWORKINGSUBNETTING_4}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="net-03" title="Subnetting & CIDR Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={45} />
      </section>
    </LessonLayout>
  )
}
