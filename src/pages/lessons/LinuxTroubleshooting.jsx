import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_LINUXTROUBLESHOOTING_1 = `# Step 1: Get status and recent logs in one shot
systemctl status nginx

# Step 2: Check full logs
journalctl -u nginx -n 100 --no-pager
journalctl -u nginx --since '10 minutes ago'
journalctl -u nginx -p err

# Step 3: Check if port is already in use (common cause)
ss -tlnp | grep :80
fuser 80/tcp

# Step 4: Test config syntax (nginx example)
nginx -t
# apache2 -t
# sshd -t

# Step 5: Check file permissions
ls -la /etc/nginx/nginx.conf
ls -la /var/log/nginx/

# Step 6: Try starting with verbose output
sudo /usr/sbin/nginx -g 'daemon off;'  # foreground mode`
const CODE_LINUXTROUBLESHOOTING_2 = `# ── CPU ─────────────────────────────────────────────────────
top -b -n 1 | head -20              # One-shot top output
ps aux --sort=-%cpu | head -10       # Top CPU consumers
mpstat -P ALL 1 3                   # Per-CPU utilisation (3 samples)
vmstat 1 5                           # System-wide stats (5 samples)

# ── Memory ───────────────────────────────────────────────────
free -h                             # RAM and swap usage
ps aux --sort=-%mem | head -10       # Top memory consumers
cat /proc/meminfo | grep -E 'MemTotal|MemFree|Cached|SwapUsed'

# ── OOM Killer (Out of Memory) ───────────────────────────────
dmesg | grep -i 'oom\\|killed process'
journalctl -k | grep -i oom

# ── I/O ──────────────────────────────────────────────────────
iostat -xz 1 3                      # Disk I/O per device
iotop -b -n 3                       # I/O by process
df -h && df -ih                     # Space and inodes`
const CODE_LINUXTROUBLESHOOTING_3 = `# ── Find what a process is doing ────────────────────────────
strace -p PID                       # Attach to running process
strace -p PID -e trace=network      # Network calls only
strace -p PID -e trace=file         # File operations only
strace -c -p PID                    # Summary after Ctrl+C

# ── Open files and connections ───────────────────────────────
lsof -p PID                         # All files opened by process
lsof -i :80                         # What is using port 80
lsof -i tcp                         # All TCP connections
lsof /var/log/nginx/error.log       # Who has this file open

# ── Zombie and orphan processes ──────────────────────────────
ps aux | awk '{print $8, $2, $11}' | grep '^Z'  # Zombie processes

# ── Disk space freed by deleted-but-open files ───────────────
lsof | grep '(deleted)'             # Files deleted but still open
lsof | grep '(deleted)' | awk '{print $7, $9}' | sort -rn | head -10
# Fix: restart the service holding the file open`
const CODE_LINUXTROUBLESHOOTING_4 = `# Create a service that fails (wrong path)
sudo tee /etc/systemd/system/broken-app.service << 'EOF'
[Unit]
Description=Broken Test App

[Service]
Type=simple
ExecStart=/opt/nonexistent/app --port 9090
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl start broken-app
sleep 2`
const CODE_LINUXTROUBLESHOOTING_5 = `# Step 1: status
systemctl status broken-app

# Step 2: full journal
journalctl -u broken-app -n 20 --no-pager

# The error should be clear: 'No such file or directory'
# Root cause: ExecStart path does not exist`
const CODE_LINUXTROUBLESHOOTING_6 = `broken-app.service - Broken Test App
  Loaded: loaded (/etc/systemd/system/broken-app.service)
  Active: failed (Result: exit-code)

Jan 15 11:00:00 srv01 systemd[1]: broken-app.service: Control process
  exited, code=exited, status=203/EXEC
Jan 15 11:00:00 srv01 systemd[1]: Failed to start Broken Test App.

Root cause: /opt/nonexistent/app does not exist`
const CODE_LINUXTROUBLESHOOTING_7 = `echo '=== UPTIME ===' && uptime
echo '=== TOP PROCESSES ===' && ps aux --sort=-%cpu | head -5
echo '=== MEMORY ===' && free -h
echo '=== DISK ===' && df -h / /var
echo '=== FAILED SERVICES ===' && systemctl list-units --state=failed
echo '=== RECENT ERRORS ===' && journalctl -p err -b --no-pager | tail -5`
const CODE_LINUXTROUBLESHOOTING_8 = `=== UPTIME ===
 11:00:00 up 4:20,  1 user,  load average: 0.08, 0.04, 0.01
=== MEMORY ===
              total  used  free
Mem:           3.8G  1.2G  2.3G
=== FAILED SERVICES ===
  UNIT              LOAD    ACTIVE  SUB
  broken-app.service loaded  failed  failed`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'A Linux service fails to start. What is the FIRST command to run?',
    options: [
      'tail -f /var/log/syslog',
      'systemctl status servicename',
      'dmesg | tail',
      'ps aux | grep service',
    ],
    correct: 1,
    explanation: 'systemctl status servicename is the single most useful first step — it shows the current state, last exit code, and the last few journal log lines, all in one output. This usually tells you exactly what went wrong. From there you can run journalctl -u servicename -n 50 for more log history.',
  },
  {
    id: 'q2',
    question: 'What does "dmesg | tail -20" show and when is it most useful?',
    options: [
      'The last 20 commands run by the root user',
      'The last 20 lines of kernel ring buffer messages — most useful for hardware issues, driver problems, OOM kills, and filesystem errors',
      'The last 20 login attempts on the system',
      'A list of the 20 most recently modified system files',
    ],
    correct: 1,
    explanation: 'dmesg shows the kernel ring buffer — messages from the kernel itself, including hardware detection, driver loading, OOM (Out of Memory) killer events, filesystem errors, NIC issues, and USB events. It is essential for diagnosing hardware problems, kernel panics, memory pressure, and I/O errors. Add --human for readable timestamps: dmesg --human | tail -20.',
  },
  {
    id: 'q3',
    question: 'A process is using 100% CPU and the system is slow. Which command helps identify WHAT the process is waiting for or doing?',
    options: [
      'ps aux | grep process',
      'strace -p PID',
      'kill -9 PID',
      'nice -n 19 PID',
    ],
    correct: 1,
    explanation: 'strace -p PID attaches to a running process and shows every system call it makes — file opens, network connections, memory operations. This reveals what the process is actually doing: stuck on a file read, waiting for a network response, looping on a system call, etc. Essential for debugging processes that are consuming CPU without an obvious reason.',
  },
  {
    id: 'q4',
    question: 'What does "lsof -i :80" show?',
    options: [
      'All processes that have ever used port 80',
      'All currently open files and network connections on port 80',
      'The firewall rules for port 80',
      'The HTTP server configuration for port 80',
    ],
    correct: 1,
    explanation: 'lsof (List Open Files) -i :80 lists all processes that have a network connection or listener on port 80. In Linux, everything is a file — including network sockets. lsof -i shows all network files. lsof -i :80 filters to port 80. This tells you which process is listening on a port (or using it for a connection). Combined with: lsof -p PID (all files by process) or lsof /path/to/file (who has this file open).',
  },
  {
    id: 'q5',
    question: 'A server is running out of disk space but "df -h" shows plenty of free space. What is the likely cause?',
    options: [
      'df -h is broken and cannot be trusted',
      'Deleted files still held open by processes — space is not freed until processes close them; also check inode exhaustion with df -ih',
      'The disk is corrupted and needs fsck',
      'The /proc filesystem is consuming all available inodes',
    ],
    correct: 1,
    explanation: 'When a file is deleted in Linux, the space is not freed until all file descriptors pointing to it are closed. If a log process has a file open, you can delete the filename but the process still holds the inode and space. Find them with: lsof | grep deleted. Restart the relevant service to release the space. Also check inodes: df -ih — it\'s possible to run out of inodes (file slots) while having free disk space.',
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

export default function LinuxTroubleshooting() {
  return (
    <LessonLayout
      lessonId="trouble-03"
      courseId="troubleshooting"
      title="Linux Troubleshooting"
      courseTitle="Troubleshooting"
      courseHref="/troubleshooting"
      xp={80}
      readTime="~35 min"
      icon="🐧"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Troubleshooting', href: '/troubleshooting' },
        { label: 'Linux Troubleshooting' },
      ]}
      prev={{ title: 'Windows Troubleshooting', href: '/troubleshooting/windows' }}
      next={{ title: 'Network Troubleshooting',  href: '/troubleshooting/networking' }}
      objectives={[
        'Diagnose service failures with systemctl and journalctl',
        'Use dmesg to find kernel and hardware issues',
        'Identify CPU, memory, and disk bottlenecks',
        'Find and kill rogue processes',
        'Trace system calls with strace for deep debugging',
        'Diagnose disk space issues including deleted-but-open files',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Linux gives you extraordinary visibility into what the system is doing — if you
          know where to look. The tools in this lesson cover the full diagnostic stack:
          from fast first-response commands you run in the first 60 seconds of an incident,
          to deep-dive tools for complex root cause analysis.
        </p>
        <Callout type="info" icon="⏱️" title="First 60 seconds on a slow Linux server">
          Run these in order: uptime, dmesg | tail, vmstat 1 5, mpstat -P ALL 1 3, pidstat 1 3, iostat -xz 1 3, free -m, sar -n DEV 1 1, sar -n TCP,ETCP 1 1, top
        </Callout>
      </section>

      <section>
        <h2>Service Failure Diagnosis</h2>
        <CodeBlock title="Service troubleshooting workflow" language="bash"
          code={CODE_LINUXTROUBLESHOOTING_1} />
      </section>

      <section>
        <h2>CPU & Memory Analysis</h2>
        <CodeBlock title="Performance diagnosis toolkit" language="bash"
          code={CODE_LINUXTROUBLESHOOTING_2} />
      </section>

      <section>
        <h2>Process & File Investigation</h2>
        <CodeBlock title="strace, lsof, and process tools" language="bash"
          code={CODE_LINUXTROUBLESHOOTING_3} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB TROUBLE-3</span>
            <span className="text-sm font-semibold text-white">Diagnose a Broken Service on Ubuntu Server</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Create a deliberately broken service to practice diagnosing."
              command={CODE_LINUXTROUBLESHOOTING_4}
            />
            <LabStep number={2}
              description="Apply the diagnosis workflow to find the root cause."
              command={CODE_LINUXTROUBLESHOOTING_5}
              output={CODE_LINUXTROUBLESHOOTING_6}
            />
            <LabStep number={3}
              description="Run the full 60-second checklist to capture a system snapshot."
              command={CODE_LINUXTROUBLESHOOTING_7}
              output={CODE_LINUXTROUBLESHOOTING_8}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="trouble-03" title="Linux Troubleshooting Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={40} />
      </section>
    </LessonLayout>
  )
}
