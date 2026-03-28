import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_PYTHONNETWORKING_1 = `import socket
from concurrent.futures import ThreadPoolExecutor

COMMON_PORTS = {
    22: 'SSH', 80: 'HTTP', 443: 'HTTPS', 3389: 'RDP',
    445: 'SMB', 389: 'LDAP', 636: 'LDAPS', 53: 'DNS',
    25: 'SMTP', 5985: 'WinRM',
}

def check_port(host: str, port: int, timeout: float = 2.0) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False

def scan_host(host: str, ports=None) -> dict:
    ports = ports or list(COMMON_PORTS.keys())
    results = {'host': host, 'open': [], 'closed': []}
    for port in ports:
        if check_port(host, port):
            results['open'].append(f'{port}/{COMMON_PORTS.get(port, "?")}',)
        else:
            results['closed'].append(port)
    return results

# Scan multiple hosts in parallel
hosts = ['192.168.100.10', '192.168.100.20']
with ThreadPoolExecutor(max_workers=5) as pool:
    results = list(pool.map(scan_host, hosts))

for r in results:
    print(f"  {r['host']}:  {', '.join(r['open']) or 'no common ports open'}")`
const CODE_PYTHONNETWORKING_2 = `import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# ── Resilient session with retries ───────────────────────────
def make_session(retries=3, backoff=0.5) -> requests.Session:
    session = requests.Session()
    retry = Retry(
        total=retries,
        backoff_factor=backoff,
        status_forcelist=[500, 502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

# ── Simple REST API calls ─────────────────────────────────────
session = make_session()

# GET request with error handling
try:
    resp = session.get('https://api.example.com/health', timeout=10)
    resp.raise_for_status()   # raises on 4xx/5xx
    data = resp.json()
    print(f'Status: {data["status"]}')
except requests.exceptions.ConnectionError:
    print('Cannot reach API server')
except requests.exceptions.HTTPError as e:
    print(f'HTTP error: {e.response.status_code}')
except requests.exceptions.Timeout:
    print('Request timed out')

# POST request (e.g. Slack webhook alert)
def send_slack(webhook_url: str, message: str) -> bool:
    try:
        resp = requests.post(webhook_url,
                            json={'text': message},
                            timeout=10)
        resp.raise_for_status()
        return True
    except requests.exceptions.RequestException as e:
        print(f'Slack alert failed: {e}')
        return False`
const CODE_PYTHONNETWORKING_3 = `import paramiko

def run_ssh_command(host: str, username: str, key_path: str,
                    command: str, timeout: int = 30) -> dict:
    """Run a command via SSH and return stdout, stderr, and exit code."""
    client = paramiko.SSHClient()
    # Production: use RejectPolicy + known_hosts file
    # Lab: AutoAddPolicy is acceptable
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(
            hostname=host,
            username=username,
            key_filename=key_path,
            timeout=10
        )
        stdin, stdout, stderr = client.exec_command(command, timeout=timeout)
        exit_code = stdout.channel.recv_exit_status()
        return {
            'host':      host,
            'stdout':    stdout.read().decode().strip(),
            'stderr':    stderr.read().decode().strip(),
            'exit_code': exit_code,
            'success':   exit_code == 0,
        }
    except paramiko.AuthenticationException:
        return {'host': host, 'error': 'Authentication failed', 'success': False}
    except Exception as e:
        return {'host': host, 'error': str(e), 'success': False}
    finally:
        client.close()

# Run on multiple servers
SERVERS = ['192.168.100.20']
KEY = '/home/user/.ssh/id_ed25519_lab'

for server in SERVERS:
    result = run_ssh_command(server, 'user', KEY, 'df -h /')
    if result['success']:
        print(f'{server}: {result["stdout"].split(chr(10))[-1]}')
    else:
        print(f'{server}: ERROR — {result.get("error", result.get("stderr"))}')`
const CODE_PYTHONNETWORKING_4 = `pip install requests paramiko

python3 << 'EOF'
import socket

PORTS = {22:'SSH', 80:'HTTP', 443:'HTTPS', 389:'LDAP', 3389:'RDP', 5985:'WinRM'}
HOSTS = ['192.168.100.10', '192.168.100.20']

for host in HOSTS:
    open_ports = []
    for port, name in PORTS.items():
        try:
            with socket.create_connection((host, port), timeout=1):
                open_ports.append(f'{port}/{name}')
        except Exception:
            pass
    status = 'ONLINE' if open_ports else 'OFFLINE'
    print(f'{host} [{status}]: {chr(32).join(open_ports) or "no ports open"}')
EOF`
const CODE_PYTHONNETWORKING_5 = `192.168.100.10 [ONLINE]: 389/LDAP 3389/RDP 5985/WinRM
192.168.100.20 [ONLINE]: 22/SSH`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What does socket.create_connection(("host", port), timeout=5) do?',
    options: [
      'Creates a UDP datagram socket and sends a test packet',
      'Establishes a TCP connection to the specified host and port, raising an exception if it fails within the timeout — the cleanest way to test port reachability from Python',
      'Creates a raw socket for packet crafting',
      'Opens a socket and listens for incoming connections',
    ],
    correct: 1,
    explanation: 'socket.create_connection() is a convenience function that resolves the hostname (handling both IPv4/IPv6), creates a TCP socket, and connects — all in one call. It raises ConnectionRefusedError if the port is closed, socket.timeout if the connection times out, and OSError for other failures. It\'s the correct way to test TCP port reachability. Using context manager (with statement) ensures the socket is closed properly.',
  },
  {
    id: 'q2',
    question: 'What Python library is best suited for HTTP API calls in automation scripts?',
    options: [
      'urllib.request (built-in)',
      'requests — provides a simple, human-friendly API for HTTP with automatic JSON handling, session management, and proper error handling',
      'http.client (built-in)',
      'socket with manual HTTP protocol implementation',
    ],
    correct: 1,
    explanation: 'The requests library (pip install requests) is the standard for HTTP in Python automation. It handles: connection pooling (Session), automatic JSON encode/decode (.json()), proper SSL verification, cookies, redirects, authentication, and retry logic. While urllib.request is built-in, its API is cumbersome for real scripts. For modern async code, httpx is the equivalent. In scripts: requests.get(url), requests.post(url, json=data), response.raise_for_status().',
  },
  {
    id: 'q3',
    question: 'How do you properly handle SSH connections to multiple servers in Python?',
    options: [
      'Call subprocess.run(["ssh", "user@host", "command"]) for each server',
      'Use paramiko.SSHClient with connection pooling, proper host key handling, and exception handling per host — allowing parallel or sequential execution across many servers',
      'Write the commands to a shell script and run it via subprocess',
      'Use socket connections to port 22 directly',
    ],
    correct: 1,
    explanation: 'paramiko is the standard Python SSH library. Key pattern: create SSHClient(), set MissingHostKeyPolicy (AutoAddPolicy for labs, RejectPolicy for production), connect(), execute via exec_command(). Always use try/except per host — one failed host shouldn\'t crash the whole script. For many hosts, use concurrent.futures.ThreadPoolExecutor to parallelize. Close connections in finally blocks. Never use AutoAddPolicy in production — it bypasses host verification.',
  },
  {
    id: 'q4',
    question: 'What does response.raise_for_status() do in the requests library?',
    options: [
      'It prints the HTTP status code to stdout',
      'It raises an HTTPError exception if the response status code indicates a client (4xx) or server (5xx) error — allowing consistent error handling without checking status codes manually',
      'It retries the request if the status code is not 200',
      'It logs the response headers to the system log',
    ],
    correct: 1,
    explanation: 'raise_for_status() is a convenience method that raises requests.exceptions.HTTPError for 4xx (client error) and 5xx (server error) responses. Without it, requests doesn\'t raise on HTTP errors — a 404 or 500 response is returned normally and you must check response.status_code manually. Always call it immediately after making a request in production scripts: response = requests.get(url); response.raise_for_status(). Wrap in try/except requests.exceptions.RequestException for comprehensive error handling.',
  },
  {
    id: 'q5',
    question: 'What is the correct way to check if a web service is responding and healthy?',
    options: [
      'ping the server IP address',
      'Use requests.get(url, timeout=5) with response.raise_for_status() — this verifies the HTTP service is running, responding within timeout, and returning a success status code',
      'Check if the process is running with psutil',
      'Verify the TCP port is open with socket.create_connection()',
    ],
    correct: 1,
    explanation: 'Checking layers in sequence: ping=ICMP (L3), socket TCP check=L4, HTTP request=L7. For a web service health check, you need L7 — the TCP port might be open but the application could be in an error state returning 500 or 503. requests.get(url, timeout=5) with raise_for_status() verifies the full stack. Add response content checks (assert "healthy" in response.text) for deep health validation. Combine with retry logic using tenacity or a manual loop for resilient monitoring.',
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

export default function PythonNetworking() {
  return (
    <LessonLayout
      lessonId="py-04"
      courseId="python"
      title="Network Automation with Python"
      courseTitle="Python for SysAdmins"
      courseHref="/python"
      xp={80}
      readTime="~35 min"
      icon="🌐"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Python for SysAdmins', href: '/python' },
        { label: 'Network Automation' },
      ]}
      prev={{ title: 'Working with Subprocess', href: '/python/subprocess' }}
      next={{ title: 'Parsing Logs',            href: '/python/log-parsing' }}
      objectives={[
        'Test TCP port connectivity with the socket module',
        'Make HTTP API calls with the requests library',
        'Automate SSH connections to remote servers with paramiko',
        'Build a multi-server connectivity checker with parallel execution',
        'Call REST APIs for infrastructure monitoring',
        'Handle network errors and timeouts gracefully',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Python's networking modules transform manual connectivity checks, REST API
          calls, and SSH commands into automated, repeatable scripts. This lesson
          covers the three most common networking tasks in sysadmin automation:
          port checking with sockets, HTTP API calls with requests, and SSH
          automation with paramiko.
        </p>
      </section>

      <section>
        <h2>Socket — TCP Port Testing</h2>
        <CodeBlock title="Port connectivity testing" language="bash"
          code={CODE_PYTHONNETWORKING_1} />
      </section>

      <section>
        <h2>requests — HTTP API Integration</h2>
        <CodeBlock title="HTTP requests for infrastructure APIs" language="bash"
          code={CODE_PYTHONNETWORKING_2} />
      </section>

      <section>
        <h2>paramiko — SSH Automation</h2>
        <CodeBlock title="SSH automation with paramiko" language="bash"
          code={CODE_PYTHONNETWORKING_3} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB PY-4</span>
            <span className="text-sm font-semibold text-white">Build a Lab Network Health Checker</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Install required libraries and run a port scan of the lab."
              command={CODE_PYTHONNETWORKING_4}
              language="bash"
              output={CODE_PYTHONNETWORKING_5}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="py-04" title="Network Automation Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={40} />
      </section>
    </LessonLayout>
  )
}
