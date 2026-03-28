import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_CYBERSECURITYADSECURITY_1 = `# Find accounts with SPNs (potential Kerberoasting targets)
Get-ADUser -Filter {ServicePrincipalName -like '*'} \`\`
  -Properties ServicePrincipalName, PasswordLastSet, PasswordNeverExpires |
  Select-Object Name, SamAccountName, PasswordLastSet, PasswordNeverExpires,
    ServicePrincipalName |
  Format-Table -AutoSize

# HIGH RISK: SPNs on accounts with PasswordNeverExpires=True
# These are the weakest Kerberoasting targets
Get-ADUser -Filter {ServicePrincipalName -like '*' -and PasswordNeverExpires -eq $true} \`\`
  -Properties ServicePrincipalName, PasswordLastSet

# Monitor for Kerberoasting: Event ID 4769 with ticket encryption type 0x17 (RC4)
Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4769} -MaxEvents 50 |
  Where-Object { $_.Properties[8].Value -eq '0x17' } |
  Select-Object TimeCreated,
    @{N='Account'; E={$_.Properties[0].Value}},
    @{N='Service'; E={$_.Properties[2].Value}}`
const CODE_CYBERSECURITYADSECURITY_2 = `# Protected Users group prevents:
# - NTLM authentication (forces Kerberos)
# - DES/RC4 Kerberos encryption (forces AES)
# - Credential caching on workstations
# - Kerberos delegation

# Add a user to Protected Users
Add-ADGroupMember -Identity 'Protected Users' -Members 'Administrator'

# See current members
Get-ADGroupMember -Identity 'Protected Users' | Select-Object Name

# WARNING: Test before applying to service accounts
# Protected Users breaks NTLM-dependent services`
const CODE_CYBERSECURITYADSECURITY_3 = `# Check for Kerberoastable accounts
$kerberoastable = Get-ADUser -Filter {ServicePrincipalName -like '*'} \`\`
  -Properties ServicePrincipalName, PasswordNeverExpires

Write-Host "Kerberoastable accounts: $($kerberoastable.Count)"
$kerberoastable | Select-Object Name, PasswordNeverExpires | Format-Table

# Check Domain Admins
Write-Host "\`n=== Domain Admins ==="
Get-ADGroupMember 'Domain Admins' -Recursive |
  Get-ADUser -Properties LastLogonDate |
  Select-Object Name, SamAccountName, LastLogonDate | Format-Table

# Check for stale admin accounts (no logon in 90 days)
$cutoff = (Get-Date).AddDays(-90)
Get-ADGroupMember 'Domain Admins' |
  Get-ADUser -Properties LastLogonDate |
  Where-Object { $_.LastLogonDate -lt $cutoff -or -not $_.LastLogonDate } |
  Select-Object Name, LastLogonDate`
const CODE_CYBERSECURITYADSECURITY_4 = `Kerberoastable accounts: 0  <- good, no SPNs on user accounts

=== Domain Admins ===
Name           SamAccountName  LastLogonDate
Administrator  Administrator   01/15/2025`


const QUIZ_QUESTIONS = [
  { id:'q1', question:'What is Kerberoasting?', options:['A brute-force attack against the Kerberos KDC','An offline attack that requests Kerberos service tickets for SPNs, then cracks the ticket hash offline to recover the service account password — no special privileges needed to request tickets','A real-time attack that intercepts Kerberos traffic','An attack that forges Kerberos tickets using a compromised KDC key'], correct:1, explanation:'Kerberoasting: any authenticated domain user can request a TGS (Ticket Granting Service) ticket for any SPN (Service Principal Name). The ticket is encrypted with the service account\'s NTLM hash. The attacker requests the ticket, saves it, and cracks it offline with Hashcat/John. Service accounts with weak passwords are vulnerable. Mitigations: use long (25+ char) random passwords for service accounts, use gMSAs (automatic rotation), monitor for unusual TGS requests (Event ID 4769).' },
  { id:'q2', question:'What is a Pass-the-Hash (PtH) attack?', options:['Passing a password through a hash function before storing it','Using a captured NTLM hash directly to authenticate without knowing the plaintext password — if you have the hash, you can authenticate as that user to any system accepting NTLM','Cracking a password hash to recover the plaintext','Replacing a legitimate hash in the SAM database'], correct:1, explanation:'NTLM authentication uses the password hash directly — not a derived token. If an attacker extracts NTLM hashes from LSASS memory (using Mimikatz) or the SAM database, they can use those hashes to authenticate as those users without ever cracking the passwords. Mitigations: Credential Guard (isolates hashes from LSASS), Protected Users security group (disables NTLM for members), restrict lateral movement with firewall rules between workstations.' },
  { id:'q3', question:'What is the AD Tiering model and what does it prevent?', options:['A network architecture with three switches in series','Separating admin accounts into Tier 0 (DCs), Tier 1 (servers), Tier 2 (workstations) — preventing credential theft cascade where a compromised workstation leads to domain compromise','A backup strategy with three copies of AD data','A three-level password complexity requirement'], correct:2, explanation:'The AD tiering (or privileged access) model: Tier 0 = Domain Controllers and AD itself (most sensitive). Tier 1 = member servers, applications. Tier 2 = workstations and end-user devices. A Tier 0 admin account must NEVER log into Tier 1 or Tier 2 systems. If a Tier 2 workstation is compromised and a Tier 0 admin logs in, their credentials can be stolen and the attacker owns the domain. Each tier has dedicated admin accounts and PAWs (Privileged Access Workstations).' },
  { id:'q4', question:'What does BloodHound/SharpHound reveal about an Active Directory environment?', options:['It scans AD for misconfigured passwords','It maps attack paths through AD by collecting and visualising relationships between users, groups, computers, and permissions — showing the shortest path from a compromised account to Domain Admin','It monitors AD for real-time attack attempts','It audits AD for compliance with CIS benchmarks'], correct:1, explanation:'BloodHound uses graph theory to visualise AD relationships. SharpHound collects data (group memberships, ACL permissions, session information, local admin relationships). BloodHound displays: "From this compromised account, these are the 3 hops to Domain Admin via group membership and local admin rights." Defenders use it offensively to find and fix these paths before attackers exploit them. Run it as a defender: find paths, break them, re-run to verify.' },
  { id:'q5', question:'What is a "Golden Ticket" attack?', options:['A phishing attack using fake prize notifications','A Kerberos forgery attack using the KRBTGT account hash to create forged TGTs that grant access to any resource — valid for up to 10 years and survive password changes unless KRBTGT is reset twice','An attack that steals gold security certificates','An attack targeting the domain\'s primary backup domain controller'], correct:1, explanation:'The KRBTGT account\'s hash is used to sign all Kerberos TGTs. If an attacker extracts the KRBTGT hash (requires DC compromise), they can forge TGTs for any user, with any group memberships, valid for up to 10 years. This survives domain account password changes (since the ticket is self-signed). Mitigation: reset KRBTGT password TWICE (once invalidates existing tickets; second time ensures the old hash is truly gone). Then rotate all privileged accounts.' },
]

function LabStep({ number, description, command, language='powershell', output }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <span className="w-6 h-6 rounded-full bg-accent-amber/20 border border-accent-amber/30 text-accent-amber text-[11px] font-bold font-mono flex items-center justify-center flex-shrink-0 mt-0.5">{number}</span>
        <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
      </div>
      {command && <div className="ml-9"><CodeBlock code={command} language={language} showCopy /></div>}
      {output && (<div className="ml-9 rounded-xl bg-surface-950 border border-surface-700 px-4 py-3 font-mono text-xs text-accent-green leading-6">{output.split('\n').map((l,i)=><div key={i}>{l}</div>)}</div>)}
    </div>
  )
}

export default function CybersecurityADSecurity() {
  return (
    <LessonLayout
      lessonId="sec-10" courseId="cybersecurity"
      title="Active Directory Security" courseTitle="Cybersecurity"
      courseHref="/cybersecurity" xp={120} readTime="~50 min" icon="🏢"
      breadcrumbs={[{label:'Home',href:'/'},{label:'Cybersecurity',href:'/cybersecurity'},{label:'Active Directory Security'}]}
      prev={{ title:'Incident Response', href:'/cybersecurity/incident-response' }}
      next={null}
      objectives={['Understand Kerberoasting and how to detect/prevent it','Explain Pass-the-Hash and Pass-the-Ticket attacks','Apply the AD tiering model for privileged access','Audit AD for attack paths using PowerShell','Protect the KRBTGT account','Implement Protected Users security group']}
    >
      <section><h2>Overview</h2><p>Active Directory is the highest-value target in a Windows enterprise environment. Compromising it means game over — every user, every server, every resource is accessible. This lesson covers the attack techniques defenders must understand to protect AD effectively.</p></section>
      <section>
        <h2>Kerberoasting Detection & Prevention</h2>
        <CodeBlock title="Find Kerberoastable service accounts" language="powershell"
          code={CODE_CYBERSECURITYADSECURITY_1} />
      </section>
      <section>
        <h2>Protected Users Security Group</h2>
        <CodeBlock title="Add privileged accounts to Protected Users" language="powershell"
          code={CODE_CYBERSECURITYADSECURITY_2} />
      </section>
      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header"><span className="lab-badge">LAB SEC-10</span><span className="text-sm font-semibold text-white">AD Security Audit on DC01</span><span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span></div>
          <div className="lab-body space-y-8">
            <LabStep number={1} description="Run a comprehensive AD security audit."
              command={CODE_CYBERSECURITYADSECURITY_3}
              output={CODE_CYBERSECURITYADSECURITY_4} />
          </div>
        </div>
      </section>
      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to complete the Cybersecurity course.</p>
        <Quiz lessonId="sec-10" title="Active Directory Security Quiz" questions={QUIZ_QUESTIONS} passingScore={70} xpReward={60} />
      </section>
    </LessonLayout>
  )
}
