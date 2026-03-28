import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_CYBERSECURITYLINUXHARDENING_1 = `sudo apt install unattended-upgrades apt-listchanges -y

# Enable automatic security updates
sudo dpkg-reconfigure -plow unattended-upgrades

# Configure what to auto-install
sudo tee /etc/apt/apt.conf.d/50unattended-upgrades << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
EOF

# Enable the daily timer
sudo tee /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF

# Test dry run
sudo unattended-upgrades --dry-run --debug 2>&1 | head -20`
const CODE_CYBERSECURITYLINUXHARDENING_2 = `sudo apt install auditd audispd-plugins -y
sudo systemctl enable auditd --now

# Add audit rules
sudo tee /etc/audit/rules.d/99-security.rules << 'EOF'
# Delete all existing rules
-D

# Monitor access to sensitive files
-w /etc/passwd -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/group  -p wa -k identity
-w /etc/sudoers -p wa -k sudoers
-w /etc/ssh/sshd_config -p wa -k sshd

# Monitor privilege escalation
-w /bin/su     -p x -k privilege_escalation
-w /usr/bin/sudo -p x -k privilege_escalation

# Monitor changes to audit config itself
-w /etc/audit/ -p wa -k audit_config
-w /etc/audit/audit.rules -p wa -k audit_config

# Log all commands run by root
-a exit,always -F arch=b64 -F euid=0 -S execve -k root_commands
EOF

sudo augenrules --load
sudo auditctl -l   # List active rules

# Search audit log
sudo ausearch -k identity --interpret | tail -5
sudo aureport --summary`
const CODE_CYBERSECURITYLINUXHARDENING_3 = `sudo apt install lynis -y
sudo lynis audit system --quiet 2>/dev/null
grep 'Hardening index' /var/log/lynis.log | tail -1`
const CODE_CYBERSECURITYLINUXHARDENING_4 = `# Kernel hardening
sudo tee /etc/sysctl.d/99-cis.conf << 'EOF'
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.all.rp_filter = 1
kernel.randomize_va_space = 2
kernel.dmesg_restrict = 1
fs.suid_dumpable = 0
EOF
sudo sysctl -p /etc/sysctl.d/99-cis.conf

# Auto-updates
sudo apt install -y unattended-upgrades
echo 'APT::Periodic::Unattended-Upgrade "1";' | sudo tee /etc/apt/apt.conf.d/20auto

# Auditd
sudo apt install -y auditd
sudo systemctl enable auditd --now
sudo auditctl -w /etc/passwd -p wa -k identity

# Re-audit
sudo lynis audit system --quiet 2>/dev/null
grep 'Hardening index' /var/log/lynis.log | tail -1`
const CODE_CYBERSECURITYLINUXHARDENING_5 = `net.ipv4.tcp_syncookies = 1
... applied

[+] Hardening index : 68 [#############       ]  ← +12 points`
const CODE_CYBERSECURITYLINUXHARDENING_6 = `# Trigger an auditable event
sudo cat /etc/shadow > /dev/null

# Search the audit log for it
sudo ausearch -k identity --interpret 2>/dev/null | grep -A3 'shadow'

# Check sudo usage log
sudo journalctl _COMM=sudo | tail -5`
const CODE_CYBERSECURITYLINUXHARDENING_7 = `time->Wed Jan 15 11:30:00 2025
type=PATH msg=audit(1705312200.123:456): item=0 name='/etc/shadow'
  ouid=0 ogid=0 rdev=0:0 nametype=NORMAL

Jan 15 11:30:00 srv01 sudo: user : TTY=pts/0 ; PWD=/home/user
  USER=root ; COMMAND=/bin/cat /etc/shadow`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the CIS Benchmark Level 1 vs Level 2 distinction for Linux hardening?',
    options: [
      'Level 1 uses iptables; Level 2 uses nftables',
      'Level 1 = practical security with minimal operational impact; Level 2 = high-security environments that may reduce functionality and require more maintenance',
      'Level 1 covers network security; Level 2 covers filesystem security',
      'Level 1 is for servers; Level 2 is for workstations',
    ],
    correct: 1,
    explanation: 'CIS Benchmark Level 1 controls are broadly applicable and cause minimal disruption — recommended for all systems. Level 2 controls are for defense-in-depth environments where security outweighs some functionality concerns — they may break some applications or require significant configuration changes. Always start with Level 1, assess Level 2 controls individually for your environment.',
  },
  {
    id: 'q2',
    question: 'What does "sudo journalctl _COMM=sudo" show and why is it useful for security?',
    options: [
      'It lists all users who have sudo access configured',
      'It shows all sudo command executions in the journal log, providing an audit trail of privileged actions',
      'It shows failed sudo authentication attempts only',
      'It displays the current sudo configuration from /etc/sudoers',
    ],
    correct: 1,
    explanation: 'journalctl _COMM=sudo filters journal entries where the process name is "sudo", showing every sudo invocation with timestamp, user, and command executed. This is your audit trail for privileged access. Combined with auditd, you get comprehensive coverage of who ran what as root, which is essential for incident response and compliance.',
  },
  {
    id: 'q3',
    question: 'What does "noexec" on /tmp prevent and why is this a critical hardening control?',
    options: [
      'Prevents temporary files from being accessed by non-root users',
      'Prevents binaries from being executed from /tmp — attackers commonly write exploits to /tmp then execute them; noexec breaks this attack pattern',
      'Prevents files in /tmp from being modified after creation',
      'Limits the size of /tmp to prevent disk exhaustion attacks',
    ],
    correct: 1,
    explanation: '/tmp is world-writable — any user can write files there, making it a common staging area for attackers who gain code execution. With noexec, even if an attacker writes a compiled exploit to /tmp, they cannot execute it directly. This forces attackers to find an alternate execution method, significantly raising the cost of exploitation. Apply nosuid and nodev as well for complete /tmp hardening.',
  },
  {
    id: 'q4',
    question: 'What is the purpose of "unattended-upgrades" on Ubuntu Server?',
    options: [
      'It automatically upgrades the Ubuntu version to the next release',
      'It automatically installs security updates without manual intervention, reducing the window between patch release and application',
      'It monitors for failed update attempts and alerts the administrator',
      'It rolls back updates that cause system instability',
    ],
    correct: 1,
    explanation: 'unattended-upgrades automatically downloads and installs security updates on a schedule. The time between a CVE being published (with patch) and it being applied is a critical attack window. Manually patching is slow — unattended-upgrades closes this window automatically for security-only updates. Configure it to install security updates only (not all updates) to avoid unexpected package upgrades breaking applications.',
  },
  {
    id: 'q5',
    question: 'What does the auditd daemon provide that journald alone cannot?',
    options: [
      'Real-time alerting when disk space is low',
      'Kernel-level auditing of system calls, file access, privilege changes, and network connections — tamper-evident logs that cannot be modified by non-root processes',
      'Automatic rotation and compression of log files',
      'Central log aggregation from multiple servers',
    ],
    correct: 1,
    explanation: 'auditd hooks into the Linux Audit subsystem in the kernel, capturing events at the system call level before they reach user space. This means the audit log captures events that attackers might hide from application-level logs. Audit rules can track: file reads/writes to sensitive files (/etc/passwd, SSH keys), all executions, privilege escalation attempts, network connections, and user/group changes. The audit log itself is append-only to non-root processes.',
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

export default function CybersecurityLinuxHardening() {
  return (
    <LessonLayout
      lessonId="sec-04"
      courseId="cybersecurity"
      title="Linux Server Hardening"
      courseTitle="Cybersecurity"
      courseHref="/cybersecurity"
      xp={100}
      readTime="~40 min"
      icon="🐧"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Cybersecurity', href: '/cybersecurity' },
        { label: 'Linux Server Hardening' },
      ]}
      prev={{ title: 'Windows Server Hardening',   href: '/cybersecurity/windows-hardening' }}
      next={{ title: 'Firewall Configuration',      href: '/cybersecurity/firewall' }}
      objectives={[
        'Apply CIS Ubuntu Linux Benchmark Level 1 controls',
        'Configure automatic security updates with unattended-upgrades',
        'Harden /tmp, /var/tmp with secure mount options',
        'Enable and configure auditd for kernel-level auditing',
        'Remove unnecessary packages and disable unneeded services',
        'Configure sysctl network and kernel hardening parameters',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Linux servers are the primary target of internet-facing attacks. A default
          Ubuntu installation is reasonably secure but leaves significant room for
          hardening. This lesson walks through the CIS Ubuntu Linux Benchmark Level 1
          controls — the industry-standard baseline used by security teams worldwide.
        </p>
        <Callout type="info" icon="🎯" title="This lesson vs the Linux Fundamentals hardening lesson">
          The Linux Fundamentals course covers hardening from a sysadmin perspective
          (keeping systems running). This lesson covers it from a security perspective —
          threat models, compliance frameworks, and defence-in-depth layering.
        </Callout>
      </section>

      <section>
        <h2>CIS Benchmark Controls — Priority Order</h2>
        <div className="info-card mt-4 overflow-hidden">
          <div className="divide-y divide-surface-700">
            {[
              { area: 'Automatic Updates',      risk: 'Critical', control: 'unattended-upgrades', why: 'Closes the patch window — the #1 source of Linux compromises is unpatched CVEs' },
              { area: 'Filesystem Hardening',   risk: 'High',     control: '/tmp noexec nosuid nodev', why: 'Prevents execution of attacker-dropped binaries in world-writable directories' },
              { area: 'Kernel Parameters',      risk: 'High',     control: 'sysctl hardening', why: 'Prevents IP spoofing, SYN floods, ICMP redirect attacks, and information disclosure' },
              { area: 'Audit Logging',          risk: 'High',     control: 'auditd rules', why: 'Tamper-evident kernel-level audit trail for privileged actions and file access' },
              { area: 'Service Minimisation',   risk: 'Medium',   control: 'Remove unused packages', why: 'Every installed package is a potential attack surface — remove what you don\'t need' },
              { area: 'SSH Hardening',          risk: 'High',     control: 'sshd_config controls', why: 'SSH is the primary admin interface — its configuration directly impacts attack exposure' },
              { area: 'PAM Configuration',      risk: 'Medium',   control: 'Password quality, account lockout', why: 'Prevents brute-force and enforces credential standards' },
              { area: 'File Permissions',       risk: 'Medium',   control: 'World-writable file audit', why: 'World-writable files and SUID binaries are common privilege escalation vectors' },
            ].map(r => (
              <div key={r.area} className="grid grid-cols-1 sm:grid-cols-4 gap-2 p-3 items-start">
                <p className="font-semibold text-white text-sm">{r.area}</p>
                <span className={`tag text-[10px] w-fit ${r.risk === 'Critical' ? 'bg-accent-red/10 text-accent-red border-accent-red/20' : r.risk === 'High' ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/20' : 'bg-brand-500/10 text-brand-300 border-brand-500/20'}`}>{r.risk}</span>
                <code className="font-mono text-xs text-slate-400">{r.control}</code>
                <p className="text-xs text-slate-500 leading-relaxed">{r.why}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2>Automatic Security Updates</h2>
        <CodeBlock title="Configure unattended-upgrades" language="bash"
          code={CODE_CYBERSECURITYLINUXHARDENING_1} />
      </section>

      <section>
        <h2>auditd — Kernel-Level Audit Trail</h2>
        <CodeBlock title="Install and configure auditd with security-focused rules" language="bash"
          code={CODE_CYBERSECURITYLINUXHARDENING_2} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB SEC-4</span>
            <span className="text-sm font-semibold text-white">Apply CIS Level 1 to Ubuntu Server</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~25 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Run a baseline audit to score the system before hardening."
              command={CODE_CYBERSECURITYLINUXHARDENING_3}
              output="[+] Hardening index : 56 [###########         ]"
            />
            <LabStep number={2}
              description="Apply sysctl hardening, automatic updates, and auditd."
              command={CODE_CYBERSECURITYLINUXHARDENING_4}
              output={CODE_CYBERSECURITYLINUXHARDENING_5}
            />
            <LabStep number={3}
              description="Audit privileged command usage with auditd."
              command={CODE_CYBERSECURITYLINUXHARDENING_6}
              output={CODE_CYBERSECURITYLINUXHARDENING_7}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="sec-04" title="Linux Server Hardening Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={50} />
      </section>
    </LessonLayout>
  )
}
