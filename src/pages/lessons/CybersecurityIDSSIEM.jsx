import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_CYBERSECURITYIDSSIEM_1 = `# ── On the LOG SERVER (collector) ────────────────────────────
# Enable UDP/TCP syslog reception
sudo tee /etc/rsyslog.d/10-listen.conf << 'EOF'
# Listen on UDP 514
module(load="imudp")
input(type="imudp" port="514")

# Listen on TCP 514 (more reliable, supports larger messages)
module(load="imtcp")
input(type="imtcp" port="514")

# Store logs per host
$template RemoteLogs,"/var/log/remote/%HOSTNAME%/%PROGRAMNAME%.log"
*.* ?RemoteLogs
& stop
EOF
sudo systemctl restart rsyslog

# ── On each CLIENT server ─────────────────────────────────────
sudo tee /etc/rsyslog.d/50-forward.conf << 'EOF'
# Forward all logs to central server via TCP
*.* @@192.168.100.10:514
# @@ = TCP (reliable), @ = UDP (faster but may lose messages)
EOF
sudo systemctl restart rsyslog

# ── Verify forwarding ─────────────────────────────────────────
logger -t test 'This is a test from client'
# Check on log server:
# cat /var/log/remote/srv01/test.log`
const CODE_CYBERSECURITYIDSSIEM_2 = `# Wazuh components:
# - wazuh-manager: central server (correlation, alerting, API)
# - wazuh-agent: lightweight agent on each monitored system
# - OpenSearch/Kibana: visualisation dashboard (Wazuh dashboard)

# Key capabilities of the Wazuh agent:

# 1. File Integrity Monitoring (FIM)
# Monitors files for unauthorised changes:
# /etc/passwd, /etc/shadow, /etc/sudoers, /bin/, /sbin/

# 2. Rootkit detection
# Checks for hidden processes, files, and ports

# 3. Vulnerability assessment
# Compares installed packages against NVD/CVE database

# 4. Log analysis
# Parses auth.log, syslog, audit.log for suspicious patterns

# 5. Active response
# Automatically block IPs with firewall after N failed logins

# Example active response rule (wazuh ossec.conf):
# <active-response>
#   <command>firewall-drop</command>
#   <location>local</location>
#   <rules_id>5710</rules_id>  <!-- SSH brute force rule -->
#   <timeout>3600</timeout>     <!-- Block for 1 hour -->
# </active-response>`
const CODE_CYBERSECURITYIDSSIEM_3 = `# Watch auth.log for failed SSH logins in real time
sudo tail -f /var/log/auth.log | grep 'Failed password'

# Count failures per IP (run after some activity)
sudo grep 'Failed password' /var/log/auth.log |
  awk '{print $11}' | sort | uniq -c | sort -rn | head -10`
const CODE_CYBERSECURITYIDSSIEM_4 = `Jan 15 11:00:00 srv01 sshd[1234]: Failed password for root from 10.0.0.5 port 54321 ssh2

   3 10.0.0.5
   1 192.168.100.50`
const CODE_CYBERSECURITYIDSSIEM_5 = `# Enable UFW logging
sudo ufw logging on

# Watch for blocked connection attempts
sudo tail -f /var/log/ufw.log | grep 'BLOCK'

# Summarise blocked source IPs
sudo grep 'UFW BLOCK' /var/log/ufw.log |
  awk '{for(i=1;i<=NF;i++) if($i~/^SRC=/) print substr($i,5)}' |
  sort | uniq -c | sort -rn | head -10

# Detect port scan: many different DPT values from same SRC
sudo grep 'UFW BLOCK' /var/log/ufw.log |
  awk '{src=""; dpt=""; for(i=1;i<=NF;i++){
    if($i~/^SRC=/) src=substr($i,5);
    if($i~/^DPT=/) dpt=substr($i,5)}
    print src, dpt}' | sort | head -10`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the difference between an IDS and an IPS?',
    options: [
      'IDS is software; IPS is hardware',
      'An IDS (Intrusion Detection System) monitors and alerts; an IPS (Intrusion Prevention System) monitors, detects, AND actively blocks malicious traffic inline',
      'IDS works at Layer 4; IPS works at Layer 7',
      'IDS is for internal networks; IPS is for perimeter networks only',
    ],
    correct: 1,
    explanation: 'IDS sits out-of-band (receives a copy of traffic) — it can only alert, never block. Think of it as a burglar alarm: it rings when someone breaks in, but doesn\'t stop them. IPS sits inline (all traffic passes through it) — it can drop malicious packets in real time. IPS has lower risk tolerance for false positives since blocking legitimate traffic causes outages. Most modern tools (Snort, Suricata) can operate in either mode.',
  },
  {
    id: 'q2',
    question: 'What is a SIEM and what are its core functions?',
    options: [
      'A firewall that learns traffic patterns and auto-updates rules',
      'Security Information and Event Management — centralises log collection from all sources, correlates events across systems, generates alerts, and provides a single pane of glass for security monitoring',
      'A vulnerability scanner that runs continuously against all systems',
      'An endpoint security agent deployed on every server',
    ],
    correct: 1,
    explanation: 'SIEM combines two functions: SIM (Security Information Management) — log collection, storage, and compliance reporting; and SEM (Security Event Management) — real-time correlation and alerting. A SIEM ingests logs from firewalls, servers, endpoints, and applications, then applies correlation rules: "5 failed logins from one IP across 3 different servers in 10 minutes = potential brute-force attack." Examples: Splunk, Microsoft Sentinel, Elastic SIEM, Wazuh (open-source).',
  },
  {
    id: 'q3',
    question: 'What is the difference between a false positive and a false negative in IDS/IPS?',
    options: [
      'False positive = correctly detected attack; False negative = missed attack',
      'False positive = legitimate traffic flagged as malicious (alert on normal activity); False negative = malicious traffic not detected (attacker gets through undetected)',
      'Both terms mean the same thing — incorrectly classified traffic',
      'False positive = network error; False negative = configuration error',
    ],
    correct: 1,
    explanation: 'False positive: normal traffic triggers an alert — a developer\'s port scan flagged as an attack, or a backup tool\'s behaviour matching malware signatures. High false positive rates cause alert fatigue, where analysts stop taking alerts seriously. False negative: real attacks that slip through undetected — the more dangerous failure mode. Tuning IDS/IPS is the art of reducing false positives without increasing false negatives.',
  },
  {
    id: 'q4',
    question: 'What is log correlation in a SIEM and why is it more valuable than individual log analysis?',
    options: [
      'Log correlation compresses logs to reduce storage requirements',
      'Correlation links events across multiple systems to detect attack patterns invisible when logs are viewed in isolation — e.g. a failed login on a firewall + a failed login on a server + a successful login on a database 5 minutes later suggests lateral movement',
      'Correlation synchronises log timestamps across different time zones',
      'Correlation removes duplicate log entries to reduce noise',
    ],
    correct: 1,
    explanation: 'Individual log analysis sees a tree; SIEM correlation sees the forest. An attacker conducting a slow, careful attack generates individual events that each look benign in isolation: one failed login here, one port scan there, one successful login. Only when correlated across systems and time does the attack chain become visible. SIEM correlation rules define these patterns: "if events A, B, C happen across systems X, Y, Z within time window W, generate high-severity alert."',
  },
  {
    id: 'q5',
    question: 'What does Wazuh provide that syslog forwarding alone does not?',
    options: [
      'Wazuh only forwards logs faster — there is no functional difference',
      'Wazuh provides an agent that performs file integrity monitoring, rootkit detection, vulnerability scanning, and active response on the endpoint in addition to log forwarding',
      'Wazuh encrypts logs before forwarding; syslog sends in plaintext',
      'Wazuh supports Windows; syslog only supports Linux',
    ],
    correct: 1,
    explanation: 'Wazuh is a full open-source SIEM/XDR platform. Its agent does much more than log forwarding: FIM (File Integrity Monitoring) detects unauthorised file changes, rootkit detection checks for hidden processes/files, vulnerability assessment compares installed software against CVE databases, and active response can automatically block IPs after detecting brute-force. The manager performs log aggregation, correlation, and alerting. It\'s a complete lightweight security platform.',
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

export default function CybersecurityIDSSIEM() {
  return (
    <LessonLayout
      lessonId="sec-07"
      courseId="cybersecurity"
      title="Intrusion Detection & SIEM"
      courseTitle="Cybersecurity"
      courseHref="/cybersecurity"
      xp={100}
      readTime="~40 min"
      icon="👁️"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Cybersecurity', href: '/cybersecurity' },
        { label: 'Intrusion Detection & SIEM' },
      ]}
      prev={{ title: 'PKI, SSL/TLS & Certificates', href: '/cybersecurity/pki' }}
      next={{ title: 'Vulnerability Scanning',      href: '/cybersecurity/vuln-scanning' }}
      objectives={[
        'Distinguish IDS vs IPS and their respective use cases',
        'Understand SIEM architecture: collection, correlation, alerting',
        'Configure centralized log collection with rsyslog',
        'Understand Wazuh as an open-source SIEM/XDR platform',
        'Write basic Snort/Suricata-style detection rules',
        'Understand alert fatigue and how to tune detection rules',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Detection is the second line of defence after prevention. No firewall or
          hardening configuration is perfect — attackers get through. SIEM and IDS
          give you visibility: the ability to see attacks happening in real time,
          correlate events across systems, and respond before damage becomes catastrophic.
        </p>
        <Callout type="info" icon="💡" title="The detection maturity model">
          Level 1 — Logs exist. Level 2 — Logs are centralised. Level 3 — Logs are
          searched reactively. Level 4 — Alerting rules detect known patterns. Level 5
          — Correlation detects multi-stage attacks. Most organisations are at Level 2-3.
          The goal of this lesson is to reach Level 4.
        </Callout>
      </section>

      <section>
        <h2>SIEM Architecture</h2>
        <div className="info-card mt-4 overflow-hidden">
          <div className="divide-y divide-surface-700">
            {[
              { layer: 'Data Collection',  icon: '📥', desc: 'Agents, syslog forwarders, and API integrations pull logs from servers, firewalls, endpoints, cloud services, and applications into the SIEM.' },
              { layer: 'Normalisation',    icon: '⚙️', desc: 'Different log formats (Windows EventLog, syslog, JSON, CEF) are parsed and normalised into a common schema so correlation rules work across all sources.' },
              { layer: 'Storage & Search', icon: '🗄️', desc: 'Logs are indexed for fast search. Retention policies balance storage cost vs investigation capability. Hot/warm/cold tiers manage cost.' },
              { layer: 'Correlation',      icon: '🔗', desc: 'Rules and ML models analyse event streams in real time, linking events across systems and time to detect attack patterns.' },
              { layer: 'Alerting',         icon: '🚨', desc: 'High-confidence matches generate alerts routed to analysts via ticketing systems, email, Slack, or PagerDuty.' },
              { layer: 'Response',         icon: '🛡️', desc: 'SOAR integration or manual playbooks guide analyst response: isolate host, block IP, reset credentials, escalate.' },
            ].map(l => (
              <div key={l.layer} className="flex gap-4 p-3 items-start">
                <span className="text-2xl flex-shrink-0 mt-0.5">{l.icon}</span>
                <div>
                  <p className="font-semibold text-white text-sm">{l.layer}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2>Centralised Log Collection with rsyslog</h2>
        <CodeBlock title="Configure rsyslog to forward to a central server" language="bash"
          code={CODE_CYBERSECURITYIDSSIEM_1} />
      </section>

      <section>
        <h2>Wazuh — Open-Source SIEM/XDR</h2>
        <CodeBlock title="Wazuh architecture and key features" language="bash"
          code={CODE_CYBERSECURITYIDSSIEM_2} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB SEC-7</span>
            <span className="text-sm font-semibold text-white">Configure Centralized Logging and Detect Brute-Force</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Configure the Ubuntu VM to detect SSH brute-force attempts using built-in logs."
              command={CODE_CYBERSECURITYIDSSIEM_3}
              output={CODE_CYBERSECURITYIDSSIEM_4}
            />
            <LabStep number={2}
              description="Use the UFW log to detect port scanning activity."
              command={CODE_CYBERSECURITYIDSSIEM_5}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="sec-07" title="IDS & SIEM Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={50} />
      </section>
    </LessonLayout>
  )
}
