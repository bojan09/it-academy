import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_WS2025FILESERVICES_1 = `# Install File Services role
Install-WindowsFeature -Name FS-FileServer -IncludeManagementTools

# Create directory structure
New-Item -Path 'D:\\Shares\\Departments\\IT' -ItemType Directory -Force
New-Item -Path 'D:\\Shares\\Departments\\Finance' -ItemType Directory -Force
New-Item -Path 'D:\\Shares\\Departments\\HR' -ItemType Directory -Force

# Create SMB shares
New-SmbShare -Name 'IT$' -Path 'D:\\Shares\\Departments\\IT' \`\`
  -FullAccess 'Domain Admins' \`\`
  -ChangeAccess 'IT Staff' \`\`
  -Description 'IT Department Files'

# Set NTFS permissions (remove inherited, then set explicit)
$acl = Get-Acl 'D:\\Shares\\Departments\\IT'
$acl.SetAccessRuleProtection($true, $false)  # Disable inheritance

# Add permissions
$rule1 = New-Object System.Security.AccessControl.FileSystemAccessRule(
    'BUILTIN\\Administrators','FullControl','ContainerInherit,ObjectInherit','None','Allow')
$rule2 = New-Object System.Security.AccessControl.FileSystemAccessRule(
    'LAB\\IT Staff','Modify','ContainerInherit,ObjectInherit','None','Allow')

$acl.AddAccessRule($rule1)
$acl.AddAccessRule($rule2)
Set-Acl -Path 'D:\\Shares\\Departments\\IT' -AclObject $acl

# Verify
Get-SmbShare | Select-Object Name, Path, Description | Format-Table`
const CODE_WS2025FILESERVICES_2 = `# Enable shadow copies on D: drive
# GUI: Server Manager > File and Storage Services > Volumes > Shadow Copies

# PowerShell approach
$volume = 'D:'

# Create shadow copy NOW
(Get-WmiObject -Class Win32_ShadowCopy).Create($volume, 'ClientAccessible')

# List existing shadow copies
Get-WmiObject Win32_ShadowCopy | Select-Object ID, VolumeName, InstallDate |
  Format-Table

# Schedule automatic shadow copies (run as scheduled task)
# Recommended: 07:00 and 12:00 on weekdays
$taskParams = @{
    TaskName = 'Shadow Copy - D Drive'
    Action   = New-ScheduledTaskAction -Execute 'vssadmin' \`\`
                 -Argument 'create shadow /for=D:'
    Trigger  = @(
        $(New-ScheduledTaskTrigger -Daily -At '07:00'),
        $(New-ScheduledTaskTrigger -Daily -At '12:00')
    )
    Principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -RunLevel Highest
    Settings  = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 5)
}
Register-ScheduledTask @taskParams | Out-Null
Write-Host 'Shadow copies scheduled: 07:00 and 12:00 daily'`
const CODE_WS2025FILESERVICES_3 = `# Install File Services
Install-WindowsFeature FS-FileServer, FS-DFS-Namespace -IncludeManagementTools

# Create directories
'IT','Finance','HR','All Staff' | ForEach-Object {
    New-Item -Path "C:\\Shares\\$_" -ItemType Directory -Force | Out-Null
    Write-Host "Created: C:\\Shares\\$_"
}

# Create the All Staff share with simple permissions
New-SmbShare -Name 'AllStaff' -Path 'C:\\Shares\\All Staff' \`\`
  -FullAccess 'Domain Admins' \`\`
  -ChangeAccess 'Domain Users' \`\`
  -Description 'Company-wide file share'

Write-Host 'File Server configured' -ForegroundColor Green`
const CODE_WS2025FILESERVICES_4 = `Created: C:\\Shares\\IT
Created: C:\\Shares\\Finance
Created: C:\\Shares\\HR
Created: C:\\Shares\\All Staff
File Server configured`
const CODE_WS2025FILESERVICES_5 = `# On Ubuntu VM
sudo apt install smbclient -y

# List shares on DC01
smbclient -L //192.168.100.10 -U 'LAB\\Administrator'

# Connect to the AllStaff share
smbclient //192.168.100.10/AllStaff -U 'LAB\\Administrator'
# Inside smbclient: ls, put testfile.txt, get testfile.txt, exit`
const CODE_WS2025FILESERVICES_6 = `Sharename   Type  Comment
---------   ----  -------
AllStaff    Disk  Company-wide file share
NETLOGON    Disk  Logon server share
SYSVOL      Disk  Logon server share
IPC$        IPC   Remote IPC`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the difference between Share Permissions and NTFS Permissions?',
    options: [
      'They are the same — both control access to shared folders',
      'Share permissions control network access to the share; NTFS permissions control access to the files/folders themselves. When both apply, the MORE RESTRICTIVE of the two takes effect',
      'Share permissions apply to domain users; NTFS applies to local users',
      'Share permissions are set on the server; NTFS permissions are set on the client',
    ],
    correct: 1,
    explanation: 'Share permissions only apply when accessing over the network. NTFS permissions apply both locally and over the network. When a user accesses a file over a share, Windows evaluates BOTH: the effective network permission is whichever is more restrictive. Best practice: set share permissions to "Everyone: Full Control" and use NTFS permissions for actual access control — simpler management, consistent results.',
  },
  {
    id: 'q2',
    question: 'What does DFS Namespace (DFS-N) provide?',
    options: [
      'Automatic replication of files between servers',
      'A virtual namespace (like \\\\domain\\shared) that maps to physical shares on different servers — users see one path regardless of which server actually stores the files',
      'Distributed file locking to prevent simultaneous edits',
      'Encryption of files stored on file servers',
    ],
    correct: 1,
    explanation: 'DFS Namespace creates a unified virtual path (\\\\lab.local\\shared\\Finance) that users access without knowing which physical server hosts the data. You can have \\\\SRV01\\Finance and \\\\SRV02\\Finance both mapped to the same namespace path. When you migrate data between servers, only the namespace target changes — users\' mapped drives continue working unchanged.',
  },
  {
    id: 'q3',
    question: 'What is a shadow copy and why should it be enabled on file servers?',
    options: [
      'A hidden backup of deleted files stored in the Recycle Bin',
      'Volume Shadow Copies (VSS) create point-in-time snapshots of volumes, allowing users to restore previous versions of files without admin intervention — reducing helpdesk load for "I accidentally deleted my file" tickets',
      'An encrypted copy of files stored in a separate partition',
      'A real-time mirror of a file share to a backup server',
    ],
    correct: 1,
    explanation: 'Volume Shadow Copy Service (VSS) creates snapshots of volumes at scheduled times. Users can right-click a file/folder → Properties → Previous Versions to restore an earlier version or recover a deleted file themselves. This dramatically reduces helpdesk tickets for accidental deletions. Configure via Server Manager → File and Storage Services → Volumes → Configure Shadow Copies. Recommend 2x daily.',
  },
  {
    id: 'q4',
    question: 'What PowerShell command creates a new SMB share with Full Control for Domain Admins and Change access for Domain Users?',
    options: [
      'New-SmbShare -Name "Data" -Path "D:\\Data" -FullAccess "Domain Admins" -ChangeAccess "Domain Users"',
      'Create-Share -Name "Data" -Permissions "DA:Full,DU:Change"',
      'Set-SmbShare -Path "D:\\Data" -Access "Full:DA,Change:DU"',
      'New-FileShare -Name "Data" -ACL "Domain Admins:F,Domain Users:C"',
    ],
    correct: 0,
    explanation: 'New-SmbShare creates SMB network shares. -FullAccess grants Full Control share permission. -ChangeAccess grants Change (read/write but not change permissions/delete). -ReadAccess grants Read only. Note: these are Share permissions — always also set NTFS permissions on the folder. Use Get-SmbShare to list shares, Remove-SmbShare to delete.',
  },
  {
    id: 'q5',
    question: 'What does the "Access-Based Enumeration" feature do in Windows file shares?',
    options: [
      'Limits the number of files a user can access per session',
      'Hides files and folders from users who do not have at least Read permission — users only see files they can access, reducing confusion and information disclosure',
      'Audits all file access attempts for compliance reporting',
      'Encrypts files that are accessed more than once per day',
    ],
    correct: 1,
    explanation: 'Access-Based Enumeration (ABE) prevents users from seeing files and folders they don\'t have permission to access. Without ABE, a user browsing \\\\server\\data would see all folders even those they can\'t open — they get "Access Denied" when they click, which is confusing and exposes the folder structure. With ABE, they simply don\'t see folders they can\'t access. Enable in Share Properties → Advanced Settings.',
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

export default function WS2025FileServices() {
  return (
    <LessonLayout
      lessonId="ws2025-07"
      courseId="windows-server-2025"
      title="File Services & DFS"
      courseTitle="Windows Server 2025"
      courseHref="/windows-server-2025"
      xp={80}
      readTime="~35 min"
      icon="📁"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Windows Server 2025', href: '/windows-server-2025' },
        { label: 'File Services & DFS' },
      ]}
      prev={{ title: 'Hyper-V Virtualisation',  href: '/windows-server-2025/hyper-v' }}
      next={{ title: 'Windows Firewall',         href: '/windows-server-2025/firewall' }}
      objectives={[
        'Install and configure the File Server role',
        'Create SMB shares with correct share and NTFS permissions',
        'Enable Access-Based Enumeration and shadow copies',
        'Configure DFS Namespace for unified file access',
        'Audit file access with Object Access auditing',
        'Manage quotas and FSRM for capacity control',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          File Services is one of the most widely deployed Windows Server roles —
          virtually every organisation has file servers. Getting permissions, DFS, and
          shadow copies right from the start prevents the most common helpdesk headaches:
          users who can't access their files, accidentally deleted files with no recovery
          path, and disorganised share structures that take years to untangle.
        </p>
      </section>

      <section>
        <h2>Creating Shares with Correct Permissions</h2>
        <Callout type="info" icon="💡" title="Best practice permission model">
          Set Share permissions to "Everyone: Full Control" and use NTFS permissions for
          access control. This avoids the double-permission headache while giving you
          fine-grained NTFS control. Only use Share permissions to lock down access
          when NTFS is not available (e.g. old non-NTFS shares).
        </Callout>
        <CodeBlock title="Create and configure file shares" language="powershell"
          code={CODE_WS2025FILESERVICES_1} />
      </section>

      <section>
        <h2>Shadow Copies — Self-Service Recovery</h2>
        <CodeBlock title="Configure Volume Shadow Copies" language="powershell"
          code={CODE_WS2025FILESERVICES_2} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB WS-7</span>
            <span className="text-sm font-semibold text-white">Configure File Server and DFS on DC01</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~25 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Install the File Server role and create the department share structure."
              command={CODE_WS2025FILESERVICES_3}
              output={CODE_WS2025FILESERVICES_4}
            />
            <LabStep number={2}
              description="Test share access from the Ubuntu VM using smbclient."
              command={CODE_WS2025FILESERVICES_5}
              language="bash"
              output={CODE_WS2025FILESERVICES_6}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="ws2025-07" title="File Services & DFS Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={40} />
      </section>
    </LessonLayout>
  )
}
