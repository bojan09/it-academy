import React from 'react'
import CoursePage from '../components/CoursePage.jsx'

const LESSONS = [
  {
    id: 'ws2025-01',
    title: 'Introduction to Windows Server 2025',
    description: 'Architecture overview, editions, hardware requirements, and the installation process in VMware.',
    href: '/windows-server-2025/intro',
    xp: 50,
    readTime: '~20 min',
    icon: '🖥️',
  },
  {
    id: 'ws2025-02',
    title: 'Active Directory & Domain Services',
    description: 'Deploy AD DS, promote a domain controller, create OUs, users, and groups.',
    href: '/windows-server-2025/active-directory',
    xp: 100,
    readTime: '~45 min',
    icon: '🏢',
  },
  {
    id: 'ws2025-03',
    title: 'DHCP Server Configuration',
    description: 'Install and configure DHCP, create scopes, reservations, and failover pairs.',
    href: '/windows-server-2025/dhcp',
    xp: 80,
    readTime: '~30 min',
    icon: '📡',
  },
  {
    id: 'ws2025-04',
    title: 'DNS Server Configuration',
    description: 'Set up primary/secondary zones, forwarders, conditional forwarders, and DNS security.',
    href: '/windows-server-2025/dns',
    xp: 80,
    readTime: '~30 min',
    icon: '🌐',
  },
  {
    id: 'ws2025-05',
    title: 'Group Policy Management',
    description: 'Create and link GPOs, configure security policies, software deployment, and logon scripts.',
    href: '/windows-server-2025/group-policy',
    xp: 120,
    readTime: '~40 min',
    icon: '🔧',
  },
  {
    id: 'ws2025-06',
    title: 'Hyper-V Virtualisation',
    description: 'Install Hyper-V, create virtual machines, configure virtual switches, and manage snapshots.',
    href: '/windows-server-2025/hyper-v',
    xp: 100,
    readTime: '~35 min',
    icon: '⚙️',
  },
  {
    id: 'ws2025-07',
    title: 'File Services & DFS',
    description: 'Configure file shares, NTFS permissions, Distributed File System namespaces and replication.',
    href: '/windows-server-2025/file-services',
    xp: 90,
    readTime: '~30 min',
    icon: '📁',
  },
  {
    id: 'ws2025-08',
    title: 'Windows Firewall & Security',
    description: 'Configure Windows Defender Firewall, inbound/outbound rules, and connection security policies.',
    href: '/windows-server-2025/firewall',
    xp: 100,
    readTime: '~35 min',
    icon: '🛡️',
  },
  {
    id: 'ws2025-09',
    title: 'Remote Desktop Services',
    description: 'Deploy RDS, configure session host, gateway, broker, and licensing.',
    href: '/windows-server-2025/rds',
    xp: 90,
    readTime: '~30 min',
    icon: '🖥️',
  },
  {
    id: 'ws2025-10',
    title: 'Server Backup & Recovery',
    description: 'Windows Server Backup, bare-metal recovery, system state backups, and restore procedures.',
    href: '/windows-server-2025/backup',
    xp: 80,
    readTime: '~25 min',
    icon: '💾',
  },
  {
    id: 'ws2025-11',
    title: 'Windows Admin Center',
    description: 'Deploy and use WAC for centralised server management, monitoring, and remote PowerShell.',
    href: '/windows-server-2025/wac',
    xp: 70,
    readTime: '~20 min',
    icon: '📊',
  },
  {
    id: 'ws2025-12',
    title: 'Server Hardening & Best Practices',
    description: 'CIS benchmarks, attack surface reduction, auditing, and security baseline application.',
    href: '/windows-server-2025/hardening',
    xp: 120,
    readTime: '~45 min',
    icon: '🔐',
  },
]

export default function WindowsServer2025() {
  return (
    <CoursePage
      id="windows-server-2025"
      title="Windows Server 2025"
      icon="🖥️"
      tagline="Enterprise server administration from install to production-hardened domain controller."
      description="A complete, hands-on course covering every major Windows Server 2025 role and feature. Each lesson includes a real VMware lab exercise, quiz, and production best practices — the same skills demanded in enterprise IT roles."
      lessons={LESSONS}
      highlights={[
        'Deploy Active Directory in a real VMware lab',
        'Configure DNS, DHCP, Group Policy from scratch',
        'Hyper-V virtualisation and snapshot management',
        'Server hardening using CIS benchmarks',
        'Each lesson includes a quiz and XP reward',
      ]}
      prereqs={[
        { label: 'VMware Lab Setup', href: '/vmware-setup' },
        { label: 'Networking Basics', href: '/networking' },
      ]}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Windows Server 2025' },
      ]}
    />
  )
}
