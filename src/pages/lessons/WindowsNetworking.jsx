import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_WINDOWSNETWORKING_1 = `# ── IP Configuration ─────────────────────────────────────────
ipconfig /all              # Full NIC info including MAC, DHCP, DNS
ipconfig /flushdns         # Clear DNS resolver cache
ipconfig /release          # Release DHCP lease
ipconfig /renew            # Request new DHCP lease
ipconfig /displaydns       # Show DNS cache contents

# ── Connectivity testing ─────────────────────────────────────
ping -n 4 192.168.100.10   # ICMP ping (4 packets)
ping -a 192.168.100.10     # Resolve hostname from IP
tracert 8.8.8.8            # Trace route (Windows)

# PowerShell versions (more options)
Test-Connection -ComputerName DC01 -Count 2
Test-NetConnection -ComputerName DC01 -Port 389  # TCP port test
Test-NetConnection -ComputerName 8.8.8.8 -TraceRoute

# ── Connections and ports ────────────────────────────────────
netstat -ano               # All connections with PIDs
netstat -bn                # Connections with executable names
Get-NetTCPConnection       # PowerShell version
Get-NetTCPConnection -State Listen | Select-Object LocalPort,
  @{N='Process';E={(Get-Process -Id $_.OwningProcess).Name}}

# ── DNS ──────────────────────────────────────────────────────
nslookup dc01.lab.local
Resolve-DnsName dc01.lab.local -Type A
Resolve-DnsName -Name lab.local -Type MX

# ── Routing ──────────────────────────────────────────────────
route print                # Full routing table
Get-NetRoute               # PowerShell routing table`
const CODE_WINDOWSNETWORKING_2 = `# Find the adapter name
Get-NetAdapter | Select-Object Name, InterfaceDescription, Status

# Set static IP (replace 'Ethernet0' with your adapter name)
New-NetIPAddress \`\`
  -InterfaceAlias 'Ethernet0' \`\`
  -IPAddress      '192.168.100.50' \`\`
  -PrefixLength   24 \`\`
  -DefaultGateway '192.168.100.1'

# Set DNS servers
Set-DnsClientServerAddress \`\`
  -InterfaceAlias 'Ethernet0' \`\`
  -ServerAddresses '192.168.100.10','8.8.8.8'

# Revert to DHCP
Set-NetIPInterface -InterfaceAlias 'Ethernet0' -Dhcp Enabled
Set-DnsClientServerAddress -InterfaceAlias 'Ethernet0' -ResetServerAddresses`
const CODE_WINDOWSNETWORKING_3 = `# Full NIC info
Get-NetAdapter | Select-Object Name, Status, LinkSpeed, MacAddress

# IP configuration
Get-NetIPAddress | Where-Object AddressFamily -eq IPv4 |
  Select-Object InterfaceAlias, IPAddress, PrefixLength

# DNS servers
Get-DnsClientServerAddress -AddressFamily IPv4 |
  Where-Object ServerAddresses | Select-Object InterfaceAlias, ServerAddresses`
const CODE_WINDOWSNETWORKING_4 = `Name      Status  LinkSpeed  MacAddress
Ethernet0 Up      1 Gbps     00-0C-29-xx-xx-xx

InterfaceAlias  IPAddress        PrefixLength
Ethernet0       192.168.100.10   24

InterfaceAlias  ServerAddresses
Ethernet0       {127.0.0.1}`
const CODE_WINDOWSNETWORKING_5 = `# Test DC01's own services
$tests = @(
    @{Host='localhost'; Port=389;  Name='LDAP'},
    @{Host='localhost'; Port=53;   Name='DNS'},
    @{Host='localhost'; Port=3389; Name='RDP'},
    @{Host='localhost'; Port=5985; Name='WinRM'}
)

foreach ($t in $tests) {
    $r = Test-NetConnection -ComputerName $t.Host -Port $t.Port -WarningAction SilentlyContinue
    $status = if ($r.TcpTestSucceeded) {'OPEN'} else {'CLOSED'}
    Write-Host "  $($t.Name.PadRight(8)) port $($t.Port)  $status"
}`
const CODE_WINDOWSNETWORKING_6 = `  LDAP     port 389   OPEN
  DNS      port 53    OPEN
  RDP      port 3389  OPEN
  WinRM    port 5985  OPEN`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What does "ipconfig /all" show that plain "ipconfig" does not?',
    options: [
      'It shows only IPv6 addresses instead of IPv4',
      'It shows MAC address, DHCP server, lease times, DNS servers, and whether DHCP is enabled — full adapter configuration vs just IP/subnet/gateway',
      'It displays the routing table',
      'It shows all open network connections',
    ],
    correct: 1,
    explanation: 'ipconfig shows basic IP, subnet, and gateway. ipconfig /all adds: physical (MAC) address, DHCP enabled/disabled, DHCP server IP, IP lease obtained and expiry times, DNS servers, WINS servers, and whether autoconfiguration is enabled. Useful for: confirming DHCP assignment, finding DNS servers in use, verifying MAC for firewall rules. Also: ipconfig /flushdns (clear DNS cache), ipconfig /release and /renew (release and get a new DHCP lease).',
  },
  {
    id: 'q2',
    question: 'What does "netstat -ano" display and what does the -o flag add?',
    options: [
      '-o sorts output alphabetically by process name',
      'netstat -ano lists all TCP/UDP connections and listening ports with numeric addresses (-n) and the owning Process ID (-o) — -o lets you map each connection to a specific process via tasklist or Task Manager',
      '-o shows only outbound connections',
      '-o displays the connection duration in seconds',
    ],
    correct: 1,
    explanation: 'netstat -ano: -a = all connections and listening ports, -n = numeric (no DNS resolution, faster), -o = show owning PID. The PID lets you cross-reference with tasklist /FI "PID eq <pid>" or Task Manager Details tab to find which process owns each connection. Essential for: finding which process is listening on a port, identifying suspicious outbound connections, and verifying service bindings.',
  },
  {
    id: 'q3',
    question: 'What does the "Test-NetConnection -ComputerName host -Port 443" PowerShell command verify?',
    options: [
      'It only checks if the hostname resolves to an IP address',
      'It tests TCP connectivity to port 443 on the target host, confirming both DNS resolution and that the TCP port is open and accepting connections',
      'It sends an HTTPS request and validates the SSL certificate',
      'It checks if the Windows Firewall rule for port 443 exists',
    ],
    correct: 1,
    explanation: 'Test-NetConnection is the modern PowerShell replacement for telnet as a port tester. It: resolves the hostname, attempts a TCP connection to the port, and reports TcpTestSucceeded (True/False). It also shows PingSucceeded, RemoteAddress, and RemotePort. Without -Port, it just pings. Other useful: Test-NetConnection -ComputerName host -TraceRoute (traceroute). Much more informative than raw ping.',
  },
  {
    id: 'q4',
    question: 'What is the Windows DNS client cache and why would you flush it?',
    options: [
      'A file that stores browser history',
      'A local cache of recently resolved DNS names and their IP addresses — flush it when DNS records have changed and you need to resolve to the new IP immediately, or when troubleshooting DNS resolution issues',
      'The DNS server database on a domain controller',
      'A list of trusted DNS servers configured by Group Policy',
    ],
    correct: 1,
    explanation: 'Windows caches DNS responses locally in memory for the TTL duration. If a DNS record changes (server moves, new IP), cached entries return the old IP until TTL expires. ipconfig /flushdns clears this cache, forcing fresh lookups. Also view cache: ipconfig /displaydns. In PowerShell: Clear-DnsClientCache. On domain-joined machines where resolution is broken, flushing the DNS cache and renewing DHCP is often the first fix to try.',
  },
  {
    id: 'q5',
    question: 'What does "route print" show on a Windows system?',
    options: [
      'All network printers and their IP addresses',
      'The routing table — all routes the system uses to forward packets, including the default gateway, interface-specific routes, and static routes',
      'The current TCP connection routing path',
      'Network interface driver information',
    ],
    correct: 1,
    explanation: 'route print displays the IPv4 and IPv6 routing tables. Each entry: Network Destination (what range), Netmask, Gateway (next hop), Interface (local IP), Metric (preference — lower is preferred). The default route (0.0.0.0) points to your gateway. Read it like: "to reach destination, send packets via gateway, out of interface, with this metric." Add routes: route add 10.20.0.0 mask 255.255.0.0 192.168.1.1. PowerShell: Get-NetRoute.',
  },
]

function LabStep({ number, description, command, language = 'powershell', output }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 rounded-full bg-accent-amber/20 border border-accent-amber/30
                         text-accent-amber text-[11px] font-bold font-mono flex items-center
                         justify-center flex-shrink-0 mt-0.5">{number}</span>
        <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
      </div>
      {command && <div className="ml-9"><CodeBlock code={command} language={language} showCopy /></div>}
      {output && (
        <div className="ml-9 rounded-xl bg-surface-950 border border-surface-700 px-4 py-3
                        font-mono text-xs text-accent-green leading-6">
          {output.split('\n').map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  )
}

export default function WindowsNetworking() {
  return (
    <LessonLayout
      lessonId="win-05"
      courseId="windows"
      title="Networking in Windows"
      courseTitle="Windows Desktop"
      courseHref="/windows"
      xp={70}
      readTime="~30 min"
      icon="🌐"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Windows Desktop', href: '/windows' },
        { label: 'Networking in Windows' },
      ]}
      prev={{ title: 'Task Manager, Services & Processes', href: '/windows/processes' }}
      next={{ title: 'Event Viewer & Logging',             href: '/windows/event-viewer' }}
      objectives={[
        'Use ipconfig, ping, tracert, and netstat for network diagnostics',
        'Configure IP addresses and DNS with PowerShell (NetTCPIP)',
        'Test TCP port connectivity with Test-NetConnection',
        'Read and manipulate the routing table',
        'Diagnose DNS resolution with nslookup and Resolve-DnsName',
        'Capture network traffic with Windows built-in tools',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Windows has a comprehensive set of networking tools — most sysadmins
          use only a fraction of them. This lesson covers the complete Windows
          networking toolkit from the classic <code className="font-mono text-accent-cyan text-sm mx-1">ipconfig</code>
          through to modern PowerShell cmdlets and packet capture with pktmon.
        </p>
      </section>

      <section>
        <h2>Diagnostic Command Reference</h2>
        <CodeBlock title="Windows networking toolkit" language="powershell"
          code={CODE_WINDOWSNETWORKING_1} />
      </section>

      <section>
        <h2>Configure Networking with PowerShell</h2>
        <CodeBlock title="Set static IP, DNS, and routes" language="powershell"
          code={CODE_WINDOWSNETWORKING_2} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB WIN-5</span>
            <span className="text-sm font-semibold text-white">Network Diagnostics on DC01</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~15 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Run a complete network status snapshot on DC01."
              command={CODE_WINDOWSNETWORKING_3}
              output={CODE_WINDOWSNETWORKING_4}
            />
            <LabStep number={2}
              description="Test connectivity to key services and diagnose any failures."
              command={CODE_WINDOWSNETWORKING_5}
              output={CODE_WINDOWSNETWORKING_6}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="win-05" title="Networking in Windows Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={35} />
      </section>
    </LessonLayout>
  )
}
