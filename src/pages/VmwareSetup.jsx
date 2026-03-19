import React, { useState } from 'react'
import CodeBlock from '../components/CodeBlock.jsx'

const STEPS = [
  {
    id: 1,
    title: 'Download VMware Workstation Pro',
    icon: '⬇️',
    time: '~10 min',
    content: `VMware Workstation Pro is free for personal use as of 2024. Download it from the official Broadcom portal.`,
    note: 'Alternatively, use VMware Workstation Player (free) or VirtualBox if you prefer open source.',
    links: [
      { label: 'Broadcom Download Portal', url: 'https://support.broadcom.com/group/ecx/productdownloads?subfamily=VMware+Workstation+Pro' },
    ],
  },
  {
    id: 2,
    title: 'System Requirements',
    icon: '🖥️',
    time: '—',
    content: `Before installing, verify your host machine meets these minimum requirements for running the full lab environment.`,
    specs: [
      { label: 'CPU',      value: '64-bit processor with VT-x/AMD-V (virtualisation enabled in BIOS)' },
      { label: 'RAM',      value: 'Minimum 16 GB — 32 GB recommended for running 2+ VMs simultaneously' },
      { label: 'Storage',  value: '100 GB+ free disk space (SSDs strongly recommended for performance)' },
      { label: 'OS',       value: 'Windows 10/11 or Linux host. macOS users: use VMware Fusion or UTM.' },
      { label: 'Network',  value: 'Intel or Realtek NIC recommended for bridged networking compatibility' },
    ],
  },
  {
    id: 3,
    title: 'Enable Virtualisation in BIOS',
    icon: '⚙️',
    time: '~5 min',
    content: `Intel VT-x or AMD-V must be enabled in your BIOS/UEFI for nested virtualisation to work.`,
    steps: [
      'Restart your computer and press DEL, F2, or F10 to enter BIOS setup',
      'Navigate to CPU Configuration or Advanced settings',
      'Enable Intel Virtualization Technology (VT-x) or AMD-V / SVM Mode',
      'Enable VT-d (Intel) or AMD IOMMU if available',
      'Save changes and exit — your system will reboot',
    ],
    verifyCode: {
      code: `# Windows — check virtualisation is active
Get-ComputerInfo -Property HyperV*

# Linux
grep -E 'vmx|svm' /proc/cpuinfo | head -1`,
      language: 'bash',
      title: 'Verify virtualisation',
    },
  },
  {
    id: 4,
    title: 'Create Your Lab Network',
    icon: '🌐',
    time: '~15 min',
    content: `A proper lab uses isolated virtual networks. This prevents lab traffic from reaching your real network while still allowing internet access where needed.`,
    steps: [
      'Open VMware Workstation → Edit → Virtual Network Editor',
      'Create VMnet1 (Host-Only) — 192.168.100.0/24 — no DHCP (we\'ll use Windows DHCP later)',
      'Create VMnet2 (NAT) — 192.168.200.0/24 — for internet access',
      'Keep VMnet0 as Bridged for direct network access when needed',
    ],
    networkDiagram: true,
  },
  {
    id: 5,
    title: 'Install Windows Server 2025 VM',
    icon: '🖥️',
    time: '~45 min',
    content: `Download a Windows Server 2025 evaluation ISO (180-day free trial) from Microsoft Evaluation Center.`,
    steps: [
      'Download Windows Server 2025 evaluation ISO from Microsoft',
      'In VMware: File → New Virtual Machine → Typical',
      'Select your ISO file as installer disc image',
      'Allocate: 4 GB RAM minimum (8 GB recommended), 2 vCPUs, 60 GB disk',
      'Set network adapter to VMnet1 (Host-Only)',
      'Complete Windows Server setup — choose Standard (Desktop Experience)',
      'Set a strong Administrator password',
    ],
    installCode: {
      code: `# After installation — verify system info via PowerShell
Get-ComputerInfo | Select-Object WindowsProductName, TotalPhysicalMemory, CsProcessors

# Set a static IP for your DC
New-NetIPAddress -InterfaceAlias "Ethernet0" \`
  -IPAddress 192.168.100.10 \`
  -PrefixLength 24 \`
  -DefaultGateway 192.168.100.1

Set-DnsClientServerAddress -InterfaceAlias "Ethernet0" \`
  -ServerAddresses 127.0.0.1`,
      language: 'powershell',
      title: 'Windows Server 2025 — initial config',
    },
  },
  {
    id: 6,
    title: 'Install Ubuntu Server VM',
    icon: '🐧',
    time: '~30 min',
    content: `Ubuntu Server 22.04 LTS or 24.04 LTS is recommended for the Linux portion of the labs.`,
    steps: [
      'Download Ubuntu Server 22.04 or 24.04 LTS ISO from ubuntu.com',
      'Create new VM: 2 GB RAM, 1 vCPU, 30 GB disk',
      'Attach to VMnet1 (same network as Windows Server)',
      'Complete Ubuntu installation — install OpenSSH server when prompted',
      'Assign static IP: 192.168.100.20',
    ],
    installCode: {
      code: `# Set static IP via Netplan
sudo nano /etc/netplan/00-installer-config.yaml

# Paste this config:
network:
  version: 2
  ethernets:
    ens33:
      addresses: [192.168.100.20/24]
      routes:
        - to: default
          via: 192.168.100.1
      nameservers:
        addresses: [192.168.100.10, 8.8.8.8]

# Apply config
sudo netplan apply

# Verify connectivity to DC
ping 192.168.100.10`,
      language: 'bash',
      title: 'Ubuntu Server — static IP setup',
    },
  },
  {
    id: 7,
    title: 'Create VM Snapshots',
    icon: '📸',
    time: '~5 min',
    content: `Always take a snapshot of each VM immediately after a clean install, before any configuration. This is your "restore point" if something goes wrong.`,
    steps: [
      'Right-click the VM in VMware → Snapshot → Take Snapshot',
      'Name it "Clean Install — Pre-Config" with today\'s date',
      'Do this for EVERY VM before starting any labs',
      'Take additional snapshots before each major configuration change',
      'To restore: VM → Snapshot → Snapshot Manager → Revert',
    ],
    note: '💡 Pro tip: Store your VMs on an SSD. Snapshot creation and reverting is significantly faster on SSD vs HDD.',
  },
  {
    id: 8,
    title: 'Verify Lab Connectivity',
    icon: '✅',
    time: '~10 min',
    content: `Before starting any lessons, run these checks to confirm your lab network is working correctly.`,
    verifyCode: {
      code: `# On Windows Server 2025 — test connectivity
ping 192.168.100.20   # Should reach Ubuntu VM
nslookup google.com   # DNS should resolve (if NAT configured)
hostname              # Should return your server name

# On Ubuntu Server — test connectivity  
ping 192.168.100.10   # Should reach Windows Server
ssh user@192.168.100.20  # Test SSH from Windows to Linux`,
      language: 'bash',
      title: 'Lab connectivity checks',
    },
  },
]

export default function VmwareSetup() {
  const [openStep, setOpenStep] = useState(1)

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-12">

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">Lab Setup</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          VMware Lab Environment Setup
        </h1>
        <p className="text-slate-400 max-w-2xl leading-relaxed">
          Everything you need to set up a production-accurate lab environment before starting any lessons.
          Follow this guide once — then every lab exercise will just work.
        </p>

        {/* Quick stats */}
        <div className="flex flex-wrap gap-3 mt-6">
          {[
            { icon: '⏱️', label: '~2 hours total setup' },
            { icon: '💰', label: 'Free (evaluation licenses)' },
            { icon: '🖥️', label: '2 VMs minimum' },
            { icon: '💾', label: '16 GB RAM recommended' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-xl
                                          bg-surface-800 border border-surface-700 text-sm text-slate-300">
              <span>{s.icon}</span>
              <span className="text-xs">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Network diagram */}
      <div className="card p-6 mb-10 border-brand-500/10">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-5">
          Lab Network Overview
        </h2>
        <div className="font-mono text-xs text-slate-400 leading-8 overflow-x-auto">
          <div className="min-w-[480px]">
            <div className="flex items-center gap-3">
              <span className="text-slate-600">Host Machine (Your PC)</span>
            </div>
            <div className="ml-4 border-l border-surface-600 pl-4 mt-1 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-surface-600">├──</span>
                <span className="text-accent-cyan">VMnet0 (Bridged)</span>
                <span className="text-slate-600">→ Real network access</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-surface-600">├──</span>
                <span className="text-accent-amber">VMnet1 (Host-Only) 192.168.100.0/24</span>
              </div>
              <div className="ml-8 border-l border-surface-600 pl-4 space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-surface-600">├──</span>
                  <span className="text-white">🖥️  DC01 Windows Server 2025</span>
                  <span className="text-brand-400">192.168.100.10</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-surface-600">├──</span>
                  <span className="text-white">🐧  srv01 Ubuntu Server</span>
                  <span className="text-brand-400">192.168.100.20</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-surface-600">└──</span>
                  <span className="text-white">💻  Client01 Windows 10/11</span>
                  <span className="text-brand-400">192.168.100.30</span>
                  <span className="text-slate-600">(optional)</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-surface-600">└──</span>
                <span className="text-accent-green">VMnet2 (NAT) 192.168.200.0/24</span>
                <span className="text-slate-600">→ Internet access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step) => {
          const isOpen = openStep === step.id
          return (
            <div key={step.id}
                 className={`card overflow-hidden transition-all duration-200
                              ${isOpen ? 'border-brand-500/30' : ''}`}>
              {/* Step header */}
              <button
                onClick={() => setOpenStep(isOpen ? null : step.id)}
                className="w-full flex items-center gap-4 p-5 text-left hover:bg-surface-700/30 transition-colors"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base
                                  flex-shrink-0 font-bold font-mono
                                  ${isOpen ? 'bg-brand-500 text-white' : 'bg-surface-700 text-slate-300'}`}>
                  {isOpen ? '✓' : step.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base">{step.icon}</span>
                    <h3 className="font-semibold text-white text-sm">{step.title}</h3>
                    {step.time && step.time !== '—' && (
                      <span className="text-[10px] font-mono text-slate-500 bg-surface-700
                                       px-2 py-0.5 rounded-md border border-surface-600">
                        {step.time}
                      </span>
                    )}
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-200
                              ${isOpen ? 'rotate-180 text-brand-400' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Step content */}
              {isOpen && (
                <div className="px-5 pb-6 pt-0 space-y-4 border-t border-surface-700">
                  <p className="text-slate-400 text-sm leading-relaxed pt-4">{step.content}</p>

                  {/* Specs table */}
                  {step.specs && (
                    <div className="space-y-2">
                      {step.specs.map(s => (
                        <div key={s.label}
                             className="flex gap-3 py-2 border-b border-surface-700 last:border-0">
                          <span className="text-xs font-semibold text-slate-500 w-20 flex-shrink-0 pt-0.5">
                            {s.label}
                          </span>
                          <span className="text-sm text-slate-300">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Numbered steps */}
                  {step.steps && (
                    <ol className="space-y-2">
                      {step.steps.map((s, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-300">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-500/20
                                           text-brand-300 text-[11px] flex items-center justify-center
                                           font-mono font-bold mt-0.5">
                            {i + 1}
                          </span>
                          {s}
                        </li>
                      ))}
                    </ol>
                  )}

                  {/* Code blocks */}
                  {step.verifyCode && (
                    <CodeBlock
                      code={step.verifyCode.code}
                      language={step.verifyCode.language}
                      title={step.verifyCode.title}
                    />
                  )}
                  {step.installCode && (
                    <CodeBlock
                      code={step.installCode.code}
                      language={step.installCode.language}
                      title={step.installCode.title}
                    />
                  )}

                  {/* Notes */}
                  {step.note && (
                    <div className="flex gap-3 p-4 rounded-xl bg-accent-amber/5 border border-accent-amber/20">
                      <span className="text-base flex-shrink-0">💡</span>
                      <p className="text-sm text-accent-amber/90 leading-relaxed">{step.note}</p>
                    </div>
                  )}

                  {/* Links */}
                  {step.links && (
                    <div className="flex flex-wrap gap-2">
                      {step.links.map(l => (
                        <a key={l.label} href={l.url} target="_blank" rel="noreferrer"
                           className="btn-secondary text-xs py-1.5 px-3">
                          {l.label} ↗
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Done banner */}
      <div className="mt-10 relative rounded-2xl overflow-hidden bg-gradient-to-br
                      from-accent-green/10 to-brand-900/30 border border-accent-green/20 p-8 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h2 className="text-xl font-bold text-white mb-2">Lab Ready!</h2>
        <p className="text-slate-400 text-sm mb-5 max-w-md mx-auto">
          Once all 8 steps are complete, your lab environment is production-ready.
          Start with the Windows Server 2025 course.
        </p>
        <a href="/windows-server-2025" className="btn-primary">
          Start Windows Server 2025 →
        </a>
      </div>
    </div>
  )
}
