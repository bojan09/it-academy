import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_WS2025INTRO_1 = `# Launch Server Configuration tool (or it opens automatically on Core)
sconfig

# Alternatively, set computer name directly with PowerShell:
Rename-Computer -NewName "DC01" -Restart`
const CODE_WS2025INTRO_2 = `===============================================================================
                         Server Configuration
===============================================================================
1) Domain/Workgroup:        Workgroup: WORKGROUP
2) Computer Name:           WIN-XXXXXXXX  ← Change this to DC01
3) Add Local Administrator
4) Configure Remote Management:   Enabled
...`
const CODE_WS2025INTRO_3 = `# Find the network adapter name
Get-NetAdapter

# Set static IP (replace 'Ethernet0' with your adapter name)
New-NetIPAddress -InterfaceAlias "Ethernet0" -IPAddress 192.168.100.10 -PrefixLength 24 -DefaultGateway 192.168.100.1

# Set DNS to itself (will be populated after DNS role is installed)
Set-DnsClientServerAddress -InterfaceAlias "Ethernet0" -ServerAddresses 192.168.100.10

# Verify
ipconfig /all`
const CODE_WS2025INTRO_4 = `Ethernet adapter Ethernet0:
   IPv4 Address.........: 192.168.100.10
   Subnet Mask..........: 255.255.255.0
   Default Gateway......: 192.168.100.1
   DNS Servers..........: 192.168.100.10`
const CODE_WS2025INTRO_5 = `# In the guest OS — after mounting VMware Tools ISO via VM menu
# Navigate to the mounted DVD drive
$dvd = (Get-WmiObject Win32_CDROMDrive).Drive
Start-Process "$dvd\\setup64.exe" -ArgumentList "/S /v/qn" -Wait
Write-Host "VMware Tools installed — rebooting..."
Restart-Computer`
const CODE_WS2025INTRO_6 = `# Enable PowerShell Remoting (needed for remote management)
Enable-PSRemoting -Force

# Set Windows Update to download but not auto-install
$wuSettings = (New-Object -ComObject "Microsoft.Update.AutoUpdate").Settings
$wuSettings.NotificationLevel = 3   # 3 = Download + notify
$wuSettings.Save()

# Check all services are healthy
Get-Service | Where-Object { $_.StartType -eq 'Automatic' -and $_.Status -eq 'Stopped' } |
  Select-Object Name, Status`
const CODE_WS2025INTRO_7 = `# System overview
Get-ComputerInfo | Select-Object CsName, OsName, OsVersion, CsTotalPhysicalMemory,
  @{N='RAM(GB)'; E={[math]::Round($_.CsTotalPhysicalMemory/1GB,1)}}

# Check disk space
Get-PSDrive C | Select-Object @{N='FreeDisk(GB)'; E={[math]::Round($_.Free/1GB,1)}},
                               @{N='UsedDisk(GB)'; E={[math]::Round($_.Used/1GB,1)}}

# Confirm static IP
Test-NetConnection -ComputerName 192.168.100.1 -InformationLevel Quiet`
const CODE_WS2025INTRO_8 = `CsName        : DC01
OsName        : Microsoft Windows Server 2025 Standard Evaluation
OsVersion     : 10.0.26100
RAM(GB)       : 4

FreeDisk(GB)  UsedDisk(GB)
-----------   ------------
47.2          12.8

True  ← Gateway reachable`
const CODE_WS2025INTRO_9 = `# View all available roles and features
Get-WindowsFeature | Where-Object { $_.InstallState -eq 'Available' } |
  Select-Object Name, DisplayName | Format-Table -AutoSize

# View installed roles/features
Get-WindowsFeature | Where-Object { $_.InstallState -eq 'Installed' } |
  Select-Object Name, DisplayName

# Install a role (example: AD DS)
Install-WindowsFeature AD-Domain-Services -IncludeManagementTools

# Install multiple features
Install-WindowsFeature DNS, DHCP -IncludeManagementTools

# Uninstall a feature
Uninstall-WindowsFeature -Name Telnet-Client

# Common role names
# AD-Domain-Services    → Active Directory Domain Services
# DNS                   → DNS Server
# DHCP                  → DHCP Server
# Hyper-V               → Hyper-V
# FileAndStorage-Services → File and Storage Services
# Web-Server            → IIS Web Server
# RDS-RD-Server         → Remote Desktop Session Host
# GPMC                  → Group Policy Management Console`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the minimum RAM requirement for Windows Server 2025 with Desktop Experience?',
    options: ['512 MB', '1 GB', '2 GB', '4 GB'],
    correct: 2,
    explanation: 'Windows Server 2025 requires a minimum of 512 MB RAM for Server Core and 2 GB for Desktop Experience. However, for any real workload you need substantially more — 8 GB minimum for a lab domain controller, 16–32 GB for production.',
  },
  {
    id: 'q2',
    question: 'What is the key difference between Windows Server Core and Desktop Experience?',
    options: [
      'Server Core is only for physical hardware; Desktop Experience is for VMs',
      'Server Core has no GUI — managed via PowerShell and remote tools; Desktop Experience includes the full Windows GUI',
      'Server Core cannot run Active Directory; Desktop Experience supports all roles',
      'They are functionally identical — Desktop Experience just adds Solitaire',
    ],
    correct: 1,
    explanation: 'Server Core has no graphical shell (no Explorer, no start menu) — it is a minimal installation managed entirely through the command line, PowerShell, and remote management tools like Windows Admin Center. It has a smaller attack surface, lower memory usage, and requires fewer reboots. Desktop Experience adds the full GUI. Microsoft recommends Server Core for production.',
  },
  {
    id: 'q3',
    question: 'Which command opens the Server Manager initial configuration tool on a freshly installed Windows Server?',
    options: ['servermanager.exe', 'sconfig', 'initial-setup.cmd', 'server-config /init'],
    correct: 1,
    explanation: 'sconfig is the text-based Server Configuration tool that appears automatically on Server Core. It allows you to set the computer name, join a domain, configure networking, enable remote management, and set Windows Update settings — all without a GUI. On Desktop Experience, Server Manager launches automatically.',
  },
  {
    id: 'q4',
    question: 'What is the purpose of Windows Server roles vs features?',
    options: [
      'Roles and features are the same thing — both terms refer to optional Windows components',
      'Roles are primary server functions (DNS, DHCP, AD DS, IIS); Features are supporting components that enhance roles or the OS',
      'Roles are free; Features require additional licensing',
      'Roles run as services; Features run as scheduled tasks',
    ],
    correct: 1,
    explanation: 'Roles define the primary purpose of a server — what service it provides to the network (DNS Server, DHCP Server, Active Directory Domain Services, Web Server/IIS, Hyper-V, File Services). Features are supporting software that add functionality — they may support a role or provide standalone capability (.NET Framework, Failover Clustering, SNMP, Windows Backup).',
  },
  {
    id: 'q5',
    question: 'What is VMware Tools and why is it important to install it in a Windows Server VM?',
    options: [
      'VMware Tools is a firewall product that protects VMs from network attacks',
      'It is optional software that only adds aesthetic improvements to the VM window',
      'It installs optimised drivers and services that dramatically improve VM performance, enable shared clipboard, and allow graceful shutdown from the VMware host',
      'It configures Windows Server licensing for virtualised environments',
    ],
    correct: 2,
    explanation: 'VMware Tools is a suite of utilities that runs inside the guest OS to improve management and performance. It provides optimised SVGA, network, and storage drivers; enables VM heartbeat monitoring; allows graceful power operations from the host; synchronises the VM clock; and enables shared clipboard and drag-and-drop. Always install it immediately after OS installation.',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info: 'callout-info', warning: 'callout-warning', success: 'callout-success', danger: 'callout-danger' }
  return (
    <div className={`callout ${s[type]}`}>
      <span className="callout-icon">{icon}</span>
      <div className="callout-body">{title && <strong>{title} — </strong>}{children}</div>
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

export default function WS2025Intro() {
  return (
    <LessonLayout
      lessonId="ws2025-01"
      courseId="windows-server-2025"
      title="Introduction to Windows Server 2025"
      courseTitle="Windows Server 2025"
      courseHref="/windows-server-2025"
      xp={50}
      readTime="~20 min"
      icon="🖥️"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Windows Server 2025', href: '/windows-server-2025' },
        { label: 'Introduction' },
      ]}
      prev={null}
      next={{ title: 'Active Directory & Domain Services', href: '/windows-server-2025/active-directory' }}
      objectives={[
        'Understand Windows Server 2025 editions and use cases',
        'Know the hardware requirements for lab and production',
        'Distinguish Server Core from Desktop Experience and choose correctly',
        'Install Windows Server 2025 in VMware Workstation',
        'Perform post-installation configuration with sconfig and PowerShell',
        'Understand roles vs features and install them via PowerShell',
      ]}
    >
      {/* ── OVERVIEW ── */}
      <section>
        <h2>Overview</h2>
        <p>
          Windows Server 2025 is Microsoft's current long-term servicing channel (LTSC)
          server OS. It's the foundation for Active Directory, DNS, DHCP, Hyper-V, file
          services, and dozens of other enterprise roles that power corporate infrastructure
          worldwide.
        </p>
        <p className="mt-4">
          This lesson gets your lab environment running — a clean Windows Server 2025
          installation in VMware that all subsequent lessons build on. By the end you'll
          have a fully configured server ready to become a domain controller.
        </p>
        <Callout type="info" icon="💡" title="What you'll build">
          A VMware VM named <strong>DC01</strong> running Windows Server 2025 with Desktop
          Experience, VMware Tools installed, static IP 192.168.100.10, and all
          post-installation hardening applied. This becomes your domain controller in
          the next lesson.
        </Callout>
      </section>

      {/* ── EDITIONS ── */}
      <section>
        <h2>Windows Server 2025 Editions</h2>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          {[
            {
              edition: 'Essentials',
              icon: '🔑',
              color: 'border-slate-600',
              text: 'text-slate-300',
              users: 'Up to 25 users / 50 devices',
              use: 'Small businesses — limited features, no virtualisation rights.',
              lab: false,
            },
            {
              edition: 'Standard',
              icon: '⚡',
              color: 'border-brand-500/30',
              text: 'text-brand-300',
              users: 'Unlimited',
              use: 'Physical or minimally virtualised environments. Up to 2 Hyper-V VMs per licence.',
              lab: true,
            },
            {
              edition: 'Datacenter',
              icon: '🏢',
              color: 'border-accent-cyan/30',
              text: 'text-accent-cyan',
              users: 'Unlimited',
              use: 'Highly virtualised data centres. Unlimited VMs, all advanced features, Azure Arc.',
              lab: false,
            },
          ].map(e => (
            <div key={e.edition} className={`card p-5 border ${e.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{e.icon}</span>
                <div>
                  <p className={`font-bold text-sm ${e.text}`}>{e.edition}</p>
                  {e.lab && <span className="text-[10px] text-accent-green">✓ Lab edition</span>}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mb-2">{e.users}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{e.use}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CORE VS GUI ── */}
      <section>
        <h2>Server Core vs Desktop Experience</h2>
        <div className="grid sm:grid-cols-2 gap-5 mt-4">
          {[
            {
              name: 'Server Core',
              icon: '⌨️',
              color: 'border-accent-green/25 bg-accent-green/5',
              text: 'text-accent-green',
              pros: ['~4 GB smaller footprint', 'Smaller attack surface', 'Fewer reboots required', 'Lower memory usage', 'Microsoft recommended for production'],
              cons: ['Requires PowerShell / remote tools', 'Steeper learning curve', 'Not suitable for this beginner lab'],
              use: 'Production servers where you know exactly what role they serve.',
            },
            {
              name: 'Desktop Experience',
              icon: '🖥️',
              color: 'border-brand-500/25 bg-brand-500/5',
              text: 'text-brand-300',
              pros: ['Full Windows GUI', 'Server Manager', 'GUI-based tools available', 'Easier for learning', 'Better for exploring features'],
              cons: ['Larger attack surface', 'More memory usage', 'More frequent reboots'],
              use: 'Lab environments and first-time learners. Use this for the course.',
            },
          ].map(v => (
            <div key={v.name} className={`card p-5 border ${v.color}`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{v.icon}</span>
                <p className={`font-bold text-base ${v.text}`}>{v.name}</p>
              </div>
              <p className="text-xs text-slate-500 mb-3 italic">{v.use}</p>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Advantages</p>
                  {v.pros.map(p => (
                    <div key={p} className="flex gap-2 text-xs text-slate-400 mb-1">
                      <span className="text-accent-green flex-shrink-0">✓</span>{p}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Considerations</p>
                  {v.cons.map(c => (
                    <div key={c} className="flex gap-2 text-xs text-slate-400 mb-1">
                      <span className="text-slate-600 flex-shrink-0">→</span>{c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LAB HARDWARE REQUIREMENTS ── */}
      <section>
        <h2>Lab Hardware Requirements</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { label: 'vCPUs',   value: '2',      icon: '⚡', note: '4 recommended' },
            { label: 'RAM',     value: '4 GB',   icon: '🧠', note: '8 GB recommended' },
            { label: 'Disk',    value: '60 GB',  icon: '💾', note: 'Thin provisioned' },
            { label: 'Network', value: 'VMnet2', icon: '🌐', note: 'Host-only or NAT' },
          ].map(r => (
            <div key={r.label} className="card p-4 text-center">
              <div className="text-2xl mb-2">{r.icon}</div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">{r.label}</p>
              <p className="text-lg font-bold text-white font-mono mt-0.5">{r.value}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">{r.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VMware LAB ── */}
      <section>
        <h2>VMware Lab Exercise</h2>
        <Callout type="warning" icon="🧪" title="Before you start">
          Download the Windows Server 2025 Evaluation ISO from Microsoft's official
          evaluation centre (180-day free trial). Create a new VMware VM with the specs
          above before running these steps.
        </Callout>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB 1</span>
            <span className="text-sm font-semibold text-white">Install & Configure Windows Server 2025</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~30 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="After installation completes and you've logged in, run sconfig to set the computer name and enable remote management."
              language="powershell"
              command={CODE_WS2025INTRO_1}
              output={CODE_WS2025INTRO_2}
            />
            <LabStep number={2}
              description="After restart, configure a static IP address on the server."
              command={CODE_WS2025INTRO_3}
              output={CODE_WS2025INTRO_4}
            />
            <LabStep number={3}
              description="Install VMware Tools for optimal performance. In VMware: VM menu → Install VMware Tools, then run inside the guest."
              command={CODE_WS2025INTRO_5}
            />
            <LabStep number={4}
              description="Enable PowerShell remoting and configure Windows Update settings."
              command={CODE_WS2025INTRO_6}
            />
            <LabStep number={5}
              description="Verify the installation and check system information."
              command={CODE_WS2025INTRO_7}
              output={CODE_WS2025INTRO_8}
            />
            <Callout type="success" icon="✅" title="Lab Complete">
              DC01 is installed, named, has a static IP of 192.168.100.10, VMware Tools
              installed, and PowerShell remoting enabled. Take a VMware snapshot named
              "Clean-Install" before proceeding to the Active Directory lesson.
            </Callout>
          </div>
        </div>
      </section>

      {/* ── ROLES AND FEATURES ── */}
      <section>
        <h2>Roles & Features Quick Reference</h2>
        <CodeBlock title="Managing roles and features with PowerShell" language="powershell" code={CODE_WS2025INTRO_9} />
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="ws2025-01" title="Windows Server 2025 Introduction Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={25} />
      </section>
    </LessonLayout>
  )
}
