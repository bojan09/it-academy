import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_PSREPORTING_1 = `$css = @'
<style>
  body { font-family: Segoe UI, sans-serif; font-size: 13px; background: #f8f9fa; margin: 20px; }
  h1   { color: #1a237e; }
  h2   { color: #283593; margin-top: 30px; }
  table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
  th   { background: #1a237e; color: white; padding: 8px 12px; text-align: left; }
  td   { padding: 7px 12px; border-bottom: 1px solid #dee2e6; }
  tr:nth-child(even) { background: #e8eaf6; }
  .warn { color: #e65100; font-weight: bold; }
  .ok   { color: #1b5e20; }
</style>
'@

# Collect data
$servers  = @('DC01')
$svcData  = Get-Service | Where-Object {$_.StartType -eq 'Automatic' -and $_.Status -ne 'Running'} |
              Select-Object Name, DisplayName, Status
$diskData = Get-PSDrive C | Select-Object Name,
              @{N='Free_GB'; E={[math]::Round($_.Free/1GB,1)}},
              @{N='Used_GB'; E={[math]::Round($_.Used/1GB,1)}}

# Build fragments
$svcTable  = $svcData  | ConvertTo-Html -Fragment -PreContent '<h2>Stopped Automatic Services</h2>'
$diskTable = $diskData | ConvertTo-Html -Fragment -PreContent '<h2>Disk Usage</h2>'

# Assemble report
$report = ConvertTo-Html \`\`
  -Head $css \`\`
  -Body "<h1>DC01 Daily Health Report — $(Get-Date -f 'dd MMM yyyy')</h1>$svcTable$diskTable"

$reportPath = 'C:\\Reports\\daily-health.html'
New-Item (Split-Path $reportPath) -ItemType Directory -Force | Out-Null
$report | Out-File $reportPath -Encoding utf8
Write-Host "Report saved: $reportPath" -ForegroundColor Green`
const CODE_PSREPORTING_2 = `$scriptPath = 'C:\\Scripts\\daily-report.ps1'

$action = New-ScheduledTaskAction \`\`
  -Execute 'powershell.exe' \`\`
  -Argument "-NonInteractive -NoProfile -ExecutionPolicy Bypass -File \`"$scriptPath\`""

$trigger = New-ScheduledTaskTrigger -Daily -At '06:00'

$settings = New-ScheduledTaskSettingsSet \`\`
  -ExecutionTimeLimit (New-TimeSpan -Hours 1) \`\`
  -RestartCount 2 \`\`
  -RestartInterval (New-TimeSpan -Minutes 5) \`\`
  -RunOnlyIfNetworkAvailable \`\`
  -StartWhenAvailable   # Run if missed

$principal = New-ScheduledTaskPrincipal \`\`
  -UserId 'SYSTEM' \`\`
  -LogonType ServiceAccount \`\`
  -RunLevel Highest

Register-ScheduledTask \`\`
  -TaskName 'Daily Health Report' \`\`
  -TaskPath '\\SysAdmin' \`\`
  -Action $action \`\`
  -Trigger $trigger \`\`
  -Settings $settings \`\`
  -Principal $principal \`\`
  -Description 'Generates daily server health HTML report' \`\`
  -Force

# Verify
Get-ScheduledTask -TaskPath '\\SysAdmin' | Format-Table TaskName, State`
const CODE_PSREPORTING_3 = `function Send-HtmlReport {
    param(
        [string]$To,
        [string]$Subject,
        [string]$BodyHtml,
        [string]$SmtpServer = 'smtp.lab.local',
        [string[]]$Attachments = @()
    )
    $msg = New-Object System.Net.Mail.MailMessage
    $msg.From       = 'reports@lab.local'
    $msg.To.Add($To)
    $msg.Subject    = $Subject
    $msg.Body       = $BodyHtml
    $msg.IsBodyHtml = $true

    foreach ($file in $Attachments) {
        if (Test-Path $file) {
            $msg.Attachments.Add((New-Object System.Net.Mail.Attachment($file)))
        }
    }

    $smtp = New-Object System.Net.Mail.SmtpClient($SmtpServer, 25)
    try {
        $smtp.Send($msg)
        Write-Host 'Report emailed successfully' -ForegroundColor Green
    }
    catch { Write-Warning "Email failed: $($_.Exception.Message)" }
    finally { $msg.Dispose() }
}

# Usage
Send-HtmlReport \`\`
  -To 'admin@lab.local' \`\`
  -Subject "DC01 Health Report — $(Get-Date -f 'dd MMM yyyy')" \`\`
  -BodyHtml (Get-Content C:\\Reports\\daily-health.html -Raw) \`\`
  -Attachments 'C:\\Reports\\daily-health.html'`
const CODE_PSREPORTING_4 = `# Quick HTML report
$services = Get-Service | Where-Object {$_.StartType -eq 'Automatic'} |
  Select-Object Name, Status | ConvertTo-Html -Fragment -Pre '<h2>Services</h2>'

$disks = Get-PSDrive -PSProvider FileSystem |
  Select-Object Name,
    @{N='Free_GB';  E={[math]::Round($_.Free/1GB, 1)}},
    @{N='Used_GB';  E={[math]::Round($_.Used/1GB, 1)}} |
  ConvertTo-Html -Fragment -Pre '<h2>Disk Usage</h2>'

$html = ConvertTo-Html -Body "<h1>DC01 Report — $(Get-Date -f 'dd MMM yyyy HH:mm')</h1>$services$disks"
New-Item C:\\Reports -ItemType Directory -Force | Out-Null
$html | Out-File C:\\Reports\\health.html -Encoding utf8
Write-Host 'Report created: C:\\Reports\\health.html' -ForegroundColor Green`
const CODE_PSREPORTING_5 = `# CSV export
Get-Service | Where-Object {$_.StartType -eq 'Automatic'} |
  Select-Object Name, DisplayName, Status, StartType |
  Export-Csv C:\\Reports\\services.csv -NoTypeInformation

Write-Host "Exported $(Import-Csv C:\\Reports\\services.csv | Measure-Object | Select-Object -Exp Count) services to CSV"`
const CODE_PSREPORTING_6 = `# Save the script first
Set-Content C:\\Scripts\\daily-report.ps1 -Value @'
Get-Service | Where-Object {$_.StartType -eq 'Automatic'} |
  Export-Csv C:\\Reports\\services-$(Get-Date -f yyyyMMdd).csv -NoTypeInformation
Write-Host 'Done'
'@

# Register scheduled task
Register-ScheduledTask \`\`
  -TaskName 'DailyHealthReport' \`\`
  -Action (New-ScheduledTaskAction -Execute 'powershell.exe' -Argument '-File C:\\Scripts\\daily-report.ps1') \`\`
  -Trigger (New-ScheduledTaskTrigger -Daily -At '06:00') \`\`
  -Principal (New-ScheduledTaskPrincipal -UserId SYSTEM -RunLevel Highest) \`\`
  -Force

Get-ScheduledTask -TaskName DailyHealthReport | Select-Object TaskName, State`
const CODE_PSREPORTING_7 = `TaskName           State
--------           -----
DailyHealthReport  Ready`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What does ConvertTo-Html -Fragment do and when is it useful?',
    options: [
      'Converts HTML back to PowerShell objects',
      'Generates an HTML table snippet without the <html>/<body> wrapper — useful for embedding multiple tables into a single styled report file',
      'Creates a fragment of a CSV file',
      'Splits a large HTML report into multiple files',
    ],
    correct: 1,
    explanation: 'ConvertTo-Html without -Fragment generates a complete HTML document. With -Fragment, it generates only the <table>...</table> markup — no HTML/head/body tags. This lets you generate multiple table fragments from different data sources and combine them into a single styled HTML report by concatenating the fragments with your own HTML wrapper, CSS, and headers.',
  },
  {
    id: 'q2',
    question: 'What does Register-ScheduledTask do and what are its key parameters?',
    options: [
      'Registers a PowerShell script as a Windows Service',
      'Creates a Windows Task Scheduler entry that runs a PowerShell script on a defined trigger (time, event, startup) with specified credentials and settings',
      'Adds a script to the PowerShell profile for auto-loading',
      'Registers the task with an external monitoring system',
    ],
    correct: 1,
    explanation: 'Register-ScheduledTask (with New-ScheduledTaskAction, New-ScheduledTaskTrigger, New-ScheduledTaskPrincipal, New-ScheduledTaskSettingsSet) creates Task Scheduler entries from PowerShell. Key pieces: Action = what to run (powershell.exe -File script.ps1), Trigger = when (daily at 06:00, at startup, on event), Principal = who it runs as (SYSTEM, a service account), Settings = restart on failure, run if missed, execution time limit.',
  },
  {
    id: 'q3',
    question: 'What is the correct way to send email from PowerShell in a corporate environment?',
    options: [
      'Use Invoke-WebRequest to the mail server API',
      'Use Send-MailMessage (legacy) or [System.Net.Mail.SmtpClient] with your internal SMTP relay — never send directly from a server to the internet',
      'Write the email to a .msg file and call Outlook.exe',
      'Use the Windows built-in mail client via COM automation',
    ],
    correct: 1,
    explanation: 'Send-MailMessage is marked obsolete (no TLS 1.2+ support) but works for internal relay. For production use [System.Net.Mail.SmtpClient] or the newer Send-MgUserMail (Microsoft Graph). Always use an internal SMTP relay server — never configure a server to send directly to the internet (blocked by most ISPs, blacklisted, requires complex SPF/DKIM setup). Set the relay to the internal Exchange or SMTP gateway IP.',
  },
  {
    id: 'q4',
    question: 'What does Export-Csv -NoTypeInformation do?',
    options: [
      'Exports only column headers, not data rows',
      'Omits the #TYPE header line that PowerShell normally adds as the first line of CSV output — making the file compatible with Excel and other CSV consumers',
      'Exports without column names, only values',
      'Prevents overwriting if the file already exists',
    ],
    correct: 1,
    explanation: 'By default, Export-Csv adds a first line like #TYPE System.Management.Automation.PSCustomObject which confuses Excel and most CSV parsers. -NoTypeInformation removes this line, producing a clean CSV with only the header row and data rows. In PowerShell 6+, NoTypeInformation is the default. Also useful: -Append (add rows to existing file), -Encoding UTF8, -Delimiter ";" (for European locales that use semicolons).',
  },
  {
    id: 'q5',
    question: 'How do you output different coloured text in a PowerShell report to the console?',
    options: [
      'Write-Host "text" -ForegroundColor Red — but note Write-Host bypasses the pipeline and cannot be redirected to a file',
      'Set-ConsoleColor -Foreground Red before each Write-Output statement',
      'Use ANSI escape codes: "`e[31mRed Text`e[0m"',
      'Both A and C are correct — Write-Host for simple scripts, ANSI for pipeline-safe output',
    ],
    correct: 3,
    explanation: 'Write-Host "text" -ForegroundColor Red colours console output but the text cannot be captured with > or piped to Out-File — it bypasses the success stream. For pipeline-safe coloured output in PS 5.1+, use ANSI escape codes: "`e[31m$text`e[0m" (Red). In PS 7+, ANSI sequences work natively. For reports written to files, use ConvertTo-Html with CSS styling instead of console colours.',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info:'callout-info', warning:'callout-warning', success:'callout-success' }
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
          {output.split('\n').map((l,i)=><div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  )
}

export default function PSReporting() {
  return (
    <LessonLayout
      lessonId="ps-08"
      courseId="powershell"
      title="Reporting & Scheduled Automation"
      courseTitle="PowerShell"
      courseHref="/powershell"
      xp={80}
      readTime="~35 min"
      icon="📊"
      breadcrumbs={[
        { label:'Home', href:'/' },
        { label:'PowerShell', href:'/powershell' },
        { label:'Reporting & Scheduled Automation' },
      ]}
      prev={{ title:'Desired State Configuration', href:'/powershell/dsc' }}
      next={null}
      objectives={[
        'Generate professional HTML reports with ConvertTo-Html and CSS styling',
        'Export structured data to CSV and JSON for Excel and external tools',
        'Schedule scripts as Windows Scheduled Tasks',
        'Send email alerts with SMTP from PowerShell',
        'Build a daily server health report that emails itself',
        'Use transcript logging to audit automation runs',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          The final step in automation is <em>visibility</em> — scheduled scripts that
          run silently and report results to stakeholders. This lesson covers building
          production HTML reports, exporting to CSV/JSON, scheduling with Task Scheduler,
          and email delivery — the full reporting pipeline.
        </p>
      </section>

      <section>
        <h2>HTML Reports with ConvertTo-Html</h2>
        <CodeBlock title="Professional HTML report generation" language="powershell"
          code={CODE_PSREPORTING_1} />
      </section>

      <section>
        <h2>Scheduling with Task Scheduler</h2>
        <CodeBlock title="Register a daily scheduled task" language="powershell"
          code={CODE_PSREPORTING_2} />
      </section>

      <section>
        <h2>Email Delivery</h2>
        <CodeBlock title="Send email with HTML report attached" language="powershell"
          code={CODE_PSREPORTING_3} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB PS-8</span>
            <span className="text-sm font-semibold text-white">Generate and Schedule a Daily Health Report on DC01</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Generate a multi-section HTML report and save it to disk."
              command={CODE_PSREPORTING_4}
              output="Report created: C:\\Reports\\health.html"
            />
            <LabStep number={2}
              description="Export the same data to CSV for Excel consumption."
              command={CODE_PSREPORTING_5}
              output="Exported 67 services to CSV"
            />
            <LabStep number={3}
              description="Schedule the report to run daily at 06:00."
              command={CODE_PSREPORTING_6}
              output={CODE_PSREPORTING_7}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to complete the PowerShell course.</p>
        <Quiz lessonId="ps-08" title="Reporting & Scheduled Automation Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={40} />
      </section>
    </LessonLayout>
  )
}
