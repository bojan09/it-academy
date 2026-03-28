import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'
import GlossaryTooltip from '../../components/GlossaryTooltip.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_GROUPPOLICY_1 = `# Install Group Policy Management Console
Install-WindowsFeature GPMC

# Import the GP module
Import-Module GroupPolicy

# List all GPOs in the domain
Get-GPO -All | Select-Object DisplayName, GpoStatus, CreationTime`
const CODE_GROUPPOLICY_2 = `DisplayName               GpoStatus        CreationTime
-----------               ---------        ------------
Default Domain Policy     AllSettingsEnabled  01/15/2025
Default Domain Controllers Policy  AllSettingsEnabled  01/15/2025`
const CODE_GROUPPOLICY_3 = `# Create new GPO
New-GPO -Name "IT-Security-Baseline" -Comment "Security baseline for IT department users and computers"

# Link to IT OU
New-GPLink -Name "IT-Security-Baseline" -Target "OU=IT,DC=lab,DC=local" -LinkEnabled Yes

# Verify the link
Get-GPInheritance -Target "OU=IT,DC=lab,DC=local"`
const CODE_GROUPPOLICY_4 = `Name         : IT
GpoLinks     : {IT-Security-Baseline}
InheritedGpoLinks : {IT-Security-Baseline, Default Domain Policy}
BlockInheritance  : False`
const CODE_GROUPPOLICY_5 = `# Set minimum password length to 14 characters
Set-GPRegistryValue -Name "Default Domain Policy" -Key "HKLM\\\\SYSTEM\\\\CurrentControlSet\\\\Services\\\\Netlogon\\\\Parameters" -ValueName "MinimumPasswordLength" -Type DWord -Value 14

# Better approach: use Fine-Grained Password Policy for granular control
# Create a PSO (Password Settings Object) for IT admins
New-ADFineGrainedPasswordPolicy -Name "AdminPasswordPolicy" -Precedence 10 -MinPasswordLength 16 -PasswordHistoryCount 24 -LockoutThreshold 5 -LockoutDuration "00:30:00" -ComplexityEnabled $true

# Apply to Domain Admins group
Add-ADFineGrainedPasswordPolicySubject -Identity "AdminPasswordPolicy" -Subjects "Domain Admins"`
const CODE_GROUPPOLICY_6 = `# GP Preferences drive mapping via PowerShell
# (Typically done via GPMC GUI, but scriptable via XML injection)

# Create the drive map XML
$xml = @'
<DriveMapSettings clsid="{8FDDCC1A-0C3C-43cd-A6B4-71A6DF20DA8C}">
  <Drive clsid="{935D1B74-9CB8-4e3c-9914-7DD559B7A417}"
    name="H:" status="H:" image="2" changed="2025-01-15 09:00:00"
    uid="{12345678-1234-1234-1234-123456789012}">
    <Properties action="U" thisDrive="NOCHANGE" allDrives="NOCHANGE"
      userName="" path="\\\\\\\\DC01\\\\IT-Share" label="IT Share"
      persistent="1" useLetter="1" letter="H"/>
  </Drive>
</DriveMapSettings>
'@

# Force GP refresh on DC01 to test locally
gpupdate /force

# Check applied policies
gpresult /r`
const CODE_GROUPPOLICY_7 = `COMPUTER SETTINGS
  Applied Group Policy Objects
    Default Domain Controllers Policy
    Default Domain Policy

USER SETTINGS (ASMITH - LAB\\\\asmith)
  Applied Group Policy Objects
    IT-Security-Baseline
    Default Domain Policy`
const CODE_GROUPPOLICY_8 = `# HTML report — open in browser
gpresult /user LAB\\\\asmith /h "C:\\\\GPReport-asmith.html" /f
Start-Process "C:\\\\GPReport-asmith.html"

# Quick text summary
gpresult /user LAB\\\\asmith /r /scope user

# Remote refresh on a specific computer
Invoke-GPUpdate -Computer "WS01" -Force -RandomDelayInMinutes 0`
const CODE_GROUPPOLICY_9 = `# Back up all GPOs to a timestamped folder
$backupPath = "C:\\\\GPO-Backups\\\\$(Get-Date -Format 'yyyy-MM-dd')"
New-Item -Path $backupPath -ItemType Directory -Force

Backup-GPO -All -Path $backupPath

# List the backups
Get-GPOBackup -All -Path $backupPath | Select-Object DisplayName, BackupId, Timestamp`
const CODE_GROUPPOLICY_10 = `DisplayName                BackupId                             Timestamp
-----------                --------                             ---------
Default Domain Policy      {ABC12345-...}                       01/15/2025 09:30:00
IT-Security-Baseline       {DEF67890-...}                       01/15/2025 09:30:01`
const CODE_GROUPPOLICY_11 = `# ── GPO Lifecycle ──────────────────────────────────────────
Get-GPO -All
New-GPO -Name "My-Policy"
Remove-GPO -Name "My-Policy"
Copy-GPO -SourceName "Template" -TargetName "New-Policy"
Rename-GPO -Name "Old-Name" -TargetName "New-Name"

# ── Linking ─────────────────────────────────────────────────
New-GPLink -Name "My-Policy" -Target "OU=IT,DC=lab,DC=local"
Set-GPLink -Name "My-Policy" -Target "OU=IT,DC=lab,DC=local" -Enforced Yes
Remove-GPLink -Name "My-Policy" -Target "OU=IT,DC=lab,DC=local"
Get-GPInheritance -Target "OU=IT,DC=lab,DC=local"

# ── Reporting ───────────────────────────────────────────────
gpresult /r                              # Current user/computer summary
gpresult /h report.html /f              # Full HTML report
gpresult /scope user /r                  # User settings only
Get-GPResultantSetOfPolicy -ReportType Html -Path report.html

# ── Refresh & Apply ─────────────────────────────────────────
gpupdate /force                          # Force refresh locally
gpupdate /force /target:user             # User policy only
gpupdate /force /target:computer         # Computer policy only
Invoke-GPUpdate -Computer "WS01" -Force  # Remote refresh

# ── Backup & Restore ────────────────────────────────────────
Backup-GPO -All -Path C:\\\\GPO-Backups
Restore-GPO -Name "My-Policy" -Path C:\\\\GPO-Backups
Import-GPO -BackupGpoName "My-Policy" -Path C:\\\\GPO-Backups -TargetName "My-Policy" -CreateIfNeeded`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the correct order of GPO processing (LSDOU)?',
    options: [
      'Local → Site → Domain → OU',
      'Domain → Site → Local → OU',
      'OU → Domain → Site → Local',
      'Site → Local → OU → Domain',
    ],
    correct: 0,
    explanation: 'LSDOU: Local policy is applied first, then Site, then Domain, then OU (from parent to child). Each subsequent policy can override the previous — meaning OU-linked GPOs have the highest precedence and will override Domain-level settings unless blocked or enforced.',
  },
  {
    id: 'q2',
    question: 'What does "Enforced" (previously called "No Override") do to a GPO?',
    options: [
      'Prevents the GPO from being deleted',
      'Forces the GPO to apply even if a child OU has Block Inheritance enabled',
      'Requires all settings to be configured before the GPO can be saved',
      'Prevents administrators from modifying the GPO settings',
    ],
    correct: 1,
    explanation: 'Enforced (No Override) prevents child containers from blocking the GPO with Block Inheritance. It also gives the policy precedence in conflict resolution — settings from an enforced GPO win against non-enforced policies regardless of LSDOU order.',
  },
  {
    id: 'q3',
    question: 'A user logs in and their mapped drives don\'t appear. Which tool is the BEST first step to diagnose GPO application issues?',
    options: [
      'Event Viewer → Application log',
      'gpresult /r and gpresult /h report.html',
      'Active Directory Users and Computers',
      'Restarting the Group Policy service',
    ],
    correct: 1,
    explanation: 'gpresult /r shows a summary of applied GPOs for the current user and computer. gpresult /h generates a full HTML report showing every GPO, its settings, and whether it was applied or filtered. This should always be the first diagnostic step for GPO issues.',
  },
  {
    id: 'q4',
    question: 'What is the difference between Computer Configuration and User Configuration in a GPO?',
    options: [
      'They are identical — either section can configure any setting',
      'Computer Configuration applies when the machine boots; User Configuration applies when the user logs in',
      'Computer Configuration only affects servers; User Configuration only affects workstations',
      'Computer Configuration requires a domain admin to apply; User Configuration applies to standard users',
    ],
    correct: 1,
    explanation: 'Computer Configuration settings are applied during machine startup (before login) and refresh every 90 minutes. User Configuration settings apply at user logon and also refresh every 90 minutes. Some settings only exist in one section — e.g., drive mappings are User Configuration only; disk quotas are Computer Configuration only.',
  },
  {
    id: 'q5',
    question: 'How do you force an immediate Group Policy refresh on a remote computer?',
    options: [
      'Restart-Computer -ComputerName srv01',
      'Invoke-GPUpdate -Computer "srv01" -Force',
      'Set-GPLink -GPO "Default Domain Policy" -Force',
      'gpupdate /sync /target:srv01',
    ],
    correct: 1,
    explanation: 'Invoke-GPUpdate -Computer "srv01" -Force remotely triggers a gpupdate /force on the target machine. The local equivalent is simply gpupdate /force. gpresult shows what was applied. GP normally refreshes every 90 minutes (±30 min randomisation) plus at boot/logon.',
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

export default function GroupPolicy() {
  return (
    <LessonLayout
      lessonId="ws2025-05"
      courseId="windows-server-2025"
      title="Group Policy Management"
      courseTitle="Windows Server 2025"
      courseHref="/windows-server-2025"
      xp={120}
      readTime="~40 min"
      icon="🔧"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Windows Server 2025', href: '/windows-server-2025' },
        { label: 'Group Policy Management' },
      ]}
      prev={{ title: 'DNS Server Configuration',    href: '/windows-server-2025/dns' }}
      next={{ title: 'Hyper-V Virtualisation',       href: '/windows-server-2025/hyper-v' }}
      objectives={[
        'Understand GPO structure, processing order (LSDOU), and precedence',
        'Create, link, and configure GPOs via GPMC and PowerShell',
        'Deploy drive mappings, desktop restrictions, and security settings',
        'Use gpresult and gpupdate to diagnose and force policy application',
        'Implement security baselines using GPO',
        'Understand WMI filtering and loopback processing',
      ]}
    >
      {/* ── OVERVIEW ── */}
      <section>
        <h2>Overview</h2>
        <p>
          <GlossaryTooltip term="Group Policy" /> is the central configuration management
          system for Windows domains. A single administrator can configure thousands of
          computers and user accounts simultaneously — enforcing security settings,
          deploying software, mapping drives, setting desktop backgrounds, restricting
          USB access, and hundreds of other settings.
        </p>
        <p className="mt-4">
          Every enterprise Windows environment runs on Group Policy. Understanding it means
          understanding how configurations are delivered, why settings sometimes don't apply,
          and how to diagnose the inevitable "why isn't my GPO working?" tickets.
        </p>
        <Callout type="info" icon="💡" title="Group Policy is the sysadmin's superpower">
          One well-crafted GPO can simultaneously configure 10,000 computers in under 90 minutes.
          It's also the most common source of unexplained "why does this only happen on some
          machines?" problems — which is why understanding the processing order is critical.
        </Callout>
      </section>

      {/* ── GPO ARCHITECTURE ── */}
      <section>
        <h2>GPO Architecture</h2>
        <p>A Group Policy Object has two physical components:</p>

        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          {[
            {
              icon: '📂', title: 'GPC — Group Policy Container',
              color: 'border-brand-500/20 bg-brand-500/5',
              desc: 'Stored in Active Directory. Contains GPO metadata: GUID, version number, status, WMI filter links. Replicated via AD replication.',
              path: 'CN={GUID},CN=Policies,CN=System,DC=lab,DC=local',
            },
            {
              icon: '📁', title: 'GPT — Group Policy Template',
              color: 'border-accent-cyan/20 bg-accent-cyan/5',
              desc: 'Stored in SYSVOL (\\\\domain\\SYSVOL\\domain\\Policies\\{GUID}\\). Contains the actual setting files, scripts, and ADMX templates. Replicated via DFSR.',
              path: '\\\\lab.local\\SYSVOL\\lab.local\\Policies\\{GUID}',
            },
          ].map(c => (
            <div key={c.title} className={`card p-5 border ${c.color}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{c.icon}</span>
                <p className="font-semibold text-white text-sm">{c.title}</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{c.desc}</p>
              <code className="text-[11px] font-mono text-slate-500 break-all leading-relaxed">
                {c.path}
              </code>
            </div>
          ))}
        </div>

        <h3>LSDOU Processing Order</h3>
        <p>
          GPOs are applied in a strict order — each stage can override the previous.
          The last policy applied wins (unless Enforced):
        </p>
        <div className="info-card mt-4 overflow-hidden">
          <div className="divide-y divide-surface-700">
            {[
              { letter: 'L', stage: 'Local',  color: 'bg-slate-600',        desc: 'Local computer policy. Applied first. Has lowest precedence.', cmd: 'gpedit.msc (local)' },
              { letter: 'S', stage: 'Site',   color: 'bg-accent-amber',     desc: 'GPOs linked to the AD site the computer belongs to. Rarely used in practice.', cmd: 'Sites in GPMC' },
              { letter: 'D', stage: 'Domain', color: 'bg-accent-cyan',      desc: 'GPOs linked to the domain root. "Default Domain Policy" lives here.', cmd: 'Domain in GPMC' },
              { letter: 'O', stage: 'OU',     color: 'bg-brand-500',        desc: 'GPOs linked to OUs — parent OU first, then child OU. OU-level GPOs have HIGHEST precedence.', cmd: 'OU in GPMC' },
            ].map(s => (
              <div key={s.letter} className="flex items-start gap-4 p-4">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center
                                  text-white font-bold font-mono text-base flex-shrink-0`}>
                  {s.letter}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-semibold text-white">{s.stage}</p>
                    <code className="tag text-[10px]">{s.cmd}</code>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Callout type="warning" icon="⚠️" title="Conflict resolution">
          When two GPOs configure the same setting differently, the one processed LAST wins —
          meaning OU beats Domain, Domain beats Site, Site beats Local. Within the same
          container, lower link order number = higher priority (link order 1 beats link order 2).
        </Callout>
      </section>

      {/* ── KEY GPO SETTINGS ── */}
      <section>
        <h2>Common GPO Settings Reference</h2>
        <div className="info-card overflow-hidden mt-4">
          <div className="divide-y divide-surface-700">
            {[
              { path: 'Computer → Windows Settings → Security Settings → Account Policies', setting: 'Password Policy', use: 'Minimum length, complexity, age, lockout threshold' },
              { path: 'Computer → Windows Settings → Security Settings → Local Policies', setting: 'Audit Policy', use: 'Enable logon, object access, privilege use auditing' },
              { path: 'User → Windows Settings → Drive Maps (Preferences)', setting: 'Drive Mappings', use: 'Map network drives by OU — e.g. IT OU gets H: → \\\\SRV01\\IT' },
              { path: 'Computer → Administrative Templates → Windows Components → Windows Defender', setting: 'Defender Settings', use: 'Configure scan schedules, exclusions, update frequency' },
              { path: 'User → Administrative Templates → Control Panel → Personalization', setting: 'Desktop Wallpaper', use: 'Force corporate wallpaper across all workstations' },
              { path: 'Computer → Administrative Templates → System → Removable Storage', setting: 'USB Restriction', use: 'Deny all write access to removable storage devices' },
              { path: 'Computer → Windows Settings → Scripts → Startup', setting: 'Startup Scripts', use: 'Run PowerShell scripts at boot for computer-level config' },
              { path: 'User → Windows Settings → Scripts → Logon', setting: 'Logon Scripts', use: 'Run scripts at user logon — mapping drives, setting printers' },
            ].map(s => (
              <div key={s.setting} className="p-4 grid sm:grid-cols-3 gap-2 sm:gap-4">
                <p className="text-sm font-semibold text-white">{s.setting}</p>
                <code className="text-[11px] font-mono text-slate-500 leading-relaxed col-span-2 sm:col-span-1">{s.path}</code>
                <p className="text-xs text-slate-400 leading-relaxed sm:col-span-1">{s.use}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VMware LAB ── */}
      <section>
        <h2>VMware Lab Exercise</h2>
        <Callout type="warning" icon="🧪" title="Prerequisites">
          DC01 must be a domain controller with the GPMC feature installed. Complete the
          Active Directory lesson first. You should also have at least one domain-joined
          workstation or the Ubuntu VM for testing.
        </Callout>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB 5</span>
            <span className="text-sm font-semibold text-white">Create, Configure & Test Group Policy</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~30 min</span>
          </div>
          <div className="lab-body space-y-8">

            <LabStep number={1}
              description="Install GPMC and verify the Group Policy PowerShell module is available."
              command={CODE_GROUPPOLICY_1}
              output={CODE_GROUPPOLICY_2}
            />

            <LabStep number={2}
              description="Create a new GPO for IT department security settings and link it to the IT OU."
              command={CODE_GROUPPOLICY_3}
              output={CODE_GROUPPOLICY_4}
            />

            <LabStep number={3}
              description="Configure a password policy via the Default Domain Policy. Password policies MUST be configured at the domain level to affect domain accounts."
              command={CODE_GROUPPOLICY_5}
            />

            <LabStep number={4}
              description="Use Group Policy Preferences to map a network drive for the IT OU. Preferences are more flexible than old-style GP settings — they support item-level targeting."
              command={CODE_GROUPPOLICY_6}
              output={CODE_GROUPPOLICY_7}
            />

            <LabStep number={5}
              description="Generate a full GPO diagnostic report for user asmith."
              command={CODE_GROUPPOLICY_8}
            />

            <LabStep number={6}
              description="Back up all GPOs — critical before any major changes."
              command={CODE_GROUPPOLICY_9}
              output={CODE_GROUPPOLICY_10}
            />

            <Callout type="success" icon="✅" title="Lab Complete">
              You've created and linked a GPO, configured password policy, set up drive
              mappings via preferences, generated diagnostic reports, and backed up all GPOs.
              Take a VMware snapshot.
            </Callout>
          </div>
        </div>
      </section>

      {/* ── TROUBLESHOOTING ── */}
      <section>
        <h2>GPO Troubleshooting Playbook</h2>
        <div className="space-y-3">
          {[
            { symptom: 'GPO settings not applying', fix: 'Run gpresult /r — is the GPO listed? Check link is enabled, scope includes the user/computer, no WMI filter excluding them. Check Event Viewer → Applications and Services → Microsoft → Windows → GroupPolicy → Operational.' },
            { symptom: 'GPO applies to wrong users', fix: 'Check Security Filtering in GPMC — by default "Authenticated Users" is in scope. If you removed it and added a group, ensure the computer account is also in scope (computers process Computer Configuration independently).' },
            { symptom: 'New GPO not applying after gpupdate', fix: 'Some settings only apply at logon (User Config) or reboot (Computer Config) — gpupdate alone is not enough for these. Log off/on or reboot the machine. Also verify SYSVOL replication is healthy: Test-ComputerSecureChannel.' },
            { symptom: 'Block Inheritance not working', fix: 'A GPO higher up has "Enforced" (No Override) set. Enforced GPOs bypass Block Inheritance. Check all parent containers in GPMC for enforced links (shown with a padlock icon).' },
          ].map((m, i) => (
            <div key={i} className="rounded-xl border border-surface-700 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-accent-red/5 border-b border-surface-700">
                <span className="text-accent-red text-sm">🔴</span>
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
        <CodeBlock title="Group Policy PowerShell Commands" language="powershell" code={CODE_GROUPPOLICY_11} />
      </section>

      {/* ── QUIZ ── */}
      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to earn bonus XP.</p>
        <Quiz lessonId="ws2025-05" title="Group Policy Management Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={60} />
      </section>
    </LessonLayout>
  )
}
