import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_WINDOWSARCHITECTURE_1 = `# OS and kernel version
Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, OsArchitecture, OsBuildNumber

# Verify we're running NT kernel
[System.Environment]::OSVersion

# Boot time and uptime
$boot = (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
"Boot time : $boot"
"Uptime    : $([math]::Round(((Get-Date) - $boot).TotalHours, 1)) hours"`
const CODE_WINDOWSARCHITECTURE_2 = `WindowsProductName : Windows 10 Pro
WindowsVersion     : 22H2
OsArchitecture     : 64-bit
OsBuildNumber      : 19045

Platform ServicePack  Version  VersionString
Win32NT             6.2.9200.0 Microsoft Windows NT 6.2.9200.0

Boot time : 01/15/2025 08:00:00
Uptime    : 3.2 hours`
const CODE_WINDOWSARCHITECTURE_3 = `# Check the critical system processes
$critical = 'System','smss','csrss','wininit','services','lsass','explorer'

foreach ($name in $critical) {
    $procs = Get-Process -Name $name -ErrorAction SilentlyContinue
    if ($procs) {
        foreach ($p in $procs) {
            $path = try { $p.MainModule.FileName } catch { 'N/A (kernel)' }
            [PSCustomObject]@{
                Name  = $p.Name
                PID   = $p.Id
                Count = $procs.Count
                Path  = $path
            }
        }
    }
} | Format-Table -AutoSize`
const CODE_WINDOWSARCHITECTURE_4 = `Name      PID   Count  Path
----      ---   -----  ----
System    4     1      N/A (kernel)
smss      404   1      C:\\Windows\\System32\\smss.exe
csrss     520   2      C:\\Windows\\System32\\csrss.exe
wininit   612   1      C:\\Windows\\System32\\wininit.exe
services  672   1      C:\\Windows\\System32\\services.exe
lsass     680   1      C:\\Windows\\System32\\lsass.exe
explorer  4512  1      C:\\Windows\\explorer.exe`
const CODE_WINDOWSARCHITECTURE_5 = `# View Windows version from Registry
Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion' |
  Select-Object ProductName, DisplayVersion, CurrentBuild

# View Run key — programs that start with Windows
Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run' |
  Select-Object * -ExcludeProperty PS*

# Count total Registry keys under HKLM (shows scale of Registry)
(Get-ChildItem HKLM:\\ -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count`
const CODE_WINDOWSARCHITECTURE_6 = `ProductName    : Windows 10 Pro
DisplayVersion : 22H2
CurrentBuild   : 19045

SecurityHealth : C:\\Windows\\System32\\SecurityHealthSystray.exe

2847`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the Windows NT kernel and why does it matter for IT professionals?',
    options: [
      'A file system driver responsible for NTFS storage management',
      'The core operating system component that manages hardware abstraction, memory, processes, and security — every modern Windows version runs on the NT kernel lineage',
      'A network stack component that handles TCP/IP communications',
      'The Windows Update service that manages OS patches',
    ],
    correct: 1,
    explanation: 'The Windows NT kernel has been the foundation of every Windows version since Windows NT 3.1 (1993) through to Windows 11 today. It provides the Hardware Abstraction Layer (HAL), process and thread scheduling, virtual memory management, I/O subsystem, and the security reference monitor. Understanding the kernel helps diagnose crashes, performance issues, and security behaviour.',
  },
  {
    id: 'q2',
    question: 'What is the Windows Registry and what type of data does it store?',
    options: [
      'A log file that records all user activity on the system',
      'A hierarchical database storing OS configuration, hardware settings, user preferences, and application settings — organised into hives like HKLM and HKCU',
      'A list of installed programs and their file locations',
      'A network directory service similar to Active Directory',
    ],
    correct: 1,
    explanation: 'The Registry is a centralised hierarchical database that stores virtually all configuration data for Windows and applications. Key hives: HKEY_LOCAL_MACHINE (HKLM) — machine-wide settings, hardware, services; HKEY_CURRENT_USER (HKCU) — per-user settings; HKEY_CLASSES_ROOT — file type associations; HKEY_CURRENT_CONFIG — current hardware profile. Registry corruption or misconfiguration is a common cause of boot failures and application problems.',
  },
  {
    id: 'q3',
    question: 'What happens during the Windows boot process between BIOS/UEFI and the login screen?',
    options: [
      'BIOS → Windows Explorer loads → Login screen appears',
      'BIOS/UEFI → Boot Manager (bootmgr) → Windows OS Loader (winload) → Kernel init → Session Manager (smss.exe) → Winlogon → Login screen',
      'BIOS/UEFI → Kernel loads directly → User profile loads → Login screen',
      'BIOS/UEFI → GRUB bootloader → Windows kernel → Login screen',
    ],
    correct: 1,
    explanation: 'The Windows boot sequence: (1) Firmware (BIOS/UEFI) POST and boot device selection, (2) Windows Boot Manager (bootmgr/bootmgfw.efi) reads BCD store, (3) Windows OS Loader (winload.exe) loads the kernel and HAL, (4) Kernel initialisation — loads drivers, starts kernel services, (5) Session Manager (smss.exe) — first user-mode process, starts subsystems, (6) Winlogon.exe — manages authentication, (7) LogonUI.exe — displays the login screen.',
  },
  {
    id: 'q4',
    question: 'What is User Account Control (UAC) and what security problem does it solve?',
    options: [
      'A password complexity enforcement system',
      'A mechanism that runs programs with standard user rights by default, prompting for elevation when admin privileges are needed — prevents malware from silently gaining admin access',
      'A firewall feature that controls which users can access network resources',
      'A system that locks accounts after too many failed login attempts',
    ],
    correct: 1,
    explanation: 'UAC addresses the problem of users running as local administrators (common before Vista). Without UAC, any program running as an admin could silently modify the system, install malware, or change security settings. With UAC, even admin users run with standard privileges by default. Elevation requires explicit confirmation (the UAC prompt) — meaning malware that launches silently cannot gain admin rights without user interaction.',
  },
  {
    id: 'q5',
    question: 'What is the difference between a Windows process and a thread?',
    options: [
      'Processes are for system tasks; threads are for user applications',
      'A process is a container with its own memory space and resources; a thread is a unit of execution that runs within a process and shares the process\'s memory',
      'Processes run in kernel mode; threads run in user mode',
      'There is no difference — the terms are interchangeable in Windows',
    ],
    correct: 1,
    explanation: 'A process is an isolated container: it has its own virtual address space, security token, handles, and resources. Processes cannot directly access another process\'s memory (isolation/security). A thread is the actual unit of execution within a process — processes can have multiple threads running concurrently, all sharing the process\'s memory space. In Task Manager: Processes tab shows processes; Details tab shows processes with their thread counts.',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info: 'callout-info', warning: 'callout-warning', success: 'callout-success' }
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

export default function WindowsArchitecture() {
  return (
    <LessonLayout
      lessonId="win-01"
      courseId="windows"
      title="Windows 10/11 Architecture"
      courseTitle="Windows Desktop"
      courseHref="/windows"
      xp={50}
      readTime="~20 min"
      icon="🏗️"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Windows Desktop', href: '/windows' },
        { label: 'Windows Architecture' },
      ]}
      prev={null}
      next={{ title: 'User Accounts & Permissions', href: '/windows/permissions' }}
      objectives={[
        'Understand the Windows NT kernel and its role in the OS',
        'Map the Windows architecture: kernel mode vs user mode',
        'Trace the Windows boot sequence from firmware to desktop',
        'Understand the Registry structure and key hives',
        'Explain processes, threads, and the role of core system processes',
        'Use Task Manager and Process Explorer to inspect the running system',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Before you can effectively troubleshoot, secure, or automate Windows systems,
          you need a mental model of how Windows actually works under the hood. The NT
          kernel, the Registry, the boot process, and the process model are the four
          pillars that everything else builds on.
        </p>
        <Callout type="info" icon="💡" title="Why architecture matters for sysadmins">
          When a system crashes, won't boot, or runs slowly — understanding the
          architecture tells you <em>where to look</em>. Without it, troubleshooting
          is guesswork. With it, you can reason systematically from symptom to cause.
        </Callout>
      </section>

      <section>
        <h2>Kernel Mode vs User Mode</h2>
        <p>
          Windows separates code execution into two privilege rings — the most important
          architectural boundary in the OS:
        </p>
        <div className="grid sm:grid-cols-2 gap-5 mt-4">
          {[
            {
              mode: 'Kernel Mode',
              ring: 'Ring 0',
              icon: '⚙️',
              color: 'border-accent-red/25 bg-accent-red/5',
              text: 'text-accent-red',
              desc: 'Unrestricted access to hardware and all memory. A crash here causes a Blue Screen of Death (BSOD). Runs: NT kernel, HAL, device drivers, file system drivers.',
              examples: ['ntoskrnl.exe — the kernel', 'hal.dll — hardware abstraction', 'Device drivers (.sys files)', 'File system drivers (ntfs.sys)'],
            },
            {
              mode: 'User Mode',
              ring: 'Ring 3',
              icon: '👤',
              color: 'border-brand-500/25 bg-brand-500/5',
              text: 'text-brand-300',
              desc: 'Restricted access — cannot directly touch hardware or other process memory. Crashes here affect only that process. Runs: all applications and most Windows services.',
              examples: ['explorer.exe — shell', 'svchost.exe — service host', 'Your applications', 'Windows subsystems (csrss.exe)'],
            },
          ].map(m => (
            <div key={m.mode} className={`card p-5 border ${m.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{m.icon}</span>
                <div>
                  <p className={`font-bold text-sm ${m.text}`}>{m.mode}</p>
                  <span className="tag text-[10px]">{m.ring}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{m.desc}</p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Key components</p>
              {m.examples.map(e => (
                <div key={e} className="flex gap-2 text-xs text-slate-400 mb-1">
                  <span className={`flex-shrink-0 ${m.text}`}>▸</span>{e}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>The Windows Boot Sequence</h2>
        <div className="info-card mt-4 overflow-hidden">
          <div className="divide-y divide-surface-700">
            {[
              { step: '1', name: 'Firmware (BIOS/UEFI)', desc: 'POST, hardware detection, selects boot device, loads boot sector or EFI application', file: 'firmware' },
              { step: '2', name: 'Windows Boot Manager', desc: 'Reads Boot Configuration Data (BCD) store, displays OS selection menu if multiple OS', file: 'bootmgr / bootmgfw.efi' },
              { step: '3', name: 'Windows OS Loader', desc: 'Loads the kernel (ntoskrnl.exe), HAL, and boot-start drivers into memory', file: 'winload.exe / winload.efi' },
              { step: '4', name: 'Kernel Initialisation', desc: 'Kernel starts, initialises HAL, loads registry hives, starts kernel-mode drivers and services', file: 'ntoskrnl.exe' },
              { step: '5', name: 'Session Manager', desc: 'First user-mode process — starts Win32 subsystem, creates paging files, runs autochk', file: 'smss.exe (PID varies)' },
              { step: '6', name: 'Winlogon / LogonUI', desc: 'Manages authentication, loads user profile, displays the login screen', file: 'winlogon.exe + logonui.exe' },
              { step: '7', name: 'Explorer Shell', desc: 'Desktop, taskbar, and shell environment load after successful authentication', file: 'explorer.exe' },
            ].map(s => (
              <div key={s.step} className="flex gap-4 p-3 items-start">
                <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30
                                 text-brand-300 font-mono font-bold text-xs flex items-center
                                 justify-center flex-shrink-0 mt-0.5">{s.step}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{s.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
                <code className="text-[10px] font-mono text-slate-500 flex-shrink-0 text-right hidden sm:block">{s.file}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2>Core System Processes</h2>
        <div className="info-card mt-4 overflow-hidden">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Processes you will always see in Task Manager — knowing these helps spot malware
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-surface-700">
                <tr>
                  {['Process', 'Role', 'Normal count', 'Red flag'].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {[
                  { proc: 'System', role: 'Kernel and driver threads', count: 'Exactly 1', flag: 'More than 1 = fake' },
                  { proc: 'smss.exe', role: 'Session Manager — boot critical', count: '1 master + temp child', flag: 'Running from wrong path' },
                  { proc: 'csrss.exe', role: 'Win32 subsystem client/server', count: '1 per session (usually 2)', flag: 'Running from wrong path' },
                  { proc: 'wininit.exe', role: 'Starts services.exe, lsass.exe, lsm.exe', count: 'Exactly 1', flag: 'More than 1 = fake' },
                  { proc: 'services.exe', role: 'Service Control Manager — starts all services', count: 'Exactly 1', flag: 'More than 1 = fake' },
                  { proc: 'lsass.exe', role: 'Local Security Authority — authentication', count: 'Exactly 1', flag: 'More than 1 = possible Mimikatz/malware' },
                  { proc: 'svchost.exe', role: 'Service host — runs multiple services in one process', count: 'Many (10-20+)', flag: 'Running from outside System32' },
                  { proc: 'explorer.exe', role: 'Desktop shell and file manager', count: '1 per user session', flag: 'Running from outside Windows dir' },
                ].map(r => (
                  <tr key={r.proc} className="hover:bg-surface-700/30">
                    <td className="px-3 py-2 font-mono text-accent-cyan font-bold">{r.proc}</td>
                    <td className="px-3 py-2 text-slate-400">{r.role}</td>
                    <td className="px-3 py-2 text-accent-green font-mono">{r.count}</td>
                    <td className="px-3 py-2 text-accent-amber">{r.flag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2>Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB WIN-1</span>
            <span className="text-sm font-semibold text-white">Explore Windows Architecture with PowerShell</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~15 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Inspect the system version, kernel, and architecture."
              command={CODE_WINDOWSARCHITECTURE_1}
              output={CODE_WINDOWSARCHITECTURE_2}
            />
            <LabStep number={2}
              description="Audit core system processes — verify they match the expected counts and paths."
              command={CODE_WINDOWSARCHITECTURE_3}
              output={CODE_WINDOWSARCHITECTURE_4}
            />
            <LabStep number={3}
              description="Explore the Registry — read a key and view startup entries."
              command={CODE_WINDOWSARCHITECTURE_5}
              output={CODE_WINDOWSARCHITECTURE_6}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="win-01" title="Windows Architecture Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={25} />
      </section>
    </LessonLayout>
  )
}
