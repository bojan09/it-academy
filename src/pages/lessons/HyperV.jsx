import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'
import GlossaryTooltip from '../../components/GlossaryTooltip.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_HYPERV_1 = `# Install Hyper-V role
Install-WindowsFeature -Name Hyper-V -IncludeManagementTools -Restart

# After restart — verify installation
Get-WindowsFeature Hyper-V | Select-Object Name, InstallState
Get-Command -Module Hyper-V | Measure-Object`
const CODE_HYPERV_2 = `Name    InstallState
----    ------------
Hyper-V Installed

Count: 241  ← 241 Hyper-V cmdlets available`
const CODE_HYPERV_3 = `# Create an Internal virtual switch
New-VMSwitch -Name "Lab-Internal" -SwitchType Internal

# Verify
Get-VMSwitch | Select-Object Name, SwitchType, NetAdapterInterfaceDescription`
const CODE_HYPERV_4 = `Name          SwitchType  NetAdapterInterfaceDescription
----          ----------  ------------------------------
Lab-Internal  Internal`
const CODE_HYPERV_5 = `# Create directory for VM files
New-Item -Path "C:\\\\VMs\\\\WEB01" -ItemType Directory -Force

# Create the VHDX disk
New-VHD -Path "C:\\\\VMs\\\\WEB01\\\\WEB01-OS.vhdx" -SizeBytes 20GB -Dynamic

# Create the VM
New-VM -Name "WEB01" -Generation 2 -MemoryStartupBytes 2GB -SwitchName "Lab-Internal" -Path "C:\\\\VMs"

# Attach the VHDX
Add-VMHardDiskDrive -VMName "WEB01" -Path "C:\\\\VMs\\\\WEB01\\\\WEB01-OS.vhdx"

# Configure: 2 vCPUs, Dynamic Memory (512MB–4GB)
Set-VM -Name "WEB01" -ProcessorCount 2
Set-VMMemory -VMName "WEB01" -DynamicMemoryEnabled $true -MinimumBytes 512MB -StartupBytes 2GB -MaximumBytes 4GB`
const CODE_HYPERV_6 = `✔ VM 'WEB01' created successfully
✔ VHDX attached
✔ Dynamic Memory configured`
const CODE_HYPERV_7 = `# Full VM summary
Get-VM -Name "WEB01" | Format-List

# Check memory config
Get-VMMemory -VMName "WEB01"

# Check disks
Get-VMHardDiskDrive -VMName "WEB01"

# Check network adapters
Get-VMNetworkAdapter -VMName "WEB01"`
const CODE_HYPERV_8 = `Name               : WEB01
State              : Off
CPUUsage           : 0
MemoryAssigned     : 2048 MB
Generation         : 2
Version            : 11.0
Path               : C:\\VMs\\WEB01

DynamicMemoryEnabled : True
Minimum              : 512 MB
Startup              : 2048 MB
Maximum              : 4096 MB`
const CODE_HYPERV_9 = `# Take a production checkpoint (app-consistent)
Checkpoint-VM -Name "WEB01" -SnapshotName "Clean-Gen2-No-OS" -CheckpointType Production

# List all checkpoints
Get-VMCheckpoint -VMName "WEB01" | Select-Object Name, CreationTime, CheckpointType

# To revert to a checkpoint:
# Restore-VMCheckpoint -VMName "WEB01" -Name "Clean-Gen2-No-OS"
# Remove-VMCheckpoint -VMName "WEB01" -Name "Old-Checkpoint"`
const CODE_HYPERV_10 = `Name               CreationTime          CheckpointType
----               ------------          --------------
Clean-Gen2-No-OS   01/15/2025 10:30:00   Production`
const CODE_HYPERV_11 = `# Export VM (VM must be stopped or have no saved state)
New-Item -Path "C:\\\\VM-Exports" -ItemType Directory -Force

Export-VM -Name "WEB01" -Path "C:\\\\VM-Exports"

# The export creates a complete, portable VM folder:
# C:\\VM-Exports\\WEB01\\
#   ├── Virtual Hard Disks\\
#   ├── Snapshots\\
#   └── WEB01.vmcx (VM config)

# Import on another host:
# Import-VM -Path "C:\\VM-Exports\\WEB01\\Virtual Machines\\<GUID>.vmcx"`
const CODE_HYPERV_12 = `# ── VM Lifecycle ───────────────────────────────────────────
Get-VM                                    # List all VMs
Get-VM -Name "WEB01"                      # Single VM
Start-VM -Name "WEB01"
Stop-VM  -Name "WEB01" -Force
Restart-VM -Name "WEB01"
Suspend-VM -Name "WEB01"                  # Save to disk (hibernation)
Remove-VM -Name "WEB01" -Force

# ── Configuration ───────────────────────────────────────────
Set-VM -Name "WEB01" -ProcessorCount 4
Set-VMMemory -VMName "WEB01" -StartupBytes 4GB
Rename-VM -Name "WEB01" -NewName "WEBPROD01"

# ── Disks ───────────────────────────────────────────────────
New-VHD -Path "D:\\\\data.vhdx" -SizeBytes 100GB -Dynamic
Add-VMHardDiskDrive -VMName "WEB01" -Path "D:\\\\data.vhdx"
Resize-VHD -Path "D:\\\\data.vhdx" -SizeBytes 200GB     # Expand
Get-VHD -Path "D:\\\\data.vhdx"                          # Info

# ── Networking ──────────────────────────────────────────────
New-VMSwitch -Name "External-SW" -NetAdapterName "Ethernet" -AllowManagementOS $true
Get-VMNetworkAdapter -VMName "WEB01"
Add-VMNetworkAdapter -VMName "WEB01" -SwitchName "External-SW"
Connect-VMNetworkAdapter -VMName "WEB01" -SwitchName "External-SW"

# ── Checkpoints ─────────────────────────────────────────────
Checkpoint-VM -Name "WEB01" -SnapshotName "Before-Update"
Get-VMCheckpoint -VMName "WEB01"
Restore-VMCheckpoint -Name "Before-Update" -VMName "WEB01"
Remove-VMCheckpoint -Name "Before-Update" -VMName "WEB01"

# ── Export / Import ─────────────────────────────────────────
Export-VM -Name "WEB01" -Path "D:\\\\VM-Exports"
Import-VM -Path "D:\\\\VM-Exports\\\\WEB01\\\\*.vmcx"`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the key difference between a Type-1 and Type-2 hypervisor?',
    options: [
      'Type-1 runs on bare metal directly on hardware; Type-2 runs on top of a host OS',
      'Type-1 supports more VMs; Type-2 supports fewer but with better performance',
      'Type-1 is software-only; Type-2 requires dedicated hardware',
      'Type-1 is for Windows VMs only; Type-2 supports Linux too',
    ],
    correct: 0,
    explanation: 'Type-1 (bare-metal) hypervisors like Hyper-V, VMware ESXi, and Xen run directly on hardware — there is no host OS between them and the hardware. Type-2 (hosted) hypervisors like VMware Workstation and VirtualBox run as an application on top of a host OS, adding overhead.',
  },
  {
    id: 'q2',
    question: 'What is a Hyper-V Virtual Switch and which type allows VMs to communicate with the external physical network?',
    options: [
      'A software firewall; Internal type',
      'A software network switch; External type',
      'A hardware NIC; Bridge type',
      'A VLAN trunk; Private type',
    ],
    correct: 1,
    explanation: 'A Hyper-V Virtual Switch is a software-defined Layer-2 switch. External switches bind to a physical NIC and allow VMs to communicate with the external network and other hosts. Internal switches allow VM-to-VM and VM-to-host communication. Private switches allow only VM-to-VM communication.',
  },
  {
    id: 'q3',
    question: 'What is the purpose of a Hyper-V checkpoint (snapshot)?',
    options: [
      'To back up VM files to an external server',
      'To capture the state of a VM at a point in time so you can revert if something goes wrong',
      'To clone a VM for deployment to multiple hosts',
      'To compress VM disk files to save storage space',
    ],
    correct: 1,
    explanation: 'A checkpoint (formerly called a snapshot) captures the VM\'s memory state, disk state, and device state at a specific point in time. You can revert to it if a change breaks something. Production checkpoints use VSS/checkpoint technology for application-consistent captures. Avoid keeping checkpoints long-term as they fragment VHD files.',
  },
  {
    id: 'q4',
    question: 'What is Generation 2 in Hyper-V?',
    options: [
      'The second version of Hyper-V released with Windows Server 2012',
      'A VM firmware type using UEFI instead of BIOS, supporting Secure Boot and faster boot',
      'A high-availability feature for VMs that failover between hosts',
      'A VM replication technology for disaster recovery',
    ],
    correct: 1,
    explanation: 'Generation 2 VMs use UEFI firmware instead of legacy BIOS, support Secure Boot, PXE boot from a synthetic network adapter, and generally boot faster. Generation 1 uses legacy BIOS and is needed for older operating systems. Use Generation 2 for all modern Windows and Linux VMs.',
  },
  {
    id: 'q5',
    question: 'What PowerShell cmdlet creates a new virtual machine in Hyper-V?',
    options: ['Add-VM', 'Create-VM', 'New-VM', 'Set-VM'],
    correct: 2,
    explanation: 'New-VM creates a new Hyper-V virtual machine. Example: New-VM -Name "WEB01" -Generation 2 -MemoryStartupBytes 2GB -SwitchName "External". You then add a VHD with New-VHD and Add-VMHardDiskDrive, and attach an ISO with Add-VMDvdDrive.',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info: 'callout-info', warning: 'callout-warning', danger: 'callout-danger', success: 'callout-success' }
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

export default function HyperV() {
  return (
    <LessonLayout
      lessonId="ws2025-06"
      courseId="windows-server-2025"
      title="Hyper-V Virtualisation"
      courseTitle="Windows Server 2025"
      courseHref="/windows-server-2025"
      xp={100}
      readTime="~35 min"
      icon="⚙️"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Windows Server 2025', href: '/windows-server-2025' },
        { label: 'Hyper-V Virtualisation' },
      ]}
      prev={{ title: 'Group Policy Management', href: '/windows-server-2025/group-policy' }}
      next={{ title: 'File Services & DFS',      href: '/windows-server-2025/file-services' }}
      objectives={[
        'Understand Type-1 vs Type-2 hypervisors and Hyper-V architecture',
        'Install Hyper-V and configure virtual switches',
        'Create and configure Generation 2 virtual machines',
        'Manage checkpoints, snapshots, and VM states',
        'Configure Dynamic Memory and virtual CPUs',
        'Use Live Migration concepts and Hyper-V Replica',
      ]}
    >
      {/* ── OVERVIEW ── */}
      <section>
        <h2>Overview</h2>
        <p>
          <GlossaryTooltip term="Hyper-V" /> is Microsoft's native Type-1 hypervisor built
          directly into Windows Server. It allows you to run multiple isolated virtual machines
          on a single physical host — each with its own OS, CPU, memory, storage, and network
          adapters.
        </p>
        <p className="mt-4">
          In enterprise environments, Hyper-V is the foundation for server consolidation,
          test/dev environments, disaster recovery (Hyper-V Replica), and private cloud
          infrastructure. This lesson walks through installing Hyper-V on DC01, creating
          and configuring VMs entirely through PowerShell, and managing VM lifecycle.
        </p>
        <Callout type="info" icon="💡" title="Nested virtualisation in the lab">
          Since DC01 itself runs inside VMware, you're doing nested virtualisation.
          This requires enabling the Virtualise Intel VT-x/EPT or AMD-V/RVI setting
          in the VMware VM settings for DC01 before proceeding.
        </Callout>
      </section>

      {/* ── ARCHITECTURE ── */}
      <section>
        <h2>Hyper-V Architecture</h2>

        <div className="info-card mt-4">
          <div className="font-mono text-xs text-slate-400 leading-8 overflow-x-auto">
            <div className="min-w-[500px] space-y-1">
              <div className="text-slate-500">Physical Hardware (CPU with VT-x, RAM, NICs, Disks)</div>
              <div className="ml-4 border-l border-surface-600 pl-4">
                <div className="text-accent-cyan font-bold">Hyper-V Hypervisor (Ring -1)</div>
                <div className="ml-4 border-l border-surface-600 pl-4 space-y-2 mt-1">
                  <div>
                    <div className="text-brand-300 font-bold">Parent Partition (Management OS)</div>
                    <div className="ml-4 text-slate-500">↳ Hyper-V Manager, PowerShell, WMI providers</div>
                    <div className="ml-4 text-slate-500">↳ Virtual Switch Manager, Virtual Machine Bus</div>
                  </div>
                  <div>
                    <div className="text-accent-green font-bold">Child Partition — VM1 (Windows Server)</div>
                    <div className="ml-4 text-slate-500">↳ vCPUs, Dynamic Memory, Synthetic Devices</div>
                  </div>
                  <div>
                    <div className="text-accent-amber font-bold">Child Partition — VM2 (Ubuntu Server)</div>
                    <div className="ml-4 text-slate-500">↳ Linux Integration Services (LIS)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3>Virtual Switch Types</h3>
        <div className="grid sm:grid-cols-3 gap-4 mt-3">
          {[
            {
              type: 'External',
              icon: '🌐',
              color: 'border-brand-500/25 bg-brand-500/5',
              text: 'text-brand-300',
              desc: 'Binds to a physical NIC. VMs can communicate with the external network, other hosts, and the internet. Most common in production.',
              use: 'Production workloads, internet-facing VMs',
            },
            {
              type: 'Internal',
              icon: '🔁',
              color: 'border-accent-cyan/25 bg-accent-cyan/5',
              text: 'text-accent-cyan',
              desc: 'VMs can communicate with each other AND with the Hyper-V host. No external network access unless NAT is configured on the host.',
              use: 'Lab environments, internal-only services',
            },
            {
              type: 'Private',
              icon: '🔒',
              color: 'border-accent-purple/25 bg-accent-purple/5',
              text: 'text-accent-purple',
              desc: 'VMs can only communicate with each other. No host access, no external access. Completely isolated network segment.',
              use: 'Isolated test networks, malware analysis',
            },
          ].map(sw => (
            <div key={sw.type} className={`card p-5 border ${sw.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{sw.icon}</span>
                <p className={`font-bold text-sm ${sw.text}`}>{sw.type}</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{sw.desc}</p>
              <p className="text-[10px] text-slate-500">
                <span className="font-semibold text-slate-400">Best for:</span> {sw.use}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VM COMPONENTS ── */}
      <section>
        <h2>Virtual Machine Components</h2>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {[
            { icon: '🖥️', title: 'Generation',       desc: 'Gen 1: Legacy BIOS. Gen 2: UEFI + Secure Boot + faster boot. Always use Gen 2 for modern OS.' },
            { icon: '💾', title: 'VHD / VHDX',       desc: 'Virtual hard disk format. VHDX supports up to 64TB, better resilience, and is the modern default. Store on fast SSDs.' },
            { icon: '🧠', title: 'Dynamic Memory',   desc: 'Lets Hyper-V automatically adjust VM RAM between a minimum and maximum. Host reclaims unused memory from idle VMs.' },
            { icon: '⚡', title: 'Virtual CPUs',     desc: 'Assign 2–4 vCPUs per VM unless workload requires more. Over-provisioning vCPUs degrades NUMA performance.' },
            { icon: '🌐', title: 'Network Adapters', desc: 'Synthetic adapters (recommended) use VMBus for high performance. Legacy adapters emulate a real NIC for PXE boot.' },
            { icon: '📸', title: 'Checkpoints',      desc: 'Standard: crash-consistent. Production: app-consistent via VSS. Never keep checkpoints in production long-term.' },
          ].map(c => (
            <div key={c.title} className="info-card py-4 flex gap-3">
              <span className="text-xl flex-shrink-0">{c.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white mb-1">{c.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── VMware LAB ── */}
      <section>
        <h2>VMware Lab Exercise</h2>
        <Callout type="warning" icon="🧪" title="Before you start">
          In VMware Workstation, right-click DC01 → Settings → Processors → enable
          "Virtualise Intel VT-x/EPT or AMD-V/RVI". This enables nested virtualisation
          required for Hyper-V to run inside VMware.
        </Callout>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB 6</span>
            <span className="text-sm font-semibold text-white">Install Hyper-V and Create Your First VM</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~30 min</span>
          </div>
          <div className="lab-body space-y-8">

            <LabStep number={1}
              description="Install the Hyper-V role and management tools on DC01. A restart is required."
              command={CODE_HYPERV_1}
              output={CODE_HYPERV_2}
            />

            <LabStep number={2}
              description="Create an Internal virtual switch for isolated lab networking within Hyper-V."
              command={CODE_HYPERV_3}
              output={CODE_HYPERV_4}
            />

            <LabStep number={3}
              description="Create a Generation 2 VM with 2GB RAM, 2 vCPUs, and a 20GB dynamic VHDX disk."
              command={CODE_HYPERV_5}
              output={CODE_HYPERV_6}
            />

            <LabStep number={4}
              description="Verify VM configuration and review all settings before starting."
              command={CODE_HYPERV_7}
              output={CODE_HYPERV_8}
            />

            <LabStep number={5}
              description="Take a checkpoint of the clean VM before installing an OS, then view the checkpoint tree."
              command={CODE_HYPERV_9}
              output={CODE_HYPERV_10}
            />

            <LabStep number={6}
              description="Export the VM for backup or migration to another host."
              command={CODE_HYPERV_11}
            />

            <Callout type="success" icon="✅" title="Lab Complete">
              Hyper-V is installed, a virtual switch is configured, and a Generation 2 VM is
              created with Dynamic Memory, a VHDX disk, a checkpoint, and an export.
              Take a VMware snapshot of DC01 before proceeding.
            </Callout>
          </div>
        </div>
      </section>

      {/* ── BEST PRACTICES ── */}
      <section>
        <h2>Best Practices</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: '💾', title: 'Always use VHDX over VHD',          desc: 'VHDX has a 64TB limit (vs 2TB for VHD), better resilience against corruption on unclean shutdown, and is the modern default.' },
            { icon: '📸', title: 'Use Production Checkpoints',         desc: 'Production checkpoints use VSS to create app-consistent captures. Standard checkpoints are crash-consistent and can corrupt databases.' },
            { icon: '🗑️', title: 'Delete checkpoints after use',       desc: 'Long-lived checkpoints fragment VHDX files and reduce I/O performance. Take, test, then delete or merge checkpoints promptly.' },
            { icon: '🔁', title: 'Separate OS and data disks',         desc: 'Never store app data on the OS VHDX. Add a separate data VHDX so you can snapshot, expand, or replace disks independently.' },
            { icon: '🌐', title: 'Use separate NICs for management',   desc: 'In production, dedicate a physical NIC to the parent partition management traffic. Mixing VM and management traffic on one NIC causes contention.' },
            { icon: '📊', title: 'Monitor with Hyper-V performance counters', desc: 'Watch Hyper-V Hypervisor Logical Processor\\% Total Run Time. Over 90% indicates CPU pressure. Use Get-Counter for PowerShell monitoring.' },
          ].map(p => (
            <div key={p.title} className="info-card py-4 flex gap-3">
              <span className="text-xl flex-shrink-0">{p.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white mb-1">{p.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUICK REF ── */}
      <section>
        <h2>Quick Reference</h2>
        <CodeBlock title="Hyper-V PowerShell Commands" language="powershell" code={CODE_HYPERV_12} />
      </section>

      {/* ── QUIZ ── */}
      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to earn bonus XP.</p>
        <Quiz lessonId="ws2025-06" title="Hyper-V Virtualisation Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={50} />
      </section>
    </LessonLayout>
  )
}
