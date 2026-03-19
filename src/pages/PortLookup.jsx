import React, { useState, useMemo } from 'react'
import CodeBlock from '../components/CodeBlock.jsx'

// ─── Port database ────────────────────────────────────────────────────────────
const PORTS = [
  // Web / HTTP
  { port: 80,   proto: 'TCP', service: 'HTTP',         category: 'Web',       risk: 'medium', desc: 'Unencrypted web traffic. Should be redirected to 443 in production.',              cmd: 'netstat -an | grep :80' },
  { port: 443,  proto: 'TCP', service: 'HTTPS',        category: 'Web',       risk: 'low',    desc: 'Encrypted web traffic via TLS/SSL. Standard for all web services.',                cmd: 'curl -I https://example.com' },
  { port: 8080, proto: 'TCP', service: 'HTTP Alt',     category: 'Web',       risk: 'medium', desc: 'Alternate HTTP port commonly used for dev servers, proxies, and web apps.',        cmd: 'ss -tlnp | grep 8080' },
  { port: 8443, proto: 'TCP', service: 'HTTPS Alt',    category: 'Web',       risk: 'low',    desc: 'Alternate HTTPS port used by some management interfaces and Java apps.',           cmd: 'ss -tlnp | grep 8443' },
  // DNS
  { port: 53,   proto: 'TCP/UDP', service: 'DNS',      category: 'Network',   risk: 'medium', desc: 'Domain Name System. UDP for queries, TCP for zone transfers. Critical service.',   cmd: 'nslookup google.com 8.8.8.8' },
  // Email
  { port: 25,   proto: 'TCP', service: 'SMTP',         category: 'Email',     risk: 'high',   desc: 'Outgoing mail (server-to-server). Often blocked by ISPs to prevent spam.',         cmd: 'telnet smtp.example.com 25' },
  { port: 587,  proto: 'TCP', service: 'SMTP (TLS)',   category: 'Email',     risk: 'low',    desc: 'Authenticated SMTP with STARTTLS. Preferred port for mail client submission.',     cmd: 'openssl s_client -starttls smtp -connect smtp.example.com:587' },
  { port: 993,  proto: 'TCP', service: 'IMAPS',        category: 'Email',     risk: 'low',    desc: 'Encrypted IMAP for receiving email. Successor to plaintext IMAP on port 143.',    cmd: 'openssl s_client -connect imap.example.com:993' },
  { port: 995,  proto: 'TCP', service: 'POP3S',        category: 'Email',     risk: 'low',    desc: 'Encrypted POP3 for retrieving email.',                                            cmd: 'openssl s_client -connect pop.example.com:995' },
  { port: 143,  proto: 'TCP', service: 'IMAP',         category: 'Email',     risk: 'high',   desc: 'Unencrypted IMAP. Avoid in production; use IMAPS (993) instead.',                 cmd: 'telnet imap.example.com 143' },
  // File transfer
  { port: 21,   proto: 'TCP', service: 'FTP',          category: 'File',      risk: 'high',   desc: 'File Transfer Protocol control channel. Cleartext — avoid; use SFTP instead.',   cmd: 'ftp 192.168.1.10' },
  { port: 22,   proto: 'TCP', service: 'SSH / SFTP',   category: 'File',      risk: 'low',    desc: 'Secure Shell and SFTP. Change default port and use key auth in production.',      cmd: 'ssh -p 22 user@server' },
  { port: 69,   proto: 'UDP', service: 'TFTP',         category: 'File',      risk: 'high',   desc: 'Trivial FTP — no auth, no encryption. Used for PXE boot and router firmware.',    cmd: 'tftp 192.168.1.1' },
  { port: 445,  proto: 'TCP', service: 'SMB',          category: 'File',      risk: 'high',   desc: 'Windows file sharing (SMB). Restrict to internal networks; source of many attacks.',cmd: 'smbclient -L //192.168.1.10' },
  { port: 139,  proto: 'TCP', service: 'NetBIOS',      category: 'File',      risk: 'high',   desc: 'Legacy NetBIOS session service. Disable where not needed.',                       cmd: 'nmap -p 139 192.168.1.0/24' },
  // Remote access
  { port: 3389, proto: 'TCP', service: 'RDP',          category: 'Remote',    risk: 'high',   desc: 'Windows Remote Desktop. Never expose directly to internet. Use VPN or jump host.', cmd: 'nmap -p 3389 192.168.1.10' },
  { port: 5900, proto: 'TCP', service: 'VNC',          category: 'Remote',    risk: 'high',   desc: 'Virtual Network Computing. Cleartext by default; tunnel through SSH.',             cmd: 'vncviewer 192.168.1.10:5900' },
  { port: 23,   proto: 'TCP', service: 'Telnet',       category: 'Remote',    risk: 'critical', desc: 'Legacy plaintext remote access. Never use. Replace with SSH everywhere.',        cmd: 'ssh user@host  # Use this instead' },
  // Directory
  { port: 389,  proto: 'TCP', service: 'LDAP',         category: 'Directory', risk: 'medium', desc: 'Lightweight Directory Access Protocol. Use LDAPS (636) for encrypted queries.',    cmd: 'ldapsearch -x -H ldap://dc01 -b "dc=lab,dc=local"' },
  { port: 636,  proto: 'TCP', service: 'LDAPS',        category: 'Directory', risk: 'low',    desc: 'LDAP over SSL/TLS. Always prefer over plain LDAP.',                               cmd: 'ldapsearch -x -H ldaps://dc01 -b "dc=lab,dc=local"' },
  { port: 88,   proto: 'TCP/UDP', service: 'Kerberos', category: 'Directory', risk: 'medium', desc: 'Authentication protocol used by Active Directory. Required for AD operation.',      cmd: 'klist' },
  { port: 464,  proto: 'TCP', service: 'Kpasswd',      category: 'Directory', risk: 'medium', desc: 'Kerberos password change service.',                                               cmd: 'kpasswd user@LAB.LOCAL' },
  { port: 3268, proto: 'TCP', service: 'Global Catalog',category:'Directory', risk: 'medium', desc: 'Active Directory Global Catalog. Used for cross-domain queries.',                  cmd: 'ldapsearch -x -H ldap://dc01:3268' },
  // Network services
  { port: 67,   proto: 'UDP', service: 'DHCP Server', category: 'Network',   risk: 'medium', desc: 'DHCP server listens on this port to assign IP addresses to clients.',              cmd: 'Get-DhcpServerv4Scope  # PowerShell' },
  { port: 68,   proto: 'UDP', service: 'DHCP Client', category: 'Network',   risk: 'low',    desc: 'DHCP client port. Broadcast-based IP address request.',                           cmd: 'ipconfig /renew' },
  { port: 161,  proto: 'UDP', service: 'SNMP',         category: 'Network',   risk: 'high',   desc: 'Simple Network Management Protocol. Use SNMPv3 with auth; v1/v2 are insecure.',   cmd: 'snmpwalk -v2c -c public 192.168.1.1' },
  { port: 162,  proto: 'UDP', service: 'SNMP Trap',    category: 'Network',   risk: 'medium', desc: 'SNMP trap receiver. Devices send alerts to this port.',                           cmd: 'snmptrapd -f -Lo' },
  { port: 123,  proto: 'UDP', service: 'NTP',          category: 'Network',   risk: 'low',    desc: 'Network Time Protocol. Time synchronisation is critical for AD/Kerberos.',        cmd: 'w32tm /query /status' },
  { port: 514,  proto: 'UDP', service: 'Syslog',       category: 'Network',   risk: 'medium', desc: 'System log messages. Use TLS syslog (6514) in production.',                       cmd: 'logger -n 192.168.1.10 "test message"' },
  // Database
  { port: 1433, proto: 'TCP', service: 'MSSQL',        category: 'Database',  risk: 'high',   desc: 'Microsoft SQL Server. Restrict to app servers only; never expose to internet.',   cmd: 'sqlcmd -S server -U sa' },
  { port: 3306, proto: 'TCP', service: 'MySQL',        category: 'Database',  risk: 'high',   desc: 'MySQL database server. Bind to localhost or restrict via firewall.',               cmd: 'mysql -h 192.168.1.20 -u root -p' },
  { port: 5432, proto: 'TCP', service: 'PostgreSQL',   category: 'Database',  risk: 'medium', desc: 'PostgreSQL database. Configure pg_hba.conf to restrict client access.',           cmd: 'psql -h 192.168.1.20 -U postgres' },
  { port: 27017,proto: 'TCP', service: 'MongoDB',      category: 'Database',  risk: 'high',   desc: 'MongoDB. Never expose publicly without auth. Enable auth in mongod.conf.',        cmd: 'mongosh --host 192.168.1.20' },
  // Monitoring / DevOps
  { port: 9090, proto: 'TCP', service: 'Prometheus',   category: 'DevOps',    risk: 'medium', desc: 'Prometheus metrics server. Restrict to monitoring networks.',                     cmd: 'curl http://localhost:9090/metrics' },
  { port: 3000, proto: 'TCP', service: 'Grafana',      category: 'DevOps',    risk: 'medium', desc: 'Grafana dashboarding. Change default admin password immediately.',                cmd: 'curl http://localhost:3000/api/health' },
  { port: 6443, proto: 'TCP', service: 'Kubernetes API',category:'DevOps',    risk: 'medium', desc: 'Kubernetes API server. Protect with RBAC and restrict network access.',           cmd: 'kubectl cluster-info' },
  { port: 2376, proto: 'TCP', service: 'Docker TLS',   category: 'DevOps',    risk: 'high',   desc: 'Docker remote API (TLS). Exposed daemon = full root access to host.',             cmd: 'docker -H tcp://host:2376 ps' },
]

const CATEGORIES = ['All', ...Array.from(new Set(PORTS.map(p => p.category))).sort()]

const RISK_STYLES = {
  low:      'bg-accent-green/10  text-accent-green  border-accent-green/20',
  medium:   'bg-accent-amber/10  text-accent-amber  border-accent-amber/20',
  high:     'bg-accent-red/10    text-accent-red    border-accent-red/20',
  critical: 'bg-red-900/40       text-red-300       border-red-500/30',
}

const RISK_LABEL = { low: 'Low', medium: 'Medium', high: 'High', critical: '⚠ Critical' }

export default function PortLookup() {
  const [query,    setQuery]    = useState('')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PORTS.filter(p => {
      const matchCat = category === 'All' || p.category === category
      const matchQ   = !q
        || String(p.port).includes(q)
        || p.service.toLowerCase().includes(q)
        || p.desc.toLowerCase().includes(q)
        || p.proto.toLowerCase().includes(q)
      return matchCat && matchQ
    })
  }, [query, category])

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-12">

      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-2">Tools</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Port & Protocol Lookup
        </h1>
        <p className="text-slate-400 max-w-xl">
          Search any port number, service name, or keyword. See the protocol, risk level,
          security notes, and the exact command to check it.
        </p>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
               fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search port, service, keyword…"
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-150
                          ${category === cat
                            ? 'bg-brand-500 border-brand-500 text-white'
                            : 'bg-surface-800 border-surface-600 text-slate-400 hover:text-white hover:border-slate-500'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-slate-500 font-mono mb-4">
        {filtered.length} port{filtered.length !== 1 ? 's' : ''} found
      </p>

      {/* Table — desktop */}
      <div className="hidden md:block card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-700 text-left">
              {['Port', 'Protocol', 'Service', 'Category', 'Risk', ''].map(h => (
                <th key={h} className="px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-700">
            {filtered.map(p => (
              <tr
                key={p.port + p.service}
                onClick={() => setSelected(selected?.port === p.port ? null : p)}
                className="hover:bg-surface-700/40 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3 font-mono font-bold text-white text-base">{p.port}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.proto}</td>
                <td className="px-4 py-3 font-semibold text-slate-200">{p.service}</td>
                <td className="px-4 py-3">
                  <span className="tag">{p.category}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge border text-[10px] ${RISK_STYLES[p.risk]}`}>
                    {RISK_LABEL[p.risk]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 group-hover:text-slate-300 text-xs">
                  Details →
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden space-y-3">
        {filtered.map(p => (
          <button
            key={p.port + p.service}
            onClick={() => setSelected(selected?.port === p.port ? null : p)}
            className="card w-full text-left p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono font-bold text-white text-xl">{p.port}</span>
              <span className={`badge border text-[10px] ${RISK_STYLES[p.risk]}`}>
                {RISK_LABEL[p.risk]}
              </span>
            </div>
            <p className="font-semibold text-slate-200 text-sm">{p.service}</p>
            <p className="text-xs text-slate-500 mt-1">{p.proto} · {p.category}</p>
          </button>
        ))}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="mt-6 card p-6 border-brand-500/30 animate-fade-up">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono font-bold text-white text-3xl">{selected.port}</span>
                <span className={`badge border ${RISK_STYLES[selected.risk]}`}>
                  {RISK_LABEL[selected.risk]} Risk
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{selected.service}</h2>
              <p className="text-xs text-slate-500 font-mono mt-1">{selected.proto} · {selected.category}</p>
            </div>
            <button onClick={() => setSelected(null)}
                    className="btn-ghost p-2 text-slate-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed mb-5">{selected.desc}</p>

          {selected.cmd && (
            <CodeBlock
              code={selected.cmd}
              language={selected.cmd.includes('Get-') || selected.cmd.includes('ipconfig') ? 'powershell' : 'bash'}
              title={`Check port ${selected.port}`}
            />
          )}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">🔌</div>
          <p className="font-medium">No ports match "<span className="text-slate-300">{query}</span>"</p>
        </div>
      )}
    </div>
  )
}
