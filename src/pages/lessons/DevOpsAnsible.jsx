import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_DEVOPSANSIBLE_1 = `# /etc/ansible/hosts or project-local inventory.ini

[all:vars]
ansible_user=sysadmin
ansible_ssh_private_key_file=~/.ssh/id_ed25519_lab

[webservers]
web01 ansible_host=192.168.100.30
web02 ansible_host=192.168.100.31

[databases]
db01 ansible_host=192.168.100.40

[lab]
ubuntu01 ansible_host=192.168.100.20

[lab:vars]
ansible_python_interpreter=/usr/bin/python3

# ── Test connectivity ─────────────────────────────────────────
ansible all -i inventory.ini -m ping

# ── Ad-hoc commands ──────────────────────────────────────────
ansible all -i inventory.ini -m command -a 'uptime'
ansible webservers -i inventory.ini -m apt -a 'name=nginx state=present' --become
ansible all -i inventory.ini -m gather_facts | grep ansible_hostname`
const CODE_DEVOPSANSIBLE_2 = `---
- name: Configure web servers
  hosts: webservers
  become: true          # sudo elevation
  vars:
    nginx_port: 80
    site_root: /var/www/html

  handlers:
    - name: restart nginx
      service:
        name: nginx
        state: restarted

  tasks:
    - name: Update apt cache
      apt:
        update_cache: true
        cache_valid_time: 3600

    - name: Install nginx
      apt:
        name: nginx
        state: present
      notify: restart nginx

    - name: Create web root directory
      file:
        path: "{{ site_root }}"
        state: directory
        owner: www-data
        mode: '0755'

    - name: Deploy index page from template
      template:
        src: templates/index.html.j2
        dest: "{{ site_root }}/index.html"
        owner: www-data
      notify: restart nginx

    - name: Ensure nginx is started and enabled
      service:
        name: nginx
        state: started
        enabled: true

    - name: Open port {{ nginx_port }} in firewall
      ufw:
        rule: allow
        port: "{{ nginx_port }}"
        proto: tcp`
const CODE_DEVOPSANSIBLE_3 = `sudo apt install ansible -y
ansible --version | head -1

# Test against localhost
ansible localhost -m ping`
const CODE_DEVOPSANSIBLE_4 = `ansible [core 2.15.0]
localhost | SUCCESS => {
    "changed": false,
    "ping": "pong"
}`
const CODE_DEVOPSANSIBLE_5 = `cat > harden.yml << 'EOF'
---
- name: Basic server hardening
  hosts: localhost
  connection: local
  become: true
  tasks:
    - name: Ensure fail2ban is installed
      apt:
        name: fail2ban
        state: present
        update_cache: true

    - name: Ensure fail2ban is running
      service:
        name: fail2ban
        state: started
        enabled: true

    - name: Set kernel hardening sysctl values
      sysctl:
        name: "{{ item.key }}"
        value: "{{ item.value }}"
        state: present
        reload: true
      loop:
        - { key: net.ipv4.tcp_syncookies,              value: '1' }
        - { key: net.ipv4.conf.all.accept_redirects,   value: '0' }
        - { key: kernel.randomize_va_space,            value: '2' }
EOF

ansible-playbook harden.yml`
const CODE_DEVOPSANSIBLE_6 = `PLAY [Basic server hardening] ****

TASK [Ensure fail2ban is installed] ****
ok: [localhost]

TASK [Ensure fail2ban is running] ****
ok: [localhost]

TASK [Set kernel hardening sysctl values] ****
ok: [localhost] => (item={'key': 'net.ipv4.tcp_syncookies', ...})

PLAY RECAP ****
localhost : ok=3  changed=0  unreachable=0  failed=0`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What makes Ansible "agentless" and why is this an advantage?',
    options: [
      'Ansible uses UDP instead of TCP, requiring no persistent connection',
      'Ansible connects to managed nodes via SSH (Linux) or WinRM (Windows) using existing infrastructure — no additional software needs to be installed on managed nodes',
      'Ansible runs on the managed nodes without any central controller',
      'Ansible uses a push model, so nodes do not need to pull configurations',
    ],
    correct: 1,
    explanation: 'Ansible uses SSH on Linux/Unix and WinRM on Windows — protocols already running on virtually every server. No agent installation, no firewall exceptions for new ports, no agent version management. The control node (where you run ansible-playbook) connects to managed nodes, executes Python modules over the connection, then disconnects. This dramatically reduces the operational overhead of adopting Ansible.',
  },
  {
    id: 'q2',
    question: 'What is an Ansible playbook and how does it differ from an ad-hoc command?',
    options: [
      'Playbooks run faster; ad-hoc commands are more secure',
      'A playbook is a YAML file defining an ordered sequence of tasks, variables, and roles to execute; an ad-hoc command runs a single module directly from the command line for one-off operations',
      'Playbooks run on Windows; ad-hoc commands run on Linux',
      'They are identical — playbooks are just saved ad-hoc commands',
    ],
    correct: 1,
    explanation: 'Ad-hoc: ansible all -m ping or ansible webservers -m apt -a "name=nginx state=present" — quick one-liner for a single task. Playbook: a YAML file with multiple plays, each targeting hosts and running tasks in sequence. Playbooks are version-controlled, repeatable, documented, and support variables, conditionals, loops, handlers, and roles. Ad-hoc is for exploration and quick fixes; playbooks are for production automation.',
  },
  {
    id: 'q3',
    question: 'What is idempotency in Ansible and why does it matter?',
    options: [
      'Running a playbook consumes the same CPU regardless of how many tasks it has',
      'Running an Ansible task multiple times produces the same result as running it once — if the desired state already exists, Ansible makes no changes (status: ok instead of changed)',
      'All Ansible tasks run in parallel simultaneously',
      'Ansible tasks are automatically retried on failure',
    ],
    correct: 1,
    explanation: 'Idempotency means running a playbook multiple times is safe — on the first run it creates/modifies resources, on subsequent runs it detects they\'re already in the desired state and reports "ok" with no changes. The apt module with state=present checks if the package is installed; if it is, no apt install is run. This makes Ansible playbooks safe to run regularly for compliance enforcement, not just one-time setup.',
  },
  {
    id: 'q4',
    question: 'What is an Ansible role and when should you use one instead of a flat playbook?',
    options: [
      'A role is an Ansible user account with elevated permissions',
      'A role is a structured, reusable unit of automation with defined directories for tasks, handlers, variables, templates, and files — use roles when a playbook grows beyond ~50 tasks or when the same logic applies to multiple playbooks',
      'Roles are required for Windows automation only',
      'A role runs tasks as a different user (sudo equivalent)',
    ],
    correct: 1,
    explanation: 'An Ansible role organises automation into a standard directory structure: tasks/, handlers/, vars/, defaults/, templates/, files/, meta/. Roles are reusable: ansible-galaxy install geerlingguy.nginx gives you a production-quality nginx role immediately. When your webserver.yml playbook grows to 200 tasks across installation, configuration, and hardening — split it into roles: nginx, php, firewall, monitoring. Each role is independently tested and reusable across projects.',
  },
  {
    id: 'q5',
    question: 'What does "ansible-vault encrypt vars/secrets.yml" do?',
    options: [
      'Validates that the YAML file contains no syntax errors',
      'Encrypts the file with AES-256 using a vault password — allowing secrets like passwords and API keys to be safely stored in version control',
      'Creates a digital signature for the file to verify authenticity',
      'Compresses the file to reduce repository size',
    ],
    correct: 1,
    explanation: 'ansible-vault encrypt uses AES-256-CBC to encrypt a file with a vault password. The encrypted file can be committed to Git — without the vault password, it\'s unreadable. At runtime, ansible-playbook --ask-vault-pass or --vault-password-file decrypts on the fly. This solves the secrets-in-Git problem: database passwords, API keys, and SSL private keys can live in the repo safely. Use ansible-vault edit to modify encrypted files.',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info:'callout-info', warning:'callout-warning', success:'callout-success' }
  return (
    <div className={`callout ${s[type]}`}>
      <span className="callout-icon">{icon}</span>
      <div className="callout-body">{title && <strong>{title}</strong>}{children}</div>
    </div>
  )
}

function LabStep({ number, description, command, language='yaml', output }) {
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
          {output.split('\n').map((l,i)=><div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  )
}

export default function DevOpsAnsible() {
  return (
    <LessonLayout
      lessonId="devops-06"
      courseId="devops"
      title="Ansible Configuration Management"
      courseTitle="DevOps"
      courseHref="/devops"
      xp={100}
      readTime="~40 min"
      icon="🤖"
      breadcrumbs={[
        { label:'Home', href:'/' },
        { label:'DevOps', href:'/devops' },
        { label:'Ansible' },
      ]}
      prev={{ title:'Terraform',          href:'/devops/terraform' }}
      next={{ title:'Kubernetes',          href:'/devops/kubernetes' }}
      objectives={[
        'Understand Ansible\'s agentless architecture and connection model',
        'Write an inventory file and test connectivity with ansible ping',
        'Write playbooks with tasks, variables, handlers, and conditionals',
        'Use common modules: apt, copy, template, service, user',
        'Encrypt secrets with ansible-vault',
        'Structure large automation with roles',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Ansible automates configuration management, application deployment, and
          multi-tier orchestration. Its agentless design — using existing SSH
          infrastructure — means you can start managing 100 servers in the next
          30 minutes with zero pre-installation on those servers.
        </p>
      </section>

      <section>
        <h2>Inventory & Connectivity</h2>
        <CodeBlock title="inventory.ini — defining your managed hosts" language="bash"
          code={CODE_DEVOPSANSIBLE_1} />
      </section>

      <section>
        <h2>Writing Playbooks</h2>
        <CodeBlock title="web-server.yml — production playbook structure" language="yaml"
          code={CODE_DEVOPSANSIBLE_2} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB DEVOPS-6</span>
            <span className="text-sm font-semibold text-white">Configure Ubuntu Server with Ansible from the Control Node</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Install Ansible on the Ubuntu VM (acts as both controller and managed node)."
              command={CODE_DEVOPSANSIBLE_3}
              language="bash"
              output={CODE_DEVOPSANSIBLE_4}
            />
            <LabStep number={2}
              description="Write and run a hardening playbook against localhost."
              command={CODE_DEVOPSANSIBLE_5}
              output={CODE_DEVOPSANSIBLE_6}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="devops-06" title="Ansible Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={50} />
      </section>
    </LessonLayout>
  )
}
