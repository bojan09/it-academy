import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'
import GlossaryTooltip from '../../components/GlossaryTooltip.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_DNS_1 = `# View all DNS zones
Get-DnsServerZone

# View all A records in lab.local
Get-DnsServerResourceRecord -ZoneName "lab.local" -RRType "A"

# Verify SRV records AD created (critical for AD health)
Resolve-DnsName -Name "_ldap._tcp.dc._msdcs.lab.local" -Type SRV`
const CODE_DNS_2 = `ZoneName   ZoneType  IsAutoCreated  IsDsIntegrated
--------   --------  -------------  ---------------
lab.local  Primary   False          True            ← AD-integrated ✔

HostName  RecordType  TimeToLive  RecordData
--------  ----------  ----------  ----------
dc01      A           01:00:00    192.168.100.10
_msdcs    NS          01:00:00    dc01.lab.local`
const CODE_DNS_3 = `Add-DnsServerPrimaryZone -NetworkID "192.168.100.0/24" -ReplicationScope "Forest" -DynamicUpdate "Secure"

# Verify zone created
Get-DnsServerZone | Where-Object { $_.IsReverseLookupZone }`
const CODE_DNS_4 = `ZoneName                     ZoneType IsReverseLookupZone IsDsIntegrated
--------                     -------- ------------------- ---------------
100.168.192.in-addr.arpa     Primary  True                True`
const CODE_DNS_5 = `# PTR record for DC01
Add-DnsServerResourceRecordPtr -ZoneName "100.168.192.in-addr.arpa" -Name "10" -PtrDomainName "dc01.lab.local"

# Add A record for Ubuntu server
Add-DnsServerResourceRecordA -ZoneName "lab.local" -Name "srv01" -IPv4Address "192.168.100.20" -TimeToLive "01:00:00"

# Test reverse lookup
Resolve-DnsName -Name "192.168.100.10" -Type PTR`
const CODE_DNS_6 = `Name                 Type  TTL  Section  NameHost
----                 ----  ---  -------  --------
10.100.168.192...    PTR   600  Answer   dc01.lab.local`
const CODE_DNS_7 = `# Add forwarder — Cloudflare DNS (1.1.1.1) + Google (8.8.8.8)
Add-DnsServerForwarder -IPAddress 1.1.1.1, 8.8.8.8

# Verify forwarders
Get-DnsServerForwarder

# Test internet resolution through the forwarder
Resolve-DnsName -Name "microsoft.com" -Server 192.168.100.10`
const CODE_DNS_8 = `IPAddress  ReorderedIPAddresses  UseRootHint
---------  --------------------  -----------
1.1.1.1    {1.1.1.1, 8.8.8.8}   False

Name        Type  TTL    IPAddress
----------  ----  -----  ---------
microsoft.com  A  1800   20.236.44.162`
const CODE_DNS_9 = `# Full DNS diagnostic
dcdiag /test:dns /v

# Quick DNS check
dcdiag /test:dns /s:DC01

# Check DNS event log for errors
Get-EventLog -LogName "DNS Server" -EntryType Error -Newest 10`
const CODE_DNS_10 = `Starting test: DNS
   DC: dc01.lab.local
   TEST: Basic (Targeted)
      Query for 'dc01.lab.local' returned correct IP: 192.168.100.10 ✔
   TEST: Forwarders/Root hints
      Forwarder: 1.1.1.1 [Responding]  ✔
   TEST: Dynamic update
      Test record dcdiag-test  registered & deleted in zone lab.local ✔
......................... DC01 passed test DNS`
const CODE_DNS_11 = `# ── Zone Management ────────────────────────────────────────
Get-DnsServerZone
Add-DnsServerPrimaryZone -Name "test.lab.local" -ZoneFile "test.lab.local.dns"
Remove-DnsServerZone -Name "test.lab.local" -Force

# ── Record Management ───────────────────────────────────────
Get-DnsServerResourceRecord -ZoneName "lab.local"
Get-DnsServerResourceRecord -ZoneName "lab.local" -RRType "A"
Add-DnsServerResourceRecordA -ZoneName "lab.local" -Name "www" -IPv4Address "192.168.100.50"
Add-DnsServerResourceRecordCName -ZoneName "lab.local" -Name "alias" -HostNameAlias "srv01.lab.local"
Remove-DnsServerResourceRecord -ZoneName "lab.local" -RRType "A" -Name "www"

# ── Forwarders ──────────────────────────────────────────────
Get-DnsServerForwarder
Add-DnsServerForwarder -IPAddress 1.1.1.1
Remove-DnsServerForwarder -IPAddress 1.1.1.1

# ── Diagnostics ─────────────────────────────────────────────
dcdiag /test:dns /v
nslookup server01.lab.local          # Forward lookup
nslookup 192.168.100.10              # Reverse lookup
nslookup -type=SRV _ldap._tcp.dc._msdcs.lab.local
Resolve-DnsName -Name "lab.local" -Type SOA
ipconfig /displaydns                 # View client cache
ipconfig /flushdns                   # Clear client cache
Clear-DnsClientCache                 # PowerShell flush`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What DNS record type maps a hostname to an IPv4 address?',
    options: ['CNAME', 'MX', 'A', 'PTR'],
    correct: 2,
    explanation: 'An A record (Address record) maps a hostname to an IPv4 address. For example: server01.lab.local → 192.168.100.10. AAAA records do the same for IPv6. CNAME is an alias. MX routes email. PTR is a reverse lookup.',
  },
  {
    id: 'q2',
    question: 'What is a DNS forwarder?',
    options: [
      'A secondary DNS server that holds a copy of the primary zone',
      'A record that redirects one hostname to another',
      'A DNS server to which unresolved queries are forwarded for resolution',
      'A cache-only DNS server with no local zones',
    ],
    correct: 2,
    explanation: 'A forwarder is a DNS server that your DNS server sends queries to when it cannot resolve a name from its own zones. Typically set to your ISP\'s DNS or a public resolver like 8.8.8.8. This allows your internal DNS server to resolve both internal names and external internet names.',
  },
  {
    id: 'q3',
    question: 'What is the purpose of a PTR record?',
    options: [
      'Points a hostname to multiple IP addresses for load balancing',
      'Maps an IP address back to a hostname (reverse DNS lookup)',
      'Provides a text description of a DNS zone',
      'Delegates authority for a subdomain to another DNS server',
    ],
    correct: 1,
    explanation: 'PTR (Pointer) records enable reverse DNS lookups — mapping an IP address to a hostname. They live in special reverse lookup zones (e.g., 100.168.192.in-addr.arpa). Used by mail servers, security tools, and logging systems to verify hostnames.',
  },
  {
    id: 'q4',
    question: 'Which command displays all DNS records in a zone from a Windows DNS server?',
    options: [
      'Get-DnsServerZone -Name lab.local',
      'Get-DnsServerResourceRecord -ZoneName lab.local',
      'Show-DnsZoneRecords -Zone lab.local',
      'nslookup -zone lab.local',
    ],
    correct: 1,
    explanation: 'Get-DnsServerResourceRecord -ZoneName "lab.local" lists all resource records in the specified zone. You can add -RRType "A" to filter by record type. This is the standard PowerShell approach for DNS management on Windows Server.',
  },
  {
    id: 'q5',
    question: 'Active Directory requires DNS. What special record type does AD register to help clients locate domain controllers?',
    options: ['A records only', 'SRV (Service) records', 'NS records', 'TXT records'],
    correct: 1,
    explanation: 'Active Directory registers SRV records in DNS so that clients can locate domain controllers, Global Catalogue servers, and Kerberos KDCs. For example: _ldap._tcp.dc._msdcs.lab.local SRV 0 0 389 dc01.lab.local. If these SRV records are missing or corrupt, clients cannot join or authenticate to the domain.',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info: 'callout-info', warning: 'callout-warning', danger: 'callout-danger', success: 'callout-success' }
  return (
    <div className={`callout ${s[type]}`}>
      <span className="callout-icon">{icon}</span>
      <div className="callout-body">{title && <strong>{title}</strong>}{children}</div>
    </div>
  )
}

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

export default function DNS() {
  return (
    <LessonLayout
      lessonId="ws2025-04"
      courseId="windows-server-2025"
      title="DNS Server Configuration"
      courseTitle="Windows Server 2025"
      courseHref="/windows-server-2025"
      xp={80}
      readTime="~30 min"
      icon="🌐"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Windows Server 2025', href: '/windows-server-2025' },
        { label: 'DNS Server Configuration' },
      ]}
      prev={{ title: 'DHCP Server Configuration', href: '/windows-server-2025/dhcp' }}
      next={{ title: 'Group Policy Management',   href: '/windows-server-2025/group-policy' }}
      objectives={[
        'Understand DNS resolution — recursive vs iterative queries',
        'Know all major DNS record types and their purposes',
        'Configure forward and reverse lookup zones',
        'Set up DNS forwarders and conditional forwarders',
        'Verify AD-integrated DNS health',
        'Troubleshoot common DNS failures',
      ]}
    >
      {/* ── OVERVIEW ── */}
      <section>
        <h2>Overview</h2>
        <p>
          <GlossaryTooltip term="DNS" /> (Domain Name System) is the distributed naming system
          that translates human-readable hostnames into IP addresses. Without DNS, every
          application would need hardcoded IP addresses. In a Windows domain environment,
          DNS is not optional — <strong>Active Directory cannot function without it</strong>.
        </p>
        <p className="mt-4">
          When you promoted DC01 to a domain controller, the AD DS wizard automatically installed
          DNS and created the <code className="font-mono text-accent-cyan text-sm">lab.local</code> zone.
          In this lesson you'll understand exactly what was created and why, add the reverse lookup
          zone, configure forwarders for internet resolution, and verify AD-integrated DNS health.
        </p>
        <Callout type="warning" icon="⚠️" title="DNS is the #1 cause of AD failures">
          An estimated 80% of Active Directory troubleshooting cases trace back to a DNS issue.
          Master DNS and you'll resolve most AD problems before they escalate.
        </Callout>
      </section>

      {/* ── HOW DNS RESOLUTION WORKS ── */}
      <section>
        <h2>How DNS Resolution Works</h2>

        <div className="info-card mt-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-700">
            <div className="info-card-icon">🔍</div>
            <div>
              <p className="info-card-title">Resolving server01.lab.local from a domain client</p>
              <p className="info-card-subtitle">The full recursive query chain</p>
            </div>
          </div>
          <div className="font-mono text-xs space-y-3 leading-6">
            {[
              { step: 1, actor: 'Client',         msg: 'Checks local DNS cache → miss', color: 'text-slate-400' },
              { step: 2, actor: 'Client',         msg: 'Checks hosts file (C:\\Windows\\System32\\drivers\\etc\\hosts) → miss', color: 'text-slate-400' },
              { step: 3, actor: 'Client → DC01',  msg: 'Sends recursive query: "What is the IP of server01.lab.local?"', color: 'text-brand-300' },
              { step: 4, actor: 'DC01 DNS',       msg: 'Checks its local zone lab.local → found A record → 192.168.100.30', color: 'text-accent-green' },
              { step: 5, actor: 'DC01 → Client',  msg: 'Returns: 192.168.100.30 (TTL: 3600s)', color: 'text-accent-cyan' },
              { step: 6, actor: 'Client',         msg: 'Caches result for TTL duration, connects to 192.168.100.30', color: 'text-accent-amber' },
            ].map(s => (
              <div key={s.step} className="flex gap-3">
                <span className="w-5 h-5 rounded-md bg-surface-700 flex items-center justify-center
                                  text-slate-500 text-[10px] font-bold flex-shrink-0">{s.step}</span>
                <div>
                  <span className={`font-bold ${s.color}`}>{s.actor}: </span>
                  <span className="text-slate-400">{s.msg}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <h3>Recursive vs Iterative Queries</h3>
        <div className="grid sm:grid-cols-2 gap-4 mt-3">
          {[
            {
              type: 'Recursive', color: 'text-brand-300', bg: 'bg-brand-500/8 border-brand-500/15',
              desc: 'The resolver (your DNS server) does ALL the work and returns a final answer to the client. Used by clients querying their DNS server.',
              example: 'Client asks DC01: "What is google.com?" — DC01 queries root servers → TLD → authoritative, then returns the final IP.',
            },
            {
              type: 'Iterative', color: 'text-accent-cyan', bg: 'bg-accent-cyan/8 border-accent-cyan/15',
              desc: 'The DNS server returns the best answer it has — often a referral to another server. The querying server must then follow up itself.',
              example: 'DC01 asks root servers: "google.com?" → Root says "Ask .com servers" → .com says "Ask Google\'s NS" → Google\'s NS returns IP.',
            },
          ].map(q => (
            <div key={q.type} className={`info-card border py-4 ${q.bg}`}>
              <p className={`text-sm font-bold mb-2 ${q.color}`}>{q.type} Query</p>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{q.desc}</p>
              <p className="text-[11px] text-slate-500 italic leading-relaxed">{q.example}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DNS RECORD TYPES ── */}
      <section>
        <h2>DNS Record Types</h2>
        <div className="info-card overflow-hidden mt-4">
          <div className="divide-y divide-surface-700">
            {[
              { type: 'A',     color: 'text-brand-300',   desc: 'Maps hostname → IPv4 address',                                example: 'dc01.lab.local.    A    192.168.100.10' },
              { type: 'AAAA',  color: 'text-brand-300',   desc: 'Maps hostname → IPv6 address',                                example: 'dc01.lab.local.    AAAA  ::1' },
              { type: 'CNAME', color: 'text-accent-cyan', desc: 'Alias — maps one hostname to another hostname (not an IP)',    example: 'mail.lab.local.    CNAME  dc01.lab.local.' },
              { type: 'MX',    color: 'text-accent-amber',desc: 'Mail exchanger — where to deliver email for the domain',      example: 'lab.local.         MX 10  mail.lab.local.' },
              { type: 'PTR',   color: 'text-accent-green',desc: 'Reverse lookup — maps IP address → hostname',                 example: '10.100.168.192.in-addr.arpa  PTR  dc01.lab.local.' },
              { type: 'SRV',   color: 'text-accent-purple',desc: 'Service locator — used by AD to locate DCs, GCs, Kerberos', example: '_ldap._tcp.dc._msdcs.lab.local  SRV 0 0 389 dc01.lab.local.' },
              { type: 'TXT',   color: 'text-slate-400',   desc: 'Arbitrary text — used for SPF, DKIM, domain verification',   example: 'lab.local.  TXT  "v=spf1 mx -all"' },
              { type: 'NS',    color: 'text-slate-400',   desc: 'Name Server — delegates a zone to specific DNS servers',      example: 'lab.local.  NS  dc01.lab.local.' },
              { type: 'SOA',   color: 'text-slate-500',   desc: 'Start of Authority — zone metadata (serial, refresh, TTL)',  example: 'lab.local.  SOA  dc01.lab.local. hostmaster.lab.local. ...' },
            ].map(r => (
              <div key={r.type} className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 p-4 items-start">
                <div className="flex items-center gap-2">
                  <span className={`tag font-mono font-bold text-[12px] w-16 justify-center ${r.color}`}>
                    {r.type}
                  </span>
                  <span className="text-xs text-slate-400 sm:hidden">{r.desc}</span>
                </div>
                <p className="hidden sm:block text-xs text-slate-400 leading-relaxed">{r.desc}</p>
                <code className="text-[11px] font-mono text-slate-500 leading-relaxed break-all">{r.example}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AD DNS INTEGRATION ── */}
      <section>
        <h2>AD-Integrated DNS Zones</h2>
        <p>
          When DNS is installed on a domain controller, zones are stored in Active Directory
          rather than flat text files. This gives you:
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          {[
            { icon: '🔄', title: 'Automatic Replication', desc: 'Zone data replicates with AD — no manual zone transfers needed. All DCs with DNS get updates within seconds.' },
            { icon: '🔐', title: 'Secure Dynamic Updates', desc: 'Only domain-joined computers can register DNS records. Prevents rogue devices from poisoning your DNS.' },
            { icon: '🗂️', title: 'No Single Point of Failure', desc: 'Every DC with DNS holds an authoritative copy. Lose one DC, DNS continues from the others.' },
            { icon: '⚡', title: 'Scavenging', desc: 'Stale records are automatically cleaned up. Prevents DNS bloat from decommissioned machines.' },
          ].map(f => (
            <div key={f.title} className="info-card py-4 flex gap-3">
              <span className="text-xl flex-shrink-0">{f.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white mb-1">{f.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── VMware Lab ── */}
      <section>
        <h2>VMware Lab Exercise</h2>
        <Callout type="warning" icon="🧪" title="Prerequisite">
          Complete the DHCP lesson. DC01 must be a domain controller with DNS installed.
        </Callout>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB 4</span>
            <span className="text-sm font-semibold text-white">Configure DNS Zones, Records & Forwarders</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">

            <LabStep number={1}
              description="Verify the AD-integrated forward lookup zone created during AD DS promotion."
              command={CODE_DNS_1}
              output={CODE_DNS_2}
            />

            <LabStep number={2}
              description="Create a reverse lookup zone for the 192.168.100.0/24 network. This enables PTR records and reverse lookups."
              command={CODE_DNS_3}
              output={CODE_DNS_4}
            />

            <LabStep number={3}
              description="Create a PTR record for DC01 and add an A record for a new server."
              command={CODE_DNS_5}
              output={CODE_DNS_6}
            />

            <LabStep number={4}
              description="Configure a forwarder so DC01 can resolve internet names. Point to Cloudflare DNS."
              command={CODE_DNS_7}
              output={CODE_DNS_8}
            />

            <LabStep number={5}
              description="Run DCDiag DNS tests to verify AD-DNS health — the gold standard check."
              command={CODE_DNS_9}
              output={CODE_DNS_10}
            />

            <Callout type="success" icon="✅" title="Lab Complete">
              DC01 now has a complete DNS configuration: forward zone, reverse zone,
              PTR records, forwarders for internet resolution, and a verified AD-integrated
              DNS health check. Take a VMware snapshot.
            </Callout>
          </div>
        </div>
      </section>

      {/* ── TROUBLESHOOTING ── */}
      <section>
        <h2>DNS Troubleshooting Playbook</h2>
        <div className="space-y-3">
          {[
            { symptom: 'Client cannot resolve internal hostnames', fix: '1) ipconfig /displaydns — check cache. 2) nslookup dc01.lab.local — is DC01 responding? 3) ipconfig /flushdns then retry. 4) Check client\'s DNS server setting — must point to DC01, not the router.' },
            { symptom: 'AD clients cannot find domain controller', fix: 'Run dcdiag /test:dns on DC01. Check SRV records: nslookup -type=SRV _ldap._tcp.dc._msdcs.lab.local. Missing SRV records = AD promotion issue. Try restarting Netlogon service to force re-registration.' },
            { symptom: 'Cannot resolve internet names from domain client', fix: 'The client\'s DNS must be DC01, not 8.8.8.8. DC01 must have forwarders configured. Test: nslookup google.com 192.168.100.10 — if this fails, check Get-DnsServerForwarder on DC01.' },
            { symptom: 'Stale DNS records from old machines', fix: 'Enable scavenging: Set-DnsServerScavenging -ScavengingState $true. Set NoRefreshInterval and RefreshInterval (typically 7 days each). Run Start-DnsServerScavenging to clean immediately.' },
          ].map((m, i) => (
            <div key={i} className="rounded-xl border border-surface-700 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-accent-red/5 border-b border-surface-700">
                <span className="text-accent-red text-sm">🔴</span>
                <p className="text-sm font-semibold text-white">{m.symptom}</p>
              </div>
              <div className="px-4 py-3 bg-surface-800/50">
                <p className="text-sm text-slate-300 leading-relaxed">{m.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUICK REF ── */}
      <section>
        <h2>Quick Reference</h2>
        <CodeBlock title="DNS PowerShell & nslookup Commands" language="powershell" code={CODE_DNS_11} />
      </section>

      {/* ── QUIZ ── */}
      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to earn bonus XP.</p>
        <Quiz lessonId="ws2025-04" title="DNS Server Configuration Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={40} />
      </section>
    </LessonLayout>
  )
}
