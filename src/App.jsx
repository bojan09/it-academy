import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './layout/Layout.jsx'
import Home from './pages/Home.jsx'
import Windows from './pages/Windows.jsx'
import WindowsServer2025 from './pages/WindowsServer2025.jsx'
import Linux from './pages/Linux.jsx'
import Unix from './pages/Unix.jsx'
import Networking from './pages/Networking.jsx'
import Python from './pages/Python.jsx'
import Cybersecurity from './pages/Cybersecurity.jsx'
import PowerShell from './pages/PowerShell.jsx'
import DevOps from './pages/DevOps.jsx'
import Troubleshooting from './pages/Troubleshooting.jsx'
import CheatSheets from './pages/CheatSheets.jsx'
import ITModels from './pages/ITModels.jsx'
import PortLookup from './pages/PortLookup.jsx'
import VmwareSetup from './pages/VmwareSetup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Glossary from './pages/Glossary.jsx'
import Certificate from './pages/Certificate.jsx'
import SearchResults from './pages/SearchResults.jsx'

// ── Lessons ───────────────────────────────────────────────────────────────────
import ActiveDirectory        from './pages/lessons/ActiveDirectory.jsx'
import DHCP                   from './pages/lessons/DHCP.jsx'
import DNS                    from './pages/lessons/DNS.jsx'
import GroupPolicy            from './pages/lessons/GroupPolicy.jsx'
import HyperV                 from './pages/lessons/HyperV.jsx'
import WindowsFirewall        from './pages/lessons/WindowsFirewall.jsx'
import LinuxFilesystem        from './pages/lessons/LinuxFilesystem.jsx'
import LinuxNetworking        from './pages/lessons/LinuxNetworking.jsx'
import LinuxSSH               from './pages/lessons/LinuxSSH.jsx'
import LinuxFirewall          from './pages/lessons/LinuxFirewall.jsx'
import OSIModel               from './pages/lessons/OSIModel.jsx'
import TCPIP                  from './pages/lessons/TCPIP.jsx'
import PowerShellFundamentals from './pages/lessons/PowerShellFundamentals.jsx'
import CIATriad               from './pages/lessons/CIATriad.jsx'
import PythonAutomation       from './pages/lessons/PythonAutomation.jsx'
import PowerShellPipeline          from './pages/lessons/PowerShellPipeline.jsx'
import ThreatModelling             from './pages/lessons/ThreatModelling.jsx'
import LinuxDisk                   from './pages/lessons/LinuxDisk.jsx'
// ── Phase 10 — chain-fixing lessons ──────────────────────────────────────────
import WS2025Intro                 from './pages/lessons/WS2025Intro.jsx'
import LinuxShell                  from './pages/lessons/LinuxShell.jsx'
import PythonBasics                from './pages/lessons/PythonBasics.jsx'
import DevOpsPrinciples            from './pages/lessons/DevOpsPrinciples.jsx'
import DockerContainers            from './pages/lessons/DockerContainers.jsx'
import TroubleshootingMethodology  from './pages/lessons/TroubleshootingMethodology.jsx'
// ── Phase 11 — expanded lesson library ───────────────────────────────────────
import PowerShellScripting              from './pages/lessons/PowerShellScripting.jsx'
import LinuxPermissions                 from './pages/lessons/LinuxPermissions.jsx'
import NetworkingSubnetting             from './pages/lessons/NetworkingSubnetting.jsx'
import WindowsTroubleshooting          from './pages/lessons/WindowsTroubleshooting.jsx'
import DevOpsGit                        from './pages/lessons/DevOpsGit.jsx'
// ── Phase 12 — full coverage expansion ──────────────────────────────────────
import LinuxPackages                    from './pages/lessons/LinuxPackages.jsx'
import LinuxSystemd                     from './pages/lessons/LinuxSystemd.jsx'
import PSActiveDirectory                from './pages/lessons/PSActiveDirectory.jsx'
import PSRemoting                       from './pages/lessons/PSRemoting.jsx'
import NetworkingVLANs                  from './pages/lessons/NetworkingVLANs.jsx'
import CybersecurityWindowsHardening   from './pages/lessons/CybersecurityWindowsHardening.jsx'
import LinuxTroubleshooting             from './pages/lessons/LinuxTroubleshooting.jsx'
import TroubleshootingNetworking        from './pages/lessons/TroubleshootingNetworking.jsx'
import DevOpsCICD                       from './pages/lessons/DevOpsCICD.jsx'
// ── Phase 13 — course completion push ───────────────────────────────────────
import LinuxHardening                   from './pages/lessons/LinuxHardening.jsx'
import PythonSubprocess                 from './pages/lessons/PythonSubprocess.jsx'
import PythonLogParsing                 from './pages/lessons/PythonLogParsing.jsx'
import PythonMonitoring                 from './pages/lessons/PythonMonitoring.jsx'
import CybersecurityIncidentResponse    from './pages/lessons/CybersecurityIncidentResponse.jsx'
import TroubleshootingPerformance       from './pages/lessons/TroubleshootingPerformance.jsx'
import WS2025FileServices               from './pages/lessons/WS2025FileServices.jsx'

const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
    <div className="text-5xl">🚧</div>
    <h1 className="text-2xl font-bold text-white">{title}</h1>
    <p className="text-slate-400 text-sm">Full lesson content coming soon</p>
  </div>
)

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* ── Main pages ── */}
        <Route index element={<Home />} />
        <Route path="dashboard"           element={<Dashboard />} />
        <Route path="glossary"            element={<Glossary />} />
        <Route path="certificate"         element={<Certificate />} />
        <Route path="search"              element={<SearchResults />} />
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
        <Route path="cheatsheets"         element={<CheatSheets />} />
        <Route path="it-models"           element={<ITModels />} />
        <Route path="port-lookup"         element={<PortLookup />} />
        <Route path="vmware-setup"        element={<VmwareSetup />} />

        {/* ── Windows Server 2025 lessons ── */}
        <Route path="windows-server-2025/intro"            element={<WS2025Intro />} />
        <Route path="windows-server-2025/active-directory" element={<ActiveDirectory />} />
        <Route path="windows-server-2025/dhcp"             element={<DHCP />} />
        <Route path="windows-server-2025/dns"              element={<DNS />} />
        <Route path="windows-server-2025/group-policy"     element={<GroupPolicy />} />
        <Route path="windows-server-2025/hyper-v"          element={<HyperV />} />
        <Route path="windows-server-2025/file-services"    element={<WS2025FileServices />} />
        <Route path="windows-server-2025/firewall"         element={<WindowsFirewall />} />
        <Route path="windows-server-2025/:lesson"          element={<Placeholder title="Lesson coming soon" />} />

        {/* ── Linux lessons ── */}
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
        <Route path="linux/:lesson"     element={<Placeholder title="Lesson — Linux" />} />

        {/* ── Networking lessons ── */}
        <Route path="networking/osi-model"  element={<OSIModel />} />
        <Route path="networking/tcp-ip"     element={<TCPIP />} />
        <Route path="networking/subnetting" element={<NetworkingSubnetting />} />
        <Route path="networking/vlans"      element={<NetworkingVLANs />} />
        <Route path="networking/:lesson"    element={<Placeholder title="Lesson — Networking" />} />

        {/* ── PowerShell lessons ── */}
        <Route path="powershell/fundamentals"     element={<PowerShellFundamentals />} />
        <Route path="powershell/pipeline"         element={<PowerShellPipeline />} />
        <Route path="powershell/scripting"        element={<PowerShellScripting />} />
        <Route path="powershell/active-directory" element={<PSActiveDirectory />} />
        <Route path="powershell/remoting"         element={<PSRemoting />} />
        <Route path="powershell/:lesson"          element={<Placeholder title="Lesson — PowerShell" />} />

        {/* ── Cybersecurity lessons ── */}
        <Route path="cybersecurity/cia-triad"         element={<CIATriad />} />
        <Route path="cybersecurity/threat-modelling"  element={<ThreatModelling />} />
        <Route path="cybersecurity/windows-hardening" element={<CybersecurityWindowsHardening />} />
        <Route path="cybersecurity/incident-response" element={<CybersecurityIncidentResponse />} />
        <Route path="cybersecurity/:lesson"           element={<Placeholder title="Lesson — Cybersecurity" />} />

        {/* ── Python lessons ── */}
        <Route path="python/basics"       element={<PythonBasics />} />
        <Route path="python/filesystem"   element={<PythonAutomation />} />
        <Route path="python/subprocess"   element={<PythonSubprocess />} />
        <Route path="python/log-parsing"  element={<PythonLogParsing />} />
        <Route path="python/monitoring"   element={<PythonMonitoring />} />
        <Route path="python/:lesson"      element={<Placeholder title="Lesson — Python" />} />

        {/* ── DevOps lessons ── */}
        <Route path="devops/principles" element={<DevOpsPrinciples />} />
        <Route path="devops/git"        element={<DevOpsGit />} />
        <Route path="devops/docker"     element={<DockerContainers />} />
        <Route path="devops/cicd"       element={<DevOpsCICD />} />
        <Route path="devops/:lesson"    element={<Placeholder title="Lesson — DevOps" />} />

        {/* ── Troubleshooting lessons ── */}
        <Route path="troubleshooting/methodology" element={<TroubleshootingMethodology />} />
        <Route path="troubleshooting/windows"     element={<WindowsTroubleshooting />} />
        <Route path="troubleshooting/linux"       element={<LinuxTroubleshooting />} />
        <Route path="troubleshooting/networking"  element={<TroubleshootingNetworking />} />
        <Route path="troubleshooting/performance" element={<TroubleshootingPerformance />} />
        <Route path="troubleshooting/:lesson"     element={<Placeholder title="Lesson — Troubleshooting" />} />

        {/* ── Linux lessons ── */}
        <Route path="linux/filesystem"  element={<LinuxFilesystem />} />
        <Route path="linux/shell"       element={<LinuxShell />} />
        <Route path="linux/permissions" element={<LinuxPermissions />} />
        <Route path="linux/packages"    element={<LinuxPackages />} />
        <Route path="linux/systemd"     element={<LinuxSystemd />} />
        <Route path="linux/networking"  element={<LinuxNetworking />} />
        <Route path="linux/ssh"         element={<LinuxSSH />} />
        <Route path="linux/firewall"    element={<LinuxFirewall />} />
        <Route path="linux/disk"        element={<LinuxDisk />} />
        <Route path="linux/:lesson"     element={<Placeholder title="Lesson — Linux" />} />

        {/* ── Networking lessons ── */}
        <Route path="networking/osi-model"  element={<OSIModel />} />
        <Route path="networking/tcp-ip"     element={<TCPIP />} />
        <Route path="networking/subnetting" element={<NetworkingSubnetting />} />
        <Route path="networking/vlans"      element={<NetworkingVLANs />} />
        <Route path="networking/:lesson"    element={<Placeholder title="Lesson — Networking" />} />

        {/* ── PowerShell lessons ── */}
        <Route path="powershell/fundamentals"    element={<PowerShellFundamentals />} />
        <Route path="powershell/pipeline"        element={<PowerShellPipeline />} />
        <Route path="powershell/scripting"       element={<PowerShellScripting />} />
        <Route path="powershell/active-directory" element={<PSActiveDirectory />} />
        <Route path="powershell/remoting"        element={<PSRemoting />} />
        <Route path="powershell/:lesson"         element={<Placeholder title="Lesson — PowerShell" />} />

        {/* ── Cybersecurity lessons ── */}
        <Route path="cybersecurity/cia-triad"          element={<CIATriad />} />
        <Route path="cybersecurity/threat-modelling"   element={<ThreatModelling />} />
        <Route path="cybersecurity/windows-hardening"  element={<CybersecurityWindowsHardening />} />
        <Route path="cybersecurity/:lesson"            element={<Placeholder title="Lesson — Cybersecurity" />} />

        {/* ── Python lessons ── */}
        <Route path="python/basics"      element={<PythonBasics />} />
        <Route path="python/filesystem"  element={<PythonAutomation />} />
        <Route path="python/:lesson"     element={<Placeholder title="Lesson — Python" />} />

        {/* ── DevOps lessons ── */}
        <Route path="devops/principles" element={<DevOpsPrinciples />} />
        <Route path="devops/git"        element={<DevOpsGit />} />
        <Route path="devops/docker"     element={<DockerContainers />} />
        <Route path="devops/cicd"       element={<DevOpsCICD />} />
        <Route path="devops/:lesson"    element={<Placeholder title="Lesson — DevOps" />} />

        {/* ── Troubleshooting lessons ── */}
        <Route path="troubleshooting/methodology" element={<TroubleshootingMethodology />} />
        <Route path="troubleshooting/windows"     element={<WindowsTroubleshooting />} />
        <Route path="troubleshooting/linux"       element={<LinuxTroubleshooting />} />
        <Route path="troubleshooting/networking"  element={<TroubleshootingNetworking />} />
        <Route path="troubleshooting/:lesson"     element={<Placeholder title="Lesson — Troubleshooting" />} />

        {/* 404 */}
        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Route>
    </Routes>
  )
}
