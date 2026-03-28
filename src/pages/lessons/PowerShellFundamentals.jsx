import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'
import GlossaryTooltip from '../../components/GlossaryTooltip.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_POWERSHELLFUNDAMENTALS_1 = `# To get CPU usage of a process,
# you must parse text:
ps aux | grep chrome | awk '{print $3}'

# Fragile, platform-specific,
# breaks with column changes`
const CODE_POWERSHELLFUNDAMENTALS_2 = `# Direct property access on real objects:
Get-Process chrome | Select-Object CPU, WorkingSet

# Structured, reliable, discoverable
# Works regardless of display formatting`
const CODE_POWERSHELLFUNDAMENTALS_3 = `# See ALL properties and methods of a Process object
Get-Process | Get-Member

# See just properties
Get-Process | Get-Member -MemberType Property

# Example output:
#   Name              MemberType  Definition
#   ----              ----------  ----------
#   CPU               Property    System.Nullable[double] CPU
#   Id                Property    int Id
#   Name              Property    string Name
#   WorkingSet        Property    int WorkingSet64 WorkingSet...`
const CODE_POWERSHELLFUNDAMENTALS_4 = `# Update help content first (run as admin, once)
Update-Help -Force

# Get help for any cmdlet
Get-Help Get-Process
Get-Help Get-Process -Full        # Complete docs with all parameters
Get-Help Get-Process -Examples    # Just the practical examples
Get-Help Get-Process -Online      # Open browser to online docs
Get-Help Get-Process -Parameter * # Details on every parameter

# Find cmdlets by topic
Get-Help *service*                # All cmdlets with "service" in name
Get-Help about_*                  # Conceptual help articles
Get-Help about_Pipelines          # How pipelines work
Get-Help about_Variables          # Variable documentation

# Find ALL cmdlets for a specific noun
Get-Command -Noun Service         # All *-Service cmdlets
Get-Command -Verb Get             # All Get-* cmdlets`
const CODE_POWERSHELLFUNDAMENTALS_5 = `# Variables start with $
$name    = "DC01"
$port    = 3389
$enabled = $true
$servers = @("DC01", "SRV01", "WEB01")  # Array
$config  = @{Host = "DC01"; Port = 389}  # Hashtable

# String interpolation (double quotes expand variables)
Write-Host "Connecting to $name on port $port"

# Type checking
$name.GetType().Name      # String
$port.GetType().Name      # Int32

# Casting
[int]"42"                 # 42
[string]123               # "123"
[datetime]"2025-01-15"    # DateTime object`
const CODE_POWERSHELLFUNDAMENTALS_6 = `# If / ElseIf / Else
if ($service.Status -eq "Running") {
    Write-Host "Service is up" -ForegroundColor Green
} elseif ($service.Status -eq "Stopped") {
    Write-Host "Service is down" -ForegroundColor Red
} else {
    Write-Host "Unknown status: $($service.Status)"
}

# ForEach-Object (pipeline)
Get-Service | Where-Object { $_.Status -eq "Stopped" } |
  ForEach-Object { Start-Service $_.Name }

# foreach loop (collection)
$servers = @("DC01", "SRV01", "WEB01")
foreach ($server in $servers) {
    Test-Connection $server -Count 1 -Quiet
}

# While loop
$attempts = 0
while ($attempts -lt 3) {
    $attempts++
    # do something
}`
const CODE_POWERSHELLFUNDAMENTALS_7 = `# Check current policy
Get-ExecutionPolicy
Get-ExecutionPolicy -List   # All scopes

# Set for current user (recommended approach — no admin needed)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Set machine-wide (requires admin)
Set-ExecutionPolicy RemoteSigned -Scope LocalMachine`
const CODE_POWERSHELLFUNDAMENTALS_8 = `$PSVersionTable          # Version info
Get-ExecutionPolicy      # Current policy
$env:COMPUTERNAME        # Computer name
$env:USERNAME            # Current user`
const CODE_POWERSHELLFUNDAMENTALS_9 = `Name                           Value
----                           -----
PSVersion                      7.4.1
PSEdition                      Core
OS                             Microsoft Windows 10.0.20348

RemoteSigned
DC01
Administrator`
const CODE_POWERSHELLFUNDAMENTALS_10 = `# 1. Find the cmdlet
Get-Command -Noun Service

# 2. Learn how to use it
Get-Help Get-Service -Examples

# 3. Use it — get all stopped services
Get-Service | Where-Object { $_.Status -eq "Stopped" } |
  Select-Object Name, DisplayName, StartType |
  Sort-Object DisplayName`
const CODE_POWERSHELLFUNDAMENTALS_11 = `Name     DisplayName                  StartType
----     -----------                  ---------
AppIDSvc Application Identity         Manual
AppMgmt  Application Management       Manual
...`
const CODE_POWERSHELLFUNDAMENTALS_12 = `# Discover all Process object properties
Get-Process | Get-Member -MemberType Property | Select-Object Name, Definition

# Get top 5 processes by CPU
Get-Process |
  Sort-Object CPU -Descending |
  Select-Object Name, Id, CPU, WorkingSet64 |
  Select-Object -First 5`
const CODE_POWERSHELLFUNDAMENTALS_13 = `# Create the Scripts directory
New-Item -Path "C:\\\\Scripts" -ItemType Directory -Force

# Create the script file
$scriptContent = @'
# server-health.ps1 — Basic server health check

param(
    [string]$ComputerName = $env:COMPUTERNAME
)

Write-Host "=== Server Health: $ComputerName ===" -ForegroundColor Cyan

# CPU
$cpu = Get-WmiObject Win32_Processor | Measure-Object LoadPercentage -Average
Write-Host "CPU Usage:    $($cpu.Average)%"

# Memory
$mem = Get-WmiObject Win32_OperatingSystem
$usedMem = [math]::Round(($mem.TotalVisibleMemorySize - $mem.FreePhysicalMemory)/1MB, 2)
$totalMem = [math]::Round($mem.TotalVisibleMemorySize/1MB, 2)
Write-Host "Memory:       $usedMem GB / $totalMem GB"

# Disk
Get-PSDrive C | Select-Object @{N="Drive";E={"C:"}},
  @{N="Used(GB)";E={[math]::Round($_.Used/1GB,1)}},
  @{N="Free(GB)";E={[math]::Round($_.Free/1GB,1)}} |
  Format-Table -AutoSize

# Critical services
$services = "DNS","NTDS","W32Time","Netlogon" | ForEach-Object {
    Get-Service $_ -ErrorAction SilentlyContinue
}
Write-Host "--- Critical Services ---"
$services | Select-Object Name, Status | Format-Table
'@

Set-Content -Path "C:\\\\Scripts\\\\server-health.ps1" -Value $scriptContent

# Run the script
& C:\\\\Scripts\\\\server-health.ps1`
const CODE_POWERSHELLFUNDAMENTALS_14 = `=== Server Health: DC01 ===
CPU Usage:    4%
Memory:       2.14 GB / 4.00 GB

Drive  Used(GB)  Free(GB)
-----  --------  --------
C:     12.3      47.7

--- Critical Services ---
Name     Status
----     ------
DNS      Running
NTDS     Running
W32Time  Running
Netlogon Running`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the correct PowerShell verb-noun cmdlet naming convention for listing running services?',
    options: ['List-Service', 'Show-Services', 'Get-Service', 'Display-Service'],
    correct: 2,
    explanation: 'PowerShell follows a strict Verb-Noun naming convention. Approved verbs include Get, Set, New, Remove, Start, Stop, etc. Get-Service is correct. "List" and "Show" are not approved PowerShell verbs. You can see all approved verbs with Get-Verb.',
  },
  {
    id: 'q2',
    question: 'What does the pipeline operator (|) do in PowerShell?',
    options: [
      'Redirects output to a file',
      'Passes objects (not just text) from one cmdlet to the next',
      'Runs two commands simultaneously in parallel',
      'Separates multiple commands on one line',
    ],
    correct: 1,
    explanation: 'The PowerShell pipeline passes full .NET objects between cmdlets — not just text like in bash. This means you can access properties of the objects in subsequent pipeline stages. For example: Get-Process | Where-Object {$_.CPU -gt 100} works because $_ is a full Process object with a CPU property.',
  },
  {
    id: 'q3',
    question: 'What does Get-Help Get-Process -Examples show you?',
    options: [
      'The source code for Get-Process',
      'All properties of a Process object',
      'Practical usage examples for the Get-Process cmdlet',
      'A list of all processes currently running',
    ],
    correct: 2,
    explanation: 'Get-Help <CmdletName> -Examples shows practical usage examples. Other useful Help parameters: -Full (complete documentation), -Online (opens browser to online docs), -Parameter * (details on all parameters). Always run Update-Help first to get the latest documentation.',
  },
  {
    id: 'q4',
    question: 'Which automatic variable represents the current object in the pipeline?',
    options: ['$this', '$current', '$_', '$object'],
    correct: 2,
    explanation: '$_ (dollar underscore) is the automatic variable representing the current pipeline object in Where-Object, ForEach-Object, and other pipeline-aware cmdlets. You\'ll also see $PSItem used as an alias for $_ in newer PowerShell. Example: Get-Service | Where-Object { $_.Status -eq "Running" }',
  },
  {
    id: 'q5',
    question: 'What execution policy setting allows locally-created scripts but requires remote scripts to be signed?',
    options: ['Restricted', 'AllSigned', 'RemoteSigned', 'Unrestricted'],
    correct: 2,
    explanation: 'RemoteSigned allows locally-created .ps1 scripts to run without a signature, but scripts downloaded from the internet (marked with an Alternate Data Stream zone identifier) must be digitally signed by a trusted publisher. This is the recommended setting for most sysadmin environments.',
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

function LabStep({ number, description, command, output }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 rounded-full bg-accent-amber/20 border border-accent-amber/30
                         text-accent-amber text-[11px] font-bold font-mono flex items-center
                         justify-center flex-shrink-0 mt-0.5">{number}</span>
        <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
      </div>
      {command && <div className="ml-9"><CodeBlock code={command} language="powershell" showCopy /></div>}
      {output && (
        <div className="ml-9 rounded-xl bg-surface-950 border border-surface-700 px-4 py-3
                        font-mono text-xs text-accent-green leading-6">
          {output.split('\n').map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  )
}

export default function PowerShellFundamentals() {
  return (
    <LessonLayout
      lessonId="ps-01"
      courseId="powershell"
      title="PowerShell Fundamentals"
      courseTitle="PowerShell"
      courseHref="/powershell"
      xp={50}
      readTime="~25 min"
      icon="⚡"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'PowerShell', href: '/powershell' },
        { label: 'Fundamentals' },
      ]}
      prev={null}
      next={{ title: 'Working with Objects & the Pipeline', href: '/powershell/pipeline' }}
      objectives={[
        'Understand what makes PowerShell different from cmd and bash',
        'Use the Help system to learn any cmdlet',
        'Work with the object pipeline',
        'Understand variables, types, and comparison operators',
        'Set up the execution policy correctly',
        'Write and run your first .ps1 script',
      ]}
    >
      {/* ── OVERVIEW ── */}
      <section>
        <h2>Overview</h2>
        <p>
          <GlossaryTooltip term="PowerShell" /> is Microsoft's task automation and configuration
          management framework — a full programming language built on the .NET runtime with
          an interactive shell on top. Unlike cmd.exe (which works with text) or bash (which
          pipes text streams), PowerShell pipelines <strong>structured .NET objects</strong>.
        </p>
        <p className="mt-4">
          This difference is fundamental. When you pipe output in PowerShell, you're passing
          objects with properties and methods — not strings you have to parse with grep and awk.
          This makes PowerShell the most powerful automation tool in the Windows ecosystem
          and an essential skill for any Windows sysadmin.
        </p>
        <Callout type="info" icon="💡" title="PowerShell is not optional">
          As of Windows Server 2016+, many server roles are managed exclusively via PowerShell.
          Server Core installations have no GUI at all. PowerShell is the interface.
        </Callout>
      </section>

      {/* ── THE OBJECT PIPELINE ── */}
      <section>
        <h2>The Core Mental Model — Objects, Not Text</h2>

        <p>The most important thing to understand about PowerShell:</p>

        <div className="info-card mt-5">
          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-surface-700">
            <div className="pb-4 sm:pb-0 sm:pr-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Bash / CMD — Text Streams</p>
              <CodeBlock code={CODE_POWERSHELLFUNDAMENTALS_1} language="bash" showCopy={false} />
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-5">
              <p className="text-xs font-semibold text-accent-cyan uppercase tracking-widest mb-3">PowerShell — Object Streams</p>
              <CodeBlock code={CODE_POWERSHELLFUNDAMENTALS_2} language="powershell" showCopy={false} />
            </div>
          </div>
        </div>

        <p className="mt-5">
          When <code className="font-mono text-accent-cyan text-sm">Get-Process</code> runs,
          it returns an array of <strong>System.Diagnostics.Process</strong> objects — each with
          dozens of properties. The display you see is just a formatted view. The real data is
          richer. Use <code className="font-mono text-accent-cyan text-sm">Get-Member</code> to
          discover what's available on any object.
        </p>

        <CodeBlock className="mt-4" title="Exploring objects with Get-Member" language="powershell"
          code={CODE_POWERSHELLFUNDAMENTALS_3} />
      </section>

      {/* ── THE HELP SYSTEM ── */}
      <section>
        <h2>The Help System — Your Most Important Tool</h2>
        <p>
          You don't need to memorise every cmdlet. You need to know how to find anything
          using the built-in help system. Run <code className="font-mono text-accent-cyan text-sm">Update-Help</code> first
          to download the latest documentation.
        </p>

        <CodeBlock className="mt-4" title="Mastering Get-Help" language="powershell"
          code={CODE_POWERSHELLFUNDAMENTALS_4} />

        <Callout type="info" icon="💡" title="The discovery loop">
          Get-Command → find what cmdlet you need.
          Get-Help → learn how to use it.
          Get-Member → discover what properties the output objects have.
          These three cmdlets are all you need to learn anything in PowerShell.
        </Callout>
      </section>

      {/* ── SYNTAX ESSENTIALS ── */}
      <section>
        <h2>Syntax Essentials</h2>

        <h3>Variables</h3>
        <CodeBlock language="powershell" code={CODE_POWERSHELLFUNDAMENTALS_5} />

        <h3>Comparison & Logical Operators</h3>
        <div className="info-card overflow-hidden mt-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-surface-700">
            {[
              { group: 'Comparison', ops: ['-eq  equal to', '-ne  not equal', '-gt  greater than', '-lt  less than', '-ge  ≥', '-le  ≤', '-like  wildcard', '-match  regex'] },
              { group: 'Logical',    ops: ['-and  both true', '-or   either true', '-not  negation', '!     negation alias', '-xor  exclusive or'] },
              { group: 'String',     ops: ['-contains  in array', '-in   in array (rev)', '-notlike  not wildcard', '-notmatch  not regex', '.ToUpper()', '.Trim()', '.Split(",")', '.Replace("a","b")'] },
            ].map(g => (
              <div key={g.group} className="p-4">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">{g.group}</p>
                <div className="space-y-1.5">
                  {g.ops.map(op => (
                    <code key={op} className="block text-[11px] font-mono text-accent-cyan">{op}</code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <h3>Control Flow</h3>
        <CodeBlock language="powershell" code={CODE_POWERSHELLFUNDAMENTALS_6} />
      </section>

      {/* ── EXECUTION POLICY ── */}
      <section>
        <h2>Execution Policy</h2>
        <p>
          PowerShell scripts are blocked by default to prevent accidental execution.
          The execution policy controls this behaviour.
        </p>
        <div className="info-card mt-4 overflow-hidden">
          <div className="divide-y divide-surface-700">
            {[
              { policy: 'Restricted',    risk: 'Most Secure',   desc: 'No scripts can run. Only interactive commands. Default on Windows clients.' },
              { policy: 'AllSigned',     risk: 'Secure',        desc: 'All scripts must be digitally signed by a trusted publisher.' },
              { policy: 'RemoteSigned',  risk: 'Recommended',   desc: 'Local scripts run freely. Downloaded scripts must be signed. Best for sysadmins.', highlight: true },
              { policy: 'Unrestricted', risk: 'Caution',       desc: 'All scripts run. Shows warning for downloaded scripts.' },
              { policy: 'Bypass',        risk: 'Use with care', desc: 'No blocking, no warnings. Used by automation frameworks that manage their own security.' },
            ].map(p => (
              <div key={p.policy}
                   className={`flex items-start gap-4 p-4 ${p.highlight ? 'bg-brand-500/5' : ''}`}>
                <code className={`text-sm font-mono font-bold w-32 flex-shrink-0 pt-0.5
                                   ${p.highlight ? 'text-brand-300' : 'text-slate-400'}`}>
                  {p.policy}
                </code>
                <div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mr-2
                                     ${p.highlight ? 'bg-brand-500/15 text-brand-300' : 'bg-surface-700 text-slate-500'}`}>
                    {p.risk}
                  </span>
                  <span className="text-xs text-slate-400">{p.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <CodeBlock className="mt-4" language="powershell" code={CODE_POWERSHELLFUNDAMENTALS_7} />
      </section>

      {/* ── VMware LAB ── */}
      <section>
        <h2>VMware Lab Exercise</h2>
        <Callout type="warning" icon="🧪" title="Lab Environment">
          Open PowerShell 7 (or Windows PowerShell 5.1) on DC01.
          Right-click → Run as Administrator for steps that require elevation.
        </Callout>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB PS-1</span>
            <span className="text-sm font-semibold text-white">PowerShell Exploration & First Script</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">

            <LabStep number={1}
              description="Check your PowerShell version and explore the environment."
              command={CODE_POWERSHELLFUNDAMENTALS_8}
              output={CODE_POWERSHELLFUNDAMENTALS_9} />

            <LabStep number={2}
              description="Practice the discovery loop — find, learn, and use Get-Service."
              command={CODE_POWERSHELLFUNDAMENTALS_10}
              output={CODE_POWERSHELLFUNDAMENTALS_11} />

            <LabStep number={3}
              description="Explore object properties with Get-Member, then select specific ones."
              command={CODE_POWERSHELLFUNDAMENTALS_12}
            />

            <LabStep number={4}
              description="Write and run your first PowerShell script. Create it in C:\\Scripts\\."
              command={CODE_POWERSHELLFUNDAMENTALS_13}
              output={CODE_POWERSHELLFUNDAMENTALS_14} />

            <Callout type="success" icon="✅" title="Lab Complete">
              You've used the Help system, explored objects with Get-Member,
              worked with the pipeline, and written a functional server health script.
            </Callout>
          </div>
        </div>
      </section>

      {/* ── BEST PRACTICES ── */}
      <section>
        <h2>Best Practices</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: '📝', title: 'Always use approved verbs', desc: 'Run Get-Verb to see the full list. Using approved verbs makes your scripts discoverable and professional. Common verbs: Get, Set, New, Remove, Add, Start, Stop, Test, Invoke.' },
            { icon: '🛡️', title: 'Use -WhatIf and -Confirm', desc: 'All destructive cmdlets support these. Remove-Item -WhatIf shows what would be deleted without actually deleting. Add these to your scripts: [CmdletBinding(SupportsShouldProcess)].' },
            { icon: '⚠️', title: 'Always handle errors', desc: 'Use try/catch for critical operations. Set $ErrorActionPreference = "Stop" in scripts to make non-terminating errors terminating. Log errors with Write-Error or to a file.' },
            { icon: '📦', title: 'Use full parameter names in scripts', desc: 'In scripts, write -ComputerName not -CN. Abbreviations are fine interactively but make scripts harder to read and maintain.' },
            { icon: '🔍', title: 'Comment your scripts', desc: 'Use # for inline comments and <# ... #> for block comments. Add a comment block at the top of every script with purpose, author, date, and change log.' },
            { icon: '🔐', title: 'Never hardcode credentials', desc: 'Use Get-Credential, Windows Credential Manager, or Azure Key Vault. Never store passwords in plaintext in scripts — even encrypted with ConvertTo-SecureString (the key is the machine/user profile).' },
          ].map(p => (
            <div key={p.title} className="info-card py-4 flex gap-3">
              <span className="text-xl flex-shrink-0">{p.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white mb-1">{p.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUIZ ── */}
      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to earn bonus XP.</p>
        <Quiz lessonId="ps-01" title="PowerShell Fundamentals Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={25} />
      </section>
    </LessonLayout>
  )
}
