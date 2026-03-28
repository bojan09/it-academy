import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'
import GlossaryTooltip from '../../components/GlossaryTooltip.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_LINUXSSH_1 = `# ── Port & Protocol ──────────────────────────────────────
Port 2222                     # Non-default port (reduces automated scanning)
AddressFamily inet            # IPv4 only (remove if you need IPv6)
ListenAddress 0.0.0.0

# ── Authentication ───────────────────────────────────────
PermitRootLogin no            # NEVER allow direct root login
PasswordAuthentication no     # Key auth only — disable passwords
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PermitEmptyPasswords no
MaxAuthTries 3                # Limit auth attempts per connection
MaxSessions 10

# ── Access Control ───────────────────────────────────────
AllowUsers sysadmin alice     # Whitelist specific users
# AllowGroups ssh-users       # Or whitelist by group (preferred at scale)

# ── Session Security ─────────────────────────────────────
ClientAliveInterval 300       # Send keepalive every 5 min
ClientAliveCountMax 2         # Disconnect after 2 missed keepalives
LoginGraceTime 30             # 30s to complete auth (default 120s)
Banner /etc/ssh/banner.txt    # Legal warning banner

# ── Forwarding (disable what you don't need) ─────────────
X11Forwarding no
AllowTcpForwarding no         # Disable unless you need tunnelling
AllowAgentForwarding no

# ── Logging ──────────────────────────────────────────────
LogLevel VERBOSE              # Log key fingerprints on auth`
const CODE_LINUXSSH_2 = `# ── Default settings for all hosts ──────────────────────
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 3
    IdentityFile ~/.ssh/id_ed25519
    AddKeysToAgent yes

# ── Lab DC01 ─────────────────────────────────────────────
Host dc01
    HostName 192.168.100.10
    User Administrator
    Port 22
    IdentityFile ~/.ssh/id_ed25519_lab

# ── Production bastion (jump host) ───────────────────────
Host bastion
    HostName bastion.example.com
    User sysadmin
    Port 2222
    IdentityFile ~/.ssh/id_ed25519_prod

# ── Servers behind the bastion (ProxyJump) ───────────────
Host prod-*
    User sysadmin
    Port 22
    ProxyJump bastion
    IdentityFile ~/.ssh/id_ed25519_prod

# Usage: ssh prod-web01  →  connects via bastion automatically`
const CODE_LINUXSSH_3 = `# On your CLIENT machine (not the server!)
ssh-keygen -t ed25519 -C "sysadmin@lab" -f ~/.ssh/id_ed25519_lab

# You'll be prompted for an optional passphrase (recommended)
# Two files created:
#   ~/.ssh/id_ed25519_lab      (private key — permissions 600)
#   ~/.ssh/id_ed25519_lab.pub  (public key — safe to copy)`
const CODE_LINUXSSH_4 = `Generating public/private ed25519 key pair.
Enter passphrase (empty for no passphrase): ••••••••
Your identification has been saved in ~/.ssh/id_ed25519_lab
Your public key has been saved in ~/.ssh/id_ed25519_lab.pub
SHA256:xKpR9mN3vQ... (ed25519)`
const CODE_LINUXSSH_5 = `# Copy public key to server (uses password auth — last time!)
ssh-copy-id -i ~/.ssh/id_ed25519_lab.pub user@192.168.100.20

# Verify it was added
ssh -i ~/.ssh/id_ed25519_lab user@192.168.100.20 "cat ~/.ssh/authorized_keys"`
const CODE_LINUXSSH_6 = `Number of key(s) added: 1

Now try logging into the machine with:
   ssh 'user@192.168.100.20'
✔ Key authentication working`
const CODE_LINUXSSH_7 = `# On the Ubuntu Server — backup first
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak

# Apply hardening
sudo tee /etc/ssh/sshd_config.d/99-hardening.conf > /dev/null << 'EOF'
PermitRootLogin no
PasswordAuthentication no
MaxAuthTries 3
LoginGraceTime 30
ClientAliveInterval 300
ClientAliveCountMax 2
AllowUsers user
X11Forwarding no
LogLevel VERBOSE
EOF

# Test config syntax BEFORE reloading
sudo sshd -t && echo "Config OK"

# Reload (NOT restart — keeps existing sessions alive)
sudo systemctl reload sshd`
const CODE_LINUXSSH_8 = `Config OK
# sshd reloaded — test from a NEW terminal before closing this one!`
const CODE_LINUXSSH_9 = `# Install fail2ban
sudo apt install fail2ban -y

# Create local config (never edit the main .conf — it gets overwritten by updates)
sudo tee /etc/fail2ban/jail.d/sshd.conf > /dev/null << 'EOF'
[sshd]
enabled  = true
port     = ssh
logpath  = /var/log/auth.log
maxretry = 5
bantime  = 1800
findtime = 600
EOF

sudo systemctl enable fail2ban --now

# Check status
sudo fail2ban-client status sshd`
const CODE_LINUXSSH_10 = `Status for the jail: sshd
|- Filter
|  |- Currently failed: 0
|  |- Total failed: 0
|  \\- Journal matches:  _SYSTEMD_UNIT=sshd.service + ...
  - Actions
   |- Currently banned: 0
   |- Total banned: 0`
const CODE_LINUXSSH_11 = `# Show all active SSH sessions
who
ss -tnp | grep :22

# Show recent SSH auth log
sudo journalctl -u ssh -n 30 --no-pager

# Check for failed login attempts
sudo grep "Failed password" /var/log/auth.log | tail -20
sudo grep "Invalid user" /var/log/auth.log | tail -20`
const CODE_LINUXSSH_12 = `# ── Key Management ──────────────────────────────────────────
ssh-keygen -t ed25519 -C "comment"          # Generate key pair
ssh-keygen -t rsa -b 4096 -C "comment"     # RSA alternative
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@host  # Deploy key
ssh-add ~/.ssh/id_ed25519                   # Add to SSH agent
ssh-add -l                                  # List loaded keys

# ── Connecting ───────────────────────────────────────────────
ssh user@host                               # Basic connection
ssh -p 2222 user@host                       # Non-default port
ssh -i ~/.ssh/id_ed25519_lab user@host      # Specific key
ssh -J bastion user@internal-host           # Jump through bastion
ssh -L 8080:localhost:80 user@host          # Local port forward
ssh -R 9090:localhost:9090 user@host        # Remote port forward

# ── Session Management ───────────────────────────────────────
# Escape sequences (type after Enter):
# ~.  — disconnect (kill hung session)
# ~^Z — background the session
# ~#  — list forwarded connections

# ── Diagnostics ─────────────────────────────────────────────
ssh -v user@host                            # Verbose (debug)
ssh -vvv user@host                          # Maximum verbosity
sudo sshd -T                                # Show effective sshd config
sudo sshd -t                                # Test config syntax
systemctl status sshd

# ── fail2ban ────────────────────────────────────────────────
sudo fail2ban-client status sshd            # Jail status
sudo fail2ban-client get sshd banip         # Banned IPs
sudo fail2ban-client set sshd unbanip IP    # Unban an IP`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'Which sshd_config directive disables password-based authentication, requiring key auth only?',
    options: ['PasswordLogin no', 'AllowPasswords no', 'PasswordAuthentication no', 'DisablePassword yes'],
    correct: 2,
    explanation: 'PasswordAuthentication no in /etc/ssh/sshd_config disables password login, forcing key-based authentication only. After changing, reload the service: systemctl reload sshd. Never set this before confirming your key works — you can lock yourself out.',
  },
  {
    id: 'q2',
    question: 'Where must the public key be placed on the server for SSH key authentication to work?',
    options: [
      '~/.ssh/id_rsa on the server',
      '~/.ssh/authorized_keys on the server',
      '/etc/ssh/authorized_keys on the server',
      '~/.ssh/known_hosts on the server',
    ],
    correct: 1,
    explanation: 'The public key must be appended to ~/.ssh/authorized_keys on the server (in the target user\'s home directory). The .ssh directory must have permissions 700 and authorized_keys must be 600 — SSH will silently ignore keys with wrong permissions.',
  },
  {
    id: 'q3',
    question: 'What does an SSH jump host (ProxyJump) allow you to do?',
    options: [
      'Speed up SSH connections by caching session state',
      'Connect to a server that is not directly reachable, routing through an intermediate host',
      'Run multiple commands simultaneously across all servers',
      'Automatically rotate SSH keys on remote servers',
    ],
    correct: 1,
    explanation: 'ProxyJump (formerly ProxyCommand) allows you to SSH through a bastion/jump host to reach servers on isolated internal networks. Config example: Host internal-srv / ProxyJump bastion.example.com. This is the standard enterprise pattern for accessing servers not exposed to the internet.',
  },
  {
    id: 'q4',
    question: 'What command copies your SSH public key to a remote server automatically?',
    options: ['scp ~/.ssh/id_rsa.pub user@host:.ssh/', 'ssh-copy-id user@host', 'ssh-keygen --deploy user@host', 'rsync ~/.ssh/id_rsa.pub user@host:~/.ssh/authorized_keys'],
    correct: 1,
    explanation: 'ssh-copy-id user@host is the safest way to deploy your public key. It appends the key to authorized_keys, creates the .ssh directory with correct permissions if needed, and sets correct file permissions automatically. scp works but requires manual permission fixing.',
  },
  {
    id: 'q5',
    question: 'Which fail2ban action protects SSH from brute-force attacks?',
    options: [
      'It monitors /var/log/auth.log and bans IPs after repeated failed logins',
      'It encrypts SSH traffic to prevent password interception',
      'It disables SSH after 3 failed attempts permanently',
      'It requires a CAPTCHA before allowing SSH connections',
    ],
    correct: 0,
    explanation: 'fail2ban monitors log files (e.g. /var/log/auth.log) for patterns indicating brute-force attempts. After a configurable number of failures (default 5), it adds an iptables/nftables rule to ban the source IP for a configurable duration (default 10 minutes). Essential for any internet-facing SSH service.',
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

export default function LinuxSSH() {
  return (
    <LessonLayout
      lessonId="linux-07"
      courseId="linux"
      title="SSH & Remote Access"
      courseTitle="Linux Fundamentals"
      courseHref="/linux"
      xp={70}
      readTime="~25 min"
      icon="🔐"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Linux Fundamentals', href: '/linux' },
        { label: 'SSH & Remote Access' },
      ]}
      prev={{ title: 'Linux Networking', href: '/linux/networking' }}
      next={{ title: 'Firewall with iptables & ufw', href: '/linux/firewall' }}
      objectives={[
        'Generate and deploy SSH key pairs securely',
        'Harden sshd_config following production best practices',
        'Configure SSH client config for multiple hosts',
        'Set up SSH tunnelling and jump hosts',
        'Implement fail2ban for brute-force protection',
        'Audit active SSH sessions and connections',
      ]}
    >
      {/* ── OVERVIEW ── */}
      <section>
        <h2>Overview</h2>
        <p>
          <GlossaryTooltip term="SSH" /> (Secure Shell) is the primary protocol for remote
          server administration in Linux environments. Every sysadmin spends a significant
          portion of their day inside SSH sessions.
        </p>
        <p className="mt-4">
          But default SSH configurations are a security liability. Password authentication
          is vulnerable to brute force. Root login exposes your most privileged account.
          Default port 22 attracts automated scanners. This lesson covers production-hardened
          SSH configuration — the difference between a server you can feel confident about
          and one that's one credential leak away from compromise.
        </p>
        <Callout type="danger" icon="🚨" title="Default SSH is not safe for production">
          A default Ubuntu Server exposed to the internet will receive thousands of
          brute-force login attempts per day within hours. Key-only auth, a non-standard
          port, and fail2ban are the minimum hardening you must apply before going live.
        </Callout>
      </section>

      {/* ── KEY CONCEPTS ── */}
      <section>
        <h2>SSH Key Authentication — How It Works</h2>
        <div className="info-card mt-4">
          <div className="font-mono text-xs text-slate-400 leading-8 space-y-1">
            <div className="text-slate-500 mb-2">Key pair anatomy:</div>
            <div className="flex gap-4">
              <div className="flex-1 bg-surface-800 rounded-xl p-4 border border-accent-cyan/20">
                <p className="text-accent-cyan font-bold text-sm mb-2">🔑 Private Key</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">~/.ssh/id_ed25519</p>
                <p className="text-[11px] text-slate-500 mt-1">Never leaves your machine. Permissions: 600. Optionally encrypted with a passphrase.</p>
              </div>
              <div className="flex items-center text-slate-600 flex-shrink-0">↔</div>
              <div className="flex-1 bg-surface-800 rounded-xl p-4 border border-accent-green/20">
                <p className="text-accent-green font-bold text-sm mb-2">🔓 Public Key</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">~/.ssh/id_ed25519.pub</p>
                <p className="text-[11px] text-slate-500 mt-1">Safe to share. Placed in ~/.ssh/authorized_keys on every server you want to access.</p>
              </div>
            </div>
            <div className="mt-4 space-y-1 text-[11px] text-slate-500">
              <div>1. Client sends public key identity to server</div>
              <div>2. Server checks authorized_keys — found? Sends an encrypted challenge</div>
              <div>3. Client decrypts challenge with private key, proves possession</div>
              <div>4. Server grants access — no password ever transmitted</div>
            </div>
          </div>
        </div>

        <h3>Key Algorithm Selection</h3>
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          {[
            { algo: 'Ed25519', rec: '✅ Recommended', color: 'text-accent-green border-accent-green/20 bg-accent-green/5', desc: 'Modern EdDSA curve. Smallest keys, fastest, most secure. Use this for all new keys.' },
            { algo: 'RSA-4096', rec: '✅ Acceptable', color: 'text-accent-amber border-accent-amber/20 bg-accent-amber/5', desc: 'Widely compatible. Use 4096-bit if Ed25519 isn\'t supported. RSA-2048 is the minimum.' },
            { algo: 'DSA/ECDSA', rec: '❌ Avoid', color: 'text-accent-red border-accent-red/20 bg-accent-red/5', desc: 'DSA is broken. ECDSA has potential backdoor concerns. Don\'t use either.' },
          ].map(k => (
            <div key={k.algo} className={`card p-4 border ${k.color}`}>
              <p className={`font-mono font-bold text-sm mb-1`}>{k.algo}</p>
              <p className={`text-[10px] font-semibold mb-2`}>{k.rec}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{k.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SSHD_CONFIG HARDENING ── */}
      <section>
        <h2>sshd_config Hardening Reference</h2>
        <p>
          The SSH daemon configuration lives at <code className="font-mono text-accent-cyan text-sm">/etc/ssh/sshd_config</code>.
          Every change requires a reload: <code className="font-mono text-accent-cyan text-sm">systemctl reload sshd</code>.
        </p>
        <CodeBlock className="mt-4" title="/etc/ssh/sshd_config — production hardened" language="bash"
          code={CODE_LINUXSSH_1} />
      </section>

      {/* ── SSH CLIENT CONFIG ── */}
      <section>
        <h2>SSH Client Config — Work Smarter</h2>
        <p>
          The client config at <code className="font-mono text-accent-cyan text-sm">~/.ssh/config</code> lets you
          define host aliases so you never type long hostnames, ports, or usernames again.
        </p>
        <CodeBlock className="mt-4" title="~/.ssh/config" language="bash"
          code={CODE_LINUXSSH_2} />
      </section>

      {/* ── VMware LAB ── */}
      <section>
        <h2>VMware Lab Exercise</h2>
        <Callout type="warning" icon="🧪" title="Lab Environment">
          Ubuntu Server VM at 192.168.100.20. You'll configure SSH from both the Ubuntu
          VM (server side) and DC01 / your host machine (client side).
        </Callout>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB SSH-1</span>
            <span className="text-sm font-semibold text-white">Harden SSH on Ubuntu Server</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">

            <LabStep number={1}
              description="Generate an Ed25519 key pair on your client machine (your host or DC01 PowerShell)."
              command={CODE_LINUXSSH_3}
              output={CODE_LINUXSSH_4}
            />

            <LabStep number={2}
              description="Deploy your public key to the Ubuntu Server using ssh-copy-id."
              command={CODE_LINUXSSH_5}
              output={CODE_LINUXSSH_6}
            />

            <LabStep number={3}
              description="Harden sshd_config on the Ubuntu Server. IMPORTANT: Keep your current session open while testing!"
              command={CODE_LINUXSSH_7}
              output={CODE_LINUXSSH_8}
            />

            <LabStep number={4}
              description="Install and configure fail2ban to protect against brute-force attacks."
              command={CODE_LINUXSSH_9}
              output={CODE_LINUXSSH_10}
            />

            <LabStep number={5}
              description="Audit active SSH sessions and verify your hardening is working."
              command={CODE_LINUXSSH_11}
            />

            <Callout type="success" icon="✅" title="Lab Complete">
              Ubuntu Server now has key-only authentication, hardened sshd_config,
              and fail2ban protecting against brute-force. Test key auth from a new
              terminal before closing your existing session.
            </Callout>
          </div>
        </div>
      </section>

      {/* ── QUICK REF ── */}
      <section>
        <h2>Quick Reference</h2>
        <CodeBlock title="SSH Commands Cheat Sheet" language="bash" code={CODE_LINUXSSH_12} />
      </section>

      {/* ── QUIZ ── */}
      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to earn bonus XP.</p>
        <Quiz lessonId="linux-07" title="SSH & Remote Access Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={35} />
      </section>
    </LessonLayout>
  )
}
