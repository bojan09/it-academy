import React from 'react'
import CoursePage from '../components/CoursePage.jsx'

const LESSONS = [
  {
    id: 'ps-01',
    title: 'PowerShell Fundamentals',
    description: 'Cmdlets, pipeline, variables, objects, and the help system — the right mental model from day one.',
    href: '/powershell/fundamentals',
    xp: 50,
    readTime: '~25 min',
    icon: '⚡',
  },
  {
    id: 'ps-02',
    title: 'Working with Objects & the Pipeline',
    description: 'Select-Object, Where-Object, ForEach-Object, Sort-Object, and building powerful one-liners.',
    href: '/powershell/pipeline',
    xp: 70,
    readTime: '~30 min',
    icon: '🔗',
  },
  {
    id: 'ps-03',
    title: 'Scripts, Functions & Modules',
    description: 'Writing .ps1 scripts, functions with parameters, error handling, and packaging as modules.',
    href: '/powershell/scripting',
    xp: 80,
    readTime: '~35 min',
    icon: '📝',
  },
  {
    id: 'ps-04',
    title: 'Active Directory Automation',
    description: 'Manage users, groups, OUs, and GPOs entirely from the command line with AD cmdlets.',
    href: '/powershell/active-directory',
    xp: 100,
    readTime: '~45 min',
    icon: '🏢',
  },
  {
    id: 'ps-05',
    title: 'Remote Management with PSRemoting',
    description: 'WinRM, Enter-PSSession, Invoke-Command, and managing 100 servers from one console.',
    href: '/powershell/remoting',
    xp: 80,
    readTime: '~30 min',
    icon: '🌐',
  },
  {
    id: 'ps-06',
    title: 'File System & Registry Automation',
    description: 'Automate file operations, scheduled tasks, and registry modifications at enterprise scale.',
    href: '/powershell/filesystem',
    xp: 70,
    readTime: '~25 min',
    icon: '📁',
  },
  {
    id: 'ps-07',
    title: 'PowerShell Desired State Configuration',
    description: 'DSC resources, configurations, push vs pull mode, and compliance reporting.',
    href: '/powershell/dsc',
    xp: 100,
    readTime: '~40 min',
    icon: '⚙️',
  },
  {
    id: 'ps-08',
    title: 'Reporting & Scheduled Automation',
    description: 'Build HTML reports, schedule scripts as tasks, send email alerts, and export to CSV/JSON.',
    href: '/powershell/reporting',
    xp: 80,
    readTime: '~35 min',
    icon: '📊',
  },
]

export default function PowerShell() {
  return (
    <CoursePage
      id="powershell"
      title="PowerShell"
      icon="⚡"
      tagline="Automate Windows infrastructure — Active Directory, remoting, DSC, and beyond."
      description="PowerShell is the single most valuable skill for Windows infrastructure work. This course covers scripting fundamentals through to AD automation, PSRemoting, and Desired State Configuration — all with real lab exercises."
      lessons={LESSONS}
      highlights={[
        'Pipeline-first mindset for powerful one-liners',
        'Full Active Directory management via cmdlets',
        'Manage 100 servers simultaneously with PSRemoting',
        'Desired State Configuration for compliance enforcement',
      ]}
      accentColor="text-accent-cyan"
      prereqs={[
        { label: 'Windows Server 2025', href: '/windows-server-2025' },
      ]}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'PowerShell' },
      ]}
    />
  )
}
