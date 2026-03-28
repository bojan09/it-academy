import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_WS2025BACKUP_1 = `# Install Windows Server Backup feature
Install-WindowsFeature Windows-Server-Backup -IncludeManagementTools

# ── Schedule a daily backup ───────────────────────────────────
$policy = New-WBPolicy

# Add volumes to back up
$vol = Get-WBVolume -AllVolumes | Where-Object { $_.MountPath -eq 'C:\\' }
Add-WBVolume -Policy $policy -Volume $vol

# Add System State (critical for domain controllers)
Add-WBSystemState -Policy $policy

# Set backup target (external drive or network share)
$target = New-WBBackupTarget -NetworkPath '\\\\NAS01\\Backups\\DC01' \`\`
  -Credential (Get-Credential 'BACKUP\\svc-backup')
Add-WBBackupTarget -Policy $policy -Target $target

# Schedule: daily at 23:00
Set-WBSchedule -Policy $policy -Schedule 23:00

# Apply policy
Set-WBPolicy -Policy $policy -Force

# Verify
Get-WBPolicy | Select-Object -ExpandProperty Schedule
Get-WBSummary`
const CODE_WS2025BACKUP_2 = `# Manual System State backup (run on DC01)
wbadmin start systemstatebackup -backupTarget:E: -quiet

# Verify backup completed
wbadmin get versions -backupTarget:E:

# ── AD Object restore (without full DC restore) ───────────────
# For deleted AD objects: use AD Recycle Bin (if enabled)
Get-ADObject -Filter { isDeleted -eq $true } \`\`
  -IncludeDeletedObjects -SearchBase 'CN=Deleted Objects,DC=lab,DC=local' |
  Select-Object Name, WhenDeleted

# Restore a deleted user from Recycle Bin
Restore-ADObject -Identity (Get-ADObject \`\`
  -Filter {Name -eq 'jsmith'} -IncludeDeletedObjects -SearchBase \`\`
  'CN=Deleted Objects,DC=lab,DC=local')

# ── Enable AD Recycle Bin (if not enabled) ────────────────────
Enable-ADOptionalFeature -Identity 'Recycle Bin Feature' \`\`
  -Scope ForestOrConfigurationSet \`\`
  -Target 'lab.local' -Confirm:$false`
const CODE_WS2025BACKUP_3 = `# Install the feature
Install-WindowsFeature Windows-Server-Backup -IncludeManagementTools

# Check existing backup status
Get-WBSummary`
const CODE_WS2025BACKUP_4 = `LastSuccessfulBackupTime   :
LastSuccessfulBackupTarget :
LastBackupResultHR         : 0
NumberOfVersions           : 0

← No backups yet — this is a fresh server`
const CODE_WS2025BACKUP_5 = `# Check if Recycle Bin is already enabled
Get-ADOptionalFeature -Filter 'name -eq "Recycle Bin Feature"' |
  Select-Object Name, EnabledScopes

# Enable if not already enabled
Enable-ADOptionalFeature -Identity 'Recycle Bin Feature' \`\`
  -Scope ForestOrConfigurationSet \`\`
  -Target 'lab.local' -Confirm:$false

# Test: delete a user and restore them
New-ADUser -Name 'Test Recovery' -SamAccountName 'testrecovery' -Enabled $true
Remove-ADUser -Identity 'testrecovery' -Confirm:$false

# Find in Recycle Bin
Get-ADObject -Filter {Name -eq 'Test Recovery'} \`\`
  -IncludeDeletedObjects |
  Restore-ADObject

Get-ADUser -Identity 'testrecovery' | Select-Object Name, Enabled`
const CODE_WS2025BACKUP_6 = `Name            Enabled
----            -------
Test Recovery   False    ← restored, re-enable manually`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the 3-2-1 backup rule?',
    options: [
      '3 full backups per week, 2 per month, 1 per year',
      '3 copies of data, on 2 different storage types, with 1 copy offsite — ensures no single failure destroys all backups',
      '3 minute recovery time objective, 2 hour recovery point, 1 day retention',
      '3 servers per site, 2 sites minimum, 1 primary datacenter',
    ],
    correct: 1,
    explanation: 'The 3-2-1 rule: 3 copies of your data (1 production + 2 backups), stored on 2 different media types (e.g. disk + tape, or local + cloud), with 1 copy offsite. This protects against: disk failure (multiple copies), media failure (different types), and site disasters (offsite copy). For ransomware protection, add an air-gapped or immutable copy (3-2-1-1).',
  },
  {
    id: 'q2',
    question: 'What is the difference between RTO and RPO in backup planning?',
    options: [
      'RTO is for physical servers; RPO is for virtual machines',
      'RTO (Recovery Time Objective) = how long you can tolerate being offline; RPO (Recovery Point Objective) = how much data loss you can accept (time since last backup)',
      'They are the same metric measured in different units',
      'RTO is a Microsoft standard; RPO is an industry standard',
    ],
    correct: 1,
    explanation: 'RTO: "Our systems must be back online within 4 hours." This drives your restore process speed requirements. RPO: "We cannot lose more than 1 hour of data." This drives your backup frequency — if RPO is 1 hour, you must back up every hour. A system with 4-hour RTO and 1-hour RPO needs: hourly backups, a restore process testable in under 4 hours, and regular DR drills to prove it.',
  },
  {
    id: 'q3',
    question: 'What does Windows Server Backup use to ensure consistent backups of databases and AD?',
    options: [
      'It flushes all data to disk and locks the system for the duration',
      'Volume Shadow Copy Service (VSS) — it coordinates with application writers to create application-consistent point-in-time snapshots without service interruption',
      'It backs up only changed files since the last backup using journaling',
      'It uses Hyper-V checkpoints to create consistent snapshots',
    ],
    correct: 1,
    explanation: 'VSS (Volume Shadow Copy Service) is the framework that makes consistent backups of live systems possible. VSS-aware applications (SQL Server, Active Directory, Exchange) register as "VSS writers." When a backup starts, VSS signals writers to flush their buffers and quiesce writes temporarily, takes a snapshot, then signals writers to resume. The backup engine then reads from the snapshot. Without VSS, a database backup might capture half a transaction — unusable for restore.',
  },
  {
    id: 'q4',
    question: 'What is a Bare Metal Recovery (BMR) backup and when is it needed?',
    options: [
      'A backup of raw disk sectors without a filesystem',
      'A complete backup of the entire system state — OS, applications, settings, and data — allowing full restoration to new hardware after a catastrophic failure',
      'A backup method that bypasses the OS for maximum speed',
      'A backup of only the Windows boot partition',
    ],
    correct: 1,
    explanation: 'Bare Metal Recovery captures the entire system: OS, boot configuration, application binaries, settings, and data. It allows you to restore a failed server onto completely new hardware — not just the same hardware. Windows Server Backup includes BMR capability. For AD Domain Controllers, the System State backup (which includes the AD database, SYSVOL, registry, and boot files) is the minimum needed to restore DC functionality.',
  },
  {
    id: 'q5',
    question: 'Why must you regularly test backup restores and not just assume backups work?',
    options: [
      'Testing helps identify which files were changed since the last backup',
      'Untested backups frequently fail during actual recovery — corruption, media failure, changed procedures, or missing dependencies are only discovered when you try to restore',
      'Testing improves backup speed by warming the storage cache',
      'Regulatory compliance requires testing every 90 days',
    ],
    correct: 1,
    explanation: 'A backup that has never been tested is just a hope. Common failure modes discovered only during restore: media corruption (backup completed but data is unreadable), changed encryption keys (vault access lost), missing software prerequisites on the recovery system, procedure documentation out of date, and backup sets larger than expected restoration time allows. Schedule quarterly restore tests to a non-production environment and document the actual restore time.',
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
          {output.split('\n').map((l,i)=><div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  )
}

export default function WS2025Backup() {
  return (
    <LessonLayout
      lessonId="ws2025-10"
      courseId="windows-server-2025"
      title="Server Backup & Recovery"
      courseTitle="Windows Server 2025"
      courseHref="/windows-server-2025"
      xp={80}
      readTime="~35 min"
      icon="💾"
      breadcrumbs={[
        { label:'Home', href:'/' },
        { label:'Windows Server 2025', href:'/windows-server-2025' },
        { label:'Backup & Recovery' },
      ]}
      prev={{ title:'Remote Desktop Services', href:'/windows-server-2025/rds' }}
      next={{ title:'Windows Admin Center',   href:'/windows-server-2025/wac' }}
      objectives={[
        'Apply the 3-2-1 backup rule to Windows Server environments',
        'Define RTO and RPO and use them to design backup schedules',
        'Install Windows Server Backup and configure scheduled jobs',
        'Back up Active Directory System State',
        'Perform a file and folder restore from a backup',
        'Schedule and document regular restore tests',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Backups are only valuable if you can restore from them. This lesson covers
          the theory — 3-2-1, RTO, RPO — and the practice: Windows Server Backup
          configuration, System State backups for Active Directory, and critically,
          how to test that your backups actually work.
        </p>
        <Callout type="danger" icon="🔥" title="The only good backup is a tested backup">
          An untested backup is a false sense of security. Schedule quarterly restore
          tests and treat a failed restore test with the same urgency as a production
          incident — because that's exactly what it predicts.
        </Callout>
      </section>

      <section>
        <h2>Backup Types Reference</h2>
        <div className="info-card mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-surface-700">
                <tr>{['Type','What it backs up','Speed','Storage','Best for'].map(h=>(
                  <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {[
                  ['Full','All selected data','Slow','High','Weekly baseline'],
                  ['Incremental','Changed since last backup/incremental','Fast','Low','Daily — fast, space-efficient'],
                  ['Differential','Changed since last FULL','Medium','Medium','Daily — simpler restore than incremental'],
                  ['System State','AD DB, SYSVOL, Registry, Boot files','Medium','Medium','Domain Controllers'],
                  ['Bare Metal','Entire disk/system image','Slow','Very High','Disaster recovery to new hardware'],
                ].map(r=>(
                  <tr key={r[0]} className="hover:bg-surface-700/30">
                    {r.map((c,i)=>(
                      <td key={i} className={`px-3 py-2 ${i===0?'font-bold text-white':'text-slate-400'}`}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2>Windows Server Backup with PowerShell</h2>
        <CodeBlock title="Configure scheduled backup via PowerShell" language="powershell"
          code={CODE_WS2025BACKUP_1} />
      </section>

      <section>
        <h2>Active Directory System State Backup</h2>
        <CodeBlock title="Back up and restore AD System State" language="powershell"
          code={CODE_WS2025BACKUP_2} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB WS-10</span>
            <span className="text-sm font-semibold text-white">Configure and Test Backup on DC01</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Install Windows Server Backup and check backup history."
              command={CODE_WS2025BACKUP_3}
              output={CODE_WS2025BACKUP_4}
            />
            <LabStep number={2}
              description="Enable the AD Recycle Bin for easy object recovery."
              command={CODE_WS2025BACKUP_5}
              output={CODE_WS2025BACKUP_6}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="ws2025-10" title="Server Backup & Recovery Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={40} />
      </section>
    </LessonLayout>
  )
}
