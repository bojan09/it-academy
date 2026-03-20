import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What does the CALMS framework stand for in DevOps?',
    options: [
      'Continuous Automation, Lean Management, Security',
      'Culture, Automation, Lean, Measurement, Sharing',
      'Continuous Agile, Logging, Monitoring, Security',
      'Code, Automate, Launch, Measure, Scale',
    ],
    correct: 1,
    explanation: 'CALMS: Culture (breaking silos between Dev and Ops), Automation (automate repetitive manual tasks), Lean (eliminate waste, optimise flow), Measurement (measure everything — deployments, MTTR, lead time), Sharing (shared responsibility, shared knowledge, blameless post-mortems). CALMS is used to assess DevOps maturity.',
  },
  {
    id: 'q2',
    question: 'What is the key metric "MTTR" in DevOps?',
    options: [
      'Mean Time To Release — how quickly code moves from commit to production',
      'Mean Time To Recovery — how quickly a system is restored after an incident',
      'Maximum Throughput To Repository — peak CI/CD pipeline capacity',
      'Minimum Test Time Required — the shortest acceptable test suite duration',
    ],
    correct: 1,
    explanation: 'MTTR (Mean Time To Recovery) measures how quickly a team can restore service after an incident. It\'s one of the four DORA metrics. Low MTTR indicates good incident response, runbooks, monitoring, and automated recovery. The four DORA metrics are: Deployment Frequency, Lead Time for Changes, Change Failure Rate, and Time to Restore Service (MTTR).',
  },
  {
    id: 'q3',
    question: 'What distinguishes SRE (Site Reliability Engineering) from traditional Operations?',
    options: [
      'SRE uses only Linux; traditional Ops uses Windows',
      'SRE applies software engineering practices to infrastructure problems — writing code to solve ops challenges rather than manual processes',
      'SRE is responsible for security; traditional Ops handles availability',
      'There is no practical difference — SRE is just a rebranding of Ops',
    ],
    correct: 1,
    explanation: 'SRE (coined at Google) applies software engineering to operations work. SREs write code to automate toil (repetitive manual operations work), define Service Level Objectives (SLOs) and error budgets, and use data-driven approaches to balance reliability vs feature velocity. Traditional ops tends toward manual processes and tribal knowledge.',
  },
  {
    id: 'q4',
    question: 'What is a "blameless post-mortem"?',
    options: [
      'An incident review where nobody gets disciplined regardless of what happened',
      'A structured analysis of an incident focused on systemic causes and improvements rather than individual blame',
      'A retrospective conducted after someone leaves the team',
      'A legal document filed after a major outage',
    ],
    correct: 1,
    explanation: 'A blameless post-mortem is a detailed incident review that assumes people acted with good intentions and the best information available. Instead of asking "who caused this?", it asks "what systemic conditions allowed this to happen?" and "what process/tooling/monitoring improvements prevent recurrence?" Blame culture prevents honest disclosure — blameless culture generates better prevention.',
  },
  {
    id: 'q5',
    question: 'What does "shift left" mean in the context of DevOps security (DevSecOps)?',
    options: [
      'Moving infrastructure from on-premises to cloud',
      'Integrating security testing and review earlier in the development lifecycle — at the code stage rather than before release',
      'Assigning security responsibilities to the left side of the org chart (development)',
      'Reducing the attack surface by moving services to internal networks',
    ],
    correct: 1,
    explanation: '"Shift left" means moving activities earlier in the pipeline — closer to the developer. In DevSecOps, this means integrating security scanning (SAST, dependency checks, container scanning) into the CI pipeline at the code/build stage, rather than running security assessments only before production release. Fixing security issues at the code stage is orders of magnitude cheaper than fixing them post-deployment.',
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

export default function DevOpsPrinciples() {
  return (
    <LessonLayout
      lessonId="devops-01"
      courseId="devops"
      title="DevOps Principles & Culture"
      courseTitle="DevOps"
      courseHref="/devops"
      xp={50}
      readTime="~20 min"
      icon="🔄"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'DevOps', href: '/devops' },
        { label: 'DevOps Principles & Culture' },
      ]}
      prev={null}
      next={{ title: 'Git & Version Control', href: '/devops/git' }}
      objectives={[
        'Define DevOps and understand why it exists',
        'Apply the CALMS framework to assess DevOps maturity',
        'Understand the DORA metrics for measuring engineering performance',
        'Distinguish SRE from traditional Operations',
        'Understand the Three Ways of DevOps',
        'Know the DevSecOps mindset and "shift left" principle',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          DevOps is not a job title, a tool, or a team — it's a culture and set of practices
          that bridges the gap between software development and IT operations. The goal is
          to deliver software changes faster and more reliably by breaking down the silos
          that cause friction, failure, and blame.
        </p>
        <p className="mt-4">
          Understanding DevOps principles makes you a better sysadmin, not just a better
          "DevOps engineer." The practices of automation, measurement, and continuous
          improvement apply whether you're managing 5 servers or 5,000.
        </p>
      </section>

      {/* ── WHY DEVOPS EXISTS ── */}
      <section>
        <h2>Why DevOps Exists — The Wall of Confusion</h2>
        <div className="info-card mt-4 overflow-hidden">
          <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-surface-700">
            <div className="p-5">
              <p className="text-xs font-semibold text-brand-300 uppercase tracking-widest mb-3">Dev Team</p>
              <p className="text-sm text-white font-semibold mb-2">"Ship fast, change everything"</p>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>→ Measured on new features shipped</li>
                <li>→ Success = change deployed</li>
                <li>→ "Works on my machine"</li>
              </ul>
            </div>
            <div className="p-5 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-2">🧱</div>
                <p className="text-xs text-slate-500 font-semibold">The Wall</p>
                <p className="text-[10px] text-slate-600">Blame, delays, rework</p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold text-accent-amber uppercase tracking-widest mb-3">Ops Team</p>
              <p className="text-sm text-white font-semibold mb-2">"Stability, never change anything"</p>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>→ Measured on uptime percentage</li>
                <li>→ Success = nothing breaks</li>
                <li>→ "Not in production at 4pm Friday"</li>
              </ul>
            </div>
          </div>
          <div className="p-4 border-t border-surface-700 text-center">
            <p className="text-xs text-slate-400">
              DevOps replaces this adversarial dynamic with shared goals, shared responsibility,
              and shared tooling. Both teams want reliable, fast delivery.
            </p>
          </div>
        </div>
      </section>

      {/* ── CALMS ── */}
      <section>
        <h2>The CALMS Framework</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {[
            { letter: 'C', word: 'Culture',      color: 'text-brand-300',    bg: 'bg-brand-500/10',    desc: 'Psychological safety, blameless post-mortems, shared ownership, cross-functional teams. Culture is the hardest to change and the most important.' },
            { letter: 'A', word: 'Automation',   color: 'text-accent-green', bg: 'bg-accent-green/10', desc: 'Automate repetitive toil: builds, tests, deployments, server provisioning, monitoring alerts. If you do it more than twice, automate it.' },
            { letter: 'L', word: 'Lean',         color: 'text-accent-cyan',  bg: 'bg-accent-cyan/10',  desc: 'Eliminate waste. Small batch sizes. Fast feedback loops. Limit work in progress. Optimise the whole system, not individual components.' },
            { letter: 'M', word: 'Measurement',  color: 'text-accent-amber', bg: 'bg-accent-amber/10', desc: 'Measure everything: deployment frequency, lead time, MTTR, change failure rate. You can\'t improve what you don\'t measure.' },
            { letter: 'S', word: 'Sharing',      color: 'text-accent-purple',bg: 'bg-accent-purple/10',desc: 'Share knowledge, tools, and processes. Internal tech talks, documentation, open source internal tools. Institutional knowledge should be written down.' },
          ].map(c => (
            <div key={c.letter} className={`card p-5 ${c.bg} border-0`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`font-black text-2xl font-mono ${c.color}`}>{c.letter}</span>
                <span className={`font-bold text-base ${c.color}`}>{c.word}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DORA METRICS ── */}
      <section>
        <h2>The Four DORA Metrics</h2>
        <p>
          DORA (DevOps Research and Assessment) identified four key metrics that predict
          both software delivery performance and organisational performance:
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          {[
            { metric: 'Deployment Frequency', icon: '🚀', elite: 'Multiple per day',     high: 'Weekly',        desc: 'How often code is deployed to production. High performers deploy more often with smaller, safer batches.' },
            { metric: 'Lead Time for Changes', icon: '⏱️', elite: '< 1 hour',            high: '1 day to 1 week', desc: 'Time from code commit to running in production. Measures pipeline efficiency and testing speed.' },
            { metric: 'Change Failure Rate',   icon: '💥', elite: '0–15%',               high: '16–30%',        desc: 'Percentage of deployments that cause a production incident. Lower = better quality and testing.' },
            { metric: 'Time to Restore (MTTR)',icon: '🔧', elite: '< 1 hour',            high: '< 1 day',       desc: 'How quickly a team recovers from production incidents. Measures runbooks, on-call, and tooling quality.' },
          ].map(m => (
            <div key={m.metric} className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{m.icon}</span>
                <p className="font-bold text-white text-sm">{m.metric}</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{m.desc}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-accent-green/10 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">Elite</p>
                  <p className="text-xs font-semibold text-accent-green mt-0.5">{m.elite}</p>
                </div>
                <div className="bg-brand-500/10 rounded-lg p-2 text-center">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">High</p>
                  <p className="text-xs font-semibold text-brand-300 mt-0.5">{m.high}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── THREE WAYS ── */}
      <section>
        <h2>The Three Ways of DevOps</h2>
        <div className="space-y-4 mt-4">
          {[
            { way: 'First Way: Systems Thinking', icon: '🌊', color: 'text-brand-300', desc: 'Optimise the entire value stream — from idea to customer — not just individual silos. A team that deploys fast but breaks production constantly hasn\'t optimised the system. Metrics: deployment frequency, lead time.' },
            { way: 'Second Way: Amplify Feedback', icon: '🔁', color: 'text-accent-cyan', desc: 'Fast, continuous feedback from right to left in the value stream. Tests fail immediately. Monitoring pages on-call within seconds. Customers report bugs in real-time. Fast feedback enables fast learning and course correction.' },
            { way: 'Third Way: Continuous Learning', icon: '🎓', color: 'text-accent-green', desc: 'Cultivate a culture of experimentation and learning from failure. Blameless post-mortems. Game days. Chaos engineering. Repetition creates expertise — automate the repetitive so humans can focus on higher-order problems.' },
          ].map(w => (
            <div key={w.way} className="card p-5 flex gap-4">
              <span className="text-3xl flex-shrink-0">{w.icon}</span>
              <div>
                <p className={`font-bold text-sm mb-1 ${w.color}`}>{w.way}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{w.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="devops-01" title="DevOps Principles Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={25} />
      </section>
    </LessonLayout>
  )
}
