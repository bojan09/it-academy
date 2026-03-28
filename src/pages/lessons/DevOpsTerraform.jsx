import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_DEVOPSTERRAFORM_1 = `# ── Provider configuration ───────────────────────────────────
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    local = { source = "hashicorp/local", version = "~> 2.4" }
  }
  # Remote state backend (production)
  # backend "s3" {
  #   bucket = "my-terraform-state"
  #   key    = "prod/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

# ── Variables ────────────────────────────────────────────────
variable "environment" {
  type        = string
  description = "Deployment environment: dev, staging, prod"
  default     = "dev"
  validation {
    condition     = contains(["dev","staging","prod"], var.environment)
    error_message = "Must be dev, staging, or prod."
  }
}

variable "server_count" {
  type    = number
  default = 2
}

# ── Locals (computed values) ──────────────────────────────────
locals {
  common_tags = {
    environment = var.environment
    managed_by  = "terraform"
    team        = "infrastructure"
  }
}

# ── Resources ────────────────────────────────────────────────
resource "local_file" "inventory" {
  count    = var.server_count
  filename = "\${path.module}/server-\${count.index + 1}.txt"
  content  = "Server \${count.index + 1} in \${var.environment}"
}

# ── Outputs ──────────────────────────────────────────────────
output "server_files" {
  value = local_file.inventory[*].filename
}`
const CODE_DEVOPSTERRAFORM_2 = `# ── Initialise ───────────────────────────────────────────────
terraform init             # Download providers, set up backend
terraform init -upgrade    # Upgrade provider versions

# ── Validate & Format ────────────────────────────────────────
terraform validate         # Check config syntax
terraform fmt              # Auto-format all .tf files
terraform fmt -check       # Fail if formatting needed (CI gate)

# ── Plan ─────────────────────────────────────────────────────
terraform plan                     # Preview all changes
terraform plan -out=tfplan.binary  # Save plan to file
terraform plan -var 'environment=prod'
terraform plan -target=resource.name  # Plan single resource

# ── Apply ────────────────────────────────────────────────────
terraform apply                        # Interactive (yes/no)
terraform apply -auto-approve          # Non-interactive (CI)
terraform apply tfplan.binary          # Apply saved plan

# ── Inspect state ────────────────────────────────────────────
terraform show                   # Human-readable current state
terraform state list             # All managed resources
terraform state show resource.name  # Details of one resource

# ── Destroy ──────────────────────────────────────────────────
terraform destroy              # Destroy everything (dangerous!)
terraform destroy -target=local_file.inventory[0]  # Targeted`
const CODE_DEVOPSTERRAFORM_3 = `wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform -y
terraform version`
const CODE_DEVOPSTERRAFORM_4 = `mkdir -p ~/terraform-lab && cd ~/terraform-lab

cat > main.tf << 'EOF'
terraform {}

variable "servers" {
  default = ["web01", "app01", "db01"]
}

resource "local_file" "inventory" {
  for_each = toset(var.servers)
  filename = "\${path.module}/inventory/\${each.key}.txt"
  content  = "hostname: \${each.key}\\
managed_by: terraform"
}

output "files_created" {
  value = keys(local_file.inventory)
}
EOF

terraform init
terraform plan
terraform apply -auto-approve
ls inventory/`
const CODE_DEVOPSTERRAFORM_5 = `Terraform used the selected providers to generate the following execution plan.

  + resource "local_file" "inventory" "app01"  will be created
  + resource "local_file" "inventory" "db01"   will be created
  + resource "local_file" "inventory" "web01"  will be created

Apply complete! Resources: 3 added, 0 changed, 0 destroyed.

app01.txt  db01.txt  web01.txt`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the purpose of "terraform plan" before "terraform apply"?',
    options: [
      'It validates Terraform is installed correctly',
      'It shows a preview of all changes Terraform will make — additions, modifications, and destructions — without making any actual changes to infrastructure',
      'It plans which cloud region to deploy resources into',
      'It generates the Terraform state file',
    ],
    correct: 1,
    explanation: 'terraform plan creates an execution plan showing exactly what Terraform will create, modify, or destroy when you run apply. Green + lines = create, yellow ~ lines = modify in-place, red - lines = destroy. Always review the plan before applying, especially for modifications and destructions. In CI/CD: run plan in PR review so the team can see infrastructure changes before merge.',
  },
  {
    id: 'q2',
    question: 'What is Terraform state and why must it never be committed to Git?',
    options: [
      'Terraform state is just a log file — it\'s safe to commit',
      'Terraform state tracks the real-world resources Terraform manages, often containing sensitive values like passwords, private keys, and connection strings in plaintext',
      'Terraform state is binary and cannot be read by humans',
      'Terraform state is regenerated on every plan and does not need to be stored',
    ],
    correct: 1,
    explanation: 'The terraform.tfstate file is Terraform\'s record of what infrastructure it manages and their current attributes. It frequently contains sensitive data in plaintext: database passwords, private keys, API tokens. Always store state in a remote backend (S3 + DynamoDB locking, Azure Storage, Terraform Cloud) and add *.tfstate to .gitignore. Remote backends also enable team collaboration — multiple people working on the same infrastructure safely.',
  },
  {
    id: 'q3',
    question: 'What is the purpose of a Terraform module?',
    options: [
      'A module is a plugin that extends Terraform\'s core functionality',
      'A reusable, self-contained package of Terraform configuration that encapsulates resources — call it multiple times with different inputs instead of duplicating code',
      'A module is a Terraform-managed VM running the Terraform engine',
      'Modules are required for all Terraform configurations',
    ],
    correct: 1,
    explanation: 'A Terraform module is a directory of .tf files with defined input variables and output values. Instead of copy-pasting resource blocks for similar infrastructure (e.g. multiple web server VMs), define a module once and call it: module "web_server" { source = "./modules/vm"; name = "web01"; size = "Standard_B2s" }. Modules enforce consistency, reduce duplication, and can be versioned and shared via the Terraform Registry.',
  },
  {
    id: 'q4',
    question: 'What does "terraform import" do?',
    options: [
      'Imports variables from a .tfvars file',
      'Brings an existing real-world resource under Terraform management by adding it to the state file — without destroying and recreating it',
      'Downloads provider plugins from the Terraform Registry',
      'Imports a Terraform module from GitHub',
    ],
    correct: 1,
    explanation: 'terraform import allows you to adopt existing infrastructure into Terraform management. Example: you have a manually-created VM and want to manage it with Terraform going forward. terraform import azurerm_virtual_machine.web /subscriptions/.../virtualMachines/web01 adds the VM to state. You still need to write the matching resource block in your .tf files. This is the migration path from manual/click-ops to IaC.',
  },
  {
    id: 'q5',
    question: 'What is the significance of "terraform destroy" and when should it be used carefully?',
    options: [
      'It only removes the state file, leaving infrastructure intact',
      'It terminates ALL infrastructure managed by the current Terraform configuration — use only for dev/test environments, never accidentally on production',
      'It removes unused provider plugins to free disk space',
      'It resets Terraform configuration to defaults',
    ],
    correct: 1,
    explanation: 'terraform destroy terminates every resource in the state file. It is the right command for tearing down a dev/test environment. On production: use targeted destruction (terraform destroy -target=resource.name) if you need to remove a specific resource, and always run plan first to confirm scope. Add a confirmation step in CI/CD pipelines: require explicit approval for destroys. Many teams restrict destroy access via Sentinel policies.',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info:'callout-info', warning:'callout-warning', success:'callout-success', danger:'callout-danger' }
  return (
    <div className={`callout ${s[type]}`}>
      <span className="callout-icon">{icon}</span>
      <div className="callout-body">{title && <strong>{title}</strong>}{children}</div>
    </div>
  )
}

function LabStep({ number, description, command, language='bash', output }) {
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

export default function DevOpsTerraform() {
  return (
    <LessonLayout
      lessonId="devops-05"
      courseId="devops"
      title="Terraform — Infrastructure as Code"
      courseTitle="DevOps"
      courseHref="/devops"
      xp={100}
      readTime="~45 min"
      icon="🏗️"
      breadcrumbs={[
        { label:'Home', href:'/' },
        { label:'DevOps', href:'/devops' },
        { label:'Terraform' },
      ]}
      prev={{ title:'CI/CD with GitHub Actions', href:'/devops/cicd' }}
      next={{ title:'Ansible Configuration Management', href:'/devops/ansible' }}
      objectives={[
        'Understand Terraform\'s core workflow: write → init → plan → apply → destroy',
        'Write HCL configuration for common infrastructure resources',
        'Use variables, locals, and outputs to create reusable configurations',
        'Manage state safely with remote backends',
        'Create reusable modules for consistent infrastructure patterns',
        'Validate configurations with plan before applying',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Terraform by HashiCorp is the de-facto standard for Infrastructure as Code
          across cloud providers. With a single tool and HCL (HashiCorp Configuration
          Language), you can provision and manage infrastructure on AWS, Azure, GCP,
          VMware, and 3,000+ other providers — consistently, reproducibly, and with
          a full change history in Git.
        </p>
        <Callout type="info" icon="🔄" title="The Terraform workflow">
          <strong>Write</strong> HCL config files → <strong>Init</strong> (download providers) →
          <strong>Plan</strong> (preview changes) → <strong>Apply</strong> (create/modify resources) →
          <strong>Destroy</strong> (tear down). This is the complete lifecycle.
        </Callout>
      </section>

      <section>
        <h2>HCL Syntax & Core Concepts</h2>
        <CodeBlock title="main.tf — complete example with variables and outputs" language="bash"
          code={CODE_DEVOPSTERRAFORM_1} />
      </section>

      <section>
        <h2>Terraform Workflow Commands</h2>
        <CodeBlock title="Core commands reference" language="bash"
          code={CODE_DEVOPSTERRAFORM_2} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB DEVOPS-5</span>
            <span className="text-sm font-semibold text-white">Write and Apply a Terraform Configuration on Ubuntu</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Install Terraform on the Ubuntu VM."
              command={CODE_DEVOPSTERRAFORM_3}
              output="Terraform v1.7.0"
            />
            <LabStep number={2}
              description="Write a Terraform config that manages local files as a simple demo."
              command={CODE_DEVOPSTERRAFORM_4}
              output={CODE_DEVOPSTERRAFORM_5}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="devops-05" title="Terraform Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={50} />
      </section>
    </LessonLayout>
  )
}
