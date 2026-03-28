import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'
import GlossaryTooltip from '../../components/GlossaryTooltip.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_WINDOWSFIREWALL_1 = `# Check all profiles status
Get-NetFirewallProfile | Select-Object Name, Enabled, DefaultInboundAction, DefaultOutboundAction

# See all enabled inbound rules
Get-NetFirewallRule -Direction Inbound -Enabled True |
  Select-Object DisplayName, Profile, Action |
  Sort-Object DisplayName |
  Format-Table -AutoSize

# Count rules by profile
Get-NetFirewallRule | Group-Object Profile | Select-Object Name, Count`
const CODE_WINDOWSFIREWALL_2 = `Name     Enabled  DefaultInboundAction  DefaultOutboundAction
----     -------  --------------------  ---------------------
Domain   True     Block                 Allow
Private  True     Block                 Allow
Public   True     Block                 Allow

Name    Count
----    -----
Any     145
Domain  32
Public  18`
const CODE_WINDOWSFIREWALL_3 = `# Allow TCP 8443 for a web management interface (Domain profile only)
New-NetFirewallRule -DisplayName "WebMgmt-HTTPS-8443" -Description "Web management interface — internal only" -Direction Inbound -Protocol TCP -LocalPort 8443 -Action Allow -Profile Domain -Enabled True -RemoteAddress "192.168.100.0/24"

# Verify the rule was created
Get-NetFirewallRule -DisplayName "WebMgmt-HTTPS-8443" |
  Get-NetFirewallPortFilter`
const CODE_WINDOWSFIREWALL_4 = `Protocol  LocalPort  RemotePort
--------  ---------  ----------
TCP       8443       Any`
const CODE_WINDOWSFIREWALL_5 = `# Block all inbound traffic from a specific IP
New-NetFirewallRule -DisplayName "BLOCK-SuspiciousIP-10.0.0.99" -Direction Inbound -RemoteAddress "10.0.0.99" -Action Block -Profile Any -Enabled True

# Block outbound to a suspicious domain's IP as well
New-NetFirewallRule -DisplayName "BLOCK-OUT-SuspiciousIP-10.0.0.99" -Direction Outbound -RemoteAddress "10.0.0.99" -Action Block -Profile Any -Enabled True`
const CODE_WINDOWSFIREWALL_6 = `# Enable logging for dropped packets on the Domain profile
Set-NetFirewallProfile -Profile Domain -LogBlocked True -LogFileName "C:\\Windows\\System32\\LogFiles\\Firewall\\pfirewall.log" -LogMaxSizeKilobytes 4096

# Trigger a blocked connection (test from Ubuntu VM)
# ssh -p 2222 user@192.168.100.10  ← this will be blocked (no rule for 2222)

# Read the firewall log
Get-Content "C:\\Windows\\System32\\LogFiles\\Firewall\\pfirewall.log" |
  Select-Object -Last 20`
const CODE_WINDOWSFIREWALL_7 = `#Version: 1.5
#Software: Microsoft Windows Firewall
#Fields: date time action protocol src-ip dst-ip src-port dst-port
2025-01-15 10:23:45 DROP TCP 192.168.100.20 192.168.100.10 54321 2222`
const CODE_WINDOWSFIREWALL_8 = `# Export all firewall rules to CSV for documentation
Get-NetFirewallRule |
  Where-Object { $_.Owner -ne $null -or $_.DisplayGroup -eq "" } |
  Select-Object DisplayName, Direction, Action, Enabled, Profile, Description |
  Export-Csv "C:\\Firewall-Rules-Backup.csv" -NoTypeInformation

# Export full policy for restore (wfw format)
netsh advfirewall export "C:\\Firewall-Policy-Backup.wfw"

# Restore from backup:
# netsh advfirewall import "C:\\Firewall-Policy-Backup.wfw"`
const CODE_WINDOWSFIREWALL_9 = `✔ C:\\Firewall-Rules-Backup.csv written (47 rows)
✔ C:\\Firewall-Policy-Backup.wfw exported successfully`
const CODE_WINDOWSFIREWALL_10 = `# Create a GPO for firewall rules
$gpo = New-GPO -Name "Server-Firewall-Baseline"
New-GPLink -Name "Server-Firewall-Baseline" -Target "DC=lab,DC=local"

# Use Set-GPRegistryValue to configure firewall via GP
# In production, use GPMC GUI: Computer Configuration →
# Windows Settings → Security Settings → Windows Firewall with Advanced Security

# Verify firewall rules are applied via GP
gpresult /r | Select-String "Firewall"

# Force refresh on all domain computers
Invoke-GPUpdate -Computer "WS01" -Force`
const CODE_WINDOWSFIREWALL_11 = `# ── Profile Management ─────────────────────────────────────
Get-NetFirewallProfile
Set-NetFirewallProfile -Profile Domain -Enabled True
Set-NetFirewallProfile -Profile Domain -DefaultInboundAction Block

# ── Rule Management ─────────────────────────────────────────
Get-NetFirewallRule | Where-Object { $_.Enabled -eq 'True' }
Get-NetFirewallRule -DisplayName "Remote Desktop*"
New-NetFirewallRule -DisplayName "Allow-HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow -Profile Domain
Set-NetFirewallRule -DisplayName "Allow-HTTP" -Enabled False
Remove-NetFirewallRule -DisplayName "Allow-HTTP"
Disable-NetFirewallRule -DisplayName "Allow-HTTP"
Enable-NetFirewallRule -DisplayName "Allow-HTTP"

# ── Scope (restrict by IP) ───────────────────────────────────
New-NetFirewallRule -DisplayName "Allow-RDP-JumpHost" -Direction Inbound -Protocol TCP -LocalPort 3389 -RemoteAddress "192.168.100.50" -Action Allow -Profile Domain

# ── Logging ─────────────────────────────────────────────────
Set-NetFirewallProfile -Profile Domain -LogBlocked True
Set-NetFirewallProfile -Profile Domain -LogAllowed True

# ── Backup / Restore ─────────────────────────────────────────
netsh advfirewall export "C:\\fw-backup.wfw"
netsh advfirewall import "C:\\fw-backup.wfw"
netsh advfirewall reset   # Factory reset (dangerous!)`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'In Windows Defender Firewall, what is the difference between Inbound and Outbound rules?',
    options: [
      'Inbound rules control traffic from the internet only; Outbound rules control local traffic',
      'Inbound rules filter traffic arriving at the computer; Outbound rules filter traffic leaving the computer',
      'Inbound rules apply to servers; Outbound rules apply to workstations',
      'There is no functional difference — both block or allow the same traffic',
    ],
    correct: 1,
    explanation: 'Inbound rules filter traffic arriving at the host (e.g. blocking port 3389 to prevent RDP access). Outbound rules filter traffic leaving the host (e.g. blocking a process from calling home). By default, Windows blocks unsolicited inbound connections and allows all outbound connections.',
  },
  {
    id: 'q2',
    question: 'What are the three Windows Firewall profiles and when does each apply?',
    options: [
      'Public, Private, and Domain — applying based on network location detection',
      'High, Medium, and Low — based on security level set by the administrator',
      'Wired, Wireless, and VPN — based on the connection type',
      'Local, Remote, and Cloud — based on where the resource is hosted',
    ],
    correct: 0,
    explanation: 'Domain profile applies when the computer is connected to a domain network. Private profile applies to home or work networks marked as trusted. Public profile applies to public/untrusted networks (hotels, coffee shops). Each profile can have different rules — you typically allow more on Domain, restrict heavily on Public.',
  },
  {
    id: 'q3',
    question: 'What PowerShell cmdlet creates a new inbound firewall rule to allow TCP port 8080?',
    options: [
      'Add-FirewallRule -Port 8080 -Protocol TCP -Direction Inbound',
      'New-NetFirewallRule -DisplayName "Web-8080" -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow',
      'Set-NetFirewallRule -Port 8080 -Allow $true',
      'Enable-NetFirewallRule -LocalPort 8080 -Protocol TCP',
    ],
    correct: 1,
    explanation: 'New-NetFirewallRule is the cmdlet for creating firewall rules. Key parameters: -Direction (Inbound/Outbound), -Protocol (TCP/UDP/Any), -LocalPort (port number or range), -Action (Allow/Block), -Profile (Domain/Private/Public/Any). -DisplayName is required and should be descriptive.',
  },
  {
    id: 'q4',
    question: 'What is Windows Defender Firewall with Advanced Security (WFAS) Connection Security Rules used for?',
    options: [
      'Blocking connections from specific countries',
      'Requiring IPsec encryption and authentication between specific computers',
      'Setting bandwidth limits on network connections',
      'Automatically blocking ports that are not in use',
    ],
    correct: 1,
    explanation: 'Connection Security Rules (part of WFAS) configure IPsec to authenticate and/or encrypt traffic between computers. They can require that all traffic between two servers be mutually authenticated with Kerberos and encrypted. This is different from regular firewall rules — they don\'t allow or block traffic, they specify the security requirements for allowed traffic.',
  },
  {
    id: 'q5',
    question: 'A new Windows service needs to accept connections on port 5985. Which firewall profile change is most appropriate for a domain-joined server?',
    options: [
      'Allow on all three profiles (Domain, Private, Public)',
      'Allow on Domain profile only',
      'Disable the firewall entirely for easier management',
      'Create an outbound rule to allow port 5985',
    ],
    correct: 1,
    explanation: 'Port 5985 is WinRM (PowerShell remoting). On a domain-joined server, you should allow it on the Domain profile only — not Private or Public. This follows the principle of least privilege: the service is only accessible from domain networks, not from untrusted public networks.',
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

export default function WindowsFirewall() {
  return (
    <LessonLayout
      lessonId="ws2025-08"
      courseId="windows-server-2025"
      title="Windows Firewall & Security"
      courseTitle="Windows Server 2025"
      courseHref="/windows-server-2025"
      xp={100}
      readTime="~35 min"
      icon="🛡️"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Windows Server 2025', href: '/windows-server-2025' },
        { label: 'Windows Firewall & Security' },
      ]}
      prev={{ title: 'File Services & DFS',       href: '/windows-server-2025/file-services' }}
      next={{ title: 'Remote Desktop Services',   href: '/windows-server-2025/rds' }}
      objectives={[
        'Understand the three firewall profiles and when each applies',
        'Create, modify, and audit firewall rules via PowerShell',
        'Configure application and service-based rules',
        'Implement Connection Security Rules with IPsec',
        'Deploy firewall rules via Group Policy at scale',
        'Audit and troubleshoot firewall issues',
      ]}
    >
      {/* ── OVERVIEW ── */}
      <section>
        <h2>Overview</h2>
        <p>
          Windows Defender Firewall is a host-based stateful firewall built into every modern
          Windows system. Unlike a network firewall that protects the perimeter, a host
          firewall provides protection at the individual machine level — crucial for
          defence-in-depth. Even if an attacker gets past your network firewall, the host
          firewall is a second barrier.
        </p>
        <p className="mt-4">
          This lesson covers the full Windows Firewall stack: the three network profiles,
          inbound and outbound rules, service-based rules, Connection Security Rules for
          IPsec, and deploying rules at scale via Group Policy — the production approach
          for managing firewall configuration across hundreds of servers.
        </p>
        <Callout type="warning" icon="⚠️" title="Never disable the Windows Firewall">
          Disabling Windows Firewall "for testing" is one of the most common — and dangerous
          — sysadmin habits. A Windows server with no firewall and any open port is one
          network scan away from exploitation. Instead, create specific rules for what you
          need, and audit what's already allowed.
        </Callout>
      </section>

      {/* ── THREE PROFILES ── */}
      <section>
        <h2>The Three Firewall Profiles</h2>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          {[
            {
              profile: 'Domain',
              icon: '🏢',
              color: 'border-brand-500/25 bg-brand-500/5',
              text: 'text-brand-300',
              trigger: 'Active when the computer can authenticate with a Domain Controller',
              typical: 'Allow management ports (WinRM 5985, RDP 3389 from specific IPs)',
              risk: 'Most permissive — trusted corporate network',
            },
            {
              profile: 'Private',
              icon: '🏠',
              color: 'border-accent-cyan/25 bg-accent-cyan/5',
              text: 'text-accent-cyan',
              trigger: 'User-marked trusted network (home/office), not domain-joined',
              typical: 'Allow file sharing, moderate restrictions',
              risk: 'Medium trust — known network',
            },
            {
              profile: 'Public',
              icon: '🌐',
              color: 'border-accent-red/25 bg-accent-red/5',
              text: 'text-accent-red',
              trigger: 'Unknown networks: hotels, coffee shops, public Wi-Fi',
              typical: 'Block almost everything inbound, minimal outbound',
              risk: 'Least trusted — hostile environment assumed',
            },
          ].map(p => (
            <div key={p.profile} className={`card p-5 border ${p.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{p.icon}</span>
                <p className={`font-bold text-base ${p.text}`}>{p.profile}</p>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Activates When</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.trigger}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Typical Rules</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.typical}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Trust Level</p>
                  <p className={`text-xs font-semibold ${p.text}`}>{p.risk}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── RULE TYPES ── */}
      <section>
        <h2>Rule Types & Components</h2>
        <div className="info-card overflow-hidden mt-4">
          <div className="divide-y divide-surface-700">
            {[
              { type: 'Program',         desc: 'Allow/block a specific executable. Follows the program regardless of port. Best for user applications.' },
              { type: 'Port',            desc: 'Allow/block a TCP or UDP port number or range. Simple and widely used for server services.' },
              { type: 'Predefined',      desc: 'Built-in rule sets for Windows features (File Sharing, Remote Desktop, WinRM). Microsoft maintains these — use when available.' },
              { type: 'Custom',          desc: 'Full control: combine program, service, protocol, scope (IP ranges), interface, and user/computer account.' },
            ].map(r => (
              <div key={r.type} className="flex gap-4 p-4">
                <span className="tag text-[11px] flex-shrink-0 mt-0.5 h-fit">{r.type}</span>
                <p className="text-sm text-slate-400 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <h3>Every rule has these components:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
          {[
            { component: 'Direction',  values: 'Inbound / Outbound' },
            { component: 'Action',     values: 'Allow / Block / Allow if secure' },
            { component: 'Profile',    values: 'Domain / Private / Public / Any' },
            { component: 'Protocol',   values: 'TCP / UDP / ICMP / Any' },
            { component: 'Scope',      values: 'Local IP / Remote IP ranges' },
            { component: 'Status',     values: 'Enabled / Disabled' },
          ].map(c => (
            <div key={c.component} className="bg-surface-700/50 rounded-xl p-3 border border-surface-700">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">{c.component}</p>
              <p className="text-xs text-slate-300 font-mono">{c.values}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VMware LAB ── */}
      <section>
        <h2>VMware Lab Exercise</h2>
        <Callout type="warning" icon="🧪" title="Lab Environment">
          Run all commands on DC01 (Windows Server 2025). You need at minimum the AD DS
          lesson complete so DC01 is a domain controller.
        </Callout>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB WS-8</span>
            <span className="text-sm font-semibold text-white">Configure and Audit Windows Firewall Rules</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~25 min</span>
          </div>
          <div className="lab-body space-y-8">

            <LabStep number={1}
              description="Audit the current firewall state and review active profiles."
              command={CODE_WINDOWSFIREWALL_1}
              output={CODE_WINDOWSFIREWALL_2}
            />

            <LabStep number={2}
              description="Create a new inbound rule to allow a custom application port — only on the Domain profile."
              command={CODE_WINDOWSFIREWALL_3}
              output={CODE_WINDOWSFIREWALL_4}
            />

            <LabStep number={3}
              description="Block a specific remote IP address — useful for blocking known malicious IPs."
              command={CODE_WINDOWSFIREWALL_5}
            />

            <LabStep number={4}
              description="Enable and test Windows Firewall logging to capture dropped packets."
              command={CODE_WINDOWSFIREWALL_6}
              output={CODE_WINDOWSFIREWALL_7}
            />

            <LabStep number={5}
              description="Export all custom firewall rules for documentation and backup."
              command={CODE_WINDOWSFIREWALL_8}
              output={CODE_WINDOWSFIREWALL_9}
            />

            <LabStep number={6}
              description="Deploy a firewall rule via Group Policy to all domain computers simultaneously."
              command={CODE_WINDOWSFIREWALL_10}
            />

            <Callout type="success" icon="✅" title="Lab Complete">
              You've audited existing rules, created application-specific and IP-block rules,
              enabled logging, exported a backup, and deployed rules via Group Policy.
            </Callout>
          </div>
        </div>
      </section>

      {/* ── TROUBLESHOOTING ── */}
      <section>
        <h2>Troubleshooting Firewall Issues</h2>
        <div className="space-y-3">
          {[
            { symptom: 'Service is running but connections are refused', fix: 'Check if a firewall rule exists: Get-NetFirewallRule | Where-Object { $_.LocalPort -eq "PORT" }. Also check which profile is active: Get-NetConnectionProfile. Rules for "Domain" don\'t apply on "Public" networks.' },
            { symptom: 'Rule exists but still being blocked', fix: 'A Block rule overrides an Allow rule if it is more specific. Check for conflicting block rules: Get-NetFirewallRule -Action Block -Enabled True | Where LocalPort -eq "PORT". Also verify the rule is on the correct profile.' },
            { symptom: 'Firewall logging not capturing drops', fix: 'Verify logging is enabled: Get-NetFirewallProfile -Name Domain | Select Log*. Check the log file path exists and has write permissions. Logging must be enabled per-profile.' },
            { symptom: 'GPO firewall rules not applying', fix: 'Run gpresult /h report.html and check the firewall section. Ensure the GPO is linked to the correct OU and the computer account is in scope. Run gpupdate /force to refresh immediately.' },
          ].map((m, i) => (
            <div key={i} className="rounded-xl border border-surface-700 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-accent-red/5 border-b border-surface-700">
                <span className="text-accent-red">🔴</span>
                <p className="text-sm font-semibold text-white">{m.symptom}</p>
              </div>
              <div className="px-4 py-3 bg-surface-800/50">
                <p className="text-sm text-slate-300 leading-relaxed">{m.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUICK REF ── */}
      <section>
        <h2>Quick Reference</h2>
        <CodeBlock title="Windows Firewall PowerShell Commands" language="powershell" code={CODE_WINDOWSFIREWALL_11} />
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to earn bonus XP.</p>
        <Quiz lessonId="ws2025-08" title="Windows Firewall & Security Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={50} />
      </section>
    </LessonLayout>
  )
}
