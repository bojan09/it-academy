import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_WS2025WAC_1 = `# Download WAC installer
$wacUrl = 'https://aka.ms/WACDownload'
Invoke-WebRequest -Uri $wacUrl -OutFile C:\\Temp\\WindowsAdminCenter.msi

# Install in gateway mode with HTTPS on port 443
msiexec /i C:\\Temp\\WindowsAdminCenter.msi /qn /L*v C:\\Temp\\wac-install.log SME_PORT=443 SSL_CERTIFICATE_OPTION=generate

# Wait for service to start
Start-Sleep -Seconds 30
Get-Service ServerManagementGateway | Select-Object Name, Status

# Access: https://DC01 from any browser on the network`
const CODE_WS2025WAC_2 = `# Check WinRM is running (required for WAC to manage servers)
Get-Service WinRM | Select-Object Name, Status, StartType

# Check WAC can reach itself via WinRM
Test-WSMan localhost

# Check Windows Firewall allows WinRM
Get-NetFirewallRule -DisplayName '*Windows Remote Management*' |
  Select-Object DisplayName, Enabled | Format-Table -AutoSize`
const CODE_WS2025WAC_3 = `Name   Status  StartType
----   ------  ---------
WinRM  Running Automatic

cfg     : http://schemas.microsoft.com/wbem/wsman/1/config

DisplayName                            Enabled
Windows Remote Management (HTTP-In)    True`


const QUIZ_QUESTIONS = [
  {
    id:'q1', question:'What is Windows Admin Center (WAC) and what does it replace?',
    options:['A new version of Server Manager that requires Windows Server 2025','A browser-based management tool that unifies server management, replacing the need to RDP into each server and use individual MMC snap-ins','A cloud-only tool requiring Azure subscription','A replacement for Active Directory Users and Computers'],
    correct:1, explanation:'Windows Admin Center is a browser-based, locally-deployed management hub for Windows Server, Windows 10/11 PCs, and clusters. It consolidates capabilities previously requiring separate tools: Server Manager, Device Manager, Disk Management, Hyper-V Manager, Task Manager, Registry Editor, PowerShell — all in one web interface with no cloud dependency. Runs on your on-premises gateway server.'
  },
  {
    id:'q2', question:'What are WAC Extensions and where are they obtained?',
    options:['Built-in WAC features that must be licensed separately','Community and vendor-developed plugins that add management capabilities — available in the WAC Extension Manager from Microsoft and partners like Dell, HPE, VMware','Windows Updates that extend WAC functionality','GPO templates that configure WAC settings'],
    correct:1, explanation:'WAC Extensions extend the platform with additional tools. Available from the Extension Manager (Settings > Extensions) in WAC: Microsoft provides extensions for Azure integration, Storage Spaces Direct, and Failover Cluster management. Hardware vendors (Dell, HPE) provide extensions for their hardware management. Third parties provide database, networking, and monitoring extensions. Extensions are installed from the WAC management interface without reinstalling WAC.'
  },
  {
    id:'q3', question:'What connection modes does WAC support for managing servers?',
    options:['Only direct connections over the LAN','Gateway mode (WAC runs on a dedicated server, manages remote servers via WinRM) and Desktop mode (WAC runs locally, manages local and remote systems)','Cloud-relayed connections through Azure only','VPN-only connections for security'],
    correct:1, explanation:'WAC runs in two modes: Gateway mode — installed on a dedicated management server (or VM), all connections go through it. Users open a browser to https://wacserver and manage remote servers via WinRM from the gateway. Best for teams. Desktop mode — installed on a Windows 10/11 management PC, manages that PC and connects directly to remote servers. Single-user. Both modes use WinRM for server communication and support RBAC via Windows security groups.'
  },
  {
    id:'q4', question:'What does the WAC "Packet Monitoring" feature provide?',
    options:['Bandwidth monitoring for the WAC web interface','A built-in network packet capture tool (using pktmon) that lets you capture and analyse network traffic on a managed server directly from the WAC browser interface','DNS query logging for the managed server','Firewall log analysis for the managed server'],
    correct:1, explanation:'WAC\'s Packet Monitoring extension wraps pktmon (the built-in Windows packet monitor) in a browser-friendly UI. You can start a capture, filter by protocol/port/IP, and view results without installing Wireshark or RDPing to the server. Captured data can be downloaded as a .pcapng file for analysis in Wireshark. Introduced in WAC 2103 — extremely useful for remote troubleshooting.'
  },
  {
    id:'q5', question:'What is the minimum requirement for WAC to manage servers without installing additional agents?',
    options:['Servers must be running Windows Server 2025','WinRM must be enabled and accessible on the managed servers — WAC uses existing WinRM infrastructure','WAC agent must be installed on each managed server','Managed servers must be Azure Arc-enrolled'],
    correct:1, explanation:'WAC uses WinRM (Windows Remote Management) — the same protocol as PSRemoting. No additional agent installation is required. WinRM must be enabled (Enable-PSRemoting -Force or via GPO) and port 5985 (HTTP) or 5986 (HTTPS) must be reachable from the WAC gateway. This is why WAC can immediately manage any server where PSRemoting already works — you have zero additional deployment overhead.'
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

export default function WS2025WAC() {
  return (
    <LessonLayout
      lessonId="ws2025-11" courseId="windows-server-2025"
      title="Windows Admin Center" courseTitle="Windows Server 2025"
      courseHref="/windows-server-2025" xp={60} readTime="~25 min" icon="🌐"
      breadcrumbs={[{label:'Home',href:'/'},{label:'Windows Server 2025',href:'/windows-server-2025'},{label:'Windows Admin Center'}]}
      prev={{ title:'Server Backup & Recovery', href:'/windows-server-2025/backup' }}
      next={{ title:'Server Hardening',         href:'/windows-server-2025/hardening' }}
      objectives={['Install WAC in gateway mode on DC01','Add servers to the WAC management inventory','Explore the key management tools: Performance Monitor, Event Viewer, Storage','Use WAC to manage services, certificates, and firewall rules','Install a WAC extension','Understand WAC RBAC and access control']}
    >
      <section>
        <h2>Overview</h2>
        <p>Windows Admin Center is Microsoft's modern, browser-based replacement for the fragmented world of MMC snap-ins, Server Manager, and constant RDP sessions. Install it once on a management server and manage your entire Windows fleet from a browser — no RDP required.</p>
        <Callout type="info" icon="🌐" title="No cloud required">WAC runs entirely on-premises. No Azure subscription, no internet connectivity needed. It is a locally-hosted web application that uses WinRM to reach your servers.</Callout>
      </section>
      <section>
        <h2>WAC Key Tools</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {[
            {icon:'📊',name:'Performance Monitor',desc:'Real-time CPU, memory, disk, and network charts without RDP'},
            {icon:'📋',name:'Event Viewer',desc:'Browse and filter Windows event logs in the browser'},
            {icon:'💾',name:'Storage',desc:'Manage volumes, disks, and Storage Spaces'},
            {icon:'⚙️',name:'Services',desc:'Start, stop, and configure Windows services'},
            {icon:'🔥',name:'Windows Firewall',desc:'View and manage firewall rules graphically'},
            {icon:'📜',name:'Certificates',desc:'Browse and manage the certificate store'},
            {icon:'💻',name:'PowerShell',desc:'Browser-based PowerShell terminal'},
            {icon:'🌐',name:'Network',desc:'View and configure network adapters'},
            {icon:'📁',name:'Files',desc:'Browse the server filesystem'},
          ].map(t => (
            <div key={t.name} className="info-card py-3 text-center">
              <span className="text-2xl">{t.icon}</span>
              <p className="font-bold text-white text-xs mt-1">{t.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2>Installation & Setup</h2>
        <CodeBlock title="Install WAC in gateway mode on DC01" language="powershell"
          code={CODE_WS2025WAC_1}
        />
      </section>
      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB WS-11</span>
            <span className="text-sm font-semibold text-white">Verify WAC Prerequisites on DC01</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~10 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1} description="Check all WAC prerequisites are met on DC01."
              command={CODE_WS2025WAC_2}
              output={CODE_WS2025WAC_3}
            />
          </div>
        </div>
      </section>
      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="ws2025-11" title="Windows Admin Center Quiz" questions={QUIZ_QUESTIONS} passingScore={70} xpReward={30} />
      </section>
    </LessonLayout>
  )
}
