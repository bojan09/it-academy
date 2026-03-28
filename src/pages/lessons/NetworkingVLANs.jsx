import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_NETWORKINGVLANS_1 = `sudo apt install vlan -y
sudo modprobe 8021q

# Make it persist across reboots
echo '8021q' | sudo tee -a /etc/modules

# Confirm module is loaded
lsmod | grep 8021q`
const CODE_NETWORKINGVLANS_2 = `# Create VLAN 10 subinterface
sudo ip link add link ens33 name ens33.10 type vlan id 10
sudo ip addr add 10.10.10.1/24 dev ens33.10
sudo ip link set ens33.10 up

# Create VLAN 20 subinterface
sudo ip link add link ens33 name ens33.20 type vlan id 20
sudo ip addr add 10.10.20.1/24 dev ens33.20
sudo ip link set ens33.20 up

# Verify
ip addr show | grep ens33`
const CODE_NETWORKINGVLANS_3 = `2: ens33: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.100.20/24
3: ens33.10@ens33: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.10.10.1/24   ← VLAN 10
4: ens33.20@ens33: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.10.20.1/24   ← VLAN 20`
const CODE_NETWORKINGVLANS_4 = `sudo tee /etc/netplan/10-vlans.yaml << 'EOF'
network:
  version: 2
  vlans:
    ens33.10:
      id: 10
      link: ens33
      addresses: [10.10.10.1/24]
    ens33.20:
      id: 20
      link: ens33
      addresses: [10.10.20.1/24]
EOF
sudo netplan apply
ip route show | grep 10.10`
const CODE_NETWORKINGVLANS_5 = `10.10.10.0/24 dev ens33.10 proto kernel scope link src 10.10.10.1
10.10.20.0/24 dev ens33.20 proto kernel scope link src 10.10.20.1`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the primary purpose of a VLAN?',
    options: [
      'To increase network speed by reducing packet size',
      'To logically segment a network at Layer 2, isolating broadcast domains without requiring separate physical switches',
      'To encrypt traffic between network segments',
      'To assign static IP addresses to devices automatically',
    ],
    correct: 1,
    explanation: 'VLANs (Virtual LANs) create logical Layer 2 segments on a single physical switch. Devices in different VLANs cannot communicate at Layer 2 — broadcasts stay within each VLAN. This provides security isolation, traffic management, and broadcast control without buying separate physical hardware for each segment.',
  },
  {
    id: 'q2',
    question: 'What is the difference between an access port and a trunk port?',
    options: [
      'Access ports are faster; trunk ports have security restrictions',
      'An access port carries traffic for ONE VLAN (for end devices); a trunk port carries traffic for MULTIPLE VLANs using 802.1Q tags (for switch-to-switch or switch-to-router links)',
      'Access ports are wireless; trunk ports are wired',
      'Access ports require authentication; trunk ports do not',
    ],
    correct: 1,
    explanation: 'An access port is assigned to a single VLAN — the end device connected to it (PC, server, printer) does not know about VLANs. A trunk port carries multiple VLANs simultaneously using IEEE 802.1Q tagging, which adds a 4-byte header to each Ethernet frame identifying its VLAN. Trunk ports connect switches to other switches, routers, or hypervisors.',
  },
  {
    id: 'q3',
    question: 'What is "inter-VLAN routing" and why is it needed?',
    options: [
      'A method of speeding up traffic between VLANs on the same switch',
      'A Layer 3 process (router or Layer 3 switch) required for devices in different VLANs to communicate with each other',
      'A security feature that logs traffic crossing VLAN boundaries',
      'A protocol for synchronising VLAN configurations across multiple switches',
    ],
    correct: 1,
    explanation: 'VLANs are Layer 2 segments — devices in different VLANs are isolated from each other. To route traffic between VLANs you need a Layer 3 device: a router (Router-on-a-Stick with subinterfaces) or a Layer 3 switch. The router/L3 switch has an IP address on each VLAN that serves as the default gateway for hosts in that VLAN.',
  },
  {
    id: 'q4',
    question: 'What is the "native VLAN" on a trunk port?',
    options: [
      'The VLAN with the highest priority on the trunk',
      'The management VLAN used to administer the switch',
      'The VLAN whose traffic traverses a trunk port WITHOUT an 802.1Q tag — must match on both ends of a trunk',
      'The default VLAN assigned to all access ports',
    ],
    correct: 2,
    explanation: 'The native VLAN is the one VLAN on a trunk whose traffic is sent UNTAGGED. VLAN 1 is the default native VLAN on Cisco switches. A security best practice is to change the native VLAN to an unused VLAN ID — this prevents VLAN hopping attacks where an attacker sends double-tagged frames to jump to a different VLAN. Both ends of a trunk must agree on the native VLAN.',
  },
  {
    id: 'q5',
    question: 'What is Spanning Tree Protocol (STP) and why is it necessary in switched networks?',
    options: [
      'A protocol that encrypts traffic on trunk ports between switches',
      'A protocol that prevents Layer 2 broadcast storms by disabling redundant links and creating a loop-free topology',
      'A protocol for automatically assigning VLANs to new devices',
      'A protocol that balances traffic load across multiple uplinks simultaneously',
    ],
    correct: 1,
    explanation: 'Without STP, redundant switch connections create loops. A broadcast frame entering a loop circulates forever, duplicating endlessly and consuming all bandwidth — a broadcast storm that crashes the network. STP automatically detects loops and blocks redundant ports, maintaining exactly one active path between any two switches. Modern variants: RSTP (fast convergence), MSTP (per-VLAN), PVST+ (Cisco).',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info: 'callout-info', warning: 'callout-warning', success: 'callout-success', danger: 'callout-danger' }
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

export default function NetworkingVLANs() {
  return (
    <LessonLayout
      lessonId="net-04"
      courseId="networking"
      title="VLANs & Switching"
      courseTitle="Network Fundamentals"
      courseHref="/networking"
      xp={80}
      readTime="~35 min"
      icon="🔀"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Networking', href: '/networking' },
        { label: 'VLANs & Switching' },
      ]}
      prev={{ title: 'Subnetting & CIDR',    href: '/networking/subnetting' }}
      next={{ title: 'Routing Fundamentals', href: '/networking/routing' }}
      objectives={[
        'Explain how VLANs segment Layer 2 networks and why this matters',
        'Distinguish access ports from trunk ports and configure each',
        'Understand 802.1Q tagging and the native VLAN',
        'Configure inter-VLAN routing with a router-on-a-stick',
        'Understand Spanning Tree Protocol and why it exists',
        'Model VLAN configurations in the VMware lab using virtual switches',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Before VLANs, every department in a building needed its own physical switch.
          VLANs let one physical switch behave like many — segmenting traffic logically,
          isolating broadcast domains, and enforcing security boundaries between departments
          without additional hardware.
        </p>
        <p className="mt-4">
          This lesson covers the full VLAN stack: access ports, trunk ports, 802.1Q
          tagging, inter-VLAN routing, and Spanning Tree — the background knowledge
          you need before configuring VLANs in Hyper-V, VMware vSphere, or any
          enterprise networking environment.
        </p>
      </section>

      <section>
        <h2>VLAN Architecture</h2>
        <div className="info-card mt-4 overflow-hidden">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 px-2">
            Typical VLAN layout — one physical switch, four logical segments
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { id: 10, name: 'Staff',      color: 'bg-brand-500/15 border-brand-500/30 text-brand-300',       subnet: '10.10.10.0/24' },
              { id: 20, name: 'Servers',    color: 'bg-accent-cyan/15 border-accent-cyan/30 text-accent-cyan',  subnet: '10.10.20.0/24' },
              { id: 30, name: 'Management', color: 'bg-accent-amber/15 border-accent-amber/30 text-accent-amber', subnet: '10.10.30.0/24' },
              { id: 40, name: 'DMZ',        color: 'bg-accent-red/15 border-accent-red/30 text-accent-red',     subnet: '10.10.40.0/24' },
            ].map(v => (
              <div key={v.id} className={`rounded-xl border p-4 text-center ${v.color}`}>
                <p className="text-2xl font-black font-mono">{v.id}</p>
                <p className="text-sm font-bold mt-1">{v.name}</p>
                <p className="text-[11px] font-mono mt-1 opacity-80">{v.subnet}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-surface-700 p-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Each VLAN is a separate broadcast domain. A device in VLAN 10 cannot
              reach VLAN 20 without going through a Layer 3 router or L3 switch
              (inter-VLAN routing). This is the security boundary.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>Access Ports vs Trunk Ports</h2>
        <div className="grid sm:grid-cols-2 gap-5 mt-4">
          {[
            {
              name: 'Access Port',
              icon: '💻',
              color: 'border-brand-500/25 bg-brand-500/5',
              text: 'text-brand-300',
              desc: 'Carries traffic for exactly ONE VLAN. End devices (PCs, servers, printers) are connected here. The device does not know it is on a VLAN.',
              connects: ['End-user PCs', 'Servers', 'Printers', 'Access points', 'IP phones'],
              config: 'switchport mode access\nswitchport access vlan 10',
            },
            {
              name: 'Trunk Port',
              icon: '🔀',
              color: 'border-accent-cyan/25 bg-accent-cyan/5',
              text: 'text-accent-cyan',
              desc: 'Carries traffic for MULTIPLE VLANs using 802.1Q tags. Used on uplinks between network devices.',
              connects: ['Switch → Switch uplinks', 'Switch → Router', 'Switch → Firewall', 'Switch → Hypervisor (ESXi/Hyper-V)', 'Switch → WAP controller'],
              config: 'switchport mode trunk\nswitchport trunk allowed vlan 10,20,30,40',
            },
          ].map(p => (
            <div key={p.name} className={`card p-5 border ${p.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{p.icon}</span>
                <p className={`font-bold ${p.text}`}>{p.name}</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{p.desc}</p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Connects</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {p.connects.map(c => <span key={c} className="tag text-[10px]">{c}</span>)}
              </div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Cisco Config</p>
              <pre className="text-[11px] font-mono text-slate-400 leading-relaxed">{p.config}</pre>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>802.1Q Tagging</h2>
        <p>
          When a frame travels over a trunk port, a 4-byte 802.1Q tag is inserted into
          the Ethernet header to identify which VLAN the frame belongs to.
        </p>
        <div className="info-card mt-4 overflow-x-auto">
          <div className="font-mono text-xs min-w-[500px]">
            <div className="flex gap-0 mb-2">
              {[
                { field: 'Dst MAC', bytes: '6B', color: 'bg-surface-700 text-slate-400' },
                { field: 'Src MAC', bytes: '6B', color: 'bg-surface-700 text-slate-400' },
                { field: '802.1Q Tag', bytes: '4B', color: 'bg-brand-500/20 text-brand-300', highlight: true },
                { field: 'EtherType', bytes: '2B', color: 'bg-surface-700 text-slate-400' },
                { field: 'Payload', bytes: '46-1500B', color: 'bg-surface-700 text-slate-400' },
                { field: 'FCS', bytes: '4B', color: 'bg-surface-700 text-slate-400' },
              ].map(f => (
                <div key={f.field} className={`flex-1 border border-surface-600 p-2 text-center ${f.color} ${f.highlight ? 'border-brand-500/40' : ''}`}>
                  <p className="font-bold text-[10px]">{f.field}</p>
                  <p className="text-[9px] opacity-70 mt-0.5">{f.bytes}</p>
                </div>
              ))}
            </div>
            <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-3 mt-3">
              <p className="text-[10px] font-semibold text-brand-300 mb-2">802.1Q Tag (4 bytes) breakdown:</p>
              <div className="flex gap-3 flex-wrap">
                {[
                  { field: 'TPID (0x8100)', bits: '16 bits', desc: 'Identifies frame as 802.1Q tagged' },
                  { field: 'PCP', bits: '3 bits', desc: 'Priority Code Point (QoS)' },
                  { field: 'DEI', bits: '1 bit', desc: 'Drop Eligible Indicator' },
                  { field: 'VLAN ID', bits: '12 bits', desc: 'VLAN number (1–4094)' },
                ].map(t => (
                  <div key={t.field} className="text-[10px]">
                    <span className="text-brand-300 font-bold">{t.field}</span>
                    <span className="text-slate-500 ml-1">({t.bits})</span>
                    <span className="text-slate-500 ml-1">— {t.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>VMware Lab — Simulating VLANs</h2>
        <Callout type="info" icon="🧪" title="Lab approach">
          Physical VLAN configuration requires managed switches. In our VMware lab we
          simulate VLAN concepts using virtual network adapters and Linux subinterfaces.
          This demonstrates the exact same 802.1Q concepts used on real switches.
        </Callout>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB NET-4</span>
            <span className="text-sm font-semibold text-white">Configure VLAN Subinterfaces on Ubuntu</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Install the VLAN package and load the 802.1Q kernel module."
              command={CODE_NETWORKINGVLANS_1}
              output="8021q                  32768  0"
            />
            <LabStep number={2}
              description="Create VLAN subinterfaces on ens33 to simulate trunk port behaviour."
              command={CODE_NETWORKINGVLANS_2}
              output={CODE_NETWORKINGVLANS_3}
            />
            <LabStep number={3}
              description="Make VLAN configuration persistent with Netplan."
              command={CODE_NETWORKINGVLANS_4}
              output={CODE_NETWORKINGVLANS_5}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="net-04" title="VLANs & Switching Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={40} />
      </section>
    </LessonLayout>
  )
}
