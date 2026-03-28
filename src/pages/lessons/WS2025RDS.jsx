import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_WS2025RDS_1 = `# Quick deployment — all roles on one server (lab/small environments)
Install-WindowsFeature RDS-RD-Server, RDS-Connection-Broker, RDS-Web-Access, RDS-Licensing -IncludeManagementTools

# Verify installation
Get-WindowsFeature | Where-Object {$_.Name -like 'RDS-*' -and $_.InstallState -eq 'Installed'} |
  Select-Object Name, DisplayName | Format-Table -AutoSize`
const CODE_WS2025RDS_2 = `# List all active RDS sessions
Get-RDUserSession -ConnectionBroker DC01.lab.local |
  Select-Object UserName, HostServer, SessionState, IdleTime |
  Format-Table -AutoSize

# Disconnect a specific session
$session = Get-RDUserSession | Where-Object UserName -eq 'jsmith'
Disconnect-RDUser -HostServer $session.HostServer -UnifiedSessionID $session.UnifiedSessionId -Force

# Get server load
Get-RDServer -ConnectionBroker DC01.lab.local -Role RDS-RD-SERVER |
  ForEach-Object {
    $load = (Get-RDSessionHost -SessionHost $_.Server -ConnectionBroker DC01.lab.local).RDSessionHostCurrentSessions
    [PSCustomObject]@{Server=$_.Server; ActiveSessions=$load}
  }`
const CODE_WS2025RDS_3 = `# Check RDP enabled state
(Get-ItemProperty 'HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server').fDenyTSConnections
# 0 = enabled, 1 = disabled

# Enable if needed
Set-ItemProperty 'HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server' fDenyTSConnections -Value 0
Enable-NetFirewallRule -DisplayGroup 'Remote Desktop'

# Who is connected right now?
query session /server:DC01`


const QUIZ_QUESTIONS = [
  {
    id:'q1', question:'What is the difference between Remote Desktop Services (RDS) and a plain RDP connection?',
    options:['They are identical','RDS is a full platform for publishing apps/desktops to many users with licensing, session brokers, and gateways; plain RDP is a direct point-to-point connection to one server','RDS uses a different port than RDP','RDS requires Active Directory; RDP does not'],
    correct:1, explanation:'A plain RDP connection (mstsc.exe) connects directly to one server desktop. RDS is a platform: Session Host (multi-user sessions), Connection Broker (load balances sessions), Web Access (browser-based launch), Gateway (secure external access over HTTPS), RemoteApp (publish individual applications). RDS scales from 2 users to thousands with proper infrastructure.'
  },
  {
    id:'q2', question:'What is a RemoteApp and how does it differ from a full desktop session?',
    options:['RemoteApp is a mobile application version of Windows software','A RemoteApp publishes a single application over RDP — users see only the application window, not the full remote desktop, making it feel like the app runs locally','RemoteApp requires a separate license from full desktop RDS','RemoteApp only works over LAN, not WAN connections'],
    correct:1, explanation:'RemoteApp presents a single application (e.g. a legacy line-of-business app) as if it were running locally. The user sees the application window without the full remote desktop background. This is ideal for legacy app delivery — the app runs on a centralised server but appears local. Published via RDS Web Access or distributed as .rdp files.'
  },
  {
    id:'q3', question:'What is the purpose of an RD Gateway?',
    options:['It balances load between multiple Session Hosts','It provides HTTPS-encapsulated RDP access for external users without requiring a VPN, using port 443','It manages RDS CAL licenses across the infrastructure','It caches commonly-used applications to speed up session launch'],
    correct:1, explanation:'RD Gateway wraps RDP traffic in HTTPS (port 443) enabling external users to connect to internal RDS infrastructure through the internet without a VPN. Users connect to gateway.company.com:443 and the gateway securely proxies their session to the internal Session Hosts. Supports certificate authentication and integrates with NPS for MFA policies.'
  },
  {
    id:'q4', question:'What is an RDS CAL (Client Access License) and when is it required?',
    options:['A certificate for encrypting RDS connections','A per-user or per-device license required for each entity that connects to RDS Session Host — required beyond the 2-connection grace period, enforced by the RDS Licensing Server','A network access control policy for RDS connections','A backup license used when the primary RDS server is offline'],
    correct:1, explanation:'RDS CALs are Microsoft licenses for multi-user RDS access. Two modes: Per User (one CAL per user account, regardless of devices) or Per Device (one CAL per device, regardless of users). After a 120-day grace period, RDS Licensing Server must be configured or sessions are refused. The licensing server tracks and issues temporary tokens to clients. Domain Controllers cannot serve as licensing servers in some configurations.'
  },
  {
    id:'q5', question:'What does the RD Connection Broker do in an RDS deployment?',
    options:['It encrypts the connection between client and Session Host','It manages session load balancing across multiple Session Hosts and reconnects disconnected users to their existing session on the correct server','It brokers CAL licenses to connecting clients','It translates RDP traffic from older clients to newer protocol versions'],
    correct:1, explanation:'The Connection Broker is the intelligence of an RDS farm. When a user connects, the broker: checks if they have an existing disconnected session (reconnect them to it), load balances new sessions across Session Hosts based on connection count or custom rules, and manages RemoteApp and VDI desktop assignments. Essential for redundancy — without a broker, adding multiple Session Hosts requires manual session management.'
  },
]

function Callout({ type='info', icon, title, children }) {
  const s = { info:'callout-info', warning:'callout-warning', success:'callout-success' }
  return (<div className={`callout ${s[type]}`}><span className="callout-icon">{icon}</span><div className="callout-body">{title && <strong>{title}</strong>}{children}</div></div>)
}

function LabStep({ number, description, command, language='powershell', output }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 rounded-full bg-accent-amber/20 border border-accent-amber/30 text-accent-amber text-[11px] font-bold font-mono flex items-center justify-center flex-shrink-0 mt-0.5">{number}</span>
        <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
      </div>
      {command && <div className="ml-9"><CodeBlock code={command} language={language} showCopy /></div>}
      {output && (<div className="ml-9 rounded-xl bg-surface-950 border border-surface-700 px-4 py-3 font-mono text-xs text-accent-green leading-6">{output.split('\n').map((l,i)=><div key={i}>{l}</div>)}</div>)}
    </div>
  )
}

export default function WS2025RDS() {
  return (
    <LessonLayout
      lessonId="ws2025-09" courseId="windows-server-2025"
      title="Remote Desktop Services" courseTitle="Windows Server 2025"
      courseHref="/windows-server-2025" xp={90} readTime="~35 min" icon="🖥️"
      breadcrumbs={[{label:'Home',href:'/'},{label:'Windows Server 2025',href:'/windows-server-2025'},{label:'Remote Desktop Services'}]}
      prev={{ title:'File Services & DFS', href:'/windows-server-2025/file-services' }}
      next={{ title:'Server Backup & Recovery', href:'/windows-server-2025/backup' }}
      objectives={['Install and configure RDS roles','Publish RemoteApp applications','Configure RD Gateway for external access','Understand RDS CAL licensing','Monitor RDS sessions with PowerShell','Troubleshoot common RDS connection issues']}
    >
      <section>
        <h2>Overview</h2>
        <p>Remote Desktop Services delivers Windows desktops and applications to users from a central server — essential for remote work scenarios, legacy application hosting, and centralised desktop management.</p>
      </section>
      <section>
        <h2>RDS Role Installation</h2>
        <CodeBlock title="Install RDS roles" language="powershell"
          code={CODE_WS2025RDS_1} />
      </section>
      <section>
        <h2>Managing Sessions with PowerShell</h2>
        <CodeBlock title="RDS session management" language="powershell"
          code={CODE_WS2025RDS_2} />
      </section>
      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB WS-9</span>
            <span className="text-sm font-semibold text-white">Enable and Test RDP on DC01</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~15 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1} description="Verify RDP is enabled and check current sessions."
              command={CODE_WS2025RDS_3}
              output={["0","","SESSIONNAME  USERNAME       ID  STATE   TYPE","console      Administrator   1  Active"]} />
          </div>
        </div>
      </section>
      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="ws2025-09" title="Remote Desktop Services Quiz" questions={QUIZ_QUESTIONS} passingScore={70} xpReward={45} />
      </section>
    </LessonLayout>
  )
}
