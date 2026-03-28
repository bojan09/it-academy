import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_WINDOWSPERMISSIONS_1 = `# ── View accounts ────────────────────────────────────────────
Get-LocalUser | Select-Object Name, Enabled, LastLogon, PasswordRequired
Get-LocalGroup | Select-Object Name, Description
Get-LocalGroupMember -Group 'Administrators'

# ── Create a standard user ───────────────────────────────────
$pass = Read-Host 'Password' -AsSecureString
New-LocalUser -Name 'alice' -FullName 'Alice Smith' \`\`
  -Password $pass -PasswordNeverExpires $false \`\`
  -AccountNeverExpires

# Add to a group
Add-LocalGroupMember -Group 'Users' -Member 'alice'

# ── Disable built-in Administrator (security hardening) ───────
Disable-LocalUser -Name 'Administrator'

# ── Check current user's groups and privileges ────────────────
whoami /groups
whoami /priv`
const CODE_WINDOWSPERMISSIONS_2 = `# ── View current permissions ─────────────────────────────────
icacls C:\\Data

# PowerShell equivalent
(Get-Acl C:\\Data).Access | Select-Object IdentityReference,
  FileSystemRights, AccessControlType | Format-Table -AutoSize

# ── Grant permissions ────────────────────────────────────────
# Grant Users Modify on folder + contents
icacls C:\\Data /grant 'BUILTIN\\Users:(OI)(CI)M'

# Grant a specific user Read-only
icacls C:\\Reports /grant 'alice:R'

# ── Remove permissions ───────────────────────────────────────
icacls C:\\Data /remove alice

# ── Reset to inherited permissions ───────────────────────────
icacls C:\\Data /reset /T

# ── Audit effective permissions ──────────────────────────────
# Who can access this file and how?
(Get-Acl C:\\Data\\report.xlsx).Access |
  Where-Object { $_.AccessControlType -eq 'Allow' } |
  Select-Object IdentityReference, FileSystemRights`
const CODE_WINDOWSPERMISSIONS_3 = `# Create a standard user
$pass = ConvertTo-SecureString 'Lab@2025!' -AsPlainText -Force
New-LocalUser -Name 'testuser' -Password $pass -FullName 'Test User'
Add-LocalGroupMember -Group 'Users' -Member 'testuser'

# Create a department folder
New-Item -Path 'C:\\Departments\\IT' -ItemType Directory -Force

# Grant IT staff Modify access
icacls 'C:\\Departments\\IT' /grant 'BUILTIN\\Users:(OI)(CI)M'

# Verify
icacls 'C:\\Departments\\IT'`
const CODE_WINDOWSPERMISSIONS_4 = `C:\\Departments\\IT BUILTIN\\Administrators:(OI)(CI)(F)
                  NT AUTHORITY\\SYSTEM:(OI)(CI)(F)
                  BUILTIN\\Users:(OI)(CI)(M)
Successfully processed 1 files`
const CODE_WINDOWSPERMISSIONS_5 = `# Check UAC configuration
Get-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System' |
  Select-Object EnableLUA, ConsentPromptBehaviorAdmin, ConsentPromptBehaviorUser

# List local admins
Get-LocalGroupMember -Group Administrators |
  Select-Object Name, ObjectClass, PrincipalSource`
const CODE_WINDOWSPERMISSIONS_6 = `EnableLUA ConsentPromptBehaviorAdmin ConsentPromptBehaviorUser
--------- --------------------------- --------------------------
1         5                           3
# 1=UAC enabled, 5=prompt for creds, 3=prompt for standard

Name                   ObjectClass PrincipalSource
----                   ----------- ---------------
DC01\\Administrator     User        Local
LAB\\Domain Admins      Group       ActiveDirectory`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What does UAC (User Account Control) do when a standard user runs a program requiring elevation?',
    options: [
      'It silently denies the action and logs the attempt',
      'It prompts for credentials of an administrator account — the program then runs with those elevated privileges, not the user\'s standard account',
      'It temporarily grants admin rights to the user\'s account',
      'It restarts the program with SYSTEM privileges',
    ],
    correct: 1,
    explanation: 'Over-the-Shoulder (OTS) elevation: UAC shows a credential prompt asking for an admin account\'s username and password. The program launches as a new process with the admin\'s token, completely separate from the standard user session. This is why malware running as a standard user cannot silently gain admin rights — it triggers a visible UAC prompt that the user must actively approve.',
  },
  {
    id: 'q2',
    question: 'What is the difference between NTFS permissions and Share permissions?',
    options: [
      'NTFS permissions are for local access; Share permissions only apply over the network — when both apply, the most restrictive wins',
      'They are identical — both are stored in the same ACL',
      'Share permissions are more secure than NTFS permissions',
      'NTFS permissions apply to files; Share permissions apply to folders',
    ],
    correct: 0,
    explanation: 'NTFS permissions are stored in the file system ACL and apply both locally and over the network. Share permissions only apply when accessing via a network share. When both apply simultaneously (network access to a shared NTFS folder), Windows calculates effective permissions by applying BOTH and taking the most restrictive result. Best practice: set Share permissions to Everyone:Full Control and use NTFS for all actual access control.',
  },
  {
    id: 'q3',
    question: 'What is an Access Control List (ACL) and what are its two types?',
    options: [
      'A list of allowed IP addresses for firewall rules; types are inbound and outbound',
      'A list of Access Control Entries on a securable object; DACL (Discretionary ACL — who can access) and SACL (System ACL — what to audit)',
      'A list of installed software and their access requirements',
      'A log of all access attempts stored in Event Viewer',
    ],
    correct: 1,
    explanation: 'Every Windows securable object (file, folder, registry key, process) has a security descriptor containing: DACL (Discretionary ACL) — the list of ACEs defining which users/groups are allowed or denied access and what type. SACL (System ACL) — defines which access attempts are logged to the Security event log. Each ACE contains: trustee (who), access mask (what), and type (Allow/Deny). Deny ACEs take precedence over Allow.',
  },
  {
    id: 'q4',
    question: 'What does "icacls C:\\folder /grant Users:(OI)(CI)M" do?',
    options: [
      'Grants Users read-only access to C:\\folder',
      'Grants the Users group Modify permission on C:\\folder, with (OI) propagating to files and (CI) propagating to subfolders',
      'Removes all existing permissions and grants only Users modify access',
      'Creates a new folder and grants Users modify access',
    ],
    correct: 1,
    explanation: 'icacls is the command-line ACL tool. /grant adds permissions. (OI) = Object Inherit (applies to files in the folder). (CI) = Container Inherit (applies to subfolders). M = Modify (read, write, execute, delete — but not change permissions). Combined: Users get Modify on the folder itself plus all files (OI) and subfolders (CI) created in it. Other rights: F=Full Control, R=Read, W=Write, X=Execute, D=Delete.',
  },
  {
    id: 'q5',
    question: 'What is the purpose of the "Everyone" group vs "Authenticated Users" in Windows?',
    options: [
      'They are identical — both refer to all user accounts',
      'Everyone includes all users including unauthenticated (guest/anonymous) connections; Authenticated Users includes only users who have successfully authenticated — use Authenticated Users for security-sensitive permissions',
      'Everyone is for local accounts; Authenticated Users is for domain accounts',
      'Everyone grants read access; Authenticated Users grants write access',
    ],
    correct: 1,
    explanation: 'Everyone includes any user who can connect to the system — including the Guest account and potentially anonymous connections. Authenticated Users includes only principals who have successfully authenticated with a valid password. For share permissions and most access control scenarios, use Authenticated Users rather than Everyone. Granting Everyone:Read on a share means unauthenticated guests can read files if the Guest account is enabled.',
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

function LabStep({ number, description, command, language = 'powershell', output }) {
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

export default function WindowsPermissions() {
  return (
    <LessonLayout
      lessonId="win-02"
      courseId="windows"
      title="User Accounts & Permissions"
      courseTitle="Windows Desktop"
      courseHref="/windows"
      xp={60}
      readTime="~25 min"
      icon="👤"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Windows Desktop', href: '/windows' },
        { label: 'User Accounts & Permissions' },
      ]}
      prev={{ title: 'Windows Architecture', href: '/windows/architecture' }}
      next={{ title: 'Registry Deep Dive',   href: '/windows/registry' }}
      objectives={[
        'Manage local user accounts and groups with PowerShell and GUI',
        'Understand NTFS permissions, ACLs, and inheritance',
        'Configure UAC and understand the elevation model',
        'Use icacls and Get-Acl to audit and set permissions',
        'Understand the difference between Everyone and Authenticated Users',
        'Troubleshoot access denied errors systematically',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Windows access control is built on a layered model: accounts → groups →
          ACLs → effective permissions. Understanding this model lets you grant exactly
          the right access, troubleshoot permission problems quickly, and avoid the
          common mistake of granting everyone full control "to fix" an access issue.
        </p>
      </section>

      <section>
        <h2>Local User & Group Management</h2>
        <CodeBlock title="Manage local accounts with PowerShell" language="powershell"
          code={CODE_WINDOWSPERMISSIONS_1} />
      </section>

      <section>
        <h2>NTFS Permissions</h2>
        <div className="info-card mt-4 overflow-hidden">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 px-1">
            Standard NTFS permission levels — what each grants
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-surface-700">
                <tr>{['Level','Read','Write','Execute','Delete','Change Perms'].map(h => (
                  <th key={h} className="text-left px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-surface-700/50">
                {[
                  ['Full Control', '✓','✓','✓','✓','✓'],
                  ['Modify',       '✓','✓','✓','✓','✗'],
                  ['Read & Execute','✓','✗','✓','✗','✗'],
                  ['Read',         '✓','✗','✗','✗','✗'],
                  ['Write',        '✗','✓','✗','✗','✗'],
                  ['List Folder',  '✓','✗','✗','✗','✗'],
                ].map(row => (
                  <tr key={row[0]} className="hover:bg-surface-700/30">
                    <td className="px-3 py-2 font-semibold text-white text-xs">{row[0]}</td>
                    {row.slice(1).map((v, i) => (
                      <td key={i} className={`px-3 py-2 text-center font-bold ${v === '✓' ? 'text-accent-green' : 'text-slate-600'}`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <CodeBlock className="mt-4" title="View and set permissions with icacls and PowerShell" language="powershell"
          code={CODE_WINDOWSPERMISSIONS_2} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB WIN-2</span>
            <span className="text-sm font-semibold text-white">Configure Users and Permissions on DC01</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~15 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Create test users and a department folder with correct permissions."
              command={CODE_WINDOWSPERMISSIONS_3}
              output={CODE_WINDOWSPERMISSIONS_4}
            />
            <LabStep number={2}
              description="Check effective permissions and UAC status."
              command={CODE_WINDOWSPERMISSIONS_5}
              output={CODE_WINDOWSPERMISSIONS_6}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="win-02" title="User Accounts & Permissions Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={30} />
      </section>
    </LessonLayout>
  )
}
