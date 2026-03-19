import React from 'react'
import CoursePage from '../components/CoursePage.jsx'

const LESSONS = [
  {
    id: 'sec-01',
    title: 'The CIA Triad & Security Models',
    description: 'Confidentiality, Integrity, Availability — plus Zero Trust, defence in depth, and least privilege.',
    href: '/cybersecurity/cia-triad',
    xp: 50,
    readTime: '~20 min',
    icon: '🛡️',
  },
  {
    id: 'sec-02',
    title: 'Threat Modelling',
    description: 'STRIDE methodology, attack surfaces, threat actors, MITRE ATT&CK framework introduction.',
    href: '/cybersecurity/threat-modelling',
    xp: 70,
    readTime: '~30 min',
    icon: '🎯',
  },
  {
    id: 'sec-03',
    title: 'Windows Server Hardening',
    description: 'CIS benchmarks, attack surface reduction, local security policy, and auditing configuration.',
    href: '/cybersecurity/windows-hardening',
    xp: 100,
    readTime: '~40 min',
    icon: '🔒',
  },
  {
    id: 'sec-04',
    title: 'Linux Server Hardening',
    description: 'SELinux, AppArmor, fail2ban, sysctl hardening, and CIS Level 1/2 benchmarks.',
    href: '/cybersecurity/linux-hardening',
    xp: 100,
    readTime: '~40 min',
    icon: '🐧',
  },
  {
    id: 'sec-05',
    title: 'Firewall Configuration',
    description: 'Stateful vs stateless firewalls, rule ordering, DMZ architecture, and WAF concepts.',
    href: '/cybersecurity/firewall',
    xp: 90,
    readTime: '~35 min',
    icon: '🔥',
  },
  {
    id: 'sec-06',
    title: 'PKI, SSL/TLS & Certificates',
    description: 'CA hierarchy, certificate lifecycle, Let\'s Encrypt, internal PKI, and common TLS misconfigurations.',
    href: '/cybersecurity/pki',
    xp: 80,
    readTime: '~35 min',
    icon: '🔑',
  },
  {
    id: 'sec-07',
    title: 'Intrusion Detection & SIEM',
    description: 'IDS vs IPS, Snort/Suricata concepts, log aggregation, and alert correlation in a SIEM.',
    href: '/cybersecurity/ids-siem',
    xp: 100,
    readTime: '~40 min',
    icon: '👁️',
  },
  {
    id: 'sec-08',
    title: 'Vulnerability Scanning',
    description: 'Nessus, OpenVAS, CVE/CVSS scoring, patch prioritisation, and remediation workflow.',
    href: '/cybersecurity/vuln-scanning',
    xp: 90,
    readTime: '~35 min',
    icon: '🔬',
  },
  {
    id: 'sec-09',
    title: 'Incident Response',
    description: 'The 6-phase IR lifecycle: preparation, identification, containment, eradication, recovery, lessons.',
    href: '/cybersecurity/incident-response',
    xp: 100,
    readTime: '~40 min',
    icon: '🚨',
  },
  {
    id: 'sec-10',
    title: 'Active Directory Security',
    description: 'Kerberoasting, Pass-the-Hash, BloodHound concepts, privileged access workstations, and tiering.',
    href: '/cybersecurity/ad-security',
    xp: 120,
    readTime: '~50 min',
    icon: '🏢',
  },
]

export default function Cybersecurity() {
  return (
    <CoursePage
      id="cybersecurity"
      title="Cybersecurity"
      icon="🛡️"
      tagline="Threat modelling, system hardening, and incident response for infrastructure defenders."
      description="Practical security for sysadmins who want to defend, not just comply. Covers the full defensive stack from threat modelling and hardening through to SIEM, vulnerability management, and incident response — all with lab exercises."
      lessons={LESSONS}
      highlights={[
        'MITRE ATT&CK framework and threat modelling',
        'Windows and Linux CIS benchmark hardening',
        'PKI and internal certificate authority setup',
        'Active Directory attack paths and defences',
        'Full incident response tabletop exercise',
      ]}
      prereqs={[
        { label: 'Windows Server 2025', href: '/windows-server-2025' },
        { label: 'Linux Fundamentals', href: '/linux' },
        { label: 'Networking', href: '/networking' },
      ]}
      accentColor="text-accent-red"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Cybersecurity' },
      ]}
    />
  )
}
