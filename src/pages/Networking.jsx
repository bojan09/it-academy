import React from 'react'
import CoursePage from '../components/CoursePage.jsx'

const LESSONS = [
  {
    id: 'net-01',
    title: 'The OSI Model',
    description: 'All 7 layers explained with real-world protocols mapped to each. Why it matters in troubleshooting.',
    href: '/networking/osi-model',
    xp: 60,
    readTime: '~25 min',
    icon: '📐',
  },
  {
    id: 'net-02',
    title: 'TCP/IP & the Internet Protocol Suite',
    description: 'IP addressing, TCP vs UDP, the three-way handshake, and how packets traverse a network.',
    href: '/networking/tcp-ip',
    xp: 70,
    readTime: '~30 min',
    icon: '🌐',
  },
  {
    id: 'net-03',
    title: 'Subnetting & CIDR',
    description: 'Binary subnetting, CIDR notation, calculating host ranges, and VLSM from scratch.',
    href: '/networking/subnetting',
    xp: 90,
    readTime: '~40 min',
    icon: '🔢',
  },
  {
    id: 'net-04',
    title: 'VLANs & Switching',
    description: 'Access vs trunk ports, 802.1Q tagging, inter-VLAN routing, and Spanning Tree Protocol.',
    href: '/networking/vlans',
    xp: 80,
    readTime: '~35 min',
    icon: '🔀',
  },
  {
    id: 'net-05',
    title: 'Routing Fundamentals',
    description: 'Static routes, default gateway, routing tables, RIP, OSPF overview, and BGP concepts.',
    href: '/networking/routing',
    xp: 90,
    readTime: '~40 min',
    icon: '🗺️',
  },
  {
    id: 'net-06',
    title: 'DNS Deep Dive',
    description: 'Recursive vs iterative queries, record types (A, AAAA, MX, CNAME, PTR), TTL, and DNSSEC.',
    href: '/networking/dns',
    xp: 70,
    readTime: '~30 min',
    icon: '📖',
  },
  {
    id: 'net-07',
    title: 'Network Troubleshooting',
    description: 'Methodology, ping, traceroute, nslookup, Wireshark basics, and common failure patterns.',
    href: '/networking/troubleshooting',
    xp: 80,
    readTime: '~35 min',
    icon: '🔍',
  },
  {
    id: 'net-08',
    title: 'Wireless Networking',
    description: '802.11 standards, WPA3, channel planning, enterprise Wi-Fi, and common attack vectors.',
    href: '/networking/wireless',
    xp: 70,
    readTime: '~25 min',
    icon: '📶',
  },
]

export default function Networking() {
  return (
    <CoursePage
      id="networking"
      title="Network Fundamentals"
      icon="🌐"
      tagline="TCP/IP, subnetting, routing, and troubleshooting — the non-negotiable sysadmin foundation."
      description="Network fundamentals every sysadmin and DevOps engineer must know. From OSI layers and subnetting through to VLANs, routing protocols, and hands-on Wireshark analysis in the lab."
      lessons={LESSONS}
      highlights={[
        'Subnetting practice from binary up to CIDR',
        'VLAN configuration and inter-VLAN routing',
        'Hands-on DNS record creation and testing',
        'Wireshark packet capture and analysis lab',
      ]}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Networking' },
      ]}
    />
  )
}
