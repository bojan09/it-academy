/**
 * Centralised glossary — single source of truth for all technical terms.
 * Used by:
 *   - GlossaryTooltip component (inline hover definitions)
 *   - Glossary page (browseable + searchable reference)
 *   - CommandPalette search index
 *
 * Structure: { term: { def, category, also? } }
 */

export const GLOSSARY_CATEGORIES = [
  'All',
  'Windows & AD',
  'Linux & Unix',
  'Networking',
  'Security',
  'DevOps & Cloud',
  'Scripting',
  'Platform',
]

export const GLOSSARY_DATA = [
  // ── Windows & AD ────────────────────────────────────────────────────────────
  { term: 'Active Directory',  category: 'Windows & AD', def: 'Microsoft\'s directory service for Windows domain networks. Stores information about users, computers, groups, and other resources. Built on LDAP and Kerberos.' },
  { term: 'AD DS',             category: 'Windows & AD', def: 'Active Directory Domain Services — the Windows Server role that provides the directory database and authentication services for a domain.' },
  { term: 'Domain Controller', category: 'Windows & AD', def: 'A server running AD DS that authenticates users, stores the directory database (NTDS.DIT), and enforces Group Policy in a Windows domain.' },
  { term: 'GPO',               category: 'Windows & AD', def: 'Group Policy Object — a container of configuration settings applied to users and computers in an Active Directory OU, site, or domain.' },
  { term: 'OU',                category: 'Windows & AD', def: 'Organisational Unit — an AD container used to organise objects and delegate administration. GPOs are applied at the OU level.' },
  { term: 'FSMO',              category: 'Windows & AD', def: 'Flexible Single Master Operation — five special AD roles held by specific domain controllers: PDC Emulator, RID Master, Infrastructure Master, Schema Master, Domain Naming Master.' },
  { term: 'NTDS.DIT',         category: 'Windows & AD', def: 'The Active Directory database file stored at C:\\Windows\\NTDS\\ntds.dit. Contains all AD objects. Never copy directly — use ntdsutil or Windows Server Backup.' },
  { term: 'SYSVOL',           category: 'Windows & AD', def: 'A shared folder replicated between all domain controllers containing Group Policy templates, logon scripts, and domain-wide public files. Replicated via DFSR.' },
  { term: 'Kerberos',         category: 'Windows & AD', def: 'The default authentication protocol in Active Directory. Uses encrypted tickets issued by a Key Distribution Centre (KDC) running on every DC. Port 88.' },
  { term: 'LDAP',             category: 'Windows & AD', def: 'Lightweight Directory Access Protocol — the protocol used to query and modify Active Directory objects. Plain LDAP uses port 389; LDAPS (encrypted) uses port 636.' },
  { term: 'Hyper-V',          category: 'Windows & AD', def: 'Microsoft\'s native Type-1 hypervisor for running virtual machines on Windows Server. Supports live migration, snapshots, and virtual networking.' },
  { term: 'WinRM',            category: 'Windows & AD', def: 'Windows Remote Management — Microsoft\'s implementation of WS-Management. Required for PowerShell remoting (PSRemoting). Uses port 5985 (HTTP) or 5986 (HTTPS).' },
  { term: 'RDP',              category: 'Windows & AD', def: 'Remote Desktop Protocol — Microsoft\'s proprietary protocol for graphical remote access to Windows systems. Port 3389. Never expose directly to the internet.' },
  { term: 'SMB',              category: 'Windows & AD', def: 'Server Message Block — the Windows file sharing protocol. Port 445. SMBv1 is a critical vulnerability (WannaCry). Always use SMBv3 with encryption enabled.' },
  { term: 'Group Policy',     category: 'Windows & AD', def: 'A Windows infrastructure feature for centralised management of user and computer configurations via GPOs linked to AD containers.' },
  { term: 'NTFS',             category: 'Windows & AD', def: 'New Technology File System — the default Windows file system. Supports file-level permissions (ACLs), encryption (EFS), compression, and auditing.' },

  // ── Linux & Unix ────────────────────────────────────────────────────────────
  { term: 'Bash',             category: 'Linux & Unix', def: 'Bourne Again Shell — the default command-line interpreter for most Linux distributions. Also a scripting language for automation.' },
  { term: 'sudo',             category: 'Linux & Unix', def: 'Superuser Do — allows a permitted user to execute a command with elevated privileges. Configured in /etc/sudoers.' },
  { term: 'chmod',            category: 'Linux & Unix', def: 'Change Mode — Unix command to set file permissions using octal notation (chmod 755) or symbolic notation (chmod u+x). Permissions: r=4, w=2, x=1.' },
  { term: 'chown',            category: 'Linux & Unix', def: 'Change Owner — Unix command to change the owner and/or group of a file or directory. Example: chown www-data:www-data /var/www.' },
  { term: 'systemd',          category: 'Linux & Unix', def: 'The init system and service manager used by most modern Linux distributions. Manages system startup, services, logging (journald), and timers.' },
  { term: 'SSH',              category: 'Linux & Unix', def: 'Secure Shell — an encrypted network protocol for remote administration. Port 22. Uses public-key cryptography for authentication. Always disable password auth in production.' },
  { term: 'cron',             category: 'Linux & Unix', def: 'A time-based job scheduler in Linux. Crontab entries define scheduled commands using: minute hour day month weekday command.' },
  { term: 'iptables',         category: 'Linux & Unix', def: 'User-space utility for configuring the Linux kernel\'s Netfilter firewall. Manages INPUT, OUTPUT, and FORWARD chains. Being superseded by nftables.' },
  { term: 'SELinux',          category: 'Linux & Unix', def: 'Security-Enhanced Linux — a MAC (Mandatory Access Control) kernel security module. Uses security contexts/labels to enforce fine-grained access policies.' },
  { term: 'AppArmor',         category: 'Linux & Unix', def: 'Application Armor — a Linux security module that restricts program capabilities using per-program profiles. Used by default in Ubuntu/Debian.' },
  { term: 'LVM',              category: 'Linux & Unix', def: 'Logical Volume Manager — allows flexible disk management in Linux. Volumes can be resized, snapshotted, and moved without downtime.' },
  { term: 'POSIX',            category: 'Linux & Unix', def: 'Portable Operating System Interface — a family of IEEE standards defining Unix-compatible APIs, ensuring portability across operating systems.' },
  { term: 'journald',         category: 'Linux & Unix', def: 'The systemd journal daemon — collects and stores log data as structured binary data. Queried with journalctl. Supersedes traditional syslog in modern distros.' },

  // ── Networking ───────────────────────────────────────────────────────────────
  { term: 'DNS',              category: 'Networking', def: 'Domain Name System — the distributed hierarchical system that translates hostnames to IP addresses (A records) and back (PTR records).' },
  { term: 'DHCP',             category: 'Networking', def: 'Dynamic Host Configuration Protocol — automatically assigns IP addresses, subnet masks, gateways, and DNS servers to clients via the DORA process. Ports 67/68.' },
  { term: 'TCP/IP',           category: 'Networking', def: 'The foundational protocol suite of the internet. TCP provides reliable, ordered delivery. IP provides logical addressing and routing.' },
  { term: 'OSI Model',        category: 'Networking', def: 'Open Systems Interconnection — a 7-layer conceptual model: Physical, Data Link, Network, Transport, Session, Presentation, Application.' },
  { term: 'VLAN',             category: 'Networking', def: 'Virtual Local Area Network — logical network segmentation within a physical switch. Uses 802.1Q tagging. Reduces broadcast domains and improves security.' },
  { term: 'Subnet',           category: 'Networking', def: 'A logical subdivision of an IP network. Defined by a network address and subnet mask (e.g. 192.168.100.0/24). Reduces broadcast traffic and improves security.' },
  { term: 'NAT',              category: 'Networking', def: 'Network Address Translation — maps private IP addresses to one or more public IPs. Enables multiple devices to share a single internet connection.' },
  { term: 'OSPF',             category: 'Networking', def: 'Open Shortest Path First — a link-state interior routing protocol. Calculates shortest paths using Dijkstra\'s algorithm. Used in enterprise networks.' },
  { term: 'BGP',              category: 'Networking', def: 'Border Gateway Protocol — the exterior routing protocol of the internet. Manages routing between autonomous systems (AS). Used by ISPs and large enterprises.' },
  { term: 'STP',              category: 'Networking', def: 'Spanning Tree Protocol (802.1D) — prevents switching loops in Ethernet networks by selectively blocking redundant paths. RSTP (802.1w) is the modern version.' },
  { term: 'SNMP',             category: 'Networking', def: 'Simple Network Management Protocol — used for monitoring and managing network devices. SNMPv3 with authentication is required; v1/v2c transmit in plaintext.' },
  { term: 'NTP',              category: 'Networking', def: 'Network Time Protocol — synchronises clocks across networked computers. Critical for AD/Kerberos (5-minute skew tolerance), logging, and certificates. Port 123 UDP.' },

  // ── Security ─────────────────────────────────────────────────────────────────
  { term: 'CIA Triad',        category: 'Security', def: 'Confidentiality, Integrity, Availability — the three core principles of information security. Every security control maps to one or more of these.' },
  { term: 'Zero Trust',       category: 'Security', def: 'A security model rejecting implicit trust based on network location. Requires continuous verification of identity, device, and context for every access request.' },
  { term: 'SSL/TLS',          category: 'Security', def: 'Transport Layer Security (TLS) and its predecessor SSL — cryptographic protocols providing encryption, authentication, and integrity for network communications.' },
  { term: 'PKI',              category: 'Security', def: 'Public Key Infrastructure — a system of digital certificates, certificate authorities (CAs), and registration authorities managing encryption keys.' },
  { term: 'MFA',              category: 'Security', def: 'Multi-Factor Authentication — requires two or more verification factors: something you know (password), have (token), or are (biometric).' },
  { term: 'RBAC',             category: 'Security', def: 'Role-Based Access Control — assigns permissions to roles, then assigns users to roles. Simplifies access management and enforces least privilege.' },
  { term: 'CVE',              category: 'Security', def: 'Common Vulnerabilities and Exposures — a public catalogue of disclosed security vulnerabilities. Each entry has a unique ID (e.g. CVE-2021-44228) and CVSS score.' },
  { term: 'CVSS',             category: 'Security', def: 'Common Vulnerability Scoring System — a 0–10 numerical score rating vulnerability severity: 0–3.9 Low, 4–6.9 Medium, 7–8.9 High, 9–10 Critical.' },
  { term: 'Firewall',         category: 'Security', def: 'A network security device or software that monitors and filters traffic based on rules. Stateful firewalls track connection state; WAFs inspect HTTP traffic.' },
  { term: 'IDS/IPS',          category: 'Security', def: 'Intrusion Detection/Prevention System — monitors traffic for suspicious patterns. IDS alerts; IPS actively blocks. Examples: Snort, Suricata.' },
  { term: 'SIEM',             category: 'Security', def: 'Security Information and Event Management — aggregates and correlates logs from across infrastructure to detect threats. Examples: Splunk, Microsoft Sentinel.' },

  // ── DevOps & Cloud ───────────────────────────────────────────────────────────
  { term: 'CI/CD',            category: 'DevOps & Cloud', def: 'Continuous Integration/Continuous Deployment — automating the building, testing, and deployment of code. Tools: GitHub Actions, Jenkins, GitLab CI.' },
  { term: 'Docker',           category: 'DevOps & Cloud', def: 'A containerisation platform. Containers package an application with its dependencies into a portable, isolated unit. Uses a Dockerfile for image definition.' },
  { term: 'Kubernetes',       category: 'DevOps & Cloud', def: 'An open-source container orchestration platform. Manages deployment, scaling, load balancing, and self-healing of containerised workloads.' },
  { term: 'Terraform',        category: 'DevOps & Cloud', def: 'An Infrastructure as Code tool using HCL. Provisions and manages cloud and on-premises infrastructure declaratively. Supports AWS, Azure, GCP, VMware.' },
  { term: 'Ansible',          category: 'DevOps & Cloud', def: 'An agentless configuration management and automation tool. Uses YAML playbooks to define desired system state. Connects via SSH.' },
  { term: 'ITIL',             category: 'DevOps & Cloud', def: 'Information Technology Infrastructure Library — a framework of IT service management best practices covering service strategy, design, transition, operation, and improvement.' },
  { term: 'IaC',              category: 'DevOps & Cloud', def: 'Infrastructure as Code — managing and provisioning infrastructure through machine-readable configuration files rather than manual processes.' },
  { term: 'SRE',              category: 'DevOps & Cloud', def: 'Site Reliability Engineering — applying software engineering practices to infrastructure and operations. Focuses on reliability, scalability, and automation.' },

  // ── Scripting ────────────────────────────────────────────────────────────────
  { term: 'PowerShell',       category: 'Scripting', def: 'Microsoft\'s task automation framework — a .NET-based shell and scripting language. Pipelines pass objects (not text). Essential for Windows administration.' },
  { term: 'Python',           category: 'Scripting', def: 'A high-level, general-purpose programming language widely used for automation, scripting, data processing, and infrastructure tooling.' },
  { term: 'Regex',            category: 'Scripting', def: 'Regular Expressions — a sequence of characters defining a search pattern. Used in bash (grep), PowerShell (-match), Python (re module), and log parsing.' },
  { term: 'API',              category: 'Scripting', def: 'Application Programming Interface — a set of rules and definitions for how software components communicate. REST APIs use HTTP; responses are typically JSON.' },
  { term: 'JSON',             category: 'Scripting', def: 'JavaScript Object Notation — a lightweight, human-readable data format using key-value pairs. The de facto standard for API responses and config files.' },
  { term: 'YAML',             category: 'Scripting', def: 'YAML Ain\'t Markup Language — a human-readable data serialisation format. Used heavily in Kubernetes, Ansible, GitHub Actions, and Docker Compose.' },

  // ── Platform ─────────────────────────────────────────────────────────────────
  { term: 'XP',               category: 'Platform', def: 'Experience Points — earned on SysAdminPro by completing lessons and passing quizzes. Accumulate XP to level up from Junior SysAdmin to Infrastructure Pro.' },
  { term: 'VMware',           category: 'Platform', def: 'A virtualisation platform widely used in enterprise environments. VMware Workstation Pro is the recommended tool for this platform\'s lab exercises.' },
]

// Flat object { term: def } — used by GlossaryTooltip and CommandPalette
export const GLOSSARY = Object.fromEntries(
  GLOSSARY_DATA.map(({ term, def }) => [term, def])
)

export default GLOSSARY
