import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_CYBERSECURITYWINDOWSHARDENING_1 = `# Audit installed roles and features
Get-WindowsFeature | Where-Object { $_.InstallState -eq 'Installed' } |
  Select-Object Name, DisplayName | Sort-Object Name

# Remove commonly unnecessary features on a DC
# (adjust based on actual requirements)
$featurestoRemove = @(
    'Telnet-Client',
    'TFTP-Client',
    'Internet-Print-Client',
    'WindowsPowerShellV2',
    'WindowsPowerShellV2Root'
)

foreach ($feat in $featurestoRemove) {
    if ((Get-WindowsFeature $feat).InstallState -eq 'Installed') {
        Remove-WindowsFeature $feat -WhatIf
    }
}

# Audit listening services
Get-Service | Where-Object { $_.StartType -eq 'Automatic' -and $_.Status -eq 'Running' } |
  Select-Object Name, DisplayName | Sort-Object Name

# Disable Print Spooler if not a print server (PrintNightmare vector)
Stop-Service -Name Spooler -Force
Set-Service -Name Spooler -StartupType Disabled`
const CODE_CYBERSECURITYWINDOWSHARDENING_2 = `# Set domain password policy (run on DC01)
Set-ADDefaultDomainPasswordPolicy \`
  -Identity lab.local \`
  -PasswordHistoryCount 24 \`
  -MaxPasswordAge 365.00:00:00 \`
  -MinPasswordAge 1.00:00:00 \`
  -MinPasswordLength 14 \`
  -ComplexityEnabled $true \`
  -LockoutThreshold 5 \`
  -LockoutDuration 00:15:00 \`
  -LockoutObservationWindow 00:15:00

# Verify
Get-ADDefaultDomainPasswordPolicy`
const CODE_CYBERSECURITYWINDOWSHARDENING_3 = `# ── Account Logon ────────────────────────────────────────────
auditpol /set /subcategory:'Credential Validation' /success:enable /failure:enable
auditpol /set /subcategory:'Kerberos Authentication Service' /success:enable /failure:enable

# ── Account Management ───────────────────────────────────────
auditpol /set /subcategory:'User Account Management' /success:enable /failure:enable
auditpol /set /subcategory:'Security Group Management' /success:enable /failure:enable
auditpol /set /subcategory:'Computer Account Management' /success:enable /failure:enable

# ── Logon/Logoff ─────────────────────────────────────────────
auditpol /set /subcategory:'Logon' /success:enable /failure:enable
auditpol /set /subcategory:'Special Logon' /success:enable /failure:enable

# ── Privilege Use ─────────────────────────────────────────────
auditpol /set /subcategory:'Sensitive Privilege Use' /success:enable /failure:enable

# ── Policy Change ─────────────────────────────────────────────
auditpol /set /subcategory:'Audit Policy Change' /success:enable /failure:enable

# Verify current policy
auditpol /get /category:*`
const CODE_CYBERSECURITYWINDOWSHARDENING_4 = `# Check current password policy
Get-ADDefaultDomainPasswordPolicy | Select-Object MinPasswordLength,
  PasswordHistoryCount, LockoutThreshold, ComplexityEnabled

# Check for accounts with password never expires
Get-ADUser -Filter { PasswordNeverExpires -eq $true -and Enabled -eq $true } \`\`
  -Properties PasswordNeverExpires | Select-Object Name, SamAccountName

# Check running services attack surface
Get-Service | Where-Object { $_.Status -eq 'Running' } |
  Measure-Object | Select-Object Count`
const CODE_CYBERSECURITYWINDOWSHARDENING_5 = `MinPasswordLength : 7   ← too short, CIS requires 14
PasswordHistoryCount: 0  ← should be 24
LockoutThreshold  : 0   ← no lockout! critical finding
ComplexityEnabled : True

Name          SamAccountName
----          --------------
Administrator Administrator  ← fix this

Count : 67  ← audit each one`
const CODE_CYBERSECURITYWINDOWSHARDENING_6 = `Set-ADDefaultDomainPasswordPolicy -Identity lab.local \`\`
  -MinPasswordLength 14 \`\`
  -PasswordHistoryCount 24 \`\`
  -LockoutThreshold 5 \`\`
  -LockoutDuration 00:15:00 \`\`
  -LockoutObservationWindow 00:15:00 \`\`
  -ComplexityEnabled $true

# Fix Administrator account
Set-ADUser -Identity Administrator -PasswordNeverExpires $false

# Verify
Get-ADDefaultDomainPasswordPolicy | Select-Object MinPasswordLength, LockoutThreshold
Write-Host 'Password policy hardened' -ForegroundColor Green`
const CODE_CYBERSECURITYWINDOWSHARDENING_7 = `MinPasswordLength : 14   ✔
LockoutThreshold  : 5    ✔
Password policy hardened`
const CODE_CYBERSECURITYWINDOWSHARDENING_8 = `# Enable key audit categories
auditpol /set /subcategory:'Credential Validation' /success:enable /failure:enable
auditpol /set /subcategory:'Logon' /success:enable /failure:enable
auditpol /set /subcategory:'User Account Management' /success:enable /failure:enable

# Disable Print Spooler (PrintNightmare mitigation)
Stop-Service -Name Spooler -Force -ErrorAction SilentlyContinue
Set-Service  -Name Spooler -StartupType Disabled

# Confirm
Get-Service Spooler | Select-Object Name, Status, StartType
auditpol /get /subcategory:'Logon'`
const CODE_CYBERSECURITYWINDOWSHARDENING_9 = `Name    Status  StartType
----    ------  ---------
Spooler Stopped Disabled    ✔ PrintNightmare mitigated

System audit policy
Logon: Success and Failure   ✔`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What are CIS Benchmarks and why are they authoritative?',
    options: [
      'Microsoft internal security guidelines only available to Enterprise customers',
      'Community-developed, consensus-based configuration standards created by the Center for Internet Security — the most widely referenced baseline for system hardening',
      'Government classified security standards requiring special clearance to access',
      'Automated tools that scan for vulnerabilities and fix them automatically',
    ],
    correct: 1,
    explanation: 'CIS (Center for Internet Security) Benchmarks are free, community-developed security configuration guides for operating systems, cloud platforms, and applications. They are developed through a consensus process involving security experts and are widely recognised by regulators, auditors, and security teams. CIS Level 1 = practical security that doesn\'t impact functionality. CIS Level 2 = high-security environments where functionality may be reduced.',
  },
  {
    id: 'q2',
    question: 'What does "attack surface reduction" mean in Windows Server hardening?',
    options: [
      'Installing antivirus software to block all known attacks',
      'Minimising the number of installed roles, features, services, and open ports — fewer running components means fewer ways an attacker can exploit the system',
      'Blocking all inbound network traffic with a firewall',
      'Renaming the Administrator account to reduce brute-force attempts',
    ],
    correct: 1,
    explanation: 'Attack surface reduction means minimising everything that is exposed: uninstall unused roles and features, disable unused services, close unnecessary ports, remove unused software, and restrict which accounts can do what. A minimal server running only what it needs has far fewer exploitable components than a general-purpose server with everything installed.',
  },
  {
    id: 'q3',
    question: 'What does enabling "Credential Guard" protect against?',
    options: [
      'Brute-force attacks against domain account passwords',
      'Pass-the-Hash and Pass-the-Ticket attacks by isolating credential material in a hardware-protected Virtual Secure Mode process',
      'Phishing attacks that steal credentials from browsers',
      'Kerberoasting attacks against service account passwords',
    ],
    correct: 1,
    explanation: 'Windows Credential Guard uses Virtualization-Based Security (VBS) to isolate NTLM hashes and Kerberos tickets in a separate Hyper-V Virtual Secure Mode process that the main OS cannot access. This prevents attackers who gain admin access from using Mimikatz or similar tools to extract credentials from LSASS memory for Pass-the-Hash and Pass-the-Ticket attacks.',
  },
  {
    id: 'q4',
    question: 'What is the recommended approach to manage privileged access on Windows Servers (Microsoft\'s tiered model)?',
    options: [
      'Use a single administrator account with a very long password for all tasks',
      'Use separate accounts for each tier: Tier 0 (Domain Controllers), Tier 1 (Servers), Tier 2 (Workstations) — never use a higher-tier account on a lower-tier system',
      'Enable multi-factor authentication on the default Administrator account',
      'Use shared credentials stored in a password manager accessible to all IT staff',
    ],
    correct: 1,
    explanation: 'Microsoft\'s privileged access tiering model separates administrative accounts by the systems they manage. A Tier 0 admin account (used on Domain Controllers) must NEVER be used to log into a Tier 1 server or Tier 2 workstation. If a workstation (Tier 2) is compromised and a Tier 0 admin logs in, their credentials can be stolen. PAWs (Privileged Access Workstations) are dedicated hardened machines for tier administration.',
  },
  {
    id: 'q5',
    question: 'What Windows Security policy setting prevents users from reusing recent passwords?',
    options: [
      'Maximum password age',
      'Enforce password history — stores previous password hashes and rejects reuse of the last N passwords',
      'Minimum password length',
      'Password must meet complexity requirements',
    ],
    correct: 1,
    explanation: 'Enforce password history stores hashes of previous passwords (up to 24) and prevents reuse. Combined with minimum password age (prevents immediate cycling through history), this ensures users cannot just append a number to their old password. Recommended setting: 24 passwords remembered. Without minimum password age, users could reset 24 times in one session to reuse their favourite password.',
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

function LabStep({ number, description, command, language = 'powershell', output }) {
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

export default function CybersecurityWindowsHardening() {
  return (
    <LessonLayout
      lessonId="sec-03"
      courseId="cybersecurity"
      title="Windows Server Hardening"
      courseTitle="Cybersecurity"
      courseHref="/cybersecurity"
      xp={100}
      readTime="~40 min"
      icon="🔒"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Cybersecurity', href: '/cybersecurity' },
        { label: 'Windows Server Hardening' },
      ]}
      prev={{ title: 'Threat Modelling',     href: '/cybersecurity/threat-modelling' }}
      next={{ title: 'Linux Server Hardening', href: '/cybersecurity/linux-hardening' }}
      objectives={[
        'Apply CIS Benchmark Level 1 controls to Windows Server 2025',
        'Reduce attack surface by removing unused roles and features',
        'Configure account and password policies via Group Policy',
        'Enable and configure Windows security auditing',
        'Understand and enable Credential Guard and Windows Defender',
        'Apply privileged access tiering principles',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          A default Windows Server installation is configured for compatibility and
          ease-of-use — not security. Hardening is the process of deliberately reducing
          the attack surface and configuring security controls so the system resists
          common attack techniques.
        </p>
        <p className="mt-4">
          This lesson follows the CIS Windows Server 2025 Benchmark (Level 1) — the
          industry standard baseline used by security teams and auditors worldwide.
          Every control is explained, not just listed.
        </p>
        <Callout type="danger" icon="⚠️" title="Test before production">
          Always test hardening changes in the lab before applying to production. Some
          controls — particularly those affecting network protocols and authentication —
          can break services if applied without understanding the impact. Use Group
          Policy with targeted OUs to roll out gradually.
        </Callout>
      </section>

      <section>
        <h2>Attack Surface Reduction</h2>
        <CodeBlock title="Remove unused roles, features, and services" language="powershell"
          code={CODE_CYBERSECURITYWINDOWSHARDENING_1} />
      </section>

      <section>
        <h2>Account & Password Policy</h2>
        <div className="info-card mt-4 overflow-hidden">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">CIS Benchmark — Password Policy Controls</p>
          <div className="divide-y divide-surface-700">
            {[
              { policy: 'Enforce password history',       rec: '24 passwords',   why: 'Prevents immediate reuse after mandatory change' },
              { policy: 'Maximum password age',           rec: '365 days',       why: 'Forces periodic rotation; NIST recommends longer/no expiry with MFA' },
              { policy: 'Minimum password age',           rec: '1 day',          why: 'Prevents cycling through history to reuse favourite password' },
              { policy: 'Minimum password length',        rec: '14 characters',  why: 'Modern standard — longer is better; passphrase encouraged' },
              { policy: 'Password complexity',            rec: 'Enabled',        why: 'Requires uppercase, lowercase, number/symbol' },
              { policy: 'Account lockout threshold',      rec: '5 attempts',     why: 'Prevents brute force; balance with help desk call volume' },
              { policy: 'Account lockout duration',       rec: '15 minutes',     why: 'Auto-resets after delay; 0 = admin must unlock manually' },
              { policy: 'Reset lockout counter after',    rec: '15 minutes',     why: 'Observation window for lockout threshold' },
            ].map(r => (
              <div key={r.policy} className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3">
                <p className="text-xs font-semibold text-white">{r.policy}</p>
                <code className="text-xs font-mono text-accent-green">{r.rec}</code>
                <p className="text-xs text-slate-500">{r.why}</p>
              </div>
            ))}
          </div>
        </div>
        <CodeBlock className="mt-4" title="Configure password policy via PowerShell" language="powershell"
          code={CODE_CYBERSECURITYWINDOWSHARDENING_2} />
      </section>

      <section>
        <h2>Security Auditing Configuration</h2>
        <CodeBlock title="Enable comprehensive security audit policy" language="powershell"
          code={CODE_CYBERSECURITYWINDOWSHARDENING_3} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB SEC-3</span>
            <span className="text-sm font-semibold text-white">Harden DC01 Against CIS Baseline</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~25 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Audit the current security state of DC01 before hardening."
              command={CODE_CYBERSECURITYWINDOWSHARDENING_4}
              output={CODE_CYBERSECURITYWINDOWSHARDENING_5}
            />
            <LabStep number={2}
              description="Apply CIS-compliant password and lockout policy."
              command={CODE_CYBERSECURITYWINDOWSHARDENING_6}
              output={CODE_CYBERSECURITYWINDOWSHARDENING_7}
            />
            <LabStep number={3}
              description="Enable security auditing and disable the Print Spooler service."
              command={CODE_CYBERSECURITYWINDOWSHARDENING_8}
              output={CODE_CYBERSECURITYWINDOWSHARDENING_9}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="sec-03" title="Windows Server Hardening Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={50} />
      </section>
    </LessonLayout>
  )
}
