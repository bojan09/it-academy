import React from 'react'
import CoursePage from '../components/CoursePage.jsx'

const LESSONS = [
  {
    id: 'unix-01',
    title: 'Unix Philosophy & History',
    description: 'The origins of Unix, the POSIX standard, BSD vs System V lineage, and how Unix shaped modern computing.',
    href: '/unix/philosophy',
    xp: 40,
    readTime: '~15 min',
    icon: '📜',
  },
  {
    id: 'unix-02',
    title: 'POSIX Shell Scripting',
    description: 'POSIX-compliant sh scripting — portable scripts that run across BSD, Solaris, and Linux.',
    href: '/unix/posix-shell',
    xp: 70,
    readTime: '~30 min',
    icon: '🖥️',
  },
  {
    id: 'unix-03',
    title: 'BSD Unix Systems',
    description: 'FreeBSD, OpenBSD, and NetBSD — architecture differences, ports system, and use cases.',
    href: '/unix/bsd',
    xp: 60,
    readTime: '~25 min',
    icon: '😈',
  },
  {
    id: 'unix-04',
    title: 'Unix File Permissions & ACLs',
    description: 'The Unix permission model, ACLs, setuid/setgid, sticky bits, and security implications.',
    href: '/unix/permissions',
    xp: 60,
    readTime: '~25 min',
    icon: '🔐',
  },
  {
    id: 'unix-05',
    title: 'Process & Signal Management',
    description: 'Unix process model, signals (SIGTERM, SIGKILL, SIGHUP), job control, and daemons.',
    href: '/unix/processes',
    xp: 70,
    readTime: '~30 min',
    icon: '⚙️',
  },
]

export default function Unix() {
  return (
    <CoursePage
      id="unix"
      title="Unix"
      icon="🔩"
      tagline="The roots of modern computing — POSIX, BSD, and the Unix philosophy."
      description="Understand the foundations that Linux, macOS, and modern cloud systems are built on. This course covers Unix history, POSIX standards, BSD systems, and the timeless design principles that still shape infrastructure today."
      lessons={LESSONS}
      highlights={[
        'The Unix philosophy: do one thing well',
        'POSIX-compliant scripting for portability',
        'FreeBSD and OpenBSD architecture and use cases',
        'Unix process model and signal handling',
      ]}
      prereqs={[
        { label: 'Linux Fundamentals', href: '/linux' },
      ]}
      accentColor="text-slate-300"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Linux / Unix', href: '/linux' },
        { label: 'Unix' },
      ]}
    />
  )
}
