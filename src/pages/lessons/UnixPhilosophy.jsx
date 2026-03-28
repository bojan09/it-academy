import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_UNIXPHILOSOPHY_1 = `# ── Devices ──────────────────────────────────────────────────
cat /dev/urandom | head -c 16 | xxd   # Read random bytes
dd if=/dev/zero of=/tmp/empty bs=1M count=10  # Create empty file
echo 'test' > /dev/null                # Discard output

# ── Kernel data via /proc (Linux) ────────────────────────────
cat /proc/cpuinfo | grep 'model name' | head -1  # CPU info
cat /proc/meminfo | grep MemTotal               # RAM total
cat /proc/loadavg                                # Load average
cat /proc/version                               # Kernel version
cat /proc/$$/status | head -10                  # Current shell's info

# ── Network sockets are files ─────────────────────────────────
# Each open socket has a file descriptor
ls -la /proc/$$/fd | head -10   # File descriptors of current shell
# 0 = stdin, 1 = stdout, 2 = stderr, 3+ = open files/sockets

# ── Hardware via /sys ─────────────────────────────────────────
cat /sys/class/net/eth0/address    # NIC MAC address
cat /sys/class/net/eth0/speed      # Link speed in Mbps
cat /sys/block/sda/size            # Disk size in 512-byte sectors`
const CODE_UNIXPHILOSOPHY_2 = `# What is the default system shell? (should be POSIX sh)
ls -la /bin/sh

# What shell are you using interactively?
echo $SHELL
echo $0

# Check POSIX compliance of a simple script
# This should work on any POSIX system:
#!/bin/sh
if [ -f /etc/os-release ]; then
    . /etc/os-release
    echo "OS: $NAME"
fi`
const CODE_UNIXPHILOSOPHY_3 = `/bin/sh -> dash    <- Ubuntu uses dash (POSIX sh) as /bin/sh
/bin/bash          <- Interactive shell is bash
bash`
const CODE_UNIXPHILOSOPHY_4 = `# Count how many unique users are defined on this system
# Each tool does ONE thing:
cut -d: -f1 /etc/passwd |   # extract username field
  sort |                     # sort alphabetically
  uniq |                     # deduplicate
  wc -l                      # count lines

# Find the 5 largest files under /usr (everything-is-a-file + pipes)
find /usr -type f -printf '%s %p\\
' 2>/dev/null |
  sort -rn |
  head -5 |
  awk '{printf "%-10s %s\\
", $1, $2}'`
const CODE_UNIXPHILOSOPHY_5 = `34

183185920  /usr/lib/x86_64-linux-gnu/libicudata.so.70.1
43978792   /usr/bin/snap
30543488   /usr/lib/snapd/snapd
26918944   /usr/lib/x86_64-linux-gnu/libLLVM-14.so.1
24813992   /usr/lib/x86_64-linux-gnu/libclang-14.so.1`
const CODE_UNIXPHILOSOPHY_6 = `# System info from /proc
echo '=== Kernel version ==='
cat /proc/version

echo '=== Load average (1min, 5min, 15min, running/total, last PID) ==='
cat /proc/loadavg

echo '=== Memory summary ==='
grep -E 'MemTotal|MemAvailable|SwapTotal' /proc/meminfo

echo '=== CPU count ==='
grep -c processor /proc/cpuinfo`
const CODE_UNIXPHILOSOPHY_7 = `=== Kernel version ===
Linux version 5.15.0-91-generic (Ubuntu) #101-Ubuntu SMP

=== Load average ===
0.08 0.05 0.01 1/312 4521

=== Memory summary ===
MemTotal:    3997584 kB
MemAvailable:2847392 kB
SwapTotal:   2097148 kB

=== CPU count ===
2`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the core principle of the Unix philosophy as described by Doug McIlroy?',
    options: [
      'Build large programs that handle all possible use cases in a single executable',
      'Write programs that do one thing well, that work together, and that work on text streams as the universal interface',
      'Always use GUI interfaces for ease of use by non-technical users',
      'Optimise for performance above all other concerns including clarity',
    ],
    correct: 1,
    explanation: 'Doug McIlroy\'s Unix philosophy (1978): (1) Write programs that do one thing and do it well. (2) Write programs that work together. (3) Write programs that handle text streams, because that is a universal interface. This philosophy produced tools like grep, sed, awk, cut, sort — each focused, composable via pipes, and working on text. It is the opposite of "monolithic software that does everything."',
  },
  {
    id: 'q2',
    question: 'What is POSIX and why does it matter for cross-platform scripting?',
    options: [
      'A Linux security framework that enforces mandatory access controls',
      'A set of IEEE standards defining a portable operating system interface — scripts written to POSIX standards run on Linux, macOS, BSDs, and any other POSIX-compliant system',
      'A package manager format used by Debian-based Linux distributions',
      'A network protocol for communicating between Unix systems',
    ],
    correct: 1,
    explanation: 'POSIX (Portable Operating System Interface) is a family of IEEE standards (IEEE 1003) that define the API between software and Unix-like operating systems. POSIX-compliant shell scripts (#!/bin/sh) using only POSIX-specified commands will run on Linux, macOS, FreeBSD, Solaris, and any other certified system. Using bash-specific features (arrays, [[ ]], $()) breaks portability. Knowing POSIX lets you write once, run everywhere.',
  },
  {
    id: 'q3',
    question: 'What are the two main Unix lineages and which major operating systems descend from each?',
    options: [
      'Unix System V (→ Solaris, HP-UX, AIX) and BSD (→ FreeBSD, macOS, OpenBSD)',
      'AT&T Unix (→ Linux) and Berkeley Unix (→ Windows)',
      'Commercial Unix (→ Solaris) and Open Source Unix (→ macOS)',
      'POSIX Unix (→ Linux) and Non-POSIX Unix (→ BSD systems)',
    ],
    correct: 0,
    explanation: 'Two main lineages: (1) AT&T System V — commercialised Unix from Bell Labs, led to Solaris (Sun/Oracle), HP-UX (HP), AIX (IBM), and influenced most enterprise Unix. (2) BSD (Berkeley Software Distribution) — research Unix from UC Berkeley, led to FreeBSD (servers/infrastructure), OpenBSD (security focus), NetBSD (portability), and most importantly macOS/iOS (Apple\'s Darwin kernel is BSD-derived). Linux is neither — it\'s a clean-room reimplementation of Unix behaviour.',
  },
  {
    id: 'q4',
    question: 'In Unix, what does "everything is a file" mean practically?',
    options: [
      'All data must be stored as files — databases and memory are not allowed',
      'Devices, network sockets, processes, and hardware interfaces are represented as files in the filesystem — you can read, write, and manipulate them with standard file I/O tools',
      'The filesystem is stored entirely in memory for performance',
      'Unix only supports text files — binary files are not supported',
    ],
    correct: 1,
    explanation: 'In Unix, the "everything is a file" abstraction means: /dev/sda is a disk, /dev/null is a discard sink, /dev/urandom generates random bytes, /proc/cpuinfo contains CPU info, sockets are file descriptors — all accessed with open(), read(), write(). This abstraction lets you use the same tools (cat, cp, grep, dd) on everything. cat /proc/meminfo reads kernel memory data. dd if=/dev/urandom of=/dev/sda wipes a disk.',
  },
  {
    id: 'q5',
    question: 'What is the significance of process ID 1 (PID 1) in Unix/Linux?',
    options: [
      'It is the kernel itself — the most privileged process',
      'It is the init process — the ancestor of all other processes, responsible for starting system services and adopting orphaned child processes',
      'It is the root shell that all other processes spawn from',
      'It is the first process created by the user after login',
    ],
    correct: 1,
    explanation: 'PID 1 is the init process — the first user-space process started by the kernel. All other processes are descendants of PID 1. Init is responsible for: starting system services at boot, reaping zombie processes (adopting orphans when their parent dies), handling system shutdown/reboot signals. On modern Linux it is typically systemd. On BSDs it is /sbin/init or similar. In containers, your main process runs as PID 1.',
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

export default function UnixPhilosophy() {
  return (
    <LessonLayout
      lessonId="unix-01"
      courseId="unix"
      title="Unix Philosophy & History"
      courseTitle="Unix"
      courseHref="/unix"
      xp={40}
      readTime="~15 min"
      icon="📜"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Unix', href: '/unix' },
        { label: 'Unix Philosophy & History' },
      ]}
      prev={null}
      next={{ title: 'POSIX Shell Scripting', href: '/unix/posix-shell' }}
      objectives={[
        'Understand the Unix philosophy and why it produced better software',
        'Trace Unix history from Bell Labs through modern operating systems',
        'Distinguish the two main Unix lineages: System V and BSD',
        'Explain the "everything is a file" abstraction',
        'Understand POSIX standards and why they matter for portability',
        'Identify how Unix principles apply to Linux and macOS today',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Unix is the most influential operating system ever built. Created at Bell Labs
          in 1969, it shaped every modern OS — Linux, macOS, iOS, Android, and even
          Windows borrowed ideas from it. Understanding Unix philosophy and history gives
          you context for <em>why</em> command-line tools work the way they do and why
          the design decisions made 50 years ago still hold up today.
        </p>
        <Callout type="info" icon="💡" title="Unix vs Linux">
          Unix is a family of operating systems. Linux is a Unix-like OS — it follows
          Unix design principles and POSIX standards but shares no original Unix code.
          macOS is certified Unix. Linux is not officially certified but is effectively
          compatible. When sysadmins say "Unix skills" they mean the skills work across
          Linux, macOS, BSD, and traditional Unix systems.
        </Callout>
      </section>

      <section>
        <h2>The Unix Philosophy</h2>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          {[
            {
              rule: 'Do one thing well',
              icon: '🎯',
              color: 'border-brand-500/25 bg-brand-500/5',
              text: 'text-brand-300',
              desc: 'grep searches text. sort sorts. wc counts. Each tool masters one task rather than trying to do everything. This makes tools reliable, testable, and reusable.',
              example: 'grep "error" | sort | uniq -c | sort -rn',
            },
            {
              rule: 'Work together',
              icon: '🔗',
              color: 'border-accent-cyan/25 bg-accent-cyan/5',
              text: 'text-accent-cyan',
              desc: 'Programs communicate through text streams via pipes. The output of one program becomes the input of the next. No special integration code needed.',
              example: 'ps aux | grep nginx | awk \'{print $2}\'',
            },
            {
              rule: 'Text as universal interface',
              icon: '📄',
              color: 'border-accent-green/25 bg-accent-green/5',
              text: 'text-accent-green',
              desc: 'Configuration is text files. Output is text. Logs are text. Text is human-readable, version-controllable, and processable by every Unix tool.',
              example: '/etc/passwd, /proc/meminfo, logs',
            },
          ].map(r => (
            <div key={r.rule} className={`card p-5 border ${r.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{r.icon}</span>
                <p className={`font-bold text-sm ${r.text}`}>{r.rule}</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{r.desc}</p>
              <code className="text-[11px] font-mono text-slate-500 leading-relaxed">{r.example}</code>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Unix Family Tree</h2>
        <div className="info-card mt-4 overflow-hidden">
          <div className="p-4 font-mono text-xs leading-8 overflow-x-auto">
            <div className="min-w-[520px] space-y-1">
              <div className="text-accent-amber font-bold">1969 — Unix at Bell Labs (Ken Thompson, Dennis Ritchie)</div>
              <div className="ml-4 text-slate-500">├── 1973 Rewritten in C — becomes portable</div>
              <div className="ml-4 text-slate-500">├── 1975 First licensed to universities</div>
              <div className="ml-6 text-accent-cyan">│   └── BSD (Berkeley Software Distribution)</div>
              <div className="ml-8 text-slate-400">├── 4.4BSD (1993) — foundation of modern BSDs</div>
              <div className="ml-10 text-brand-300">├── FreeBSD — servers, PlayStation OS</div>
              <div className="ml-10 text-brand-300">├── OpenBSD — security focus</div>
              <div className="ml-10 text-brand-300">├── NetBSD — maximum portability</div>
              <div className="ml-10 text-accent-green font-bold">└── macOS / iOS (Darwin kernel) ← Apple 2001</div>
              <div className="ml-4 text-slate-500">└── AT&T System V (1983)</div>
              <div className="ml-6 text-slate-400">├── Solaris (Sun/Oracle)</div>
              <div className="ml-6 text-slate-400">├── HP-UX (Hewlett-Packard)</div>
              <div className="ml-6 text-slate-400">└── AIX (IBM)</div>
              <div className="mt-2 text-accent-green font-bold">1991 — Linux (Linus Torvalds) — clean-room reimplementation</div>
              <div className="ml-4 text-slate-400">Not derived from Unix code, but POSIX-compatible</div>
              <div className="ml-4 text-brand-300">→ Ubuntu, Debian, RHEL, Arch, Android...</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2>Everything is a File</h2>
        <p>
          The most powerful Unix abstraction: devices, processes, and system state
          are all exposed as files you can read, write, and manipulate with standard tools.
        </p>
        <CodeBlock title="The 'everything is a file' abstraction in practice" language="bash"
          code={CODE_UNIXPHILOSOPHY_1} />
      </section>

      <section>
        <h2>Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB UNIX-1</span>
            <span className="text-sm font-semibold text-white">Explore Unix Principles on the Ubuntu VM</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~15 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Verify POSIX compliance and check what shell you're running."
              command={CODE_UNIXPHILOSOPHY_2}
              output={CODE_UNIXPHILOSOPHY_3}
            />
            <LabStep number={2}
              description="Practise the Unix philosophy — build a pipeline from single-purpose tools."
              command={CODE_UNIXPHILOSOPHY_4}
              output={CODE_UNIXPHILOSOPHY_5}
            />
            <LabStep number={3}
              description="Explore /proc — the virtual filesystem exposing kernel state."
              command={CODE_UNIXPHILOSOPHY_6}
              output={CODE_UNIXPHILOSOPHY_7}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="unix-01" title="Unix Philosophy & History Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={20} />
      </section>
    </LessonLayout>
  )
}
