import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'
import GlossaryTooltip from '../../components/GlossaryTooltip.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_CIATRIAD_1 = `# Generate SHA-256 hash of a file (original)
$originalHash = Get-FileHash "C:\\\\Windows\\\\System32\\\\
toskrnl.exe" -Algorithm SHA256
$originalHash.Hash

# Simulate a check — compare to a stored baseline
# In production: store baseline hashes in a secure, read-only location
$storedHash = "PUT_ORIGINAL_HASH_HERE"
if ($originalHash.Hash -eq $storedHash) {
    Write-Host "✔ File integrity VERIFIED" -ForegroundColor Green
} else {
    Write-Host "⚠ File MODIFIED — potential tampering!" -ForegroundColor Red
}`
const CODE_CIATRIAD_2 = `A1B2C3D4E5F6... (SHA-256 hash)
✔ File integrity VERIFIED`
const CODE_CIATRIAD_3 = `# Find all members of Domain Admins
Get-ADGroupMember "Domain Admins" | Select-Object Name, SamAccountName, ObjectClass

# Find enabled admin accounts that haven't logged in for 90 days (stale)
$cutoff = (Get-Date).AddDays(-90)
Get-ADUser -Filter {
    Enabled -eq $true -and LastLogonDate -lt $cutoff
} -Properties LastLogonDate |
Where-Object { (Get-ADPrincipalGroupMembership $_).Name -contains "Domain Admins" } |
Select-Object Name, LastLogonDate`
const CODE_CIATRIAD_4 = `Name           SamAccountName  ObjectClass
----           --------------  -----------
Administrator  Administrator   user
sysadmin       sysadmin        user

# Stale domain admins: none ✔ (good hygiene!)`
const CODE_CIATRIAD_5 = `# On Ubuntu Server VM (ssh user@192.168.100.20)
# Check critical services
for svc in ssh ufw cron; do
    status=$(systemctl is-active $svc)
    enabled=$(systemctl is-enabled $svc)
    echo "[$status/$enabled] $svc"
done

# Find services NOT set to auto-start that are currently running
systemctl list-units --type=service --state=running |
  awk 'NR>1 {print $1}' |
  while read svc; do
    enabled=$(systemctl is-enabled "$svc" 2>/dev/null)
    [ "$enabled" = "disabled" ] && echo "WARNING: $svc running but disabled at boot"
  done`
const CODE_CIATRIAD_6 = `[active/enabled] ssh
[active/enabled] ufw
[active/enabled] cron
# No warnings — all critical services enabled at boot ✔`
const CODE_CIATRIAD_7 = `# Find files readable by everyone in /etc that shouldn't be
find /etc -maxdepth 2 -type f -readable -perm /o+r \\
  -name "*.conf" -o -name "*.key" -o -name "*.pem" 2>/dev/null |
  head -20

# Check /etc/shadow permissions (should be 640 or 000)
ls -la /etc/shadow /etc/passwd /etc/sudoers`
const CODE_CIATRIAD_8 = `---------- 1 root shadow  1234 Jan 15 09:00 /etc/shadow  ← Correct (000)
-rw-r--r-- 1 root root    2345 Jan 15 09:00 /etc/passwd  ← Correct (644)
-r--r----- 1 root sudo    1456 Jan 15 09:00 /etc/sudoers ← Correct (440)`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'A ransomware attack encrypts all files on a server, making them inaccessible. Which CIA principle is primarily violated?',
    options: ['Confidentiality', 'Integrity', 'Availability', 'All three equally'],
    correct: 2,
    explanation: 'Availability is violated — authorised users can no longer access their data. The ransomware may also violate Integrity (files modified by encryption) but the primary, immediate impact is loss of Availability. Ransomware is the most common Availability attack.',
  },
  {
    id: 'q2',
    question: 'What is the core principle of Zero Trust security?',
    options: [
      'Trust all users inside the corporate network perimeter',
      'Never trust any user or device — always verify, regardless of location',
      'Use zero third-party tools and only trust in-house solutions',
      'Apply zero security controls to trusted partners',
    ],
    correct: 1,
    explanation: 'Zero Trust assumes breach and requires strict identity verification for every user and device, regardless of whether they are inside or outside the network perimeter. The traditional "castle and moat" model (trust inside, distrust outside) is replaced with "never trust, always verify".',
  },
  {
    id: 'q3',
    question: 'Which principle states that users and processes should only have the minimum permissions needed to perform their function?',
    options: ['Separation of Duties', 'Least Privilege', 'Need to Know', 'Defence in Depth'],
    correct: 1,
    explanation: 'The Principle of Least Privilege (PoLP) limits damage from compromised accounts and insider threats by ensuring accounts only have the permissions they actually need. A domain admin account used for browsing the web violates least privilege — any malware that runs will inherit domain admin rights.',
  },
  {
    id: 'q4',
    question: 'A file hash check before and after transfer shows the hashes are different. Which CIA principle does this indicate was violated?',
    options: ['Confidentiality', 'Integrity', 'Availability', 'Authentication'],
    correct: 1,
    explanation: 'Integrity ensures data has not been altered. Hash comparison (MD5, SHA-256) is a classic integrity check. If hashes differ, the file was modified during transit or storage — whether accidentally (corruption) or maliciously (tampering). Digital signatures, checksums, and blockchain are all integrity controls.',
  },
  {
    id: 'q5',
    question: 'What does "Defence in Depth" mean in practice?',
    options: [
      'Having a very strong single security control',
      'Patching systems deeply and thoroughly',
      'Layering multiple security controls so that failure of one does not compromise the whole system',
      'Defending only the deepest, most critical systems',
    ],
    correct: 2,
    explanation: 'Defence in Depth (also called layered security) means having multiple independent security controls. If an attacker bypasses the firewall, they still face network segmentation. If they get through that, they face endpoint detection. No single control is relied upon exclusively. This strategy assumes individual controls will fail.',
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

export default function CIATriad() {
  return (
    <LessonLayout
      lessonId="sec-01"
      courseId="cybersecurity"
      title="The CIA Triad & Security Models"
      courseTitle="Cybersecurity"
      courseHref="/cybersecurity"
      xp={50}
      readTime="~20 min"
      icon="🛡️"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Cybersecurity', href: '/cybersecurity' },
        { label: 'CIA Triad & Security Models' },
      ]}
      prev={null}
      next={{ title: 'Threat Modelling', href: '/cybersecurity/threat-modelling' }}
      objectives={[
        'Define the three pillars of the CIA Triad with real examples',
        'Map common attacks to the CIA principles they violate',
        'Understand Zero Trust and why the perimeter model failed',
        'Apply Least Privilege and Defence in Depth in practice',
        'Recognise security models used in enterprise environments',
      ]}
    >
      {/* ── OVERVIEW ── */}
      <section>
        <h2>Overview</h2>
        <p>
          Before you can harden a system, detect an intrusion, or respond to an incident,
          you need a mental framework for <em>what you're actually protecting</em>.
          The <GlossaryTooltip term="CIA Triad" /> — Confidentiality, Integrity, and Availability
          — is that framework. Every security control, every policy, every risk decision maps
          back to one or more of these three principles.
        </p>
        <p className="mt-4">
          This lesson also covers the security models that build on the CIA Triad:
          <strong> Zero Trust</strong>, <strong>Least Privilege</strong>, and
          <strong> Defence in Depth</strong> — the three concepts you'll encounter most
          in enterprise security work.
        </p>
      </section>

      {/* ── THE CIA TRIAD ── */}
      <section>
        <h2>The CIA Triad</h2>

        {/* Three pillars */}
        <div className="grid sm:grid-cols-3 gap-5 mt-5">
          {[
            {
              letter: 'C', word: 'Confidentiality',
              colour: 'from-brand-600/30 to-brand-900/30',
              border: 'border-brand-500/25', text: 'text-brand-300',
              icon: '🔒',
              definition: 'Ensuring information is accessible only to those authorised to access it.',
              attacks: ['Data breaches', 'Man-in-the-middle', 'Eavesdropping', 'Credential theft', 'Insecure APIs'],
              controls: ['Encryption (AES-256, TLS)', 'Access controls & RBAC', 'Multi-factor authentication', 'Data classification', 'VPN & private networks'],
              real: 'An attacker intercepts unencrypted HTTP traffic and reads user passwords. Solution: enforce HTTPS (TLS) — encrypting the data ensures only intended recipients can read it.',
            },
            {
              letter: 'I', word: 'Integrity',
              colour: 'from-accent-green/20 to-emerald-900/30',
              border: 'border-accent-green/25', text: 'text-accent-green',
              icon: '✅',
              definition: 'Safeguarding the accuracy and completeness of data — ensuring it has not been altered.',
              attacks: ['Man-in-the-middle tampering', 'SQL injection', 'Log tampering', 'DNS spoofing', 'Supply chain attacks'],
              controls: ['Cryptographic hashing (SHA-256)', 'Digital signatures', 'Code signing', 'Audit logging', 'File integrity monitoring'],
              real: 'A developer\'s package manager downloads a malicious dependency because an attacker modified the package registry. Solution: verify package checksums and use signed repositories.',
            },
            {
              letter: 'A', word: 'Availability',
              colour: 'from-accent-amber/20 to-yellow-900/30',
              border: 'border-accent-amber/25', text: 'text-accent-amber',
              icon: '⚡',
              definition: 'Ensuring authorised users have access to information and systems when needed.',
              attacks: ['DDoS attacks', 'Ransomware', 'Hardware failure', 'Power outages', 'Misconfigured firewall'],
              controls: ['Redundancy & failover', 'Load balancing', 'DDoS protection', 'Backup & disaster recovery', 'UPS & generator power'],
              real: 'Ransomware encrypts all files on a file server at 3am. Without backups, the company cannot recover. Solution: daily backups to an isolated, immutable store with tested restore procedures.',
            },
          ].map(p => (
            <div key={p.letter}
                 className={`rounded-2xl bg-gradient-to-br ${p.colour} border ${p.border} p-6 flex flex-col gap-4`}>
              <div className="flex items-center gap-3">
                <span className={`text-5xl font-extrabold font-mono ${p.text}`}>{p.letter}</span>
                <div>
                  <p className={`text-lg font-bold ${p.text}`}>{p.word}</p>
                  <span className="text-xl">{p.icon}</span>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{p.definition}</p>
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Common Attacks</p>
                <ul className="space-y-1">
                  {p.attacks.map(a => (
                    <li key={a} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="w-1 h-1 rounded-full bg-accent-red flex-shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Controls</p>
                <ul className="space-y-1">
                  {p.controls.map(c => (
                    <li key={c} className="flex items-center gap-2 text-xs text-slate-400">
                      <svg className="w-3 h-3 text-accent-green flex-shrink-0" fill="none"
                           viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-surface-900/50 rounded-xl p-3 border border-surface-700">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Real Scenario</p>
                <p className="text-xs text-slate-400 leading-relaxed">{p.real}</p>
              </div>
            </div>
          ))}
        </div>

        <Callout type="info" icon="💡" title="Mapping attacks to CIA — your exam superpower">
          Every security scenario in an interview, certification exam, or real incident can
          be analysed using the CIA Triad. Ask: "What was compromised — the secrecy of the
          data, its accuracy, or its accessibility?" Often more than one is violated.
        </Callout>
      </section>

      {/* ── SECURITY MODELS ── */}
      <section>
        <h2>Core Security Models</h2>

        <h3>Zero Trust — "Never Trust, Always Verify"</h3>
        <p>
          The traditional perimeter model assumed everything inside the corporate network
          was safe. Zero Trust rejects this — it assumes breach and requires strict
          authentication for every request, from every user, on every device.
        </p>

        <div className="info-card mt-4">
          <div className="grid sm:grid-cols-2 gap-4 border-b border-surface-700 pb-5 mb-5">
            <div>
              <p className="text-xs font-semibold text-accent-red uppercase tracking-widest mb-3">
                ❌ Old Model — Trust the Perimeter
              </p>
              <div className="font-mono text-xs text-slate-500 space-y-1 leading-6">
                <div>Internet ──[Firewall]──▶ Corporate Network</div>
                <div className="ml-20">↓</div>
                <div className="ml-10 text-accent-red">"You're inside = Trusted"</div>
                <div className="ml-10 text-slate-600">No re-authentication</div>
                <div className="ml-10 text-slate-600">Flat network = lateral movement</div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-accent-green uppercase tracking-widest mb-3">
                ✅ Zero Trust Model
              </p>
              <div className="font-mono text-xs text-slate-500 space-y-1 leading-6">
                <div>Any user + Any device + Any location</div>
                <div className="ml-12">↓</div>
                <div className="ml-5 text-accent-green">"Verify Identity + Device + Context"</div>
                <div className="ml-5 text-slate-400">MFA + Device compliance check</div>
                <div className="ml-5 text-slate-400">Least-privilege access granted</div>
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { principle: 'Verify Explicitly', icon: '🔐', desc: 'Authenticate and authorise based on identity, device health, location, and behaviour every time.' },
              { principle: 'Use Least Privilege', icon: '🔒', desc: 'Just-In-Time, Just-Enough-Access. Time-limited, scoped permissions. No standing admin access.' },
              { principle: 'Assume Breach', icon: '🚨', desc: 'Segment networks, encrypt everything, monitor continuously. Minimise blast radius when (not if) a breach occurs.' },
            ].map(p => (
              <div key={p.principle} className="bg-surface-800 rounded-xl p-4 border border-surface-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{p.icon}</span>
                  <p className="text-sm font-semibold text-white">{p.principle}</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <h3>Principle of Least Privilege</h3>
        <p>
          Every user, service, and process should operate with only the minimum rights
          required to perform its function — nothing more.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {[
            { bad: 'Using Domain Admin account for daily work (email, browsing)', good: 'Separate admin account (a-username) for admin tasks; regular account for everything else' },
            { bad: 'SQL service account running as SYSTEM or Administrator', good: 'Dedicated low-privileged service account with access only to the SQL data directory' },
            { bad: 'Developers have write access to production databases', good: 'Read-only access to production; write access only via change management process' },
            { bad: 'All IT staff have Domain Admin rights "just in case"', good: 'Role-based access: helpdesk can reset passwords in specific OUs; no other admin rights' },
          ].map((ex, i) => (
            <div key={i} className="rounded-xl border border-surface-700 overflow-hidden text-xs">
              <div className="flex gap-2 px-3 py-2.5 bg-accent-red/5 border-b border-surface-700">
                <span className="text-accent-red flex-shrink-0">❌</span>
                <span className="text-slate-400">{ex.bad}</span>
              </div>
              <div className="flex gap-2 px-3 py-2.5 bg-accent-green/5">
                <span className="text-accent-green flex-shrink-0">✅</span>
                <span className="text-slate-300">{ex.good}</span>
              </div>
            </div>
          ))}
        </div>

        <h3>Defence in Depth</h3>
        <p>Layer multiple independent controls. If one fails, the others hold.</p>
        <div className="info-card mt-4">
          <div className="font-mono text-xs leading-8 text-center text-slate-400">
            <div className="text-slate-600 mb-1">Attacker trying to reach the database</div>
            {[
              { layer: 'Perimeter Firewall',        status: 'first barrier',    color: 'border-brand-500/40 text-brand-300' },
              { layer: 'WAF / IPS',                 status: 'detects attacks',  color: 'border-accent-cyan/40 text-accent-cyan' },
              { layer: 'Network Segmentation',      status: 'limits movement',  color: 'border-accent-green/40 text-accent-green' },
              { layer: 'Host Firewall + Patching',  status: 'hardens hosts',    color: 'border-accent-amber/40 text-accent-amber' },
              { layer: 'MFA + Least Privilege',     status: 'controls access',  color: 'border-orange-400/40 text-orange-300' },
              { layer: 'Database Encryption',       status: 'protects data',    color: 'border-accent-red/40 text-accent-red' },
            ].map((l, i) => (
              <div key={l.layer} className="flex items-center justify-between">
                {i > 0 && <div className="w-px h-4 bg-surface-600 mx-auto" style={{gridColumn:'2'}} />}
                <div className={`w-full border rounded-lg px-4 py-2 text-sm font-medium
                                  flex items-center justify-between ${l.color}`}>
                  <span>{l.layer}</span>
                  <span className="text-[10px] text-slate-500">{l.status}</span>
                </div>
              </div>
            ))}
            <div className="mt-1 text-accent-amber text-xs">🎯 Protected Asset: Database</div>
          </div>
        </div>
      </section>

      {/* ── LAB ── */}
      <section>
        <h2>VMware Lab Exercise</h2>
        <Callout type="info" icon="🧪" title="Lab Goal">
          Apply CIA Triad principles practically: verify file integrity, check for
          over-privileged accounts, and audit running services on both Windows and Linux.
        </Callout>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB SEC-1</span>
            <span className="text-sm font-semibold text-white">CIA Triad — Practical Verification</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~15 min</span>
          </div>
          <div className="lab-body space-y-8">

            <LabStep number={1}
              description="Integrity check: verify a file hasn't been tampered with using hash comparison (Windows)."
              language="powershell"
              command={CODE_CIATRIAD_1}
              output={CODE_CIATRIAD_2}
            />

            <LabStep number={2}
              description="Least Privilege check: find over-privileged accounts in Active Directory."
              language="powershell"
              command={CODE_CIATRIAD_3}
              output={CODE_CIATRIAD_4}
            />

            <LabStep number={3}
              description="Availability check: verify critical services are running and set to auto-start (Linux)."
              language="bash"
              command={CODE_CIATRIAD_5}
              output={CODE_CIATRIAD_6}
            />

            <LabStep number={4}
              description="Confidentiality check: find world-readable sensitive files (Linux)."
              language="bash"
              command={CODE_CIATRIAD_7}
              output={CODE_CIATRIAD_8}
            />

            <Callout type="success" icon="✅" title="Lab Complete">
              You've applied all three CIA principles practically: verified file integrity
              with hashing, audited for least-privilege violations, confirmed service
              availability, and checked for confidentiality misconfigurations.
            </Callout>
          </div>
        </div>
      </section>

      {/* ── QUIZ ── */}
      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to earn bonus XP.</p>
        <Quiz lessonId="sec-01" title="CIA Triad & Security Models Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={25} />
      </section>
    </LessonLayout>
  )
}
