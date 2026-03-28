import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_DEVOPSKUBERNETES_1 = `# ── Deployment ───────────────────────────────────────────────
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-api
  namespace: production
  labels:
    app: web-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-api
  template:
    metadata:
      labels:
        app: web-api
    spec:
      containers:
        - name: web-api
          image: myregistry/web-api:v1.2.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 256Mi
          readinessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
---
# ── Service ──────────────────────────────────────────────────
apiVersion: v1
kind: Service
metadata:
  name: web-api
  namespace: production
spec:
  selector:
    app: web-api      # Routes to pods with this label
  ports:
    - port: 80
      targetPort: 8080
  type: ClusterIP    # Internal only; use LoadBalancer for external`
const CODE_DEVOPSKUBERNETES_2 = `# ── Deploy & update ──────────────────────────────────────────
kubectl apply -f deployment.yaml
kubectl apply -f ./k8s/                    # Apply whole directory
kubectl set image deployment/web-api web-api=myregistry/web-api:v1.3.0

# ── Inspect ──────────────────────────────────────────────────
kubectl get pods -n production
kubectl get deployments -A                  # All namespaces
kubectl describe pod web-api-abc123-xyz -n production
kubectl logs web-api-abc123-xyz -f         # Follow logs
kubectl logs -l app=web-api --all-containers=true

# ── Rollouts ─────────────────────────────────────────────────
kubectl rollout status deployment/web-api
kubectl rollout history deployment/web-api
kubectl rollout undo deployment/web-api    # Rollback
kubectl rollout undo deployment/web-api --to-revision=2

# ── Debug ────────────────────────────────────────────────────
kubectl exec -it pod-name -n production -- bash
kubectl port-forward deployment/web-api 8080:8080
kubectl top pods -n production             # Resource usage

# ── Namespaces ────────────────────────────────────────────────
kubectl get namespaces
kubectl create namespace staging
kubectl config set-context --current --namespace=production`
const CODE_DEVOPSKUBERNETES_3 = `# Install k3s — production-grade K8s that runs on a single VM
curl -sfL https://get.k3s.io | sh -

# Set up kubectl config
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $USER ~/.kube/config

# Verify
kubectl get nodes
kubectl get pods -A`
const CODE_DEVOPSKUBERNETES_4 = `NAME     STATUS   ROLES                  AGE   VERSION
srv01    Ready    control-plane,master   30s   v1.28.4+k3s1`
const CODE_DEVOPSKUBERNETES_5 = `# Create namespace
kubectl create namespace lab

# Deploy nginx
kubectl create deployment nginx --image=nginx:alpine -n lab --replicas=2
kubectl expose deployment nginx --port=80 --type=NodePort -n lab

# Check status
kubectl get pods,svc -n lab

# Get the NodePort
kubectl get svc nginx -n lab -o jsonpath='{.spec.ports[0].nodePort}'
# Visit: http://localhost:<nodeport>`
const CODE_DEVOPSKUBERNETES_6 = `NAME                         READY   STATUS    RESTARTS
pod/nginx-7c79c4bf97-abc12   1/1     Running   0
pod/nginx-7c79c4bf97-def34   1/1     Running   0

NAME    TYPE       CLUSTER-IP     PORT(S)        AGE
nginx   NodePort   10.43.200.50   80:32456/TCP   5s`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the difference between a Pod and a Deployment in Kubernetes?',
    options: [
      'Pods are for stateless apps; Deployments are for stateful apps',
      'A Pod is the smallest deployable unit (one or more containers sharing network/storage); a Deployment manages a desired number of Pod replicas with rolling updates and self-healing',
      'Pods run on worker nodes; Deployments run on the control plane',
      'They are the same thing — Deployment is the new name for Pod',
    ],
    correct: 1,
    explanation: 'A Pod wraps one or more containers that share a network namespace and storage volumes — they always run together on the same node. A Deployment is a controller that says "I want 3 replicas of this Pod running at all times." It manages the ReplicaSet, handles rolling updates (gradually replaces old pods with new ones), and restarts failed pods. Never run bare Pods in production — always use Deployments.',
  },
  {
    id: 'q2',
    question: 'What is a Kubernetes Service and why is it needed?',
    options: [
      'A Service is a container that manages other containers',
      'A Service provides a stable network endpoint (IP + DNS name) for a set of pods — pods are ephemeral with changing IPs, so Services provide the stable address clients connect to',
      'A Service is a background process running inside a container',
      'Services are only needed for external traffic, not internal communication',
    ],
    correct: 1,
    explanation: 'Pod IPs change every time a pod is replaced. Services provide a stable ClusterIP (internal) or LoadBalancer/NodePort (external) address that routes to healthy pod replicas using label selectors. DNS: a Service named "my-api" in namespace "default" is accessible as my-api.default.svc.cluster.local. Types: ClusterIP (internal only), NodePort (accessible on every node\'s IP), LoadBalancer (cloud load balancer), ExternalName (DNS alias).',
  },
  {
    id: 'q3',
    question: 'What is kubectl apply -f deployment.yaml and how does it differ from kubectl create?',
    options: [
      'apply creates resources; create updates them',
      'apply creates or updates resources declaratively using server-side merge — safe to run repeatedly; create only works for new resources and fails if they already exist',
      'They are identical — both create resources from YAML',
      'apply requires admin permissions; create works for standard users',
    ],
    correct: 1,
    explanation: 'kubectl apply is idempotent and declarative — it creates the resource if it doesn\'t exist, or patches it if it does. Run it repeatedly without errors. kubectl create fails with "AlreadyExists" if the resource exists. kubectl apply also records the last-applied configuration as an annotation, enabling three-way merge for subsequent updates. In production, always use apply (or GitOps tooling built on apply) rather than create/replace.',
  },
  {
    id: 'q4',
    question: 'What does a Kubernetes Namespace provide?',
    options: [
      'A network namespace isolating pod traffic at the kernel level',
      'A logical partition of cluster resources — allows multiple teams/environments to share one cluster with separate resource quotas, RBAC policies, and network policies',
      'A separate Kubernetes cluster with its own control plane',
      'A container image registry namespace for organising container images',
    ],
    correct: 1,
    explanation: 'Namespaces divide a single cluster into virtual clusters. Common patterns: separate namespaces per team (team-a, team-b) or per environment (dev, staging, prod — though separate clusters are better for production isolation). Namespaces enable: ResourceQuota (limit CPU/memory per namespace), LimitRange (default resource limits), NetworkPolicy (restrict inter-namespace traffic), and RBAC (give team-a users access only to team-a namespace).',
  },
  {
    id: 'q5',
    question: 'What is a ConfigMap and when should you use a Secret instead?',
    options: [
      'ConfigMaps store configuration files; Secrets store application code',
      'ConfigMap stores non-sensitive configuration (app settings, config files); Secret stores sensitive data (passwords, tokens, TLS certs) — Secrets are base64-encoded and can be encrypted at rest',
      'ConfigMaps are for Linux containers; Secrets are for Windows containers',
      'They are identical — the naming is just conventional',
    ],
    correct: 1,
    explanation: 'ConfigMap holds non-sensitive key-value pairs or config files (log levels, feature flags, config.yaml contents). Secrets hold sensitive data — they are base64-encoded (not encrypted by default — enable encryption at rest in the API server config). Secrets should be managed with an external secrets manager (Vault, AWS Secrets Manager) in production and injected at deploy time. Never commit Secret YAML with actual values to Git.',
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

export default function DevOpsKubernetes() {
  return (
    <LessonLayout
      lessonId="devops-07"
      courseId="devops"
      title="Kubernetes Fundamentals"
      courseTitle="DevOps"
      courseHref="/devops"
      xp={120}
      readTime="~50 min"
      icon="☸️"
      breadcrumbs={[
        { label:'Home', href:'/' },
        { label:'DevOps', href:'/devops' },
        { label:'Kubernetes' },
      ]}
      prev={{ title:'Ansible Configuration Management', href:'/devops/ansible' }}
      next={{ title:'Monitoring with Prometheus & Grafana', href:'/devops/monitoring' }}
      objectives={[
        'Understand Kubernetes architecture: control plane and worker nodes',
        'Know the core objects: Pod, Deployment, Service, ConfigMap, Secret',
        'Use kubectl to deploy, inspect, and manage workloads',
        'Write Deployment and Service YAML manifests',
        'Understand namespaces, resource limits, and health probes',
        'Roll out and roll back Deployments safely',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Kubernetes (K8s) is the standard platform for running containerised workloads
          at scale. If Docker answers "how do I package an application?", Kubernetes
          answers "how do I run thousands of containers reliably across dozens of
          servers?" Understanding K8s is now a core DevOps/infrastructure skill.
        </p>
        <Callout type="info" icon="🧩" title="K8s for sysadmins">
          Kubernetes takes the concepts you already know — processes, networking, storage,
          monitoring — and applies them at container scale. Your Linux and networking
          knowledge transfers directly to understanding how K8s works under the hood.
        </Callout>
      </section>

      <section>
        <h2>Core Architecture</h2>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {[
            {
              name: 'Control Plane',
              color: 'border-brand-500/25 bg-brand-500/5', text: 'text-brand-300',
              components: [
                { n:'kube-apiserver',  d:'The API — all kubectl commands hit this' },
                { n:'etcd',            d:'Distributed key-value store — cluster state' },
                { n:'kube-scheduler',  d:'Assigns Pods to nodes based on resources' },
                { n:'controller-manager', d:'Runs controllers: Deployment, ReplicaSet etc.' },
              ],
            },
            {
              name: 'Worker Nodes',
              color: 'border-accent-cyan/25 bg-accent-cyan/5', text: 'text-accent-cyan',
              components: [
                { n:'kubelet',          d:'Manages pods on the node, talks to API server' },
                { n:'kube-proxy',       d:'Network rules for Service routing' },
                { n:'Container Runtime', d:'containerd or Docker — runs containers' },
                { n:'Pods',            d:'Your actual workloads run here' },
              ],
            },
          ].map(s => (
            <div key={s.name} className={`card p-5 border ${s.color}`}>
              <p className={`font-bold text-sm mb-3 ${s.text}`}>{s.name}</p>
              {s.components.map(c => (
                <div key={c.n} className="flex gap-2 mb-2 text-xs">
                  <code className="text-accent-cyan font-mono font-semibold w-36 flex-shrink-0">{c.n}</code>
                  <span className="text-slate-400">{c.d}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Writing Kubernetes Manifests</h2>
        <CodeBlock title="deployment.yaml + service.yaml — production pattern" language="yaml"
          code={CODE_DEVOPSKUBERNETES_1} />
      </section>

      <section>
        <h2>kubectl Reference</h2>
        <CodeBlock title="Essential kubectl commands" language="bash"
          code={CODE_DEVOPSKUBERNETES_2} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB DEVOPS-7</span>
            <span className="text-sm font-semibold text-white">Deploy a Service to a Local Kubernetes Cluster</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~25 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Install k3s (lightweight K8s) on the Ubuntu VM for local practice."
              command={CODE_DEVOPSKUBERNETES_3}
              output={CODE_DEVOPSKUBERNETES_4}
            />
            <LabStep number={2}
              description="Deploy nginx and expose it via a Service."
              command={CODE_DEVOPSKUBERNETES_5}
              output={CODE_DEVOPSKUBERNETES_6}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="devops-07" title="Kubernetes Fundamentals Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={60} />
      </section>
    </LessonLayout>
  )
}
