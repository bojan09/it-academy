import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'
import GlossaryTooltip from '../../components/GlossaryTooltip.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_DOCKERCONTAINERS_1 = `# ── Stage 1: Build dependencies ────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build

# Copy only requirements first (better layer caching)
COPY requirements.txt .

# Install dependencies into a prefix directory
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt


# ── Stage 2: Final minimal image ────────────────────────────
FROM python:3.11-slim

# Security: create non-root user
RUN useradd --create-home --shell /bin/bash --uid 1001 appuser

WORKDIR /app

# Copy installed packages from builder stage
COPY --from=builder /install /usr/local

# Copy application code
COPY --chown=appuser:appuser . .

# Security: switch to non-root user
USER appuser

# Document what port the app uses (doesn't actually publish it)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:8080/health || exit 1

# Default command
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]`
const CODE_DOCKERCONTAINERS_2 = `version: '3.9'

services:

  # Nginx reverse proxy
  proxy:
    image: nginx:1.25-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
    depends_on:
      - app
    restart: unless-stopped
    networks:
      - frontend

  # Application server
  app:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=postgresql://appuser:\${DB_PASSWORD}@db:5432/appdb
      - SECRET_KEY=\${SECRET_KEY}
    volumes:
      - app-data:/app/data
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - frontend
      - backend

  # PostgreSQL database
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: \${DB_PASSWORD}
      POSTGRES_DB: appdb
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U appuser -d appdb"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - backend

volumes:
  db-data:
  app-data:

networks:
  frontend:
  backend:
    internal: true    # db not accessible from outside`
const CODE_DOCKERCONTAINERS_3 = `# Official Docker install (Ubuntu)
curl -fsSL https://get.docker.com | sudo bash

# Add your user to the docker group (no more sudo needed)
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker compose version`
const CODE_DOCKERCONTAINERS_4 = `Docker version 25.0.3, build 4debf41
Docker Compose version v2.24.6`
const CODE_DOCKERCONTAINERS_5 = `# Pull the nginx image
docker pull nginx:alpine

# Run it: -d detached, -p port map, --name friendly name
docker run -d -p 8080:80 --name my-nginx nginx:alpine

# Verify it's running
docker ps

# Test
curl http://localhost:8080 | grep "<title>"`
const CODE_DOCKERCONTAINERS_6 = `CONTAINER ID  IMAGE          COMMAND                 STATUS
a1b2c3d4e5f6  nginx:alpine   "/docker-entrypoint…"  Up 3 seconds

<title>Welcome to nginx!</title>`
const CODE_DOCKERCONTAINERS_7 = `# View logs
docker logs my-nginx
docker logs -f my-nginx   # Follow logs

# Execute a shell inside the running container
docker exec -it my-nginx sh

# Inside the container:
ls /etc/nginx/
cat /etc/nginx/conf.d/default.conf
exit

# Inspect container details (IP, mounts, env)
docker inspect my-nginx | python3 -m json.tool | head -60`
const CODE_DOCKERCONTAINERS_8 = `mkdir -p ~/docker-lab && cd ~/docker-lab

# Create the HTML page
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
  <head><title>SysAdminPro Lab</title></head>
  <body>
    <h1>🐳 Docker Lab Running!</h1>
    <p>Served from a custom Docker image.</p>
  </body>
</html>
EOF

# Create the Dockerfile
cat > Dockerfile << 'EOF'
FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html
EOF

# Build the image
docker build -t lab-web:v1 .

# Run it
docker run -d -p 8081:80 --name lab-web lab-web:v1
curl http://localhost:8081 | grep "SysAdminPro"`
const CODE_DOCKERCONTAINERS_9 = `Successfully built 7a8b9c0d1e2f
Successfully tagged lab-web:v1

<h1>🐳 Docker Lab Running!</h1>`
const CODE_DOCKERCONTAINERS_10 = `mkdir -p ~/docker-compose-lab && cd ~/docker-compose-lab

cat > docker-compose.yml << 'EOF'
version: '3.9'
services:
  web:
    image: nginx:alpine
    ports:
      - "9090:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro
    restart: unless-stopped

  portainer:
    image: portainer/portainer-ce:latest
    ports:
      - "9000:9000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer-data:/data
    restart: unless-stopped

volumes:
  portainer-data:
EOF

mkdir html && echo "<h1>Docker Compose Lab ✔</h1>" > html/index.html

# Start all services
docker compose up -d

# Check status
docker compose ps`
const CODE_DOCKERCONTAINERS_11 = `NAME                 IMAGE                     STATUS
docker-lab-web-1     nginx:alpine              Up 5 seconds
docker-lab-portainer portainer/portainer-ce    Up 5 seconds

# Access Portainer GUI: http://192.168.100.20:9000`
const CODE_DOCKERCONTAINERS_12 = `# Stop and remove compose stack
docker compose down -v

# Remove individual containers
docker stop my-nginx lab-web
docker rm my-nginx lab-web

# Remove images
docker rmi lab-web:v1

# Full system cleanup (removes all unused resources)
docker system prune -a --volumes -f

# Verify
docker ps -a
docker images`
const CODE_DOCKERCONTAINERS_13 = `# ── Images ──────────────────────────────────────────────────
docker pull nginx:alpine               # Pull image
docker images                          # List images
docker build -t myapp:v1 .             # Build from Dockerfile
docker tag myapp:v1 registry/myapp:v1  # Tag for push
docker push registry/myapp:v1          # Push to registry
docker rmi myapp:v1                    # Remove image
docker image prune                     # Remove dangling images

# ── Containers ───────────────────────────────────────────────
docker run -d -p 8080:80 --name web nginx:alpine
docker run -it ubuntu:22.04 bash       # Interactive shell
docker ps                              # Running containers
docker ps -a                           # All containers
docker stop web && docker rm web       # Stop + remove
docker logs -f web                     # Follow logs
docker exec -it web sh                 # Shell in container
docker inspect web                     # Full details
docker stats                           # Live resource usage

# ── Volumes ──────────────────────────────────────────────────
docker volume create mydata
docker volume ls
docker run -v mydata:/data nginx:alpine
docker run -v $(pwd)/html:/usr/share/nginx/html:ro nginx:alpine

# ── Compose ──────────────────────────────────────────────────
docker compose up -d                   # Start all services
docker compose down                    # Stop + remove containers
docker compose down -v                 # Also remove volumes
docker compose ps                      # Service status
docker compose logs -f service-name    # Follow service logs
docker compose exec service-name sh    # Shell in service
docker compose build                   # Rebuild images

# ── Cleanup ──────────────────────────────────────────────────
docker system prune                    # Remove unused resources
docker system prune -a --volumes -f    # Nuclear option`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the key difference between a Docker image and a Docker container?',
    options: [
      'Images run live workloads; containers are stored templates',
      'An image is a read-only template; a container is a running instance of an image',
      'Images are stored on disk; containers only exist in memory',
      'There is no difference — the terms are interchangeable',
    ],
    correct: 1,
    explanation: 'A Docker image is a read-only, layered template that contains the application, its dependencies, and configuration. A container is a running (or stopped) instance created from an image. Multiple containers can run from the same image simultaneously, each isolated from the others.',
  },
  {
    id: 'q2',
    question: 'In a Dockerfile, what is the difference between RUN and CMD?',
    options: [
      'RUN executes during image build; CMD specifies the default command when a container starts',
      'RUN executes at container start; CMD executes during image build',
      'RUN is for shell commands; CMD is for Python commands only',
      'There is no difference — both execute commands at build time',
    ],
    correct: 0,
    explanation: 'RUN executes commands during the image build process — the result is committed as a new layer. CMD specifies the default command that runs when a container starts (if no command is given at docker run). ENTRYPOINT is similar to CMD but harder to override. Use RUN for build steps, CMD for runtime defaults.',
  },
  {
    id: 'q3',
    question: 'What does "docker run -p 8080:80 nginx" do?',
    options: [
      'Runs nginx on port 8080 inside the container and maps it to port 80 on the host',
      'Maps port 8080 on the host to port 80 inside the container',
      'Creates two nginx containers on ports 8080 and 80',
      'Tells nginx to listen on both port 8080 and 80 simultaneously',
    ],
    correct: 1,
    explanation: 'The -p flag maps HOST_PORT:CONTAINER_PORT. So -p 8080:80 means: traffic hitting port 8080 on the host is forwarded to port 80 inside the container. To access the nginx container, you browse to http://localhost:8080 on the host.',
  },
  {
    id: 'q4',
    question: 'What problem do Docker volumes solve?',
    options: [
      'They increase container CPU and memory performance',
      'They allow containers to use multiple network interfaces',
      'They persist data beyond the container lifecycle — data survives container deletion',
      'They enable containers to run without root privileges',
    ],
    correct: 2,
    explanation: 'Container filesystems are ephemeral — when a container is deleted, all data written inside it is lost. Docker volumes are managed storage outside the container lifecycle. Data in a volume persists when containers are stopped, restarted, or deleted, and can be shared between multiple containers.',
  },
  {
    id: 'q5',
    question: 'What does docker-compose up -d do?',
    options: [
      'Stops all containers defined in docker-compose.yml',
      'Builds images and starts all services defined in docker-compose.yml in detached (background) mode',
      'Downloads the latest base images without starting containers',
      'Starts containers with verbose debug logging enabled',
    ],
    correct: 1,
    explanation: 'docker compose up -d (or docker-compose up -d for older versions) builds any missing images, creates networks and volumes as defined, and starts all services in detached mode (background). Without -d, logs stream to the terminal and containers stop when you Ctrl+C. Use docker compose down to stop and remove containers.',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info: 'callout-info', warning: 'callout-warning', danger: 'callout-danger', success: 'callout-success' }
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

export default function DockerContainers() {
  return (
    <LessonLayout
      lessonId="devops-03"
      courseId="devops"
      title="Docker Containers"
      courseTitle="DevOps"
      courseHref="/devops"
      xp={90}
      readTime="~40 min"
      icon="🐳"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'DevOps', href: '/devops' },
        { label: 'Docker Containers' },
      ]}
      prev={{ title: 'Git & Version Control', href: '/devops/git' }}
      next={{ title: 'CI/CD with GitHub Actions', href: '/devops/cicd' }}
      objectives={[
        'Understand the container model and how it differs from VMs',
        'Pull, run, and manage Docker containers',
        'Write production-quality Dockerfiles',
        'Use volumes for persistent storage',
        'Define multi-container applications with docker-compose',
        'Apply container security best practices',
      ]}
    >
      {/* ── OVERVIEW ── */}
      <section>
        <h2>Overview</h2>
        <p>
          <GlossaryTooltip term="Docker" /> is a platform for packaging applications and
          their dependencies into portable, isolated units called containers. Unlike virtual
          machines — which virtualise hardware — containers share the host OS kernel and
          isolate at the process level, making them lightweight and fast.
        </p>
        <p className="mt-4">
          For sysadmins, Docker is transformative: instead of manually installing and
          configuring software on servers, you define the environment in a Dockerfile,
          build once, and run identically everywhere — on your laptop, in CI/CD, and
          in production.
        </p>

        {/* VMs vs Containers */}
        <div className="info-card mt-6 overflow-hidden">
          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-surface-700">
            <div className="p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                Virtual Machines
              </p>
              <div className="font-mono text-xs text-slate-400 space-y-1 leading-6">
                <div className="bg-surface-800 rounded p-2 text-center">App + Full OS (4GB+)</div>
                <div className="bg-surface-700 rounded p-2 text-center">Hypervisor (Hyper-V / ESXi)</div>
                <div className="bg-surface-600 rounded p-2 text-center">Physical Hardware</div>
              </div>
              <ul className="mt-4 space-y-1 text-xs text-slate-500">
                <li>• Minutes to start</li>
                <li>• GBs of disk per VM</li>
                <li>• Full OS isolation</li>
                <li>• Strong security boundary</li>
              </ul>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold text-accent-cyan uppercase tracking-widest mb-4">
                Containers
              </p>
              <div className="font-mono text-xs space-y-1 leading-6">
                <div className="grid grid-cols-3 gap-1">
                  {['App A', 'App B', 'App C'].map(a => (
                    <div key={a} className="bg-accent-cyan/10 border border-accent-cyan/20
                                            rounded p-1.5 text-center text-accent-cyan text-[10px]">
                      {a}
                    </div>
                  ))}
                </div>
                <div className="bg-surface-700 rounded p-2 text-center text-slate-300">
                  Docker Engine (shares host kernel)
                </div>
                <div className="bg-surface-600 rounded p-2 text-center text-slate-300">
                  Host OS + Hardware
                </div>
              </div>
              <ul className="mt-4 space-y-1 text-xs text-slate-500">
                <li className="text-accent-green">• Seconds to start</li>
                <li className="text-accent-green">• MBs of disk per container</li>
                <li>• Process-level isolation</li>
                <li>• Shared kernel (more attack surface)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE CONCEPTS ── */}
      <section>
        <h2>Core Concepts</h2>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {[
            { icon: '📦', term: 'Image',      def: 'A read-only, layered template built from a Dockerfile. Each layer is cached and reused. Images are stored in registries (Docker Hub, ECR, GHCR).' },
            { icon: '🏃', term: 'Container',  def: 'A running instance of an image. Adds a thin read-write layer on top. Ephemeral by default — destroyed data is lost unless using a volume.' },
            { icon: '📋', term: 'Dockerfile', def: 'A text file with instructions to build an image: base image, copy files, run commands, expose ports, set entry point.' },
            { icon: '📁', term: 'Volume',     def: 'Persistent storage managed by Docker, mounted into containers. Data survives container deletion. Preferred over bind mounts for production.' },
            { icon: '🌐', term: 'Network',    def: 'Docker creates virtual networks for container communication. bridge (default), host, none, and overlay (Swarm/K8s) modes.' },
            { icon: '📝', term: 'Compose',    def: 'docker-compose.yml defines multi-container apps: services, networks, volumes. One command to start your entire application stack.' },
          ].map(c => (
            <div key={c.term} className="info-card py-4 flex gap-3">
              <span className="text-xl flex-shrink-0">{c.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white mb-1">{c.term}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{c.def}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DOCKERFILE ── */}
      <section>
        <h2>Writing a Production Dockerfile</h2>
        <p>
          A well-written Dockerfile produces small, secure, cacheable images.
          Here's a real example for a Python sysadmin tool with security best practices applied:
        </p>
        <CodeBlock className="mt-4" title="Dockerfile — Python sysadmin tool (production quality)" language="bash"
          code={CODE_DOCKERCONTAINERS_1} />

        <div className="grid sm:grid-cols-2 gap-4 mt-5">
          {[
            { title: '✅ Do', items: ['Use specific version tags (python:3.11-slim NOT python:latest)', 'Multi-stage builds to keep final image small', 'Run as non-root user', 'COPY requirements.txt before code for layer caching', 'Add HEALTHCHECK for production containers'] },
            { title: '❌ Avoid', items: ['Running as root (USER root)', 'Large base images when slim variants exist', 'Copying secrets or credentials into the image', 'Installing dev tools in production images', 'Using ADD when COPY is sufficient'] },
          ].map(d => (
            <div key={d.title} className={`info-card py-4 ${d.title.startsWith('✅') ? 'border-accent-green/20 bg-accent-green/5' : 'border-accent-red/20 bg-accent-red/5'}`}>
              <p className="text-sm font-bold text-white mb-3">{d.title}</p>
              <ul className="space-y-1.5">
                {d.items.map(item => (
                  <li key={item} className="text-xs text-slate-400 flex gap-2">
                    <span className="flex-shrink-0">{d.title.startsWith('✅') ? '→' : '×'}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── DOCKER COMPOSE ── */}
      <section>
        <h2>docker-compose — Multi-Container Apps</h2>
        <CodeBlock title="docker-compose.yml — web app + database + reverse proxy" language="bash"
          code={CODE_DOCKERCONTAINERS_2} />
      </section>

      {/* ── VMware LAB ── */}
      <section>
        <h2>VMware Lab Exercise</h2>
        <Callout type="warning" icon="🧪" title="Lab Environment">
          Run this lab on the Ubuntu Server VM (192.168.100.20).
          The VM needs internet access — ensure VMnet2 (NAT) is connected or use
          the External switch for outbound connectivity.
        </Callout>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB DOCKER-1</span>
            <span className="text-sm font-semibold text-white">Install Docker and Deploy a Multi-Container App</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~30 min</span>
          </div>
          <div className="lab-body space-y-8">

            <LabStep number={1}
              description="Install Docker Engine on Ubuntu Server using the official install script."
              command={CODE_DOCKERCONTAINERS_3}
              output={CODE_DOCKERCONTAINERS_4}
            />

            <LabStep number={2}
              description="Pull and run your first container — nginx web server."
              command={CODE_DOCKERCONTAINERS_5}
              output={CODE_DOCKERCONTAINERS_6}
            />

            <LabStep number={3}
              description="Explore the container — exec into it, inspect logs and file system."
              command={CODE_DOCKERCONTAINERS_7}
            />

            <LabStep number={4}
              description="Build a custom image with a Dockerfile — serve a custom HTML page."
              command={CODE_DOCKERCONTAINERS_8}
              output={CODE_DOCKERCONTAINERS_9}
            />

            <LabStep number={5}
              description="Deploy a multi-container app with docker compose — nginx + a simple web service."
              command={CODE_DOCKERCONTAINERS_10}
              output={CODE_DOCKERCONTAINERS_11}
            />

            <LabStep number={6}
              description="Clean up — stop and remove all containers, images, and volumes."
              command={CODE_DOCKERCONTAINERS_12}
            />

            <Callout type="success" icon="✅" title="Lab Complete">
              You installed Docker, ran your first container, built a custom image,
              deployed a multi-container Compose stack, and used Portainer for GUI management.
              Docker is now in your sysadmin toolkit.
            </Callout>
          </div>
        </div>
      </section>

      {/* ── QUICK REF ── */}
      <section>
        <h2>Quick Reference</h2>
        <CodeBlock title="Docker Command Cheat Sheet" language="bash" code={CODE_DOCKERCONTAINERS_13} />
      </section>

      {/* ── QUIZ ── */}
      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to earn bonus XP.</p>
        <Quiz lessonId="devops-03" title="Docker Containers Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={45} />
      </section>
    </LessonLayout>
  )
}
