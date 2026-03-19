import React from 'react'
import CoursePage from '../components/CoursePage.jsx'

const LESSONS = [
  {
    id: 'trouble-01',
    title: 'The Troubleshooting Methodology',
    description: 'OSI-layer approach, divide and conquer, documentation habits, and when to escalate.',
    href: '/troubleshooting/methodology',
    xp: 50,
    readTime: '~20 min',
    icon: '🧠',
  },
  {
    id: 'trouble-02',
    title: 'Windows Troubleshooting',
    description: 'Event Viewer, Reliability Monitor, SFC/DISM, Windows Update issues, and boot failures.',
    href: '/troubleshooting/windows',
    xp: 80,
    readTime: '~35 min',
    icon: '🖥️',
  },
  {
    id: 'trouble-03',
    title: 'Linux Troubleshooting',
    description: 'journalctl, dmesg, strace, lsof, and diagnosing service failures and kernel panics.',
    href: '/troubleshooting/linux',
    xp: 80,
    readTime: '~35 min',
    icon: '🐧',
  },
  {
    id: 'trouble-04',
    title: 'Network Troubleshooting',
    description: 'Ping, traceroute, nslookup, Wireshark, and a structured methodology for connectivity issues.',
    href: '/troubleshooting/networking',
    xp: 80,
    readTime: '~35 min',
    icon: '🌐',
  },
  {
    id: 'trouble-05',
    title: 'Active Directory Issues',
    description: 'Replication failures, DNS misconfigurations, Kerberos errors, and SYSVOL problems.',
    href: '/troubleshooting/active-directory',
    xp: 90,
    readTime: '~40 min',
    icon: '🏢',
  },
  {
    id: 'trouble-06',
    title: 'Performance & Capacity Issues',
    description: 'CPU, RAM, disk I/O, network bottlenecks — identifying and resolving performance degradation.',
    href: '/troubleshooting/performance',
    xp: 80,
    readTime: '~35 min',
    icon: '📈',
  },
]

export default function Troubleshooting() {
  return (
    <CoursePage
      id="troubleshooting"
      title="Troubleshooting"
      icon="🔍"
      tagline="Systematic diagnostic methodology for Windows, Linux, network, and AD issues."
      description="Stop guessing and start diagnosing. This course teaches a structured troubleshooting methodology that works across every platform and problem type — the same approach used by senior sysadmins and SREs."
      lessons={LESSONS}
      highlights={[
        'OSI-layer top-down troubleshooting approach',
        'Windows Event Viewer and reliability analysis',
        'Linux journal and kernel diagnostic tools',
        'Wireshark packet capture walkthroughs',
        'Active Directory replication repair procedures',
      ]}
      accentColor="text-accent-amber"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Troubleshooting' },
      ]}
    />
  )
}
