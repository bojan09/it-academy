import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_TROUBLESHOOTINGPERFORMANCE_1 = `# ── Load average ────────────────────────────────────────────
# uptime output: load average: 1.2, 0.8, 0.5
# Values: 1min, 5min, 15min load averages
# On a 4-core system: load of 4.0 = fully loaded (all cores busy)
# load > number_of_cores = CPU queue building up
uptime
nproc     # How many CPUs/cores?

# ── Real-time CPU breakdown ──────────────────────────────────
# In top, press '1' to show per-CPU stats
# Key columns:
#   us  — user space (your applications)
#   sy  — kernel/system calls
#   wa  — iowait (waiting for disk)
#   hi  — hardware interrupt handling
#   si  — software interrupt handling
top -b -n 1 -d 1 | head -15

# ── Per-CPU utilisation ───────────────────────────────────────
mpstat -P ALL 1 3

# ── Top CPU consumers ────────────────────────────────────────
ps aux --sort=-%cpu | head -10
pidstat -u 1 5   # Per-process CPU over 5 seconds

# ── System-wide stats (vmstat) ───────────────────────────────
# vmstat 1 5  — 5 samples, 1 second apart
# b = blocked processes, wa = iowait, cs = context switches
vmstat 1 5`
const CODE_TROUBLESHOOTINGPERFORMANCE_2 = `# ── Memory overview ─────────────────────────────────────────
free -h
# KEY: look at 'available' column, not 'free'
# 'free' excludes page cache; 'available' is what apps can actually use

# ── Detailed breakdown ───────────────────────────────────────
cat /proc/meminfo | grep -E 'MemTotal|MemFree|MemAvail|Cached|SwapTotal|SwapFree|Dirty'

# ── Top memory consumers ─────────────────────────────────────
ps aux --sort=-%mem | head -10
ps aux | awk '{print $6/1024, $11}' | sort -n | tail -10  # RSS in MB

# ── Swap activity (should be near zero on healthy system) ────
vmstat 1 5 | awk '{print $7, $8}'  # si=swap-in, so=swap-out
# Non-zero si/so = swapping is happening = memory pressure

# ── OOM killer events ────────────────────────────────────────
dmesg | grep -i 'oom\\|out of memory\\|kill process'
journalctl -k | grep -i oom`
const CODE_TROUBLESHOOTINGPERFORMANCE_3 = `# ── Basic I/O stats ─────────────────────────────────────────
iostat -x 1 5
# Key column: %util — if near 100%, disk is saturated
# await: average time per I/O request (ms) — if >20ms for HDD, >5ms for SSD = slow
# r/s, w/s: read/write IOPS

# ── Per-process I/O ──────────────────────────────────────────
sudo iotop -b -n 3 -o    # Show only processes doing I/O

# ── Disk health check ────────────────────────────────────────
sudo smartctl -H /dev/sda
sudo smartctl -a /dev/sda | grep -E 'Reallocated|Pending|Uncorrectable'

# ── Find what is filling up disk ─────────────────────────────
df -h                                        # Filesystem level
sudo du -sh /var/log/* | sort -rh | head -10  # What's in /var/log
sudo du -sh /* 2>/dev/null | sort -rh | head -10  # Top-level dirs

# ── Check for deleted-but-open files (space not freed) ───────
sudo lsof | grep deleted | awk '{print $7, $9}' | sort -rn | head`
const CODE_TROUBLESHOOTINGPERFORMANCE_4 = `echo '=== LOAD AVERAGE ==='
uptime

echo '=== CPU (5 samples) ==='
vmstat 1 3 | tail -1

echo '=== MEMORY ==='
free -h | grep -E 'Mem|Swap'

echo '=== DISK USAGE ==='
df -h | grep -v tmpfs

echo '=== TOP 5 CPU PROCS ==='
ps aux --sort=-%cpu | awk 'NR<=6{printf "%-20s %5s\\
", $11, $3}'

echo '=== TOP 5 MEM PROCS ==='
ps aux --sort=-%mem | awk 'NR<=6{printf "%-20s %5s\\
", $11, $4}'`
const CODE_TROUBLESHOOTINGPERFORMANCE_5 = `=== LOAD AVERAGE ===
 11:00:00 up 4:20, 1 user, load average: 0.08, 0.05, 0.01

=== CPU (5 samples) ===
 0  0  0  0  3 97  0  0  0  0
                          ^-- 97% idle, healthy

=== MEMORY ===
Mem:   3.8G   1.2G   2.3G   0B   293M   2.4G
Swap:  2.0G     0B   2.0G   <- no swap used, healthy

=== DISK USAGE ===
Filesystem  Size  Used  Avail  Use%  Mounted on
/dev/sda1   40G   6.1G   32G   16%   /`
const CODE_TROUBLESHOOTINGPERFORMANCE_6 = `# Start CPU load in background (uses 1 core at ~100%)
python3 -c 'while True: pass' &
LOAD_PID=$!

# Wait 3 seconds then check
sleep 3
uptime
ps aux --sort=-%cpu | head -3

# Stop the load
kill $LOAD_PID
echo 'Load stopped'
uptime`
const CODE_TROUBLESHOOTINGPERFORMANCE_7 = `load average: 0.85, 0.22, 0.07  <- load jumped
USER  PID  %CPU  COMMAND
root  9876  99.8  python3   <- our artificial load`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'A server shows 95% CPU but "top" shows no process using more than 2%. What is the most likely cause?',
    options: [
      'The CPU monitoring tool is broken',
      'Many processes each using small amounts of CPU — high context switching overhead, or CPU time is spent in kernel/interrupt handling (visible in %sy and %hi in top)',
      'The system is running malware that hides from top',
      'CPU throttling is limiting individual process CPU usage',
    ],
    correct: 1,
    explanation: 'top shows per-process CPU as a percentage of ONE core. If a system has 8 cores at 95% but no process shows >2%, the load is spread across many processes/threads. Check: vmstat 1 showing high "sy" (system/kernel time) indicates system call overhead; high "in" (interrupts) suggests NIC or disk interrupt flooding; many processes in "R" state (runnable) shows CPU contention. Also check: ps aux | awk "{sum += $3} END {print sum}" for total CPU.',
  },
  {
    id: 'q2',
    question: 'What does a high "iowait" percentage in top/vmstat indicate?',
    options: [
      'The network is saturated with I/O requests',
      'CPUs are idle while waiting for disk I/O to complete — the disk is the bottleneck, not the CPU or applications',
      'Too many processes are waiting for network I/O',
      'The filesystem is full and writes are failing',
    ],
    correct: 1,
    explanation: 'iowait shows CPU time spent idle while the kernel is waiting for outstanding I/O requests. High iowait (>20%) means the disk is slow relative to demand. The CPU is not busy — it\'s literally waiting for disk. Diagnose with: iostat -x 1 (check %util — if near 100%, disk is saturated), iotop (which processes are doing the I/O), and check disk health with smartctl.',
  },
  {
    id: 'q3',
    question: 'What is swap thrashing and what are its symptoms?',
    options: [
      'A disk encryption failure causing random write errors',
      'When a system continuously moves data between RAM and swap because RAM is exhausted — symptoms: extreme slowness, high disk I/O, near-zero free memory, constant swap activity',
      'When multiple processes compete for the same swap space',
      'A kernel bug causing swap space to be allocated incorrectly',
    ],
    correct: 1,
    explanation: 'Swap thrashing (also called "thrashing") occurs when physical RAM is exhausted and the system must constantly swap pages to/from disk. Since disk is 1000x+ slower than RAM, the system spends most of its time doing swap I/O rather than useful work. Symptoms: system appears almost frozen, disk light constantly on, top shows high iowait, free -m shows near-zero free memory and active swap. Solutions: add RAM, reduce workload, find the memory-leaking process and fix/restart it.',
  },
  {
    id: 'q4',
    question: 'A Linux server has 16GB RAM with 8GB used. Applications are slow but there is plenty of free memory. What should you check?',
    options: [
      'The applications must have memory leaks',
      'Check if memory is heavily fragmented or if transparent huge pages are disabled, causing many small page allocations',
      'The "free" memory shown may actually be used by page cache — check what "available" memory shows, and look for memory-intensive processes with high virtual memory (VSZ)',
      'Increase the swap space to improve performance',
    ],
    correct: 2,
    explanation: 'Linux "free" memory is misleading — the kernel aggressively uses "free" RAM for page cache (recent file I/O). The "available" column in free -h is what actually matters — it shows RAM that can be given to applications immediately. "Used" includes page cache. If "available" is high but apps are slow, the bottleneck is something else: CPU, network, database queries, or application code. Use free -h, not just free memory.',
  },
  {
    id: 'q5',
    question: 'What is the correct tool to identify which process is consuming the most network bandwidth?',
    options: [
      'netstat -an | sort',
      'iftop or nethogs — iftop shows per-connection bandwidth, nethogs shows per-process bandwidth usage',
      'ping with large packet sizes',
      'tcpdump counting packet sizes',
    ],
    correct: 1,
    explanation: 'iftop shows real-time bandwidth per network connection (source/destination pairs). nethogs shows bandwidth per process — much more useful for finding which application is consuming bandwidth. Neither is installed by default: apt install iftop nethogs. Alternative: ss -s for socket statistics, or check /proc/net/dev for interface statistics over time.',
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

export default function TroubleshootingPerformance() {
  return (
    <LessonLayout
      lessonId="trouble-06"
      courseId="troubleshooting"
      title="Performance & Capacity Issues"
      courseTitle="Troubleshooting"
      courseHref="/troubleshooting"
      xp={80}
      readTime="~35 min"
      icon="📈"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Troubleshooting', href: '/troubleshooting' },
        { label: 'Performance & Capacity Issues' },
      ]}
      prev={{ title: 'Active Directory Issues', href: '/troubleshooting/active-directory' }}
      next={null}
      objectives={[
        'Identify CPU bottlenecks using top, vmstat, and mpstat',
        'Diagnose memory pressure and swap thrashing',
        'Find disk I/O bottlenecks with iostat and iotop',
        'Identify network bandwidth consumers with iftop and nethogs',
        'Read and interpret load average correctly',
        'Build a capacity baseline to detect degradation over time',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          "The server is slow" is the most common — and most vague — complaint in
          IT operations. Performance troubleshooting requires systematically measuring
          each resource category until you find the bottleneck. CPU, memory, disk I/O,
          and network are the four dimensions; the one that is saturated is your
          constraint.
        </p>
        <Callout type="info" icon="🎯" title="The universal bottleneck principle">
          A system can only be bottlenecked by one resource at a time. Find which
          resource is at or near 100% utilisation — that is your constraint. Everything
          else is a symptom, not the cause.
        </Callout>
      </section>

      <section>
        <h2>CPU Performance Analysis</h2>
        <CodeBlock title="CPU diagnosis toolkit" language="bash"
          code={CODE_TROUBLESHOOTINGPERFORMANCE_1} />
      </section>

      <section>
        <h2>Memory Analysis</h2>
        <CodeBlock title="Memory diagnosis — free, /proc/meminfo, smem" language="bash"
          code={CODE_TROUBLESHOOTINGPERFORMANCE_2} />
      </section>

      <section>
        <h2>Disk I/O Analysis</h2>
        <CodeBlock title="Disk performance with iostat and iotop" language="bash"
          code={CODE_TROUBLESHOOTINGPERFORMANCE_3} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB TROUBLE-6</span>
            <span className="text-sm font-semibold text-white">Build a Performance Baseline and Detect Degradation</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Run the full performance snapshot — the 60-second checklist."
              command={CODE_TROUBLESHOOTINGPERFORMANCE_4}
              output={CODE_TROUBLESHOOTINGPERFORMANCE_5}
            />
            <LabStep number={2}
              description="Simulate CPU load and observe the metrics change in real time."
              command={CODE_TROUBLESHOOTINGPERFORMANCE_6}
              output={CODE_TROUBLESHOOTINGPERFORMANCE_7}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to complete the Troubleshooting course.</p>
        <Quiz lessonId="trouble-06" title="Performance & Capacity Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={40} />
      </section>
    </LessonLayout>
  )
}
