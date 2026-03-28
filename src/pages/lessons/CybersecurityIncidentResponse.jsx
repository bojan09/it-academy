import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_CYBERSECURITYINCIDENTRESPONSE_1 = `# Run as Administrator. Save output to an external drive or network share.
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$outdir = "C:\\IR-Evidence-$timestamp"
New-Item -Path $outdir -ItemType Directory | Out-Null

# Snapshot running processes
Get-Process | Select-Object Id, Name, Path, CPU, StartTime |
  Export-Csv "$outdir\\processes.csv" -NoTypeInformation

# Network connections (who is the system talking to?)
Get-NetTCPConnection | Select-Object State, LocalAddress, LocalPort,
  RemoteAddress, RemotePort,
  @{N='Process';E={(Get-Process -Id $_.OwningProcess -EA SilentlyContinue).Name}} |
  Export-Csv "$outdir\\
etwork-connections.csv" -NoTypeInformation

# Logged-in users
query user 2>&1 | Out-File "$outdir\\logged-in-users.txt"

# Recent Security events (last 2 hours)
Get-WinEvent -FilterHashtable @{LogName='Security'; StartTime=(Get-Date).AddHours(-2)} |
  Select-Object TimeCreated, Id, Message |
  Export-Csv "$outdir\\security-events.csv" -NoTypeInformation

# Scheduled tasks (persistence mechanism)
Get-ScheduledTask | Where-Object State -ne Disabled |
  Select-Object TaskName, TaskPath, State |
  Export-Csv "$outdir\\scheduled-tasks.csv" -NoTypeInformation

# Startup items
Get-CimInstance Win32_StartupCommand |
  Export-Csv "$outdir\\startup-items.csv" -NoTypeInformation

Write-Host "Evidence collected to: $outdir" -ForegroundColor Green
Write-Host "Hash the directory for chain of custody:"
Get-ChildItem $outdir -Recurse -File | ForEach-Object {
    $hash = Get-FileHash $_.FullName -Algorithm SHA256
    "$($hash.Hash)  $($_.Name)"
} | Out-File "$outdir\\HASHES.txt"`
const CODE_CYBERSECURITYINCIDENTRESPONSE_2 = `# Simulate: Start-Sleep acts as a 'long-running suspicious process'
Start-Process powershell -ArgumentList '-Command', 'Start-Sleep 300' -WindowStyle Hidden

# INCIDENT RESPONSE: collect evidence immediately
$out = 'C:\\IR-Lab'
New-Item $out -ItemType Directory -Force | Out-Null

# Processes
Get-Process | Select-Object Id, Name, CPU |
  Sort-Object CPU -Descending | Select-Object -First 10 |
  Export-Csv "$out\\processes.csv" -NoTypeInformation

# Network connections
Get-NetTCPConnection | Where-Object State -eq 'Established' |
  Select-Object LocalAddress, LocalPort, RemoteAddress, RemotePort,
    @{N='Process';E={(Get-Process -Id $_.OwningProcess -EA 0).Name}} |
  Export-Csv "$out\\connections.csv" -NoTypeInformation

Write-Host 'Evidence collected.' -ForegroundColor Green
Get-ChildItem $out`
const CODE_CYBERSECURITYINCIDENTRESPONSE_3 = `Evidence collected.

    Directory: C:\\IR-Lab

Mode  Name
----  ----
-a-   connections.csv
-a-   processes.csv`
const CODE_CYBERSECURITYINCIDENTRESPONSE_4 = `# Find hidden PowerShell processes
Get-Process powershell | Select-Object Id, Name, StartTime, CPU

# Containment: block outbound with firewall (don't kill yet — preserve state)
New-NetFirewallRule -DisplayName 'CONTAIN-SUSPICIOUS' \`\`
  -Direction Outbound -Action Block \`\`
  -Profile Any -Enabled True

Write-Host 'System contained — outbound traffic blocked'

# Eradication: now we can kill the process
Get-Process powershell | Where-Object Id -ne $PID | Stop-Process -Force
Remove-NetFirewallRule -DisplayName 'CONTAIN-SUSPICIOUS'

Write-Host 'Eradication complete' -ForegroundColor Green`
const CODE_CYBERSECURITYINCIDENTRESPONSE_5 = `Id     Name        StartTime              CPU
--     ----        ---------              ---
4512   powershell  01/15/2025 11:00:00    0.1
4488   powershell  01/15/2025 10:55:00    0.0  <- suspicious hidden process

System contained — outbound traffic blocked
Eradication complete`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What are the 6 phases of the NIST Incident Response lifecycle?',
    options: [
      'Detect, Analyse, Contain, Fix, Recover, Close',
      'Preparation, Detection & Analysis, Containment, Eradication, Recovery, Post-Incident Activity',
      'Plan, Identify, Protect, Detect, Respond, Recover',
      'Discover, Triage, Isolate, Remediate, Restore, Document',
    ],
    correct: 1,
    explanation: 'NIST SP 800-61 defines: (1) Preparation — build capability before incidents, (2) Detection & Analysis — confirm and scope the incident, (3) Containment — stop the bleeding, (4) Eradication — remove the threat completely, (5) Recovery — restore and verify, (6) Post-Incident Activity — lessons learned, improve processes. Each phase produces specific deliverables.',
  },
  {
    id: 'q2',
    question: 'What is the FIRST action upon detecting a suspected compromise?',
    options: [
      'Immediately shut down the affected system',
      'Re-image the system to remove any malware',
      'Collect volatile evidence (running processes, network connections, memory) BEFORE any changes are made',
      'Disconnect the system from the network',
    ],
    correct: 2,
    explanation: 'Volatile evidence (RAM contents, running processes, active network connections, logged-in users, open files) is lost when a system is shut down or rebooted. Collect it FIRST: capture process list, network connections, running services, bash history, and if possible a memory dump. Shutdown destroys this evidence. After evidence collection, containment (network isolation) is the appropriate next step.',
  },
  {
    id: 'q3',
    question: 'What is the difference between "containment" and "eradication" in incident response?',
    options: [
      'They are the same phase with different names',
      'Containment stops the incident from spreading further (isolate); eradication removes the actual threat (malware, backdoors, compromised accounts)',
      'Containment is for network incidents; eradication is for endpoint incidents',
      'Containment is a technical action; eradication is a business decision',
    ],
    correct: 1,
    explanation: 'Containment: isolate the affected system from the network to prevent lateral movement and further damage. The threat may still be present on the isolated system. Eradication: actively remove the malware, close the backdoor, reset compromised credentials, patch the vulnerability. Both phases are necessary — containment without eradication leaves the threat in place; eradication without containment allows the attacker to continue operating.',
  },
  {
    id: 'q4',
    question: 'What should a post-incident review (blameless post-mortem) produce?',
    options: [
      'A list of individuals responsible for the incident and disciplinary actions',
      'A timeline of events, root cause analysis, impact assessment, and specific actionable improvements to prevent recurrence — not individual blame',
      'A report to law enforcement documenting the attackers',
      'A decision on whether to pay a ransom demand',
    ],
    correct: 1,
    explanation: 'A blameless post-mortem focuses on system and process failures, not individual blame. Outputs: a timeline of events, root cause (not symptoms), impact quantification (downtime, data exposure, cost), what worked in the response, what didn\'t, and specific actionable improvements (controls to add, processes to change, training needed). Blame culture prevents honest disclosure and prevents learning.',
  },
  {
    id: 'q5',
    question: 'What is "chain of custody" in incident response and why does it matter?',
    options: [
      'The escalation chain for notifying management during an incident',
      'Documentation proving that evidence was collected, handled, and stored in a controlled manner without tampering — required for legal proceedings',
      'The order in which systems are brought back online after recovery',
      'The process of handing off incident response between shift teams',
    ],
    correct: 1,
    explanation: 'Chain of custody documents who collected evidence, when, how, and where it has been since collection. For legal proceedings (criminal charges, civil litigation, regulatory investigations), evidence is inadmissible if chain of custody is broken — if you can\'t prove the evidence wasn\'t tampered with, it\'s worthless in court. Even if you don\'t expect legal action, proper chain of custody is best practice.',
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

export default function CybersecurityIncidentResponse() {
  return (
    <LessonLayout
      lessonId="sec-09"
      courseId="cybersecurity"
      title="Incident Response"
      courseTitle="Cybersecurity"
      courseHref="/cybersecurity"
      xp={100}
      readTime="~40 min"
      icon="🚨"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Cybersecurity', href: '/cybersecurity' },
        { label: 'Incident Response' },
      ]}
      prev={{ title: 'Vulnerability Scanning',      href: '/cybersecurity/vuln-scanning' }}
      next={{ title: 'Active Directory Security',   href: '/cybersecurity/ad-security' }}
      objectives={[
        'Apply the NIST 6-phase incident response lifecycle',
        'Collect volatile evidence before containment',
        'Isolate a compromised system without destroying evidence',
        'Conduct eradication: remove malware, close backdoors, reset credentials',
        'Document incidents with proper chain of custody',
        'Run a blameless post-incident review',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Security incidents are inevitable. The question is not <em>if</em> you'll face one,
          but <em>how well you respond</em> when you do. A structured incident response
          process minimises damage, reduces recovery time, preserves evidence, and produces
          lessons that improve your defences.
        </p>
        <Callout type="danger" icon="🚨" title="Don't panic — follow the process">
          The worst IR decisions are made in panic: rebooting a system (destroys volatile
          evidence), immediately wiping (destroys forensic data), alerting the attacker
          (they cover tracks). Slow down, collect evidence, then act.
        </Callout>
      </section>

      <section>
        <h2>The 6-Phase NIST IR Lifecycle</h2>
        <div className="space-y-3 mt-4">
          {[
            { num: '01', phase: 'Preparation',                color: 'bg-brand-500',        desc: 'Before incidents happen: build IR capability, create runbooks, deploy logging and monitoring, define escalation contacts, practice with tabletop exercises. You cannot prepare during an incident.' },
            { num: '02', phase: 'Detection & Analysis',       color: 'bg-accent-cyan',      desc: 'Identify that an incident is occurring and scope it. Confirm it\'s a real incident (not a false positive). Determine affected systems, timeline, and attacker actions so far. Assign severity.' },
            { num: '03', phase: 'Containment',                color: 'bg-accent-amber',     desc: 'Stop the bleeding. Isolate affected systems (network isolation, not shutdown). Preserve volatile evidence first. Short-term containment buys time for analysis; long-term containment allows business continuity while you clean up.' },
            { num: '04', phase: 'Eradication',                color: 'bg-orange-500',       desc: 'Remove the threat: malware, backdoors, compromised accounts, attacker tools. Patch the vulnerability that enabled the attack. Validate that the threat is gone before recovery.' },
            { num: '05', phase: 'Recovery',                   color: 'bg-accent-green',     desc: 'Restore systems to normal operation. Monitor closely for recurrence. Validate that business processes work correctly. Communicate restoration to stakeholders.' },
            { num: '06', phase: 'Post-Incident Activity',     color: 'bg-accent-purple',    desc: 'Blameless post-mortem: timeline, root cause, impact, what worked, what didn\'t, specific improvements. Update runbooks. Share lessons with the team. File legal reports if required.' },
          ].map(p => (
            <div key={p.num} className="flex gap-4 items-start">
              <div className={`w-10 h-10 rounded-xl ${p.color} flex items-center justify-center
                               text-white font-mono font-black text-sm flex-shrink-0 mt-0.5`}>
                {p.num}
              </div>
              <div className="card p-4 flex-1">
                <p className="font-bold text-white text-sm mb-1">{p.phase}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Evidence Collection Runbook</h2>
        <CodeBlock title="Windows — volatile evidence collection (run FIRST on suspected compromise)" language="powershell"
          code={CODE_CYBERSECURITYINCIDENTRESPONSE_1} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB SEC-9</span>
            <span className="text-sm font-semibold text-white">Simulate & Respond to a Suspicious Process on DC01</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Simulate a suspicious outbound connection and collect volatile evidence."
              command={CODE_CYBERSECURITYINCIDENTRESPONSE_2}
              output={CODE_CYBERSECURITYINCIDENTRESPONSE_3}
            />
            <LabStep number={2}
              description="Identify and contain the suspicious process, then eradicate."
              command={CODE_CYBERSECURITYINCIDENTRESPONSE_4}
              output={CODE_CYBERSECURITYINCIDENTRESPONSE_5}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="sec-09" title="Incident Response Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={50} />
      </section>
    </LessonLayout>
  )
}
