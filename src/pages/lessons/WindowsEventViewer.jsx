import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_WINDOWSEVENTVIEWER_1 = `# ── Recent errors (server-side filtered — fast) ───────────────
Get-WinEvent -FilterHashtable @{
    LogName   = 'System'
    Level     = 1, 2          # Critical and Error
    StartTime = (Get-Date).AddHours(-24)
} | Select-Object TimeCreated, Id, ProviderName, Message |
  Format-Table -AutoSize

# ── Security: failed logins in last hour ─────────────────────
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'
    Id      = 4625
    StartTime = (Get-Date).AddHours(-1)
} | Select-Object TimeCreated,
    @{N='Account'; E={$_.Properties[5].Value}},
    @{N='Source';  E={$_.Properties[19].Value}}

# ── Service Control Manager events (service failures) ─────────
Get-WinEvent -FilterHashtable @{
    LogName      = 'System'
    ProviderName = 'Service Control Manager'
    Level        = 1, 2
} -MaxEvents 20 | Select-Object TimeCreated, Message

# ── Count events by ID — find the noisy ones ─────────────────
Get-WinEvent -LogName System -MaxEvents 1000 |
    Group-Object Id |
    Sort-Object Count -Descending |
    Select-Object -First 10 |
    Select-Object Name, Count`
const CODE_WINDOWSEVENTVIEWER_2 = `# Recent successful logons
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'; Id = 4624
    StartTime = (Get-Date).AddHours(-24)
} -MaxEvents 20 |
ForEach-Object {
    [PSCustomObject]@{
        Time    = $_.TimeCreated
        Account = $_.Properties[5].Value
        Type    = switch($_.Properties[8].Value) {
            2 {'Interactive'} 3 {'Network'} 10 {'Remote'} default {'Other'}
        }
        Source = $_.Properties[18].Value
    }
} | Where-Object Account -ne '-' |
  Format-Table -AutoSize`
const CODE_WINDOWSEVENTVIEWER_3 = `Time                Account        Type          Source
----                -------        ----          ------
01/15/2025 10:00    Administrator  Interactive   -
01/15/2025 09:55    Administrator  Remote        192.168.100.20
01/15/2025 09:50    SYSTEM         Network       -`
const CODE_WINDOWSEVENTVIEWER_4 = `# Check if audit log has been tampered with
$cleared = Get-WinEvent -FilterHashtable @{
    LogName = 'Security'; Id = 1102
} -MaxEvents 5 -ErrorAction SilentlyContinue

if ($cleared) {
    Write-Host 'WARNING: Audit log was cleared!' -ForegroundColor Red
    $cleared | Select-Object TimeCreated, Message
} else {
    Write-Host 'OK: Audit log intact (no clearing events found)' -ForegroundColor Green
}`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the difference between Event ID 4624 and 4625 in the Security log?',
    options: [
      '4624 = logon failure, 4625 = logon success',
      '4624 = successful account logon, 4625 = failed account logon — monitoring 4625 frequency per source IP identifies brute-force attacks',
      '4624 = account created, 4625 = account deleted',
      '4624 = service start, 4625 = service stop',
    ],
    correct: 1,
    explanation: 'Security Event 4624: An account was successfully logged on — includes logon type (2=interactive, 3=network, 10=remote interactive/RDP). Event 4625: An account failed to log on — includes failure reason and source IP. A flood of 4625 events from one IP = brute force. Multiple 4625 then 4624 from same source = successful attack after brute force. Filter Security log by Event ID in Event Viewer or Get-WinEvent.',
  },
  {
    id: 'q2',
    question: 'What are the 5 Windows event log levels from highest to lowest severity?',
    options: [
      'Fatal, Error, Warning, Info, Debug',
      'Critical (1), Error (2), Warning (3), Information (4), Verbose (5) — Critical indicates system failure, Error indicates functionality failure, Warning indicates potential future problems',
      'Emergency, Alert, Critical, Error, Warning',
      'Fatal, Severe, Error, Warning, Notice',
    ],
    correct: 1,
    explanation: 'Windows event levels: Critical (1) — system component failure, may cause data loss. Error (2) — significant problem that has caused service/functionality loss. Warning (3) — not currently failing but may indicate future problems. Information (4) — normal operational events. Verbose (5) — detailed diagnostic data. In Event Viewer: filter by level to focus on actionable events. In PowerShell: Get-WinEvent -FilterHashtable @{LogName=\'System\'; Level=1,2}.',
  },
  {
    id: 'q3',
    question: 'What is a Windows Event Subscription and why is it useful in enterprise environments?',
    options: [
      'A notification email sent when critical events occur',
      'A mechanism to forward events from multiple source computers to a central collector server — enabling centralised log analysis without requiring a SIEM agent on every machine',
      'A scheduled task that exports event logs weekly',
      'An API subscription for third-party monitoring tools',
    ],
    correct: 1,
    explanation: 'Windows Event Forwarding (WEF) allows computers to push (push mode: WinRM required) or a collector to pull events from multiple source computers. Configure a Collector subscription: which event logs, which event IDs, from which computers. Events arrive at the Forwarded Events log on the collector. This provides centralised visibility without third-party agents — using only built-in Windows components. Combine with Get-WinEvent on the collector for fleet-wide log analysis.',
  },
  {
    id: 'q4',
    question: 'What does Get-WinEvent -FilterHashtable @{LogName="System"; StartTime=(Get-Date).AddHours(-24); Level=1,2} return?',
    options: [
      'All System log events from the last 24 hours',
      'Critical and Error level events from the System log in the last 24 hours — efficient server-side filtering that outperforms piping to Where-Object',
      'Events from all logs in the last 24 hours',
      'System log events older than 24 hours',
    ],
    correct: 1,
    explanation: 'Get-WinEvent with -FilterHashtable performs server-side filtering — the event log engine filters before returning data to PowerShell. This is significantly faster than Get-WinEvent -LogName System | Where-Object which retrieves ALL events then filters in PowerShell. FilterHashtable keys: LogName, StartTime, EndTime, Level (array), Id (event IDs array), ProviderName. For large logs on busy servers, FilterHashtable vs Where-Object can mean seconds vs minutes.',
  },
  {
    id: 'q5',
    question: 'What Windows tool provides a "stability score" and timeline of system crashes?',
    options: [
      'Task Manager → Performance tab',
      'Reliability Monitor (perfmon /rel) — shows a day-by-day stability index and timeline of application/Windows failures, making it easy to correlate instability with specific events',
      'Event Viewer → Custom Views → Administrative Events',
      'System Information (msinfo32)',
    ],
    correct: 1,
    explanation: 'Reliability Monitor (Control Panel → Security and Maintenance → Reliability Monitor, or perfmon /rel) shows a 1-10 stability score over time as a line chart, with icons for: application failures (crashes), Windows failures (BSODs), miscellaneous failures, warnings, and information events. It\'s the fastest way to see if instability correlates with a specific date — like "the crashes started after that driver update on Tuesday." Invaluable for intermittent problem diagnosis.',
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

export default function WindowsEventViewer() {
  return (
    <LessonLayout
      lessonId="win-06"
      courseId="windows"
      title="Windows Event Viewer & Logging"
      courseTitle="Windows Desktop"
      courseHref="/windows"
      xp={80}
      readTime="~30 min"
      icon="📋"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Windows Desktop', href: '/windows' },
        { label: 'Event Viewer & Logging' },
      ]}
      prev={{ title: 'Networking in Windows', href: '/windows/networking' }}
      next={null}
      objectives={[
        'Navigate Event Viewer and its key log channels',
        'Know the critical security event IDs: 4624, 4625, 4648, 4672, 4688',
        'Use Get-WinEvent with FilterHashtable for efficient log queries',
        'Create Custom Views and saved filters in Event Viewer',
        'Enable process creation auditing (Event ID 4688)',
        'Forward events to a central collector with WEF',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Event Viewer contains the most comprehensive operational record of everything
          happening on a Windows system. For security incidents, performance problems,
          and application failures, the event logs are always the first place to look.
          Knowing exactly which logs to check and which event IDs matter cuts diagnosis
          time from hours to minutes.
        </p>
      </section>

      <section>
        <h2>Critical Event IDs to Know</h2>
        <div className="info-card mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-surface-700">
                <tr>{['ID','Log','Meaning','Why it matters'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {[
                  ['4624','Security','Successful logon','Who logged in, when, from where, what type (RDP vs local)'],
                  ['4625','Security','Failed logon','Brute-force detection — many failures = attack in progress'],
                  ['4648','Security','Logon with explicit credentials (runas)','Credential theft / lateral movement indicator'],
                  ['4672','Security','Special privileges assigned at logon','Admin-level logon — track privilege use'],
                  ['4688','Security','Process creation','What programs ran, who ran them, parent process (requires audit policy)'],
                  ['4720','Security','User account created','Unauthorised account creation = potential backdoor'],
                  ['4732','Security','User added to security group','Privilege escalation — user added to Admins'],
                  ['7045','System','New service installed','Malware often installs as a service for persistence'],
                  ['1102','Security','Audit log cleared','Attacker covering tracks — high priority alert'],
                  ['41','System','Kernel power — unexpected restart','System crash / BSOD without graceful shutdown'],
                ].map(r => (
                  <tr key={r[0]} className="hover:bg-surface-700/30">
                    <td className="px-3 py-2 font-mono font-bold text-brand-300">{r[0]}</td>
                    <td className="px-3 py-2 text-slate-500">{r[1]}</td>
                    <td className="px-3 py-2 text-white">{r[2]}</td>
                    <td className="px-3 py-2 text-slate-400">{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2>Querying Logs with PowerShell</h2>
        <CodeBlock title="Get-WinEvent — efficient log querying" language="powershell"
          code={CODE_WINDOWSEVENTVIEWER_1} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB WIN-6</span>
            <span className="text-sm font-semibold text-white">Security Log Analysis on DC01</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~15 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Query the Security log for logon events and build an activity report."
              command={CODE_WINDOWSEVENTVIEWER_2}
              output={CODE_WINDOWSEVENTVIEWER_3}
            />
            <LabStep number={2}
              description="Check for any audit log cleared events (serious security indicator)."
              command={CODE_WINDOWSEVENTVIEWER_4}
              output="OK: Audit log intact (no clearing events found)"
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to complete the Windows Desktop course.</p>
        <Quiz lessonId="win-06" title="Event Viewer & Logging Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={40} />
      </section>
    </LessonLayout>
  )
}
