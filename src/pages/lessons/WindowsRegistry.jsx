import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_WINDOWSREGISTRY_1 = `# ── Read values ──────────────────────────────────────────────
reg query 'HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion' /v ProductName

# PowerShell — read all values in a key
Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion' |
  Select-Object ProductName, DisplayVersion, CurrentBuild

# ── Write values ─────────────────────────────────────────────
# Create a key and set a string value
New-Item -Path 'HKCU:\\Software\\MyApp' -Force | Out-Null
Set-ItemProperty -Path 'HKCU:\\Software\\MyApp' -Name 'Theme' -Value 'Dark'
Set-ItemProperty -Path 'HKCU:\\Software\\MyApp' -Name 'MaxItems' -Value 50 -Type DWord

# ── Export and import (backup/restore) ───────────────────────
reg export 'HKCU\\Software\\MyApp' C:\\backup-myapp.reg
reg import C:\\backup-myapp.reg

# ── Audit startup entries ────────────────────────────────────
$runKeys = @(
    'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run',
    'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run'
)
foreach ($key in $runKeys) {
    Write-Host "\`n[$key]"
    Get-ItemProperty $key -ErrorAction SilentlyContinue |
        Select-Object * -ExcludeProperty PS* |
        Format-List
}`
const CODE_WINDOWSREGISTRY_2 = `# Windows version details from registry
Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion' |
  Select-Object ProductName, DisplayVersion, CurrentBuild, UBR

# Check all startup entries
$keys = @(
  'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run',
  'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run'
)
foreach ($k in $keys) {
    Write-Host "--- $k ---"
    (Get-ItemProperty $k).PSObject.Properties |
        Where-Object Name -notlike 'PS*' |
        Select-Object Name, Value | Format-Table -AutoSize
}`
const CODE_WINDOWSREGISTRY_3 = `ProductName    : Windows Server 2025 Standard Evaluation
DisplayVersion : 24H2
CurrentBuild   : 26100
UBR            : 2033

--- HKLM:\\...\\Run ---
Name            Value
SecurityHealth  C:\\Windows\\System32\\SecurityHealthSystray.exe`
const CODE_WINDOWSREGISTRY_4 = `# Create a custom app registry key
New-Item 'HKLM:\\SOFTWARE\\SysAdminPro' -Force | Out-Null
Set-ItemProperty 'HKLM:\\SOFTWARE\\SysAdminPro' -Name 'Version' -Value '1.0'
Set-ItemProperty 'HKLM:\\SOFTWARE\\SysAdminPro' -Name 'InstallDate' -Value (Get-Date -Format 'yyyy-MM-dd')
Set-ItemProperty 'HKLM:\\SOFTWARE\\SysAdminPro' -Name 'Enabled' -Value 1 -Type DWord

# Export as backup
reg export 'HKLM\\SOFTWARE\\SysAdminPro' C:\\reg-backup.reg /y
Write-Host 'Exported to C:\\reg-backup.reg'

# Verify
Get-ItemProperty 'HKLM:\\SOFTWARE\\SysAdminPro'`
const CODE_WINDOWSREGISTRY_5 = `Exported to C:\\reg-backup.reg
Version     : 1.0
InstallDate : 2025-01-15
Enabled     : 1`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is stored in HKEY_LOCAL_MACHINE (HKLM) vs HKEY_CURRENT_USER (HKCU)?',
    options: [
      'HKLM stores temporary data; HKCU stores permanent settings',
      'HKLM stores machine-wide settings (hardware, installed software, system config) affecting all users; HKCU stores per-user settings (preferences, user-specific app config) for the currently logged-in user',
      'HKLM is for administrators; HKCU is for standard users',
      'HKLM stores 64-bit settings; HKCU stores 32-bit settings',
    ],
    correct: 1,
    explanation: 'HKLM (HKEY_LOCAL_MACHINE) contains: HARDWARE (detected hardware), SOFTWARE (installed applications), SYSTEM (services, drivers, boot configuration), SAM (local accounts). These are machine-wide — same for every user. HKCU (HKEY_CURRENT_USER) maps to the current user\'s profile hive in HKEY_USERS\\SID — per-user settings like desktop preferences, recently used files, user-specific application settings.',
  },
  {
    id: 'q2',
    question: 'What are the 5 main registry value types?',
    options: [
      'String, Integer, Boolean, Float, Binary',
      'REG_SZ (string), REG_DWORD (32-bit integer), REG_QWORD (64-bit integer), REG_BINARY (raw bytes), REG_MULTI_SZ (multi-string)',
      'Text, Number, Flag, Data, List',
      'VARCHAR, INT, BIGINT, BLOB, TEXT (same as SQL)',
    ],
    correct: 1,
    explanation: 'REG_SZ: plain text string — most common, used for paths and names. REG_EXPAND_SZ: string with environment variable expansion (%SystemRoot%). REG_DWORD: 32-bit unsigned integer — used for flags, counts, enable/disable switches (0/1). REG_QWORD: 64-bit integer — for large numbers. REG_BINARY: raw binary data. REG_MULTI_SZ: multiple strings separated by null characters. Know these — they appear in reg.exe, PowerShell, and regedit constantly.',
  },
  {
    id: 'q3',
    question: 'What is the purpose of the HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run key?',
    options: [
      'It stores the current Windows version number',
      'It contains programs that automatically start for all users when Windows boots — a common persistence location for both legitimate software and malware',
      'It lists all currently running processes',
      'It stores Windows Update configuration',
    ],
    correct: 1,
    explanation: 'The Run and RunOnce keys are the most commonly audited registry locations. HKLM\\...\\Run — starts for ALL users. HKCU\\...\\Run — starts for the current user only. RunOnce variants run once then delete themselves. These are prime locations for: legitimate startup programs (antivirus, dropbox), adware, and malware persistence. Always audit these keys on a potentially compromised system.',
  },
  {
    id: 'q4',
    question: 'Why should you always back up a registry key before editing it?',
    options: [
      'To keep a change history for auditing purposes',
      'Registry errors can cause boot failures, application crashes, or system instability — a backup allows you to restore the previous value if your change breaks something',
      'Windows requires a backup before allowing edits',
      'To comply with change management procedures',
    ],
    correct: 1,
    explanation: 'The registry controls critical system behaviour. Deleting the wrong key or setting the wrong value can: prevent services from starting, cause application crashes, break Windows boot (if you corrupt HKLM\\SYSTEM\\CurrentControlSet), or create security vulnerabilities. Always export a key before editing: reg export HKLM\\SOFTWARE\\App C:\\backup.reg — then re-import with reg import if needed. Or use System Restore as a safety net.',
  },
  {
    id: 'q5',
    question: 'What does "reg query HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion /v ProductName" display?',
    options: [
      'Lists all subkeys under the CurrentVersion key',
      'Displays the ProductName value and its data from that registry key — typically the Windows edition name like "Windows 10 Pro"',
      'Opens the registry key in regedit',
      'Queries Active Directory for the computer name',
    ],
    correct: 1,
    explanation: 'reg query is the command-line registry reader. Syntax: reg query KEY /v VALUE. Without /v it lists all values in the key. With /v it shows the specific value name, type, and data. Other reg commands: reg add (create/modify), reg delete (remove), reg export (backup to .reg file), reg import (restore), reg compare (diff two keys). These work in scripts and Command Prompt without needing PowerShell.',
  },
]

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

export default function WindowsRegistry() {
  return (
    <LessonLayout
      lessonId="win-03"
      courseId="windows"
      title="Windows Registry Deep Dive"
      courseTitle="Windows Desktop"
      courseHref="/windows"
      xp={70}
      readTime="~30 min"
      icon="🗄️"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Windows Desktop', href: '/windows' },
        { label: 'Registry Deep Dive' },
      ]}
      prev={{ title: 'User Accounts & Permissions', href: '/windows/permissions' }}
      next={{ title: 'Task Manager, Services & Processes', href: '/windows/processes' }}
      objectives={[
        'Understand the registry hive structure and what each hive stores',
        'Know the 5 registry value types and when each is used',
        'Navigate and edit the registry safely with regedit and reg.exe',
        'Audit startup entries for malware persistence',
        'Export, import, and compare registry keys',
        'Use PowerShell to read and write registry values programmatically',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          The Windows Registry is the central configuration database for the entire
          operating system. Every installed application, hardware device, user
          preference, and system setting is stored here. Understanding the registry
          is essential for troubleshooting, security auditing, and automation.
        </p>
      </section>

      <section>
        <h2>Registry Hive Structure</h2>
        <div className="info-card mt-4 overflow-hidden">
          <div className="divide-y divide-surface-700">
            {[
              { hive: 'HKLM\\HARDWARE',   file: 'volatile (RAM)',                    desc: 'Detected hardware devices and their configuration. Rebuilt on every boot.' },
              { hive: 'HKLM\\SAM',        file: 'System32\\config\\SAM',            desc: 'Local accounts database. Encrypted. Only accessible as SYSTEM.' },
              { hive: 'HKLM\\SECURITY',   file: 'System32\\config\\SECURITY',       desc: 'Local security policy, LSA secrets, cached domain credentials.' },
              { hive: 'HKLM\\SOFTWARE',   file: 'System32\\config\\SOFTWARE',       desc: 'Machine-wide software settings. Installed apps write here.' },
              { hive: 'HKLM\\SYSTEM',     file: 'System32\\config\\SYSTEM',         desc: 'Services, drivers, boot configuration. Critical for system startup.' },
              { hive: 'HKCU',             file: 'Users\\SID\\NTUSER.DAT',           desc: 'Current user\'s settings. Loaded when user logs in.' },
              { hive: 'HKCR',             file: 'Merge of HKLM\\SOFTWARE\\Classes', desc: 'File associations and COM object registrations.' },
            ].map(r => (
              <div key={r.hive} className="grid sm:grid-cols-3 gap-2 p-3">
                <code className="font-mono text-accent-cyan text-xs font-bold">{r.hive}</code>
                <code className="font-mono text-slate-500 text-[11px] leading-relaxed">{r.file}</code>
                <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2>Registry Operations</h2>
        <CodeBlock title="reg.exe and PowerShell registry reference" language="powershell"
          code={CODE_WINDOWSREGISTRY_1} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB WIN-3</span>
            <span className="text-sm font-semibold text-white">Registry Audit & Configuration on DC01</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~15 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Read key system information from the registry."
              command={CODE_WINDOWSREGISTRY_2}
              output={CODE_WINDOWSREGISTRY_3}
            />
            <LabStep number={2}
              description="Create and export an application configuration key."
              command={CODE_WINDOWSREGISTRY_4}
              output={CODE_WINDOWSREGISTRY_5}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="win-03" title="Windows Registry Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={35} />
      </section>
    </LessonLayout>
  )
}
