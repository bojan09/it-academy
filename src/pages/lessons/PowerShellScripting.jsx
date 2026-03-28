import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_POWERSHELLSCRIPTING_1 = `<#
.SYNOPSIS
    Tests connectivity to a list of servers and reports status.

.DESCRIPTION
    Pings each server and optionally tests a specific TCP port.
    Returns structured objects suitable for Export-Csv or further pipeline processing.

.PARAMETER ComputerName
    One or more server names or IP addresses to test.

.PARAMETER Port
    Optional TCP port to test. If omitted, only ICMP ping is performed.

.EXAMPLE
    Test-ServerConnectivity -ComputerName DC01,SRV01

.EXAMPLE
    'DC01','SRV01','WEB01' | Test-ServerConnectivity -Port 443
#>
function Test-ServerConnectivity {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory, ValueFromPipeline, ValueFromPipelineByPropertyName)]
        [ValidateNotNullOrEmpty()]
        [string[]]$ComputerName,

        [Parameter()]
        [ValidateRange(1, 65535)]
        [int]$Port
    )

    process {
        foreach ($computer in $ComputerName) {
            Write-Verbose "Testing $computer..."

            $result = [PSCustomObject]@{
                ComputerName = $computer
                PingStatus   = 'Unknown'
                PortStatus   = 'NotTested'
                Timestamp    = Get-Date
            }

            # Test ICMP
            try {
                $ping = Test-Connection $computer -Count 1 -ErrorAction Stop
                $result.PingStatus = 'Online'
                Write-Verbose "  Ping OK: $($ping.Latency)ms"
            }
            catch {
                $result.PingStatus = 'Offline'
                Write-Warning "Cannot reach $computer: $($_.Exception.Message)"
            }

            # Test TCP port if requested
            if ($Port -and $result.PingStatus -eq 'Online') {
                $tcp = Test-NetConnection -ComputerName $computer -Port $Port -WarningAction SilentlyContinue
                $result.PortStatus = if ($tcp.TcpTestSucceeded) { "Open" } else { "Closed" }
            }

            # Emit to pipeline
            $result
        }
    }
}`
const CODE_POWERSHELLSCRIPTING_2 = `# Pattern 1: Catch specific error types
try {
    $user = Get-ADUser -Identity 'jsmith' -ErrorAction Stop
    Set-ADUser -Identity $user -Description 'Updated'
}
catch [Microsoft.ActiveDirectory.Management.ADIdentityNotFoundException] {
    Write-Warning "User jsmith not found in AD"
}
catch {
    # Catch-all for unexpected errors
    Write-Error "Unexpected error: $($_.Exception.Message)"
    Write-Error "Stack trace: $($_.ScriptStackTrace)"
}
finally {
    # Runs whether error occurred or not — good for cleanup
    Write-Verbose "Operation complete"
}

# Pattern 2: Retry logic for transient failures
function Invoke-WithRetry {
    param([scriptblock]$ScriptBlock, [int]$MaxAttempts = 3, [int]$DelaySeconds = 5)

    $attempt = 0
    do {
        $attempt++
        try {
            & $ScriptBlock
            return  # Success — exit
        }
        catch {
            if ($attempt -ge $MaxAttempts) { throw }
            Write-Warning "Attempt $attempt failed. Retrying in \${DelaySeconds}s..."
            Start-Sleep -Seconds $DelaySeconds
        }
    } while ($attempt -lt $MaxAttempts)
}`
const CODE_POWERSHELLSCRIPTING_3 = `# Module directory structure:
# C:\\Users\\Admin\\Documents\\PowerShell\\Modules\\ServerTools\\
#   ServerTools.psm1    <- module functions
#   ServerTools.psd1   <- module manifest (metadata)

# ── ServerTools.psm1 ─────────────────────────────────────────
function Get-ServerHealth {
    [CmdletBinding()]
    param([string]$ComputerName = $env:COMPUTERNAME)

    [PSCustomObject]@{
        ComputerName = $ComputerName
        CPU_Pct      = (Get-WmiObject Win32_Processor -ComputerName $ComputerName |
                           Measure-Object LoadPercentage -Average).Average
        FreeRAM_GB   = [math]::Round(
                           (Get-WmiObject Win32_OperatingSystem -ComputerName $ComputerName).FreePhysicalMemory / 1MB, 2)
        FreeDisk_GB  = [math]::Round((Get-PSDrive C).Free / 1GB, 1)
    }
}

function Restart-ServiceSafely {
    [CmdletBinding(SupportsShouldProcess)]
    param([Parameter(Mandatory)][string]$Name)

    if ($PSCmdlet.ShouldProcess($Name, 'Restart service')) {
        Restart-Service -Name $Name -Force
        Write-Output "Service '$Name' restarted successfully"
    }
}

# Only export these functions (hide internal helpers)
Export-ModuleMember -Function Get-ServerHealth, Restart-ServiceSafely

# ── Create manifest ───────────────────────────────────────────
New-ModuleManifest -Path ServerTools.psd1 \\
  -RootModule 'ServerTools.psm1' \\
  -ModuleVersion '1.0.0' \\
  -Author 'SysAdmin' \\
  -Description 'Server health and management utilities' \\
  -FunctionsToExport 'Get-ServerHealth','Restart-ServiceSafely'

# ── Using the module ──────────────────────────────────────────
Import-Module ServerTools
Get-ServerHealth -ComputerName DC01
Restart-ServiceSafely -Name Spooler -WhatIf`
const CODE_POWERSHELLSCRIPTING_4 = `$modulePath = '$env:USERPROFILE\\Documents\\PowerShell\\Modules\\ServerAudit'
New-Item -Path $modulePath -ItemType Directory -Force
Write-Host "Module path: $modulePath"`
const CODE_POWERSHELLSCRIPTING_5 = `$moduleContent = @'
function Get-SystemSummary {
    [CmdletBinding()]
    param([string]$ComputerName = $env:COMPUTERNAME)
    $os  = Get-WmiObject Win32_OperatingSystem -ComputerName $ComputerName
    $cpu = Get-WmiObject Win32_Processor -ComputerName $ComputerName
    [PSCustomObject]@{
        Computer   = $ComputerName
        OS         = $os.Caption
        Uptime_hrs = [math]::Round(($os.ConvertToDateTime($os.LocalDateTime) -
                       $os.ConvertToDateTime($os.LastBootUpTime)).TotalHours, 1)
        CPU_Model  = $cpu.Name.Trim()
        RAM_GB     = [math]::Round($os.TotalVisibleMemorySize / 1MB, 1)
        FreeRAM_GB = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
    }
}

function Get-FailedServices {
    [CmdletBinding()]
    param([string]$ComputerName = $env:COMPUTERNAME)
    Get-Service -ComputerName $ComputerName |
        Where-Object { $_.StartType -eq 'Automatic' -and $_.Status -eq 'Stopped' } |
        Select-Object Name, DisplayName, Status, StartType
}

Export-ModuleMember -Function Get-SystemSummary, Get-FailedServices
'@

Set-Content -Path "$modulePath\\ServerAudit.psm1" -Value $moduleContent
Write-Host 'Module file written'`
const CODE_POWERSHELLSCRIPTING_6 = `Import-Module ServerAudit -Force

# Test Get-SystemSummary
Get-SystemSummary | Format-List

# Test Get-FailedServices
Get-FailedServices | Format-Table -AutoSize`
const CODE_POWERSHELLSCRIPTING_7 = `Computer   : DC01
OS         : Windows Server 2025 Standard Evaluation
Uptime_hrs : 4.2
CPU_Model  : Intel(R) Core(TM) i7-10700 CPU
RAM_GB     : 4
FreeRAM_GB : 1.82`
const CODE_POWERSHELLSCRIPTING_8 = `$servers = @('DC01')

$report = $servers | ForEach-Object {
    try {
        Get-SystemSummary -ComputerName $_ -ErrorAction Stop
    }
    catch {
        [PSCustomObject]@{ Computer=$_; OS='UNREACHABLE'; Error=$_.Exception.Message }
    }
}

$report | Export-Csv 'C:\\ServerAudit.csv' -NoTypeInformation
$report | Format-Table -AutoSize
Write-Host "Report saved to C:\\ServerAudit.csv"`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the purpose of the [CmdletBinding()] attribute in a PowerShell function?',
    options: [
      'It makes the function available globally across all sessions',
      'It promotes a simple function to an advanced function, enabling -Verbose, -Debug, -WhatIf, -ErrorAction, and other common parameters automatically',
      'It compiles the function to native code for better performance',
      'It restricts who can call the function based on AD group membership',
    ],
    correct: 1,
    explanation: '[CmdletBinding()] turns a basic function into an advanced function (cmdlet-like). It automatically adds: -Verbose, -Debug, -ErrorAction, -ErrorVariable, -WarningAction, -InformationAction, -OutVariable, -OutBuffer, -PipelineVariable. It also enables SupportsShouldProcess for -WhatIf and -Confirm support. Always add it to production functions.',
  },
  {
    id: 'q2',
    question: 'What does param([Parameter(Mandatory=$true)] [string]$ComputerName) do?',
    options: [
      'Sets ComputerName to a default value of $true',
      'Declares a required string parameter — PowerShell will prompt for it if not supplied',
      'Creates a boolean parameter named ComputerName',
      'Marks the parameter as deprecated and shows a warning',
    ],
    correct: 1,
    explanation: 'Mandatory=$true means PowerShell will stop execution and prompt the user if this parameter is not provided. [string] enforces the type — passing a non-string will either cast or error. Combine with [ValidateNotNullOrEmpty()] to also reject empty strings. Other useful validators: [ValidateRange(1,65535)], [ValidateSet("A","B","C")].',
  },
  {
    id: 'q3',
    question: 'What is the difference between a PowerShell module (.psm1) and a script (.ps1)?',
    options: [
      'There is no difference — both are plain text files with PowerShell code',
      'A .ps1 script runs sequentially; a .psm1 module exposes reusable functions that persist in memory after being imported',
      'Modules require signing; scripts do not',
      'Scripts run as administrator; modules run as standard user',
    ],
    correct: 1,
    explanation: 'A .ps1 script executes top-to-bottom and its functions disappear after it finishes. A .psm1 module exposes named functions via Export-ModuleMember that remain available after Import-Module. Modules also support versioning via a .psd1 manifest, dependency declarations, and automatic loading (PowerShell 3+ auto-discovers modules in $env:PSModulePath).',
  },
  {
    id: 'q4',
    question: 'What is the correct way to handle expected errors in PowerShell while still catching unexpected ones?',
    options: [
      'Set $ErrorActionPreference = "SilentlyContinue" to ignore all errors',
      'Use -ErrorAction SilentlyContinue on the specific command that may fail, then check $? or use try/catch for critical paths',
      'Wrap everything in if ($error) {} blocks',
      'Use $Error.Clear() before each command to reset the error buffer',
    ],
    correct: 1,
    explanation: 'Use -ErrorAction SilentlyContinue on specific commands where failure is expected and acceptable (e.g., checking if something exists). For critical operations, use try/catch with -ErrorAction Stop to convert non-terminating errors to terminating ones that can be caught. Never use global $ErrorActionPreference = "SilentlyContinue" as it hides real errors.',
  },
  {
    id: 'q5',
    question: 'How do you make a function write to the pipeline so it can be used with | Select-Object, | Where-Object etc.?',
    options: [
      'Return objects using the return keyword followed by a hashtable',
      'Use Write-Output or simply place objects/expressions without assignment — they flow to the pipeline automatically',
      'Call Write-Pipeline with the object you want to emit',
      'Functions cannot emit to the pipeline — use global variables instead',
    ],
    correct: 1,
    explanation: 'In PowerShell, any expression or object that is not captured by a variable or redirected automatically flows to the pipeline (output stream). Write-Output is explicit but optional. The return keyword works too but exits the function immediately. To emit multiple objects: use a loop and output each item. Use [PSCustomObject]@{} to create structured objects that work well with Select-Object and Export-Csv.',
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

export default function PowerShellScripting() {
  return (
    <LessonLayout
      lessonId="ps-03"
      courseId="powershell"
      title="Scripts, Functions & Modules"
      courseTitle="PowerShell"
      courseHref="/powershell"
      xp={80}
      readTime="~35 min"
      icon="📝"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'PowerShell', href: '/powershell' },
        { label: 'Scripts, Functions & Modules' },
      ]}
      prev={{ title: 'Objects & the Pipeline',       href: '/powershell/pipeline' }}
      next={{ title: 'Active Directory Automation',  href: '/powershell/active-directory' }}
      objectives={[
        'Write production-quality functions with parameters and validation',
        'Use [CmdletBinding()] to create advanced functions',
        'Implement proper error handling with try/catch',
        'Structure reusable scripts with regions and comment-based help',
        'Build and import a PowerShell module',
        'Use -WhatIf and -Confirm for safe destructive operations',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Moving from interactive commands to reusable scripts and modules is the step that
          transforms a PowerShell user into a PowerShell developer. Production scripts need
          robust parameter handling, proper error management, and clear documentation — not
          just a list of commands that work on your machine.
        </p>
        <Callout type="info" icon="💡" title="The golden rule">
          Every script you write should be readable and runnable by someone who has never
          seen it before. Parameters over hard-coded values. Comment-based help over guesswork.
          -WhatIf over regret.
        </Callout>
      </section>

      <section>
        <h2>Advanced Functions — The Production Standard</h2>
        <p>
          The difference between a basic function and an advanced function is
          <code className="font-mono text-accent-cyan text-sm mx-1">[CmdletBinding()]</code>.
          This single attribute gives you the full cmdlet experience.
        </p>
        <CodeBlock title="Production-quality advanced function template" language="powershell"
          code={CODE_POWERSHELLSCRIPTING_1} />
      </section>

      <section>
        <h2>Error Handling Patterns</h2>
        <CodeBlock title="try/catch — the right way" language="powershell"
          code={CODE_POWERSHELLSCRIPTING_2} />
      </section>

      <section>
        <h2>Building a PowerShell Module</h2>
        <p>
          A module bundles related functions so you can
          <code className="font-mono text-accent-cyan text-sm mx-1">Import-Module ServerTools</code>
          and have all your utility functions available — in any script, any session.
        </p>
        <CodeBlock title="Module structure and creation" language="powershell"
          code={CODE_POWERSHELLSCRIPTING_3} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB PS-3</span>
            <span className="text-sm font-semibold text-white">Build and Deploy a Server Audit Module</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~25 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Create the module directory structure on DC01."
              command={CODE_POWERSHELLSCRIPTING_4}
              output="Module path: C:\\Users\\Administrator\\Documents\\PowerShell\\Modules\\ServerAudit"
            />
            <LabStep number={2}
              description="Write the module file with three audit functions."
              command={CODE_POWERSHELLSCRIPTING_5}
              output="Module file written"
            />
            <LabStep number={3}
              description="Import and test the module."
              command={CODE_POWERSHELLSCRIPTING_6}
              output={CODE_POWERSHELLSCRIPTING_7}
            />
            <LabStep number={4}
              description="Run the full audit across multiple servers and export to CSV."
              command={CODE_POWERSHELLSCRIPTING_8}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="ps-03" title="Scripts, Functions & Modules Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={40} />
      </section>
    </LessonLayout>
  )
}
