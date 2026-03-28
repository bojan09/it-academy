import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'
import GlossaryTooltip from '../../components/GlossaryTooltip.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_LINUXFIREWALL_1 = `#!/bin/bash
# server-firewall.sh — Hardened iptables ruleset for a Linux server
# Run as root. Review before applying to production.

IPT=/sbin/iptables
ADMIN_NET="192.168.100.0/24"  # Management network

# ── Flush all existing rules ────────────────────────────────
$IPT -F          # Flush filter chains
$IPT -X          # Delete custom chains
$IPT -Z          # Zero counters

# ── Set default policies ────────────────────────────────────
$IPT -P INPUT   DROP    # Drop all inbound by default
$IPT -P FORWARD DROP    # No forwarding by default
$IPT -P OUTPUT  ACCEPT  # Allow all outbound

# ── Allow loopback ──────────────────────────────────────────
$IPT -A INPUT -i lo -j ACCEPT
$IPT -A OUTPUT -o lo -j ACCEPT

# ── Allow established/related connections (stateful) ────────
$IPT -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# ── Allow ICMP (ping) from management network only ─────────
$IPT -A INPUT -s $ADMIN_NET -p icmp --icmp-type echo-request -j ACCEPT

# ── SSH: allow from management network, rate-limit ─────────
$IPT -A INPUT -s $ADMIN_NET -p tcp --dport 22 \\
  -m conntrack --ctstate NEW \\
  -m recent --set --name SSH_LIMIT
$IPT -A INPUT -s $ADMIN_NET -p tcp --dport 22 \\
  -m recent --update --seconds 60 --hitcount 4 --name SSH_LIMIT \\
  -j LOG --log-prefix "[SSH-BRUTE] " --log-level 6
$IPT -A INPUT -s $ADMIN_NET -p tcp --dport 22 \\
  -m recent --update --seconds 60 --hitcount 4 --name SSH_LIMIT \\
  -j DROP
$IPT -A INPUT -s $ADMIN_NET -p tcp --dport 22 \\
  -m conntrack --ctstate NEW -j ACCEPT

# ── Web server (if applicable) ──────────────────────────────
# $IPT -A INPUT -p tcp --dport 80  -j ACCEPT
# $IPT -A INPUT -p tcp --dport 443 -j ACCEPT

# ── Log and drop everything else ────────────────────────────
$IPT -A INPUT -m limit --limit 5/min -j LOG \\
  --log-prefix "[IPTABLES-DROP] " --log-level 6
$IPT -A INPUT -j DROP

echo "✔ Firewall rules applied"
$IPT -L -v -n`
const CODE_LINUXFIREWALL_2 = `# ── Initial setup ───────────────────────────────────────────
sudo ufw default deny incoming    # Block all inbound by default
sudo ufw default allow outgoing   # Allow all outbound
sudo ufw enable                   # Enable the firewall
sudo ufw status verbose           # Show all rules

# ── Allow by service name ─────────────────────────────────
sudo ufw allow ssh                # Port 22 TCP
sudo ufw allow http               # Port 80 TCP
sudo ufw allow https              # Port 443 TCP

# ── Allow by port number ──────────────────────────────────
sudo ufw allow 8080/tcp
sudo ufw allow 53/udp
sudo ufw allow 5900:5910/tcp      # Port range

# ── Restrict by source IP ─────────────────────────────────
sudo ufw allow from 192.168.100.0/24 to any port 22
sudo ufw allow from 192.168.100.10 to any port 5432   # Postgres from DC01

# ── Block specific IPs ────────────────────────────────────
sudo ufw deny from 203.0.113.100
sudo ufw deny from 198.51.100.0/24 to any port 22

# ── Rate limiting (brute-force protection) ────────────────
sudo ufw limit ssh                # Max 6 connections/30s from same IP

# ── Manage existing rules ─────────────────────────────────
sudo ufw status numbered          # Show rules with line numbers
sudo ufw delete 5                 # Delete rule #5
sudo ufw delete allow 8080/tcp    # Delete by specification

# ── Logging ───────────────────────────────────────────────
sudo ufw logging on               # Enable logging
sudo ufw logging medium           # low/medium/high/full
grep "UFW BLOCK" /var/log/ufw.log | tail -20

# ── Reset ─────────────────────────────────────────────────
sudo ufw reset                    # Remove all rules, disable`
const CODE_LINUXFIREWALL_3 = `sudo ufw status verbose
sudo ufw version

# If ufw is not installed:
sudo apt install ufw -y`
const CODE_LINUXFIREWALL_4 = `Status: inactive
ufw 0.36.2`
const CODE_LINUXFIREWALL_5 = `# Set defaults FIRST
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH from management network BEFORE enabling
sudo ufw allow from 192.168.100.0/24 to any port 22

# Enable — this is safe now because SSH is already allowed
sudo ufw enable

# Confirm status
sudo ufw status verbose`
const CODE_LINUXFIREWALL_6 = `Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing)
To                         Action  From
--                         ------  ----
22/tcp                     ALLOW   192.168.100.0/24`
const CODE_LINUXFIREWALL_7 = `# Allow DNS queries (if this server runs DNS)
# sudo ufw allow 53/udp
# sudo ufw allow 53/tcp

# Allow HTTPS for future web services
sudo ufw allow 443/tcp

# Allow from DC01 only for AD-joined services
sudo ufw allow from 192.168.100.10 to any port 389   # LDAP
sudo ufw allow from 192.168.100.10 to any port 636   # LDAPS

# Enable rate limiting on SSH
sudo ufw limit ssh comment "Rate limit SSH connections"

# View all rules
sudo ufw status numbered`
const CODE_LINUXFIREWALL_8 = `# From DC01 PowerShell — test if blocked port is actually blocked
Test-NetConnection -ComputerName 192.168.100.20 -Port 3306  # MySQL - should fail

# From Ubuntu — watch the ufw log in real-time
sudo tail -f /var/log/ufw.log`
const CODE_LINUXFIREWALL_9 = `ComputerName     : 192.168.100.20
RemotePort       : 3306
TcpTestSucceeded : False  ← Blocked by ufw ✔

[UFW BLOCK] IN=ens33 SRC=192.168.100.10 DST=192.168.100.20 DPT=3306`
const CODE_LINUXFIREWALL_10 = `# Save current ufw/iptables rules persistently
sudo apt install iptables-persistent -y
# Answer YES to save current IPv4 and IPv6 rules

# View the saved rules
cat /etc/iptables/rules.v4

# After reboot — verify rules are still active
sudo reboot
# (reconnect via SSH)
sudo ufw status verbose`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What are the three default iptables chains in the filter table?',
    options: [
      'ACCEPT, DROP, REJECT',
      'INPUT, OUTPUT, FORWARD',
      'PREROUTING, POSTROUTING, OUTPUT',
      'ALLOW, BLOCK, LOG',
    ],
    correct: 1,
    explanation: 'The filter table (default) has three chains: INPUT (traffic destined for the host), OUTPUT (traffic originating from the host), and FORWARD (traffic passing through the host, used for routing/NAT). PREROUTING and POSTROUTING exist in the nat table, which handles NAT rules.',
  },
  {
    id: 'q2',
    question: 'What is the difference between iptables DROP and REJECT?',
    options: [
      'DROP silently discards the packet; REJECT discards it and sends an error response back to the sender',
      'DROP is faster; REJECT is more secure',
      'DROP applies to TCP only; REJECT applies to UDP only',
      'There is no difference — they both block traffic the same way',
    ],
    correct: 0,
    explanation: 'DROP silently discards the packet — the sender gets no response and must wait for a timeout. This makes port scanning slower and hides that a host exists. REJECT sends an ICMP "port unreachable" message back, giving the sender immediate feedback. Use DROP for internet-facing rules (less information disclosure), REJECT for internal rules (faster failure for legitimate tools).',
  },
  {
    id: 'q3',
    question: 'Which ufw command allows incoming SSH connections from a specific IP only?',
    options: [
      'ufw allow from 192.168.100.0/24 to any port 22',
      'ufw enable ssh from 192.168.100.0/24',
      'ufw add rule ssh source 192.168.100.0/24',
      'ufw allow 22/tcp restrict 192.168.100.0/24',
    ],
    correct: 0,
    explanation: 'ufw allow from SOURCE to any port PORT is the correct syntax for source-restricted rules. "ufw allow from 192.168.100.0/24 to any port 22" allows SSH from the entire 192.168.100.0/24 subnet. Without "from", the rule allows SSH from anywhere.',
  },
  {
    id: 'q4',
    question: 'What must you do to make iptables rules persist across reboots on Ubuntu/Debian?',
    options: [
      'Nothing — iptables rules automatically persist',
      'Run "iptables --save" after configuring rules',
      'Install iptables-persistent and run netfilter-persistent save, or use iptables-save to a file loaded at boot',
      'Add rules to /etc/rc.local with iptables commands',
    ],
    correct: 2,
    explanation: 'iptables rules are not persistent by default — they are lost on reboot. On Ubuntu/Debian, install iptables-persistent (apt install iptables-persistent) which saves current rules to /etc/iptables/rules.v4 and /etc/iptables/rules.v6, loading them at boot. You can also use iptables-save > /etc/iptables/rules.v4 and load with iptables-restore.',
  },
  {
    id: 'q5',
    question: 'What does "ufw default deny incoming" do?',
    options: [
      'Blocks all traffic including outbound until rules are added',
      'Sets the default policy to block all unsolicited inbound connections unless explicitly allowed by a rule',
      'Disables ufw entirely',
      'Only blocks incoming traffic on port 80',
    ],
    correct: 1,
    explanation: '"ufw default deny incoming" sets the default policy for the INPUT chain to DROP. Any inbound connection not explicitly allowed by a ufw allow rule will be silently dropped. This is the secure default — start with deny all and allow only what you need. Pair it with "ufw default allow outgoing" for normal operation.',
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

export default function LinuxFirewall() {
  return (
    <LessonLayout
      lessonId="linux-08"
      courseId="linux"
      title="Firewall with iptables & ufw"
      courseTitle="Linux Fundamentals"
      courseHref="/linux"
      xp={90}
      readTime="~35 min"
      icon="🛡️"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Linux Fundamentals', href: '/linux' },
        { label: 'Firewall with iptables & ufw' },
      ]}
      prev={{ title: 'SSH & Remote Access',         href: '/linux/ssh' }}
      next={{ title: 'Disk Management & LVM',        href: '/linux/disk' }}
      objectives={[
        'Understand Netfilter, iptables tables, chains, and rules',
        'Write iptables rules for common server hardening scenarios',
        'Manage the Ubuntu firewall with ufw for daily operations',
        'Persist iptables rules across reboots',
        'Implement rate limiting to defend against brute force',
        'Log and monitor blocked traffic',
      ]}
    >
      {/* ── OVERVIEW ── */}
      <section>
        <h2>Overview</h2>
        <p>
          Linux packet filtering is handled by <strong>Netfilter</strong> — a framework built
          into the kernel. <GlossaryTooltip term="iptables" /> is the traditional user-space
          tool for configuring Netfilter rules. <strong>ufw</strong> (Uncomplicated Firewall)
          is a simplified front-end for iptables designed for Ubuntu/Debian systems.
        </p>
        <p className="mt-4">
          In practice: use <strong>ufw</strong> for quick, day-to-day firewall management on
          Ubuntu servers. Understand <strong>iptables</strong> for complex scenarios, legacy
          systems, and when you need precise low-level control. Modern Linux systems are also
          moving to <strong>nftables</strong> as the iptables replacement, but iptables
          remains dominant in production.
        </p>
        <Callout type="danger" icon="🚨" title="Test all rules carefully">
          A wrong firewall rule can lock you out of SSH. Always test from a second session
          before closing your current connection, and use a timeout when testing:
          <code className="font-mono text-xs ml-2">ufw --force disable && sleep 60 && ufw enable</code> — 
          this auto-reverts if you lose connectivity.
        </Callout>
      </section>

      {/* ── IPTABLES ARCHITECTURE ── */}
      <section>
        <h2>iptables Architecture</h2>
        <div className="info-card mt-4 overflow-hidden">
          <div className="p-4 border-b border-surface-700">
            <p className="text-sm font-semibold text-white mb-4">
              Packet flow through Netfilter chains
            </p>
            <div className="font-mono text-xs text-slate-400 leading-8 overflow-x-auto">
              <div className="min-w-[500px]">
                <div className="flex items-center gap-2">
                  <span className="text-accent-cyan">Incoming packet</span>
                  <span className="text-slate-600">──▶</span>
                  <span className="bg-surface-700 border border-brand-500/30 text-brand-300 px-3 py-1 rounded-lg">PREROUTING</span>
                  <span className="text-slate-600">──▶</span>
                  <span className="text-slate-500">Routing decision</span>
                </div>
                <div className="ml-32 text-slate-600 mt-1">├── For this host ──▶</div>
                <div className="ml-48 flex items-center gap-2">
                  <span className="bg-surface-700 border border-accent-green/30 text-accent-green px-3 py-1 rounded-lg">INPUT</span>
                  <span className="text-slate-600">──▶</span>
                  <span className="text-accent-green">Local process</span>
                </div>
                <div className="ml-32 text-slate-600 mt-1">└── Forward ──▶</div>
                <div className="ml-48 flex items-center gap-2">
                  <span className="bg-surface-700 border border-accent-amber/30 text-accent-amber px-3 py-1 rounded-lg">FORWARD</span>
                  <span className="text-slate-600">──▶</span>
                  <span className="bg-surface-700 border border-surface-600 text-slate-400 px-3 py-1 rounded-lg">POSTROUTING</span>
                  <span className="text-slate-600">──▶</span>
                  <span className="text-slate-500">Out</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-accent-purple">Local process</span>
                  <span className="text-slate-600">──▶</span>
                  <span className="bg-surface-700 border border-accent-purple/30 text-accent-purple px-3 py-1 rounded-lg">OUTPUT</span>
                  <span className="text-slate-600">──▶</span>
                  <span className="bg-surface-700 border border-surface-600 text-slate-400 px-3 py-1 rounded-lg">POSTROUTING</span>
                  <span className="text-slate-600">──▶</span>
                  <span className="text-slate-500">Out</span>
                </div>
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-surface-700">
            {[
              { table: 'filter', chains: 'INPUT, OUTPUT, FORWARD', use: 'Default. Accept, drop, or reject packets.' },
              { table: 'nat',    chains: 'PREROUTING, OUTPUT, POSTROUTING', use: 'Network Address Translation (masquerade, DNAT, SNAT).' },
              { table: 'mangle', chains: 'All five chains', use: 'Modify packet headers (TTL, TOS, mark).' },
            ].map(t => (
              <div key={t.table} className="p-4">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Table</p>
                <code className="text-accent-cyan font-mono text-sm font-bold">{t.table}</code>
                <p className="text-[11px] text-slate-500 mt-1">{t.chains}</p>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{t.use}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IPTABLES RULES ── */}
      <section>
        <h2>iptables — Production Rule Set</h2>
        <CodeBlock title="server-firewall.sh — complete hardened iptables ruleset" language="bash"
          code={CODE_LINUXFIREWALL_1} />
      </section>

      {/* ── UFW ── */}
      <section>
        <h2>ufw — Day-to-Day Firewall Management</h2>
        <p>
          ufw is the recommended tool for Ubuntu Server. It generates iptables rules
          behind the scenes but provides a much simpler interface.
        </p>
        <CodeBlock className="mt-4" title="ufw — complete command reference" language="bash"
          code={CODE_LINUXFIREWALL_2} />
      </section>

      {/* ── VMware LAB ── */}
      <section>
        <h2>VMware Lab Exercise</h2>
        <Callout type="warning" icon="🧪" title="Critical safety note">
          Always work from two SSH sessions when changing firewall rules.
          If you lock yourself out, use the VMware console to access the VM directly.
        </Callout>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB LINUX-8</span>
            <span className="text-sm font-semibold text-white">Configure ufw on Ubuntu Server</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">

            <LabStep number={1}
              description="Check current firewall status and ensure ufw is installed."
              command={CODE_LINUXFIREWALL_3}
              output={CODE_LINUXFIREWALL_4}
            />

            <LabStep number={2}
              description="Set default policies and allow SSH before enabling — otherwise you'll be locked out."
              command={CODE_LINUXFIREWALL_5}
              output={CODE_LINUXFIREWALL_6}
            />

            <LabStep number={3}
              description="Add service rules for this lab server — DNS and LDAP access from DC01."
              command={CODE_LINUXFIREWALL_7}
            />

            <LabStep number={4}
              description="Test the firewall is working by attempting a blocked connection from DC01."
              command={CODE_LINUXFIREWALL_8}
              output={CODE_LINUXFIREWALL_9}
            />

            <LabStep number={5}
              description="Install iptables-persistent to save rules across reboots, then verify."
              command={CODE_LINUXFIREWALL_10}
            />

            <Callout type="success" icon="✅" title="Lab Complete">
              ufw is configured with default deny, SSH restricted to the management network,
              rate limiting enabled, and rules persist across reboots.
            </Callout>
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to earn bonus XP.</p>
        <Quiz lessonId="linux-08" title="Linux Firewall Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={45} />
      </section>
    </LessonLayout>
  )
}
