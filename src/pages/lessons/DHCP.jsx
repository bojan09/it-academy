import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'
import GlossaryTooltip from '../../components/GlossaryTooltip.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_DHCP_1 = `Success Restart Needed Exit Code Feature Result
------- -------------- --------- ---------------
True    No             Success   {DHCP Server}`
const CODE_DHCP_2 = `# Authorise in Active Directory
Add-DhcpServerInDC -DnsName "DC01.lab.local" -IPAddress 192.168.100.10

# Notify the service of the post-install config
Set-ItemProperty -Path registry::HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\ServerManager\\Roles\\12 -Name ConfigurationState -Value 2`
const CODE_DHCP_3 = `# Create the scope
Add-DhcpServerv4Scope -Name "Lab Network" -StartRange 192.168.100.1 -EndRange 192.168.100.254 -SubnetMask 255.255.255.0 -LeaseDuration "08:00:00" -State Active

# Exclude static IP range (servers, routers, printers)
Add-DhcpServerv4ExclusionRange -ScopeId 192.168.100.0 -StartRange 192.168.100.1 -EndRange 192.168.100.49`
const CODE_DHCP_4 = `# Option 3: Default Gateway
Set-DhcpServerv4OptionValue -ScopeId 192.168.100.0 -OptionId 3 -Value 192.168.100.1

# Option 6: DNS Servers (point to DC01)
Set-DhcpServerv4OptionValue -ScopeId 192.168.100.0 -OptionId 6 -Value 192.168.100.10

# Option 15: DNS Domain Name
Set-DhcpServerv4OptionValue -ScopeId 192.168.100.0 -OptionId 15 -Value "lab.local"

# Verify scope config
Get-DhcpServerv4Scope`
const CODE_DHCP_5 = `ScopeId         SubnetMask      Name         State   StartRange       EndRange
-------         ----------      ----         -----   ----------       --------
192.168.100.0   255.255.255.0   Lab Network  Active  192.168.100.50   192.168.100.254`
const CODE_DHCP_6 = `# Replace the MAC address with your Ubuntu VM's actual MAC
Add-DhcpServerv4Reservation -ScopeId 192.168.100.0 -IPAddress 192.168.100.20 -ClientId "00-0C-29-AB-CD-EF" -Name "srv01-ubuntu" -Description "Ubuntu Server VM"

# View all reservations
Get-DhcpServerv4Reservation -ScopeId 192.168.100.0`
const CODE_DHCP_7 = `# On Ubuntu Server:
sudo dhclient -r eth0    # Release current lease
sudo dhclient eth0       # Request new lease
ip addr show eth0        # Verify assigned IP`
const CODE_DHCP_8 = `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP>
    inet 192.168.100.20/24 brd 192.168.100.255 scope global eth0
    valid_lft 28800sec preferred_lft 28800sec
✔ Reservation working correctly`
const CODE_DHCP_9 = `# Scope management
Get-DhcpServerv4Scope
Get-DhcpServerv4ScopeStatistics -ScopeId 192.168.100.0
Get-DhcpServerv4Lease -ScopeId 192.168.100.0
Remove-DhcpServerv4Lease -ScopeId 192.168.100.0 -ClientId "00-0C-29-AB-CD-EF"

# Reservations
Get-DhcpServerv4Reservation -ScopeId 192.168.100.0
Add-DhcpServerv4Reservation -ScopeId 192.168.100.0 -IPAddress x.x.x.x -ClientId "MAC"
Remove-DhcpServerv4Reservation -ScopeId 192.168.100.0 -IPAddress x.x.x.x

# Server health
Get-DhcpServerInDC
Get-DhcpServerv4Statistics
netsh dhcp server show all`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the correct sequence of messages in the DHCP four-way handshake?',
    options: [
      'DISCOVER → OFFER → ACK → REQUEST',
      'DISCOVER → OFFER → REQUEST → ACK',
      'REQUEST → DISCOVER → OFFER → ACK',
      'OFFER → DISCOVER → REQUEST → ACK',
    ],
    correct: 1,
    explanation: 'DORA: Discover (client broadcasts for a server), Offer (server offers an IP), Request (client requests that specific IP), Acknowledge (server confirms the lease). This is always the order.',
  },
  {
    id: 'q2',
    question: 'Which UDP ports does DHCP use?',
    options: ['Port 67 (server) and 68 (client)', 'Port 53 (server) and 67 (client)', 'Port 80 and 443', 'Port 68 (server) and 67 (client)'],
    correct: 0,
    explanation: 'DHCP servers listen on UDP port 67. DHCP clients send from and receive on UDP port 68. This is fixed and cannot be changed.',
  },
  {
    id: 'q3',
    question: 'A workstation has IP address 169.254.10.5. What does this indicate?',
    options: [
      'The workstation has a static IP configured',
      'The DHCP server assigned this address',
      'The workstation failed to reach a DHCP server and self-assigned an APIPA address',
      'The workstation is on a different subnet',
    ],
    correct: 2,
    explanation: '169.254.0.0/16 is the Automatic Private IP Addressing (APIPA) range. Windows assigns an address from this range when it cannot contact a DHCP server. It indicates a DHCP failure — check connectivity to the DHCP server.',
  },
  {
    id: 'q4',
    question: 'What is the purpose of a DHCP reservation?',
    options: [
      'To prevent certain IP addresses from being leased to any client',
      'To always assign the same IP address to a specific device based on its MAC address',
      'To extend the lease time for all clients in a scope',
      'To assign IPs to clients on a different subnet via a relay agent',
    ],
    correct: 1,
    explanation: 'A DHCP reservation binds a specific IP address to a device\'s MAC address. The device still goes through the DORA process, but the DHCP server always offers the same reserved IP. This is preferred over static IPs for servers and printers.',
  },
  {
    id: 'q5',
    question: 'What must you do before a DHCP scope can begin leasing addresses?',
    options: [
      'Create at least one reservation',
      'Activate the scope',
      'Enable the DHCP audit log',
      'Configure DNS integration',
    ],
    correct: 1,
    explanation: 'A DHCP scope must be explicitly activated before it starts responding to client requests. A newly created scope is inactive by default. You can activate via the DHCP console or with Activate-DhcpServerv4Scope in PowerShell.',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const styles = { info: 'callout-info', warning: 'callout-warning', danger: 'callout-danger', success: 'callout-success' }
  return (
    <div className={`callout ${styles[type]}`}>
      <span className="callout-icon">{icon}</span>
      <div className="callout-body">{title && <strong>{title}</strong>}{children}</div>
    </div>
  )
}

function LabStep({ number, description, command, output }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 rounded-full bg-accent-amber/20 border border-accent-amber/30
                         text-accent-amber text-[11px] font-bold font-mono flex items-center
                         justify-center flex-shrink-0 mt-0.5">{number}</span>
        <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
      </div>
      {command && <div className="ml-9"><CodeBlock code={command} language="powershell" showCopy /></div>}
      {output && (
        <div className="ml-9 rounded-xl bg-surface-950 border border-surface-700 px-4 py-3
                        font-mono text-xs text-accent-green leading-6">
          {output.split('\n').map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  )
}

export default function DHCP() {
  return (
    <LessonLayout
      lessonId="ws2025-03"
      courseId="windows-server-2025"
      title="DHCP Server Configuration"
      courseTitle="Windows Server 2025"
      courseHref="/windows-server-2025"
      xp={80}
      readTime="~30 min"
      icon="📡"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Windows Server 2025', href: '/windows-server-2025' },
        { label: 'DHCP Server Configuration' },
      ]}
      prev={{ title: 'Active Directory & Domain Services', href: '/windows-server-2025/active-directory' }}
      next={{ title: 'DNS Server Configuration', href: '/windows-server-2025/dns' }}
      objectives={[
        'Understand the DHCP DORA handshake process',
        'Install and authorise a DHCP server in AD',
        'Create and configure scopes and exclusions',
        'Set up DHCP reservations for servers and printers',
        'Configure DHCP failover for high availability',
        'Troubleshoot common DHCP failures',
      ]}
    >
      {/* ── OVERVIEW ── */}
      <section>
        <h2>Overview</h2>
        <p>
          <GlossaryTooltip term="DHCP" /> (Dynamic Host Configuration Protocol) automatically
          assigns IP addresses, subnet masks, default gateways, and DNS server addresses to
          network clients — eliminating the need to manually configure every device.
        </p>
        <p className="mt-4">
          In this lesson you'll install a DHCP server on DC01, create a scope for your lab
          network, configure reservations for key servers, and enable DHCP failover — the same
          setup used in enterprise environments.
        </p>
        <Callout type="info" icon="💡" title="Why DHCP matters">
          A misconfigured or failed DHCP server will bring an entire network to its knees within
          hours as leases expire. Understanding DHCP thoroughly — including failover — is a
          core sysadmin competency.
        </Callout>
      </section>

      {/* ── DORA HANDSHAKE ── */}
      <section>
        <h2>The DHCP DORA Process</h2>
        <p>Every IP assignment follows the same four-step handshake — known as <strong>DORA</strong>:</p>

        <div className="info-card mt-6">
          <div className="space-y-0">
            {[
              { step: 'D', name: 'DISCOVER',  port: 'Client → 255.255.255.255:67',  color: 'bg-brand-500',      desc: 'Client broadcasts: "Is there a DHCP server out there?" (UDP broadcast, no IP yet)' },
              { step: 'O', name: 'OFFER',     port: 'Server → 255.255.255.255:68',  color: 'bg-accent-cyan',    desc: 'Server responds: "Here\'s an offer: 192.168.100.30, lease 8 hours, GW 192.168.100.1"' },
              { step: 'R', name: 'REQUEST',   port: 'Client → 255.255.255.255:67',  color: 'bg-accent-amber',   desc: 'Client accepts: "I\'d like 192.168.100.30 from server 192.168.100.10 please"' },
              { step: 'A', name: 'ACK',       port: 'Server → 255.255.255.255:68',  color: 'bg-accent-green',   desc: 'Server confirms: "It\'s yours. Lease expires in 8 hours."' },
            ].map((s, i) => (
              <div key={s.step} className="flex items-start gap-4 p-4 border-b border-surface-700 last:border-0">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center
                                  text-white font-bold text-sm flex-shrink-0`}>
                  {s.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold text-white">{s.name}</span>
                    <span className="tag text-[10px]">{s.port}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
                {i < 3 && (
                  <div className="flex-shrink-0 text-slate-600 self-center">↓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <h3>Lease Renewal</h3>
        <p>
          At <strong>50% of lease time</strong>, the client tries to renew directly with its
          current DHCP server (unicast). At <strong>87.5%</strong>, it broadcasts to any
          available DHCP server. If the lease expires completely, the client loses its IP and
          must start a new DORA process.
        </p>
        <Callout type="warning" icon="⚠️" title="Lease time matters">
          Too short (e.g. 1 hour): generates excessive DHCP traffic, especially on large networks.
          Too long (e.g. 30 days): exhausts the scope pool if devices come and go frequently.
          8 hours is a common enterprise default for workstations.
        </Callout>
      </section>

      {/* ── SCOPE OPTIONS ── */}
      <section>
        <h2>Scope Configuration Deep Dive</h2>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {[
            { term: 'Scope', icon: '🗂️', desc: 'A range of IP addresses available for lease. One scope per subnet. E.g. 192.168.100.50–192.168.100.200.' },
            { term: 'Exclusion Range', icon: '🚫', desc: 'IPs within the scope that DHCP will not lease — used for devices with static IPs (servers, printers, routers) that fall within the scope range.' },
            { term: 'Reservation', icon: '📌', desc: 'Binds an IP to a specific device MAC address. The device always gets the same IP via DHCP — no manual static config needed.' },
            { term: 'Scope Options', icon: '⚙️', desc: 'Additional config delivered with the lease: option 3 (router/gateway), option 6 (DNS servers), option 15 (DNS domain name).' },
            { term: 'DHCP Relay Agent', icon: '🔄', desc: 'Allows a single DHCP server to serve multiple subnets. The relay (typically a router) forwards DHCP broadcasts across subnet boundaries.' },
            { term: 'DHCP Failover', icon: '🔁', desc: 'Replicates scope data between two DHCP servers for high availability. Hot standby mode or load-sharing mode. Built into Windows Server 2012+.' },
          ].map(c => (
            <div key={c.term} className="info-card py-4 flex gap-3">
              <span className="text-xl flex-shrink-0">{c.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white mb-1">{c.term}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LAB ── */}
      <section>
        <h2>VMware Lab Exercise</h2>
        <Callout type="warning" icon="🧪" title="Lab Prerequisite">
          Complete the Active Directory lesson first. DC01 must be running at 192.168.100.10.
        </Callout>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB 3</span>
            <span className="text-sm font-semibold text-white">Configure DHCP on DC01</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1} description="Install the DHCP Server role on DC01."
              command={"Install-WindowsFeature DHCP -IncludeManagementTools"}
              output={CODE_DHCP_1} />

            <LabStep number={2} description="Authorise the DHCP server in Active Directory. Unauthorised DHCP servers are blocked by AD."
              command={CODE_DHCP_2}
            />

            <LabStep number={3} description="Create the scope for the lab network. Exclude the static IP range at the bottom."
              command={CODE_DHCP_3}
            />

            <LabStep number={4} description="Set scope options — gateway, DNS server, and domain name."
              command={CODE_DHCP_4}
              output={CODE_DHCP_5}
            />

            <LabStep number={5} description="Create a reservation for the Ubuntu Server VM (MAC address from the VM's network adapter settings)."
              command={CODE_DHCP_6}
            />

            <LabStep number={6} description="Test from the Ubuntu VM — release and renew the DHCP lease."
              command={CODE_DHCP_7}
              output={CODE_DHCP_8}
            />

            <Callout type="success" icon="✅" title="Lab Complete">
              DC01 is now your DHCP server serving the lab network.
              The Ubuntu VM receives its reserved IP automatically.
            </Callout>
          </div>
        </div>
      </section>

      {/* ── TROUBLESHOOTING ── */}
      <section>
        <h2>Common DHCP Issues</h2>
        <div className="space-y-3">
          {[
            { symptom: 'Client gets 169.254.x.x (APIPA)', fix: 'DHCP server unreachable. Check: (1) DHCP service running, (2) scope is active, (3) scope not exhausted, (4) firewall allows UDP 67/68, (5) relay agent configured if cross-subnet.' },
            { symptom: 'Scope pool exhausted', fix: 'Get-DhcpServerv4ScopeStatistics will show usage. Reduce lease time, expand the scope range, or remove stale leases with Remove-DhcpServerv4Lease.' },
            { symptom: 'Wrong IP received despite reservation', fix: 'Verify the MAC address in the reservation matches exactly. Check for duplicate reservations. Run ipconfig /release && ipconfig /renew on the client.' },
            { symptom: 'DHCP server not authorised in AD', fix: 'Run Get-DhcpServerInDC to check. Re-run Add-DhcpServerInDC. Unauthorised DHCP servers are silently blocked by AD member clients.' },
          ].map((m, i) => (
            <div key={i} className="rounded-xl border border-surface-700 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-accent-red/5 border-b border-surface-700">
                <span className="text-accent-red">⚠️</span>
                <p className="text-sm font-semibold text-white">{m.symptom}</p>
              </div>
              <div className="flex items-start gap-3 px-4 py-3 bg-surface-800/50">
                <span className="text-accent-green flex-shrink-0">→</span>
                <p className="text-sm text-slate-300 leading-relaxed">{m.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUICK REF ── */}
      <section>
        <h2>Quick Reference</h2>
        <CodeBlock title="DHCP PowerShell Commands" language="powershell" code={CODE_DHCP_9} />
      </section>

      {/* ── QUIZ ── */}
      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to earn bonus XP.</p>
        <Quiz lessonId="ws2025-03" title="DHCP Server Configuration Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={40} />
      </section>
    </LessonLayout>
  )
}
