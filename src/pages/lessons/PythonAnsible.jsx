import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── All code snippets extracted as top-level constants ──────────────────────
// (Required: inline array.join patterns inside JSX props crash Babel + esbuild)

const CODE_SUBPROCESS = `import subprocess, json, tempfile, os

# ── Simple subprocess approach ─────────────────────────────────────────
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

if result['success']:
    print('Dry run passed — applying...')
    run_playbook('site.yml', 'inventory.ini',
                 {'env': 'staging', 'version': '1.2.0'})
else:
    print('Dry run failed:', result['stderr'])

# ── ansible-runner (structured output) ────────────────────────────────
# pip install ansible-runner
import ansible_runner

runner = ansible_runner.run(
    playbook='site.yml',
    inventory='inventory.ini',
    extravars={'env': 'prod'},
    quiet=True
)

print('Status:', runner.status)
print('RC:    ', runner.rc)
if runner.stats:
    print('Stats: ', runner.stats)`

const CODE_DYNAMIC_INVENTORY = `#!/usr/bin/env python3
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
            'vars':  {'ansible_user': 'user',
                      'ansible_python_interpreter': '/usr/bin/python3'}
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
# ansible-playbook site.yml -i dynamic-inventory.py`

const CODE_LAB_SCRIPT = `cat > ~/ansible-from-python.py << 'PYEOF'
import subprocess, json

PLAYBOOK = '/tmp/test-playbook.yml'

# Write a simple test playbook
with open(PLAYBOOK, 'w') as f:
    f.write("""
- name: Python-driven deployment
  hosts: localhost
  connection: local
  vars:
    message: default
  tasks:
    - name: Show the message
      debug:
        msg: "Message from Python: {{ message }}"
""")

# Run with dynamic variable
result = subprocess.run(
    ['ansible-playbook', PLAYBOOK,
     '--extra-vars', json.dumps({'message': 'Hello from Python!'})],
    capture_output=True, text=True
)

print('Return code:', result.returncode)
print('Output:', result.stdout[-300:] if result.stdout else result.stderr)
PYEOF
python3 ~/ansible-from-python.py`

const CODE_LAB_OUTPUT = `Return code: 0
ok: [localhost] => {
    "msg": "Message from Python: Hello from Python!"
}
PLAY RECAP: localhost : ok=1  changed=0  failed=0`

const QUIZ_QUESTIONS = [
  {
    question: 'Which Python module is used to run ansible-playbook as a subprocess?',
    options: ['os.system', 'subprocess', 'ansible_runner', 'paramiko'],
    correct: 1,
    explanation: 'subprocess.run() provides full control over the child process, capturing stdout/stderr and return codes — far superior to os.system().',
  },
  {
    question: 'What must a dynamic inventory script output when called with --list?',
    options: ['A YAML file', 'A JSON object with host groups', 'A CSV of hostnames', 'An Ansible playbook'],
    correct: 1,
    explanation: 'Ansible expects a JSON object keyed by group names, with optional _meta.hostvars for per-host variables.',
  },
  {
    question: 'What does the check=True flag do when passed to ansible-playbook?',
    options: ['Validates YAML syntax only', 'Performs a dry-run without making changes', 'Checks SSH connectivity', 'Verifies module versions'],
    correct: 1,
    explanation: '--check mode simulates the run — Ansible reports what would change without actually applying any changes.',
  },
]

export default function PythonAnsible() {
  return (
    <LessonLayout
      lessonId="py-08"
      courseId="python"
      title="Python + Ansible Integration"
      courseTitle="Python for SysAdmins"
      courseHref="/python"
      icon="🤖"
      xp={90}
      readTime="~40 min"
      objectives={[
        'Run Ansible playbooks from Python using subprocess',
        'Use the ansible-runner library for structured output',
        'Build dynamic inventory generators in Python',
        'Combine Python logic with Ansible automation',
      ]}
      prev={{ title: 'Scheduling & Cron Automation', href: '/python/scheduling' }}
      next={{ title: 'Building CLI Tools',           href: '/python/cli-tool' }}
    >

      {/* ── Overview ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-4">Why Python + Ansible?</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Ansible handles configuration management brilliantly — but sometimes you need the
          full power of Python to drive it: generating inventories dynamically, adding
          conditional logic, parsing results, or integrating with external APIs before a
          deployment. Python becomes the orchestration layer that calls Ansible.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '⚙️', title: 'subprocess',     desc: 'Call ansible-playbook directly and capture stdout/stderr' },
            { icon: '📦', title: 'ansible-runner', desc: 'Official library for structured, event-driven Ansible runs' },
            { icon: '🗂️', title: 'Dynamic Inventory', desc: 'Generate host lists from any data source at runtime' },
          ].map(c => (
            <div key={c.title} className="card p-5">
              <div className="text-2xl mb-2">{c.icon}</div>
              <h3 className="font-bold text-white text-sm mb-1">{c.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── subprocess & ansible-runner ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-3">
          subprocess vs ansible-runner
        </h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          The <code className="text-accent-cyan">subprocess</code> approach is simple and
          universal — wrap the CLI call and parse stdout. The{' '}
          <code className="text-accent-cyan">ansible-runner</code> library gives you
          event-by-event callbacks, better error handling, and structured stats.
        </p>
        <CodeBlock
          code={CODE_SUBPROCESS}
          language="python"
          title="subprocess_and_runner.py"
        />
      </section>

      {/* ── Dynamic Inventory ── */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-3">Dynamic Inventory</h2>
        <p className="text-slate-300 leading-relaxed mb-4">
          Instead of a static <code className="text-accent-cyan">inventory.ini</code>, you
          can write a Python script that outputs JSON. Ansible calls it with{' '}
          <code className="text-accent-cyan">--list</code> and uses the result as the
          inventory. Query a CMDB, a cloud API, or a database — any data source works.
        </p>
        <CodeBlock
          code={CODE_DYNAMIC_INVENTORY}
          language="python"
          title="dynamic-inventory.py"
        />
      </section>

      {/* ── Lab ── */}
      <section className="mb-10">
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">🧪 Lab Exercise</span>
            <span className="text-slate-400 text-xs">~25 min</span>
          </div>
          <div className="lab-body">
            <h3 className="font-bold text-white mb-2">Drive Ansible from Python</h3>
            <p className="text-slate-300 text-sm mb-4">
              Write a Python script that creates a test playbook, runs it via subprocess,
              and prints the result. No Ansible infrastructure required — runs on localhost.
            </p>
            <CodeBlock
              code={CODE_LAB_SCRIPT}
              language="bash"
              title="Terminal"
            />
            <div className="mt-4">
              <p className="text-xs text-slate-500 font-mono mb-2">Expected output:</p>
              <CodeBlock
                code={CODE_LAB_OUTPUT}
                language="text"
                title="Output"
                showCopy={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Quiz ── */}
      <Quiz lessonId="py-08" questions={QUIZ_QUESTIONS} />

    </LessonLayout>
  )
}
