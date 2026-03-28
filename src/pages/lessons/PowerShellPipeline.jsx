import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_POWERSHELLPIPELINE_1 = `# Basic comparison filter
Get-Service | Where-Object { $_.Status -eq 'Running' }
Get-Process | Where-Object { $_.CPU -gt 10 }
Get-ChildItem C:\\Windows | Where-Object { $_.Length -gt 1MB }

# String matching
Get-Service | Where-Object { $_.DisplayName -like '*SQL*' }
Get-Service | Where-Object { $_.Name -match '^W' }       # regex: starts with W

# Simplified syntax (PowerShell 3+) — no $_ needed for single property
Get-Service | Where-Object Status -eq 'Stopped'
Get-Process | Where-Object CPU -gt 100

# Multiple conditions
Get-Process | Where-Object { $_.CPU -gt 10 -and $_.WorkingSet64 -gt 100MB }
Get-ChildItem C:\\Logs | Where-Object { $_.Extension -eq '.log' -and
                                        $_.LastWriteTime -lt (Get-Date).AddDays(-30) }

# Negation
Get-Service | Where-Object { $_.StartType -ne 'Disabled' }
Get-Process | Where-Object { $_.Name -notlike 'idle*' }`
const CODE_POWERSHELLPIPELINE_2 = `# Pick specific properties
Get-Process | Select-Object Name, Id, CPU, WorkingSet64

# Rename + calculated properties with hashtable syntax
Get-Process | Select-Object Name, Id,
  @{N='CPU(s)';    E={[math]::Round($_.CPU, 2)}},
  @{N='RAM(MB)';   E={[math]::Round($_.WorkingSet64 / 1MB, 1)}},
  @{N='Threads';   E={$_.Threads.Count}}

# Limit results
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10
Get-EventLog System | Select-Object -Last 20

# Extract raw values (no object wrapper)
Get-Process | Select-Object -ExpandProperty Name      # Returns string[]
(Get-Service Spooler).DependentServices | Select-Object -ExpandProperty Name

# Unique values (deduplicate)
Get-Process | Select-Object -Property Name -Unique

# Skip and First for pagination
Get-ChildItem C:\\ | Select-Object -Skip 5 -First 10`
const CODE_POWERSHELLPIPELINE_3 = `# Basic transformation
Get-Service | ForEach-Object { "Service: $($_.Name) — $($_.Status)" }

# With Begin, Process, End blocks (for setup/teardown)
Get-ChildItem C:\\Scripts -Filter *.ps1 |
  ForEach-Object -Begin   { $count = 0; "Starting scan..." }  
                 -Process { $count++; Write-Verbose $_.Name }  
                 -End      { "Found $count scripts" }

# Multi-step transformation — restart stopped services
Get-Service |
  Where-Object  { $_.StartType -eq 'Automatic' -and $_.Status -eq 'Stopped' } |
  ForEach-Object { Start-Service $_.Name; "$($_.Name) started" }

# Parallel execution (PowerShell 7+) — run on 5 hosts simultaneously
$servers = 'DC01','SRV01','SRV02','WEB01','WEB02'
$servers | ForEach-Object -Parallel {
  $result = Test-Connection $_ -Count 1 -Quiet
  [PSCustomObject]@{ Server=$_; Online=$result }
} -ThrottleLimit 5`
const CODE_POWERSHELLPIPELINE_4 = `# ── Sort-Object ────────────────────────────────────────────
Get-Process | Sort-Object CPU -Descending
Get-ChildItem C:\\Logs | Sort-Object LastWriteTime
Get-Process | Sort-Object CPU -Descending | Select-Object -First 5

# Multi-property sort
Get-ADUser -Filter * -Properties Department |
  Sort-Object Department, Surname

# ── Group-Object ────────────────────────────────────────────
# Group services by status — quick tally
Get-Service | Group-Object Status

# Group processes by company — count per vendor
Get-Process | Group-Object Company | Sort-Object Count -Descending |
  Select-Object Name, Count | Format-Table -AutoSize

# Group files by extension
Get-ChildItem C:\\Windows\\System32 -File |
  Group-Object Extension | Sort-Object Count -Descending |
  Select-Object -First 10

# ── Measure-Object ──────────────────────────────────────────
# Count files
Get-ChildItem C:\\Windows -Recurse -File | Measure-Object

# Total disk usage of a folder
Get-ChildItem C:\\Users -Recurse -File |
  Measure-Object Length -Sum |
  ForEach-Object { "$([math]::Round($_.Sum/1GB, 2)) GB" }

# CPU stats across all processes
Get-Process | Measure-Object CPU -Average -Maximum -Sum

# Count event log errors in the last hour
Get-EventLog System -EntryType Error -After (Get-Date).AddHours(-1) |
  Measure-Object | Select-Object Count`
const CODE_POWERSHELLPIPELINE_5 = `# ── Display formatting ──────────────────────────────────────
Get-Service | Format-Table -AutoSize                # Auto-fit columns
Get-Process | Format-Table Name, CPU -Wrap          # Wrap long values
Get-Service | Format-List *                         # All properties as list
Get-Process | Format-Wide Name -Column 4            # 4-column grid

# ── Export ──────────────────────────────────────────────────
# CSV (best for Excel / data analysis)
Get-Service | Export-Csv C:\\services.csv -NoTypeInformation

# JSON (best for APIs / automation)
Get-Service | Select-Object Name, Status, StartType |
  ConvertTo-Json | Out-File C:\\services.json

# HTML report
Get-Process | Select-Object Name, CPU, Id |
  Sort-Object CPU -Descending | Select-Object -First 20 |
  ConvertTo-Html -Title "Process Report" -PreContent "<h1>Top Processes</h1>" |
  Out-File C:\\report.html

# Grid view (interactive GUI table — perfect for quick analysis)
Get-Process | Out-GridView -Title "Running Processes" -PassThru |
  Stop-Process -WhatIf      # Select rows, pipe to another cmdlet!`
const CODE_POWERSHELLPIPELINE_6 = `# Top 5 processes by RAM
Get-Process | Sort-Object WorkingSet64 -Descending |
  Select-Object -First 5 Name,
    @{N='RAM(MB)';  E={[math]::Round($_.WorkingSet64/1MB,1)}},
    @{N='CPU(s)';   E={[math]::Round($_.CPU,2)}},
    @{N='Threads';  E={$_.Threads.Count}} |
  Format-Table -AutoSize`
const CODE_POWERSHELLPIPELINE_7 = `Name       RAM(MB)  CPU(s)  Threads
----       -------  ------  -------
lsass       156.2    12.4    28
svchost      98.7     4.1    42
dns          74.3     2.8    14
explorer     68.1     1.2    36
powershell   62.4     0.9    18`
const CODE_POWERSHELLPIPELINE_8 = `Get-Service |
  Where-Object { $_.StartType -eq 'Automatic' -and $_.Status -eq 'Stopped' } |
  Select-Object Name, DisplayName, StartType |
  Sort-Object Name |
  Format-Table -AutoSize`
const CODE_POWERSHELLPIPELINE_9 = `# Combine multiple data sources into one report object
$report = [PSCustomObject]@{
  ComputerName  = $env:COMPUTERNAME
  Timestamp     = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  TotalRAM_GB   = [math]::Round((Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
  FreeRAM_GB    = [math]::Round((Get-WmiObject Win32_OperatingSystem).FreePhysicalMemory / 1MB, 2)
  CPULoad_Pct   = (Get-WmiObject Win32_Processor | Measure-Object LoadPercentage -Average).Average
  FreeDisk_GB   = [math]::Round((Get-PSDrive C).Free / 1GB, 2)
  RunningServices = (Get-Service | Where-Object Status -eq 'Running' | Measure-Object).Count
  StoppedAuto   = (Get-Service | Where-Object { $_.StartType -eq 'Automatic' -and $_.Status -eq 'Stopped' } | Measure-Object).Count
}

# Export to CSV
$report | Export-Csv "C:\\HealthReport-$(Get-Date -Format yyyyMMdd).csv" -NoTypeInformation

# Display nicely
$report | Format-List
Write-Host "✔ Report saved" -ForegroundColor Green`
const CODE_POWERSHELLPIPELINE_10 = `ComputerName     : DC01
Timestamp        : 2025-01-15 10:45:22
TotalRAM_GB      : 4
FreeRAM_GB       : 1.82
CPULoad_Pct      : 8
FreeDisk_GB      : 42.7
RunningServices  : 67
StoppedAuto      : 3

✔ Report saved`
const CODE_POWERSHELLPIPELINE_11 = `# Service inventory grouped by start type
Get-Service |
  Group-Object StartType |
  Sort-Object Count -Descending |
  Select-Object @{N='StartType'; E={$_.Name}}, Count |
  Format-Table -AutoSize

# Then group running services by whether they have dependencies
Get-Service | Where-Object Status -eq 'Running' |
  Group-Object { if ($_.DependentServices.Count -gt 0) {'Has Dependents'} else {'No Dependents'} } |
  Select-Object Name, Count`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What does Where-Object do in a PowerShell pipeline?',
    options: [
      'Selects specific properties from objects',
      'Filters objects that match a condition, passing only matching ones downstream',
      'Sorts objects by a specified property',
      'Groups objects into collections by a property value',
    ],
    correct: 1,
    explanation: 'Where-Object filters the pipeline — only objects where the condition evaluates to $true are passed to the next command. Example: Get-Service | Where-Object { $_.Status -eq "Stopped" } passes only stopped services. Think of it as a WHERE clause in SQL. Its alias is "?" — so you can write Get-Service | ? { $_.Status -eq "Stopped" }.',
  },
  {
    id: 'q2',
    question: 'What is the output of: 1..5 | ForEach-Object { $_ * 2 }',
    options: [
      '1 2 3 4 5',
      '2 4 6 8 10',
      '10 (the sum)',
      '5 (the last value)',
    ],
    correct: 1,
    explanation: '1..5 generates the range [1,2,3,4,5]. ForEach-Object processes each item as $_, multiplying by 2. So each number is doubled: 2, 4, 6, 8, 10. The results are output as separate pipeline objects, displayed on separate lines. This is the functional equivalent of a foreach loop but composable in pipelines.',
  },
  {
    id: 'q3',
    question: 'Which Select-Object parameter creates a calculated property with a custom label?',
    options: [
      '-Property with a string array',
      '-Expand with the property name',
      '-Property with a hashtable @{Name=\'Label\'; Expression={...}}',
      '-Calculated with the expression scriptblock',
    ],
    correct: 2,
    explanation: 'Calculated properties use a hashtable with Name (or Label/N/L) and Expression (or E) keys: Select-Object @{N="SizeMB"; E={[math]::Round($_.Length/1MB,2)}}. This is extremely powerful for transforming data on the fly — renaming properties, computing values, combining fields — without modifying the original object.',
  },
  {
    id: 'q4',
    question: 'What does the -ExpandProperty parameter of Select-Object do?',
    options: [
      'Expands compressed objects into their full representation',
      'Extracts the values of a single property, returning them as raw values instead of objects',
      'Shows all hidden and extended properties of an object',
      'Increases the display width of the property column',
    ],
    correct: 1,
    explanation: 'Select-Object -ExpandProperty PropertyName extracts the raw values of that property — stripping away the object wrapper. For example: Get-Process | Select-Object -ExpandProperty Name returns plain strings, not objects with a Name property. This is essential when you need raw values to pass to cmdlets that accept strings, not objects.',
  },
  {
    id: 'q5',
    question: 'What is the purpose of Group-Object in the PowerShell pipeline?',
    options: [
      'Groups multiple commands together to run as a batch',
      'Organises objects into groups based on a shared property value, outputting group name and count',
      'Merges two object arrays into a single combined array',
      'Creates a grouping of errors for batch error handling',
    ],
    correct: 1,
    explanation: 'Group-Object groups input objects by a property value and returns a collection where each element has a Name (the group value), Count (how many), and Group (the actual objects). Example: Get-Service | Group-Object Status shows how many services are Running, Stopped, etc. Extremely useful for quick aggregation and frequency analysis.',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info: 'callout-info', warning: 'callout-warning', success: 'callout-success', danger: 'callout-danger' }
  return (
    <div className={`callout ${s[type]}`}>
      <span className="callout-icon">{icon}</span>
      <div className="callout-body">{title && <strong>{title} — </strong>}{children}</div>
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

export default function PowerShellPipeline() {
  return (
    <LessonLayout
      lessonId="ps-02"
      courseId="powershell"
      title="Working with Objects & the Pipeline"
      courseTitle="PowerShell"
      courseHref="/powershell"
      xp={70}
      readTime="~30 min"
      icon="🔗"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'PowerShell', href: '/powershell' },
        { label: 'Objects & the Pipeline' },
      ]}
      prev={{ title: 'PowerShell Fundamentals',        href: '/powershell/fundamentals' }}
      next={{ title: 'Scripts, Functions & Modules',   href: '/powershell/scripting' }}
      objectives={[
        'Master the five core pipeline cmdlets: Where-Object, Select-Object, ForEach-Object, Sort-Object, Group-Object',
        'Build multi-stage pipelines that filter, transform, and aggregate data',
        'Create calculated properties with hashtable expressions',
        'Use Measure-Object for fast statistics on any object set',
        'Chain pipelines into real sysadmin one-liners',
        'Format and export pipeline output to CSV, JSON, and HTML',
      ]}
    >
      {/* ── OVERVIEW ── */}
      <section>
        <h2>Overview</h2>
        <p>
          The PowerShell pipeline is what separates it from every other shell. Because
          it passes structured <strong>.NET objects</strong> — not text — between commands,
          you can filter by property value, transform data on the fly, compute statistics,
          and export structured output without a single line of string parsing.
        </p>
        <p className="mt-4">
          This lesson covers the five cmdlets you'll use in nearly every pipeline you
          ever write, then shows how to chain them into the kind of one-liners that make
          your colleagues ask "how did you do that in 30 seconds?"
        </p>
        <Callout type="info" icon="💡" title="The pipeline mental model">
          Think of it as a conveyor belt. Each cmdlet is a worker who receives objects,
          does something to them (filters, transforms, or aggregates), and passes results to
          the next worker. The final worker either displays the output or sends it somewhere.
        </Callout>
      </section>

      {/* ── THE FIVE CORE CMDLETS ── */}
      <section>
        <h2>The Five Core Pipeline Cmdlets</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {[
            { cmdlet: 'Where-Object',    alias: '? or where', icon: '🔍', color: 'text-brand-300',    desc: 'Filter — keep only objects that match a condition. Think SQL WHERE clause.' },
            { cmdlet: 'Select-Object',   alias: 'select',     icon: '🎯', color: 'text-accent-cyan',  desc: 'Project — choose which properties to show, add calculated ones, or limit count.' },
            { cmdlet: 'ForEach-Object',  alias: '% or foreach',icon: '🔄', color: 'text-accent-green', desc: 'Transform — run a script block for each object. Think SQL CASE or a loop.' },
            { cmdlet: 'Sort-Object',     alias: 'sort',       icon: '⬆️', color: 'text-accent-amber', desc: 'Order — sort objects by one or more property values, ascending or descending.' },
            { cmdlet: 'Group-Object',    alias: 'group',      icon: '📦', color: 'text-accent-purple', desc: 'Aggregate — group objects by property value, showing name and count per group.' },
            { cmdlet: 'Measure-Object',  alias: 'measure',    icon: '📊', color: 'text-orange-400',   desc: 'Statistics — count, sum, average, min, max of any numeric property.' },
          ].map(c => (
            <div key={c.cmdlet} className="info-card py-4">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-xl flex-shrink-0">{c.icon}</span>
                <div>
                  <code className={`font-mono text-sm font-bold ${c.color}`}>{c.cmdlet}</code>
                  <span className="text-[10px] text-slate-600 font-mono ml-2">({c.alias})</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHERE-OBJECT ── */}
      <section>
        <h2>Where-Object — Filtering the Pipeline</h2>
        <CodeBlock title="Where-Object patterns" language="powershell" code={CODE_POWERSHELLPIPELINE_1} />
      </section>

      {/* ── SELECT-OBJECT ── */}
      <section>
        <h2>Select-Object — Shaping the Output</h2>
        <CodeBlock title="Select-Object patterns — including calculated properties" language="powershell" code={CODE_POWERSHELLPIPELINE_2} />
      </section>

      {/* ── FOREACH-OBJECT ── */}
      <section>
        <h2>ForEach-Object — Transforming Every Item</h2>
        <CodeBlock title="ForEach-Object patterns" language="powershell" code={CODE_POWERSHELLPIPELINE_3} />
      </section>

      {/* ── SORT + GROUP + MEASURE ── */}
      <section>
        <h2>Sort, Group & Measure</h2>
        <CodeBlock title="Aggregation pipeline patterns" language="powershell" code={CODE_POWERSHELLPIPELINE_4} />
      </section>

      {/* ── REAL-WORLD PIPELINES ── */}
      <section>
        <h2>Real-World Sysadmin One-Liners</h2>
        <div className="space-y-4 mt-4">
          {[
            {
              label: 'Top 5 memory consumers',
              code: `Get-Process | Sort-Object WorkingSet64 -Descending |
  Select-Object -First 5 Name,
    @{N='RAM(MB)'; E={[math]::Round($_.WorkingSet64/1MB,1)}} |
  Format-Table -AutoSize`,
            },
            {
              label: 'Services set to auto-start but currently stopped',
              code: `Get-Service |
  Where-Object { $_.StartType -eq 'Automatic' -and $_.Status -eq 'Stopped' } |
  Select-Object Name, DisplayName, Status |
  Format-Table -AutoSize`,
            },
            {
              label: 'Files modified in the last 24 hours, sorted by size',
              code: `Get-ChildItem C:\\ -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.LastWriteTime -gt (Get-Date).AddDays(-1) } |
  Sort-Object Length -Descending |
  Select-Object FullName, @{N='Size(KB)'; E={[math]::Round($_.Length/1KB,1)}},
    LastWriteTime |
  Select-Object -First 20`,
            },
            {
              label: 'Event log error summary — count per source, last 24 hours',
              code: `Get-EventLog System -EntryType Error -After (Get-Date).AddHours(-24) |
  Group-Object Source |
  Sort-Object Count -Descending |
  Select-Object @{N='Source'; E={$_.Name}}, Count |
  Format-Table -AutoSize`,
            },
            {
              label: 'Export full process report to CSV',
              code: `Get-Process |
  Select-Object Name, Id,
    @{N='CPU(s)';  E={[math]::Round($_.CPU,2)}},
    @{N='RAM(MB)'; E={[math]::Round($_.WorkingSet64/1MB,1)}},
    @{N='Threads'; E={$_.Threads.Count}},
    StartTime |
  Sort-Object 'RAM(MB)' -Descending |
  Export-Csv "C:\\Reports\\processes-$(Get-Date -Format yyyyMMdd-HHmm).csv" -NoTypeInformation
Write-Host "Report saved" -ForegroundColor Green`,
            },
          ].map(p => (
            <div key={p.label}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="text-accent-amber">▸</span>{p.label}
              </p>
              <CodeBlock code={p.code} language="powershell" showCopy />
            </div>
          ))}
        </div>
      </section>

      {/* ── OUTPUT FORMATTING ── */}
      <section>
        <h2>Formatting & Exporting Output</h2>
        <CodeBlock title="Output destinations" language="powershell" code={CODE_POWERSHELLPIPELINE_5} />
      </section>

      {/* ── VMware LAB ── */}
      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB PS-2</span>
            <span className="text-sm font-semibold text-white">Build a Server Health Report Pipeline</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Run pipeline queries to understand DC01's resource usage."
              command={CODE_POWERSHELLPIPELINE_6}
              output={CODE_POWERSHELLPIPELINE_7}
            />
            <LabStep number={2}
              description="Find all automatic services that are stopped — a key health check."
              command={CODE_POWERSHELLPIPELINE_8}
            />
            <LabStep number={3}
              description="Build a full server health report and export it as CSV and HTML."
              command={CODE_POWERSHELLPIPELINE_9}
              output={CODE_POWERSHELLPIPELINE_10}
            />
            <LabStep number={4}
              description="Use Group-Object to get a breakdown of services by start type."
              command={CODE_POWERSHELLPIPELINE_11}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to earn bonus XP.</p>
        <Quiz lessonId="ps-02" title="Objects & the Pipeline Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={35} />
      </section>
    </LessonLayout>
  )
}
