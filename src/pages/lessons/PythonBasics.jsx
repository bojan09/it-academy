import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_PYTHONBASICS_1 = `# Check Python version
python3 --version

# Create a virtual environment
python3 -m venv ~/sysadmin-scripts/venv

# Activate it
source ~/sysadmin-scripts/venv/bin/activate
# Windows: .\\venv\\Scripts\\Activate.ps1

# Your prompt changes: (venv) user@host:~$

# Install packages
pip install requests paramiko psutil python-dotenv

# Save dependencies for reproducibility
pip freeze > requirements.txt

# Recreate elsewhere
pip install -r requirements.txt

# Deactivate when done
deactivate`
const CODE_PYTHONBASICS_2 = `# ── Strings ─────────────────────────────────────────────────
hostname  = "dc01.lab.local"
ip        = "192.168.100.10"
log_entry = f"[INFO] Connected to {hostname} at {ip}"  # f-string

# Useful string methods
hostname.upper()           # "DC01.LAB.LOCAL"
hostname.split(".")        # ["dc01", "lab", "local"]
ip.replace("192", "10")    # "10.168.100.10"
"error" in log_entry       # False — case sensitive
log_entry.startswith("[INFO]")  # True

# ── Numbers ─────────────────────────────────────────────────
port    = 3389
ram_gb  = 4.5
disk_pct = 78

free_pct = 100 - disk_pct          # 22
ram_mb   = int(ram_gb * 1024)      # 4608
is_full  = disk_pct > 90           # False

# ── Lists (ordered, mutable) ─────────────────────────────────
servers = ["dc01", "srv01", "web01"]
servers.append("db01")             # Add to end
servers.remove("web01")            # Remove by value
servers[0]                         # "dc01"
servers[-1]                        # Last item
servers[1:3]                       # Slice: ["srv01", "db01"]
len(servers)                       # Count
sorted(servers)                    # Sorted copy
"dc01" in servers                  # True

# ── Dictionaries (key-value, like JSON) ─────────────────────
server = {
    "hostname": "dc01",
    "ip": "192.168.100.10",
    "roles": ["AD DS", "DNS", "DHCP"],
    "online": True
}
server["ip"]                       # "192.168.100.10"
server.get("port", 3389)           # 3389 (default if missing)
server.keys()                      # dict_keys(["hostname", "ip", ...])
server.items()                     # Key-value pairs for iteration

# ── Booleans ────────────────────────────────────────────────
is_online  = True
is_patched = False
if is_online and not is_patched:
    print("Server online but needs patching")`
const CODE_PYTHONBASICS_3 = `# ── if / elif / else ────────────────────────────────────────
disk_pct = 87

if disk_pct >= 95:
    print("CRITICAL: Disk nearly full!")
elif disk_pct >= 80:
    print(f"WARNING: Disk at {disk_pct}%")
else:
    print(f"OK: Disk at {disk_pct}%")

# ── for loops ───────────────────────────────────────────────
servers = {"dc01": "192.168.100.10", "srv01": "192.168.100.20"}

for name, ip in servers.items():
    print(f"Checking {name} ({ip})...")

# List comprehension — create new list concisely
ips = [ip for name, ip in servers.items()]  # ["192.168.100.10", "192.168.100.20"]
high_ports = [p for p in range(1, 1025) if p % 2 == 0]  # even ports

# ── while loops ─────────────────────────────────────────────
import time
retries = 0
max_retries = 3

while retries < max_retries:
    # try to connect...
    success = True  # simulation
    if success:
        print("Connected!")
        break
    retries += 1
    print(f"Retry {retries}/{max_retries}")
    time.sleep(2)
else:
    print("All retries failed")`
const CODE_PYTHONBASICS_4 = `import subprocess
import socket

# ── Functions ────────────────────────────────────────────────
def ping(host: str, count: int = 1) -> bool:
    """Returns True if host responds to ping."""
    result = subprocess.run(
        ["ping", "-c", str(count), "-W", "2", host],
        capture_output=True
    )
    return result.returncode == 0

def check_port(host: str, port: int, timeout: float = 2.0) -> bool:
    """Returns True if TCP port is open."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except (socket.timeout, ConnectionRefusedError, OSError):
        return False

# ── Error handling ───────────────────────────────────────────
def read_config(path: str) -> dict:
    """Read a simple key=value config file."""
    config = {}
    try:
        with open(path, 'r') as f:
            for line in f:
                line = line.strip()
                if '=' in line and not line.startswith('#'):
                    key, value = line.split('=', 1)
                    config[key.strip()] = value.strip()
    except FileNotFoundError:
        print(f"Config file not found: {path}")
    except PermissionError:
        print(f"Permission denied: {path}")
    except Exception as e:
        print(f"Unexpected error reading {path}: {e}")
    return config

# ── Using them together ──────────────────────────────────────
if __name__ == "__main__":
    hosts = ["192.168.100.10", "192.168.100.20"]

    for host in hosts:
        online = ping(host)
        ssh_open = check_port(host, 22) if online else False
        print(f"{host}: {'online' if online else 'OFFLINE'}, "
              f"SSH: {'open' if ssh_open else 'closed'}")`
const CODE_PYTHONBASICS_5 = `ssh user@192.168.100.20
python3 --version
mkdir -p ~/sysadmin-scripts && cd ~/sysadmin-scripts
python3 -m venv venv && source venv/bin/activate
pip install requests`
const CODE_PYTHONBASICS_6 = `Python 3.10.12
(venv) user@srv01:~/sysadmin-scripts$`
const CODE_PYTHONBASICS_7 = `cat > network-scan.py << 'EOF'
#!/usr/bin/env python3
"""network-scan.py — Scan the lab network for live hosts and open ports."""
import subprocess, socket, ipaddress

LAB_NETWORK = "192.168.100.0/24"
COMMON_PORTS = {22: "SSH", 80: "HTTP", 443: "HTTPS", 3389: "RDP",
                445: "SMB", 389: "LDAP", 53: "DNS"}

def is_alive(ip: str) -> bool:
    result = subprocess.run(["ping","-c","1","-W","1",str(ip)],
                            capture_output=True)
    return result.returncode == 0

def open_ports(ip: str) -> list:
    open_ = []
    for port in COMMON_PORTS:
        try:
            with socket.create_connection((ip, port), timeout=0.5):
                open_.append(port)
        except Exception:
            pass
    return open_

print(f"Scanning {LAB_NETWORK}...")
for ip in ipaddress.ip_network(LAB_NETWORK).hosts():
    ip = str(ip)
    if is_alive(ip):
        ports = open_ports(ip)
        services = [f"{p}/{COMMON_PORTS[p]}" for p in ports]
        print(f"  ✔ {ip:18s}  {', '.join(services) or 'no common ports'}")
EOF
python3 network-scan.py`
const CODE_PYTHONBASICS_8 = `Scanning 192.168.100.0/24...
  ✔ 192.168.100.1       no common ports
  ✔ 192.168.100.10      53/DNS, 389/LDAP, 445/SMB, 3389/RDP
  ✔ 192.168.100.20      22/SSH`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is a Python virtual environment (venv) and why should you always use one?',
    options: [
      'A sandbox that runs Python inside a VM for security isolation',
      'An isolated Python installation with its own packages so projects don\'t interfere with each other or the system Python',
      'A visual IDE for writing Python scripts',
      'A remote Python environment running on a server',
    ],
    correct: 1,
    explanation: 'A virtual environment (venv) creates an isolated directory with its own Python interpreter and package installation. This means project A can use requests==2.28 while project B uses requests==2.31, and neither affects the system Python. Always use venvs for any project with dependencies. Create: python3 -m venv venv. Activate: source venv/bin/activate (Linux) or venv\\Scripts\\activate (Windows).',
  },
  {
    id: 'q2',
    question: 'What is the output of: print(type(42), type("hello"), type([1,2,3]))',
    options: [
      '<int> <str> <list>',
      '<class \'int\'> <class \'str\'> <class \'list\'>',
      'int str list',
      'number string array',
    ],
    correct: 1,
    explanation: 'Python\'s type() function returns a type object. When printed, it shows <class \'typename\'>. Python\'s built-in types: int, float, str, bool, list, tuple, dict, set, NoneType. Everything in Python is an object with a type.',
  },
  {
    id: 'q3',
    question: 'What does the following print?\nservers = {"dc01": "192.168.100.10", "srv01": "192.168.100.20"}\nprint(servers.get("web01", "Not found"))',
    options: ['None', 'KeyError: web01', '"Not found"', '{}'],
    correct: 2,
    explanation: 'dict.get(key, default) safely retrieves a key — if the key doesn\'t exist, it returns the default value instead of raising a KeyError. servers["web01"] would raise KeyError, but servers.get("web01", "Not found") safely returns "Not found". Always use .get() when you\'re not sure a key exists.',
  },
  {
    id: 'q4',
    question: 'What is a Python list comprehension and when should you use one?',
    options: [
      'A type of comment that documents what a list contains',
      'A concise one-line syntax to create a new list by applying an expression and optional filter to an iterable',
      'A built-in method that checks if all items in a list match a condition',
      'A way to merge two lists into one',
    ],
    correct: 1,
    explanation: 'A list comprehension creates a new list concisely: [expression for item in iterable if condition]. Example: [x*2 for x in range(10) if x % 2 == 0] creates [0,4,8,12,16]. Use comprehensions when building a list from another iterable with simple transformations. For complex logic, a regular for loop is more readable.',
  },
  {
    id: 'q5',
    question: 'What is the purpose of if __name__ == "__main__": in a Python script?',
    options: [
      'It defines the main function that Python always runs first',
      'It checks if the script is being run directly (not imported), allowing code to run as a script but not when imported as a module',
      'It prevents the script from running without administrator privileges',
      'It sets the script\'s name for logging purposes',
    ],
    correct: 1,
    explanation: 'When Python imports a module, __name__ is set to the module name. When running a script directly, __name__ is "__main__". So if __name__ == "__main__": lets you write code that runs when the script is executed directly but NOT when it\'s imported by another script. This is the standard pattern for making scripts both importable as modules and executable as scripts.',
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

export default function PythonBasics() {
  return (
    <LessonLayout
      lessonId="py-01"
      courseId="python"
      title="Python Basics for SysAdmins"
      courseTitle="Python for SysAdmins"
      courseHref="/python"
      xp={50}
      readTime="~25 min"
      icon="🐍"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Python for SysAdmins', href: '/python' },
        { label: 'Python Basics' },
      ]}
      prev={null}
      next={{ title: 'File System Automation', href: '/python/filesystem' }}
      objectives={[
        'Set up Python and a virtual environment correctly',
        'Understand Python\'s key data types: str, int, list, dict, bool',
        'Write functions, conditionals, and loops from a sysadmin perspective',
        'Read from and write to files using context managers',
        'Handle errors gracefully with try/except',
        'Structure a reusable Python script with if __name__ == "__main__"',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Python is the most widely used language for sysadmin automation — and for good reason.
          Its clean syntax, massive standard library, and rich ecosystem of packages mean you can
          automate almost any infrastructure task in a fraction of the lines bash would require,
          with proper error handling and cross-platform support.
        </p>
        <p className="mt-4">
          This lesson covers the Python fundamentals you need to write useful sysadmin scripts
          from day one. Every concept is framed around practical IT tasks — not abstract
          programming exercises.
        </p>
        <Callout type="info" icon="💡" title="Python version">
          Always use Python 3.10+ for new scripts. Python 2 is end-of-life. Check your
          version with <code className="font-mono text-accent-cyan text-sm">python3 --version</code>.
          On Ubuntu 22.04+, python3 is Python 3.10.
        </Callout>
      </section>

      {/* ── SETUP ── */}
      <section>
        <h2>Setting Up Your Environment</h2>
        <CodeBlock title="Virtual environment setup (always do this first)" language="bash" code={CODE_PYTHONBASICS_1} />
      </section>

      {/* ── DATA TYPES ── */}
      <section>
        <h2>Key Data Types for SysAdmins</h2>
        <CodeBlock title="Python data types — with sysadmin context" language="bash" code={CODE_PYTHONBASICS_2} />
      </section>

      {/* ── CONTROL FLOW ── */}
      <section>
        <h2>Control Flow — The Sysadmin Way</h2>
        <CodeBlock language="bash" code={CODE_PYTHONBASICS_3} />
      </section>

      {/* ── FUNCTIONS + ERROR HANDLING ── */}
      <section>
        <h2>Functions & Error Handling</h2>
        <CodeBlock language="bash" code={CODE_PYTHONBASICS_4} />
      </section>

      {/* ── VMware LAB ── */}
      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB PY-1</span>
            <span className="text-sm font-semibold text-white">Write a Network Discovery Script</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Set up your Python environment on the Ubuntu VM."
              command={CODE_PYTHONBASICS_5}
              output={CODE_PYTHONBASICS_6}
            />
            <LabStep number={2}
              description="Create a network scanner script that checks lab hosts."
              language="bash"
              command={CODE_PYTHONBASICS_7}
              output={CODE_PYTHONBASICS_8}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="py-01" title="Python Basics Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={25} />
      </section>
    </LessonLayout>
  )
}
