import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_PSDSC_1 = `# A configuration is a special function decorated with 'Configuration'
Configuration WebServerBaseline {
    param([string[]]$ComputerName = 'localhost')

    # Import required DSC resource modules
    Import-DscResource -ModuleName PSDesiredStateConfiguration

    Node $ComputerName {

        # Ensure IIS Web Server role is installed
        WindowsFeature IIS {
            Ensure = 'Present'
            Name   = 'Web-Server'
        }

        # Ensure IIS Management Tools are installed
        WindowsFeature IISMgmt {
            Ensure    = 'Present'
            Name      = 'Web-Mgmt-Tools'
            DependsOn = '[WindowsFeature]IIS'
        }

        # Ensure W3SVC service is running and starts automatically
        Service W3SVC {
            Name        = 'W3SVC'
            State       = 'Running'
            StartupType = 'Automatic'
            DependsOn   = '[WindowsFeature]IIS'
        }

        # Ensure default site has correct permissions
        File DefaultSitePath {
            DestinationPath = 'C:\\inetpub\\wwwroot'
            Type            = 'Directory'
            Ensure          = 'Present'
        }

        # Registry: disable directory browsing
        Registry DisableDirBrowse {
            Key       = 'HKLM:\\SOFTWARE\\Policies\\IIS'
            ValueName = 'DirectoryBrowsing'
            ValueData = '0'
            ValueType = 'DWord'
            Ensure    = 'Present'
        }
    }
}

# Compile to .mof file
WebServerBaseline -ComputerName 'WEB01'
# Creates: .\\WebServerBaseline\\WEB01.mof

# Apply the configuration
Start-DscConfiguration -Path .\\WebServerBaseline -Wait -Verbose -Force`
const CODE_PSDSC_2 = `[DSCLocalConfigurationManager()]
Configuration LCMConfig {
    Node 'localhost' {
        Settings {
            # ApplyOnly      — apply once, no monitoring
            # ApplyAndMonitor — apply + report drift (no auto-correct)
            # ApplyAndAutoCorrect — apply + auto-correct drift (recommended)
            ConfigurationMode              = 'ApplyAndAutoCorrect'
            RefreshFrequencyMins           = 30    # Check every 30 min
            ConfigurationModeFrequencyMins = 15    # Correct drift every 15 min
            RebootNodeIfNeeded             = $false
            AllowModuleOverwrite           = $true
        }
    }
}

# Compile and apply LCM settings
LCMConfig
Set-DscLocalConfigurationManager -Path .\\LCMConfig -Verbose

# Verify LCM settings
Get-DscLocalConfigurationManager | Select-Object ConfigurationMode,
  RefreshFrequencyMins, RebootNodeIfNeeded, LCMState`
const CODE_PSDSC_3 = `Configuration LabBaseline {
    Import-DscResource -ModuleName PSDesiredStateConfiguration

    Node 'localhost' {
        Service WinRM {
            Name        = 'WinRM'
            State       = 'Running'
            StartupType = 'Automatic'
        }
        Service DNS {
            Name        = 'DNS'
            State       = 'Running'
            StartupType = 'Automatic'
        }
    }
}

# Compile — creates ./LabBaseline/localhost.mof
LabBaseline
Write-Host 'Compiled:' (Get-ChildItem .\\LabBaseline\\*.mof | Select-Object -Exp Name)`
const CODE_PSDSC_4 = `# Apply
Start-DscConfiguration -Path .\\LabBaseline -Wait -Force -Verbose 2>&1 | Select-String 'resource|success'

# Test compliance
$result = Test-DscConfiguration -Detailed
Write-Host "In desired state: $($result.InDesiredState)"
$result.ResourcesInDesiredState | Select-Object ResourceId, InDesiredState`
const CODE_PSDSC_5 = `In desired state: True

ResourceId              InDesiredState
----------              --------------
[Service]WinRM          True
[Service]DNS            True`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the core concept behind PowerShell Desired State Configuration (DSC)?',
    options: [
      'A scripting approach that runs commands in sequence to configure systems',
      'A declarative configuration model — you describe the desired end state of a system and DSC continuously ensures the system matches that state, automatically correcting drift',
      'A backup system that saves the current state of Windows servers',
      'A version control system for PowerShell scripts',
    ],
    correct: 1,
    explanation: 'DSC is declarative, not imperative. Instead of writing "run these commands to install IIS, then configure this setting", you declare "this server should have IIS installed with these settings." The Local Configuration Manager (LCM) on each node then ensures the system reaches and maintains that state. It periodically checks (every 30 minutes by default) and corrects drift automatically.',
  },
  {
    id: 'q2',
    question: 'What is the Local Configuration Manager (LCM) in DSC?',
    options: [
      'A GUI tool for managing DSC configurations',
      'The DSC engine that runs on each target node — it processes MOF files, applies configurations, monitors for drift, and enforces the refresh/reboot behaviour',
      'The central server that distributes DSC configurations to managed nodes',
      'A PowerShell module that must be installed separately on each server',
    ],
    correct: 1,
    explanation: 'The LCM is the DSC runtime built into every modern Windows Server. It runs as a background service, processes .mof (Managed Object Format) files compiled from DSC configurations, and enforces state. Key LCM settings: ConfigurationMode (ApplyOnly / ApplyAndMonitor / ApplyAndAutoCorrect), RefreshFrequencyMins (how often to check), RebootNodeIfNeeded. View/set with Get-DscLocalConfigurationManager and Set-DscLocalConfigurationManager.',
  },
  {
    id: 'q3',
    question: 'In DSC, what is a "resource"?',
    options: [
      'A CPU or memory allocation for a DSC operation',
      'A PowerShell module that defines how to test, get, and set a specific configuration item — like WindowsFeature, File, Registry, or Service',
      'A .mof file containing compiled configuration',
      'An XML file containing server inventory',
    ],
    correct: 1,
    explanation: 'A DSC resource is a PowerShell module implementing three functions: Get-TargetResource (reads current state), Test-TargetResource (returns true/false: is it in desired state?), Set-TargetResource (applies the desired state). Built-in resources include: WindowsFeature (install/remove roles), File (manage files/dirs), Registry (registry values), Service (service state), User (local accounts). Many more from DSC Resource Kit on PowerShell Gallery.',
  },
  {
    id: 'q4',
    question: 'What is the difference between Push mode and Pull mode in DSC?',
    options: [
      'Push mode uses UDP; Pull mode uses TCP',
      'In Push mode, an admin computer pushes .mof files directly to target nodes; in Pull mode, nodes regularly poll a central Pull server to download their assigned configurations',
      'Push mode applies configurations immediately; Pull mode requires manual approval',
      'There is no difference — they produce identical behaviour',
    ],
    correct: 1,
    explanation: 'Push mode: admin runs Start-DscConfiguration -Path .\\MofFolder -ComputerName node1 to push a compiled .mof directly to each node. Simple but not scalable for many nodes. Pull mode: nodes are configured with a Pull server URL, they check in periodically and download their configuration by ConfigurationID or ConfigurationName. Scales to thousands of nodes. Pull mode also enables compliance reporting — the pull server knows which nodes are in/out of compliance.',
  },
  {
    id: 'q5',
    question: 'What does Test-DscConfiguration return and when should you use it?',
    options: [
      'A list of all DSC resources installed on the system',
      'A boolean (or detailed InDesiredState property) indicating whether the target node currently matches its applied DSC configuration — useful for compliance checking before/after changes',
      'A test report of the MOF file syntax',
      'The time it will take to apply the configuration',
    ],
    correct: 1,
    explanation: 'Test-DscConfiguration -Detailed returns a DscConfigurationStatus object with InDesiredState (True/False), ResourcesInDesiredState, and ResourcesNotInDesiredState. Run it regularly as a compliance check. If InDesiredState is False, Start-DscConfiguration -UseExisting will re-apply the current configuration to correct the drift. Integrate into monitoring: script that emails when a node drifts from desired state.',
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

function LabStep({ number, description, command, language='powershell', output }) {
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

export default function PSDSC() {
  return (
    <LessonLayout
      lessonId="ps-07"
      courseId="powershell"
      title="Desired State Configuration"
      courseTitle="PowerShell"
      courseHref="/powershell"
      xp={100}
      readTime="~40 min"
      icon="⚙️"
      breadcrumbs={[
        { label:'Home', href:'/' },
        { label:'PowerShell', href:'/powershell' },
        { label:'Desired State Configuration' },
      ]}
      prev={{ title:'File System & Registry Automation', href:'/powershell/filesystem' }}
      next={{ title:'Reporting & Scheduled Automation',  href:'/powershell/reporting' }}
      objectives={[
        'Understand DSC\'s declarative model vs imperative scripting',
        'Write a DSC configuration that installs roles and sets system state',
        'Compile a configuration to a .mof file and apply it locally',
        'Configure the Local Configuration Manager (LCM)',
        'Use Test-DscConfiguration for compliance checking',
        'Understand Push vs Pull mode for fleet management',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          DSC is PowerShell's answer to Ansible and Chef for Windows. Instead of writing
          a script full of imperative commands, you declare what the system <em>should
          look like</em> and let DSC figure out how to get there — and how to keep it
          there. This is the foundation of Infrastructure as Code on Windows.
        </p>
        <Callout type="info" icon="💡" title="DSC vs Ansible for Windows">
          DSC is built into Windows and requires no agent installation. Ansible can also
          configure Windows (via WinRM) and is often preferred for mixed Linux/Windows
          environments. For Windows-only shops, DSC + WinRM is a natural choice.
        </Callout>
      </section>

      <section>
        <h2>Writing Your First DSC Configuration</h2>
        <CodeBlock title="DSC configuration — web server baseline" language="powershell"
          code={CODE_PSDSC_1} />
      </section>

      <section>
        <h2>LCM Configuration</h2>
        <CodeBlock title="Configure the Local Configuration Manager" language="powershell"
          code={CODE_PSDSC_2} />
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB PS-7</span>
            <span className="text-sm font-semibold text-white">Apply a DSC Configuration to DC01</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Write and compile a simple DSC configuration ensuring key services are running."
              command={CODE_PSDSC_3}
              output="Compiled: localhost.mof"
            />
            <LabStep number={2}
              description="Apply the configuration and verify compliance."
              command={CODE_PSDSC_4}
              output={CODE_PSDSC_5}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="ps-07" title="Desired State Configuration Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={50} />
      </section>
    </LessonLayout>
  )
}
