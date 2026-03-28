import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_NETWORKINGDNS_1 = `# ── Basic queries ────────────────────────────────────────────
dig dc01.lab.local              # A record (default)
dig dc01.lab.local A            # Explicit A record
dig lab.local MX                # Mail exchanger
dig lab.local NS                # Nameservers
dig lab.local SOA               # Zone authority record
dig lab.local TXT               # Text records (SPF, DKIM)

# ── Query a specific DNS server ──────────────────────────────
dig @192.168.100.10 dc01.lab.local    # Ask DC01's DNS
dig @8.8.8.8 google.com               # Ask Google directly

# ── Reverse DNS lookup ───────────────────────────────────────
dig -x 192.168.100.10                 # PTR record for IP

# ── SRV records (Active Directory discovery) ─────────────────
dig @192.168.100.10 _ldap._tcp.lab.local SRV
dig @192.168.100.10 _kerberos._tcp.lab.local SRV

# ── Useful flags ─────────────────────────────────────────────
dig dc01.lab.local +short          # IP only, no details
dig dc01.lab.local +noall +answer  # Answer section only
dig dc01.lab.local +trace          # Full resolution path
dig dc01.lab.local +dnssec         # Include DNSSEC records

# ── Equivalent Windows commands ──────────────────────────────
# Resolve-DnsName dc01.lab.local -Type A
# Resolve-DnsName 192.168.100.10  (reverse)`
const CODE_NETWORKINGDNS_2 = `# Install dig if needed
sudo apt install dnsutils -y

# Query DC01's DNS for the lab domain
dig @192.168.100.10 lab.local SOA +noall +answer
dig @192.168.100.10 lab.local NS  +short
dig @192.168.100.10 dc01.lab.local A +short

# Discover AD services via SRV records
dig @192.168.100.10 _ldap._tcp.lab.local SRV +short
dig @192.168.100.10 _kerberos._tcp.lab.local SRV +short`
const CODE_NETWORKINGDNS_3 = `lab.local. 3600 IN SOA dc01.lab.local. hostmaster.lab.local. 4 900 600 86400 3600

dc01.lab.local.

192.168.100.10

0 100 389 dc01.lab.local.
0 100 88 dc01.lab.local.`
const CODE_NETWORKINGDNS_4 = `# On DC01 — create additional DNS records
Add-DnsServerResourceRecordA -ZoneName 'lab.local' \`\`
  -Name 'webserver' -IPv4Address '192.168.100.30'

Add-DnsServerResourceRecordCName -ZoneName 'lab.local' \`\`
  -Name 'www' -HostNameAlias 'webserver.lab.local'

# Create PTR record
Add-DnsServerResourceRecordPtr -ZoneName '100.168.192.in-addr.arpa' \`\`
  -Name '30' -PtrDomainName 'webserver.lab.local'

# Verify from Ubuntu
# dig @192.168.100.10 www.lab.local CNAME +short
# dig @192.168.100.10 -x 192.168.100.30 +short`
const CODE_NETWORKINGDNS_5 = `# From Ubuntu after creating records:
webserver.lab.local.   <- CNAME target
webserver.lab.local.   <- PTR result`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the difference between a recursive resolver and an authoritative nameserver?',
    options: [
      'Recursive resolvers are faster; authoritative servers are more accurate',
      'A recursive resolver does the full lookup work on behalf of a client (querying multiple servers until it gets the answer); an authoritative server holds the actual DNS records for a domain and gives definitive answers',
      'Recursive resolvers handle IPv4; authoritative servers handle IPv6',
      'They are the same thing with different names depending on the operating system',
    ],
    correct: 1,
    explanation: 'When you query your ISP\'s DNS server for google.com: the ISP\'s recursive resolver does the work — it asks the root nameservers, then the .com TLD servers, then Google\'s authoritative nameservers. The authoritative server for google.com is the one that actually "knows" the correct IP — it was configured by Google. Your ISP\'s resolver is just a middleman that caches results for efficiency.',
  },
  {
    id: 'q2',
    question: 'What is a DNS SOA record and what information does it contain?',
    options: [
      'Start of Authority — defines the primary nameserver for a zone and zone transfer/refresh parameters',
      'Source of Address — maps IP addresses to MAC addresses in a zone',
      'Statement of Availability — records the uptime SLA for a DNS zone',
      'System Object Attributes — stores Active Directory schema information',
    ],
    correct: 0,
    explanation: 'SOA (Start of Authority) is the first record in every DNS zone. It contains: MNAME (primary nameserver), RNAME (admin email in dot notation), SERIAL (zone version number — must increment on every change), REFRESH (how often slaves check for updates), RETRY (how long to wait if refresh fails), EXPIRE (when slave considers zone data stale), MINIMUM (negative caching TTL). The serial number is critical — slaves compare it to detect zone changes.',
  },
  {
    id: 'q3',
    question: 'What is the purpose of a PTR record?',
    options: [
      'A pointer to a mail server for a domain',
      'Reverse DNS — maps an IP address back to a hostname, used by mail servers for anti-spam checks and by logs to show human-readable names instead of IPs',
      'A protocol type record that specifies which protocols a server supports',
      'A priority record that controls load balancing between multiple servers',
    ],
    correct: 1,
    explanation: 'PTR (Pointer) records are stored in the in-addr.arpa zone for IPv4 (ip6.arpa for IPv6) and provide reverse DNS lookups. Example: 10.100.168.192.in-addr.arpa PTR dc01.lab.local. Used by: mail servers (receiving servers check that sending IP has a PTR matching its HELO hostname — missing or mismatched PTR = spam flag), log analysis (hostnames in logs), and SSH for reverse DNS verification. In Windows AD, DHCP automatically creates PTR records when leasing addresses.',
  },
  {
    id: 'q4',
    question: 'What is DNS TTL and what is the impact of setting it very low vs very high?',
    options: [
      'TTL controls the DNS query timeout — lower TTL means faster query responses',
      'TTL (Time To Live) is how long resolvers cache a record. Low TTL (60s) = changes propagate quickly but more load on authoritative servers; High TTL (86400s) = less query load but slow propagation when records change',
      'TTL determines how many times a recursive resolver will retry a failed query',
      'TTL defines how many DNS servers can cache a record simultaneously',
    ],
    correct: 1,
    explanation: 'TTL is set on each DNS record in seconds. When a resolver caches a record, it keeps it for TTL seconds before re-querying. High TTL (24 hours): good for stable records, reduces resolver load, fast lookups (cached). Bad for changes — if you update an A record with TTL 86400, some clients will keep the old IP for up to 24 hours. Low TTL (60s): changes propagate quickly, but every TTL expiry causes a new query. Best practice: lower TTL to 300s before planned changes, change the record, wait, then raise TTL back.',
  },
  {
    id: 'q5',
    question: 'What is DNSSEC and what attack does it prevent?',
    options: [
      'DNS over HTTPS — encrypts DNS queries to prevent eavesdropping',
      'DNS Security Extensions — adds cryptographic signatures to DNS responses, preventing DNS cache poisoning attacks where an attacker injects false DNS records',
      'DNS over TLS — encrypts the DNS transport layer',
      'DNS firewall — blocks queries to known malicious domains',
    ],
    correct: 1,
    explanation: 'DNSSEC adds digital signatures (RRSIG records) to DNS responses. Resolvers can verify the signature chain from the root zone down to the record, confirming the response hasn\'t been tampered with. This prevents cache poisoning (Kaminsky attack): without DNSSEC, an attacker can inject false DNS records into a resolver\'s cache, redirecting users to malicious servers. DNSSEC doesn\'t encrypt (use DoH/DoT for that) — it authenticates.',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info: 'callout-info', warning: 'callout-warning', success: 'callout-success' }
  return (
    <div className={`callout ${s[type]}`}>
      <span className="callout-icon">{icon}</span>
      <div className="callout-body">{title && <strong>{title}</strong>}{children}</div>
    </div>
  )
}

function LabStep({ number, description, command, language = 'bash', output }) {
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

export default function NetworkingDNS() {
  return (
    <LessonLayout
      lessonId="net-06"
      courseId="networking"
      title="DNS Deep Dive"
      courseTitle="Network Fundamentals"
      courseHref="/networking"
      xp={70}
      readTime="~30 min"
      icon="📖"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Networking', href: '/networking' },
        { label: 'DNS Deep Dive' },
      ]}
      prev={{ title: 'Routing Fundamentals',       href: '/networking/routing' }}
      next={{ title: 'Network Troubleshooting',    href: '/networking/troubleshooting' }}
      objectives={[
        'Explain the DNS resolution process from query to answer',
        'Know all major DNS record types and their purpose',
        'Use dig to query every record type and interpret the output',
        'Understand DNS TTL and its impact on change propagation',
        'Create and verify DNS records in Windows AD-integrated DNS',
        'Troubleshoot common DNS failures methodically',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          DNS is the phonebook of the internet — and of your internal network. Without
          it, Active Directory breaks, email routing fails, and web browsing stops.
          A deep understanding of DNS lets you diagnose problems that appear to be
          network connectivity issues but are actually name resolution failures.
        </p>
        <Callout type="info" icon="💡" title="DNS is always the answer">
          A famous sysadmin saying: "It's always DNS." When something mysteriously
          breaks — check DNS first. Understand the resolution chain and you'll solve
          80% of connectivity problems in under 2 minutes.
        </Callout>
      </section>

      <section>
        <h2>DNS Record Types</h2>
        <div className="info-card mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-surface-700">
                <tr>
                  {['Type','Purpose','Example'].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {[
                  { type:'A',      purpose:'Maps hostname → IPv4 address',                    example:'dc01.lab.local → 192.168.100.10' },
                  { type:'AAAA',   purpose:'Maps hostname → IPv6 address',                    example:'dc01.lab.local → 2001:db8::1' },
                  { type:'CNAME',  purpose:'Alias — points one name to another hostname',     example:'www.lab.local → webserver.lab.local' },
                  { type:'MX',     purpose:'Mail exchange — which server handles email',       example:'lab.local MX 10 mail.lab.local' },
                  { type:'PTR',    purpose:'Reverse DNS — maps IP → hostname',                 example:'10.100.168.192.in-addr.arpa → dc01' },
                  { type:'NS',     purpose:'Nameserver — which servers are authoritative',    example:'lab.local NS dc01.lab.local' },
                  { type:'SOA',    purpose:'Start of Authority — zone metadata',               example:'Primary NS, serial, refresh timers' },
                  { type:'TXT',    purpose:'Arbitrary text — used for SPF, DKIM, verification',example:'lab.local TXT "v=spf1 ip4:1.2.3.4 -all"' },
                  { type:'SRV',    purpose:'Service location — used by AD, VoIP, etc.',        example:'_ldap._tcp.lab.local SRV 0 100 389 dc01' },
                  { type:'CAA',    purpose:'Certificate Authority Authorisation — limits who can issue certs', example:'lab.local CAA 0 issue "letsencrypt.org"' },
                ].map(r => (
                  <tr key={r.type} className="hover:bg-surface-700/30">
                    <td className="px-3 py-2 font-mono font-bold text-brand-300">{r.type}</td>
                    <td className="px-3 py-2 text-slate-400">{r.purpose}</td>
                    <td className="px-3 py-2 text-slate-500 font-mono text-[10px]">{r.example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2>dig — The DNS Diagnostic Tool</h2>
        <CodeBlock title="dig reference — query every record type" language="bash"
          code={CODE_NETWORKINGDNS_1} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB NET-6</span>
            <span className="text-sm font-semibold text-white">Inspect and Create DNS Records in the Lab</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Query all DNS record types for the lab domain from Ubuntu."
              command={CODE_NETWORKINGDNS_2}
              output={CODE_NETWORKINGDNS_3}
            />
            <LabStep number={2}
              description="Create DNS records on DC01 using PowerShell."
              language="powershell"
              command={CODE_NETWORKINGDNS_4}
              output={CODE_NETWORKINGDNS_5}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="net-06" title="DNS Deep Dive Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={35} />
      </section>
    </LessonLayout>
  )
}
