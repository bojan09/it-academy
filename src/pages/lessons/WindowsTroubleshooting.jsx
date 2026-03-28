import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_WINDOWSTROUBLESHOOTING_1 = `# Last 50 errors in System log
Get-EventLog -LogName System -EntryType Error -Newest 50 |
  Select-Object TimeGenerated, Source, EventID, Message |
  Format-Table -AutoSize

# Service failures in last 24 hours
Get-EventLog -LogName System -Source 'Service Control Manager' -Newest 100 |
  Where-Object { $_.Message -like '*failed*' -or $_.Message -like '*terminated*' }

# Security: failed logon attempts (Event ID 4625)
Get-EventLog -LogName Security -InstanceId 4625 -Newest 20 |
  Select-Object TimeGenerated, Message | Format-List

# Modern approach using Get-WinEvent (more powerful)
Get-WinEvent -FilterHashtable @{
  LogName   = 'System'
  Level     = 2          # 1=Critical, 2=Error, 3=Warning
  StartTime = (Get-Date).AddHours(-24)
} | Select-Object TimeCreated, ProviderName, Id, Message | Format-Table`
const CODE_WINDOWSTROUBLESHOOTING_2 = `# STEP 1: Repair the Windows Component Store (requires internet for updates)
DISM /Online /Cleanup-Image /CheckHealth    # Quick check — no repairs
DISM /Online /Cleanup-Image /ScanHealth     # Deep scan — no repairs
DISM /Online /Cleanup-Image /RestoreHealth  # Repair from Windows Update

# STEP 2: Scan and repair protected system files
sfc /scannow

# If sfc finds errors it can't fix, check this log for details:
$sfcLog = 'C:\\Windows\\Logs\\CBS\\CBS.log'
Get-Content $sfcLog | Select-String 'cannot repair' | Select-Object -Last 20

# STEP 3: Check Windows image health
DISM /Online /Cleanup-Image /AnalyzeComponentStore

# After repairs, run sfc again to confirm all files are healthy
sfc /verifyonly`
const CODE_WINDOWSTROUBLESHOOTING_3 = `# Full health snapshot
$health = @{
    ComputerName    = $env:COMPUTERNAME
    Timestamp       = Get-Date
    OS              = (Get-WmiObject Win32_OperatingSystem).Caption
    Uptime_hrs      = [math]::Round((Get-Date - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime).TotalHours, 1)
    SystemErrors_24h= (Get-EventLog System -EntryType Error -After (Get-Date).AddHours(-24) -ErrorAction SilentlyContinue | Measure-Object).Count
    FailedServices  = (Get-Service | Where-Object { $_.StartType -eq 'Automatic' -and $_.Status -eq 'Stopped' } | Measure-Object).Count
    DiskFree_GB     = [math]::Round((Get-PSDrive C).Free / 1GB, 1)
}
[PSCustomObject]$health | Format-List`
const CODE_WINDOWSTROUBLESHOOTING_4 = `ComputerName    : DC01
Timestamp       : 01/15/2025 11:00:00
OS              : Windows Server 2025 Standard Evaluation
Uptime_hrs      : 6.3
SystemErrors_24h: 2
FailedServices  : 1
DiskFree_GB     : 42.7`
const CODE_WINDOWSTROUBLESHOOTING_5 = `# Get the actual error details
Get-EventLog -LogName System -EntryType Error -After (Get-Date).AddHours(-24) |
  Select-Object TimeGenerated, Source, EventID, Message |
  Format-List

# Find the stopped automatic service
Get-Service | Where-Object { $_.StartType -eq 'Automatic' -and $_.Status -eq 'Stopped' } |
  Select-Object Name, DisplayName, StartType

# Check why it stopped — look for SCM events
Get-EventLog -LogName System -Source 'Service Control Manager' -Newest 10 |
  Where-Object { $_.EntryType -ne 'Information' } |
  Format-List TimeGenerated, Message`
const CODE_WINDOWSTROUBLESHOOTING_6 = `# Quick health check first (fast, no repair)
DISM /Online /Cleanup-Image /CheckHealth

# If issues found, run full restore
# DISM /Online /Cleanup-Image /RestoreHealth

# Verify system files
sfc /verifyonly

# Check the result
$sfcLog = [System.Environment]::ExpandEnvironmentVariables('%windir%\\Logs\\CBS\\CBS.log')
Get-Content $sfcLog | Select-String 'verification' | Select-Object -Last 5`
const CODE_WINDOWSTROUBLESHOOTING_7 = `Deployment Image Servicing and Management tool
Image Version: 10.0.26100.2
The component store is repairable.
The operation completed successfully.

Windows Resource Protection did not find any integrity violations.`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'A user reports slow login times on a domain-joined PC. Which Event IDs in the Security log are most useful for diagnosing this?',
    options: [
      '4624 (successful logon) and 4625 (failed logon)',
      '4776 (credential validation) and group policy operational log',
      'Event IDs 4648, 4688, and the System log boot times',
      'The Application log and .NET runtime errors',
    ],
    correct: 1,
    explanation: 'Slow domain logins are usually caused by Group Policy processing delays or DNS/DC connectivity issues. Check the Group Policy operational log (Applications and Services > Microsoft > Windows > GroupPolicy > Operational) for slow processing. Event 4776 shows credential validation timing. Also check the "User Profile Service" log for profile loading delays.',
  },
  {
    id: 'q2',
    question: 'What is the difference between sfc /scannow and DISM /RestoreHealth?',
    options: [
      'They are identical tools — run either one for the same result',
      'sfc scans and repairs protected system files using the local cache; DISM repairs the Windows component store itself, which sfc relies on',
      'sfc works on offline images; DISM only works on the running OS',
      'sfc requires internet access; DISM works offline',
    ],
    correct: 1,
    explanation: 'SFC (System File Checker) scans protected system files and replaces corrupted ones from a local cached copy. But if the cache itself is corrupted, sfc will fail. DISM (Deployment Image Servicing and Management) /RestoreHealth repairs the Windows Component Store that sfc uses as its source. The correct order: run DISM first, then sfc. DISM can pull files from Windows Update.',
  },
  {
    id: 'q3',
    question: 'A Windows Server shows the "Not responding" state in Task Manager for a service process. What is the FIRST appropriate diagnostic step?',
    options: [
      'Immediately restart the server',
      'Kill the process with taskkill /F',
      'Check Event Viewer Application and System logs, then use Process Monitor or WinDbg to capture what the process is waiting for',
      'Uninstall and reinstall the service',
    ],
    correct: 2,
    explanation: 'Before taking destructive action, gather diagnostic data. Check Event Viewer for errors from that service. Use Process Monitor (Sysinternals) to capture file/registry/network activity. If it\'s a hung thread, use Process Explorer to check thread wait reasons. Forcing a restart loses the diagnostic state and you\'ll have no idea what caused it.',
  },
  {
    id: 'q4',
    question: 'What does "Windows cannot access \\\\server\\share" Error 0x80004005 typically indicate?',
    options: [
      'The share does not exist on the server',
      'A network connectivity, authentication, or firewall issue — not a permissions problem',
      'The user\'s password has expired',
      'The share requires a VPN connection',
    ],
    correct: 1,
    explanation: '0x80004005 (E_FAIL / Unspecified Error) when accessing a share usually means: port 445 (SMB) is blocked by a firewall, the Server service is not running, NetBIOS/SMB is disabled, or authentication is failing silently. Check: Test-NetConnection -ComputerName server -Port 445. Also check Get-Service LanmanServer on the target. This error is rarely about NTFS permissions.',
  },
  {
    id: 'q5',
    question: 'Which PowerShell command is most useful for finding the root cause of a Windows service that fails to start?',
    options: [
      'Get-Service -Name ServiceName',
      'Get-EventLog -LogName System -Source ServiceName -Newest 20',
      'sc query ServiceName',
      'Get-Process | Where-Object Name -eq ServiceName',
    ],
    correct: 1,
    explanation: 'Get-EventLog -LogName System -Source ServiceName -Newest 20 retrieves the most recent System log events generated by that service — these almost always contain the specific error code and reason for failure. sc query only shows current state. Get-Service shows running/stopped. Get-Process only sees running processes — a failed-to-start service has no process.',
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

export default function WindowsTroubleshooting() {
  return (
    <LessonLayout
      lessonId="trouble-02"
      courseId="troubleshooting"
      title="Windows Troubleshooting"
      courseTitle="Troubleshooting"
      courseHref="/troubleshooting"
      xp={80}
      readTime="~35 min"
      icon="🖥️"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Troubleshooting', href: '/troubleshooting' },
        { label: 'Windows Troubleshooting' },
      ]}
      prev={{ title: 'The Troubleshooting Methodology', href: '/troubleshooting/methodology' }}
      next={{ title: 'Linux Troubleshooting',           href: '/troubleshooting/linux' }}
      objectives={[
        'Navigate Event Viewer and identify critical event patterns',
        'Use SFC and DISM to repair Windows system files',
        'Diagnose service failures using PowerShell and Event Viewer',
        'Troubleshoot slow boot and login issues with built-in tools',
        'Resolve common network share and SMB connectivity failures',
        'Use Sysinternals tools for advanced process and file diagnostics',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Windows has excellent built-in diagnostic tools — most sysadmins only scratch
          the surface. This lesson covers the full diagnostic toolkit: Event Viewer with
          effective filtering, SFC and DISM for OS repair, performance analysis, service
          failure diagnosis, and the Sysinternals suite for when built-in tools aren't enough.
        </p>
        <Callout type="info" icon="💡" title="Diagnostic principle">
          Always gather data before changing anything. Event Viewer, Reliability Monitor,
          and resource monitors give you the full picture. Acting without data is guessing —
          and guessing on a production server is how incidents become outages.
        </Callout>
      </section>

      <section>
        <h2>Event Viewer — Your Primary Diagnostic Tool</h2>
        <p>
          Event Viewer contains logs from every Windows component. Knowing exactly where
          to look cuts diagnostic time from hours to minutes.
        </p>
        <div className="info-card mt-4 overflow-hidden">
          <div className="divide-y divide-surface-700">
            {[
              { log: 'System',          path: 'Windows Logs > System',               use: 'Service failures, driver errors, hardware issues, unexpected shutdowns, disk errors.' },
              { log: 'Application',     path: 'Windows Logs > Application',           use: '.NET errors, application crashes, IIS errors, SQL Server errors.' },
              { log: 'Security',        path: 'Windows Logs > Security',              use: 'Logon success/failure (4624/4625), privilege use, account changes, policy changes.' },
              { log: 'Setup',           path: 'Windows Logs > Setup',                 use: 'Windows Update installation, feature installation errors.' },
              { log: 'Group Policy',    path: 'App & Services > Microsoft > Windows > GroupPolicy > Operational', use: 'GPO application errors, slow processing, denied policies.' },
              { log: 'DHCP Client',     path: 'App & Services > Microsoft > Windows > Dhcp-Client > Admin', use: 'IP assignment failures, lease renewals, APIPA events.' },
              { log: 'DNS Client',      path: 'App & Services > Microsoft > Windows > DNS-Client > Operational', use: 'DNS resolution failures, server unreachable events.' },
            ].map(l => (
              <div key={l.log} className="grid sm:grid-cols-3 gap-2 p-4">
                <p className="font-semibold text-white text-sm">{l.log}</p>
                <code className="text-[11px] font-mono text-slate-500 col-span-1 leading-relaxed">{l.path}</code>
                <p className="text-xs text-slate-400 leading-relaxed">{l.use}</p>
              </div>
            ))}
          </div>
        </div>
        <CodeBlock className="mt-4" title="PowerShell Event Log queries" language="powershell"
          code={CODE_WINDOWSTROUBLESHOOTING_1} />
      </section>

      <section>
        <h2>SFC & DISM — Repairing System Files</h2>
        <Callout type="warning" icon="⚠️" title="Run in the correct order">
          Always run DISM first to repair the component store, then SFC to repair individual
          system files. Running SFC on a corrupted component store produces unreliable results.
        </Callout>
        <CodeBlock title="System file repair — the correct procedure" language="powershell"
          code={CODE_WINDOWSTROUBLESHOOTING_2} />
      </section>

      <section>
        <h2>Service Failure Diagnosis Playbook</h2>
        <div className="space-y-3 mt-4">
          {[
            {
              symptom: 'Service fails to start — Error 1067 (unexpected termination)',
              steps: [
                '1. Get-EventLog -LogName System -Source "Service Control Manager" -Newest 20',
                '2. Check Application log for the service\'s own error messages',
                '3. Try starting manually: Start-Service ServiceName -ErrorAction Continue',
                '4. Check service dependencies: (Get-Service ServiceName).RequiredServices',
                '5. Verify service account permissions on required directories',
              ],
            },
            {
              symptom: 'Service starts but immediately stops',
              steps: [
                '1. Get-WinEvent filtering for the service name around the crash time',
                '2. Check for .NET exceptions in Application log',
                '3. Enable verbose logging in the service config file if available',
                '4. Run the service binary directly in console to see stdout errors',
              ],
            },
            {
              symptom: 'Service hangs — high CPU or "Not Responding"',
              steps: [
                '1. Get-Process ServiceExecutable | Select-Object CPU, WorkingSet, Threads',
                '2. Use Process Explorer (Sysinternals) to view thread states',
                '3. Use Process Monitor to capture file/registry/network I/O',
                '4. Check for locked files: handle.exe (Sysinternals)',
              ],
            },
          ].map((p, i) => (
            <div key={i} className="rounded-xl border border-surface-700 overflow-hidden">
              <div className="px-4 py-3 bg-accent-amber/5 border-b border-surface-700">
                <p className="text-sm font-semibold text-white">⚠️ {p.symptom}</p>
              </div>
              <div className="px-4 py-3 bg-surface-800/50 space-y-1">
                {p.steps.map((step, j) => (
                  <p key={j} className="text-xs text-slate-400 font-mono leading-relaxed">{step}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB TROUBLE-2</span>
            <span className="text-sm font-semibold text-white">Diagnose and Repair Windows Issues on DC01</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~25 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Build a comprehensive system health snapshot using PowerShell."
              command={CODE_WINDOWSTROUBLESHOOTING_3}
              output={CODE_WINDOWSTROUBLESHOOTING_4}
            />
            <LabStep number={2}
              description="Investigate the system errors found in the health check."
              command={CODE_WINDOWSTROUBLESHOOTING_5}
            />
            <LabStep number={3}
              description="Run the SFC and DISM repair sequence on DC01."
              command={CODE_WINDOWSTROUBLESHOOTING_6}
              output={CODE_WINDOWSTROUBLESHOOTING_7}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="trouble-02" title="Windows Troubleshooting Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={40} />
      </section>
    </LessonLayout>
  )
}
