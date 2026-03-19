import React from 'react'
import CoursePage from '../components/CoursePage.jsx'

const LESSONS = [
  {
    id: 'linux-01',
    title: 'Linux File System Hierarchy',
    description: 'FHS standard, /etc, /var, /proc, /sys, mount points, and filesystem types explained.',
    href: '/linux/filesystem',
    xp: 50,
    readTime: '~20 min',
    icon: '📁',
  },
  {
    id: 'linux-02',
    title: 'Shell Basics & Command Line',
    description: 'Bash fundamentals, redirection, pipes, variables, aliases, and .bashrc configuration.',
    href: '/linux/shell',
    xp: 60,
    readTime: '~25 min',
    icon: '🖥️',
  },
  {
    id: 'linux-03',
    title: 'Users, Groups & Permissions',
    description: 'useradd, passwd, chmod, chown, umask, sudo, and special permissions (SUID, SGID, sticky).',
    href: '/linux/permissions',
    xp: 70,
    readTime: '~30 min',
    icon: '👤',
  },
  {
    id: 'linux-04',
    title: 'Package Management',
    description: 'apt, yum/dnf, pacman — installing, updating, and managing packages across distributions.',
    href: '/linux/packages',
    xp: 60,
    readTime: '~20 min',
    icon: '📦',
  },
  {
    id: 'linux-05',
    title: 'systemd & Service Management',
    description: 'Units, targets, journalctl, enabling/disabling services, and writing custom unit files.',
    href: '/linux/systemd',
    xp: 80,
    readTime: '~35 min',
    icon: '⚙️',
  },
  {
    id: 'linux-06',
    title: 'Linux Networking',
    description: 'ip, ss, nmcli, Netplan, static IPs, routing tables, and network troubleshooting.',
    href: '/linux/networking',
    xp: 80,
    readTime: '~35 min',
    icon: '🌐',
  },
  {
    id: 'linux-07',
    title: 'SSH & Remote Access',
    description: 'Key-based auth, sshd_config hardening, tunnelling, and jump hosts.',
    href: '/linux/ssh',
    xp: 70,
    readTime: '~25 min',
    icon: '🔐',
  },
  {
    id: 'linux-08',
    title: 'Firewall with iptables & ufw',
    description: 'Chains, rules, NAT, ufw profiles, and persisting firewall rules across reboots.',
    href: '/linux/firewall',
    xp: 90,
    readTime: '~35 min',
    icon: '🛡️',
  },
  {
    id: 'linux-09',
    title: 'Disk Management & LVM',
    description: 'fdisk, parted, mkfs, mount, fstab, LVM volumes, and extending partitions live.',
    href: '/linux/disk',
    xp: 80,
    readTime: '~35 min',
    icon: '💾',
  },
  {
    id: 'linux-10',
    title: 'Linux Server Hardening',
    description: 'CIS benchmarks, fail2ban, SELinux/AppArmor, audit framework, and sysctl tuning.',
    href: '/linux/hardening',
    xp: 100,
    readTime: '~45 min',
    icon: '🔒',
  },
]

export default function Linux() {
  return (
    <CoursePage
      id="linux"
      title="Linux Fundamentals"
      icon="🐧"
      tagline="Command-line mastery, server administration, and hardening from first principles."
      description="A practical Linux course built for sysadmins and infrastructure engineers. Every lesson is hands-on with Ubuntu Server in VMware — covering everything from basic shell usage to LVM disk management and server hardening."
      lessons={LESSONS}
      highlights={[
        'Full Ubuntu Server setup in VMware lab',
        'systemd service management and unit files',
        'SSH hardening and key-based authentication',
        'iptables and ufw firewall configuration',
        'LVM partitioning and live volume extension',
      ]}
      prereqs={[
        { label: 'VMware Lab Setup', href: '/vmware-setup' },
      ]}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Linux Fundamentals' },
      ]}
    />
  )
}
