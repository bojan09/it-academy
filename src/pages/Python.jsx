import React from 'react'
import CoursePage from '../components/CoursePage.jsx'

const LESSONS = [
  {
    id: 'py-01',
    title: 'Python Basics for SysAdmins',
    description: 'Variables, data types, control flow, functions, and modules — from a sysadmin perspective.',
    href: '/python/basics',
    xp: 50,
    readTime: '~25 min',
    icon: '🐍',
  },
  {
    id: 'py-02',
    title: 'File System Automation',
    description: 'os, pathlib, shutil — automate file operations, directory traversal, and log rotation.',
    href: '/python/filesystem',
    xp: 70,
    readTime: '~30 min',
    icon: '📁',
  },
  {
    id: 'py-03',
    title: 'Working with Subprocess',
    description: 'Run shell commands from Python, capture output, handle errors, and build CLI wrappers.',
    href: '/python/subprocess',
    xp: 70,
    readTime: '~25 min',
    icon: '⚡',
  },
  {
    id: 'py-04',
    title: 'Network Automation with Python',
    description: 'socket, requests library, pinging hosts, port scanning, and REST API interactions.',
    href: '/python/networking',
    xp: 80,
    readTime: '~35 min',
    icon: '🌐',
  },
  {
    id: 'py-05',
    title: 'Parsing Logs & Text Processing',
    description: 'regex, csv, json — parse Windows Event logs, Linux syslog, and structured data at scale.',
    href: '/python/log-parsing',
    xp: 80,
    readTime: '~35 min',
    icon: '📊',
  },
  {
    id: 'py-06',
    title: 'Scheduled Tasks & Cron Automation',
    description: 'Schedule Python scripts with cron and Task Scheduler; build reliable automation pipelines.',
    href: '/python/scheduling',
    xp: 70,
    readTime: '~25 min',
    icon: '⏱️',
  },
  {
    id: 'py-07',
    title: 'Infrastructure Monitoring Scripts',
    description: 'Build disk, CPU, memory, and service health monitors that alert via email or webhook.',
    href: '/python/monitoring',
    xp: 90,
    readTime: '~40 min',
    icon: '📈',
  },
  {
    id: 'py-08',
    title: 'Ansible & Python Integration',
    description: 'Write Ansible playbooks and custom modules; use Python to extend your automation platform.',
    href: '/python/ansible',
    xp: 100,
    readTime: '~45 min',
    icon: '🔧',
  },
  {
    id: 'py-09',
    title: 'Building a SysAdmin CLI Tool',
    description: 'End-to-end project: build a real command-line tool for server inventory and health checks.',
    href: '/python/cli-tool',
    xp: 120,
    readTime: '~50 min',
    icon: '🏗️',
  },
]

export default function Python() {
  return (
    <CoursePage
      id="python"
      title="Python for SysAdmins"
      icon="🐍"
      tagline="Automate everything — from file ops and log parsing to full infrastructure monitoring tools."
      description="Purpose-built Python training for sysadmins and infrastructure engineers. No prior programming experience required. Every lesson solves a real operational problem you'll actually encounter in your job."
      lessons={LESSONS}
      highlights={[
        'Automate repetitive sysadmin tasks with Python',
        'Parse Windows Event logs and Linux syslog',
        'Build real network scanning and monitoring tools',
        'Integrate with Ansible for infrastructure automation',
        'End-to-end project: CLI server inventory tool',
      ]}
      accentColor="text-accent-green"
      prereqs={[
        { label: 'Linux Fundamentals', href: '/linux' },
      ]}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Python for SysAdmins' },
      ]}
    />
  )
}
