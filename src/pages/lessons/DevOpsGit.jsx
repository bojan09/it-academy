import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_DEVOPSGIT_1 = `# ── Initial setup (once) ─────────────────────────────────────
git config --global user.name "Your Name"
git config --global user.email "you@company.com"
git config --global core.editor "vim"
git config --global init.defaultBranch main

# ── Start work ───────────────────────────────────────────────
git clone git@github.com:company/infrastructure.git
cd infrastructure
git checkout -b feature/add-monitoring    # Create & switch to new branch

# ── The work loop ────────────────────────────────────────────
# ... make changes ...
git status                  # See what changed
git diff                    # See exactly what changed
git add monitoring.tf       # Stage specific file
git add -p                  # Stage interactively (review each hunk)
git commit -m 'feat: add Prometheus monitoring stack'

# ── Stay up to date ──────────────────────────────────────────
git fetch origin            # Download remote changes (no merge)
git rebase origin/main      # Replay your commits on top of latest main

# ── Share your work ──────────────────────────────────────────
git push origin feature/add-monitoring
# Open Pull Request on GitHub/GitLab

# ── After PR is merged ───────────────────────────────────────
git checkout main
git pull origin main
git branch -d feature/add-monitoring`
const CODE_DEVOPSGIT_2 = `# ── Terraform ────────────────────────────────────────────────
.terraform/
*.tfstate
*.tfstate.backup
*.tfstate.*.backup
crash.log
override.tf
override.tf.json

# ── Secrets & credentials ────────────────────────────────────
.env
*.env
*.pem
*.key
secrets.yml
credentials

# ── Ansible ──────────────────────────────────────────────────
*.retry
inventory/production

# ── OS & editor files ─────────────────────────────────────────
.DS_Store
Thumbs.db
.vscode/
.idea/

# ── Python ───────────────────────────────────────────────────
__pycache__/
*.pyc
venv/
.env`
const CODE_DEVOPSGIT_3 = `sudo apt install git -y
git --version

git config --global user.name 'Lab SysAdmin'
git config --global user.email 'admin@lab.local'
git config --global init.defaultBranch main
git config --list`
const CODE_DEVOPSGIT_4 = `git version 2.43.0
user.name=Lab SysAdmin
user.email=admin@lab.local
init.defaultbranch=main`
const CODE_DEVOPSGIT_5 = `mkdir -p ~/lab-scripts && cd ~/lab-scripts
git init

# Create .gitignore
cat > .gitignore << 'EOF'
*.log
*.tmp
__pycache__/
*.pyc
venv/
.env
secrets/
EOF

# Create README
echo '# Lab Scripts' > README.md
echo 'Automation scripts for the SysAdminPro lab environment.' >> README.md

# Stage and commit
git add .
git commit -m 'init: initial repository setup with .gitignore'`
const CODE_DEVOPSGIT_6 = `Initialized empty Git repository in /home/user/lab-scripts/.git/

[main (root-commit) a1b2c3d] init: initial repository setup with .gitignore
 2 files changed, 4 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 README.md`
const CODE_DEVOPSGIT_7 = `# Create feature branch
git checkout -b feature/health-check

# Add the health check script
cat > health-check.sh << 'SCRIPT'
#!/bin/bash
echo '=== System Health ===' 
df -h / | tail -1
free -h | grep Mem
systemctl is-active ssh && echo 'SSH: OK' || echo 'SSH: DOWN'
SCRIPT
chmod +x health-check.sh

git add health-check.sh
git commit -m 'feat: add system health check script'

# Merge back to main
git checkout main
git merge feature/health-check --no-ff -m 'merge: health-check feature'
git branch -d feature/health-check

git log --oneline --graph`
const CODE_DEVOPSGIT_8 = `*   b4c5d6e merge: health-check feature
|\\
| * 9a8b7c6 feat: add system health check script
|/
* a1b2c3d init: initial repository setup with .gitignore`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What does "git commit --amend" do?',
    options: [
      'Creates a new commit that undoes the previous commit',
      'Modifies the most recent commit — changing its message and/or adding staged changes',
      'Merges the current branch into main',
      'Applies a commit from another branch to the current branch',
    ],
    correct: 1,
    explanation: 'git commit --amend rewrites the most recent commit. Use it to fix a typo in a commit message or to add files you forgot to stage. Warning: amending rewrites history — never amend commits that have already been pushed to a shared repository, as it will cause divergence for other team members.',
  },
  {
    id: 'q2',
    question: 'What is the difference between "git merge" and "git rebase"?',
    options: [
      'merge combines branches by creating a new merge commit; rebase replays commits on top of another branch for a linear history',
      'merge is faster; rebase is more secure',
      'merge works with remote branches; rebase only works locally',
      'They produce identical results — just different commands for the same operation',
    ],
    correct: 0,
    explanation: 'git merge creates a merge commit that has two parents, preserving the full history of both branches. git rebase replays your commits on top of another branch, rewriting them with new commit hashes — this creates a cleaner, linear history but rewrites history. Golden rule: never rebase branches that others are working on.',
  },
  {
    id: 'q3',
    question: 'In GitFlow, what is the purpose of a "hotfix" branch?',
    options: [
      'A branch for developing experimental features that may be discarded',
      'A branch created from main/master to fix critical production bugs without going through the full release cycle',
      'A branch that automatically deploys to production on each commit',
      'A branch used to resolve merge conflicts between feature branches',
    ],
    correct: 1,
    explanation: 'A hotfix branch is created directly from main (production) to fix a critical bug without waiting for the next planned release. After the fix is committed, it is merged back into both main AND develop to ensure the fix is included in future development. This allows emergency patches without disrupting active feature work in the develop branch.',
  },
  {
    id: 'q4',
    question: 'What does ".gitignore" do and what should always be in it for infrastructure repositories?',
    options: [
      'Lists files that Git will delete when running git clean',
      'Lists patterns for files Git should not track — important for secrets, build artifacts, and OS files',
      'Lists users who do not have push access to the repository',
      'Defines which branches should be protected from force-push',
    ],
    correct: 1,
    explanation: '.gitignore tells Git to not track matching files. For infrastructure repos always include: *.tfstate and *.tfstate.backup (Terraform state files contain sensitive data), .env and *.env files (contain secrets), credentials files, .terraform/ directories, and OS files like .DS_Store and Thumbs.db. Never commit secrets to Git — even in private repos.',
  },
  {
    id: 'q5',
    question: 'What is "git stash" useful for in a sysadmin workflow?',
    options: [
      'Permanently removing files from the repository history',
      'Temporarily shelving uncommitted changes so you can switch branches or apply an urgent fix without committing incomplete work',
      'Archiving old branches into a compressed format',
      'Storing backup copies of the repository on a remote server',
    ],
    correct: 1,
    explanation: 'git stash saves your uncommitted changes (both staged and unstaged) to a stack and reverts your working directory to HEAD. Use it when you need to switch context quickly — e.g., you\'re in the middle of a change but need to urgently fix something on another branch. Restore with git stash pop (apply and remove) or git stash apply (apply and keep).',
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

export default function DevOpsGit() {
  return (
    <LessonLayout
      lessonId="devops-02"
      courseId="devops"
      title="Git & Version Control"
      courseTitle="DevOps"
      courseHref="/devops"
      xp={60}
      readTime="~25 min"
      icon="🌿"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'DevOps', href: '/devops' },
        { label: 'Git & Version Control' },
      ]}
      prev={{ title: 'DevOps Principles & Culture', href: '/devops/principles' }}
      next={{ title: 'Docker Containers',            href: '/devops/docker' }}
      objectives={[
        'Understand the Git object model: commits, trees, blobs, refs',
        'Use the daily Git workflow confidently: stage, commit, branch, merge',
        'Resolve merge conflicts calmly and correctly',
        'Apply GitFlow and trunk-based branching strategies',
        'Version control infrastructure code (Terraform, Ansible, scripts)',
        'Protect secrets with .gitignore and git-crypt',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Git is the foundation of all modern software delivery — and increasingly of
          infrastructure management too. Infrastructure as Code (Terraform, Ansible,
          CloudFormation) lives in Git. Scripts live in Git. Configuration lives in Git.
          If it's not in version control, it doesn't exist to anyone else on the team.
        </p>
        <Callout type="info" icon="💡" title="Git for sysadmins is non-negotiable">
          Every modern sysadmin role expects Git fluency. It's not optional — it's the
          standard way infrastructure is managed, reviewed, and deployed.
        </Callout>
      </section>

      <section>
        <h2>The Git Object Model</h2>
        <p>
          Understanding what Git actually stores makes every command make sense.
          Git is a content-addressable filesystem — everything is an object identified by a SHA-1 hash.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {[
            { type: 'blob',   icon: '📄', color: 'text-accent-green', desc: 'File contents at a point in time. No filename — just the bytes.' },
            { type: 'tree',   icon: '🌲', color: 'text-brand-300',    desc: 'A directory listing — maps filenames to blob hashes.' },
            { type: 'commit', icon: '💾', color: 'text-accent-cyan',  desc: 'A snapshot pointer — tree hash + parent commit + author + message.' },
            { type: 'ref',    icon: '🏷️', color: 'text-accent-amber', desc: 'A human-readable pointer to a commit hash (branch, tag, HEAD).' },
          ].map(o => (
            <div key={o.type} className="info-card py-4 text-center">
              <span className="text-2xl block mb-2">{o.icon}</span>
              <code className={`font-mono font-bold text-sm ${o.color}`}>{o.type}</code>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">{o.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Daily Git Workflow</h2>
        <CodeBlock title="The complete daily workflow" language="bash"
          code={CODE_DEVOPSGIT_1} />
      </section>

      <section>
        <h2>Branching Strategies</h2>
        <div className="grid sm:grid-cols-2 gap-5 mt-4">
          {[
            {
              name: 'GitFlow',
              color: 'border-brand-500/25 bg-brand-500/5',
              text: 'text-brand-300',
              branches: ['main — production only, always deployable', 'develop — integration branch', 'feature/* — new features from develop', 'release/* — release preparation', 'hotfix/* — emergency patches from main'],
              pros: 'Clear structure. Good for products with scheduled releases and multiple environments.',
              cons: 'Complex. Too heavy for continuous deployment workflows.',
            },
            {
              name: 'Trunk-Based Development',
              color: 'border-accent-green/25 bg-accent-green/5',
              text: 'text-accent-green',
              branches: ['main (trunk) — single shared branch', 'Short-lived feature branches (< 2 days)', 'Feature flags for incomplete features', 'Direct commits to main for small changes', 'Tag releases on main'],
              pros: 'Simple. Enables true CI/CD. Preferred by Google, Netflix, Amazon.',
              cons: 'Requires feature flags and strong automated testing culture.',
            },
          ].map(s => (
            <div key={s.name} className={`card p-5 border ${s.color}`}>
              <p className={`font-bold text-base mb-3 ${s.text}`}>{s.name}</p>
              <div className="mb-3">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Branches</p>
                {s.branches.map(b => (
                  <div key={b} className="flex gap-2 text-xs text-slate-400 mb-1">
                    <span className={`flex-shrink-0 ${s.text}`}>▸</span>{b}
                  </div>
                ))}
              </div>
              <p className="text-xs text-accent-green mb-1">✓ {s.pros}</p>
              <p className="text-xs text-slate-500">↳ {s.cons}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Infrastructure as Code in Git</h2>
        <CodeBlock title=".gitignore for infrastructure repos" language="bash"
          code={CODE_DEVOPSGIT_2} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB DEVOPS-2</span>
            <span className="text-sm font-semibold text-white">Version Control Your Scripts Repository</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Install Git and configure identity on the Ubuntu Server VM."
              command={CODE_DEVOPSGIT_3}
              output={CODE_DEVOPSGIT_4}
            />
            <LabStep number={2}
              description="Create a scripts repository and commit your existing scripts."
              command={CODE_DEVOPSGIT_5}
              output={CODE_DEVOPSGIT_6}
            />
            <LabStep number={3}
              description="Create a feature branch, add a script, and merge it back."
              command={CODE_DEVOPSGIT_7}
              output={CODE_DEVOPSGIT_8}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="devops-02" title="Git & Version Control Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={30} />
      </section>
    </LessonLayout>
  )
}
