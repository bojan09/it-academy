import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_PYTHONSUBPROCESS_1 = `import subprocess

# ── Basic execution ──────────────────────────────────────────
# Run and wait — capture output as strings
result = subprocess.run(
    ['systemctl', 'status', 'nginx'],
    capture_output=True,   # capture stdout + stderr
    text=True,             # decode bytes to str
    check=False            # don't raise on non-zero exit
)
print(result.stdout)
print(result.returncode)   # 0 = running, 3 = stopped

# ── Raise on failure ─────────────────────────────────────────
try:
    result = subprocess.run(
        ['systemctl', 'restart', 'nginx'],
        capture_output=True, text=True, check=True
    )
    print('nginx restarted successfully')
except subprocess.CalledProcessError as e:
    print(f'Failed (exit {e.returncode}): {e.stderr}')

# ── Timeout ──────────────────────────────────────────────────
try:
    result = subprocess.run(
        ['ping', '-c', '1', '-W', '2', '192.168.100.10'],
        capture_output=True, text=True, timeout=5
    )
    online = result.returncode == 0
except subprocess.TimeoutExpired:
    online = False

# ── Write to stdin ────────────────────────────────────────────
result = subprocess.run(
    ['grep', '-i', 'error'],
    input='line 1\\
ERROR: something failed\\
line 3\\
',
    capture_output=True, text=True
)
print(result.stdout)   # 'ERROR: something failed\\
'`
const CODE_PYTHONSUBPROCESS_2 = `import subprocess, re

def get_disk_usage():
    """Parse df output into structured data."""
    result = subprocess.run(
        ['df', '-h', '--output=source,size,used,avail,pcent,target'],
        capture_output=True, text=True, check=True
    )
    filesystems = []
    lines = result.stdout.strip().split('\\
')[1:]  # skip header
    for line in lines:
        parts = line.split()
        if len(parts) == 6:
            filesystems.append({
                'device':  parts[0],
                'size':    parts[1],
                'used':    parts[2],
                'avail':   parts[3],
                'percent': int(parts[4].rstrip('%')),
                'mount':   parts[5],
            })
    return filesystems

def get_failed_services():
    """List failed systemd services."""
    result = subprocess.run(
        ['systemctl', 'list-units', '--state=failed', '--no-legend', '--no-pager'],
        capture_output=True, text=True
    )
    failed = []
    for line in result.stdout.strip().split('\\
'):
        if line.strip():
            parts = line.split()
            if parts:
                failed.append(parts[0])
    return failed

# Use them
for fs in get_disk_usage():
    if fs['percent'] > 80:
        print(f"WARNING: {fs['mount']} is {fs['percent']}% full")

failed = get_failed_services()
if failed:
    print(f"Failed services: {', '.join(failed)}")`
const CODE_PYTHONSUBPROCESS_3 = `import subprocess, sys

def run_with_live_output(cmd, desc=''):
    """Run a command and print output as it arrives."""
    if desc:
        print(f'>>> {desc}')
    
    with subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,  # merge stderr into stdout
        text=True,
        bufsize=1                   # line-buffered
    ) as proc:
        for line in proc.stdout:
            print(line, end='', flush=True)
        proc.wait()
        return proc.returncode

# Example: stream apt upgrade output
rc = run_with_live_output(
    ['apt', 'upgrade', '-y'],
    desc='Running system upgrade'
)
print(f'Exit code: {rc}')

# Example: stream a long backup operation
rc = run_with_live_output(
    ['tar', '-czv', '-f', '/backup/home.tar.gz', '/home/'],
    desc='Creating backup'
)`
const CODE_PYTHONSUBPROCESS_4 = `cat > ~/server-health.py << 'EOF'
#!/usr/bin/env python3
"""server-health.py — Check health of lab servers using subprocess."""
import subprocess, json
from datetime import datetime

SERVERS = ['192.168.100.10', '192.168.100.20']

def ping(host, count=1):
    result = subprocess.run(
        ['ping', '-c', str(count), '-W', '2', host],
        capture_output=True, timeout=10
    )
    return result.returncode == 0

def get_local_disk():
    result = subprocess.run(
        ['df', '-h', '/'],
        capture_output=True, text=True
    )
    lines = result.stdout.strip().split('\\
')
    if len(lines) >= 2:
        parts = lines[1].split()
        return {'total': parts[1], 'used': parts[2], 'pct': parts[4]}
    return {}

def check_service(name):
    result = subprocess.run(
        ['systemctl', 'is-active', name],
        capture_output=True, text=True
    )
    return result.stdout.strip() == 'active'

report = {'timestamp': datetime.now().isoformat(), 'results': []}

for server in SERVERS:
    entry = {'server': server, 'reachable': ping(server)}
    report['results'].append(entry)
    status = 'ONLINE' if entry['reachable'] else 'OFFLINE'
    print(f'  {server}: {status}')

disk = get_local_disk()
print(f'  Disk: {disk.get("pct", "?")}')

for svc in ['ssh', 'nginx', 'cron']:
    active = check_service(svc)
    print(f'  {svc}: {"active" if active else "STOPPED"}')
EOF
python3 ~/server-health.py`
const CODE_PYTHONSUBPROCESS_5 = `  192.168.100.10: ONLINE
  192.168.100.20: ONLINE
  Disk: 15%
  ssh: active
  nginx: STOPPED
  cron: active`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'Why should you avoid using shell=True with subprocess unless absolutely necessary?',
    options: [
      'It makes the code run slower than shell=False',
      'It passes the command through a shell interpreter, creating a security vulnerability (shell injection) if any part of the command includes user input',
      'It only works on Linux, not Windows',
      'It prevents capturing stdout and stderr',
    ],
    correct: 1,
    explanation: 'With shell=True, the command is passed to /bin/sh -c "command". If any user input is included unvalidated, an attacker can inject shell metacharacters: a filename like "file.txt; rm -rf /" becomes a shell command. Always use shell=False (default) and pass commands as lists: subprocess.run(["ls", "-la", user_dir]). The list form is immune to injection because each element is a literal argument, not parsed by a shell.',
  },
  {
    id: 'q2',
    question: 'What does subprocess.run(cmd, capture_output=True, text=True) return?',
    options: [
      'A string containing only stdout',
      'A CompletedProcess object with .stdout (str), .stderr (str), and .returncode (int) attributes',
      'A tuple of (stdout, stderr)',
      'A file object you must read() manually',
    ],
    correct: 1,
    explanation: 'subprocess.run() returns a CompletedProcess object. capture_output=True is equivalent to stdout=subprocess.PIPE, stderr=subprocess.PIPE. text=True decodes bytes to strings using the default encoding. Access results via: result.stdout (the output), result.stderr (any errors), result.returncode (0 = success, non-zero = failure). Check success with result.returncode == 0 or use check=True to raise an exception on failure.',
  },
  {
    id: 'q3',
    question: 'What does check=True do in subprocess.run()?',
    options: [
      'Verifies that the command exists before running it',
      'Raises subprocess.CalledProcessError if the command returns a non-zero exit code',
      'Checks that the output is non-empty',
      'Validates the command against a whitelist of allowed commands',
    ],
    correct: 1,
    explanation: 'check=True causes subprocess.run() to raise subprocess.CalledProcessError if the process exits with a non-zero return code (indicating failure). Without check=True, a failing command silently returns a result object with a non-zero returncode that you must check manually. Using check=True ensures failures are never silently ignored — critical for sysadmin scripts where silent failure can be catastrophic.',
  },
  {
    id: 'q4',
    question: 'When should you use subprocess.Popen instead of subprocess.run()?',
    options: [
      'Always — Popen is the modern API and run() is deprecated',
      'When you need real-time, streaming output from a long-running process rather than waiting for it to complete',
      'When running on Windows instead of Linux',
      'When you need to capture stderr separately from stdout',
    ],
    correct: 1,
    explanation: 'subprocess.run() waits for the process to finish and returns all output at once. For long-running processes where you want to process output line-by-line as it arrives (e.g., a backup job printing progress, a ping loop, a tail -f), use Popen with stdout=PIPE and iterate over proc.stdout. run() is correct for 95% of use cases; Popen is for streaming/interactive scenarios.',
  },
  {
    id: 'q5',
    question: 'How do you correctly pass a filename with spaces to a subprocess command?',
    options: [
      'Quote the filename: subprocess.run(["cat", "\'my file.txt\'"])',
      'Pass it as a separate list element: subprocess.run(["cat", "my file.txt"]) — no quoting needed',
      'Replace spaces with underscores first',
      'Use shell=True and add quotes: subprocess.run("cat \'my file.txt\'", shell=True)',
    ],
    correct: 1,
    explanation: 'When using list form (shell=False, the default), each list element is a separate argument. The OS passes it directly to the program without shell processing — so "my file.txt" as a list element IS the filename, spaces included. Never quote inside list elements. This is one of the key advantages of list form over shell=True: you never have to worry about quoting or escaping.',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info: 'callout-info', warning: 'callout-warning', success: 'callout-success', danger: 'callout-danger' }
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

export default function PythonSubprocess() {
  return (
    <LessonLayout
      lessonId="py-03"
      courseId="python"
      title="Working with Subprocess"
      courseTitle="Python for SysAdmins"
      courseHref="/python"
      xp={70}
      readTime="~30 min"
      icon="⚙️"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Python for SysAdmins', href: '/python' },
        { label: 'Working with Subprocess' },
      ]}
      prev={{ title: 'File System Automation', href: '/python/filesystem' }}
      next={{ title: 'Network Automation',     href: '/python/networking' }}
      objectives={[
        'Use subprocess.run() safely to execute system commands',
        'Capture stdout and stderr for parsing and logging',
        'Handle command failures gracefully with check=True and try/except',
        'Stream real-time output from long-running processes with Popen',
        'Build a multi-server command execution wrapper',
        'Avoid shell injection vulnerabilities',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Python's <code className="font-mono text-accent-cyan text-sm mx-1">subprocess</code> module
          lets you run any system command from Python — ping, systemctl, apt, ip, and any
          other tool. Combined with Python's string processing and control flow, this lets
          you build intelligent automation around existing CLI tools rather than rewriting
          them from scratch.
        </p>
        <Callout type="danger" icon="🔒" title="Never use shell=True with user input">
          If any part of your command includes user-supplied data, never use shell=True.
          Pass commands as lists (shell=False, the default). This is non-negotiable for
          any production script.
        </Callout>
      </section>

      <section>
        <h2>subprocess.run() — The Right Way</h2>
        <CodeBlock title="subprocess.run() — complete reference" language="bash"
          code={CODE_PYTHONSUBPROCESS_1} />
      </section>

      <section>
        <h2>Parsing Command Output</h2>
        <CodeBlock title="Extract structured data from CLI output" language="bash"
          code={CODE_PYTHONSUBPROCESS_2} />
      </section>

      <section>
        <h2>Streaming Output with Popen</h2>
        <CodeBlock title="Real-time output processing" language="bash"
          code={CODE_PYTHONSUBPROCESS_3} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB PY-3</span>
            <span className="text-sm font-semibold text-white">Build a Multi-Server Health Checker</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Write a comprehensive server health script using subprocess."
              command={CODE_PYTHONSUBPROCESS_4}
              language="bash"
              output={CODE_PYTHONSUBPROCESS_5}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="py-03" title="Subprocess Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={35} />
      </section>
    </LessonLayout>
  )
}
