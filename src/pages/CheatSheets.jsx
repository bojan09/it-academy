import React, { useState } from 'react'
import Breadcrumb from '../components/Breadcrumb.jsx'
import CodeBlock from '../components/CodeBlock.jsx'

const SHEETS = [
  {
    id: 'linux',
    title: 'Linux Commands',
    icon: '🐧',
    color: 'text-accent-green',
    sections: [
      {
        heading: 'File System',
        code: `ls -lah              # List all files with sizes
cd /path/to/dir      # Change directory
pwd                  # Print working directory
mkdir -p dir/subdir  # Create nested directories
rm -rf /path         # Remove recursively (⚠ careful)
cp -r src/ dest/     # Copy directory recursively
mv old new           # Move or rename
find / -name "*.log" # Find files by name
du -sh /var/log/*    # Disk usage per directory
df -h                # Filesystem disk space usage`,
        language: 'bash',
      },
      {
        heading: 'Permissions',
        code: `chmod 755 file       # rwxr-xr-x
chmod +x script.sh   # Add execute permission
chown user:group f   # Change owner and group
chown -R www-data /var/www  # Recursive chown
umask 022            # Default permission mask
ls -la               # Show permissions
stat file            # Detailed file metadata
getfacl file         # Show ACLs
setfacl -m u:bob:rwx f  # Add ACL entry`,
        language: 'bash',
      },
      {
        heading: 'User Management',
        code: `useradd -m -s /bin/bash username  # Create user
passwd username              # Set password
usermod -aG sudo username    # Add to sudo group
userdel -r username          # Delete user + home
id username                  # Show uid/gid/groups
who                          # Logged in users
last                         # Login history
sudo su -                    # Switch to root`,
        language: 'bash',
      },
      {
        heading: 'Networking',
        code: `ip addr show         # Show IP addresses
ip route show        # Show routing table
ss -tlnp             # Show listening ports
ping -c 4 host       # Ping 4 times
traceroute host      # Trace route
nslookup domain      # DNS lookup
curl -I https://url  # HTTP headers only
wget -O file url     # Download file
netstat -an          # All connections`,
        language: 'bash',
      },
      {
        heading: 'systemd',
        code: `systemctl status svc       # Service status
systemctl start svc        # Start service
systemctl stop svc         # Stop service
systemctl restart svc      # Restart service
systemctl enable svc       # Enable at boot
systemctl disable svc      # Disable at boot
systemctl list-units --failed  # Failed units
journalctl -u svc -f       # Follow service logs
journalctl --since today   # Today's logs
journalctl -p err -b       # Errors since boot`,
        language: 'bash',
      },
      {
        heading: 'Package Management',
        code: `# Debian/Ubuntu
apt update && apt upgrade -y
apt install package
apt remove package
apt search keyword
dpkg -l | grep package

# RHEL/CentOS/Fedora
yum update -y
dnf install package
rpm -qa | grep package

# Arch Linux
pacman -Syu            # Update all
pacman -S package      # Install`,
        language: 'bash',
      },
    ],
  },
  {
    id: 'powershell',
    title: 'PowerShell',
    icon: '⚡',
    color: 'text-accent-cyan',
    sections: [
      {
        heading: 'Core Cmdlets',
        code: `Get-Help cmdlet -Full      # Full help
Get-Command *keyword*      # Find commands
Get-Member                 # Show object properties
Get-History               # Command history
Clear-Host                # Clear console (cls)
Set-ExecutionPolicy RemoteSigned  # Allow scripts
$PSVersionTable           # PowerShell version`,
        language: 'powershell',
      },
      {
        heading: 'File System',
        code: `Get-ChildItem -Path C:\\ -Recurse  # ls -R
New-Item -ItemType Directory -Path C:\\dir
Remove-Item -Path file -Recurse -Force
Copy-Item src dest -Recurse
Move-Item old new
Get-Content file.txt       # cat
Set-Content file.txt "text"
Add-Content file.txt "append"
Test-Path C:\\path          # Check exists`,
        language: 'powershell',
      },
      {
        heading: 'Active Directory',
        code: `Get-ADUser -Filter * | Select Name,Enabled
Get-ADUser -Identity jdoe -Properties *
New-ADUser -Name "John Doe" -SamAccountName jdoe \`
  -UserPrincipalName jdoe@lab.local \`
  -AccountPassword (ConvertTo-SecureString "Pass1!" -AsPlainText -Force) \`
  -Enabled $true
Set-ADUser -Identity jdoe -Title "Engineer"
Disable-ADAccount -Identity jdoe
Get-ADGroupMember "Domain Admins"
Add-ADGroupMember -Identity "IT" -Members jdoe`,
        language: 'powershell',
      },
      {
        heading: 'Networking',
        code: `Get-NetIPAddress                    # IP config
Get-NetAdapter                      # Network adapters
Test-NetConnection -Port 443 host   # Test-port
Resolve-DnsName google.com          # DNS lookup
Get-NetTCPConnection                # Active connections
New-NetIPAddress -InterfaceAlias "Ethernet0" \`
  -IPAddress 192.168.1.10 -PrefixLength 24 \`
  -DefaultGateway 192.168.1.1
Set-DnsClientServerAddress -InterfaceAlias "Ethernet0" \`
  -ServerAddresses 192.168.1.1`,
        language: 'powershell',
      },
      {
        heading: 'Services & Processes',
        code: `Get-Service | Where-Object {$_.Status -eq "Stopped"}
Start-Service -Name "Spooler"
Stop-Service  -Name "Spooler"
Restart-Service -Name "W32Time"
Set-Service -Name "Telnet" -StartupType Disabled
Get-Process | Sort-Object CPU -Descending | Select -First 10
Stop-Process -Name "notepad" -Force
Get-EventLog -LogName System -Newest 50`,
        language: 'powershell',
      },
    ],
  },
  {
    id: 'networking',
    title: 'Networking',
    icon: '🌐',
    color: 'text-brand-400',
    sections: [
      {
        heading: 'Common Ports',
        code: `20/21  FTP (data/control)
22     SSH / SFTP
23     Telnet (insecure — avoid)
25     SMTP
53     DNS (UDP/TCP)
67/68  DHCP (server/client)
80     HTTP
88     Kerberos
110    POP3
123    NTP
143    IMAP
389    LDAP
443    HTTPS
445    SMB
636    LDAPS
993    IMAPS
995    POP3S
1433   MSSQL
3268   AD Global Catalog
3306   MySQL
3389   RDP (restrict access!)
5432   PostgreSQL
5900   VNC
8080   HTTP Alternate`,
        language: 'text',
      },
      {
        heading: 'Subnet Quick Reference',
        code: `/32  255.255.255.255   1 host
/31  255.255.255.254   2 hosts  (point-to-point)
/30  255.255.255.252   2 hosts  (4 total)
/29  255.255.255.248   6 hosts  (8 total)
/28  255.255.255.240   14 hosts (16 total)
/27  255.255.255.224   30 hosts (32 total)
/26  255.255.255.192   62 hosts (64 total)
/25  255.255.255.128   126 hosts
/24  255.255.255.0     254 hosts  ← common LAN
/23  255.255.254.0     510 hosts
/22  255.255.252.0     1022 hosts
/21  255.255.248.0     2046 hosts
/20  255.255.240.0     4094 hosts
/16  255.255.0.0       65534 hosts
/8   255.0.0.0         16M hosts`,
        language: 'text',
      },
      {
        heading: 'Private IP Ranges (RFC 1918)',
        code: `10.0.0.0/8        Class A — 10.0.0.0 – 10.255.255.255
172.16.0.0/12     Class B — 172.16.0.0 – 172.31.255.255
192.168.0.0/16    Class C — 192.168.0.0 – 192.168.255.255

Loopback:         127.0.0.0/8  (localhost)
Link-Local:       169.254.0.0/16 (APIPA — no DHCP)
Multicast:        224.0.0.0/4`,
        language: 'text',
      },
      {
        heading: 'Diagnostic Commands',
        code: `# Windows
ipconfig /all            # Full IP config
ipconfig /release        # Release DHCP lease
ipconfig /renew          # Renew DHCP lease
ipconfig /flushdns       # Flush DNS cache
netstat -an              # All connections + ports
nslookup google.com      # DNS lookup
tracert 8.8.8.8          # Trace route
ping -t host             # Continuous ping

# Linux
ip addr show             # IP addresses
ip route show            # Routing table
ss -tlnp                 # Listening sockets
nslookup / dig domain    # DNS queries
traceroute / mtr host    # Route tracing
tcpdump -i eth0 port 80  # Capture HTTP`,
        language: 'bash',
      },
    ],
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting Steps',
    icon: '🔍',
    color: 'text-accent-amber',
    sections: [
      {
        heading: 'General Methodology',
        code: `1. IDENTIFY    — What exactly is the symptom? When did it start?
2. SCOPE       — Affects one user, one site, or everyone?
3. REPRODUCE   — Can you reproduce it consistently?
4. RECENT      — What changed recently? (Updates, config, hardware)
5. ISOLATE     — OSI layer-by-layer or divide & conquer
6. FIX         — Apply the smallest change first, test after each
7. VERIFY      — Confirm the fix works from the user's perspective
8. DOCUMENT    — Record root cause, fix, and prevention steps`,
        language: 'text',
      },
      {
        heading: 'Network Connectivity Checklist',
        code: `✓ Is the physical cable connected / Wi-Fi associated?
✓ Does the NIC have a valid IP? (not 169.254.x.x)
✓ Can you ping the default gateway?
✓ Can you ping 8.8.8.8? (tests routing, not DNS)
✓ Can you ping google.com? (tests DNS resolution)
✓ Is the firewall blocking the port? (Test-NetConnection)
✓ Is the destination service actually running?
✓ Is there a proxy in the way?
✓ Check DNS: nslookup / dig with explicit server`,
        language: 'text',
      },
      {
        heading: 'Windows Boot Issues',
        code: `# Boot into Recovery Environment, then:
sfc /scannow                    # System File Checker
DISM /Online /Cleanup-Image /RestoreHealth  # Fix WinSxS
bcdedit /enum all               # View boot entries
bootrec /fixmbr                 # Fix MBR
bootrec /fixboot                # Fix boot sector
bootrec /rebuildbcd             # Rebuild BCD

# Check disk
chkdsk C: /f /r                 # Fix + recover bad sectors

# Event log (run as admin)
Get-EventLog System -Newest 20 -EntryType Error`,
        language: 'powershell',
      },
      {
        heading: 'Active Directory Quick Checks',
        code: `# Replication status
repadmin /showrepl
repadmin /replsummary

# DNS issues
dcdiag /test:dns /v
nslookup -type=SRV _ldap._tcp.dc._msdcs.lab.local

# SYSVOL / NETLOGON shares
net share
dir \\\\DC01\\SYSVOL

# Kerberos
klist purge                     # Clear ticket cache
klist                           # Show current tickets

# Force sync
repadmin /syncall /AdeP`,
        language: 'powershell',
      },
    ],
  },
]

export default function CheatSheets() {
  const [activeSheet, setActiveSheet] = useState('linux')

  const sheet = SHEETS.find(s => s.id === activeSheet)

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Cheat Sheets' }]} />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 no-print">
        <div>
          <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">Reference</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Cheat Sheets</h1>
          <p className="text-slate-400 text-sm mt-2">Quick-reference command guides. Use the copy button on any block, or print the whole sheet.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="btn-secondary text-sm flex-shrink-0 no-print"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Sheet
        </button>
      </div>

      {/* Sheet tabs */}
      <div className="flex gap-2 flex-wrap mb-8 no-print">
        {SHEETS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSheet(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                        transition-all duration-150
                        ${activeSheet === s.id
                          ? 'bg-brand-500 text-white shadow-glow-sm'
                          : 'bg-surface-800 text-slate-400 hover:text-white border border-surface-700'}`}
          >
            <span>{s.icon}</span>
            {s.title}
          </button>
        ))}
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-6">
        <h2 className="text-2xl font-bold">{sheet?.icon} {sheet?.title} Cheat Sheet — SysAdminPro</h2>
        <p className="text-sm text-gray-500">sysadminpro.dev</p>
        <hr className="my-3" />
      </div>

      {/* Sheet content */}
      {sheet && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{sheet.icon}</span>
            <h2 className={`text-2xl font-bold ${sheet.color}`}>{sheet.title}</h2>
          </div>
          {sheet.sections.map(section => (
            <div key={section.heading}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                {section.heading}
              </h3>
              <CodeBlock
                code={section.code}
                language={section.language}
                title={section.heading}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
