import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_PSFILESYSTEM_1 = `# ── Navigation ───────────────────────────────────────────────
Set-Location C:\\Windows\\System32     # cd
Get-Location                          # pwd
Push-Location C:\\Temp ; Pop-Location  # cd with stack

# ── Listing ──────────────────────────────────────────────────
Get-ChildItem C:\\Logs -Recurse -Filter '*.log' |
  Select-Object Name, Length, LastWriteTime |
  Sort-Object LastWriteTime -Descending |
  Format-Table -AutoSize

# ── Copy, Move, Delete ───────────────────────────────────────
Copy-Item C:\\Source\\* C:\\Dest -Recurse -Force
Move-Item C:\\Old\\*.bak C:\\Archive\\
Remove-Item C:\\Temp\\* -Recurse -Force -WhatIf   # preview first!

# ── Create ───────────────────────────────────────────────────
New-Item -Path C:\\NewFolder -ItemType Directory -Force
New-Item -Path C:\\NewFolder\\config.txt -ItemType File
Set-Content -Path C:\\app\\version.txt -Value '1.2.0'
Add-Content -Path C:\\app\\app.log -Value "[$(Get-Date)] Started"

# ── Search content ───────────────────────────────────────────
Select-String -Path C:\\Logs\\*.log -Pattern 'ERROR' -CaseSensitive |
  Select-Object FileName, LineNumber, Line |
  Export-Csv C:\\error-report.csv -NoTypeInformation`
const CODE_PSFILESYSTEM_2 = `# Archive logs older than 30 days, delete older than 90
$logPath    = 'C:\\Logs'
$archivePath = 'D:\\LogArchive'
$archiveCutoff = (Get-Date).AddDays(-30)
$deleteCutoff  = (Get-Date).AddDays(-90)

# Create archive directory
New-Item -Path $archivePath -ItemType Directory -Force | Out-Null

Get-ChildItem -Path $logPath -Filter '*.log' -Recurse | ForEach-Object {
    if ($_.LastWriteTime -lt $deleteCutoff) {
        Remove-Item $_.FullName -Force
        Write-Host "Deleted: $($_.Name)" -ForegroundColor Red
    }
    elseif ($_.LastWriteTime -lt $archiveCutoff) {
        $dest = Join-Path $archivePath $_.Name
        Compress-Archive -Path $_.FullName -DestinationPath "$dest.zip" -Force
        Remove-Item $_.FullName -Force
        Write-Host "Archived: $($_.Name)" -ForegroundColor Yellow
    }
}`
const CODE_PSFILESYSTEM_3 = `# ── Read registry values ─────────────────────────────────────
# Read a single value
Get-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion' \`\`
  -Name ProductName

# Read all values in a key
Get-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'

# ── Write registry values ────────────────────────────────────
# Create key and set a string value
New-Item -Path 'HKLM:\\SOFTWARE\\MyApp' -Force | Out-Null
Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\MyApp' \`\`
  -Name 'Version' -Value '2.0.0' -Type String

# Set a DWORD (integer) value
Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\MyApp' \`\`
  -Name 'MaxConnections' -Value 100 -Type DWord

# ── Useful registry paths ────────────────────────────────────
# Installed software (64-bit)
Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*' |
  Select-Object DisplayName, DisplayVersion, Publisher |
  Where-Object DisplayName | Sort-Object DisplayName |
  Format-Table -AutoSize

# Startup programs
Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run'

# ── Delete registry key ──────────────────────────────────────
Remove-Item -Path 'HKLM:\\SOFTWARE\\MyApp' -Recurse -Force`
const CODE_PSFILESYSTEM_4 = `Write-Host '=== Top 10 Largest Files on C: ==='
Get-ChildItem C:\\ -Recurse -File -ErrorAction SilentlyContinue |
  Sort-Object Length -Descending |
  Select-Object -First 10 |
  Select-Object FullName,
    @{N='Size_MB'; E={[math]::Round($_.Length / 1MB, 1)}},
    LastWriteTime |
  Format-Table -AutoSize`
const CODE_PSFILESYSTEM_5 = `FullName                                          Size_MB  LastWriteTime
--------                                          -------  -------------
C:\\Windows\\System32\\MRT.exe                       148.2    01/10/2025
C:\\Windows\\SoftwareDistribution\\Download\\...       98.7    01/14/2025
C:\\Windows\\WinSxS\\...\\amd64_microsoft-...          67.3    01/01/2025`
const CODE_PSFILESYSTEM_6 = `$runKeys = @(
    'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run',
    'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run'
)

foreach ($key in $runKeys) {
    Write-Host "\`n=== $key ==="
    $props = Get-ItemProperty $key -ErrorAction SilentlyContinue
    if ($props) {
        $props.PSObject.Properties |
            Where-Object { $_.Name -notlike 'PS*' } |
            Select-Object Name, Value |
            Format-Table -AutoSize
    } else { Write-Host '  (empty)' }
}`
const CODE_PSFILESYSTEM_7 = `=== HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run ===
Name            Value
----            -----
SecurityHealth  C:\\Windows\\System32\\SecurityHealthSystray.exe

=== HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run ===
  (empty)`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What does Get-ChildItem -Recurse -Filter "*.log" -Path C:\\Logs do?',
    options: [
      'Lists only .log files in C:\\Logs without recursing into subfolders',
      'Recursively lists all .log files under C:\\Logs and all its subfolders, returning FileInfo objects with full path, size, and date properties',
      'Deletes all .log files older than a week',
      'Counts the number of log files and returns an integer',
    ],
    correct: 1,
    explanation: '-Recurse traverses all subdirectories. -Filter uses the filesystem provider\'s native filtering (faster than Where-Object). The result is a collection of FileInfo objects — you can pipe to Select-Object Name, FullName, Length, LastWriteTime or process each with ForEach-Object. For large trees, add -Depth 3 to limit recursion depth.',
  },
  {
    id: 'q2',
    question: 'What is the safest way to delete files matching a pattern using PowerShell?',
    options: [
      'Remove-Item C:\\Logs\\*.log -Force',
      'First run Get-ChildItem with your filter and -WhatIf, verify output, then pipe to Remove-Item -WhatIf, then remove -WhatIf to execute',
      'Use del *.log in a PowerShell session',
      'Move files to Recycle Bin first using Shell.Application COM object',
    ],
    correct: 1,
    explanation: 'The -WhatIf flag on Remove-Item shows exactly what would be deleted without deleting anything. Always preview destructive operations: Get-ChildItem -Path C:\\Logs -Filter "*.log" -Recurse | Remove-Item -WhatIf. When satisfied with the output, remove -WhatIf to execute. For extra safety add -Confirm to prompt for each file, or pipe to a Where-Object first to add age/size filters.',
  },
  {
    id: 'q3',
    question: 'What does New-Item -Path "HKLM:\\SOFTWARE\\MyApp" -Force do?',
    options: [
      'Creates a new file at that Windows path',
      'Creates a new Registry key at HKEY_LOCAL_MACHINE\\SOFTWARE\\MyApp, creating parent keys if needed due to -Force',
      'Overwrites an existing registry key with default values',
      'Forces a registry scan to find the key',
    ],
    correct: 1,
    explanation: 'PowerShell\'s registry provider exposes the registry as a drive (HKLM:, HKCU:, etc.). New-Item creates registry keys (like folders). New-ItemProperty creates values within a key. -Force creates parent keys if they don\'t exist. Access: Get-Item, Set-Item, Remove-Item all work on registry paths the same way as filesystem paths — this is the PSDrive abstraction at work.',
  },
  {
    id: 'q4',
    question: 'How do you efficiently find all files larger than 100MB on a drive?',
    options: [
      'Get-ChildItem C:\\ -Recurse | Where-Object { $_.Length -gt 104857600 }',
      'dir /s /b C:\\ | Where-Object Length',
      'Find-LargeFiles -Size 100MB',
      'Get-Disk | Where-Object Size -gt 100MB',
    ],
    correct: 0,
    explanation: 'Get-ChildItem returns FileInfo objects with a Length property in bytes. 100MB = 100 * 1024 * 1024 = 104,857,600 bytes. Pipe to Where-Object {$_.Length -gt 100MB} — PowerShell understands MB/GB literals. Add -File to exclude directories. Sort by size: | Sort-Object Length -Descending | Select-Object -First 20 | Select-Object FullName, @{N="Size_MB";E={[math]::Round($_.Length/1MB,1)}}',
  },
  {
    id: 'q5',
    question: 'What is the purpose of Get-ItemProperty in the registry PSDrive?',
    options: [
      'Gets file system attributes like Hidden, ReadOnly, Archive',
      'Reads registry values (REG_SZ, REG_DWORD, REG_MULTI_SZ etc.) from a registry key — equivalent to reading value entries in regedit',
      'Gets Active Directory object properties',
      'Returns the properties of a running process',
    ],
    correct: 1,
    explanation: 'Get-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion" reads all values in that registry key. Specify -Name to read a single value. Set-ItemProperty writes a value. New-ItemProperty creates a new value with a specified type (-PropertyType String/DWord/Binary etc.). Remove-ItemProperty deletes a value. This is the PowerShell way to read/write the registry without falling back to reg.exe.',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info:'callout-info', warning:'callout-warning', success:'callout-success', danger:'callout-danger' }
  return (
    <div className={`callout ${s[type]}`}>
      <span className="callout-icon">{icon}</span>
      <div className="callout-body">{title && <strong>{title}</strong>}{children}</div>
    </div>
  )
}

function LabStep({ number, description, command, language='powershell', output }) {
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
          {output.split('\n').map((l,i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  )
}

export default function PSFilesystem() {
  return (
    <LessonLayout
      lessonId="ps-06"
      courseId="powershell"
      title="File System & Registry Automation"
      courseTitle="PowerShell"
      courseHref="/powershell"
      xp={70}
      readTime="~30 min"
      icon="📁"
      breadcrumbs={[
        { label:'Home', href:'/' },
        { label:'PowerShell', href:'/powershell' },
        { label:'File System & Registry Automation' },
      ]}
      prev={{ title:'Remote Management (PSRemoting)', href:'/powershell/remoting' }}
      next={{ title:'Desired State Configuration',    href:'/powershell/dsc' }}
      objectives={[
        'Navigate and manipulate the filesystem with Get-ChildItem, Copy-Item, Move-Item',
        'Search file content recursively with Select-String',
        'Automate log cleanup and archiving with date-based filters',
        'Read and write the Windows Registry using the HKLM: PSDrive',
        'Compare directory trees and find differences with Compare-Object',
        'Build a disk usage report script',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          PowerShell treats the filesystem, registry, environment variables, and
          certificate stores as interchangeable <em>drives</em> via the PSDrive
          system. The same commands you use to browse files work on the registry —
          dramatically reducing the number of tools you need to know.
        </p>
      </section>

      <section>
        <h2>Filesystem Operations</h2>
        <CodeBlock title="Essential filesystem cmdlets" language="powershell"
          code={CODE_PSFILESYSTEM_1} />
      </section>

      <section>
        <h2>Date-Based Log Cleanup</h2>
        <CodeBlock title="Automated log archiving and cleanup" language="powershell"
          code={CODE_PSFILESYSTEM_2} />
      </section>

      <section>
        <h2>Registry Automation</h2>
        <CodeBlock title="Reading and writing the Windows Registry" language="powershell"
          code={CODE_PSFILESYSTEM_3} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB PS-6</span>
            <span className="text-sm font-semibold text-white">Disk Usage Report & Registry Audit on DC01</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Build a top-10 largest files report for the C: drive."
              command={CODE_PSFILESYSTEM_4}
              output={CODE_PSFILESYSTEM_5}
            />
            <LabStep number={2}
              description="Audit Run keys in the registry for auto-starting programs."
              command={CODE_PSFILESYSTEM_6}
              output={CODE_PSFILESYSTEM_7}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="ps-06" title="File System & Registry Automation Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={35} />
      </section>
    </LessonLayout>
  )
}
