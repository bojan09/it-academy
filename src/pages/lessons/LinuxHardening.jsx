import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_LINUXHARDENING_1 = `# Apply immediately: sudo sysctl -p /etc/sysctl.d/99-hardening.conf
# Persist across reboots: saved in /etc/sysctl.d/

# ── Network hardening ────────────────────────────────────────
# SYN flood protection
net.ipv4.tcp_syncookies = 1

# Ignore ICMP broadcast (Smurf attack mitigation)
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Ignore bogus ICMP errors
net.ipv4.icmp_ignore_bogus_error_responses = 1

# Disable IP source routing (attacker-controlled routing)
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0

# Disable ICMP redirect acceptance (prevents routing table poisoning)
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0

# Log suspicious packets (martian packets)
net.ipv4.conf.all.log_martians = 1

# Reverse path filtering (anti-spoofing)
net.ipv4.conf.all.rp_filter = 1

# Disable IPv6 if not used
net.ipv6.conf.all.disable_ipv6 = 1

# ── Kernel hardening ──────────────────────────────────────────
# Restrict kernel pointer exposure (prevents info leaks to attackers)
kernel.kptr_restrict = 2

# Restrict dmesg access to root only
kernel.dmesg_restrict = 1

# Prevent core dumps from SUID programs (can contain secrets)
fs.suid_dumpable = 0

# Randomise memory layout (ASLR) — 2 = full randomisation
kernel.randomize_va_space = 2

# Restrict ptrace (prevents process inspection by non-privileged users)
kernel.yama.ptrace_scope = 1`
const CODE_LINUXHARDENING_2 = `# Write the config
sudo tee /etc/sysctl.d/99-hardening.conf << 'EOF'
net.ipv4.tcp_syncookies = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.all.rp_filter = 1
kernel.kptr_restrict = 2
kernel.dmesg_restrict = 1
fs.suid_dumpable = 0
kernel.randomize_va_space = 2
EOF

# Apply immediately (no reboot needed)
sudo sysctl -p /etc/sysctl.d/99-hardening.conf

# Verify specific setting
sysctl net.ipv4.tcp_syncookies`
const CODE_LINUXHARDENING_3 = `sudo apt install fail2ban -y

# Create local config (NEVER edit /etc/fail2ban/jail.conf directly)
sudo tee /etc/fail2ban/jail.d/local.conf << 'EOF'
[DEFAULT]
bantime  = 3600       # 1 hour ban
findtime = 600        # 10 minute observation window
maxretry = 5          # 5 failures before ban
banaction = iptables-multiport

[sshd]
enabled  = true
port     = ssh
logpath  = /var/log/auth.log
maxretry = 3          # Stricter for SSH
bantime  = 86400      # 24 hour ban for SSH failures

[nginx-http-auth]
enabled  = true
logpath  = /var/log/nginx/error.log
EOF

sudo systemctl enable fail2ban --now

# Monitor bans
sudo fail2ban-client status
sudo fail2ban-client status sshd

# Unban an IP
sudo fail2ban-client set sshd unbanip 192.168.100.50`
const CODE_LINUXHARDENING_4 = `# Current /tmp entry (probably just defaults):
# UUID=xxx  /tmp  ext4  defaults  0 2

# Hardened /tmp — noexec nosuid nodev
# Option 1: tmpfs (RAM-based, faster, auto-cleared on reboot)
# Add to /etc/fstab:
# tmpfs  /tmp  tmpfs  rw,nosuid,nodev,noexec,relatime,size=2G  0 0

# Option 2: bind-mount if /tmp is on root partition
sudo mount --bind /tmp /tmp
sudo mount --make-private /tmp
sudo mount -o remount,noexec,nosuid,nodev /tmp

# Verify
mount | grep /tmp

# Also harden /var/tmp
# /var/tmp  tmpfs  tmpfs  rw,nosuid,nodev,noexec  0 0

# Remove world-writable permissions on shared directories
sudo chmod 1777 /tmp          # Sticky bit — only owner can delete their files
sudo chmod 1777 /var/tmp

# Find world-writable files (security audit)
sudo find / -xdev -type f -perm -0002 -not -path '/proc/*' 2>/dev/null`
const CODE_LINUXHARDENING_5 = `# Check AppArmor status
sudo apparmor_status

# List all profiles and their modes
sudo aa-status | grep -E 'enforce|complain'

# Switch a profile to enforce mode
sudo aa-enforce /etc/apparmor.d/usr.sbin.nginx

# Switch to complain mode (log violations but don't block — use for testing)
sudo aa-complain /etc/apparmor.d/usr.sbin.nginx

# Check AppArmor violations in logs
sudo dmesg | grep apparmor
sudo journalctl -k | grep apparmor

# Generate a profile for a new program
sudo apt install apparmor-utils
sudo aa-genprof /opt/myapp/server
# Run the application, let it do its normal operations
# Then press S to scan and generate the profile`
const CODE_LINUXHARDENING_6 = `sudo apt install lynis -y

# Run full audit
sudo lynis audit system --quiet

# Check the hardening index (before hardening)
grep 'Hardening index' /var/log/lynis.log | tail -1`
const CODE_LINUXHARDENING_7 = `# Apply sysctl hardening
sudo tee /etc/sysctl.d/99-hardening.conf << 'EOF'
net.ipv4.tcp_syncookies = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.all.rp_filter = 1
kernel.kptr_restrict = 2
kernel.dmesg_restrict = 1
fs.suid_dumpable = 0
kernel.randomize_va_space = 2
EOF
sudo sysctl -p /etc/sysctl.d/99-hardening.conf

# Install and configure fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban --now

# Re-run Lynis and compare
sudo lynis audit system --quiet
grep 'Hardening index' /var/log/lynis.log | tail -1`
const CODE_LINUXHARDENING_8 = `# See all warnings
sudo lynis show warnings

# See all suggestions (prioritised)
sudo lynis show suggestions | head -30

# Common quick win: disable root SSH login (if not already done)
grep PermitRootLogin /etc/ssh/sshd_config

# Quick win: set UMASK to 027 for new files
grep UMASK /etc/login.defs`
const CODE_LINUXHARDENING_9 = `! Found shell without timeout [AUTH-9328]
! No logging server configured [LOGG-2154]

# Suggestions:
* Install a file integrity tool (AIDE)
* Enable automatic security updates (unattended-upgrades)
* Set a password on GRUB bootloader
* Configure /tmp with noexec option`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the purpose of "sysctl -w net.ipv4.tcp_syncookies=1"?',
    options: [
      'Enables IPv4 forwarding for router functionality',
      'Activates SYN cookies to protect against SYN flood DDoS attacks without blocking legitimate connections',
      'Disables ICMP ping responses to hide the server',
      'Limits the number of TCP connections per IP address',
    ],
    correct: 1,
    explanation: 'SYN cookies protect against SYN flood attacks. In a SYN flood, an attacker sends many TCP SYN packets without completing the handshake, exhausting the server\'s connection table. With SYN cookies enabled, the server encodes connection info in the sequence number instead of storing state — so flooded connection tables don\'t cause denial of service for legitimate users.',
  },
  {
    id: 'q2',
    question: 'What does "fail2ban" do and which log file does it watch for SSH brute-force?',
    options: [
      'Blocks IPs after too many failed connections; watches /var/log/auth.log',
      'Encrypts SSH traffic; watches /var/log/sshd.log',
      'Rate-limits SSH connections; watches /etc/ssh/sshd_config',
      'Detects rootkits; watches /proc/net/tcp',
    ],
    correct: 0,
    explanation: 'fail2ban monitors log files for patterns indicating brute-force attempts. For SSH it watches /var/log/auth.log (Debian/Ubuntu) or /var/log/secure (RHEL) for repeated failed authentication entries. After a configurable number of failures (default 5) within a time window, it adds an iptables/nftables rule to block that source IP for a configurable duration.',
  },
  {
    id: 'q3',
    question: 'What is AppArmor and how does it differ from traditional file permissions?',
    options: [
      'AppArmor is an antivirus; file permissions prevent malware installation',
      'AppArmor is a Mandatory Access Control (MAC) system that confines programs to a profile defining exactly which files/capabilities they can access — regardless of file permissions or user identity',
      'AppArmor encrypts files; permissions control who can read them',
      'AppArmor enforces password complexity; permissions control login access',
    ],
    correct: 1,
    explanation: 'Traditional Linux permissions use Discretionary Access Control (DAC) — the file owner decides access. AppArmor uses Mandatory Access Control (MAC) — the OS enforces per-process profiles regardless of what the user or process owner wants. Even if nginx runs as root (bad practice, but possible), an AppArmor profile can confine it to only its specific directories, preventing it from reading /etc/passwd or writing to /bin.',
  },
  {
    id: 'q4',
    question: 'What does "noexec" mount option do and where should it be applied?',
    options: [
      'Prevents files on that filesystem from being read by non-root users',
      'Prevents executables from being run from that mount point — applies to /tmp, /var/tmp to prevent attackers from dropping and running malicious binaries',
      'Makes the filesystem read-only, preventing any modifications',
      'Disables executable bit inheritance for new files created on the filesystem',
    ],
    correct: 1,
    explanation: 'noexec prevents execution of binaries from that mount point. Applying it to /tmp and /var/tmp is a key hardening control — these directories are world-writable, and attackers commonly write exploit code there then execute it. With noexec, even if they write a binary to /tmp, they cannot execute it directly. Combine with nosuid (no SUID) and nodev (no device files) for full /tmp hardening.',
  },
  {
    id: 'q5',
    question: 'What is the purpose of running "lynis audit system" and what does it produce?',
    options: [
      'It automatically fixes all security vulnerabilities on the system',
      'It performs a comprehensive security audit, testing hundreds of controls and generating a hardening index score with specific recommendations',
      'It compares the system against a CVE database and patches found vulnerabilities',
      'It monitors the system in real-time for intrusion attempts',
    ],
    correct: 1,
    explanation: 'Lynis is an open-source security auditing tool. Running lynis audit system performs 300+ tests: checking kernel hardening parameters, file permissions, SSH config, installed packages, authentication settings, boot loader security, and more. It outputs a "hardening index" score (0-100) and specific recommendations categorised by severity. It does not auto-fix — it reports and advises. Essential for CIS benchmark compliance checking.',
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

export default function LinuxHardening() {
  return (
    <LessonLayout
      lessonId="linux-10"
      courseId="linux"
      title="Linux Server Hardening"
      courseTitle="Linux Fundamentals"
      courseHref="/linux"
      xp={100}
      readTime="~45 min"
      icon="🔒"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Linux Fundamentals', href: '/linux' },
        { label: 'Linux Server Hardening' },
      ]}
      prev={{ title: 'Disk Management & LVM', href: '/linux/disk' }}
      next={null}
      objectives={[
        'Apply kernel hardening parameters with sysctl',
        'Configure fail2ban for SSH and service brute-force protection',
        'Understand and configure AppArmor profiles',
        'Harden /tmp and shared directories with secure mount options',
        'Audit the system with Lynis and act on findings',
        'Apply CIS Benchmark Level 1 controls to Ubuntu Server',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          A default Ubuntu Server installation is secure by comparison to Windows defaults —
          but it still has considerable hardening room. Real production servers running
          internet-facing services need deliberate, layered security controls that go beyond
          a firewall and strong passwords.
        </p>
        <Callout type="info" icon="🎯" title="Defence in depth">
          No single control stops all attacks. The goal is layers — an attacker who
          bypasses one control should immediately hit another. Kernel hardening +
          fail2ban + AppArmor + filesystem hardening + audit logging = multiple
          independent barriers.
        </Callout>
      </section>

      <section>
        <h2>Kernel Hardening with sysctl</h2>
        <p>
          Linux kernel behaviour is controlled at runtime via
          <code className="font-mono text-accent-cyan text-sm mx-1">sysctl</code>.
          Many default settings prioritise compatibility — these should be changed
          on servers.
        </p>
        <CodeBlock title="/etc/sysctl.d/99-hardening.conf — production kernel settings" language="bash"
          code={CODE_LINUXHARDENING_1} />
        <CodeBlock className="mt-4" title="Apply and verify sysctl settings" language="bash"
          code={CODE_LINUXHARDENING_2} />
      </section>

      <section>
        <h2>fail2ban — Brute-Force Protection</h2>
        <CodeBlock title="fail2ban setup and configuration" language="bash"
          code={CODE_LINUXHARDENING_3} />
      </section>

      <section>
        <h2>Filesystem Hardening</h2>
        <CodeBlock title="/etc/fstab — secure mount options" language="bash"
          code={CODE_LINUXHARDENING_4} />
      </section>

      <section>
        <h2>AppArmor — Mandatory Access Control</h2>
        <CodeBlock title="AppArmor basics" language="bash"
          code={CODE_LINUXHARDENING_5} />
      </section>

      <section>
        <h2>Security Auditing with Lynis</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB LINUX-10</span>
            <span className="text-sm font-semibold text-white">Harden Ubuntu Server and Audit with Lynis</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~30 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Install Lynis and run a baseline audit before hardening."
              command={CODE_LINUXHARDENING_6}
              output="[+] Hardening index : 54 [##########          ]"
            />
            <LabStep number={2}
              description="Apply kernel hardening and fail2ban, then re-audit."
              command={CODE_LINUXHARDENING_7}
              output="[+] Hardening index : 67 [#############       ]"
            />
            <LabStep number={3}
              description="Review top Lynis findings and apply quick wins."
              command={CODE_LINUXHARDENING_8}
              output={CODE_LINUXHARDENING_9}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to complete the Linux course.</p>
        <Quiz lessonId="linux-10" title="Linux Server Hardening Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={50} />
      </section>
    </LessonLayout>
  )
}
