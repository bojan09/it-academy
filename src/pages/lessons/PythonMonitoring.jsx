import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_PYTHONMONITORING_1 = `import psutil
from datetime import datetime

def collect_metrics():
    """Collect current system metrics into a dict."""
    # CPU
    cpu_pct = psutil.cpu_percent(interval=1)  # 1s sample
    cpu_count = psutil.cpu_count()
    load_avg = psutil.getloadavg()             # (1min, 5min, 15min)

    # Memory
    mem = psutil.virtual_memory()
    swap = psutil.swap_memory()

    # Disk
    disks = {}
    for partition in psutil.disk_partitions():
        try:
            usage = psutil.disk_usage(partition.mountpoint)
            disks[partition.mountpoint] = {
                'total_gb': round(usage.total / 1e9, 1),
                'used_pct': usage.percent,
            }
        except PermissionError:
            pass

    # Network
    net = psutil.net_io_counters()

    # Top processes by CPU
    procs = sorted(
        psutil.process_iter(['pid','name','cpu_percent','memory_percent']),
        key=lambda p: p.info['cpu_percent'] or 0,
        reverse=True
    )[:5]

    return {
        'timestamp': datetime.now().isoformat(),
        'cpu': {'percent': cpu_pct, 'count': cpu_count, 'load_1m': round(load_avg[0], 2)},
        'memory': {'percent': mem.percent, 'used_gb': round(mem.used/1e9, 2), 'total_gb': round(mem.total/1e9, 1)},
        'swap': {'percent': swap.percent},
        'disks': disks,
        'network': {'bytes_sent_mb': round(net.bytes_sent/1e6, 1), 'bytes_recv_mb': round(net.bytes_recv/1e6, 1)},
        'top_procs': [{'pid': p.info['pid'], 'name': p.info['name'], 'cpu': p.info['cpu_percent']} for p in procs],
    }`
const CODE_PYTHONMONITORING_2 = `import smtplib, json, requests
from email.message import EmailMessage

# ── Email alert ──────────────────────────────────────────────
def send_email_alert(subject, body, to, smtp_host='localhost'):
    msg = EmailMessage()
    msg['Subject'] = f'[ALERT] {subject}'
    msg['From']    = 'monitoring@lab.local'
    msg['To']      = to
    msg.set_content(body)
    try:
        with smtplib.SMTP(smtp_host, 25) as smtp:
            smtp.send_message(msg)
        print(f'Alert sent: {subject}')
    except Exception as e:
        print(f'Alert FAILED: {e}')

# ── Slack webhook alert ───────────────────────────────────────
def send_slack_alert(message, webhook_url):
    payload = {
        'text': message,
        'username': 'SysAdminPro Monitor',
        'icon_emoji': ':rotating_light:'
    }
    try:
        resp = requests.post(webhook_url, json=payload, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        print(f'Slack alert failed: {e}')`
const CODE_PYTHONMONITORING_3 = `#!/usr/bin/env python3
"""monitor.py — Continuous system monitor with threshold alerting."""
import psutil, time, json, logging
from pathlib import Path
from datetime import datetime

# ── Configuration ────────────────────────────────────────────
POLL_INTERVAL = 30        # seconds between checks
ALERT_COOLDOWN = 1800     # 30 min between repeated alerts
METRICS_LOG = Path('/var/log/sysadmin-monitor.jsonl')

THRESHOLDS = {
    'cpu_percent':    85,   # %
    'memory_percent': 90,   # %
    'disk_pct':       85,   # % any mount
}

# ── State ────────────────────────────────────────────────────
last_alert = {}
logging.basicConfig(level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s')

def check_thresholds(metrics):
    alerts = []
    now = time.time()

    def should_alert(key):
        return now - last_alert.get(key, 0) > ALERT_COOLDOWN

    cpu = metrics['cpu']['percent']
    if cpu > THRESHOLDS['cpu_percent'] and should_alert('cpu'):
        alerts.append(f'HIGH CPU: {cpu}% (threshold {THRESHOLDS["cpu_percent"]}%)')
        last_alert['cpu'] = now

    mem = metrics['memory']['percent']
    if mem > THRESHOLDS['memory_percent'] and should_alert('memory'):
        alerts.append(f'HIGH MEMORY: {mem}% used')
        last_alert['memory'] = now

    for mount, disk in metrics['disks'].items():
        key = f'disk_{mount}'
        if disk['used_pct'] > THRESHOLDS['disk_pct'] and should_alert(key):
            alerts.append(f'DISK FULL: {mount} at {disk["used_pct"]}%')
            last_alert[key] = now

    return alerts

def run():
    logging.info('Monitor started')
    try:
        while True:
            metrics = collect_metrics()  # from previous section

            # Write to JSONL metrics log
            with open(METRICS_LOG, 'a') as f:
                f.write(json.dumps(metrics) + '\\
')

            # Check and alert
            alerts = check_thresholds(metrics)
            for alert in alerts:
                logging.warning(alert)
                # send_slack_alert(alert, WEBHOOK_URL)

            time.sleep(POLL_INTERVAL)

    except KeyboardInterrupt:
        logging.info('Monitor stopped')

if __name__ == '__main__':
    run()`
const CODE_PYTHONMONITORING_4 = `pip install psutil requests

python3 << 'EOF'
import psutil, json
from datetime import datetime

metrics = {
    'timestamp': datetime.now().isoformat(),
    'cpu_pct': psutil.cpu_percent(interval=1),
    'mem_pct': psutil.virtual_memory().percent,
    'disk_pct': psutil.disk_usage('/').percent,
    'load': psutil.getloadavg()[0],
}

print(json.dumps(metrics, indent=2))

# Simple threshold check
if metrics['disk_pct'] > 80:
    print(f'WARNING: Disk at {metrics["disk_pct"]}%')
else:
    print(f'OK: Disk at {metrics["disk_pct"]}%')
EOF`
const CODE_PYTHONMONITORING_5 = `{
  "timestamp": "2025-01-15T11:00:00",
  "cpu_pct": 8.5,
  "mem_pct": 47.2,
  "disk_pct": 15.3,
  "load": 0.08
}
OK: Disk at 15.3%`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What does the psutil library provide that makes it ideal for system monitoring scripts?',
    options: [
      'A web framework for building monitoring dashboards',
      'Cross-platform access to system and process information: CPU, memory, disk, network I/O, process lists, and system uptime',
      'A database for storing monitoring metrics',
      'Email and alerting functionality',
    ],
    correct: 1,
    explanation: 'psutil (process and system utilities) gives Python cross-platform access to system metrics that would otherwise require parsing platform-specific commands. Key functions: psutil.cpu_percent(), psutil.virtual_memory(), psutil.disk_usage("/"), psutil.net_io_counters(), psutil.process_iter(). Works on Linux, Windows, and macOS with the same API.',
  },
  {
    id: 'q2',
    question: 'What is the correct approach for a monitoring script that runs continuously and alerts on thresholds?',
    options: [
      'Use while True with no sleep — maximum responsiveness',
      'Use a loop with time.sleep() for the polling interval, check thresholds, and implement cooldown logic to prevent alert flooding',
      'Run the script once as a cron job every minute',
      'Use asyncio for concurrent monitoring of all metrics',
    ],
    correct: 1,
    explanation: 'A continuous monitoring loop needs: time.sleep(interval) to avoid consuming 100% CPU, threshold checking with hysteresis (don\'t alert every second when CPU is at 91% for 10 minutes), cooldown tracking (track last_alert_time per metric to prevent flooding), and graceful SIGINT handling (try/except KeyboardInterrupt). For production, use a proper monitoring system (Prometheus, Datadog) but understanding the loop pattern is fundamental.',
  },
  {
    id: 'q3',
    question: 'How do you send an email alert from Python when a threshold is crossed?',
    options: [
      'import email and call email.send()',
      'Use smtplib.SMTP to connect to a mail server, create a MIMEText message, and call sendmail()',
      'Use requests.post() to the Gmail API',
      'Write a file to /var/mail/username',
    ],
    correct: 1,
    explanation: 'Python\'s built-in smtplib handles SMTP email sending. Create the message with email.mime.text.MIMEText or email.message.EmailMessage. Connect to SMTP server with smtplib.SMTP("smtp.company.com", 587), call starttls() for encryption, login() with credentials, and sendmail(). For production scripts, use an SMTP relay or service like SendGrid/SES rather than direct mail server access.',
  },
  {
    id: 'q4',
    question: 'What is the purpose of a "cooldown" mechanism in a monitoring script?',
    options: [
      'It reduces CPU temperature by slowing down the monitoring loop',
      'It prevents the same alert from being sent repeatedly during a sustained incident — wait N minutes before sending another alert for the same condition',
      'It gracefully shuts down the monitoring script when requested',
      'It pauses monitoring during business hours to reduce noise',
    ],
    correct: 1,
    explanation: 'Without a cooldown, a monitoring script checking every 30 seconds during a 2-hour CPU spike would send 240 identical alerts. A cooldown tracks the last alert time per metric and only sends another alert after a minimum interval (e.g., 30 minutes). Track with: last_alert = {}; if metric not in last_alert or time.time() - last_alert[metric] > COOLDOWN_SECS: send_alert(); last_alert[metric] = time.time().',
  },
  {
    id: 'q5',
    question: 'What is the advantage of using Python\'s requests library to send monitoring alerts to a Slack webhook?',
    options: [
      'Slack webhooks are faster than email',
      'It requires no email infrastructure, delivers alerts instantly to a channel visible to the whole team, and is a single POST request to a URL with a JSON payload',
      'It automatically escalates alerts if not acknowledged',
      'It stores alert history in a database automatically',
    ],
    correct: 1,
    explanation: 'Slack incoming webhooks accept a simple POST request with a JSON payload containing a "text" field. No SMTP server, no email credentials, no MX records — just an HTTPS request to a webhook URL. The alert appears in a Slack channel immediately, visible to everyone. Excellent for team operational alerts. Also simple to integrate: requests.post(webhook_url, json={"text": message}).',
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

export default function PythonMonitoring() {
  return (
    <LessonLayout
      lessonId="py-07"
      courseId="python"
      title="Infrastructure Monitoring Scripts"
      courseTitle="Python for SysAdmins"
      courseHref="/python"
      xp={90}
      readTime="~35 min"
      icon="📊"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Python for SysAdmins', href: '/python' },
        { label: 'Infrastructure Monitoring Scripts' },
      ]}
      prev={{ title: 'Scheduled Tasks & Cron', href: '/python/scheduling' }}
      next={{ title: 'Ansible & Python',       href: '/python/ansible' }}
      objectives={[
        'Use psutil to collect CPU, memory, disk, and network metrics',
        'Build a continuous monitoring loop with threshold alerting',
        'Implement cooldown logic to prevent alert flooding',
        'Send alerts via email (smtplib) and Slack (webhooks)',
        'Write metrics to structured JSON logs for trend analysis',
        'Create a production-ready monitoring daemon',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Before Prometheus existed, sysadmins wrote monitoring scripts. Even with
          enterprise tools available, knowing how to write custom monitoring in Python
          is invaluable — for edge cases, custom metrics, and environments where
          installing a full monitoring stack isn't feasible.
        </p>
        <Callout type="info" icon="💡" title="Build then use commercial tools">
          Understanding what monitoring tools do internally makes you a much better
          user of Prometheus, Datadog, and Nagios. Build one first, then adopt a
          commercial tool with full understanding of what it's doing.
        </Callout>
      </section>

      <section>
        <h2>Collecting Metrics with psutil</h2>
        <CodeBlock title="psutil — system metrics collection" language="bash"
          code={CODE_PYTHONMONITORING_1} />
      </section>

      <section>
        <h2>Alerting — Email and Slack</h2>
        <CodeBlock title="Alert delivery functions" language="bash"
          code={CODE_PYTHONMONITORING_2} />
      </section>

      <section>
        <h2>The Complete Monitoring Daemon</h2>
        <CodeBlock title="monitor.py — production-ready monitoring loop" language="bash"
          code={CODE_PYTHONMONITORING_3} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB PY-7</span>
            <span className="text-sm font-semibold text-white">Run the Monitoring Script and Generate a Report</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Install psutil and run a one-shot metrics collection."
              command={CODE_PYTHONMONITORING_4}
              language="bash"
              output={CODE_PYTHONMONITORING_5}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="py-07" title="Infrastructure Monitoring Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={45} />
      </section>
    </LessonLayout>
  )
}
