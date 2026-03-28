import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_PSREMOTING_1 = `# On the REMOTE server (or via Group Policy)
Enable-PSRemoting -Force

# What Enable-PSRemoting does:
# 1. Starts and enables WinRM service
# 2. Creates WinRM listener on port 5985
# 3. Creates Windows Firewall rule for port 5985
# 4. Sets WinRM to auto-start

# Verify WinRM is listening
Test-WSMan -ComputerName localhost
Get-WSManInstance -ResourceURI winrm/config -ComputerName localhost

# From a management workstation — test connectivity
Test-NetConnection -ComputerName DC01 -Port 5985
Test-WSMan -ComputerName DC01

# Deploy via GPO (the production approach):
# Computer Config > Windows Settings > Security Settings
# > Windows Firewall > Inbound: allow port 5985 from management VLAN
# + Computer Config > Preferences > Control Panel > Services: WinRM = Automatic`
const CODE_PSREMOTING_2 = `# ── Interactive session ──────────────────────────────────────
Enter-PSSession -ComputerName DC01
# Prompt becomes: [DC01]: PS C:\\>
# Type commands as if you're sitting at DC01
Get-Service | Where-Object Status -eq Running | Measure-Object
Exit-PSSession

# ── Run on one server ────────────────────────────────────────
Invoke-Command -ComputerName DC01 -ScriptBlock {
    Get-Service | Where-Object Status -eq 'Stopped' |
        Select-Object Name, Status
}

# ── Run on MANY servers simultaneously ───────────────────────
$servers = 'DC01','SRV01','WEB01','DB01'
Invoke-Command -ComputerName $servers -ScriptBlock {
    [PSCustomObject]@{
        Computer  = $env:COMPUTERNAME
        FreeGB    = [math]::Round((Get-PSDrive C).Free/1GB, 1)
        CPU_Pct   = (Get-WmiObject Win32_Processor).LoadPercentage
        Uptime_h  = [math]::Round((Get-Date -
                      (Get-CimInstance Win32_OperatingSystem).LastBootUpTime).TotalHours, 1)
    }
} | Select-Object Computer, FreeGB, CPU_Pct, Uptime_h |
  Sort-Object Computer | Format-Table -AutoSize

# ── Pass local variables into remote scope ────────────────────
$serviceName = 'Spooler'
Invoke-Command -ComputerName $servers -ScriptBlock {
    param($svc)
    Get-Service -Name $svc | Select-Object Name, Status
} -ArgumentList $serviceName

# ── Persistent sessions (reuse connections) ───────────────────
$sessions = New-PSSession -ComputerName $servers
Invoke-Command -Session $sessions -ScriptBlock { hostname }
Invoke-Command -Session $sessions -ScriptBlock { Get-Service WinRM }
Remove-PSSession $sessions`
const CODE_PSREMOTING_3 = `# On DC01 — confirm WinRM is running
Get-Service WinRM | Select-Object Name, Status, StartType

# Confirm listener exists
Get-WSManInstance -ResourceURI winrm/config/listener -SelectorSet @{Address='*';Transport='HTTP'}

# Test from DC01 to itself
Test-WSMan localhost`
const CODE_PSREMOTING_4 = `Name   Status  StartType
----   ------  ---------
WinRM  Running Automatic

cfg   : http://schemas.microsoft.com/wbem/wsman/1/config/listener
Transport : HTTP
Port     : 5985`
const CODE_PSREMOTING_5 = `$targets = @('DC01','localhost')

$report = Invoke-Command -ComputerName $targets -ScriptBlock {
    [PSCustomObject]@{
        Computer      = $env:COMPUTERNAME
        OS            = (Get-WmiObject Win32_OperatingSystem).Caption
        FreeRAM_GB    = [math]::Round(
            (Get-WmiObject Win32_OperatingSystem).FreePhysicalMemory/1MB, 2)
        FreeDisk_GB   = [math]::Round((Get-PSDrive C).Free/1GB, 1)
        Services_Run  = (Get-Service | Where-Object Status -eq 'Running' | Measure-Object).Count
    }
} -ErrorAction SilentlyContinue

$report | Select-Object Computer, OS, FreeRAM_GB, FreeDisk_GB, Services_Run |
  Format-Table -AutoSize`
const CODE_PSREMOTING_6 = `Computer  OS                         FreeRAM_GB  FreeDisk_GB  Services_Run
--------  --                         ----------  -----------  ------------
DC01      Windows Server 2025 Std    1.82        42.7         67
DC01      Windows Server 2025 Std    1.82        42.7         67`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What protocol does PowerShell Remoting use by default?',
    options: ['SSH on port 22', 'WinRM (WS-Management) on port 5985 (HTTP) or 5986 (HTTPS)', 'RDP on port 3389', 'SMB on port 445'],
    correct: 1,
    explanation: 'PSRemoting uses WinRM (Windows Remote Management), Microsoft\'s implementation of the WS-Management protocol. Default: port 5985 (HTTP, traffic is still encrypted with Kerberos). Port 5986 uses HTTPS with a certificate. Enable it with: Enable-PSRemoting -Force. In a domain environment, WinRM traffic is authenticated and encrypted via Kerberos automatically.',
  },
  {
    id: 'q2',
    question: 'What is the difference between Enter-PSSession and Invoke-Command?',
    options: [
      'Enter-PSSession opens an interactive remote shell; Invoke-Command runs a script block on one or more computers (can run in parallel)',
      'Enter-PSSession is for Linux; Invoke-Command is for Windows',
      'They are identical — different syntax for the same operation',
      'Enter-PSSession requires admin rights; Invoke-Command does not',
    ],
    correct: 0,
    explanation: 'Enter-PSSession creates an interactive session — your prompt changes to [ComputerName]:> and you type commands one at a time. Invoke-Command runs a script block non-interactively on one or many computers simultaneously using -ComputerName. Invoke-Command -ComputerName server1,server2,server3 { Get-Service } runs the command on all three servers in parallel and returns results.',
  },
  {
    id: 'q3',
    question: 'How do you run a command on 50 servers simultaneously with PSRemoting?',
    options: [
      'Loop through each server with foreach and call Invoke-Command one at a time',
      'Invoke-Command -ComputerName (Get-Content servers.txt) -ScriptBlock { command } — it executes in parallel by default',
      'Start-Job for each server then Wait-Job',
      'PSRemoting cannot target more than 32 computers at once',
    ],
    correct: 1,
    explanation: 'Invoke-Command accepts arrays for -ComputerName and executes on all targets in parallel (default throttle: 32 simultaneous connections, configurable with -ThrottleLimit). Feed server lists from a text file, AD query, or CSV. Results come back as objects tagged with PSComputerName so you know which server returned each result. This is how you manage hundreds of servers with a single command.',
  },
  {
    id: 'q4',
    question: 'What is a "Persistent Session" (PSSession) and when should you use one?',
    options: [
      'A session that survives server reboots',
      'A reusable connection object created with New-PSSession — use when running multiple commands against the same computer to avoid the overhead of establishing a new connection each time',
      'A session that records all commands for audit purposes',
      'A session with elevated permissions that bypasses UAC',
    ],
    correct: 1,
    explanation: 'New-PSSession creates a persistent connection object that stays open. Each Invoke-Command without a session creates AND destroys a connection — expensive for many commands. With $session = New-PSSession -ComputerName server1, subsequent Invoke-Command -Session $session calls reuse the same connection. Also preserves state (variables, loaded modules) between calls. Clean up with Remove-PSSession.',
  },
  {
    id: 'q5',
    question: 'What security risk does "CredSSP" authentication in PSRemoting address, and what risk does it introduce?',
    options: [
      'CredSSP prevents man-in-the-middle attacks; the risk is slower connection speed',
      'CredSSP enables double-hop authentication (connecting to a third server FROM the remote session); the risk is that credentials are delegated to the remote machine, which could steal them',
      'CredSSP encrypts traffic with AES-256; the risk is incompatibility with older servers',
      'CredSSP allows non-admin accounts to use remoting; the risk is reduced audit trail',
    ],
    correct: 1,
    explanation: 'The "double-hop problem": in a PSSession, you can\'t connect to a THIRD server because credentials are not forwarded. CredSSP solves this by delegating credentials to the remote machine — but this means the remote machine now holds your credentials and could abuse them. Only use CredSSP for specific administrative tasks that require the double-hop; never enable it globally. The preferred alternative is constrained delegation or resource-based constrained delegation.',
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

export default function PSRemoting() {
  return (
    <LessonLayout
      lessonId="ps-05"
      courseId="powershell"
      title="Remote Management with PSRemoting"
      courseTitle="PowerShell"
      courseHref="/powershell"
      xp={80}
      readTime="~30 min"
      icon="🌐"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'PowerShell', href: '/powershell' },
        { label: 'PSRemoting' },
      ]}
      prev={{ title: 'Active Directory Automation', href: '/powershell/active-directory' }}
      next={{ title: 'File System & Registry',     href: '/powershell/filesystem' }}
      objectives={[
        'Enable and configure WinRM for PowerShell Remoting',
        'Use Enter-PSSession for interactive remote administration',
        'Run commands on dozens of servers simultaneously with Invoke-Command',
        'Create persistent sessions (PSSessions) for efficient multi-command workflows',
        'Pass local variables into remote script blocks',
        'Build a multi-server management script',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          PowerShell Remoting transforms how you manage Windows infrastructure. Instead
          of logging into each server individually, you can manage 100 servers from a
          single console — running commands simultaneously, collecting results as
          structured objects, and automating fleet-wide changes in minutes.
        </p>
        <Callout type="info" icon="🎯" title="The sysadmin superpower">
          Invoke-Command -ComputerName (Get-ADComputer -Filter *)  -ScriptBlock
          is how senior engineers apply changes across an entire domain in one shot.
          This is the difference between managing 10 servers and managing 1,000.
        </Callout>
      </section>

      <section>
        <h2>Setup & Configuration</h2>
        <CodeBlock title="Enable PSRemoting — run on each server you want to manage" language="powershell"
          code={CODE_PSREMOTING_1} />
      </section>

      <section>
        <h2>Interactive & Parallel Remote Commands</h2>
        <CodeBlock title="Enter-PSSession, Invoke-Command, persistent sessions" language="powershell"
          code={CODE_PSREMOTING_2} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB PS-5</span>
            <span className="text-sm font-semibold text-white">Manage DC01 Remotely from a PSRemoting Session</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Verify PSRemoting is enabled on DC01 and test connectivity."
              command={CODE_PSREMOTING_3}
              output={CODE_PSREMOTING_4}
            />
            <LabStep number={2}
              description="Run a fleet health report using Invoke-Command (targeting DC01 only in our lab)."
              command={CODE_PSREMOTING_5}
              output={CODE_PSREMOTING_6}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="ps-05" title="PSRemoting Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={40} />
      </section>
    </LessonLayout>
  )
}
