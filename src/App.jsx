import React from 'react'
import { Routes, Route } from 'react-router-dom'

// ── Pages ─────────────────────────────────────────────────────────────────────
import Layout          from './layout/Layout.jsx'
import Home            from './pages/Home.jsx'
import Dashboard       from './pages/Dashboard.jsx'
import Glossary        from './pages/Glossary.jsx'
import Certificate     from './pages/Certificate.jsx'
import SearchResults   from './pages/SearchResults.jsx'
import CheatSheets     from './pages/CheatSheets.jsx'
import ITModels        from './pages/ITModels.jsx'
import PortLookup      from './pages/PortLookup.jsx'
import VmwareSetup     from './pages/VmwareSetup.jsx'

// ── Course index pages ────────────────────────────────────────────────────────
import Windows           from './pages/Windows.jsx'
import WindowsServer2025 from './pages/WindowsServer2025.jsx'
import Linux             from './pages/Linux.jsx'
import Unix              from './pages/Unix.jsx'
import Networking        from './pages/Networking.jsx'
import Python            from './pages/Python.jsx'
import Cybersecurity     from './pages/Cybersecurity.jsx'
import PowerShell        from './pages/PowerShell.jsx'
import DevOps            from './pages/DevOps.jsx'
import Troubleshooting   from './pages/Troubleshooting.jsx'

// ── Windows Desktop lessons ───────────────────────────────────────────────────
import WindowsArchitecture  from './pages/lessons/WindowsArchitecture.jsx'
import WindowsPermissions   from './pages/lessons/WindowsPermissions.jsx'
import WindowsRegistry      from './pages/lessons/WindowsRegistry.jsx'
import WindowsProcesses     from './pages/lessons/WindowsProcesses.jsx'
import WindowsNetworking    from './pages/lessons/WindowsNetworking.jsx'
import WindowsEventViewer   from './pages/lessons/WindowsEventViewer.jsx'

// ── Unix lessons ──────────────────────────────────────────────────────────────
import UnixPhilosophy    from './pages/lessons/UnixPhilosophy.jsx'
import UnixPOSIXShell    from './pages/lessons/UnixPOSIXShell.jsx'
import UnixBSD           from './pages/lessons/UnixBSD.jsx'
import UnixPermissions   from './pages/lessons/UnixPermissions.jsx'
import UnixProcesses     from './pages/lessons/UnixProcesses.jsx'

// ── Windows Server 2025 lessons ───────────────────────────────────────────────
import WS2025Intro        from './pages/lessons/WS2025Intro.jsx'
import ActiveDirectory    from './pages/lessons/ActiveDirectory.jsx'
import DHCP               from './pages/lessons/DHCP.jsx'
import DNS                from './pages/lessons/DNS.jsx'
import GroupPolicy        from './pages/lessons/GroupPolicy.jsx'
import HyperV             from './pages/lessons/HyperV.jsx'
import WS2025FileServices from './pages/lessons/WS2025FileServices.jsx'
import WindowsFirewall    from './pages/lessons/WindowsFirewall.jsx'
import WS2025RDS          from './pages/lessons/WS2025RDS.jsx'
import WS2025Backup       from './pages/lessons/WS2025Backup.jsx'
import WS2025WAC          from './pages/lessons/WS2025WAC.jsx'
import WS2025Hardening    from './pages/lessons/WS2025Hardening.jsx'

// ── Linux lessons ─────────────────────────────────────────────────────────────
import LinuxFilesystem    from './pages/lessons/LinuxFilesystem.jsx'
import LinuxShell         from './pages/lessons/LinuxShell.jsx'
import LinuxPermissions   from './pages/lessons/LinuxPermissions.jsx'
import LinuxPackages      from './pages/lessons/LinuxPackages.jsx'
import LinuxSystemd       from './pages/lessons/LinuxSystemd.jsx'
import LinuxNetworking    from './pages/lessons/LinuxNetworking.jsx'
import LinuxSSH           from './pages/lessons/LinuxSSH.jsx'
import LinuxFirewall      from './pages/lessons/LinuxFirewall.jsx'
import LinuxDisk          from './pages/lessons/LinuxDisk.jsx'
import LinuxHardening     from './pages/lessons/LinuxHardening.jsx'

// ── Networking lessons ────────────────────────────────────────────────────────
import OSIModel             from './pages/lessons/OSIModel.jsx'
import TCPIP                from './pages/lessons/TCPIP.jsx'
import NetworkingSubnetting from './pages/lessons/NetworkingSubnetting.jsx'
import NetworkingVLANs      from './pages/lessons/NetworkingVLANs.jsx'

// ── PowerShell lessons ────────────────────────────────────────────────────────
import PowerShellFundamentals from './pages/lessons/PowerShellFundamentals.jsx'
import PowerShellPipeline     from './pages/lessons/PowerShellPipeline.jsx'
import PowerShellScripting    from './pages/lessons/PowerShellScripting.jsx'
import PSActiveDirectory      from './pages/lessons/PSActiveDirectory.jsx'
import PSRemoting             from './pages/lessons/PSRemoting.jsx'
import PSFilesystem           from './pages/lessons/PSFilesystem.jsx'
import PSDSC                  from './pages/lessons/PSDSC.jsx'
import PSReporting            from './pages/lessons/PSReporting.jsx'

// ── Cybersecurity lessons ─────────────────────────────────────────────────────
import CIATriad                       from './pages/lessons/CIATriad.jsx'
import ThreatModelling                from './pages/lessons/ThreatModelling.jsx'
import CybersecurityWindowsHardening  from './pages/lessons/CybersecurityWindowsHardening.jsx'
import CybersecurityLinuxHardening    from './pages/lessons/CybersecurityLinuxHardening.jsx'
import CybersecurityFirewall          from './pages/lessons/CybersecurityFirewall.jsx'
import CybersecurityPKI               from './pages/lessons/CybersecurityPKI.jsx'
import CybersecurityIDSSIEM           from './pages/lessons/CybersecurityIDSSIEM.jsx'
import CybersecurityVulnScanning      from './pages/lessons/CybersecurityVulnScanning.jsx'
import CybersecurityIncidentResponse  from './pages/lessons/CybersecurityIncidentResponse.jsx'
import CybersecurityADSecurity        from './pages/lessons/CybersecurityADSecurity.jsx'

// ── Python lessons ────────────────────────────────────────────────────────────
import PythonBasics      from './pages/lessons/PythonBasics.jsx'
import PythonAutomation  from './pages/lessons/PythonAutomation.jsx'
import PythonSubprocess  from './pages/lessons/PythonSubprocess.jsx'
import PythonNetworking  from './pages/lessons/PythonNetworking.jsx'
import PythonLogParsing  from './pages/lessons/PythonLogParsing.jsx'
import PythonScheduling  from './pages/lessons/PythonScheduling.jsx'
import PythonMonitoring  from './pages/lessons/PythonMonitoring.jsx'
import PythonAnsible     from './pages/lessons/PythonAnsible.jsx'
import PythonCLITool     from './pages/lessons/PythonCLITool.jsx'

// ── Networking lessons ────────────────────────────────────────────────────────
import NetworkingRouting              from './pages/lessons/NetworkingRouting.jsx'
import NetworkingDNS                  from './pages/lessons/NetworkingDNS.jsx'
import NetworkingTroubleshootingLesson from './pages/lessons/NetworkingTroubleshootingLesson.jsx'

// ── DevOps lessons ────────────────────────────────────────────────────────────
import DevOpsPrinciples  from './pages/lessons/DevOpsPrinciples.jsx'
import DevOpsGit         from './pages/lessons/DevOpsGit.jsx'
import DockerContainers  from './pages/lessons/DockerContainers.jsx'
import DevOpsCICD        from './pages/lessons/DevOpsCICD.jsx'
import DevOpsTerraform   from './pages/lessons/DevOpsTerraform.jsx'
import DevOpsAnsible     from './pages/lessons/DevOpsAnsible.jsx'
import DevOpsKubernetes  from './pages/lessons/DevOpsKubernetes.jsx'
import DevOpsMonitoring  from './pages/lessons/DevOpsMonitoring.jsx'

// ── Troubleshooting lessons ───────────────────────────────────────────────────
import TroubleshootingMethodology      from './pages/lessons/TroubleshootingMethodology.jsx'
import WindowsTroubleshooting          from './pages/lessons/WindowsTroubleshooting.jsx'
import LinuxTroubleshooting            from './pages/lessons/LinuxTroubleshooting.jsx'
import TroubleshootingNetworking       from './pages/lessons/TroubleshootingNetworking.jsx'
import TroubleshootingActiveDirectory  from './pages/lessons/TroubleshootingActiveDirectory.jsx'
import TroubleshootingPerformance      from './pages/lessons/TroubleshootingPerformance.jsx'

// ── Polished "Coming Soon" placeholder ────────────────────────────────────────
const Placeholder = ({ title }) => {
  const isLesson = title && !title.includes('not found')
  const course = title?.replace(/\s*[—–-].*/, '').trim() || ''
  const lesson = title?.replace(/^.*[—–-]\s*/, '').trim() || ''

  if (!isLesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
        <div className="text-6xl">🔍</div>
        <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
        <p className="text-slate-400 text-sm">The page you're looking for doesn't exist.</p>
        <a href="/" className="btn-primary mt-2">Back to Home</a>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center text-center gap-6">
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20
                      flex items-center justify-center text-4xl">
        📖
      </div>

      {/* Heading */}
      <div>
        <div className="tag mb-3">{course}</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {lesson || title}
        </h1>
        <p className="text-slate-400 mt-3 text-sm leading-relaxed max-w-md mx-auto">
          This lesson is actively being developed and will be available in the next
          platform update. The course structure and learning path are already set up —
          content is being written and reviewed.
        </p>
      </div>

      {/* Status card */}
      <div className="card p-5 w-full text-left">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-accent-amber animate-pulse" />
          <span className="text-xs font-semibold text-accent-amber uppercase tracking-widest">
            In Development
          </span>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          While you wait, explore other available lessons in this course or try a
          different learning path. All core courses have multiple complete lessons
          available right now.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <a href={`/${course.toLowerCase().replace(/\s+/g, '-')}`}
           className="btn-primary">
          ← Back to {course || 'Course'}
        </a>
        <a href="/" className="btn-secondary">Browse All Courses</a>
        <a href="/dashboard" className="btn-ghost">My Dashboard</a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>

        {/* ── Utility pages ─────────────────────────────────────── */}
        <Route index             element={<Home />} />
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="glossary"   element={<Glossary />} />
        <Route path="certificate" element={<Certificate />} />
        <Route path="search"     element={<SearchResults />} />
        <Route path="cheatsheets" element={<CheatSheets />} />
        <Route path="it-models"  element={<ITModels />} />
        <Route path="port-lookup" element={<PortLookup />} />
        <Route path="vmware-setup" element={<VmwareSetup />} />

        {/* ── Course index pages ────────────────────────────────── */}
        <Route path="windows"             element={<Windows />} />
        <Route path="windows-server-2025" element={<WindowsServer2025 />} />
        <Route path="linux"               element={<Linux />} />
        <Route path="unix"                element={<Unix />} />
        <Route path="networking"          element={<Networking />} />
        <Route path="python"              element={<Python />} />
        <Route path="cybersecurity"       element={<Cybersecurity />} />
        <Route path="powershell"          element={<PowerShell />} />
        <Route path="devops"              element={<DevOps />} />
        <Route path="troubleshooting"     element={<Troubleshooting />} />

        {/* ── Windows Desktop lessons ───────────────────────────── */}
        <Route path="windows/architecture"  element={<WindowsArchitecture />} />
        <Route path="windows/permissions"   element={<WindowsPermissions />} />
        <Route path="windows/registry"      element={<WindowsRegistry />} />
        <Route path="windows/processes"     element={<WindowsProcesses />} />
        <Route path="windows/networking"    element={<WindowsNetworking />} />
        <Route path="windows/event-viewer"  element={<WindowsEventViewer />} />
        <Route path="windows/:lesson"       element={<Placeholder title="Windows Desktop — lesson coming soon" />} />

        {/* ── Windows Server 2025 lessons ───────────────────────── */}
        <Route path="windows-server-2025/intro"            element={<WS2025Intro />} />
        <Route path="windows-server-2025/active-directory" element={<ActiveDirectory />} />
        <Route path="windows-server-2025/dhcp"             element={<DHCP />} />
        <Route path="windows-server-2025/dns"              element={<DNS />} />
        <Route path="windows-server-2025/group-policy"     element={<GroupPolicy />} />
        <Route path="windows-server-2025/hyper-v"          element={<HyperV />} />
        <Route path="windows-server-2025/file-services"    element={<WS2025FileServices />} />
        <Route path="windows-server-2025/firewall"         element={<WindowsFirewall />} />
        <Route path="windows-server-2025/rds"              element={<WS2025RDS />} />
        <Route path="windows-server-2025/backup"           element={<WS2025Backup />} />
        <Route path="windows-server-2025/wac"              element={<WS2025WAC />} />
        <Route path="windows-server-2025/hardening"        element={<WS2025Hardening />} />
        <Route path="windows-server-2025/:lesson"          element={<Placeholder title="Windows Server 2025 — lesson coming soon" />} />

        {/* ── Unix lessons ──────────────────────────────────────── */}
        <Route path="unix/philosophy"  element={<UnixPhilosophy />} />
        <Route path="unix/posix-shell" element={<UnixPOSIXShell />} />
        <Route path="unix/bsd"         element={<UnixBSD />} />
        <Route path="unix/permissions" element={<UnixPermissions />} />
        <Route path="unix/processes"   element={<UnixProcesses />} />
        <Route path="unix/:lesson"     element={<Placeholder title="Unix — lesson coming soon" />} />

        {/* ── Linux lessons ─────────────────────────────────────── */}
        <Route path="linux/filesystem"  element={<LinuxFilesystem />} />
        <Route path="linux/shell"       element={<LinuxShell />} />
        <Route path="linux/permissions" element={<LinuxPermissions />} />
        <Route path="linux/packages"    element={<LinuxPackages />} />
        <Route path="linux/systemd"     element={<LinuxSystemd />} />
        <Route path="linux/networking"  element={<LinuxNetworking />} />
        <Route path="linux/ssh"         element={<LinuxSSH />} />
        <Route path="linux/firewall"    element={<LinuxFirewall />} />
        <Route path="linux/disk"        element={<LinuxDisk />} />
        <Route path="linux/hardening"   element={<LinuxHardening />} />
        <Route path="linux/:lesson"     element={<Placeholder title="Linux — lesson coming soon" />} />

        {/* ── Networking lessons ────────────────────────────────── */}
        <Route path="networking/osi-model"  element={<OSIModel />} />
        <Route path="networking/tcp-ip"     element={<TCPIP />} />
        <Route path="networking/subnetting" element={<NetworkingSubnetting />} />
        <Route path="networking/vlans"      element={<NetworkingVLANs />} />
        <Route path="networking/routing"    element={<NetworkingRouting />} />
        <Route path="networking/dns"            element={<NetworkingDNS />} />
        <Route path="networking/troubleshooting" element={<NetworkingTroubleshootingLesson />} />
        <Route path="networking/:lesson"         element={<Placeholder title="Networking — lesson coming soon" />} />

        {/* ── PowerShell lessons ────────────────────────────────── */}
        <Route path="powershell/fundamentals"     element={<PowerShellFundamentals />} />
        <Route path="powershell/pipeline"         element={<PowerShellPipeline />} />
        <Route path="powershell/scripting"        element={<PowerShellScripting />} />
        <Route path="powershell/active-directory" element={<PSActiveDirectory />} />
        <Route path="powershell/remoting"         element={<PSRemoting />} />
        <Route path="powershell/filesystem"       element={<PSFilesystem />} />
        <Route path="powershell/dsc"              element={<PSDSC />} />
        <Route path="powershell/reporting"        element={<PSReporting />} />
        <Route path="powershell/:lesson"          element={<Placeholder title="PowerShell — lesson coming soon" />} />

        {/* ── Cybersecurity lessons ─────────────────────────────── */}
        <Route path="cybersecurity/cia-triad"         element={<CIATriad />} />
        <Route path="cybersecurity/threat-modelling"  element={<ThreatModelling />} />
        <Route path="cybersecurity/windows-hardening" element={<CybersecurityWindowsHardening />} />
        <Route path="cybersecurity/linux-hardening"   element={<CybersecurityLinuxHardening />} />
        <Route path="cybersecurity/firewall"          element={<CybersecurityFirewall />} />
        <Route path="cybersecurity/pki"               element={<CybersecurityPKI />} />
        <Route path="cybersecurity/ids-siem"          element={<CybersecurityIDSSIEM />} />
        <Route path="cybersecurity/vuln-scanning"     element={<CybersecurityVulnScanning />} />
        <Route path="cybersecurity/incident-response" element={<CybersecurityIncidentResponse />} />
        <Route path="cybersecurity/ad-security"       element={<CybersecurityADSecurity />} />
        <Route path="cybersecurity/:lesson"           element={<Placeholder title="Cybersecurity — lesson coming soon" />} />

        {/* ── Python lessons ────────────────────────────────────── */}
        <Route path="python/basics"       element={<PythonBasics />} />
        <Route path="python/filesystem"   element={<PythonAutomation />} />
        <Route path="python/subprocess"   element={<PythonSubprocess />} />
        <Route path="python/networking"   element={<PythonNetworking />} />
        <Route path="python/log-parsing"  element={<PythonLogParsing />} />
        <Route path="python/scheduling"   element={<PythonScheduling />} />
        <Route path="python/monitoring"   element={<PythonMonitoring />} />
        <Route path="python/ansible"      element={<PythonAnsible />} />
        <Route path="python/cli-tool"     element={<PythonCLITool />} />
        <Route path="python/:lesson"      element={<Placeholder title="Python — lesson coming soon" />} />

        {/* ── DevOps lessons ────────────────────────────────────── */}
        <Route path="devops/principles" element={<DevOpsPrinciples />} />
        <Route path="devops/git"        element={<DevOpsGit />} />
        <Route path="devops/docker"     element={<DockerContainers />} />
        <Route path="devops/cicd"       element={<DevOpsCICD />} />
        <Route path="devops/terraform"  element={<DevOpsTerraform />} />
        <Route path="devops/ansible"    element={<DevOpsAnsible />} />
        <Route path="devops/kubernetes" element={<DevOpsKubernetes />} />
        <Route path="devops/monitoring" element={<DevOpsMonitoring />} />
        <Route path="devops/:lesson"    element={<Placeholder title="DevOps — lesson coming soon" />} />

        {/* ── Troubleshooting lessons ───────────────────────────── */}
        <Route path="troubleshooting/methodology"      element={<TroubleshootingMethodology />} />
        <Route path="troubleshooting/windows"          element={<WindowsTroubleshooting />} />
        <Route path="troubleshooting/linux"            element={<LinuxTroubleshooting />} />
        <Route path="troubleshooting/networking"       element={<TroubleshootingNetworking />} />
        <Route path="troubleshooting/active-directory" element={<TroubleshootingActiveDirectory />} />
        <Route path="troubleshooting/performance"      element={<TroubleshootingPerformance />} />
        <Route path="troubleshooting/:lesson"          element={<Placeholder title="Troubleshooting — lesson coming soon" />} />

        {/* ── 404 catch-all ─────────────────────────────────────── */}
        <Route path="*" element={<Placeholder title="Page not found" />} />

      </Route>
    </Routes>
  )
}
