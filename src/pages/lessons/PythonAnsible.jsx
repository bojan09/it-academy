import React from "react";
import LessonLayout from "../../components/LessonLayout.jsx";
import CodeBlock from "../../components/CodeBlock.jsx";
import Quiz from "../../components/Quiz.jsx";

const QUIZ_QUESTIONS = [
  {
    id: "q1",
    question: "What Python library provides the official Ansible API?",
    options: [
      "ansible-api",
      "ansible-runner — the supported Python interface for invoking Ansible playbooks and roles programmatically from Python code",
      "python-ansible",
      "subprocess with ansible-playbook command",
    ],
    correct: 1,
    explanation:
      'ansible-runner (pip install ansible-runner) is Red Hat\'s official Python library for running Ansible from Python. It provides a clean API to execute playbooks, capture output, and handle events. The simpler approach for many cases is subprocess.run(["ansible-playbook", "playbook.yml"]) — but ansible-runner gives structured event output, artifact directories, and better integration.',
  },
  {
    id: "q2",
    question:
      "What is the Ansible Python API and when would you use it over ansible-runner?",
    options: [
      "A REST API for managing Ansible Tower/AWX",
      "The low-level internal Python API (ansible.executor.playbook_executor) that Ansible itself uses — useful for deeply customised automation but not stable between versions; use ansible-runner for stable integrations",
      "A separate paid API for enterprise Ansible usage",
      "The Python library for writing Ansible modules",
    ],
    correct: 1,
    explanation:
      "Ansible's internal Python API (importing ansible modules directly) is powerful but unstable — classes and interfaces change between Ansible versions. Use it only when ansible-runner cannot meet your needs. For most Python + Ansible integration scenarios: subprocess for simple cases, ansible-runner for structured programmatic control. The most stable and future-proof approach is treating Ansible as an external tool invoked from Python.",
  },
  {
    id: "q3",
    question:
      "How do you pass extra variables to an Ansible playbook from Python using subprocess?",
    options: [
      "Write them to a JSON file and pass --extra-vars @file.json",
      'Use subprocess.run with --extra-vars \'{"key": "value"}\' or -e @vars.json — JSON or YAML strings are the most reliable format for complex variable structures',
      "Pass them as environment variables only",
      "Variables must be in the inventory file — they cannot be passed at runtime",
    ],
    correct: 0,
    explanation:
      'Two main approaches: (1) --extra-vars \'{"server": "web01", "env": "prod"}\' inline JSON string. (2) Write vars to a temp JSON/YAML file then pass --extra-vars @/tmp/vars.json. The @file syntax is more reliable for complex data with special characters. In Python: write json.dumps(vars_dict) to a tempfile.NamedTemporaryFile, pass the path. Both approaches set variables at the highest precedence level in Ansible.',
  },
  {
    id: "q4",
    question:
      "What does ansible-runner.run() return and how do you check if the playbook succeeded?",
    options: [
      "It returns True on success, False on failure",
      "It returns a Runner object; check runner.status ('successful', 'failed', 'canceled') and runner.rc (return code: 0=success)",
      "It returns the playbook stdout as a string",
      "It blocks indefinitely and never returns",
    ],
    correct: 1,
    explanation:
      "ansible-runner.run() blocks until completion and returns a Runner object. Key attributes: runner.status (string: 'successful', 'failed', 'timeout', 'canceled'), runner.rc (integer return code: 0=all tasks OK, 1=error, 2=unreachable hosts, 3=no hosts matched, 4=parse error). Also: runner.stats (dict with ok/failed/unreachable counts per host), and runner.events (iterator over all Ansible events for detailed output processing).",
  },
  {
    id: "q5",
    question:
      "What is a dynamic Ansible inventory and how can Python generate one?",
    options: [
      "An inventory that automatically discovers hosts via SNMP",
      "A script/program that outputs JSON conforming to the Ansible inventory schema — Python can query a CMDB, cloud API, or database to produce the current host list at playbook runtime",
      "An inventory file that updates itself after each playbook run",
      "An Ansible plugin that reads from Active Directory",
    ],
    correct: 1,
    explanation:
      'Dynamic inventory scripts output JSON with the structure: {"group_name": {"hosts": [...], "vars": {...}}, "_meta": {"hostvars": {...}}}. Ansible calls the script with --list (all hosts) or --host HOSTNAME (per-host vars). Python dynamic inventory scripts can: query AWS/Azure APIs, read a CMDB database, parse a CSV, or query Active Directory. Use ansible-inventory --list -i myscript.py to test the output.',
  },
];

// ────────────────────────────────────────────────
//    Code snippets as constants (prevents esbuild scanning issues)
// ────────────────────────────────────────────────

const subprocessAndRunnerApproaches = `
import subprocess, json, tempfile, os

# ── Simple subprocess approach ────────────────────────────
def run_playbook(playbook, inventory, extra_vars=None, check=False):
    cmd = ['ansible-playbook', playbook, '-i', inventory]
    if extra_vars:
        cmd += ['--extra-vars', json.dumps(extra_vars)]
    if check:
        cmd.append('--check')
    result = subprocess.run(cmd, capture_output=True, text=True)
    return {
        'success':  result.returncode == 0,
        'rc':       result.returncode,
        'stdout':   result.stdout,
        'stderr':   result.stderr,
    }

# Usage
result = run_playbook(
    playbook='site.yml',
    inventory='inventory.ini',
    extra_vars={'env': 'staging', 'version': '1.2.0'},
    check=True   # dry-run first
)

if result["success"]:
    print("Dry run passed — applying...")
    run_playbook("site.yml", "inventory.ini",
                 {"env": "staging", "version": "1.2.0"})
else:
    print(f"Dry run failed: {result["stderr"]}")

# ── ansible-runner (structured output) ───────────────────
# pip install ansible-runner
import ansible_runner

runner = ansible_runner.run(
    playbook='site.yml',
    inventory='inventory.ini',
    extravars={'env': 'prod'},
    quiet=True
)

print(f"Status: {runner.status}")
print(f"RC:     {runner.rc}")
if runner.stats:
    print(f"Stats:  {runner.stats}")
`.trim();

const dynamicInventoryGenerator = `
#!/usr/bin/env python3
"""dynamic-inventory.py — generates inventory from a data source"""
import json, sys

# In production: query a CMDB, cloud API, or database
# Here: static data as an example
def get_inventory():
    return {
        'webservers': {
            'hosts': ['web01.lab.local', 'web02.lab.local'],
            'vars':  {'nginx_port': 80, 'env': 'prod'}
        },
        'databases': {
            'hosts': ['db01.lab.local'],
            'vars':  {'backup_enabled': True}
        },
        'lab': {
            'hosts': ['192.168.100.20'],
            'vars':  {'ansible_user': 'user', 'ansible_python_interpreter': '/usr/bin/python3'}
        },
        '_meta': {
            'hostvars': {
                'web01.lab.local': {'weight': 100},
                'web02.lab.local': {'weight': 50},
            }
        }
    }

if __name__ == '__main__':
    if '--list' in sys.argv:
        print(json.dumps(get_inventory(), indent=2))
    elif '--host' in sys.argv:
        print(json.dumps({}))   # hostvars in _meta above

# Test:
# chmod +x dynamic-inventory.py
# ansible-inventory --list -i dynamic-inventory.py
# ansible-playbook site.yml -i dynamic-inventory.py
`.trim();

const labPythonScript = `
cat > ~/ansible-from-python.py << 'PYEOF'
import subprocess, json

PLAYBOOK = '/tmp/test-playbook.yml'

# Write a simple test playbook
with open(PLAYBOOK, 'w') as f:
    f.write('''
- name: Python-driven deployment
  hosts: localhost
  connection: local
  vars:
    message: default
  tasks:
    - name: Show the message
      debug:
        msg: "Message from Python: {{ message }}"
''')

# Run with dynamic variable
result = subprocess.run(['ansible-playbook', PLAYBOOK,
    '--extra-vars', json.dumps({'message': 'Hello from Python!'})],
    capture_output=True, text=True)

print('Return code:', result.returncode)
print('Output:', result.stdout[-300:] if result.stdout else result.stderr)
PYEOF

python3 ~/ansible-from-python.py
`.trim();

const labExpectedOutput = `
Return code: 0
ok: [localhost] => {
    "msg": "Message from Python: Hello from Python!"
}

PLAY RECAP: localhost : ok=1 changed=0 failed=0
`.trim();

function LabStep({ number, description, command, language = "bash", output }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 rounded-full bg-accent-amber/20 border border-accent-amber/30 text-accent-amber text-[11px] font-bold font-mono flex items-center justify-center flex-shrink-0 mt-0.5">
          {number}
        </span>
        <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
      </div>
      {command && (
        <div className="ml-9">
          <CodeBlock code={command} language={language} showCopy />
        </div>
      )}
      {output && (
        <div className="ml-9 rounded-xl bg-surface-950 border border-surface-700 px-4 py-3 font-mono text-xs text-accent-green leading-6">
          {output.split("\n").map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PythonAnsible() {
  return (
    <LessonLayout
      lessonId="py-08"
      courseId="python"
      title="Ansible & Python Integration"
      courseTitle="Python for SysAdmins"
      courseHref="/python"
      xp={80}
      readTime="~30 min"
      icon="🤖"
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Python for SysAdmins", href: "/python" },
        { label: "Ansible & Python" },
      ]}
      prev={{ title: "Infrastructure Monitoring", href: "/python/monitoring" }}
      next={{ title: "Building a CLI Tool", href: "/python/cli-tool" }}
      objectives={[
        "Run Ansible playbooks from Python using subprocess and ansible-runner",
        "Pass dynamic variables to playbooks from Python",
        "Parse Ansible output and check results programmatically",
        "Generate dynamic inventories with Python scripts",
        "Build a Python wrapper for repeatable Ansible workflows",
        "Handle errors and retries in Ansible-Python pipelines",
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Python and Ansible complement each other perfectly: Python provides
          data processing, API integration, and complex logic; Ansible provides
          idempotent configuration management. Combining them lets you drive
          Ansible with dynamically generated inventories and variables from
          Python's data sources.
        </p>
      </section>

      <section>
        <h2>Running Ansible from Python</h2>
        <CodeBlock
          title="subprocess and ansible-runner approaches"
          language="bash"
          code={subprocessAndRunnerApproaches}
        />
      </section>

      <section>
        <h2>Dynamic Inventory Script</h2>
        <CodeBlock
          title="Python dynamic inventory generator"
          language="bash"
          code={dynamicInventoryGenerator}
        />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB PY-8</span>
            <span className="text-sm font-semibold text-white">
              Run Ansible from Python on the Ubuntu VM
            </span>
            <span className="ml-auto text-xs text-slate-500 font-mono">
              ~15 min
            </span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep
              number={1}
              description="Create a Python script that drives Ansible with dynamic variables."
              command={labPythonScript}
              output={labExpectedOutput}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">
          5 questions · Pass at 70% to unlock the next lesson.
        </p>
        <Quiz
          lessonId="py-08"
          title="Ansible & Python Integration Quiz"
          questions={QUIZ_QUESTIONS}
          passingScore={70}
          xpReward={40}
        />
      </section>
    </LessonLayout>
  );
}
