import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_WS2025HARDENING_1 = `# ── SMBv1 (EternalBlue / WannaCry vector) ────────────────────
# Check
Get-SmbServerConfiguration | Select-Object EnableSMB1Protocol
# Disable
Set-SmbServerConfiguration -EnableSMB1Protocol $false -Force

# ── SMB Signing (prevent NTLM relay attacks) ─────────────────
Set-SmbServerConfiguration -RequireSecuritySignature $true -Force
Set-SmbServerConfiguration -EnableSecuritySignature $true -Force
Set-SmbClientConfiguration -RequireSecuritySignature $true -Force

# ── SMB Encryption (3.0+) ────────────────────────────────────
Set-SmbServerConfiguration -EncryptData $true -Force

# ── Disable TLS 1.0 and 1.1 via registry ────────────────────
$tlsBase = 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\SecurityProviders\\SCHANNEL\\Protocols'
foreach ($ver in @('TLS 1.0','TLS 1.1')) {
    New-Item "$tlsBase\\$ver\\Server" -Force | Out-Null
    Set-ItemProperty "$tlsBase\\$ver\\Server" Enabled -Value 0 -Type DWord
    Set-ItemProperty "$tlsBase\\$ver\\Server" DisabledByDefault -Value 1 -Type DWord
}

# ── Disable LLMNR and NetBIOS (Responder mitigation) ─────────
# Via Group Policy:
# Computer Config > Admin Templates > Network > DNS Client
# > Turn off multicast name resolution = Enabled

# Disable NetBIOS on all NICs via registry
$nics = Get-WmiObject Win32_NetworkAdapterConfiguration | Where-Object IPEnabled
$nics | ForEach-Object { $_.SetTcpipNetbios(2) }   # 2 = Disable`
const CODE_WS2025HARDENING_2 = `# ── Verify Defender is running ───────────────────────────────
Get-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled,
  AntispywareEnabled, BehaviorMonitorEnabled

# ── Enable cloud protection and automatic submission ──────────
Set-MpPreference -MAPSReporting Advanced
Set-MpPreference -SubmitSamplesConsent 1
Set-MpPreference -CloudBlockLevel High

# ── Attack Surface Reduction (ASR) rules ─────────────────────
# Block Office from creating child processes
Add-MpPreference -AttackSurfaceReductionRules_Ids D4F940AB-401B-4EFC-AADC-AD5F3C50688A \`\`
  -AttackSurfaceReductionRules_Actions Enabled

# Block credential stealing from LSASS
Add-MpPreference -AttackSurfaceReductionRules_Ids 9E6C4E1F-7D60-472F-BA1A-A39EF669E4B0 \`\`
  -AttackSurfaceReductionRules_Actions Enabled

# Block execution of potentially obfuscated scripts
Add-MpPreference -AttackSurfaceReductionRules_Ids 5BEB7EFE-FD9A-4556-801D-275E5FFC04CC \`\`
  -AttackSurfaceReductionRules_Actions Enabled

# ── Quick update check ────────────────────────────────────────
Update-MpSignature
Get-MpComputerStatus | Select-Object AntivirusSignatureLastUpdated`
const CODE_WS2025HARDENING_3 = `# Hardening status report
$report = [ordered]@{
    Timestamp   = Get-Date -Format 'yyyy-MM-dd HH:mm'
    SMBv1       = (Get-SmbServerConfiguration).EnableSMB1Protocol
    SMBSigning  = (Get-SmbServerConfiguration).RequireSecuritySignature
    SMBEncrypt  = (Get-SmbServerConfiguration).EncryptData
    PrintSpooler = (Get-Service Spooler).StartType -ne 'Disabled'
    DefenderOn  = (Get-MpComputerStatus).RealTimeProtectionEnabled
    WinRMEnabled = (Get-Service WinRM).Status -eq 'Running'
    RemoteReg   = (Get-Service RemoteRegistry).StartType -ne 'Disabled'
}

$report.GetEnumerator() | ForEach-Object {
    $status = if ($_.Value -eq $true -or $_.Value -eq $false) {
        if ($_.Key -in @('SMBv1','PrintSpooler','RemoteReg')) {
            if (-not $_.Value) { '[OK] Disabled' } else { '[WARN] Enabled' }
        } else {
            if ($_.Value) { '[OK] Enabled' } else { '[WARN] Disabled' }
        }
    } else { $_.Value }
    Write-Host "  $($_.Key.PadRight(15)) $status"
}`
const CODE_WS2025HARDENING_4 = `  Timestamp       2025-01-15 11:00
  SMBv1           [OK] Disabled
  SMBSigning      [OK] Enabled
  SMBEncrypt      [WARN] Disabled   <- action required
  PrintSpooler    [OK] Disabled
  DefenderOn      [OK] Enabled
  WinRMEnabled    [OK] Enabled
  RemoteReg       [OK] Disabled`
const CODE_WS2025HARDENING_5 = `# Fix: enable SMB encryption
Set-SmbServerConfiguration -EncryptData $true -Force

# Verify
Get-SmbServerConfiguration | Select-Object EncryptData, RequireSecuritySignature
Write-Host 'DC01 hardening complete' -ForegroundColor Green`
const CODE_WS2025HARDENING_6 = `EncryptData  RequireSecuritySignature
-----------  -----------------------
True         True

DC01 hardening complete`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is a Server Core installation and what is its primary security advantage?',
    options: [
      'A minimal Windows Server install with no GUI — smaller attack surface, fewer patches needed, lower resource usage',
      'A virtual machine template for rapid server deployment',
      'A read-only installation mode for database servers',
      'A containerised version of Windows Server',
    ],
    correct: 0,
    explanation: 'Server Core removes the GUI shell (explorer.exe, IE, most graphical components), leaving only command-line management via PowerShell, cmd, and remote tools. Benefits: fewer installed components = fewer CVEs to patch, smaller memory footprint (~1GB vs ~2GB), remote management enforced (admins must use WinRM/RSAT rather than logging in locally). Microsoft recommends Server Core for all new deployments.',
  },
  {
    id: 'q2',
    question: 'What is the principle of least privilege and how does it apply to Windows service accounts?',
    options: [
      'Privilege should be allocated based on seniority of the employee',
      'Every account and service should operate with only the minimum permissions needed — service accounts should not be members of Domain Admins, Local Admins, or have rights beyond their specific function',
      'Privileges should be least for external users and most for internal users',
      'Privilege levels should be reduced after business hours',
    ],
    correct: 1,
    explanation: 'Least privilege limits blast radius when a service account is compromised. A SQL Server service account needs: Log on as a service right, read/write access to the SQL data directory, and nothing else. Not Local Admin, not Domain Admin. Use Group Managed Service Accounts (gMSAs) for Windows services — they get automatic password rotation with no admin effort, and can be restricted to specific servers.',
  },
  {
    id: 'q3',
    question: 'What does enabling "Windows Defender Credential Guard" protect against?',
    options: [
      'Brute-force attacks against Active Directory accounts',
      'Pass-the-Hash and Pass-the-Ticket attacks by isolating credential material (NTLM hashes, Kerberos tickets) in a Virtualization-Based Security container inaccessible to even privileged processes',
      'Credential stuffing attacks from external sources',
      'Weak password selection by users',
    ],
    correct: 1,
    explanation: 'Credential Guard uses Hyper-V Virtualization-Based Security to run the LSASS process in an isolated container. Even if an attacker gains SYSTEM access and tries to run Mimikatz, the credential material (NTLM hashes, Kerberos tickets) is in a protected container they cannot access. Requires: 64-bit Windows, UEFI 2.3.1+, Secure Boot, Virtualization extensions (VT-x/AMD-V). Enabled via Group Policy or MDM.',
  },
  {
    id: 'q4',
    question: 'What is SMB signing and why is it important on a Windows Server network?',
    options: [
      'A digital certificate applied to SMB file shares for HTTPS-like encryption',
      'Cryptographic signing of SMB packets that prevents man-in-the-middle (NTLM relay) attacks where an attacker intercepts and replays authentication between a client and server',
      'A feature that logs all SMB connections for auditing',
      'An SMB version indicator that shows which protocol version is in use',
    ],
    correct: 1,
    explanation: 'SMB signing adds a cryptographic signature to every SMB packet using the session key established during authentication. Without it, an attacker on the network can intercept SMB authentication (NTLM relay attack) and relay it to another server, potentially gaining access as the victim. SMB signing is required on Domain Controllers by default. Enable it on all servers: Set-SmbServerConfiguration -RequireSecuritySignature $true.',
  },
  {
    id: 'q5',
    question: 'What is the purpose of Windows Security Baselines from Microsoft?',
    options: [
      'A list of recommended hardware specifications for running Windows Server',
      'Pre-configured Group Policy settings representing Microsoft\'s recommended security configuration — tested to not break typical enterprise functionality while significantly reducing attack surface',
      'Baseline performance benchmarks for Windows Server workloads',
      'A tool for measuring the current security posture against a minimum standard',
    ],
    correct: 1,
    explanation: 'Microsoft Security Baselines (from Microsoft Security Compliance Toolkit) are pre-built Group Policy Object exports representing Microsoft\'s recommended security settings. They cover: Windows Defender settings, account policies, auditing, network security, and Windows Firewall. Import them into GPMC and test in a lab OU before deploying production-wide. They are CIS Benchmark-equivalent from Microsoft and a solid starting point for any hardening project.',
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

export default function WS2025Hardening() {
  return (
    <LessonLayout
      lessonId="ws2025-12"
      courseId="windows-server-2025"
      title="Server Hardening & Best Practices"
      courseTitle="Windows Server 2025"
      courseHref="/windows-server-2025"
      xp={120}
      readTime="~45 min"
      icon="🔐"
      breadcrumbs={[
        { label:'Home', href:'/' },
        { label:'Windows Server 2025', href:'/windows-server-2025' },
        { label:'Server Hardening' },
      ]}
      prev={{ title:'Windows Admin Center', href:'/windows-server-2025/wac' }}
      next={null}
      objectives={[
        'Apply CIS Benchmark and Microsoft Security Baseline controls',
        'Disable legacy protocols: SMBv1, NTLM, TLS 1.0/1.1',
        'Enable SMB signing and encryption',
        'Configure Windows Defender and attack surface reduction rules',
        'Apply least-privilege to service accounts with gMSA',
        'Audit hardening status with PowerShell',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Windows Server 2025 ships with better security defaults than any previous
          version — SMBv1 is already disabled, Windows Defender is built in, and
          many legacy features are off by default. But a hardened server requires
          deliberate, layered controls beyond the defaults. This is the final lesson
          in the WS2025 course — a comprehensive hardening reference.
        </p>
      </section>

      <section>
        <h2>Disable Legacy Protocols</h2>
        <CodeBlock title="Remove dangerous legacy protocols" language="powershell"
          code={CODE_WS2025HARDENING_1} />
      </section>

      <section>
        <h2>Windows Defender Hardening</h2>
        <CodeBlock title="Configure Windows Defender and ASR rules" language="powershell"
          code={CODE_WS2025HARDENING_2} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB WS-12</span>
            <span className="text-sm font-semibold text-white">Harden DC01 and Generate a Security Audit Report</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Run a comprehensive hardening status audit on DC01."
              command={CODE_WS2025HARDENING_3}
              output={CODE_WS2025HARDENING_4}
            />
            <LabStep number={2}
              description="Apply the remaining finding — enable SMB Encryption."
              command={CODE_WS2025HARDENING_5}
              output={CODE_WS2025HARDENING_6}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to complete the Windows Server 2025 course.</p>
        <Quiz lessonId="ws2025-12" title="Server Hardening Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={60} />
      </section>
    </LessonLayout>
  )
}
