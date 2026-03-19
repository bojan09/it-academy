import React from 'react'
import CoursePage from '../components/CoursePage.jsx'

const LESSONS = [
  {
    id: 'devops-01',
    title: 'DevOps Principles & Culture',
    description: 'CALMS framework, DevOps lifecycle, SRE vs DevOps, and how to introduce DevOps practices.',
    href: '/devops/principles',
    xp: 50,
    readTime: '~20 min',
    icon: '🔄',
  },
  {
    id: 'devops-02',
    title: 'Git & Version Control',
    description: 'Git fundamentals, branching strategies, pull requests, and managing infrastructure as code in Git.',
    href: '/devops/git',
    xp: 60,
    readTime: '~25 min',
    icon: '🌿',
  },
  {
    id: 'devops-03',
    title: 'Docker Containers',
    description: 'Images, containers, Dockerfile, docker-compose, networking, and volumes from scratch.',
    href: '/devops/docker',
    xp: 90,
    readTime: '~40 min',
    icon: '🐳',
  },
  {
    id: 'devops-04',
    title: 'CI/CD with GitHub Actions',
    description: 'Workflows, jobs, steps, secrets, and building a full build-test-deploy pipeline.',
    href: '/devops/cicd',
    xp: 100,
    readTime: '~45 min',
    icon: '🚀',
  },
  {
    id: 'devops-05',
    title: 'Terraform — Infrastructure as Code',
    description: 'HCL syntax, providers, state management, modules, and deploying real infrastructure.',
    href: '/devops/terraform',
    xp: 120,
    readTime: '~50 min',
    icon: '🏗️',
  },
  {
    id: 'devops-06',
    title: 'Ansible Configuration Management',
    description: 'Inventory, playbooks, roles, variables, vault, and idempotent server configuration at scale.',
    href: '/devops/ansible',
    xp: 100,
    readTime: '~45 min',
    icon: '⚙️',
  },
  {
    id: 'devops-07',
    title: 'Kubernetes Fundamentals',
    description: 'Pods, deployments, services, ingress, ConfigMaps, secrets, and cluster management.',
    href: '/devops/kubernetes',
    xp: 130,
    readTime: '~55 min',
    icon: '☸️',
  },
  {
    id: 'devops-08',
    title: 'Monitoring with Prometheus & Grafana',
    description: 'Metrics, exporters, PromQL, alerting rules, and building infrastructure dashboards.',
    href: '/devops/monitoring',
    xp: 100,
    readTime: '~40 min',
    icon: '📊',
  },
]

export default function DevOps() {
  return (
    <CoursePage
      id="devops"
      title="DevOps"
      icon="🔧"
      tagline="Docker, Kubernetes, Terraform, Ansible, and CI/CD — the modern infrastructure stack."
      description="A practical DevOps course for sysadmins making the transition to infrastructure automation and cloud-native operations. Covers the complete modern toolchain from Git and Docker through to Kubernetes and Prometheus monitoring."
      lessons={LESSONS}
      highlights={[
        'Docker container builds and docker-compose stacks',
        'Full CI/CD pipeline with GitHub Actions',
        'Terraform for repeatable infrastructure deployments',
        'Ansible roles and vault for configuration management',
        'Kubernetes cluster management from scratch',
      ]}
      accentColor="text-accent-purple"
      prereqs={[
        { label: 'Linux Fundamentals', href: '/linux' },
        { label: 'Python for SysAdmins', href: '/python' },
        { label: 'Networking', href: '/networking' },
      ]}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'DevOps' },
      ]}
    />
  )
}
