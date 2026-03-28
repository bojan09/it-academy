import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_CYBERSECURITYPKI_1 = `# ── Inspect a certificate ────────────────────────────────────
# From a file
openssl x509 -in cert.pem -text -noout | grep -E 'Subject:|Issuer:|Not After|DNS:'

# From a live server
echo | openssl s_client -connect google.com:443 -servername google.com 2>/dev/null |
  openssl x509 -text -noout | grep -E 'Subject:|Not After|DNS:'

# Check days until expiry
echo | openssl s_client -connect example.com:443 2>/dev/null |
  openssl x509 -noout -enddate

# ── Create a self-signed certificate ─────────────────────────
openssl req -x509 -newkey rsa:4096 -sha256 -days 365 \\
  -keyout server.key -out server.crt \\
  -subj '/CN=lab.local' \\
  -addext 'subjectAltName=DNS:lab.local,DNS:*.lab.local,IP:192.168.100.10'

# ── Create an internal CA and sign a cert ────────────────────
# 1. Generate CA key and self-signed root cert
openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 3650 -key ca.key -out ca.crt \\
  -subj '/CN=Lab Internal CA/O=Lab/C=US'

# 2. Generate server key and CSR
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr \\
  -subj '/CN=dc01.lab.local'

# 3. Sign the CSR with your CA
openssl x509 -req -days 365 -in server.csr \\
  -CA ca.crt -CAkey ca.key -CAcreateserial \\
  -out server.crt \\
  -extfile <(echo 'subjectAltName=DNS:dc01.lab.local,IP:192.168.100.10')

# 4. Verify the chain
openssl verify -CAfile ca.crt server.crt`
const CODE_CYBERSECURITYPKI_2 = `mkdir -p ~/lab-ca && cd ~/lab-ca

# Generate CA key and root certificate
openssl genrsa -out lab-ca.key 4096
openssl req -new -x509 -days 3650 -key lab-ca.key -out lab-ca.crt \\
  -subj '/CN=Lab Internal CA/O=SysAdminPro Lab/C=US'

# Verify the CA cert
openssl x509 -in lab-ca.crt -noout -text | grep -E 'Subject:|Not After'
echo 'Lab CA created successfully'`
const CODE_CYBERSECURITYPKI_3 = `Generating RSA private key, 4096 bit long modulus
....
Subject: CN=Lab Internal CA, O=SysAdminPro Lab, C=US
Not After : Jan 14 11:00:00 2035 GMT
Lab CA created successfully`
const CODE_CYBERSECURITYPKI_4 = `cd ~/lab-ca

# Generate DC01 server key and CSR
openssl genrsa -out dc01.key 2048
openssl req -new -key dc01.key -out dc01.csr \\
  -subj '/CN=dc01.lab.local/O=Lab'

# Sign the CSR with the lab CA
openssl x509 -req -days 365 -in dc01.csr \\
  -CA lab-ca.crt -CAkey lab-ca.key -CAcreateserial \\
  -out dc01.crt \\
  -extfile <(printf 'subjectAltName=DNS:dc01.lab.local,DNS:dc01,IP:192.168.100.10')

# Verify the chain
openssl verify -CAfile lab-ca.crt dc01.crt

# Inspect the issued cert
openssl x509 -in dc01.crt -noout -text |
  grep -E 'Subject:|Issuer:|Not After|DNS:|IP:'`
const CODE_CYBERSECURITYPKI_5 = `dc01.crt: OK  <- chain verified successfully

Subject: CN=dc01.lab.local, O=Lab
Issuer: CN=Lab Internal CA, O=SysAdminPro Lab, C=US
Not After : Jan 15 11:00:00 2026 GMT
DNS:dc01.lab.local, DNS:dc01, IP Address:192.168.100.10`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the role of a Certificate Authority (CA) in PKI?',
    options: [
      'It encrypts all network traffic passing through it',
      'It is a trusted third party that digitally signs certificates, vouching for the identity of the certificate holder — clients trust certificates signed by CAs they recognise',
      'It stores the private keys for all certificates it issues',
      'It provides the encryption algorithm used in TLS connections',
    ],
    correct: 1,
    explanation: 'A CA is a trusted entity that issues digital certificates. When a CA signs a certificate, it is vouching: "we have verified this entity owns this domain/identity." Clients (browsers, OS) have a built-in list of trusted Root CAs. If your certificate chains up to a trusted root, clients accept it without warnings. Internal/enterprise CAs can be distributed to devices via GPO/MDM so they trust internal certificates.',
  },
  {
    id: 'q2',
    question: 'What happens during the TLS handshake before encrypted data transfer begins?',
    options: [
      'The client and server exchange passwords to authenticate each other',
      'The client and server negotiate cipher suites, the server presents its certificate, they establish a shared secret (via key exchange), and derive symmetric keys for the session',
      'The server encrypts all subsequent traffic with the client\'s public key',
      'The certificate authority directly negotiates the session on behalf of the server',
    ],
    correct: 1,
    explanation: 'TLS handshake: (1) ClientHello — client sends supported TLS versions and cipher suites, (2) ServerHello — server selects version/cipher, sends its certificate, (3) Key Exchange — client verifies cert, performs key exchange (ECDH or similar) to establish shared pre-master secret, (4) Both sides derive session keys from the shared secret, (5) Finished — both send encrypted "Finished" message to confirm handshake integrity, (6) Symmetric encryption begins. The asymmetric crypto (certificate) is only used for authentication and key exchange — not data encryption.',
  },
  {
    id: 'q3',
    question: 'What is certificate pinning and when should it be used?',
    options: [
      'Physically securing certificate files in a locked directory',
      'Hardcoding the expected certificate or public key in an application so it rejects any other certificate — even one signed by a trusted CA — preventing MITM attacks via rogue CA',
      'Pinning a certificate to a specific IP address in DNS',
      'Marking a certificate as permanent so it never needs renewal',
    ],
    correct: 1,
    explanation: 'Certificate pinning hardcodes the expected certificate fingerprint or public key in the application. Even if an attacker compromises a trusted CA and issues a fake certificate for your domain, pinning rejects it because it doesn\'t match the expected pin. Used in high-value mobile apps and internal systems. Downside: if you rotate your certificate without updating pins, the application breaks — maintenance complexity is high.',
  },
  {
    id: 'q4',
    question: 'What does a TLS certificate\'s Subject Alternative Name (SAN) field contain?',
    options: [
      'The names of the certificate holders who are authorised to use it',
      'Additional domain names, IP addresses, or email addresses the certificate is valid for — the replacement for the deprecated Common Name (CN) field for hostname verification',
      'Alternative CA signatures for cross-certification',
      'Backup contact information if the primary domain is unavailable',
    ],
    correct: 1,
    explanation: 'SAN (Subject Alternative Name) lists every hostname, IP address, or wildcard the certificate is valid for: DNS:example.com, DNS:www.example.com, DNS:*.api.example.com, IP:192.168.1.10. Modern browsers and tools require SAN — the old CN field is no longer used for hostname verification (RFC 6125). A wildcard (*.example.com) covers one level of subdomain. Multi-SAN certificates can cover dozens of hostnames.',
  },
  {
    id: 'q5',
    question: 'What is OCSP stapling and what problem does it solve?',
    options: [
      'A method for automatically renewing certificates before they expire',
      'The server proactively fetches and caches its certificate\'s revocation status from the CA, attaching it to the TLS handshake — eliminating the privacy leak and latency of clients querying the CA directly',
      'A technique for compressing certificate chains to speed up handshakes',
      'A protocol for distributing certificates to multiple servers simultaneously',
    ],
    correct: 1,
    explanation: 'Without OCSP stapling, clients query the CA\'s OCSP responder on every connection to check revocation status — leaking which sites you visit to the CA and adding latency. OCSP stapling has the server fetch the signed OCSP response from the CA and include ("staple") it in the TLS handshake. The client gets fresh revocation info without contacting the CA. Enable in nginx: ssl_stapling on; ssl_stapling_verify on;',
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

export default function CybersecurityPKI() {
  return (
    <LessonLayout
      lessonId="sec-06"
      courseId="cybersecurity"
      title="PKI, SSL/TLS & Certificates"
      courseTitle="Cybersecurity"
      courseHref="/cybersecurity"
      xp={80}
      readTime="~35 min"
      icon="🔑"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Cybersecurity', href: '/cybersecurity' },
        { label: 'PKI, SSL/TLS & Certificates' },
      ]}
      prev={{ title: 'Firewall Configuration', href: '/cybersecurity/firewall' }}
      next={{ title: 'Intrusion Detection & SIEM', href: '/cybersecurity/ids-siem' }}
      objectives={[
        'Understand the PKI trust hierarchy: Root CA → Intermediate CA → End-Entity',
        'Trace the TLS handshake and understand what each step achieves',
        'Create a self-signed certificate and an internal CA with openssl',
        'Inspect and validate certificates from the command line',
        'Configure nginx with a proper TLS setup',
        'Identify common TLS misconfigurations and how to fix them',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          TLS (Transport Layer Security) secures virtually all internet communication —
          HTTPS, SMTPS, LDAPS, and more. Every sysadmin needs to understand PKI because
          certificate problems are among the most common causes of service outages and
          security vulnerabilities. Expired certificates, weak cipher suites, and
          misconfigured chains cost organisations millions in downtime every year.
        </p>
      </section>

      <section>
        <h2>The PKI Trust Hierarchy</h2>
        <div className="info-card mt-4 overflow-hidden">
          <div className="p-4 font-mono text-xs leading-8">
            <div className="space-y-2">
              {[
                { level: 'Root CA', icon: '👑', color: 'text-accent-amber', desc: 'Self-signed. Offline. Stored in hardware. DigiCert, Let\'s Encrypt, your enterprise CA.', indent: 0 },
                { level: 'Intermediate CA', icon: '🏢', color: 'text-brand-300', desc: 'Signed by Root. Online. Issues end-entity certs. Limits Root CA exposure.', indent: 1 },
                { level: 'End-Entity Certificate', icon: '🌐', color: 'text-accent-green', desc: 'Your server cert: api.company.com. Signed by Intermediate. Presented in TLS.', indent: 2 },
              ].map(r => (
                <div key={r.level} className="flex items-start gap-3" style={{ marginLeft: `${r.indent * 24}px` }}>
                  <span className="text-lg flex-shrink-0">{r.icon}</span>
                  <div>
                    <span className={`font-bold ${r.color}`}>{r.level}</span>
                    <span className="text-slate-500 ml-3 font-sans text-[11px]">{r.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-surface-700 p-4">
            <p className="text-xs text-slate-400">
              <strong className="text-white">Chain of trust:</strong> Your server presents its certificate + the intermediate CA certificate. The client verifies the intermediate was signed by a Root CA it trusts. The chain must be complete and in order — a missing intermediate is the #1 cause of "certificate not trusted" errors.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2>openssl — Certificate Operations</h2>
        <CodeBlock title="Essential openssl commands for sysadmins" language="bash"
          code={CODE_CYBERSECURITYPKI_1} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB SEC-6</span>
            <span className="text-sm font-semibold text-white">Create a Lab Internal CA and Issue Server Certificates</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Create a lab internal CA on the Ubuntu VM."
              command={CODE_CYBERSECURITYPKI_2}
              output={CODE_CYBERSECURITYPKI_3}
            />
            <LabStep number={2}
              description="Issue a certificate for DC01 signed by the lab CA."
              command={CODE_CYBERSECURITYPKI_4}
              output={CODE_CYBERSECURITYPKI_5}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="sec-06" title="PKI, SSL/TLS & Certificates Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={40} />
      </section>
    </LessonLayout>
  )
}
