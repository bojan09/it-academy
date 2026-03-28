import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_LINUXSHELL_1 = `# ── Where am I / What's here ────────────────────────────────
pwd                   # Print Working Directory
ls                    # List files
ls -la                # Long format, show hidden files (-a), all details (-l)
ls -lah               # Same + human-readable sizes
ls -lt                # Sort by modification time (newest first)
tree -L 2             # Directory tree, 2 levels deep

# ── Moving around ────────────────────────────────────────────
cd /var/log           # Absolute path
cd ../..              # Go up two levels
cd ~                  # Home directory
cd -                  # Previous directory (toggle)
cd /etc && ls         # Chain commands with &&

# ── File inspection ──────────────────────────────────────────
cat /etc/os-release   # Print entire file
less /var/log/syslog  # Paginated viewer (q to quit, /search to find)
head -20 /var/log/syslog   # First 20 lines
tail -20 /var/log/syslog   # Last 20 lines
tail -f /var/log/syslog    # Follow live log output
file /bin/bash        # Identify file type
stat /etc/passwd      # Full metadata (size, permissions, timestamps)
wc -l /etc/passwd     # Count lines`
const CODE_LINUXSHELL_2 = `# ── Pipes ───────────────────────────────────────────────────
ls -la | grep ".log"              # Filter ls output
ps aux | grep nginx               # Find nginx processes
cat /etc/passwd | cut -d: -f1     # Extract usernames
journalctl | tail -100 | grep -i error

# ── Redirection ──────────────────────────────────────────────
echo "hello" > /tmp/test.txt      # Overwrite (or create)
echo "world" >> /tmp/test.txt     # Append
cat /etc/nonexistent 2> /tmp/errors.txt    # Redirect stderr only
ls /etc/ > /tmp/out.txt 2>&1      # Redirect both stdout + stderr
command > /dev/null 2>&1          # Silence all output completely

# ── Combining ────────────────────────────────────────────────
grep -r "FAILED" /var/log/ 2>/dev/null | sort | uniq -c | sort -rn | head -10
# Read: search logs → sort → count duplicates → sort by count → top 10`
const CODE_LINUXSHELL_3 = `# Basic grep
grep "error" /var/log/syslog              # Lines containing "error"
grep -i "error" /var/log/syslog           # Case-insensitive
grep -n "error" /var/log/syslog           # Show line numbers
grep -v "info"  /var/log/syslog           # Invert — exclude matching lines
grep -c "error" /var/log/syslog           # Count matching lines
grep -l "error" /var/log/*.log            # List files with matches only
grep -r "password" /etc/ 2>/dev/null      # Recursive search

# Extended regex
grep -E "error|warning|critical" /var/log/syslog    # OR pattern
grep -E "^Jan 15" /var/log/syslog          # Lines starting with "Jan 15"
grep -E "\\b[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\b" file  # IP addresses`
const CODE_LINUXSHELL_4 = `# Find by name
find /etc -name "*.conf"                    # All .conf files in /etc
find /var/log -name "*.log" -type f         # Only files, not dirs
find / -name "sshd_config" 2>/dev/null      # Anywhere on disk

# Find by time
find /var/log -mtime -1                     # Modified in last 24 hours
find /tmp -mtime +7 -delete                 # Delete files older than 7 days

# Find by size
find / -size +100M -type f 2>/dev/null      # Files larger than 100 MB
find /home -size +1G -type f                # Users with large files

# Find by permissions (security auditing)
find / -perm -4000 -type f 2>/dev/null      # SUID binaries
find /etc -perm -o+w 2>/dev/null            # World-writable config files

# Execute command on results
find /tmp -name "*.log" -exec rm {} \\;      # Delete all .log in /tmp
find /var/log -name "*.log" -exec ls -lh {} \\;   # Show sizes`
const CODE_LINUXSHELL_5 = `# ── sort ───────────────────────────────────────────────────
sort /etc/passwd                  # Alphabetically
sort -n numbers.txt               # Numerically
sort -r file.txt                  # Reverse
sort -k3 -n /etc/passwd           # Sort by 3rd field numerically
sort -u file.txt                  # Sort + deduplicate

# ── cut ─────────────────────────────────────────────────────
cut -d: -f1 /etc/passwd           # 1st field, delimiter ":"
cut -d, -f2,4 data.csv            # 2nd and 4th CSV fields
cut -c1-10 file.txt               # First 10 characters per line

# ── uniq ────────────────────────────────────────────────────
sort file.txt | uniq              # Remove duplicates (must sort first)
sort file.txt | uniq -c           # Count occurrences
sort file.txt | uniq -d           # Show only duplicates

# ── wc ──────────────────────────────────────────────────────
wc -l /etc/passwd                 # Line count
wc -w file.txt                    # Word count
ls /etc/*.conf | wc -l            # Count .conf files

# ── awk ─────────────────────────────────────────────────────
awk '{print $1}' /var/log/nginx/access.log    # Print first field (IP)
awk -F: '{print $1, $3}' /etc/passwd          # Username + UID
awk '/error/ {print $0}' /var/log/syslog      # Lines matching "error"
awk '{sum += $1} END {print sum}' numbers.txt # Sum a column

# ── sed ─────────────────────────────────────────────────────
sed 's/old/new/g' file.txt        # Replace globally (stdout only)
sed -i 's/old/new/g' file.txt     # Replace in-place
sed -n '10,20p' file.txt          # Print lines 10-20
sed '/^#/d' /etc/ssh/sshd_config  # Delete comment lines

# ── xargs ───────────────────────────────────────────────────
find /tmp -name "*.tmp" | xargs rm -f           # Delete found files
cat servers.txt | xargs -I{} ping -c 1 {}       # Ping each server`
const CODE_LINUXSHELL_6 = `#!/bin/bash
# Always start with a shebang

# ── Variables ───────────────────────────────────────────────
NAME="DC01"
PORT=22
LOGDIR="/var/log"
TODAY=$(date +%Y-%m-%d)     # Command substitution
FILES=$(ls $LOGDIR | wc -l) # Count files

echo "Server: $NAME"
echo "Log files today ($TODAY): $FILES"

# ── Conditionals ────────────────────────────────────────────
if ping -c 1 -W 1 192.168.100.10 &>/dev/null; then
    echo "DC01 is reachable"
else
    echo "DC01 is unreachable — check the network"
    exit 1
fi

# File tests
if [ -f "/etc/ssh/sshd_config" ]; then
    echo "SSH config exists"
fi

if [ ! -d "/var/backups" ]; then
    mkdir -p /var/backups
    echo "Created backup directory"
fi

# ── Loops ────────────────────────────────────────────────────
SERVERS=("192.168.100.10" "192.168.100.20" "192.168.100.30")
for SERVER in "$SERVERS[@]"; do
    if ping -c 1 -W 1 "$SERVER" &>/dev/null; then
        echo "✔ $SERVER online"
    else
        echo "✗ $SERVER UNREACHABLE"
    fi
done

# While loop — wait for a service to start
while ! systemctl is-active --quiet nginx; do
    echo "Waiting for nginx..."
    sleep 2
done
echo "nginx is running"

# ── Functions ────────────────────────────────────────────────
check_port() {
    local HOST=$1
    local PORT=$2
    if nc -zw2 "$HOST" "$PORT" 2>/dev/null; then
        echo "✔ $HOST:$PORT open"
    else
        echo "✗ $HOST:$PORT closed/filtered"
    fi
}

check_port 192.168.100.10 22
check_port 192.168.100.10 389`
const CODE_LINUXSHELL_7 = `# Find the top 5 largest files in /var
find /var -type f -printf '%s %p\\
' 2>/dev/null | sort -rn | head -5

# Count unique IPs in the auth log (who's been connecting?)
grep "Accepted\\|Failed" /var/log/auth.log 2>/dev/null |
  grep -oE "[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}" |
  sort | uniq -c | sort -rn | head -10`
const CODE_LINUXSHELL_8 = `cat > ~/health-check.sh << 'EOF'
#!/bin/bash
# health-check.sh — Lab network health checker

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOGFILE="/tmp/health-check-$(date +%Y%m%d).log"
SERVERS=("192.168.100.10:DC01" "192.168.100.20:SRV01")

echo "=== Health Check: $TIMESTAMP ===" | tee -a "$LOGFILE"

for ENTRY in "$SERVERS[@]"; do
    IP="\${ENTRY%%:*}"
    NAME="\${ENTRY##*:}"

    if ping -c 1 -W 2 "$IP" &>/dev/null; then
        STATUS="✔ ONLINE"
    else
        STATUS="✗ OFFLINE"
    fi

    echo "[$STATUS] $NAME ($IP)" | tee -a "$LOGFILE"
done

echo "Report saved: $LOGFILE"
EOF

chmod +x ~/health-check.sh
~/health-check.sh`
const CODE_LINUXSHELL_9 = `=== Health Check: 2025-01-15 11:00:00 ===
[✔ ONLINE]  DC01 (192.168.100.10)
[✗ OFFLINE] SRV01 (192.168.100.20)  ← Not deployed yet
Report saved: /tmp/health-check-20250115.log`
const CODE_LINUXSHELL_10 = `# Generate some test log data
for i in {1..20}; do
    echo "2025-01-15 $i:00:00 INFO Service started" >> /tmp/test.log
    [ $((i % 3)) -eq 0 ] && echo "2025-01-15 $i:00:01 ERROR Connection failed" >> /tmp/test.log
    [ $((i % 5)) -eq 0 ] && echo "2025-01-15 $i:00:02 WARN Disk usage high" >> /tmp/test.log
done

# Summarise log levels
echo "Log Summary:"
for LEVEL in INFO ERROR WARN; do
    COUNT=$(grep -c "$LEVEL" /tmp/test.log)
    echo "  $LEVEL: $COUNT"
done`
const CODE_LINUXSHELL_11 = `Log Summary:
  INFO: 20
  ERROR: 6
  WARN: 4`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What does the pipe operator (|) do in bash?',
    options: [
      'Runs two commands in parallel',
      'Sends the stdout of the left command as stdin to the right command',
      'Redirects output to a file',
      'Runs the second command only if the first fails',
    ],
    correct: 1,
    explanation: 'The pipe | passes the standard output (stdout) of the left command as standard input (stdin) to the right command. For example: ls -la | grep ".log" — ls produces output, grep filters it. Pipes are how you chain commands together to build complex data processing pipelines from simple tools.',
  },
  {
    id: 'q2',
    question: 'What is the difference between > and >> when redirecting output?',
    options: [
      '> appends to a file; >> creates a new file',
      '> overwrites (truncates) the file; >> appends to the end without truncating',
      '> redirects stderr; >> redirects stdout',
      'There is no difference — both append to files',
    ],
    correct: 1,
    explanation: '> redirects stdout to a file, overwriting (truncating) it completely if it exists. >> redirects stdout to a file, appending to the end if it exists. For log files you almost always want >>. Accidental use of > instead of >> on a log file will destroy its contents.',
  },
  {
    id: 'q3',
    question: 'What does "grep -r \'error\' /var/log/" do?',
    options: [
      'Counts the number of files containing "error" in /var/log/',
      'Searches recursively through all files in /var/log/ for lines containing "error"',
      'Removes all files named "error" from /var/log/',
      'Lists files in /var/log/ that were modified recently',
    ],
    correct: 1,
    explanation: 'grep searches files for matching patterns. -r (recursive) makes it descend into subdirectories. So grep -r "error" /var/log/ searches every file in /var/log/ and all its subdirectories for lines containing "error". Very useful for log analysis. Add -i for case-insensitive, -l to list filenames only, -n to show line numbers.',
  },
  {
    id: 'q4',
    question: 'What does $? contain in bash?',
    options: [
      'The current process ID',
      'The exit code (return status) of the last executed command',
      'The current user\'s home directory',
      'The number of arguments passed to the current script',
    ],
    correct: 1,
    explanation: '$? holds the exit status of the last command. 0 means success; any non-zero value means failure (the specific value often indicates the error type). This is used in scripts to check if a command succeeded: if [ $? -eq 0 ]; then echo "success"; fi. Or more idiomatically: if command; then echo "success"; fi.',
  },
  {
    id: 'q5',
    question: 'Which command shows the last 50 lines of a log file AND follows new lines as they are written?',
    options: ['cat -n 50 /var/log/syslog', 'tail -f -n 50 /var/log/syslog', 'head -50f /var/log/syslog', 'less +50F /var/log/syslog'],
    correct: 1,
    explanation: 'tail -f -n 50 /var/log/syslog: -n 50 shows the last 50 lines, -f follows the file (keeps the terminal open and prints new lines as they arrive). This is the standard way to monitor a live log. Ctrl+C to stop. less +F is an alternative that lets you scroll up while still following. tail -f is the most common.',
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

export default function LinuxShell() {
  return (
    <LessonLayout
      lessonId="linux-02"
      courseId="linux"
      title="Shell Basics & Command Line"
      courseTitle="Linux Fundamentals"
      courseHref="/linux"
      xp={60}
      readTime="~25 min"
      icon="🖥️"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Linux Fundamentals', href: '/linux' },
        { label: 'Shell Basics & Command Line' },
      ]}
      prev={{ title: 'Linux File System Hierarchy', href: '/linux/filesystem' }}
      next={{ title: 'Users, Groups & Permissions',  href: '/linux/permissions' }}
      objectives={[
        'Navigate the filesystem with confidence using cd, ls, and pwd',
        'Understand stdin, stdout, and stderr — the three standard streams',
        'Use pipes and redirection to build command pipelines',
        'Search files and text with grep, find, and awk',
        'Master essential text processing tools: sort, cut, uniq, wc',
        'Write and run your first bash script',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          The Linux shell is your primary interface to the operating system. Mastery of the
          command line is what separates a sysadmin who needs a GUI for everything from one
          who can configure, automate, and troubleshoot any system — including headless
          servers with no graphical interface at all.
        </p>
        <p className="mt-4">
          This lesson covers the core building blocks: navigation, the three standard data
          streams, pipes, redirection, and the essential text processing tools that form
          the foundation of every shell script you'll ever write.
        </p>
        <Callout type="info" icon="💡" title="The Unix philosophy">
          Every command does one thing well. Chain them with pipes. This lets you build
          enormously powerful data processing pipelines from small, reliable tools.
        </Callout>
      </section>

      {/* ── NAVIGATION ── */}
      <section>
        <h2>Navigation & Essential Commands</h2>
        <CodeBlock title="Filesystem navigation" language="bash" code={CODE_LINUXSHELL_1} />
      </section>

      {/* ── STREAMS, PIPES, REDIRECTION ── */}
      <section>
        <h2>Standard Streams, Pipes & Redirection</h2>
        <p>Every Linux process has three standard data streams:</p>
        <div className="grid sm:grid-cols-3 gap-3 mt-4 mb-5">
          {[
            { id: '0', name: 'stdin',  icon: '⌨️', color: 'text-brand-300',   desc: 'Standard Input — data fed into a command. Default: keyboard.' },
            { id: '1', name: 'stdout', icon: '📤', color: 'text-accent-green', desc: 'Standard Output — normal command output. Default: terminal.' },
            { id: '2', name: 'stderr', icon: '⚠️', color: 'text-accent-red',   desc: 'Standard Error — error messages. Default: terminal (separate from stdout).' },
          ].map(s => (
            <div key={s.id} className="info-card py-4">
              <div className="flex items-center gap-2 mb-2">
                <code className={`font-mono text-lg font-black ${s.color}`}>{s.id}</code>
                <span className="text-xl">{s.icon}</span>
                <code className={`font-mono text-sm font-bold ${s.color}`}>{s.name}</code>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <CodeBlock title="Pipes and redirection" language="bash" code={CODE_LINUXSHELL_2} />
      </section>

      {/* ── GREP AND FIND ── */}
      <section>
        <h2>grep, find, and Text Processing</h2>
        <CodeBlock title="grep — searching text content" language="bash" code={CODE_LINUXSHELL_3} />

        <CodeBlock className="mt-4" title="find — searching by file attributes" language="bash" code={CODE_LINUXSHELL_4} />
      </section>

      {/* ── ESSENTIAL TOOLS ── */}
      <section>
        <h2>Essential Text Processing Tools</h2>
        <CodeBlock title="sort, cut, uniq, awk, sed, xargs" language="bash" code={CODE_LINUXSHELL_5} />
      </section>

      {/* ── VARIABLES AND SCRIPTS ── */}
      <section>
        <h2>Variables & Your First Script</h2>
        <CodeBlock title="bash-essentials.sh — variables, conditions, loops" language="bash" code={CODE_LINUXSHELL_6} />
      </section>

      {/* ── VMware LAB ── */}
      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB LINUX-2</span>
            <span className="text-sm font-semibold text-white">Build a Multi-Server Health Check Script</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Warm up with piped command chains to analyse the system."
              command={CODE_LINUXSHELL_7}
            />
            <LabStep number={2}
              description="Write a health check script that tests connectivity to DC01."
              command={CODE_LINUXSHELL_8}
              output={CODE_LINUXSHELL_9}
            />
            <LabStep number={3}
              description="Use grep and awk to parse a log file and produce a summary."
              command={CODE_LINUXSHELL_10}
              output={CODE_LINUXSHELL_11}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="linux-02" title="Shell Basics Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={30} />
      </section>
    </LessonLayout>
  )
}
