import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'
import GlossaryTooltip from '../../components/GlossaryTooltip.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_PYTHONAUTOMATION_1 = `from pathlib import Path

# ── Creating paths ─────────────────────────────────────────
p = Path('/var/log/nginx')
home = Path.home()              # /home/username
cwd  = Path.cwd()               # Current directory

# ── Path joining (/ operator replaces os.path.join) ────────
log_file = Path('/var/log') / 'nginx' / 'access.log'
# → /var/log/nginx/access.log

# ── Inspection ─────────────────────────────────────────────
p.exists()          # True/False
p.is_file()         # True if it's a file
p.is_dir()          # True if it's a directory
p.stat().st_size    # File size in bytes
p.stat().st_mtime   # Last modified timestamp

# ── Decomposition ──────────────────────────────────────────
p = Path('/var/log/nginx/access.log')
p.name          # 'access.log'
p.stem          # 'access'
p.suffix        # '.log'
p.parent        # Path('/var/log/nginx')
p.parts         # ('/', 'var', 'log', 'nginx', 'access.log')

# ── Reading and writing ─────────────────────────────────────
text = p.read_text(encoding='utf-8')         # Read whole file
p.write_text("content", encoding='utf-8')   # Write whole file
data = p.read_bytes()                        # Read as bytes

# ── Directory operations ─────────────────────────────────────
p.mkdir(parents=True, exist_ok=True)        # mkdir -p
list(p.iterdir())                           # ls
list(p.glob('*.log'))                       # ls *.log
list(p.rglob('*.log'))                      # find -name "*.log"

# ── Glob with filtering ─────────────────────────────────────
log_dir = Path('/var/log')
for log in log_dir.glob('*.log'):
    print(f"{log.name}: {log.stat().st_size / 1024:.1f} KB")`
const CODE_PYTHONAUTOMATION_2 = `import shutil
from pathlib import Path

# ── Copy operations ─────────────────────────────────────────
shutil.copy2(src, dst)          # Copy file + metadata (like cp -p)
shutil.copytree(src_dir, dst_dir, dirs_exist_ok=True)  # Copy tree

# ── Move / rename ──────────────────────────────────────────
shutil.move(src, dst)           # Works across filesystems

# ── Delete ──────────────────────────────────────────────────
shutil.rmtree(path)             # rm -rf (no confirmation!)

# ── Disk usage ─────────────────────────────────────────────
usage = shutil.disk_usage('/')
print(f"Total: {usage.total / 1e9:.1f} GB")
print(f"Used:  {usage.used  / 1e9:.1f} GB ({usage.used/usage.total*100:.1f}%)")
print(f"Free:  {usage.free  / 1e9:.1f} GB")

# ── Compression / archiving ─────────────────────────────────
# Create a .tar.gz archive
shutil.make_archive(
    base_name='/backups/nginx-logs-2025-01-15',
    format='gztar',
    root_dir='/var/log',
    base_dir='nginx'
)
# → /backups/nginx-logs-2025-01-15.tar.gz

# Extract
shutil.unpack_archive('/backups/archive.tar.gz', '/restore/')`
const CODE_PYTHONAUTOMATION_3 = `#!/usr/bin/env python3
"""
log-cleanup.py — Remove log files older than a specified number of days.
Usage: python3 log-cleanup.py /var/log/app --days 30 --dry-run
"""
import argparse
import time
from pathlib import Path

def cleanup_old_logs(log_dir: str, max_age_days: int, dry_run: bool = True) -> dict:
    base       = Path(log_dir)
    cutoff     = time.time() - (max_age_days * 86400)
    stats      = {"found": 0, "deleted": 0, "freed_bytes": 0, "errors": 0}

    if not base.is_dir():
        raise ValueError(f"Directory not found: {base}")

    for path in base.rglob("*.log*"):
        if not path.is_file():
            continue

        stats["found"] += 1
        file_age = path.stat().st_mtime

        if file_age < cutoff:
            size = path.stat().st_size
            print(f"{'[DRY RUN] Would delete' if dry_run else 'Deleting'}: {path} ({size/1024:.1f} KB)")

            if not dry_run:
                try:
                    path.unlink()
                    stats["deleted"] += 1
                    stats["freed_bytes"] += size
                except OSError as e:
                    print(f"  ERROR: {e}")
                    stats["errors"] += 1
            else:
                stats["deleted"] += 1
                stats["freed_bytes"] += size

    print(f"\\\\
{'[DRY RUN] ' if dry_run else ''}Summary:")
    print(f"  Files found:   {stats['found']}")
    print(f"  Files deleted: {stats['deleted']}")
    print(f"  Space freed:   {stats['freed_bytes'] / 1e6:.1f} MB")
    if stats["errors"]:
        print(f"  Errors:        {stats['errors']}")
    return stats

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean up old log files")
    parser.add_argument("directory",  help="Log directory to clean")
    parser.add_argument("--days",     type=int, default=30, help="Max age in days (default: 30)")
    parser.add_argument("--dry-run",  action="store_true",  help="Preview without deleting")
    args = parser.parse_args()

    cleanup_old_logs(args.directory, args.days, args.dry_run)`
const CODE_PYTHONAUTOMATION_4 = `#!/usr/bin/env python3
"""
disk-monitor.py — Monitor disk usage and send email alert if threshold exceeded.
Run via cron: */15 * * * * /usr/bin/python3 /opt/scripts/disk-monitor.py
"""
import shutil
import smtplib
import os
from email.mime.text import MIMEText
from datetime import datetime

# ── Configuration (load from env vars in production) ──────────
THRESHOLD_PCT = int(os.environ.get("DISK_THRESHOLD", "85"))
SMTP_HOST     = os.environ.get("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT     = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USER     = os.environ.get("SMTP_USER", "")
SMTP_PASS     = os.environ.get("SMTP_PASS", "")
ALERT_TO      = os.environ.get("ALERT_TO", "sysadmin@company.com")
HOSTNAME      = os.uname().nodename

MONITORED_PATHS = ["/", "/var", "/home", "/opt"]

def get_disk_stats(path: str) -> dict | None:
    try:
        usage = shutil.disk_usage(path)
        pct   = round(usage.used / usage.total * 100, 1)
        return {
            "path":  path,
            "total": usage.total,
            "used":  usage.used,
            "free":  usage.free,
            "pct":   pct,
        }
    except FileNotFoundError:
        return None

def format_size(bytes_val: int) -> str:
    for unit in ["B", "KB", "MB", "GB", "TB"]:
        if bytes_val < 1024:
            return f"{bytes_val:.1f} {unit}"
        bytes_val /= 1024
    return f"{bytes_val:.1f} PB"

def send_alert(critical: list[dict]) -> None:
    if not SMTP_USER:
        print("SMTP not configured — printing alert to stdout")
        for disk in critical:
            print(f"ALERT: {disk['path']} at {disk['pct']}%")
        return

    lines = [f"Disk space alert on {HOSTNAME} — {datetime.now():%Y-%m-%d %H:%M}", ""]
    for disk in critical:
        lines.append(f"  {disk['path']:10s}  {disk['pct']:5.1f}%  "
                     f"({format_size(disk['free'])} free of {format_size(disk['total'])})")

    msg = MIMEText("\\\\
".join(lines))
    msg["Subject"] = f"⚠ Disk Alert: {HOSTNAME} — {critical[0]['path']} at {critical[0]['pct']}%"
    msg["From"]    = SMTP_USER
    msg["To"]      = ALERT_TO

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(SMTP_USER, SMTP_PASS)
        smtp.send_message(msg)
    print(f"Alert email sent to {ALERT_TO}")

def main():
    critical = []
    for path in MONITORED_PATHS:
        stats = get_disk_stats(path)
        if stats is None:
            continue
        status = "⚠ CRITICAL" if stats["pct"] >= THRESHOLD_PCT else "✔ OK"
        print(f"{status}  {stats['path']:10s}  {stats['pct']:5.1f}%  "
              f"({format_size(stats['free'])} free)")
        if stats["pct"] >= THRESHOLD_PCT:
            critical.append(stats)

    if critical:
        send_alert(critical)

if __name__ == "__main__":
    main()`
const CODE_PYTHONAUTOMATION_5 = `# SSH into Ubuntu Server
ssh user@192.168.100.20

# Create project directory
mkdir -p ~/scripts && cd ~/scripts

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install useful packages
pip install requests python-dotenv rich

# Verify
python3 --version && pip list`
const CODE_PYTHONAUTOMATION_6 = `Python 3.11.7
Package      Version
-------      -------
requests     2.31.0
rich         13.7.0
python-dotenv 1.0.0`
const CODE_PYTHONAUTOMATION_7 = `# Create test log directory with old files
mkdir -p ~/test-logs

# Create some 'old' log files (backdated via touch)
for i in 1 2 3 4 5; do
    touch -d "45 days ago" ~/test-logs/app-old-$i.log
    echo "Old log entry $i" > ~/test-logs/app-old-$i.log
done

# Create some recent log files
for i in 1 2 3; do
    echo "Recent log $i" > ~/test-logs/app-recent-$i.log
done

# Run in dry-run mode first
python3 log-cleanup.py ~/test-logs --days 30 --dry-run`
const CODE_PYTHONAUTOMATION_8 = `[DRY RUN] Would delete: /home/user/test-logs/app-old-1.log (18.0 KB)
[DRY RUN] Would delete: /home/user/test-logs/app-old-2.log (18.0 KB)
[DRY RUN] Would delete: /home/user/test-logs/app-old-3.log (18.0 KB)
[DRY RUN] Would delete: /home/user/test-logs/app-old-4.log (18.0 KB)
[DRY RUN] Would delete: /home/user/test-logs/app-old-5.log (18.0 KB)

[DRY RUN] Summary:
  Files found:   8
  Files deleted: 5
  Space freed:   0.1 MB`
const CODE_PYTHONAUTOMATION_9 = `✔ OK    /          12.3%  (42.1 GB free of 48.2 GB)
✔ OK    /var        4.1%  (9.6 GB free of 10.0 GB)
✔ OK    /home       2.8%  (19.4 GB free of 20.0 GB)`
const CODE_PYTHONAUTOMATION_10 = `# Add to crontab
crontab -e

# Add this line:
# */15 * * * * /home/user/scripts/venv/bin/python3 /home/user/scripts/disk-monitor.py >> /var/log/disk-monitor.log 2>&1

# Verify it was added
crontab -l`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'Which Python module is best for running shell commands and capturing their output?',
    options: ['os.system()', 'subprocess.run()', 'shell.execute()', 'commands.run()'],
    correct: 1,
    explanation: 'subprocess.run() is the recommended approach. It replaces os.system() (which can\'t capture output) and os.popen(). Use subprocess.run(["cmd", "arg"], capture_output=True, text=True, check=True) — capture_output captures stdout/stderr, text=True returns strings, check=True raises an exception on non-zero exit codes.',
  },
  {
    id: 'q2',
    question: 'What does the pathlib.Path module provide over the older os.path module?',
    options: [
      'Faster file I/O operations',
      'An object-oriented interface to filesystem paths that works cross-platform',
      'Built-in file encryption capabilities',
      'Automatic sudo elevation for privileged operations',
    ],
    correct: 1,
    explanation: 'pathlib.Path provides an object-oriented API for filesystem paths. Instead of os.path.join(base, "subdir", "file.txt"), you write Path(base) / "subdir" / "file.txt". It\'s more readable, cross-platform, and provides useful methods like .exists(), .read_text(), .write_text(), .glob(), and .iterdir().',
  },
  {
    id: 'q3',
    question: 'Which Python library is the standard choice for making HTTP requests to REST APIs?',
    options: ['urllib', 'http.client', 'requests', 'httplib2'],
    correct: 2,
    explanation: 'The requests library (pip install requests) is the de facto standard for HTTP in Python. It provides a clean, human-friendly API: requests.get(url), requests.post(url, json=data), automatic JSON decoding (response.json()), session management, and authentication helpers. urllib is built-in but verbose.',
  },
  {
    id: 'q4',
    question: 'What is the best practice for storing sensitive configuration like API keys in Python scripts?',
    options: [
      'Hardcode them as constants at the top of the file',
      'Store them in a config.py file imported by the script',
      'Load from environment variables using os.environ or python-dotenv',
      'Encode them in base64 before storing in the script',
    ],
    correct: 2,
    explanation: 'Environment variables (os.environ.get("API_KEY")) are the standard approach. python-dotenv loads from a .env file (which you add to .gitignore). Never hardcode secrets — they end up in git history, logs, and error messages. Base64 is encoding, not encryption, and provides zero security.',
  },
  {
    id: 'q5',
    question: 'In Python, what does context manager syntax (with statement) guarantee when opening files?',
    options: [
      'The file is opened in binary mode',
      'The file is locked so no other process can access it',
      'The file is automatically closed even if an exception occurs',
      'The file contents are loaded entirely into memory',
    ],
    correct: 2,
    explanation: 'The with statement (context manager) ensures __exit__ is called on the object even if an exception is raised. For files, this means the file handle is always closed, preventing resource leaks. Always use "with open(file) as f:" instead of manual f.open()/f.close() pairs.',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info: 'callout-info', warning: 'callout-warning', danger: 'callout-danger', success: 'callout-success' }
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

export default function PythonAutomation() {
  return (
    <LessonLayout
      lessonId="py-02"
      courseId="python"
      title="File System Automation"
      courseTitle="Python for SysAdmins"
      courseHref="/python"
      xp={70}
      readTime="~30 min"
      icon="📁"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Python for SysAdmins', href: '/python' },
        { label: 'File System Automation' },
      ]}
      prev={{ title: 'Python Basics for SysAdmins', href: '/python/basics' }}
      next={{ title: 'Working with Subprocess', href: '/python/subprocess' }}
      objectives={[
        'Navigate and manipulate the filesystem using pathlib',
        'Automate file operations: copy, move, rename, delete, compress',
        'Parse log files and extract data using Python',
        'Build a practical log rotation and cleanup script',
        'Handle errors gracefully in file operations',
        'Write a real disk space monitor with email alerting',
      ]}
    >
      {/* ── OVERVIEW ── */}
      <section>
        <h2>Overview</h2>
        <p>
          <GlossaryTooltip term="Python" /> is the most versatile language for sysadmin
          automation. File system work — cleaning old logs, rotating backups, parsing
          structured data, archiving directories — is where Python pays off immediately.
          You can replace complex bash pipelines with readable, testable, cross-platform code.
        </p>
        <p className="mt-4">
          This lesson covers the two essential modules for filesystem work:
          <strong> pathlib</strong> (modern path manipulation) and <strong>shutil</strong>
          (file operations). We'll build real scripts you can deploy today.
        </p>
        <Callout type="info" icon="💡" title="Why not bash?">
          Bash is great for simple one-liners but becomes fragile at scale: error handling
          is painful, parsing structured data requires awk/sed gymnastics, and scripts
          break across different Linux distributions. Python handles all of this cleanly.
        </Callout>
      </section>

      {/* ── PATHLIB ── */}
      <section>
        <h2>pathlib — The Modern Way</h2>
        <p>
          <code className="font-mono text-accent-cyan text-sm">pathlib.Path</code> replaced
          the old <code className="font-mono text-accent-cyan text-sm">os.path</code> module.
          It treats paths as objects rather than strings, which makes code significantly
          more readable and less error-prone.
        </p>

        <CodeBlock className="mt-4" title="pathlib fundamentals" language="bash"
          code={CODE_PYTHONAUTOMATION_1} />
      </section>

      {/* ── SHUTIL ── */}
      <section>
        <h2>shutil — File Operations at Scale</h2>
        <CodeBlock title="shutil for copy, move, archive, disk usage" language="bash"
          code={CODE_PYTHONAUTOMATION_2} />
      </section>

      {/* ── REAL SCRIPTS ── */}
      <section>
        <h2>Real-World Scripts</h2>

        <h3>Log Cleanup Script</h3>
        <CodeBlock title="log-cleanup.py — delete logs older than N days" language="bash"
          code={CODE_PYTHONAUTOMATION_3} />

        <h3>Disk Space Monitor with Alerting</h3>
        <CodeBlock title="disk-monitor.py — alert when disk usage exceeds threshold" language="bash"
          code={CODE_PYTHONAUTOMATION_4} />
      </section>

      {/* ── VMware LAB ── */}
      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB PY-2</span>
            <span className="text-sm font-semibold text-white">Build and Run File Automation Scripts</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">

            <LabStep number={1}
              description="Set up a Python virtual environment and project structure on the Ubuntu VM."
              command={CODE_PYTHONAUTOMATION_5}
              output={CODE_PYTHONAUTOMATION_6}
            />

            <LabStep number={2}
              description="Create test log files and run the log cleanup script in dry-run mode."
              command={CODE_PYTHONAUTOMATION_7}
              output={CODE_PYTHONAUTOMATION_8}
            />

            <LabStep number={3}
              description="Run the disk monitor script and see it report on filesystem usage."
              command={"python3 disk-monitor.py"}
              output={CODE_PYTHONAUTOMATION_9}
            />

            <LabStep number={4}
              description="Schedule the disk monitor with cron to run every 15 minutes."
              command={CODE_PYTHONAUTOMATION_10}
            />

            <Callout type="success" icon="✅" title="Lab Complete">
              You've built two production-ready Python sysadmin scripts, set up a proper
              virtual environment, and scheduled automated monitoring with cron.
            </Callout>
          </div>
        </div>
      </section>

      {/* ── QUIZ ── */}
      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to earn bonus XP.</p>
        <Quiz lessonId="py-02" title="File System Automation Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={35} />
      </section>
    </LessonLayout>
  )
}
