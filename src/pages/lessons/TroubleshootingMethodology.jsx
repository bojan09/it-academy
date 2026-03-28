import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_TROUBLESHOOTINGMETHODOLOGY_1 = `# L1: Is the interface up?
ip link show ens33

# L2: Do we have a MAC / ARP entry for the gateway?
ip neigh show

# L3: Do we have an IP and can we reach the gateway?
ip addr show ens33
ping -c 3 192.168.100.1

# L4: Can we open a TCP connection to an external service?
nc -zv 8.8.8.8 53

# L7: Can we resolve DNS and reach a URL?
dig google.com +short
curl -I --max-time 5 https://example.com`
const CODE_TROUBLESHOOTINGMETHODOLOGY_2 = `L1: ens33: <BROADCAST,MULTICAST,UP,LOWER_UP>  ← Interface up ✔
L2: 192.168.100.1 dev ens33 lladdr 00:50:56:01:... REACHABLE  ✔
L3: inet 192.168.100.20/24  |  ping 64 bytes, time=0.421ms ✔
L4: Connection to 8.8.8.8 53 succeeded ✔
L7: 142.250.80.46  |  HTTP/2 200 ✔
→ All layers working — problem may be intermittent or already resolved`
const CODE_TROUBLESHOOTINGMETHODOLOGY_3 = `# Break DNS temporarily (pointing to a non-existent server)
echo "nameserver 192.168.100.99" | sudo tee /etc/resolv.conf

# Now reproduce the symptom
dig google.com

# Diagnose: what layer fails?
ping -c 1 8.8.8.8   # L3 — does IP routing still work?
nc -zv 8.8.8.8 443  # L4 — is TCP to internet working?
dig @192.168.100.99 google.com  # L7 — is THIS DNS server reachable?
dig @192.168.100.10 google.com  # Test with DC01's DNS instead

# Fix: restore correct DNS
echo "nameserver 192.168.100.10" | sudo tee /etc/resolv.conf
dig google.com +short  # Confirm fixed`
const CODE_TROUBLESHOOTINGMETHODOLOGY_4 = `dig google.com: connection timed out; no servers could be reached  ← symptom
ping 8.8.8.8: 64 bytes — time=12ms ← IP routing works ✔
nc 8.8.8.8:443 succeeded ← internet TCP works ✔
dig @192.168.100.99: timed out ← that DNS server doesn't exist ← ROOT CAUSE
dig @192.168.100.10: 142.250.80.46 ← DC01 DNS works fine ✔

Root cause: /etc/resolv.conf pointed to a non-existent DNS server.
Fix: restored correct DNS server (192.168.100.10).`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'When should you escalate a problem rather than continuing to troubleshoot it yourself?',
    options: [
      'Immediately — always escalate to avoid making mistakes',
      'Never — a professional should solve every problem independently',
      'When you have exhausted your knowledge, the problem impacts critical systems beyond your authority to fix, or it requires specialist access you don\'t have',
      'After exactly 30 minutes of troubleshooting',
    ],
    correct: 2,
    explanation: 'Escalation is not failure — it\'s professional judgement. Escalate when: (1) you\'ve tried everything in your toolkit and the problem persists, (2) the issue is beyond your authority to fix (e.g. change management required), (3) the severity/business impact requires specialist involvement, or (4) you\'ve been troubleshooting so long that fresh eyes would be faster. Always document what you\'ve tried before escalating.',
  },
  {
    id: 'q2',
    question: 'What is the "divide and conquer" troubleshooting approach?',
    options: [
      'Splitting the problem between multiple team members simultaneously',
      'Testing the middle of a potential range to eliminate half the possibilities at each step',
      'Dividing the ticket into smaller tasks and resolving them separately',
      'Running multiple diagnostic tools simultaneously to gather data faster',
    ],
    correct: 1,
    explanation: 'Divide and conquer (also called binary search / half-splitting) means testing the midpoint of a range to eliminate half the problem space at each step. For example: if network traffic fails between A and Z, test the midpoint M. If M works, the problem is between M and Z. If M fails, it\'s between A and M. This is much faster than testing sequentially from one end.',
  },
  {
    id: 'q3',
    question: 'Why should you change only ONE variable at a time when troubleshooting?',
    options: [
      'It\'s a bureaucratic requirement, not a technical one',
      'So that if the problem resolves, you know exactly which change fixed it — multiple simultaneous changes make cause determination impossible',
      'Because changes to multiple variables simultaneously can damage hardware',
      'To ensure the change management system can track each modification separately',
    ],
    correct: 1,
    explanation: 'Changing one variable at a time is fundamental to scientific troubleshooting. If you change three things and the problem disappears, you don\'t know which change fixed it — or whether the combination was necessary. You also can\'t reliably document the fix or reproduce it. Change one thing, test the result, document what happened, then proceed.',
  },
  {
    id: 'q4',
    question: 'What is an "OSI model top-down" troubleshooting approach?',
    options: [
      'Starting with management (top of the organisation) before touching technical systems',
      'Beginning with application-layer symptoms and working down through the layers until the root cause is found',
      'Checking the physical layer first, then moving up through the stack',
      'Prioritising problems in the order they were reported',
    ],
    correct: 1,
    explanation: 'Top-down starts at Layer 7 (Application) — "what does the user actually see?" — and works downward: Application → Presentation → Session → Transport (ports) → Network (IP/routing) → Data Link (switch/MAC) → Physical (cable/NIC). This approach is efficient when you have a clear user-reported symptom. Bottom-up starts at Layer 1 and is better when you suspect physical issues.',
  },
  {
    id: 'q5',
    question: 'What should ALWAYS be documented at the end of a troubleshooting session?',
    options: [
      'Only the final solution — documenting failed attempts wastes time',
      'The problem description, symptoms, what was tested, root cause, solution applied, and who was involved',
      'Just a ticket closure comment saying "issue resolved"',
      'The time spent on the problem for billing purposes only',
    ],
    correct: 1,
    explanation: 'Good troubleshooting documentation includes: problem description (what was broken), observed symptoms, what you tested and the results, root cause identified, solution applied, any follow-up actions, and timeline. This creates institutional knowledge, helps the next person who sees the same problem, and demonstrates professional competence. Poor documentation is one of the most common sysadmin anti-patterns.',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info: 'callout-info', warning: 'callout-warning', success: 'callout-success' }
  return (
    <div className={`callout ${s[type]}`}>
      <span className="callout-icon">{icon}</span>
      <div className="callout-body">{title && <strong>{title} — </strong>}{children}</div>
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

export default function TroubleshootingMethodology() {
  return (
    <LessonLayout
      lessonId="trouble-01"
      courseId="troubleshooting"
      title="The Troubleshooting Methodology"
      courseTitle="Troubleshooting"
      courseHref="/troubleshooting"
      xp={50}
      readTime="~20 min"
      icon="🧠"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Troubleshooting', href: '/troubleshooting' },
        { label: 'The Methodology' },
      ]}
      prev={null}
      next={{ title: 'Windows Troubleshooting', href: '/troubleshooting/windows' }}
      objectives={[
        'Apply a structured, repeatable troubleshooting methodology',
        'Use OSI-layer thinking to narrow down network and connectivity problems',
        'Practise divide-and-conquer to eliminate problem areas rapidly',
        'Know when to escalate and how to do it effectively',
        'Document problems and solutions professionally',
        'Avoid the most common troubleshooting anti-patterns',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          The difference between a junior sysadmin and a senior one is rarely knowledge
          of more tools — it's the ability to approach any problem systematically, narrow
          down the cause efficiently, and fix it without making things worse.
        </p>
        <p className="mt-4">
          This lesson teaches the methodology that experienced engineers apply instinctively.
          With it, you'll approach any technical problem — whether it's a broken DNS
          query, a silent service failure, or a network outage — with a clear process rather
          than guesswork.
        </p>
      </section>

      {/* ── THE 7-STEP PROCESS ── */}
      <section>
        <h2>The 7-Step Troubleshooting Process</h2>
        <div className="space-y-3 mt-4">
          {[
            { step: 1, title: 'Identify the Problem',       color: 'bg-brand-500',      desc: 'Gather symptoms. What exactly is broken? What error messages appear? When did it start? What changed recently? Ask the user — their description often contains the key clue.' },
            { step: 2, title: 'Establish a Theory',         color: 'bg-accent-cyan',    desc: 'Based on symptoms, form a hypothesis. "I think the issue is X because Y." Use OSI layers, logs, and experience to focus your theory. Start with the most common causes first (occam\'s razor).' },
            { step: 3, title: 'Test the Theory',            color: 'bg-accent-green',   desc: 'Run specific tests to confirm or refute your theory. Use ping, telnet, logs, Event Viewer, tcpdump. Change ONE variable at a time. If the theory is wrong, revise it.' },
            { step: 4, title: 'Establish an Action Plan',   color: 'bg-accent-amber',   desc: 'Once you know the cause, plan the fix. Consider: will this cause downtime? Is a change window required? What\'s the rollback plan if the fix doesn\'t work? Document before changing anything.' },
            { step: 5, title: 'Implement the Solution',     color: 'bg-orange-500',     desc: 'Apply the fix. Work methodically. Make one change at a time. Verify each change before making the next. Keep notes of everything you change.' },
            { step: 6, title: 'Verify Functionality',       color: 'bg-accent-purple',  desc: 'Confirm the problem is actually fixed — don\'t just assume. Test the exact scenario the user reported. Test edge cases. Check monitoring alerts have cleared.' },
            { step: 7, title: 'Document Everything',        color: 'bg-slate-500',      desc: 'Write up the problem, root cause, solution, and any lessons learned. Update the knowledge base. Prevents the same issue from costing hours next time.' },
          ].map(s => (
            <div key={s.step} className="flex gap-4 items-start">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center
                               text-white font-black font-mono text-sm flex-shrink-0 mt-0.5`}>
                {s.step}
              </div>
              <div className="flex-1 card p-4">
                <p className="font-semibold text-white text-sm mb-1">{s.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── OSI APPROACH ── */}
      <section>
        <h2>OSI-Layer Troubleshooting Framework</h2>
        <p>When connectivity is broken, the OSI model gives you a structured checklist:</p>
        <div className="info-card mt-4 overflow-hidden">
          <div className="divide-y divide-surface-700">
            {[
              { layers: 'L1 — Physical', question: 'Is the cable plugged in? Is the link light on?',    cmd: 'ip link show    ethtool eth0',   win: 'Get-NetAdapter    check NIC LED' },
              { layers: 'L2 — Data Link', question: 'Is the MAC address visible? Any duplex issues?',   cmd: 'ip neigh show   arp -n',          win: 'Get-NetNeighbor   arp -a' },
              { layers: 'L3 — Network',   question: 'Is there an IP? Can you ping the gateway?',        cmd: 'ip addr show    ping -c4 GW',     win: 'ipconfig /all    Test-NetConnection' },
              { layers: 'L4 — Transport', question: 'Is the destination port open? Service listening?', cmd: 'ss -tlnp        nc -zv host port', win: 'netstat -ano     Test-NetConnection -Port' },
              { layers: 'L7 — Application', question: 'Is the service responding? DNS resolving?',      cmd: 'curl -I url     dig hostname',     win: 'Invoke-WebRequest Resolve-DnsName' },
            ].map(r => (
              <div key={r.layers} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 items-start">
                <div>
                  <span className="tag text-[10px]">{r.layers}</span>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{r.question}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Linux</p>
                  <code className="text-[11px] font-mono text-accent-green leading-relaxed whitespace-pre-wrap">{r.cmd}</code>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Windows</p>
                  <code className="text-[11px] font-mono text-brand-300 leading-relaxed whitespace-pre-wrap">{r.win}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANTI-PATTERNS ── */}
      <section>
        <h2>Common Anti-Patterns to Avoid</h2>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {[
            { icon: '🎯', bad: 'Shooting in the dark',   desc: 'Trying random fixes without a theory. Wastes time, may mask the real issue, and makes root cause impossible to determine.' },
            { icon: '🔄', bad: 'Changing multiple things at once', desc: 'Makes it impossible to know what fixed the problem. Even worse — you may not know what broke the next thing.' },
            { icon: '📵', bad: 'Not documenting',         desc: '"I\'ll remember it." You won\'t. Neither will the next person. Good notes are a professional obligation.' },
            { icon: '🙈', bad: 'Ignoring recent changes', desc: '"What changed recently?" resolves 60% of incidents. Always ask. Check change log, deployment history, Windows Update.' },
            { icon: '🔁', bad: 'Fixing symptoms not causes', desc: 'Restarting a service every day instead of fixing why it keeps crashing. The alert goes away, the problem doesn\'t.' },
            { icon: '🚀', bad: 'Skipping the test step',  desc: 'Jumping to "fix" before confirming the diagnosis. You may fix the wrong thing, or introduce a new problem.' },
          ].map(a => (
            <div key={a.bad} className="card p-4 border-accent-red/15 bg-accent-red/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{a.icon}</span>
                <p className="text-sm font-semibold text-white">❌ {a.bad}</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VMware LAB ── */}
      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB TROUBLESHOOT-1</span>
            <span className="text-sm font-semibold text-white">Apply the Methodology to a Real Scenario</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~15 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Scenario: A user reports 'I can't reach the internet from the Ubuntu Server VM.' Apply the OSI methodology — start at L1 and work up."
              command={CODE_TROUBLESHOOTINGMETHODOLOGY_1}
              output={CODE_TROUBLESHOOTINGMETHODOLOGY_2}
            />
            <LabStep number={2}
              description="Simulate a broken DNS scenario and diagnose it systematically."
              command={CODE_TROUBLESHOOTINGMETHODOLOGY_3}
              output={CODE_TROUBLESHOOTINGMETHODOLOGY_4}
            />
            <Callout type="success" icon="✅" title="Lab Complete">
              You've applied the OSI methodology to identify a connectivity issue layer by
              layer, and diagnosed a DNS misconfiguration without guessing. This is how
              senior engineers approach every incident.
            </Callout>
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="trouble-01" title="Troubleshooting Methodology Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={25} />
      </section>
    </LessonLayout>
  )
}
