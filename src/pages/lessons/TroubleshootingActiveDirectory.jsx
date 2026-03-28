import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_TROUBLESHOOTINGACTIVEDIRECTORY_1 = `# Run all tests on the local DC
dcdiag /test:all /v

# Key individual tests:
dcdiag /test:replications   # Replication health
dcdiag /test:netlogon       # Netlogon service + SYSVOL/NETLOGON shares
dcdiag /test:services       # Required AD services running
dcdiag /test:dns            # DNS configuration
dcdiag /test:fsmocheck      # FSMO role holders reachable
dcdiag /test:kccEvent       # KCC (topology generator) errors

# Check FSMO role holders
netdom query fsmo

# Check all DCs in the domain
dcdiag /s:DC01 /test:all

# PowerShell equivalent
Get-ADDomainController -Filter * | Select-Object Name, Site,
  IPv4Address, IsGlobalCatalog, IsReadOnly |
  Format-Table -AutoSize`
const CODE_TROUBLESHOOTINGACTIVEDIRECTORY_2 = `# Quick summary of all replication
repadmin /replsummary

# Detailed replication status
repadmin /showrepl
repadmin /showrepl DC01

# Check replication queue
repadmin /queue

# Force immediate replication
repadmin /syncall DC01 /AdeP
# /A = all naming contexts
# /d = identify servers by DN
# /e = replicate across site links
# /P = push (replicate from this DC)

# Show replication metadata for a specific object
repadmin /showobjmeta DC01 'CN=Administrator,CN=Users,DC=lab,DC=local'

# Check SYSVOL replication (DFS-R)
dfsrdiag ReplicationState /member:DC01

# PowerShell approach
Get-ADReplicationFailure -Target 'DC01' -Scope Server
Get-ADReplicationPartnerMetadata -Target 'DC01' |
  Select-Object Partner, LastReplicationAttempt,
  LastReplicationResult, ConsecutiveReplicationFailures`
const CODE_TROUBLESHOOTINGACTIVEDIRECTORY_3 = `# Full dcdiag — all tests
dcdiag /test:all 2>&1 | Tee-Object -FilePath C:\\dcdiag-report.txt

# Summary: count passes and failures
Select-String -Path C:\\dcdiag-report.txt -Pattern 'passed|failed' |
  Group-Object {$_.Line -match 'failed'} |
  Select-Object @{N='Status';E={if($_.Name){'FAILED'}else{'passed'}}}, Count`
const CODE_TROUBLESHOOTINGACTIVEDIRECTORY_4 = `Testing server: Default-First-Site-Name\\DC01
   Starting test: Replications .............. passed
   Starting test: NCSecDesc .................. passed
   Starting test: NetLogons .................. passed
   Starting test: Advertising ................ passed
   Starting test: KnowsOfRoleHolders ........ passed
   Starting test: RidManager ................. passed

Status   Count
------   -----
passed   18`
const CODE_TROUBLESHOOTINGACTIVEDIRECTORY_5 = `# Check FSMO role holders
netdom query fsmo

# Check DC01's time sync source
w32tm /query /status

# Check replication summary
repadmin /replsummary

# Verify DNS SRV records exist (critical for AD)
Resolve-DnsName _ldap._tcp.lab.local -Type SRV |
  Select-Object Name, NameTarget, Port`
const CODE_TROUBLESHOOTINGACTIVEDIRECTORY_6 = `Schema master          DC01.lab.local
Domain naming master   DC01.lab.local
PDC                    DC01.lab.local
RID pool manager       DC01.lab.local
Infrastructure master  DC01.lab.local

Replication Summary — no failures detected

Name                        NameTarget        Port
_ldap._tcp.lab.local        dc01.lab.local    389`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What command quickly checks the health of AD replication between domain controllers?',
    options: [
      'Get-ADReplication -All',
      'repadmin /showrepl and repadmin /replsummary — shows replication status, last successful sync, and any failures between all DC pairs',
      'dcdiag /test:replication',
      'netlogon /check',
    ],
    correct: 1,
    explanation: 'repadmin /showrepl shows the detailed replication status for each naming context from each source DC. repadmin /replsummary provides a quick summary table of largest deltas and failure counts. Both are essential for AD replication troubleshooting. Also useful: repadmin /syncall /AdeP (force sync all partitions), and Get-ADReplicationFailure in PowerShell for structured output.',
  },
  {
    id: 'q2',
    question: 'A user cannot log in with the error "The trust relationship between this workstation and the primary domain failed." What is the cause and fix?',
    options: [
      'The user\'s password has expired — reset it in ADUC',
      'The computer account\'s Kerberos secret is out of sync with the domain. Fix: rejoin the domain or use "Reset-ComputerMachinePassword" without rejoining',
      'The domain controller is offline — wait for it to come back online',
      'Active Directory has reached its maximum number of computer accounts',
    ],
    correct: 1,
    explanation: 'Every computer joined to a domain has a machine account with a password that rotates every 30 days. If the local machine\'s stored secret diverges from the domain\'s (e.g. after restoring an old snapshot), authentication fails. Fix without rejoining: Test-ComputerSecureChannel -Repair -Credential (Get-Credential DOMAIN\\Admin). If that fails, disjoin and rejoin. This is different from a user password issue — it\'s the computer\'s trust with the domain.',
  },
  {
    id: 'q3',
    question: 'What is SYSVOL replication and why is it critical for Group Policy to work?',
    options: [
      'SYSVOL is a backup of Active Directory — Group Policy doesn\'t depend on it',
      'SYSVOL is a shared folder on every DC containing Group Policy templates and logon scripts. If SYSVOL replication fails, clients get different GPO versions from different DCs, causing inconsistent policy application',
      'SYSVOL stores user profile data that must be replicated for roaming profiles',
      'SYSVOL contains the AD schema — replication failures cause object creation to fail',
    ],
    correct: 1,
    explanation: 'SYSVOL (\\\\domain\\SYSVOL) contains GPO templates (in Policies folder) and logon scripts. When you create or modify a GPO, the SYSVOL must replicate to all DCs. If SYSVOL replication breaks, clients applying policy from different DCs get different versions — some get the update, some get the old policy. Check SYSVOL replication with: Get-DfsrBacklog or dfsrdiag (DFS-R) or FRS event logs (legacy).',
  },
  {
    id: 'q4',
    question: 'What does "dcdiag /test:netlogon" check?',
    options: [
      'Whether domain controllers can ping each other',
      'Whether the Netlogon service is running and the NETLOGON and SYSVOL shares are accessible on each DC',
      'The speed of the network connection between domain controllers',
      'Whether all netlogon audit events are being properly logged',
    ],
    correct: 1,
    explanation: 'dcdiag /test:netlogon verifies the Netlogon service is started and the critical \\\\DC\\NETLOGON and \\\\DC\\SYSVOL shares exist and are accessible. These shares are required for domain join, logon scripts, and GPO downloads. A common issue: Netlogon running but shares not accessible (SYSVOL not yet replicated to a new DC, or DFS-R not initialized). Run dcdiag /test:all for a comprehensive DC health check.',
  },
  {
    id: 'q5',
    question: 'A user\'s Group Policy is not applying correctly. What is the first diagnostic step?',
    options: [
      'Restart the domain controller',
      'Run gpresult /r or gpresult /h report.html on the affected computer to see which GPOs are applying, which are denied, and in what order (LSDOU)',
      'Delete and recreate the GPO',
      'Remove the computer from the OU and add it back',
    ],
    correct: 1,
    explanation: 'gpresult /r (text) or gpresult /h report.html (HTML report) shows the complete Group Policy result for the current user and computer: which GPOs applied, which were filtered/denied and why, the processing order, and the winning settings for each policy area. This is always step 1. Common findings: GPO linked to wrong OU, security filtering excluding the account, WMI filter blocking application, or slow link detection deferring some GPOs.',
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

export default function TroubleshootingActiveDirectory() {
  return (
    <LessonLayout
      lessonId="trouble-05"
      courseId="troubleshooting"
      title="Active Directory Issues"
      courseTitle="Troubleshooting"
      courseHref="/troubleshooting"
      xp={90}
      readTime="~40 min"
      icon="🏢"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Troubleshooting', href: '/troubleshooting' },
        { label: 'Active Directory Issues' },
      ]}
      prev={{ title: 'Network Troubleshooting',   href: '/troubleshooting/networking' }}
      next={{ title: 'Performance & Capacity',    href: '/troubleshooting/performance' }}
      objectives={[
        'Run dcdiag to perform comprehensive DC health checks',
        'Diagnose and repair AD replication failures with repadmin',
        'Fix broken SYSVOL replication using DFSRDIAG',
        'Resolve the "trust relationship failed" computer account issue',
        'Diagnose Group Policy problems with gpresult',
        'Check Kerberos and DNS health — the two AD dependencies',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Active Directory is the authentication and policy backbone of most Windows
          environments. When it breaks, users can't log in, Group Policy stops applying,
          file shares become inaccessible, and the whole organisation grinds to a halt.
          AD problems are often subtle — replication lag, DNS misconfiguration, or clock
          skew — and require methodical diagnosis.
        </p>
        <Callout type="info" icon="🎯" title="AD's three dependencies">
          Active Directory fundamentally depends on three things: (1) <strong>DNS</strong> —
          all AD lookups use DNS SRV records. (2) <strong>Kerberos</strong> — authentication
          requires clocks within 5 minutes. (3) <strong>Replication</strong> — all DCs
          must have consistent data. When AD breaks, check these three first.
        </Callout>
      </section>

      <section>
        <h2>DC Health Check — The Diagnostic Toolkit</h2>
        <CodeBlock title="dcdiag — comprehensive DC health tests" language="powershell"
          code={CODE_TROUBLESHOOTINGACTIVEDIRECTORY_1} />
      </section>

      <section>
        <h2>Replication Troubleshooting</h2>
        <CodeBlock title="repadmin — diagnose and fix replication" language="powershell"
          code={CODE_TROUBLESHOOTINGACTIVEDIRECTORY_2} />
      </section>

      <section>
        <h2>Common AD Problems Playbook</h2>
        <div className="space-y-3 mt-4">
          {[
            {
              symptom: '"Trust relationship failed" at login',
              steps: ['Test-ComputerSecureChannel -Verbose (on affected PC)', 'If test fails: Test-ComputerSecureChannel -Repair -Credential (domain creds)', 'If repair fails: disjoin → rejoin domain', 'Root cause: machine account password out of sync (snapshot restore, long offline)'],
            },
            {
              symptom: 'GPO not applying to a user/computer',
              steps: ['gpresult /r (or gpresult /h report.html for full HTML report)', 'Check "Denied GPOs" section — usually security filter or WMI filter issue', 'gpupdate /force on the affected machine', 'Check GPO linked to correct OU: Get-GPInheritance -Target "OU=..."'],
            },
            {
              symptom: 'Replication failing between DCs',
              steps: ['repadmin /replsummary (identify failing DC pairs)', 'repadmin /showrepl (get specific error codes)', 'Check DNS: DCs must resolve each other by FQDN', 'Check firewall: RPC ports must be open between DCs', 'Event Viewer: NTDS Replication events (1308, 1311, 2087)'],
            },
            {
              symptom: 'Kerberos authentication failing (clock skew)',
              steps: ['Check time difference: w32tm /stripchart /computer:DC01 /samples:3', 'If >5 minutes: sync time on affected machine', 'Domain members: net time /domain /set', 'DC itself: w32tm /config /syncfromflags:domhier /update'],
            },
          ].map((p, i) => (
            <div key={i} className="rounded-xl border border-surface-700 overflow-hidden">
              <div className="px-4 py-3 bg-accent-amber/5 border-b border-surface-700">
                <p className="text-sm font-semibold text-white">⚠️ {p.symptom}</p>
              </div>
              <div className="px-4 py-3 bg-surface-800/50 space-y-1">
                {p.steps.map((step, j) => (
                  <p key={j} className="text-xs text-slate-400 font-mono leading-relaxed">{j+1}. {step}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB TROUBLE-5</span>
            <span className="text-sm font-semibold text-white">Run a Full AD Health Check on DC01</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Run the comprehensive dcdiag health check on DC01."
              command={CODE_TROUBLESHOOTINGACTIVEDIRECTORY_3}
              output={CODE_TROUBLESHOOTINGACTIVEDIRECTORY_4}
            />
            <LabStep number={2}
              description="Check FSMO roles and Kerberos time sync."
              command={CODE_TROUBLESHOOTINGACTIVEDIRECTORY_5}
              output={CODE_TROUBLESHOOTINGACTIVEDIRECTORY_6}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to complete the Troubleshooting course.</p>
        <Quiz lessonId="trouble-05" title="Active Directory Issues Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={45} />
      </section>
    </LessonLayout>
  )
}
