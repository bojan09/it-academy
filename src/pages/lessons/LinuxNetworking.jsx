import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'
import GlossaryTooltip from '../../components/GlossaryTooltip.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_LINUXNETWORKING_1 = `# ── Interface management ────────────────────────────────────
ip addr show                    # All interfaces and IPs
ip addr show eth0               # Specific interface
ip addr add 192.168.100.50/24 dev eth0    # Add IP (temporary)
ip addr del 192.168.100.50/24 dev eth0   # Remove IP
ip link show                    # Interface state info
ip link set eth0 up             # Bring interface up
ip link set eth0 down           # Bring interface down
ip link set eth0 mtu 9000       # Set jumbo frames

# ── Routing ─────────────────────────────────────────────────
ip route show                   # Routing table
ip route show table all         # All routing tables
ip route add default via 192.168.100.1          # Set default GW
ip route add 10.0.0.0/8 via 192.168.100.254     # Static route
ip route del 10.0.0.0/8                         # Delete route
ip route get 8.8.8.8            # Which route would be used?

# ── ARP / Neighbour table ────────────────────────────────────
ip neigh show                   # ARP table (replaces arp -n)
ip neigh flush all              # Clear ARP cache

# ── Statistics ──────────────────────────────────────────────
ip -s link show eth0            # Packet/error counters
ss -s                           # Socket statistics summary`
const CODE_LINUXNETWORKING_2 = `network:
  version: 2
  renderer: networkd        # Use systemd-networkd backend

  ethernets:
    eth0:                   # Interface name (check with: ip link show)
      dhcp4: false          # Disable DHCP for IPv4
      dhcp6: false          # Disable DHCP for IPv6

      addresses:
        - 192.168.100.20/24  # Static IP and prefix length

      routes:
        - to: default        # Default route (gateway)
          via: 192.168.100.1

      nameservers:
        addresses:
          - 192.168.100.10   # Primary DNS (DC01)
          - 8.8.8.8          # Secondary DNS (Google fallback)
        search:
          - lab.local        # DNS search domain`
const CODE_LINUXNETWORKING_3 = `# Test config without applying (dry run)
sudo netplan try              # Applies for 120s, auto-reverts if no confirmation

# Apply permanently
sudo netplan apply

# Generate config files without applying (debug)
sudo netplan generate

# If something breaks — check for syntax errors
sudo netplan --debug apply

# View effective network config
resolvectl status             # DNS resolution status
resolvectl dns                # Active DNS servers`
const CODE_LINUXNETWORKING_4 = `# Modern DNS lookup (replaces nslookup)
dig dc01.lab.local                    # Forward lookup
dig -x 192.168.100.10                 # Reverse lookup (PTR)
dig @192.168.100.10 lab.local SOA     # Query specific server
dig +short google.com A               # Short output

# nslookup (still widely used)
nslookup dc01.lab.local
nslookup dc01.lab.local 192.168.100.10  # Use specific server

# systemd-resolved (Ubuntu modern)
resolvectl query dc01.lab.local
resolvectl statistics
resolvectl flush-caches

# Check what DNS servers are actually being used
cat /etc/resolv.conf
resolvectl dns eth0`
const CODE_LINUXNETWORKING_5 = `# ── Layer 1/2: Interface ────────────────────────────────────
ip link show                          # Check link state (UP/DOWN)
ethtool eth0                          # Physical link speed and duplex
ip -s link show eth0                  # Packet/error/drop counters

# ── Layer 3: IP & Routing ────────────────────────────────────
ip addr show                          # Check IP assignment
ip route show                         # Check routing table
ping -c 4 192.168.100.1               # Ping gateway
ping -c 4 8.8.8.8                     # Ping external (tests routing)
traceroute 8.8.8.8                    # Trace path (UDP)
tracepath 8.8.8.8                     # Trace path (no root needed)
mtr --report 8.8.8.8                  # Combined ping+traceroute

# ── Layer 4: TCP/UDP ─────────────────────────────────────────
ss -tlnp                              # Listening TCP ports + process
ss -tlnp state established            # Active connections
ss -udp -i                            # UDP sockets
nc -zv 192.168.100.10 389             # Test TCP port connectivity

# ── Layer 7: Application ─────────────────────────────────────
curl -I https://example.com           # HTTP headers
curl -v http://192.168.100.10         # Verbose HTTP debug
wget --spider https://example.com     # Test URL without downloading

# ── Packet capture ───────────────────────────────────────────
sudo tcpdump -i eth0 -n                        # All traffic
sudo tcpdump -i eth0 -n port 53                # DNS only
sudo tcpdump -i eth0 -n host 192.168.100.10    # Specific host
sudo tcpdump -i eth0 -n -w /tmp/cap.pcap       # Save to file`
const CODE_LINUXNETWORKING_6 = `# Check interface name (may be ens33, eth0, or enp3s0)
ip link show

# Check current IP, gateway, and DNS
ip addr show
ip route show
cat /etc/resolv.conf
resolvectl status | head -20`
const CODE_LINUXNETWORKING_7 = `2: ens33: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP
    link/ether 00:0c:29:ab:cd:ef brd ff:ff:ff:ff:ff:ff
    inet 192.168.100.20/24 brd 192.168.100.255 scope global ens33`
const CODE_LINUXNETWORKING_8 = `# Backup existing config
sudo cp /etc/netplan/00-installer-config.yaml \\
        /etc/netplan/00-installer-config.yaml.bak

# Write the correct config (replace ens33 with YOUR interface name)
sudo tee /etc/netplan/00-lab-config.yaml > /dev/null << 'EOF'
network:
  version: 2
  renderer: networkd
  ethernets:
    ens33:
      dhcp4: false
      addresses: [192.168.100.20/24]
      routes:
        - to: default
          via: 192.168.100.1
      nameservers:
        addresses: [192.168.100.10, 8.8.8.8]
        search: [lab.local]
EOF

# Test before applying
sudo netplan try`
const CODE_LINUXNETWORKING_9 = `# L3: Can we reach the gateway?
ping -c 3 192.168.100.1

# L3: Can we reach DC01?
ping -c 3 192.168.100.10

# L3: Can we reach the internet?
ping -c 3 8.8.8.8

# L7: DNS resolution via DC01
dig @192.168.100.10 dc01.lab.local +short

# L7: Internet DNS
dig google.com +short | head -3

# Port test: is LDAP open on DC01?
nc -zv 192.168.100.10 389 && echo "LDAP open ✔"`
const CODE_LINUXNETWORKING_10 = `PING 192.168.100.1: 64 bytes, time=0.421ms ✔
PING 192.168.100.10: 64 bytes, time=0.633ms ✔
PING 8.8.8.8: 64 bytes, time=12.5ms ✔
192.168.100.10
142.250.80.46
Connection to 192.168.100.10 389 port [tcp/ldap] succeeded! ✔`
const CODE_LINUXNETWORKING_11 = `# Open second terminal, start capture
sudo tcpdump -i ens33 -n port 53 &
TCPDUMP_PID=$!

# Trigger DNS lookups
dig dc01.lab.local
dig google.com

# Stop capture
sleep 2 && kill $TCPDUMP_PID`
const CODE_LINUXNETWORKING_12 = `10:15:22 192.168.100.20.52341 > 192.168.100.10.53: A? dc01.lab.local
10:15:22 192.168.100.10.53 > 192.168.100.20.52341: A 192.168.100.10
10:15:23 192.168.100.20.51422 > 192.168.100.10.53: A? google.com
10:15:23 192.168.100.10.53 > 192.168.100.20.51422: A 142.250.80.46 (forwarded)`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'Which command shows all IP addresses assigned to all network interfaces on a Linux system?',
    options: ['ifconfig -a', 'ip addr show', 'netstat -i', 'route -n'],
    correct: 1,
    explanation: 'ip addr show (or ip a for short) is the modern replacement for ifconfig. It displays all interfaces, their IP addresses, MAC addresses, and states. ifconfig is from the deprecated net-tools package and should not be used on modern systems.',
  },
  {
    id: 'q2',
    question: 'What does the Netplan configuration file format use?',
    options: ['XML', 'INI/INF format', 'YAML', 'JSON'],
    correct: 2,
    explanation: 'Netplan uses YAML configuration files stored in /etc/netplan/. After editing, apply with "sudo netplan apply". Netplan is the default network configuration tool on Ubuntu 18.04+ and generates configuration for either NetworkManager or systemd-networkd backends.',
  },
  {
    id: 'q3',
    question: 'Which command shows active TCP listening ports and the process using each port?',
    options: ['netstat -tulpn', 'ss -tlnp', 'lsof -i', 'All of the above show this information'],
    correct: 3,
    explanation: 'All three commands can show listening TCP ports with process information. ss -tlnp is the modern preferred tool (replaces netstat from deprecated net-tools). lsof -i shows file-based network connections. netstat -tulpn still works on systems with net-tools installed. In practice, ss -tlnp is the recommended current approach.',
  },
  {
    id: 'q4',
    question: 'What does "ip route add default via 192.168.100.1" do?',
    options: [
      'Adds a static route to the 192.168.100.0/24 network',
      'Replaces the DNS server with 192.168.100.1',
      'Sets 192.168.100.1 as the default gateway for all traffic with no more specific route',
      'Configures 192.168.100.1 as a secondary IP on the default interface',
    ],
    correct: 2,
    explanation: 'The default route (0.0.0.0/0) matches all traffic with no more specific route. "via 192.168.100.1" specifies the next-hop gateway. This is equivalent to setting a default gateway. The route is temporary (lost on reboot) — for persistence, add it to Netplan or /etc/network/interfaces.',
  },
  {
    id: 'q5',
    question: 'What file on Ubuntu/Debian systems configures the DNS resolver (which servers to query)?',
    options: ['/etc/hosts', '/etc/resolv.conf', '/etc/dns.conf', '/etc/systemd/network/dns.conf'],
    correct: 1,
    explanation: '/etc/resolv.conf contains the DNS resolver configuration: nameserver entries for DNS servers and search domain settings. On modern Ubuntu with systemd-resolved, this file is a symlink to /run/systemd/resolve/stub-resolv.conf. Use resolvectl to query and manage DNS settings on systemd-resolved systems.',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info: 'callout-info', warning: 'callout-warning', danger: 'callout-danger', success: 'callout-success' }
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

export default function LinuxNetworking() {
  return (
    <LessonLayout
      lessonId="linux-06"
      courseId="linux"
      title="Linux Networking"
      courseTitle="Linux Fundamentals"
      courseHref="/linux"
      xp={80}
      readTime="~35 min"
      icon="🌐"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Linux Fundamentals', href: '/linux' },
        { label: 'Linux Networking' },
      ]}
      prev={{ title: 'systemd & Service Management', href: '/linux/systemd' }}
      next={{ title: 'SSH & Remote Access',          href: '/linux/ssh' }}
      objectives={[
        'Read and interpret ip addr, ip route, and ss output',
        'Configure static IPs persistently using Netplan',
        'Manage routing tables and add static routes',
        'Diagnose connectivity with ping, traceroute, dig, and tcpdump',
        'Understand Linux network namespaces and bonding concepts',
        'Read and configure /etc/hosts and /etc/resolv.conf',
      ]}
    >
      {/* ── OVERVIEW ── */}
      <section>
        <h2>Overview</h2>
        <p>
          Linux networking is managed through a modern toolset built around the
          <code className="font-mono text-accent-cyan text-sm mx-1">iproute2</code> package —
          replacing the legacy <code className="font-mono text-accent-cyan text-sm">net-tools</code> commands
          (<code className="font-mono text-accent-cyan text-sm">ifconfig</code>,
          <code className="font-mono text-accent-cyan text-sm">route</code>,
          <code className="font-mono text-accent-cyan text-sm">netstat</code>).
          Understanding both is important since you'll encounter legacy tools on older systems.
        </p>
        <p className="mt-4">
          On Ubuntu Server, network configuration is managed by <strong>Netplan</strong> which
          generates config for the <strong>systemd-networkd</strong> backend. This lesson covers
          the complete stack: interface management, IP configuration, routing, DNS, and
          network diagnostics.
        </p>

        <div className="info-card mt-6 overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-surface-700">
            <div className="p-4">
              <p className="text-[10px] font-semibold text-accent-red uppercase tracking-widest mb-3">
                ❌ Legacy (net-tools) — avoid
              </p>
              <div className="space-y-1.5 font-mono text-xs text-slate-500">
                {['ifconfig eth0', 'route -n', 'netstat -tulpn', 'arp -n'].map(c => (
                  <div key={c}>{c}</div>
                ))}
              </div>
            </div>
            <div className="p-4">
              <p className="text-[10px] font-semibold text-accent-green uppercase tracking-widest mb-3">
                ✅ Modern (iproute2) — use these
              </p>
              <div className="space-y-1.5 font-mono text-xs text-accent-green">
                {['ip addr show', 'ip route show', 'ss -tulpn', 'ip neigh show'].map(c => (
                  <div key={c}>{c}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IP COMMAND ── */}
      <section>
        <h2>The ip Command — Complete Reference</h2>
        <CodeBlock title="ip command — all essential operations" language="bash" code={CODE_LINUXNETWORKING_1} />
      </section>

      {/* ── NETPLAN CONFIG ── */}
      <section>
        <h2>Netplan — Persistent Configuration</h2>
        <p>
          Changes made with <code className="font-mono text-accent-cyan text-sm">ip</code> commands are
          <strong> temporary</strong> and lost on reboot. For persistent configuration on Ubuntu,
          use Netplan YAML files in <code className="font-mono text-accent-cyan text-sm">/etc/netplan/</code>.
        </p>

        <CodeBlock className="mt-4" title="/etc/netplan/00-lab-config.yaml — static IP with DNS" language="bash"
          code={CODE_LINUXNETWORKING_2} />

        <CodeBlock className="mt-4" title="Apply, test, and troubleshoot Netplan" language="bash"
          code={CODE_LINUXNETWORKING_3} />
      </section>

      {/* ── DNS RESOLUTION ── */}
      <section>
        <h2>DNS Resolution in Linux</h2>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {[
            {
              file: '/etc/hosts',
              desc: 'Static hostname-to-IP mappings. Checked before DNS. Useful for lab overrides and blocking domains.',
              example: '192.168.100.10  dc01.lab.local dc01\n192.168.100.20  srv01.lab.local srv01',
            },
            {
              file: '/etc/resolv.conf',
              desc: 'DNS server configuration. On modern Ubuntu, this is a symlink managed by systemd-resolved. Edit via Netplan.',
              example: 'nameserver 192.168.100.10\nnameserver 8.8.8.8\nsearch lab.local',
            },
          ].map(f => (
            <div key={f.file} className="info-card py-4">
              <code className="text-accent-cyan text-sm font-mono font-bold">{f.file}</code>
              <p className="text-xs text-slate-400 leading-relaxed mt-2 mb-3">{f.desc}</p>
              <div className="rounded-lg bg-surface-950 border border-surface-700 px-3 py-2
                              font-mono text-[11px] text-accent-green">
                {f.example.split('\n').map((l, i) => <div key={i}>{l}</div>)}
              </div>
            </div>
          ))}
        </div>

        <CodeBlock className="mt-4" title="DNS diagnostic commands" language="bash"
          code={CODE_LINUXNETWORKING_4} />
      </section>

      {/* ── DIAGNOSTICS ── */}
      <section>
        <h2>Network Diagnostics Toolkit</h2>
        <CodeBlock title="Complete diagnostic workflow" language="bash" code={CODE_LINUXNETWORKING_5} />
      </section>

      {/* ── VMware LAB ── */}
      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB LINUX-6</span>
            <span className="text-sm font-semibold text-white">Configure Networking and Diagnose Connectivity</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~25 min</span>
          </div>
          <div className="lab-body space-y-8">

            <LabStep number={1}
              description="Audit the current network configuration on the Ubuntu Server VM."
              command={CODE_LINUXNETWORKING_6}
              output={CODE_LINUXNETWORKING_7}
            />

            <LabStep number={2}
              description="Verify and update the Netplan static IP configuration. Check your interface name first!"
              command={CODE_LINUXNETWORKING_8}
            />

            <LabStep number={3}
              description="Run a full connectivity diagnostic to confirm all layers are working."
              command={CODE_LINUXNETWORKING_9}
              output={CODE_LINUXNETWORKING_10}
            />

            <LabStep number={4}
              description="Capture DNS traffic with tcpdump to see what happens when you do a lookup."
              command={CODE_LINUXNETWORKING_11}
              output={CODE_LINUXNETWORKING_12}
            />

            <Callout type="success" icon="✅" title="Lab Complete">
              Static IP is configured persistently via Netplan, all connectivity layers
              verified, DNS working through DC01 with forwarding to the internet,
              and you've captured live DNS traffic with tcpdump.
            </Callout>
          </div>
        </div>
      </section>

      {/* ── QUIZ ── */}
      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to earn bonus XP.</p>
        <Quiz lessonId="linux-06" title="Linux Networking Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={40} />
      </section>
    </LessonLayout>
  )
}
