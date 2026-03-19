import React from 'react'
import CoursePage from '../components/CoursePage.jsx'

const LESSONS = [
  {
    id: 'win-01',
    title: 'Windows 10/11 Architecture',
    description: 'The NT kernel, subsystems, Registry, services, and the boot process explained.',
    href: '/windows/architecture',
    xp: 50,
    readTime: '~20 min',
    icon: '🏗️',
  },
  {
    id: 'win-02',
    title: 'User Accounts & Permissions',
    description: 'Local users, groups, UAC, NTFS permissions, and access control lists.',
    href: '/windows/permissions',
    xp: 60,
    readTime: '~25 min',
    icon: '👤',
  },
  {
    id: 'win-03',
    title: 'Windows Registry Deep Dive',
    description: 'Hives, keys, values, HKLM vs HKCU, safe editing practices, and backup strategies.',
    href: '/windows/registry',
    xp: 70,
    readTime: '~30 min',
    icon: '🗝️',
  },
  {
    id: 'win-04',
    title: 'Task Manager, Services & Processes',
    description: 'Process management, startup programs, service dependencies, and performance analysis.',
    href: '/windows/processes',
    xp: 60,
    readTime: '~25 min',
    icon: '📊',
  },
  {
    id: 'win-05',
    title: 'Networking in Windows',
    description: 'Network adapter configuration, ipconfig, netstat, firewall rules, and VPN setup.',
    href: '/windows/networking',
    xp: 70,
    readTime: '~30 min',
    icon: '🌐',
  },
  {
    id: 'win-06',
    title: 'Windows Event Viewer & Logging',
    description: 'Reading event logs, filtering, custom views, and forwarding events to a central collector.',
    href: '/windows/event-viewer',
    xp: 80,
    readTime: '~30 min',
    icon: '📋',
  },
]

export default function Windows() {
  return (
    <CoursePage
      id="windows"
      title="Windows Desktop"
      icon="💻"
      tagline="Deep-dive into Windows 10/11 administration for IT support and sysadmin roles."
      description="Understand how Windows actually works under the hood — from the kernel and Registry to user permissions, networking, and event logging. The foundation for any Windows-focused IT role."
      lessons={LESSONS}
      highlights={[
        'Registry editing and backup procedures',
        'NTFS permissions and ACL management',
        'Process and service troubleshooting',
        'Windows event log analysis',
      ]}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Windows Desktop' },
      ]}
    />
  )
}
