import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_WINDOWSPROCESSES_1 = `# ── View services ────────────────────────────────────────────
Get-Service | Sort-Object Status -Descending | Format-Table -AutoSize

# Find stopped automatic services (should be running)
Get-Service | Where-Object {
    $_.StartType -eq 'Automatic' -and $_.Status -eq 'Stopped'
} | Select-Object Name, DisplayName, Status

# ── Control services ─────────────────────────────────────────
Start-Service   -Name 'Spooler'
Stop-Service    -Name 'Spooler' -Force
Restart-Service -Name 'Spooler'

# Change startup type
Set-Service -Name 'Spooler' -StartupType Disabled
Set-Service -Name 'WinRM'   -StartupType Automatic

# ── Service dependencies ─────────────────────────────────────
(Get-Service 'Spooler').DependentServices   # What depends ON this
(Get-Service 'Spooler').RequiredServices    # What this depends ON

# ── Identify what's inside a svchost ─────────────────────────
$pid = (Get-Process svchost | Select-Object -First 1).Id
Get-Service | Where-Object { $_.ServiceHandle } |
    Get-Process | Where-Object Id -eq $pid`
const CODE_WINDOWSPROCESSES_2 = `# Top 10 by CPU
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 |
  Select-Object Name, Id,
    @{N='CPU_s'; E={[math]::Round($_.CPU, 1)}},
    @{N='RAM_MB'; E={[math]::Round($_.WorkingSet/1MB, 1)}}

# Top 10 by RAM
Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 10 |
  Select-Object Name, Id,
    @{N='RAM_MB'; E={[math]::Round($_.WorkingSet/1MB, 1)}} |
  Format-Table -AutoSize`
const CODE_WINDOWSPROCESSES_3 = `Name         Id  CPU_s  RAM_MB
svchost    1234   12.3   145.2
lsass       680    4.1    56.8
dns         892    2.9    38.4`
const CODE_WINDOWSPROCESSES_4 = `Write-Host '=== Service Health Check ==='

$stopped = Get-Service | Where-Object {
    $_.StartType -eq 'Automatic' -and $_.Status -eq 'Stopped'
}

if ($stopped) {
    Write-Host "Found $($stopped.Count) stopped automatic service(s):" -ForegroundColor Yellow
    $stopped | Select-Object Name, DisplayName | Format-Table -AutoSize
} else {
    Write-Host 'All automatic services are running ✓' -ForegroundColor Green
}`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'In Task Manager, what does high "Committed" memory vs high "In Use" memory indicate?',
    options: [
      'They are the same metric displayed in different units',
      'In Use = physical RAM currently occupied by processes; Committed = total virtual memory allocated by all processes (including paged-out data) — high Committed with low In Use means active paging to disk',
      'Committed memory is always higher than In Use memory',
      'In Use measures GPU memory; Committed measures CPU cache',
    ],
    correct: 1,
    explanation: 'In Use shows physical RAM occupied. Committed shows all virtual memory reserved by processes — this can exceed physical RAM because Windows uses the page file as overflow. If Committed is much larger than In Use, processes have reserved large virtual address ranges but most is paged out to disk. High Committed with a full page file = potential out-of-memory situation. Check Memory Pressure and Hard Faults/sec (disk I/O for page file access).',
  },
  {
    id: 'q2',
    question: 'What is a Windows service and how does it differ from a regular user process?',
    options: [
      'Services are faster because they run in kernel mode',
      'Services run in the background without a user interface, can start before any user logs in, run under service accounts (SYSTEM, Network Service, or dedicated accounts), and are managed by the Service Control Manager',
      'Services can only be started and stopped by administrators',
      'Services are processes that use more than 10% CPU',
    ],
    correct: 1,
    explanation: 'Windows services are background processes managed by the Service Control Manager (SCM). They can: start automatically at boot before user login, run as specific service accounts with limited privileges, restart automatically on failure, and receive control signals (start/stop/pause). Most Windows features (DHCP, DNS, Print Spooler, Windows Update, Defender) are services. View with services.msc or Get-Service in PowerShell.',
  },
  {
    id: 'q3',
    question: 'What does "svchost.exe" do and why are there multiple instances?',
    options: [
      'It is a virus — legitimate Windows has only one svchost.exe',
      'svchost.exe is a generic host process for Windows services — Microsoft groups multiple services into shared svchost instances to reduce process overhead, with each instance hosting different service groups',
      'It provides a service to other host computers on the network',
      'It hosts Internet Explorer plugins and extensions',
    ],
    correct: 1,
    explanation: 'svchost.exe (Service Host) is a shared process container for DLL-based Windows services. Instead of each service running as its own .exe, services implemented as DLLs are grouped and hosted inside svchost.exe instances. In Windows 10 1703+, each service gets its own svchost instance when RAM > 3.5GB — so you see 50+ svchost processes, which is normal. Suspicious svchost: running from outside C:\\Windows\\System32, or running without any services hosted.',
  },
  {
    id: 'q4',
    question: 'What is Process Monitor (ProcMon) from Sysinternals used for?',
    options: [
      'A replacement for Task Manager that shows more CPU/memory detail',
      'Real-time monitoring of file system, registry, network, and process activity for every process — the gold standard for diagnosing application failures, permission errors, and malware behaviour',
      'Monitoring network bandwidth usage per process',
      'Killing processes that exceed CPU thresholds',
    ],
    correct: 1,
    explanation: 'Process Monitor (procmon.exe) from Sysinternals captures every file, registry, network, and process/thread operation in real time. When an application fails with a cryptic error, ProcMon shows: which files it tried to open (and if they were missing or access-denied), which registry keys it read (and if values were wrong), which DLLs it tried to load. Filter by process name then look for ACCESS DENIED or NAME NOT FOUND results. Invaluable for application troubleshooting.',
  },
  {
    id: 'q5',
    question: 'A process is consuming 100% CPU but you need to keep the system responsive. What is the fastest mitigation?',
    options: [
      'Kill the process immediately with Task Manager',
      'Lower the process priority to Below Normal or Low using Task Manager → Details → Set Priority, then investigate the cause — this lets the system remain responsive without terminating the process',
      'Restart the computer',
      'Open Resource Monitor and click Suspend',
    ],
    correct: 1,
    explanation: 'Right-click the process in Task Manager → Go to Details → Right-click → Set Priority → Below Normal. This drops the process to a low scheduling priority — other processes get CPU time first, keeping the system responsive. The runaway process still runs but no longer starves the system. Now you have time to investigate with ProcMon or check logs before deciding to kill it. Killing a misbehaving process prematurely destroys diagnostic information.',
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

export default function WindowsProcesses() {
  return (
    <LessonLayout
      lessonId="win-04"
      courseId="windows"
      title="Task Manager, Services & Processes"
      courseTitle="Windows Desktop"
      courseHref="/windows"
      xp={70}
      readTime="~30 min"
      icon="⚡"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Windows Desktop', href: '/windows' },
        { label: 'Processes & Services' },
      ]}
      prev={{ title: 'Registry Deep Dive',       href: '/windows/registry' }}
      next={{ title: 'Networking in Windows',    href: '/windows/networking' }}
      objectives={[
        'Navigate Task Manager\'s Performance, Details, and Services tabs effectively',
        'Understand svchost.exe and why multiple instances are normal',
        'Manage Windows services via services.msc and PowerShell',
        'Use Resource Monitor for deeper CPU, memory, and I/O analysis',
        'Identify high-CPU and memory-leaking processes',
        'Know when and how to safely terminate a process',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Task Manager is the first tool most people open when a system is slow —
          but most users only scratch the surface. Understanding process trees,
          service hosting, memory metrics, and the Sysinternals suite turns you
          from someone who restarts the computer to someone who actually diagnoses
          and fixes the root cause.
        </p>
      </section>

      <section>
        <h2>Task Manager — Beyond the Basics</h2>
        <div className="info-card mt-4 overflow-hidden">
          <div className="divide-y divide-surface-700">
            {[
              { tab: 'Processes',   tip: 'Right-click → Go to Details for the full process entry. Right-click → Open file location to verify executable path (malware detection).' },
              { tab: 'Performance', tip: 'Click "Open Resource Monitor" for per-process CPU/disk/network breakdown. Watch Hard Faults/sec — spikes mean paging to disk.' },
              { tab: 'App History', tip: 'CPU time and network usage per UWP app over 30 days. Useful for identifying background data consumers.' },
              { tab: 'Startup',     tip: 'Enable/disable startup programs. "Startup impact" is measured by actual CPU and disk usage during login. High-impact items slow boot.' },
              { tab: 'Details',     tip: 'Full process list with PID, CPU, Memory (Private Working Set), Status, and full command line (right-click → Select Columns).' },
              { tab: 'Services',    tip: 'Quick service status view. Right-click → Open Services for full management. Note which services share a svchost group.' },
            ].map(t => (
              <div key={t.tab} className="grid sm:grid-cols-4 gap-2 p-3">
                <p className="font-semibold text-white text-sm col-span-1">{t.tab}</p>
                <p className="text-xs text-slate-400 leading-relaxed col-span-3">{t.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2>Service Management</h2>
        <CodeBlock title="Managing Windows services with PowerShell" language="powershell"
          code={CODE_WINDOWSPROCESSES_1} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB WIN-4</span>
            <span className="text-sm font-semibold text-white">Process & Service Analysis on DC01</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~15 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Generate a process snapshot sorted by resource usage."
              command={CODE_WINDOWSPROCESSES_2}
              output={CODE_WINDOWSPROCESSES_3}
            />
            <LabStep number={2}
              description="Audit all services and find any that are stopped but set to auto-start."
              command={CODE_WINDOWSPROCESSES_4}
              output="All automatic services are running ✓"
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="win-04" title="Processes & Services Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={35} />
      </section>
    </LessonLayout>
  )
}
