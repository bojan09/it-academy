import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_DEVOPSCICD_1 = `name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:    # Manual trigger button in GitHub UI

env:
  PYTHON_VERSION: '3.11'
  APP_NAME: my-sysadmin-tool

jobs:
  # ── Job 1: Lint & Test ───────────────────────────────────
  test:
    name: Lint and Test
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: \${{ env.PYTHON_VERSION }}
          cache: 'pip'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install flake8 pytest

      - name: Lint with flake8
        run: flake8 . --max-line-length=100 --exclude=venv/

      - name: Run tests
        run: pytest tests/ -v --tb=short

  # ── Job 2: Build ─────────────────────────────────────────
  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: [test]     # Only runs after test succeeds
    steps:
      - uses: actions/checkout@v4

      - name: Build image
        run: docker build -t \${{ env.APP_NAME }}:\${{ github.sha }} .

      - name: Push to registry
        if: github.ref == 'refs/heads/main'
        run: |
          echo \${{ secrets.REGISTRY_TOKEN }} | docker login ghcr.io -u \${{ github.actor }} --password-stdin
          docker push ghcr.io/\${{ github.repository }}/\${{ env.APP_NAME }}:\${{ github.sha }}

  # ── Job 3: Deploy to Production ──────────────────────────
  deploy:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build]
    if: github.ref == 'refs/heads/main'
    environment:
      name: production   # Requires manual approval (configured in GitHub Settings)
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: \${{ secrets.PROD_SERVER_IP }}
          username: deploy
          key: \${{ secrets.PROD_SSH_KEY }}
          script: |
            cd /opt/myapp
            docker pull ghcr.io/\${{ github.repository }}/\${{ env.APP_NAME }}:\${{ github.sha }}
            docker compose up -d
            docker system prune -f`
const CODE_DEVOPSCICD_2 = `name: Infrastructure Validation

on:
  push:
    paths:
      - 'scripts/**'
      - 'terraform/**'

jobs:
  validate-scripts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: ShellCheck (lint bash scripts)
        run: |
          sudo apt install shellcheck -y
          find scripts/ -name '*.sh' -exec shellcheck {} +

      - name: Test scripts run without errors
        run: |
          bash scripts/health-check.sh

  validate-terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Terraform Format Check
        run: terraform -chdir=terraform fmt -check

      - name: Terraform Validate
        run: |
          terraform -chdir=terraform init -backend=false
          terraform -chdir=terraform validate`
const CODE_DEVOPSCICD_3 = `cd ~/lab-scripts
mkdir -p .github/workflows

# Create a simple health check test
mkdir -p tests
cat > tests/test_health.sh << 'EOF'
#!/bin/bash
# Simple smoke test
bash health-check.sh
if [ $? -eq 0 ]; then
    echo 'PASS: health-check.sh exited successfully'
    exit 0
else
    echo 'FAIL: health-check.sh exited with error'
    exit 1
fi
EOF
chmod +x tests/test_health.sh`
const CODE_DEVOPSCICD_4 = `cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: ShellCheck - lint all shell scripts
        run: |
          sudo apt install shellcheck -y
          find . -name '*.sh' -not -path './.git/*' -exec shellcheck {} +

      - name: Run smoke tests
        run: bash tests/test_health.sh
EOF

git add .github/ tests/
git commit -m 'ci: add GitHub Actions CI pipeline'
echo 'Push to GitHub to trigger the workflow!'`
const CODE_DEVOPSCICD_5 = `[main abc1234] ci: add GitHub Actions CI pipeline
 2 files changed, 25 insertions(+)
Push to GitHub to trigger the workflow!`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the difference between Continuous Integration (CI) and Continuous Deployment (CD)?',
    options: [
      'CI is for developers; CD is for operations teams',
      'CI automatically builds and tests code on every commit; CD automatically deploys tested code to production (or a staging environment)',
      'CI runs tests manually; CD runs them automatically',
      'CI and CD are the same thing — the terms are used interchangeably',
    ],
    correct: 1,
    explanation: 'CI (Continuous Integration) automatically builds and runs tests every time code is pushed — catching integration problems early. CD (Continuous Delivery/Deployment) takes CI further: tested code is automatically deployed to staging (Delivery) or all the way to production (Deployment). The pipeline is: commit → CI (build + test) → CD (deploy). The goal is to make releases small, frequent, and safe.',
  },
  {
    id: 'q2',
    question: 'In GitHub Actions, what is a "workflow"?',
    options: [
      'A GitHub web interface for reviewing pull requests',
      'An automated process defined in a YAML file that runs in response to events (push, PR, schedule) and contains one or more jobs',
      'A branch protection rule that requires approvals before merging',
      'A GitHub feature for managing project tasks and issues',
    ],
    correct: 1,
    explanation: 'A GitHub Actions workflow is a YAML file stored in .github/workflows/ that defines: trigger events (on: push, pull_request, schedule), one or more jobs, each with steps that run commands or reusable actions. Workflows run on GitHub-hosted or self-hosted runners. Multiple workflows can exist in a repo, each triggered independently.',
  },
  {
    id: 'q3',
    question: 'What is a GitHub Actions "secret" and how should it be used in workflows?',
    options: [
      'A hidden branch in the repository',
      'An encrypted variable stored in GitHub settings, accessible in workflows as ${{ secrets.SECRET_NAME }} — used for passwords, API keys, and deployment credentials',
      'A private repository only visible to organisation members',
      'An encrypted commit message',
    ],
    correct: 1,
    explanation: 'GitHub Actions secrets are encrypted environment variables stored at the repo, environment, or org level. They are accessible in workflow YAML as ${{ secrets.MY_SECRET }} and are masked in logs. Never hardcode passwords or API keys in workflow files — always use secrets. For deployment: store SSH keys, cloud credentials, and registry passwords as secrets.',
  },
  {
    id: 'q4',
    question: 'What does "jobs.<job_id>.needs" do in a GitHub Actions workflow?',
    options: [
      'Lists the packages that must be installed before the job runs',
      'Defines job dependencies — the specified job must complete successfully before this job starts',
      'Sets the minimum GitHub Actions runner version required',
      'Specifies which repository secrets the job needs access to',
    ],
    correct: 1,
    explanation: 'needs creates a dependency chain between jobs. If job B has needs: [build, test], it only runs after both build and test jobs complete successfully. Without needs, all jobs run in parallel. This is how you create sequential pipelines: build → test → deploy. If any dependency fails, the dependent job is skipped automatically.',
  },
  {
    id: 'q5',
    question: 'What is the purpose of a GitHub Actions "environment" with required reviewers?',
    options: [
      'Sets the operating system the workflow runs on',
      'Creates a deployment gate — a human must approve deployment to that environment (e.g. production) before the job proceeds',
      'Limits the workflow to specific branches',
      'Configures environment variables for testing',
    ],
    correct: 1,
    explanation: 'GitHub Environments (Settings > Environments) allow you to define deployment targets (staging, production) with protection rules. With required reviewers, a workflow deploying to production pauses and sends a notification to designated approvers — the job only proceeds after manual approval. This prevents automated pipelines from deploying to production without human oversight.',
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

function LabStep({ number, description, command, language = 'yaml', output }) {
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

export default function DevOpsCICD() {
  return (
    <LessonLayout
      lessonId="devops-04"
      courseId="devops"
      title="CI/CD with GitHub Actions"
      courseTitle="DevOps"
      courseHref="/devops"
      xp={100}
      readTime="~40 min"
      icon="🚀"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'DevOps', href: '/devops' },
        { label: 'CI/CD with GitHub Actions' },
      ]}
      prev={{ title: 'Docker Containers',   href: '/devops/docker' }}
      next={{ title: 'Terraform',           href: '/devops/terraform' }}
      objectives={[
        'Understand the CI/CD pipeline stages and what each accomplishes',
        'Write GitHub Actions workflows with triggers, jobs, and steps',
        'Build a lint → test → build → deploy pipeline',
        'Use secrets, environments, and approval gates',
        'Deploy to a remote server via SSH in a pipeline',
        'Implement matrix builds and caching for efficiency',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          CI/CD pipelines automate the journey from code commit to running in production.
          Every modern engineering team uses them — they are the heartbeat of software delivery.
          GitHub Actions makes CI/CD accessible without managing a separate CI server,
          using simple YAML files stored alongside your code.
        </p>
        <Callout type="info" icon="💡" title="The CI/CD contract">
          A good pipeline is the team's quality gate. It guarantees that code reaching
          production has been automatically built, tested, and validated — making
          deployment a boring, repeatable non-event rather than a stressful manual process.
        </Callout>
      </section>

      <section>
        <h2>GitHub Actions Anatomy</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
          {[
            { term: 'Workflow',   icon: '📄', desc: 'YAML file in .github/workflows/. The complete automation definition.' },
            { term: 'Event',      icon: '⚡', desc: 'What triggers the workflow: push, pull_request, schedule, workflow_dispatch.' },
            { term: 'Job',        icon: '📦', desc: 'A set of steps that run on the same runner. Jobs can run in parallel or sequence.' },
            { term: 'Step',       icon: '▶️', desc: 'A single command or Action within a job. Steps share the same filesystem.' },
            { term: 'Action',     icon: '🔧', desc: 'A reusable unit from the marketplace: actions/checkout, actions/setup-python.' },
            { term: 'Runner',     icon: '🖥️', desc: 'The machine executing the workflow. GitHub-hosted or self-hosted.' },
          ].map(t => (
            <div key={t.term} className="info-card py-3 text-center">
              <span className="text-2xl">{t.icon}</span>
              <p className="font-bold text-white text-sm mt-1">{t.term}</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Complete CI/CD Pipeline Example</h2>
        <CodeBlock title=".github/workflows/deploy.yml — production-ready pipeline" language="yaml"
          code={CODE_DEVOPSCICD_1} />
      </section>

      <section>
        <h2>Pipeline for Infrastructure Scripts</h2>
        <CodeBlock title=".github/workflows/infra-validate.yml — validate shell scripts and Terraform" language="yaml"
          code={CODE_DEVOPSCICD_2} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB DEVOPS-4</span>
            <span className="text-sm font-semibold text-white">Build a CI Pipeline for Your Scripts Repo</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Create the GitHub Actions workflow directory in your lab-scripts repo."
              command={CODE_DEVOPSCICD_3}
              language="bash"
            />
            <LabStep number={2}
              description="Write the CI workflow YAML file."
              command={CODE_DEVOPSCICD_4}
              language="bash"
              output={CODE_DEVOPSCICD_5}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="devops-04" title="CI/CD with GitHub Actions Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={50} />
      </section>
    </LessonLayout>
  )
}
