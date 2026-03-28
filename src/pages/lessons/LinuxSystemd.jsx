import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_LINUXSYSTEMD_1 = `# ── Service lifecycle ────────────────────────────────────────
sudo systemctl start nginx       # Start now
sudo systemctl stop nginx        # Stop now
sudo systemctl restart nginx     # Stop then start
sudo systemctl reload nginx      # Reload config (no downtime)
sudo systemctl status nginx      # Show status, recent logs

# ── Boot persistence ─────────────────────────────────────────
sudo systemctl enable nginx      # Start at boot
sudo systemctl disable nginx     # Don't start at boot
sudo systemctl enable --now nginx  # Enable AND start immediately
sudo systemctl disable --now nginx # Disable AND stop immediately

# ── Inspect ──────────────────────────────────────────────────
systemctl is-active nginx        # Returns 'active' or 'inactive'
systemctl is-enabled nginx       # Returns 'enabled' or 'disabled'
systemctl is-failed nginx        # Returns 'failed' or 'active'
systemctl list-units --type=service --state=running
systemctl list-units --type=service --state=failed
systemctl list-unit-files --type=service | grep enabled

# ── System-wide ──────────────────────────────────────────────
sudo systemctl daemon-reload     # Re-read unit files after changes
sudo systemctl reset-failed      # Clear 'failed' state on all units
sudo systemctl reset-failed nginx  # Clear failed state for nginx

# ── Power management ─────────────────────────────────────────
sudo systemctl reboot
sudo systemctl poweroff
sudo systemctl halt`
const CODE_LINUXSYSTEMD_2 = `[Unit]
Description=My Application Server
Documentation=https://docs.myapp.com
After=network.target postgresql.service   # Start AFTER these
Requires=postgresql.service               # FAIL if postgres not running
Wants=redis.service                       # Start redis if possible, but don't fail

[Service]
Type=simple                   # simple|forking|oneshot|notify|idle
User=appuser                  # Run as this user (NOT root)
Group=appuser
WorkingDirectory=/opt/myapp
EnvironmentFile=/etc/myapp/env  # Load env vars from file
ExecStart=/opt/myapp/bin/server --port 8080
ExecReload=/bin/kill -HUP $MAINPID  # Signal for config reload
ExecStop=/bin/kill -TERM $MAINPID

# Restart policy
Restart=on-failure            # Restart if process exits non-zero
RestartSec=5                  # Wait 5s before restarting
StartLimitIntervalSec=60      # Reset restart counter every 60s
StartLimitBurst=3             # Max 3 restarts in the interval

# Security hardening
NoNewPrivileges=yes           # Prevent privilege escalation
ProtectSystem=strict          # Mount /usr, /boot read-only
PrivateTmp=yes                # Isolated /tmp directory

[Install]
WantedBy=multi-user.target    # Enable for normal multi-user boot`
const CODE_LINUXSYSTEMD_3 = `# ── Basic queries ────────────────────────────────────────────
journalctl -u nginx                # All logs for nginx
journalctl -u nginx -f             # Follow in real time
journalctl -u nginx -n 50          # Last 50 lines
journalctl -u nginx --since '1 hour ago'
journalctl -u nginx --since '2025-01-15 09:00' --until '2025-01-15 10:00'

# ── Filter by priority ───────────────────────────────────────
journalctl -p err                  # Errors and above
journalctl -p warning -u nginx     # Warnings for nginx
# Priorities: emerg alert crit err warning notice info debug

# ── Boot logs ────────────────────────────────────────────────
journalctl -b                      # Current boot
journalctl -b -1                   # Previous boot
journalctl --list-boots            # List all boots

# ── System-wide ──────────────────────────────────────────────
journalctl --disk-usage            # How much disk logs use
sudo journalctl --vacuum-size=500M # Keep only last 500MB
sudo journalctl --vacuum-time=30d  # Keep only last 30 days`
const CODE_LINUXSYSTEMD_4 = `# Two files needed: a .service and a .timer

# 1. Create the service unit (what to run)
sudo tee /etc/systemd/system/disk-check.service << 'EOF'
[Unit]
Description=Disk Space Check

[Service]
Type=oneshot
User=root
ExecStart=/opt/scripts/disk-monitor.py
StandardOutput=journal
EOF

# 2. Create the timer unit (when to run)
sudo tee /etc/systemd/system/disk-check.timer << 'EOF'
[Unit]
Description=Run disk check every 15 minutes

[Timer]
OnCalendar=*:0/15        # Every 15 minutes (cron: */15 * * * *)
# OnBootSec=5min         # 5 minutes after boot
# OnUnitActiveSec=1h     # Every hour after last run
Persistent=true          # Run missed jobs after downtime

[Install]
WantedBy=timers.target
EOF

# 3. Enable and start the timer
sudo systemctl daemon-reload
sudo systemctl enable --now disk-check.timer

# 4. Verify
systemctl list-timers disk-check.timer`
const CODE_LINUXSYSTEMD_5 = `# How long has the system been running?
systemctl status --no-pager | head -5

# Which services are failed?
systemctl list-units --state=failed

# Check nginx is running
systemctl is-active nginx && echo 'nginx: OK' || echo 'nginx: not running'`
const CODE_LINUXSYSTEMD_6 = `State: running
Jobs: 0 queued
Failed: 0 units

nginx: OK`
const CODE_LINUXSYSTEMD_7 = `# Create the script
sudo mkdir -p /opt/healthcheck
sudo tee /opt/healthcheck/run.sh << 'SCRIPT'
#!/bin/bash
echo "[$(date)] Disk: $(df -h / | tail -1 | awk '{print $5}') used"
echo "[$(date)] RAM:  $(free -h | grep Mem | awk '{print $3}') used"
SCRIPT
sudo chmod +x /opt/healthcheck/run.sh

# Create the unit file
sudo tee /etc/systemd/system/healthcheck.service << 'EOF'
[Unit]
Description=System Health Check

[Service]
Type=oneshot
ExecStart=/opt/healthcheck/run.sh
StandardOutput=journal
EOF

sudo systemctl daemon-reload
sudo systemctl start healthcheck
journalctl -u healthcheck -n 5 --no-pager`
const CODE_LINUXSYSTEMD_8 = `Jan 15 11:00:00 srv01 run.sh[1234]: [2025-01-15 11:00:00] Disk: 15% used
Jan 15 11:00:00 srv01 run.sh[1234]: [2025-01-15 11:00:00] RAM:  1.2G used`
const CODE_LINUXSYSTEMD_9 = `sudo tee /etc/systemd/system/healthcheck.timer << 'EOF'
[Unit]
Description=Health Check Timer

[Timer]
OnCalendar=*:0/5
Persistent=true

[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now healthcheck.timer
systemctl list-timers healthcheck.timer`
const CODE_LINUXSYSTEMD_10 = `NEXT                         LEFT     LAST  PASSED  UNIT
Thu 2025-01-15 11:05:00 UTC  4min 59s  n/a    n/a   healthcheck.timer`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the difference between "systemctl stop" and "systemctl disable"?',
    options: [
      'They are the same — both stop the service and prevent it from starting',
      'stop halts the service NOW; disable prevents it from starting automatically at BOOT — they are independent',
      'stop is temporary; disable is permanent',
      'stop works on running services; disable only works on services that are already stopped',
    ],
    correct: 1,
    explanation: 'stop and disable are independent operations. systemctl stop halts the service immediately. systemctl disable removes the service from the boot targets so it does not start on reboot. A service can be running but disabled (it was started manually or will not survive a reboot), or stopped but enabled (it was not running but will start on the next boot). To do both: systemctl disable --now service.',
  },
  {
    id: 'q2',
    question: 'What is a systemd "unit file" and where are they stored?',
    options: [
      'A compiled binary that systemd executes to start services, stored in /usr/bin/',
      'A plain-text INI-style configuration file that describes a service, socket, timer, or mount — stored in /etc/systemd/system/ or /lib/systemd/system/',
      'A shell script used to start services, equivalent to /etc/init.d/ scripts',
      'A JSON configuration file stored in /etc/systemd/units.json',
    ],
    correct: 1,
    explanation: 'Unit files are plain-text INI-style files (.service, .socket, .timer, .mount etc.) that tell systemd everything about a unit: how to start it, what it depends on, when to restart it, which user to run as. /lib/systemd/system/ contains vendor-provided units. /etc/systemd/system/ contains admin overrides and custom units — these take priority. Use systemctl edit service to create override files without modifying originals.',
  },
  {
    id: 'q3',
    question: 'What command shows the logs for a specific service and follows them in real time?',
    options: [
      'tail -f /var/log/service.log',
      'journalctl -u servicename -f',
      'systemctl logs servicename --follow',
      'syslog --service servicename -tail',
    ],
    correct: 1,
    explanation: 'journalctl -u servicename shows journal entries for that specific unit. -f follows in real time (like tail -f). Other useful flags: -n 50 (last 50 lines), --since "10 minutes ago", -p err (errors only), -b (since last boot). journalctl is the modern replacement for /var/log/syslog for service logs.',
  },
  {
    id: 'q4',
    question: 'What is a systemd timer unit used for?',
    options: [
      'Setting timeout values for service startup',
      'A replacement for cron — scheduled task execution managed by systemd with better logging and dependency management',
      'Measuring how long a service takes to start',
      'Throttling service resource usage over time',
    ],
    correct: 1,
    explanation: 'systemd timers (.timer units) are a modern replacement for cron jobs. They offer: integration with journald for logging, OnCalendar (cron-like) or OnBootSec/OnUnitActiveSec (relative) schedules, dependency management, accurate missed timer handling, and systemctl list-timers to see all scheduled jobs. Each timer is paired with a .service unit that does the actual work.',
  },
  {
    id: 'q5',
    question: 'What does "systemctl daemon-reload" do and when must you run it?',
    options: [
      'Restarts all running services simultaneously',
      'Reloads systemd\'s configuration by re-reading all unit files — required after creating or modifying a unit file before starting/restarting the service',
      'Reloads the kernel modules used by systemd',
      'Resets all failed service states to inactive',
    ],
    correct: 1,
    explanation: 'systemctl daemon-reload tells systemd to re-read all unit files from disk. You MUST run it after creating a new unit file or modifying an existing one, otherwise systemd will use the old cached version. It does not restart any services — it only updates systemd\'s in-memory representation of unit files.',
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

export default function LinuxSystemd() {
  return (
    <LessonLayout
      lessonId="linux-05"
      courseId="linux"
      title="systemd & Service Management"
      courseTitle="Linux Fundamentals"
      courseHref="/linux"
      xp={80}
      readTime="~35 min"
      icon="⚙️"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Linux Fundamentals', href: '/linux' },
        { label: 'systemd & Service Management' },
      ]}
      prev={{ title: 'Package Management',         href: '/linux/packages' }}
      next={{ title: 'Linux Networking',            href: '/linux/networking' }}
      objectives={[
        'Manage services with systemctl — start, stop, enable, disable, status',
        'Read and interpret systemctl status output',
        'Query service logs with journalctl',
        'Write custom unit files for your own services',
        'Create systemd timers as cron replacements',
        'Troubleshoot failed services using journald and systemd targets',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          systemd is the init system used by virtually all modern Linux distributions.
          It is process ID 1 — the first process started by the kernel, which then starts
          everything else. Understanding systemd means understanding how Linux starts,
          how services are managed, and how to debug anything that goes wrong at boot
          or runtime.
        </p>
        <Callout type="info" icon="💡" title="systemd replaced SysVinit">
          The old /etc/init.d/ scripts and service command are deprecated. Everything
          is now managed through systemctl and journalctl. On modern systems, the old
          commands are often wrappers that call systemctl anyway.
        </Callout>
      </section>

      <section>
        <h2>systemctl — Service Control</h2>
        <CodeBlock title="systemctl — complete daily reference" language="bash"
          code={CODE_LINUXSYSTEMD_1} />
      </section>

      <section>
        <h2>Unit File Anatomy</h2>
        <p>Every service is defined by a unit file. Understanding the structure lets you
          create custom services for your own scripts.</p>
        <CodeBlock title="/etc/systemd/system/myapp.service — annotated" language="bash"
          code={CODE_LINUXSYSTEMD_2} />
      </section>

      <section>
        <h2>journalctl — Log Querying</h2>
        <CodeBlock title="journalctl — log query reference" language="bash"
          code={CODE_LINUXSYSTEMD_3} />
      </section>

      <section>
        <h2>systemd Timers — Modern Cron</h2>
        <CodeBlock title="Create a systemd timer for scheduled tasks" language="bash"
          code={CODE_LINUXSYSTEMD_4} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB LINUX-5</span>
            <span className="text-sm font-semibold text-white">Write a Custom Service Unit and Timer</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Explore current service state on the Ubuntu Server VM."
              command={CODE_LINUXSYSTEMD_5}
              output={CODE_LINUXSYSTEMD_6}
            />
            <LabStep number={2}
              description="Create a simple health-check service that runs a Python script."
              command={CODE_LINUXSYSTEMD_7}
              output={CODE_LINUXSYSTEMD_8}
            />
            <LabStep number={3}
              description="Create a timer to run the health check every 5 minutes."
              command={CODE_LINUXSYSTEMD_9}
              output={CODE_LINUXSYSTEMD_10}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="linux-05" title="systemd & Service Management Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={40} />
      </section>
    </LessonLayout>
  )
}
