import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'
import GlossaryTooltip from '../../components/GlossaryTooltip.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_ACTIVEDIRECTORY_1 = `# Rename the server
Rename-Computer -NewName "DC01" -Restart

# After reboot — set static IP
New-NetIPAddress -InterfaceAlias "Ethernet0" -IPAddress 192.168.100.10 -PrefixLength 24 -DefaultGateway 192.168.100.1

# Set DNS to itself (required before AD promotion)
Set-DnsClientServerAddress -InterfaceAlias "Ethernet0" -ServerAddresses 127.0.0.1`
const CODE_ACTIVEDIRECTORY_2 = `Success Restart Needed Exit Code      Feature Result
------- -------------- ---------      --------------
True    No             Success        {Active Directory Domain Services, DNS...}`
const CODE_ACTIVEDIRECTORY_3 = `$securePassword = ConvertTo-SecureString "Admin@Lab123!" -AsPlainText -Force

Install-ADDSForest -DomainName "lab.local" -DomainNetBIOSName "LAB" -DomainMode "WinThreshold" -ForestMode "WinThreshold" -InstallDNS -SafeModeAdministratorPassword $securePassword -Force`
const CODE_ACTIVEDIRECTORY_4 = `WARNING: Windows Server 2025 evaluation builds expire after 180 days.
The target server will be configured as a domain controller and restarted.
...
✔ Server successfully configured as domain controller for lab.local
Restarting in 10 seconds...`
const CODE_ACTIVEDIRECTORY_5 = `# Verify the domain
Get-ADDomain | Select-Object DNSRoot, DomainMode, PDCEmulator

# Verify DNS SRV records were created
Resolve-DnsName -Name "_ldap._tcp.dc._msdcs.lab.local" -Type SRV

# Check SYSVOL is shared
net share`
const CODE_ACTIVEDIRECTORY_6 = `DNSRoot    DomainMode PDCEmulator
-------    ---------- -----------
lab.local  WinThreshold DC01.lab.local

Name    Type TTL   Section    NameTarget        Port Weight Priority
----    ---- ---   -------    ----------        ---- ------ --------
_ldap   SRV  600   Answer     dc01.lab.local    389  0      0

Share name   Resource                        Remark
SYSVOL       C:\\Windows\\SYSVOL\\sysvol        Logon server share
NETLOGON     C:\\Windows\\SYSVOL\\...\\scripts   Logon server share`
const CODE_ACTIVEDIRECTORY_7 = `# Create OUs
New-ADOrganizationalUnit -Name "IT"      -Path "DC=lab,DC=local"
New-ADOrganizationalUnit -Name "Finance" -Path "DC=lab,DC=local"
New-ADOrganizationalUnit -Name "HR"      -Path "DC=lab,DC=local"

# Create a test user in the IT OU
New-ADUser -Name "Alice Smith" -GivenName "Alice" -Surname "Smith" -SamAccountName "asmith" -UserPrincipalName "asmith@lab.local" -Path "OU=IT,DC=lab,DC=local" -AccountPassword (ConvertTo-SecureString "User@Lab123!" -AsPlainText -Force) -Enabled $true -PasswordNeverExpires $false -ChangePasswordAtLogon $true

# Verify
Get-ADUser -Identity asmith -Properties *`
const CODE_ACTIVEDIRECTORY_8 = `DistinguishedName : CN=Alice Smith,OU=IT,DC=lab,DC=local
Enabled           : True
GivenName         : Alice
SamAccountName    : asmith
UserPrincipalName : asmith@lab.local
✔ User created successfully`
const CODE_ACTIVEDIRECTORY_9 = `# Verify FSMO roles are on DC01
netdom query fsmo`
const CODE_ACTIVEDIRECTORY_10 = `Schema master          DC01.lab.local
Domain naming master   DC01.lab.local
PDC                    DC01.lab.local
RID pool manager       DC01.lab.local
Infrastructure master  DC01.lab.local
The command completed successfully.`
const CODE_ACTIVEDIRECTORY_11 = `# ── User Management ──────────────────────────────────────────
Get-ADUser -Filter * | Select-Object Name, Enabled, LastLogonDate
Get-ADUser -Identity jdoe -Properties *
New-ADUser -Name "John Doe" -SamAccountName jdoe -Enabled $true
Set-ADUser -Identity jdoe -Department "IT" -Manager "asmith"
Disable-ADAccount -Identity jdoe
Unlock-ADAccount -Identity jdoe
Set-ADAccountPassword -Identity jdoe -Reset -NewPassword (Read-Host -AsSecureString)

# ── Group Management ──────────────────────────────────────────
Get-ADGroup -Filter * | Select-Object Name, GroupScope, GroupCategory
New-ADGroup -Name "IT-Admins" -GroupScope Global -GroupCategory Security -Path "OU=IT,DC=lab,DC=local"
Add-ADGroupMember -Identity "IT-Admins" -Members jdoe, asmith
Get-ADGroupMember -Identity "Domain Admins" -Recursive

# ── Computer Accounts ─────────────────────────────────────────
Get-ADComputer -Filter * | Select-Object Name, OperatingSystem, LastLogonDate
Remove-ADComputer -Identity "OLD-PC01"

# ── OU Management ────────────────────────────────────────────
Get-ADOrganizationalUnit -Filter * | Select-Object Name, DistinguishedName
New-ADOrganizationalUnit -Name "Servers" -Path "DC=lab,DC=local"
Move-ADObject -Identity "CN=Alice Smith,OU=HR,DC=lab,DC=local" -TargetPath "OU=IT,DC=lab,DC=local"

# ── Replication & Health ──────────────────────────────────────
repadmin /replsummary
repadmin /showrepl
dcdiag /test:replications /v
netdom query fsmo`


// ─── Quiz questions ───────────────────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the minimum number of domain controllers recommended for a production Active Directory environment?',
    options: [
      'One — a single DC is sufficient for most organisations',
      'Two — for redundancy and fault tolerance',
      'Three — one per site minimum',
      'Four — two global catalogues plus two standard DCs',
    ],
    correct: 1,
    explanation: 'Microsoft recommends at least two domain controllers per domain for fault tolerance. If one DC fails, the second continues servicing authentication requests. A single DC is a single point of failure.',
  },
  {
    id: 'q2',
    question: 'Which PowerShell cmdlet promotes a Windows Server to a Domain Controller?',
    options: [
      'Add-DomainController',
      'Install-ADDSForest',
      'New-ADDomainController',
      'Set-ADDSPromotion',
    ],
    correct: 1,
    explanation: 'Install-ADDSForest is used to create a new forest and promote the first domain controller. For adding a DC to an existing domain you would use Install-ADDSDomainController.',
  },
  {
    id: 'q3',
    question: 'What does an Organisational Unit (OU) primarily provide in Active Directory?',
    options: [
      'Network segmentation between sites',
      'A container for applying Group Policy and delegating administration',
      'Physical security boundaries for servers',
      'Replication boundaries between domain controllers',
    ],
    correct: 1,
    explanation: 'OUs are containers used to organise directory objects and apply Group Policy Objects (GPOs). They also allow you to delegate administrative control — e.g., giving the helpdesk permission to reset passwords only within the HR OU.',
  },
  {
    id: 'q4',
    question: 'Which port does LDAP use by default?',
    options: ['88', '389', '445', '636'],
    correct: 1,
    explanation: 'LDAP uses port 389 by default. LDAPS (LDAP over SSL/TLS) uses port 636. Port 88 is used by Kerberos and port 445 is SMB.',
  },
  {
    id: 'q5',
    question: 'What is the SYSVOL share used for in Active Directory?',
    options: [
      'Storing user home directories',
      'Database storage for AD objects',
      'Replicating Group Policy files and logon scripts between domain controllers',
      'Hosting the DHCP scope database',
    ],
    correct: 2,
    explanation: 'SYSVOL is a shared folder replicated between all domain controllers using either FRS (legacy) or DFSR (modern). It contains Group Policy templates, logon/logoff scripts, and other domain-wide public files.',
  },
]

// ─── Reusable section components ─────────────────────────────────────────────

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div className="info-card-header">
      <div className="info-card-icon">{icon}</div>
      <div>
        <p className="info-card-title">{title}</p>
        {subtitle && <p className="info-card-subtitle">{subtitle}</p>}
      </div>
    </div>
  )
}

function Callout({ type = 'info', icon, title, children }) {
  const types = {
    info:    'callout-info',
    warning: 'callout-warning',
    danger:  'callout-danger',
    success: 'callout-success',
  }
  return (
    <div className={`callout ${types[type]}`}>
      <span className="callout-icon">{icon}</span>
      <div className="callout-body">
        {title && <strong>{title}</strong>}
        {children}
      </div>
    </div>
  )
}

function LabStep({ number, command, description, output }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 rounded-full bg-accent-amber/20 border border-accent-amber/30
                         text-accent-amber text-[11px] font-bold font-mono flex items-center
                         justify-center flex-shrink-0 mt-0.5">
          {number}
        </span>
        <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
      </div>
      {command && (
        <div className="ml-9">
          <CodeBlock code={command} language="powershell" showCopy />
        </div>
      )}
      {output && (
        <div className="ml-9">
          <div className="rounded-xl bg-surface-950 border border-surface-700 px-4 py-3
                          font-mono text-xs text-accent-green leading-6">
            {output.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── The lesson ───────────────────────────────────────────────────────────────
export default function ActiveDirectory() {
  return (
    <LessonLayout
      lessonId="ws2025-02"
      courseId="windows-server-2025"
      title="Active Directory & Domain Services"
      courseTitle="Windows Server 2025"
      courseHref="/windows-server-2025"
      xp={100}
      readTime="~45 min"
      icon="🏢"
      breadcrumbs={[
        { label: 'Home',                  href: '/' },
        { label: 'Windows Server 2025',   href: '/windows-server-2025' },
        { label: 'Active Directory' },
      ]}
      prev={{ title: 'Introduction to Windows Server 2025', href: '/windows-server-2025/intro' }}
      next={{ title: 'DHCP Server Configuration',           href: '/windows-server-2025/dhcp' }}
      objectives={[
        'Understand the AD DS architecture and core components',
        'Install the AD DS role via PowerShell',
        'Promote a server to Domain Controller',
        'Create OUs, users, and security groups',
        'Understand LDAP, Kerberos, and SYSVOL',
        'Complete the VMware lab exercise',
      ]}
    >

      {/* ══════════════════════════════════════════════════════════
          SECTION 1 — OVERVIEW
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h2>Overview</h2>
        <p>
          <GlossaryTooltip term="Active Directory" /> (AD) is Microsoft's directory service —
          the backbone of every enterprise Windows environment. It provides centralised
          authentication, authorisation, and policy management for users, computers, and
          resources across a network.
        </p>
        <p className="mt-4">
          In this lesson you will deploy <GlossaryTooltip term="AD DS" /> from scratch on
          a <strong>Windows Server 2025</strong> VM, promote it to a
          <GlossaryTooltip term="Active Directory"> Domain Controller</GlossaryTooltip>,
          and build the foundational structure used by every subsequent lesson in this course.
        </p>

        <Callout type="info" icon="💡" title="Why this matters">
          Over 90% of enterprise environments run Active Directory. Understanding how to
          deploy, structure, and troubleshoot AD is one of the most in-demand sysadmin skills
          in the industry.
        </Callout>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 2 — CONCEPTS (INFOGRAPHIC STYLE)
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h2>Core Concepts</h2>

        {/* AD DS Architecture diagram (text-based infographic) */}
        <div className="info-card">
          <SectionTitle icon="🏗️" title="AD DS Architecture" subtitle="The logical structure of Active Directory" />
          <div className="font-mono text-xs text-slate-400 leading-7 overflow-x-auto">
            <div className="min-w-[420px] space-y-1">
              <div className="text-slate-500">Forest (lab.local)</div>
              <div className="ml-4 text-slate-400">├── <span className="text-brand-300">Domain</span> (lab.local)</div>
              <div className="ml-8 text-slate-400">├── <span className="text-accent-cyan">Domain Controllers</span></div>
              <div className="ml-12 text-slate-500">├── DC01  192.168.100.10  <span className="text-accent-green">[PDC Emulator]</span></div>
              <div className="ml-12 text-slate-500">└── DC02  192.168.100.11  <span className="text-slate-600">[Backup DC]</span></div>
              <div className="ml-8 text-slate-400">├── <span className="text-accent-amber">Organisational Units (OUs)</span></div>
              <div className="ml-12 text-slate-500">├── OU=IT</div>
              <div className="ml-16 text-slate-600">├── Users (alice, bob, sysadmin)</div>
              <div className="ml-16 text-slate-600">└── Computers (WS01, SRV01)</div>
              <div className="ml-12 text-slate-500">├── OU=Finance</div>
              <div className="ml-12 text-slate-500">└── OU=HR</div>
              <div className="ml-8 text-slate-400">└── <span className="text-accent-purple">Global Catalogue</span></div>
            </div>
          </div>
        </div>

        {/* Key components grid */}
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          {[
            {
              icon: '🔐', title: 'Kerberos Authentication',
              desc: 'AD uses Kerberos v5 for authentication — not passwords over the wire. The KDC (Key Distribution Centre) runs on every DC and issues tickets. Port 88.',
            },
            {
              icon: '📖', title: 'LDAP Directory Protocol',
              desc: 'LDAP is the protocol used to query and modify AD objects. Every AD tool — from PowerShell to third-party software — communicates via LDAP on port 389 (or LDAPS on 636).',
            },
            {
              icon: '📂', title: 'SYSVOL & Group Policy',
              desc: 'SYSVOL is a replicated shared folder on every DC containing Group Policy templates, logon scripts, and other domain-wide files. Critical for GPO delivery.',
            },
            {
              icon: '🌐', title: 'DNS Integration',
              desc: 'AD is tightly coupled with DNS. Clients locate domain controllers by querying DNS for SRV records like _ldap._tcp.dc._msdcs.lab.local. AD DNS must be healthy for AD to work.',
            },
            {
              icon: '🔄', title: 'Replication',
              desc: 'All domain controllers hold a copy of the AD database (NTDS.DIT). Changes replicate between DCs automatically — intra-site every 15 seconds, inter-site per schedule.',
            },
            {
              icon: '🏆', title: 'FSMO Roles',
              desc: '5 Flexible Single Master Operation roles manage specific AD functions: PDC Emulator, RID Master, Infrastructure Master, Schema Master, and Domain Naming Master.',
            },
          ].map(c => (
            <div key={c.title} className="info-card py-4">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{c.icon}</span>
                <div>
                  <p className="font-semibold text-white text-sm mb-1">{c.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{c.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 3 — DEEP EXPLANATION
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h2>Deep Explanation</h2>

        <h3>The AD Database — NTDS.DIT</h3>
        <p>
          Active Directory stores all objects — users, computers, groups, policies — in a
          single Jet database file called <strong>NTDS.DIT</strong> located at
          <code className="text-accent-cyan font-mono text-sm mx-1">C:\Windows\NTDS\ntds.dit</code>.
          This file is the heart of the domain. It is replicated between all domain controllers
          using the <GlossaryTooltip term="Active Directory">AD replication</GlossaryTooltip> engine.
        </p>

        <Callout type="warning" icon="⚠️" title="Never copy NTDS.DIT directly">
          The database is locked while AD DS is running. Use Windows Server Backup or
          ntdsutil for official backups. Copying the file directly will produce a corrupt,
          unusable backup.
        </Callout>

        <h3>Forests, Domains, and Trusts</h3>
        <p>
          The <strong>forest</strong> is the outermost security boundary in Active Directory —
          two forests do not automatically trust each other. A <strong>domain</strong> is an
          administrative and replication boundary within a forest. Most small and medium
          organisations operate with a single domain in a single forest.
        </p>
        <p className="mt-3">
          <strong>Trust relationships</strong> allow users in one domain to access resources
          in another. All domains in the same forest have automatic two-way transitive trusts
          with every other domain. Cross-forest trusts must be configured manually.
        </p>

        <h3>Organisational Units vs. Groups</h3>
        <p>
          This is a common point of confusion for newcomers:
        </p>
        <div className="info-card mt-4">
          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-surface-700">
            <div className="pb-4 sm:pb-0 sm:pr-5">
              <p className="text-xs font-semibold text-accent-cyan uppercase tracking-widest mb-3">
                Organisational Unit (OU)
              </p>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li className="flex gap-2"><span className="text-brand-400">▸</span> Container for objects</li>
                <li className="flex gap-2"><span className="text-brand-400">▸</span> Used to apply Group Policy</li>
                <li className="flex gap-2"><span className="text-brand-400">▸</span> Used to delegate admin rights</li>
                <li className="flex gap-2"><span className="text-brand-400">▸</span> Can contain users, computers, groups, other OUs</li>
                <li className="flex gap-2"><span className="text-brand-400">▸</span> <em>Cannot</em> be used for resource permissions</li>
              </ul>
            </div>
            <div className="pt-4 sm:pt-0 sm:pl-5">
              <p className="text-xs font-semibold text-accent-amber uppercase tracking-widest mb-3">
                Security Group
              </p>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li className="flex gap-2"><span className="text-accent-amber">▸</span> Collection of user/computer accounts</li>
                <li className="flex gap-2"><span className="text-accent-amber">▸</span> Used to assign file/folder permissions</li>
                <li className="flex gap-2"><span className="text-accent-amber">▸</span> Used to assign software and email lists</li>
                <li className="flex gap-2"><span className="text-accent-amber">▸</span> Has a scope: Domain Local, Global, Universal</li>
                <li className="flex gap-2"><span className="text-accent-amber">▸</span> <em>Cannot</em> apply Group Policy</li>
              </ul>
            </div>
          </div>
        </div>

        <h3>FSMO Roles — The Five Keepers</h3>
        <p>
          While all DCs hold a copy of the database, five special operations are handled by
          a single DC — the FSMO (Flexible Single Master Operation) role holders:
        </p>
        <div className="space-y-3 mt-4">
          {[
            { role: 'PDC Emulator',            scope: 'Domain', desc: 'Handles password changes, time synchronisation for the domain, and legacy NT compatibility. The most operationally critical FSMO role.' },
            { role: 'RID Master',              scope: 'Domain', desc: 'Allocates pools of Relative IDs (RIDs) to other DCs. RIDs are used to construct the unique SID of every object.' },
            { role: 'Infrastructure Master',   scope: 'Domain', desc: 'Maintains cross-domain object references. Keep this on a non-global-catalogue server for best results.' },
            { role: 'Schema Master',           scope: 'Forest', desc: 'Controls all writes to the AD schema. There is exactly one Schema Master per forest. Required when installing Exchange or Lync.' },
            { role: 'Domain Naming Master',    scope: 'Forest', desc: 'Controls the addition and removal of domains from the forest.' },
          ].map(f => (
            <div key={f.role} className="flex gap-4 p-4 bg-surface-800 rounded-xl border border-surface-700">
              <div className="flex-shrink-0 pt-0.5">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full font-mono
                                  ${f.scope === 'Forest'
                                    ? 'bg-accent-purple/15 text-accent-purple border border-accent-purple/20'
                                    : 'bg-brand-500/15    text-brand-300    border border-brand-500/20'}`}>
                  {f.scope}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{f.role}</p>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 4 — REAL-WORLD SCENARIO
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h2>Real-World Scenario</h2>
        <div className="info-card border-accent-amber/20 bg-accent-amber/5">
          <SectionTitle
            icon="🏭"
            title="Scenario: Acme Corp IT Infrastructure"
            subtitle="You are the sysadmin for a 200-person company. They currently have no Active Directory."
          />
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>
              <strong>The Problem:</strong> Users have separate local accounts on every machine.
              When someone joins IT, you manually create accounts on 30 different servers and
              workstations. Password resets require visiting each machine. There is no central
              policy enforcement — users have admin rights on their own machines and install
              whatever they like.
            </p>
            <p>
              <strong>The Solution — AD DS:</strong> After deploying Active Directory with the
              domain <code className="font-mono text-accent-cyan text-xs">acme.local</code>,
              every user has a single account. Passwords are changed once and work everywhere.
              A Group Policy prevents users from installing unapproved software. The helpdesk
              can reset passwords without contacting a senior admin. New computers are domain-joined
              and receive their configuration automatically.
            </p>
            <p>
              <strong>The Design:</strong> Two domain controllers (DC01 and DC02) at the head
              office. OUs mirror the org chart: IT, Finance, HR, Sales. Security groups are used
              to control file server access — never individual user accounts. GPOs apply
              at the OU level: the IT OU has fewer restrictions, HR has stricter password policy.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 5 — VMware Lab Exercise
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h2>VMware Lab Exercise</h2>

        <Callout type="warning" icon="🧪" title="Lab Prerequisites">
          Complete the <a href="/vmware-setup">VMware Lab Setup guide</a> first.
          You need: Windows Server 2025 VM on VMnet1, IP 192.168.100.10,
          server renamed to <strong>DC01</strong>.
        </Callout>

        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB 2</span>
            <span className="text-sm font-semibold text-white">Deploy Active Directory Domain Services</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~30 min</span>
          </div>
          <div className="lab-body space-y-8">

            {/* Step 1 */}
            <LabStep
              number={1}
              description="Rename the server to DC01 and set a static IP. Open PowerShell as Administrator."
              command={CODE_ACTIVEDIRECTORY_1}
            />

            {/* Step 2 */}
            <LabStep
              number={2}
              description="Install the AD DS and DNS Server roles."
              command={"Install-WindowsFeature -Name AD-Domain-Services, DNS -IncludeManagementTools -Verbose"}
              output={CODE_ACTIVEDIRECTORY_2}
            />

            {/* Step 3 */}
            <LabStep
              number={3}
              description="Promote the server to a Domain Controller and create the forest. This will restart the server."
              command={CODE_ACTIVEDIRECTORY_3}
              output={CODE_ACTIVEDIRECTORY_4}
            />

            {/* Step 4 */}
            <LabStep
              number={4}
              description="After reboot — log in as LAB\\Administrator. Verify the deployment."
              command={CODE_ACTIVEDIRECTORY_5}
              output={CODE_ACTIVEDIRECTORY_6}
            />

            {/* Step 5 */}
            <LabStep
              number={5}
              description="Create a basic OU structure and test user account."
              command={CODE_ACTIVEDIRECTORY_7}
              output={CODE_ACTIVEDIRECTORY_8}
            />

            {/* Step 6 */}
            <LabStep
              number={6}
              description="Take a VMware snapshot now — this is your clean AD baseline."
              command={CODE_ACTIVEDIRECTORY_9}
              output={CODE_ACTIVEDIRECTORY_10}
            />

            <Callout type="success" icon="✅" title="Lab Complete">
              You now have a working Active Directory domain at <strong>lab.local</strong> with
              DC01 holding all FSMO roles, a basic OU structure, and a test user account.
              Snapshot the VM and proceed to the DHCP lesson.
            </Callout>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 6 — BEST PRACTICES
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h2>Best Practices</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: '🔢', title: 'Always run ≥2 DCs', desc: 'A single domain controller is a catastrophic single point of failure. Deploy a second DC before going to production.' },
            { icon: '🌐', title: 'AD-integrated DNS', desc: 'Always install DNS on domain controllers and use AD-integrated zones. This ensures DNS data replicates with AD and is protected by AD permissions.' },
            { icon: '🏗️', title: 'Design OUs to match policy, not org chart', desc: 'OUs should reflect how you want to apply Group Policy and delegate access — not necessarily mirror the company hierarchy.' },
            { icon: '🔐', title: 'Protect privileged accounts', desc: 'Never use Domain Admin for daily tasks. Create a separate admin account (e.g., a-jsmith) and a regular account. Use PAW (Privileged Access Workstations) in sensitive environments.' },
            { icon: '💾', title: 'Back up System State daily', desc: 'Windows Server Backup with System State includes NTDS.DIT, SYSVOL, Registry, and boot files. Test restore procedures quarterly.' },
            { icon: '📅', title: 'Monitor replication health', desc: 'Run repadmin /replsummary weekly. Replication failures silently corrupt AD over time. Set up alerting for event IDs 1311, 1388, and 2042.' },
          ].map(p => (
            <div key={p.title} className="info-card py-4 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{p.icon}</span>
              <div>
                <p className="text-sm font-semibold text-white mb-1">{p.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 7 — COMMON MISTAKES
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h2>Common Mistakes</h2>
        <div className="space-y-4">
          {[
            {
              mistake: 'Pointing the DC\'s DNS to the router before promotion',
              fix: 'The DC must point to itself (127.0.0.1) for DNS before and immediately after AD DS installation. Point to the router only as a forwarder after AD DNS is running.',
            },
            {
              mistake: 'Using the same account for daily work and domain admin',
              fix: 'Create separate admin accounts (a-username convention). Use your regular account for email and browsing. Credential theft from a compromised workstation immediately yields domain admin if you\'re logged in with it.',
            },
            {
              mistake: 'Deploying only one domain controller',
              fix: 'One DC = one failure away from a dead domain. Add a second DC on different hardware (or at least a different VM host) before any workloads depend on AD.',
            },
            {
              mistake: 'Ignoring replication errors',
              fix: 'Run repadmin /showrepl and repadmin /replsummary regularly. A DC that has been offline for more than the tombstone lifetime (default 180 days) can cause a USN rollback and corrupt the entire domain.',
            },
            {
              mistake: 'Assigning permissions directly to user accounts',
              fix: 'Always assign permissions to security groups, not individual users. When someone leaves, you remove them from the group — you don\'t have to hunt down every permission entry across every server.',
            },
          ].map((m, i) => (
            <div key={i} className="rounded-xl border border-surface-700 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-accent-red/5 border-b border-surface-700">
                <span className="text-accent-red text-base">❌</span>
                <p className="text-sm font-semibold text-white">{m.mistake}</p>
              </div>
              <div className="flex items-start gap-3 px-4 py-3 bg-accent-green/5">
                <span className="text-accent-green text-base flex-shrink-0">✅</span>
                <p className="text-sm text-slate-300 leading-relaxed">{m.fix}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 8 — QUICK REFERENCE COMMANDS
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h2>Quick Reference</h2>
        <CodeBlock
          title="Active Directory — Essential PowerShell Commands"
          language="powershell"
          code={CODE_ACTIVEDIRECTORY_11}
        />
      </section>

      {/* ══════════════════════════════════════════════════════════
          SECTION 9 — QUIZ
      ══════════════════════════════════════════════════════════ */}
      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">
          5 questions covering the key concepts from this lesson.
          Score ≥70% to pass and earn your bonus XP.
        </p>
        <Quiz
          lessonId="ws2025-02"
          title="Active Directory & Domain Services Quiz"
          questions={QUIZ_QUESTIONS}
          passingScore={70}
          xpReward={50}
        />
      </section>

    </LessonLayout>
  )
}
