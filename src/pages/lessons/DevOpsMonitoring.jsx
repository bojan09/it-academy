import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_DEVOPSMONITORING_1 = `version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./alerts.yml:/etc/prometheus/alerts.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.retention.time=30d'
    ports: ['9090:9090']
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    ports: ['3000:3000']
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter:latest
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
    ports: ['9100:9100']
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:`
const CODE_DEVOPSMONITORING_2 = `global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - 'alerts.yml'

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
        labels:
          instance: 'lab-ubuntu'`
const CODE_DEVOPSMONITORING_3 = `# ── CPU ──────────────────────────────────────────────────────
# CPU usage % per instance
100 - (avg by(instance) (rate(node_cpu_seconds_total{mode='idle'}[5m])) * 100)

# ── Memory ───────────────────────────────────────────────────
# Available memory %
node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100

# ── Disk ─────────────────────────────────────────────────────
# Disk usage % per mount
100 - (node_filesystem_avail_bytes{fstype!~'tmpfs|overlay'} /
       node_filesystem_size_bytes{fstype!~'tmpfs|overlay'} * 100)

# ── Network ──────────────────────────────────────────────────
# Network throughput (bytes/sec receive)
rate(node_network_receive_bytes_total{device!='lo'}[5m])

# ── Alerts.yml example ───────────────────────────────────────
# groups:
#   - name: infrastructure
#     rules:
#       - alert: HighCPU
#         expr: 100 - (avg by(instance)(rate(node_cpu_seconds_total{mode='idle'}[5m]))*100) > 90
#         for: 5m
#         labels:
#           severity: warning
#         annotations:
#           summary: 'CPU above 90% for 5 minutes on {{ $labels.instance }}'`
const CODE_DEVOPSMONITORING_4 = `mkdir -p ~/monitoring && cd ~/monitoring

# Create minimal prometheus config
cat > prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: node
    static_configs:
      - targets: ['node-exporter:9100']
EOF

# Create docker-compose.yml (stripped down)
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    volumes: ['./prometheus.yml:/etc/prometheus/prometheus.yml']
    ports: ['9090:9090']
  grafana:
    image: grafana/grafana
    environment: ['GF_SECURITY_ADMIN_PASSWORD=admin']
    ports: ['3000:3000']
  node-exporter:
    image: prom/node-exporter
    ports: ['9100:9100']
EOF

docker compose up -d
docker compose ps`
const CODE_DEVOPSMONITORING_5 = `NAME                    STATUS
monitoring-prometheus-1  running  0.0.0.0:9090->9090/tcp
monitoring-grafana-1     running  0.0.0.0:3000->3000/tcp
monitoring-node-exporter-1 running  0.0.0.0:9100->9100/tcp`
const CODE_DEVOPSMONITORING_6 = `# Check node exporter is exposing metrics
curl -s http://localhost:9100/metrics | grep node_cpu | head -5

# Query via Prometheus API
curl -s 'http://localhost:9090/api/v1/query?query=up' |
  python3 -c "import json,sys; d=json.load(sys.stdin); print([r['metric']['job'] for r in d['data']['result']])"`
const CODE_DEVOPSMONITORING_7 = `node_cpu_seconds_total{cpu='0',mode='idle'} 12345.67
node_cpu_seconds_total{cpu='0',mode='system'} 234.56

['node', 'prometheus']   <- both targets UP`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the difference between metrics, logs, and traces in observability?',
    options: [
      'They are three names for the same data collected at different speeds',
      'Metrics = numeric time-series data (CPU %, request rate); Logs = timestamped event records (what happened); Traces = end-to-end request paths through distributed services (how long each step took)',
      'Metrics are for infrastructure; logs are for applications; traces are for databases',
      'Metrics are real-time; logs are stored; traces are calculated retroactively',
    ],
    correct: 1,
    explanation: 'The three pillars of observability: Metrics are aggregated numeric measurements over time — ideal for dashboards and alerting on thresholds (CPU > 90%, error rate > 1%). Logs capture individual events with context — ideal for debugging specific failures. Traces track a single request\'s journey through microservices — ideal for diagnosing latency in distributed systems. Prometheus handles metrics, Loki handles logs, Tempo handles traces — the Grafana stack covers all three.',
  },
  {
    id: 'q2',
    question: 'What is Prometheus\'s pull model and how does it differ from push-based monitoring?',
    options: [
      'Pull means Prometheus downloads metrics from a central storage server',
      'Prometheus scrapes (pulls) metrics from target endpoints at a configured interval; push-based systems have agents push data to a central collector — pull gives Prometheus control over collection timing and makes service discovery easier',
      'Pull model requires less network bandwidth than push',
      'Pull only works within the same datacenter; push works across the internet',
    ],
    correct: 1,
    explanation: 'Prometheus\'s pull model: Prometheus polls a /metrics HTTP endpoint on each target every scrape_interval (default 15s). The target exposes metrics in a simple text format; Prometheus stores them as time series. Advantages: Prometheus controls the collection rate, a misconfigured or crashed application is immediately visible (the scrape fails), and service discovery (K8s, EC2) tells Prometheus what to scrape. For short-lived jobs (batch), use Pushgateway as an intermediary.',
  },
  {
    id: 'q3',
    question: 'What is PromQL and what does rate(http_requests_total[5m]) calculate?',
    options: [
      'PromQL is a SQL dialect; the expression returns the total HTTP requests in the last 5 minutes',
      'PromQL is Prometheus\'s query language; rate() calculates the per-second average rate of increase of the counter over the last 5 minutes — the requests per second',
      'The expression returns all HTTP requests with a 5xx status code',
      'PromQL is a configuration language; the expression sets a 5-minute scrape interval',
    ],
    correct: 1,
    explanation: 'PromQL (Prometheus Query Language) queries time-series data. http_requests_total is a counter (monotonically increasing). rate(metric[5m]) calculates the per-second average increase rate over a 5-minute window — giving you requests/second. Useful PromQL patterns: rate() for counters, increase() for total increase in range, avg() / sum() / max() for aggregation, by(label) for grouping. irate() for instantaneous rate (more reactive, noisier).',
  },
  {
    id: 'q4',
    question: 'What is a Grafana dashboard panel and what types are most useful for infrastructure monitoring?',
    options: [
      'A panel is a section of the Grafana settings menu',
      'A panel is a single visualisation on a dashboard — Time series panels for trends, Stat panels for current values, Gauge panels for utilisation %, Table panels for tabular data, and Alert panels for current alert states',
      'Panels are only available in Grafana Enterprise',
      'A panel is a physical rack panel for organising server cables',
    ],
    correct: 1,
    explanation: 'Grafana panels are the building blocks of dashboards. Common types: Time series — line/bar charts of metric trends over time (CPU, memory, request rate). Stat — single current value with colour thresholds (current error rate: green/yellow/red). Gauge — circular gauge for utilisation (disk 73% = yellow). Table — tabular data with sorting and filtering (top 10 slowest endpoints). Heatmap — request latency distribution. Alert list — shows firing alerts from Alertmanager.',
  },
  {
    id: 'q5',
    question: 'What is an Alertmanager and what does it add beyond Prometheus alerting rules?',
    options: [
      'Alertmanager replaces Prometheus for high-availability environments',
      'Alertmanager receives firing alerts from Prometheus and handles routing, deduplication, grouping, silencing, and delivery to notification channels (Slack, PagerDuty, email) — Prometheus only evaluates rules, Alertmanager handles the operational workflow',
      'Alertmanager stores alert history in a database for compliance',
      'Alertmanager is only needed for more than 100 alert rules',
    ],
    correct: 1,
    explanation: 'Prometheus evaluates alerting rules and sends firing alerts to Alertmanager. Alertmanager then: deduplicates repeated alerts, groups related alerts (don\'t send 50 notifications for 50 pods — group them into one), routes by label (team=ops → Slack #ops, team=security → PagerDuty), handles inhibition (don\'t alert on individual services if the whole DC is down), and supports silences for maintenance windows. Without Alertmanager, Prometheus only logs that an alert fired.',
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

export default function DevOpsMonitoring() {
  return (
    <LessonLayout
      lessonId="devops-08"
      courseId="devops"
      title="Monitoring with Prometheus & Grafana"
      courseTitle="DevOps"
      courseHref="/devops"
      xp={100}
      readTime="~40 min"
      icon="📈"
      breadcrumbs={[
        { label:'Home', href:'/' },
        { label:'DevOps', href:'/devops' },
        { label:'Prometheus & Grafana' },
      ]}
      prev={{ title:'Kubernetes Fundamentals', href:'/devops/kubernetes' }}
      next={null}
      objectives={[
        'Understand the three pillars of observability: metrics, logs, traces',
        'Deploy Prometheus with Docker Compose and configure scrape targets',
        'Write PromQL queries for common infrastructure metrics',
        'Set up Grafana and import Node Exporter dashboards',
        'Configure Alertmanager to route alerts to Slack',
        'Write alerting rules for CPU, memory, and disk thresholds',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Prometheus and Grafana are the de-facto open-source monitoring stack for
          containerised infrastructure. Prometheus collects and stores metrics;
          Grafana visualises them. Together they replace expensive commercial monitoring
          products with a flexible, powerful, community-supported platform used by
          Netflix, SoundCloud, and thousands of engineering teams.
        </p>
      </section>

      <section>
        <h2>Prometheus Architecture</h2>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          {[
            { name:'Prometheus Server', icon:'🔴', desc:'Scrapes metrics from targets every 15s. Stores as time series. Evaluates alerting rules. Exposes HTTP API for queries.' },
            { name:'Exporters',         icon:'📡', desc:'Expose metrics in Prometheus format. Node Exporter (Linux host metrics), Blackbox (HTTP/TCP probes), mysqld_exporter, etc.' },
            { name:'Grafana',           icon:'📊', desc:'Connects to Prometheus as a data source. Builds dashboards with PromQL queries. Handles alerting via Alertmanager integration.' },
          ].map(c => (
            <div key={c.name} className="info-card py-4 text-center">
              <span className="text-3xl">{c.icon}</span>
              <p className="font-bold text-white text-sm mt-2 mb-1">{c.name}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Docker Compose Stack</h2>
        <CodeBlock title="docker-compose.yml — Prometheus + Grafana + Node Exporter" language="yaml"
          code={CODE_DEVOPSMONITORING_1} />
        <CodeBlock className="mt-4" title="prometheus.yml — scrape configuration" language="yaml"
          code={CODE_DEVOPSMONITORING_2} />
      </section>

      <section>
        <h2>PromQL Queries for Infrastructure</h2>
        <CodeBlock title="Essential PromQL queries" language="bash"
          code={CODE_DEVOPSMONITORING_3} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB DEVOPS-8</span>
            <span className="text-sm font-semibold text-white">Deploy Prometheus + Grafana on Ubuntu</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~25 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Deploy the monitoring stack with Docker Compose."
              command={CODE_DEVOPSMONITORING_4}
              output={CODE_DEVOPSMONITORING_5}
            />
            <LabStep number={2}
              description="Verify metrics are flowing and run a PromQL query."
              command={CODE_DEVOPSMONITORING_6}
              output={CODE_DEVOPSMONITORING_7}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to complete the DevOps course.</p>
        <Quiz lessonId="devops-08" title="Prometheus & Grafana Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={50} />
      </section>
    </LessonLayout>
  )
}
