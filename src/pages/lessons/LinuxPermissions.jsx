import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_LINUXPERMISSIONS_1 = `# ── Octal notation (recommended for scripts) ─────────────────
chmod 755 script.sh      # rwxr-xr-x  — standard executable
chmod 644 config.conf    # rw-r--r--  — standard file
chmod 600 private.key    # rw-------  — private key/secrets
chmod 700 ~/.ssh         # rwx------  — private directory
chmod 777 /tmp/shared    # rwxrwxrwx  — world-writable (avoid in prod)

# ── Symbolic notation (readable, good for targeted changes) ──
chmod u+x script.sh      # Add execute for owner
chmod g-w file.txt       # Remove write from group
chmod o= file.txt        # Remove ALL permissions for others
chmod a+r public.txt     # Add read for all (a = ugo)
chmod u=rwx,g=rx,o=r file  # Set exact permissions

# ── Recursive ─────────────────────────────────────────────────
chmod -R 750 /var/app    # Apply to directory and all contents
find /var/app -type f -exec chmod 640 {} \\;   # Files only
find /var/app -type d -exec chmod 750 {} \\;   # Dirs only`
const CODE_LINUXPERMISSIONS_2 = `# ── Create users ─────────────────────────────────────────────
sudo useradd -m -s /bin/bash -c 'Alice Smith' alice
# -m  create home directory
# -s  login shell
# -c  comment (full name)

sudo passwd alice           # Set password interactively

# Modern alternative (interactive)
sudo adduser alice          # Debian/Ubuntu friendly wizard

# ── Modify users ─────────────────────────────────────────────
sudo usermod -aG sudo alice         # Add to sudo group
sudo usermod -aG docker,www-data alice  # Add to multiple groups
sudo usermod -s /bin/zsh alice      # Change shell
sudo usermod -L alice               # Lock account
sudo usermod -U alice               # Unlock account
sudo usermod -e 2025-12-31 alice    # Set account expiry

# ── Delete users ─────────────────────────────────────────────
sudo userdel alice          # Delete user (keep home dir)
sudo userdel -r alice       # Delete user AND home directory

# ── Groups ───────────────────────────────────────────────────
sudo groupadd developers
sudo groupadd -g 1500 ops   # Specify GID
sudo groupdel developers

# ── Inspect ──────────────────────────────────────────────────
id alice                    # UID, GID, all groups
groups alice               # Just group list
getent passwd alice        # Full /etc/passwd entry
getent group sudo          # Members of sudo group
who                        # Logged-in users
last | head -10            # Login history`
const CODE_LINUXPERMISSIONS_3 = `# Edit with: sudo visudo
# Or add a file: sudo visudo -f /etc/sudoers.d/sysadmins

# Allow alice full sudo (requires password)
alice ALL=(ALL:ALL) ALL

# Allow the 'ops' group full sudo
%ops ALL=(ALL:ALL) ALL

# Allow alice to restart specific services only (no password)
alice ALL=(ALL) NOPASSWD: /bin/systemctl restart nginx, /bin/systemctl restart sshd

# Allow the 'deploy' group to run deployment script only
%deploy ALL=(www-data) NOPASSWD: /opt/scripts/deploy.sh

# Deny a specific user sudo even if they're in a sudo group
Cmnd_Alias DANGEROUS = /bin/rm, /sbin/mkfs, /sbin/fdisk
badactor ALL=(ALL) !DANGEROUS

# View current sudo permissions
sudo -l                    # Your own sudo rights
sudo -l -U alice           # Another user's sudo rights (requires root)`
const CODE_LINUXPERMISSIONS_4 = `# Create groups
sudo groupadd webteam
sudo groupadd ops

# Create users
sudo useradd -m -s /bin/bash -G webteam alice
sudo useradd -m -s /bin/bash -G webteam,ops bob
sudo passwd alice   # Set password
sudo passwd bob

# Verify group memberships
id alice
id bob`
const CODE_LINUXPERMISSIONS_5 = `uid=1001(alice) gid=1001(alice) groups=1001(alice),1003(webteam)
uid=1002(bob)   gid=1002(bob)   groups=1002(bob),1003(webteam),1004(ops)`
const CODE_LINUXPERMISSIONS_6 = `sudo mkdir -p /var/project/web
sudo chown root:webteam /var/project/web
sudo chmod 2775 /var/project/web    # SGID + rwxrwxr-x

# Test as alice
sudo -u alice touch /var/project/web/test.html
ls -la /var/project/web/

# New file inherits 'webteam' group thanks to SGID`
const CODE_LINUXPERMISSIONS_7 = `total 0
drwxrwsr-x 2 root    webteam 20 Jan 15 10:00 .      <- s = SGID set
-rw-r--r-- 1 alice   webteam  0 Jan 15 10:00 test.html  <- inherited group`
const CODE_LINUXPERMISSIONS_8 = `# Find all SUID binaries (run as file owner)
echo '=== SUID Binaries ==='
find /usr /bin /sbin -perm -4000 -type f 2>/dev/null | sort

# Find world-writable files (security risk)
echo '=== World-Writable Files in /etc ==='
find /etc -perm -o+w -type f 2>/dev/null

# Check sudoers
sudo cat /etc/sudoers | grep -v '^#' | grep -v '^$'`
const CODE_LINUXPERMISSIONS_9 = `=== SUID Binaries ===
/usr/bin/mount
/usr/bin/passwd   <- expected SUID root
/usr/bin/su
/usr/bin/sudo

=== World-Writable Files in /etc ===
  (none — this is correct)`


const QUIZ_QUESTIONS = [
  {
    id: 'q1',
    question: 'A file shows permissions "-rwxr-xr--". Who can execute it?',
    options: [
      'Everyone (owner, group, others)',
      'Only the owner',
      'Owner and group members',
      'Only root',
    ],
    correct: 2,
    explanation: 'Read the permissions in three groups of three: rwx (owner) r-x (group) r-- (others). The execute bit (x) is set for owner (rwX) and group (r-X) but not for others (r--). So the owner and group members can execute it. Others can only read it.',
  },
  {
    id: 'q2',
    question: 'What does "chmod 755 script.sh" set?',
    options: [
      'rwxr-xr-x — owner: full, group: read+execute, others: read+execute',
      'rwxrwxr-x — owner: full, group: full, others: read+execute',
      'rwx------ — owner: full, group: none, others: none',
      'r-xr-xr-x — everyone: read+execute, nobody can write',
    ],
    correct: 0,
    explanation: 'In octal: 7=rwx, 5=r-x, 5=r-x. So: owner gets rwx (read+write+execute), group gets r-x (read+execute, no write), others get r-x (read+execute, no write). This is the standard permission for executable scripts — only the owner can modify, everyone can read and run.',
  },
  {
    id: 'q3',
    question: 'What is the SUID bit and why is it potentially dangerous?',
    options: [
      'It allows a file to be accessed by multiple users simultaneously',
      'When set on an executable, it runs with the file OWNER\'s privileges regardless of who executes it — dangerous if set on root-owned programs',
      'It prevents the file from being deleted even by root',
      'It encrypts the file contents automatically',
    ],
    correct: 1,
    explanation: 'SUID (Set User ID) means the program runs with the permissions of the FILE OWNER, not the person who runs it. The classic example: /usr/bin/passwd is SUID root — ordinary users can run it to change their own password because it temporarily gains root privileges. If an attacker finds a SUID root binary with a vulnerability, they can get a root shell.',
  },
  {
    id: 'q4',
    question: 'What does "usermod -aG docker alice" do?',
    options: [
      'Creates a new user called docker with alice as the password',
      'Removes alice from the docker group',
      'Adds alice to the docker group without removing her from existing groups (-a = append)',
      'Sets alice as the administrator of the docker group',
    ],
    correct: 2,
    explanation: 'usermod -aG group user adds the user to the specified group. The -a flag means APPEND — without it, -G would REPLACE all the user\'s supplementary groups with only the specified group. Always use -aG together. Changes take effect at next login. Verify with: groups alice or id alice.',
  },
  {
    id: 'q5',
    question: 'What does "umask 022" mean for newly created files?',
    options: [
      'New files get permissions 022',
      'New files get permissions 644 (666 masked by 022) and directories get 755 (777 masked by 022)',
      'Only files owned by group 022 can be created',
      'All files created after this command are read-only',
    ],
    correct: 1,
    explanation: 'umask subtracts from the default permissions. Default for files is 666, default for directories is 777. umask 022 removes write for group (2) and write for others (2). So files get 666-022=644 (rw-r--r--) and directories get 777-022=755 (rwxr-xr-x). The umask 022 is the standard production default.',
  },
]

function Callout({ type = 'info', icon, title, children }) {
  const s = { info: 'callout-info', warning: 'callout-warning', success: 'callout-success', danger: 'callout-danger' }
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

export default function LinuxPermissions() {
  return (
    <LessonLayout
      lessonId="linux-03"
      courseId="linux"
      title="Users, Groups & Permissions"
      courseTitle="Linux Fundamentals"
      courseHref="/linux"
      xp={70}
      readTime="~30 min"
      icon="👤"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Linux Fundamentals', href: '/linux' },
        { label: 'Users, Groups & Permissions' },
      ]}
      prev={{ title: 'Shell Basics & Command Line', href: '/linux/shell' }}
      next={{ title: 'Package Management',          href: '/linux/packages' }}
      objectives={[
        'Read and interpret Linux permission strings (rwxr-xr-x)',
        'Use chmod with both octal and symbolic notation',
        'Create and manage users and groups',
        'Understand and configure sudo access safely',
        'Know the special permission bits: SUID, SGID, and sticky bit',
        'Audit file permissions for security misconfigurations',
      ]}
    >
      <section>
        <h2>Overview</h2>
        <p>
          Linux permissions are the first line of defence for every file and directory
          on the system. Misconfigured permissions are responsible for a huge proportion
          of real-world security incidents — world-writable config files, SUID binaries,
          and over-permissioned service accounts are among the most common findings in
          security audits.
        </p>
        <p className="mt-4">
          Understanding the permission model completely — not just how to set permissions
          but <em>why</em> and <em>when</em> — is a non-negotiable sysadmin skill.
        </p>
      </section>

      <section>
        <h2>Reading Permission Strings</h2>
        <div className="info-card mt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
            Anatomy of a permission string
          </p>
          <div className="font-mono text-sm overflow-x-auto">
            <div className="flex items-start gap-1 mb-4 min-w-[500px]">
              {[
                { chars: '-', label: 'Type', color: 'text-slate-400', desc: '- file  d dir  l symlink  b block  c char' },
                { chars: 'rwx', label: 'Owner', color: 'text-brand-300', desc: 'read write execute' },
                { chars: 'r-x', label: 'Group', color: 'text-accent-cyan', desc: 'read execute (no write)' },
                { chars: 'r--', label: 'Others', color: 'text-accent-green', desc: 'read only' },
              ].map(p => (
                <div key={p.label} className="text-center">
                  <div className={`text-2xl font-black px-2 ${p.color}`}>{p.chars}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{p.label}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5 max-w-[100px]">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-surface-700">
            {[
              { bit: 'r', val: '4', desc: 'Read — view contents' },
              { bit: 'w', val: '2', desc: 'Write — modify contents' },
              { bit: 'x', val: '1', desc: 'Execute — run as program / enter directory' },
              { bit: '-', val: '0', desc: 'Permission not granted' },
            ].map(b => (
              <div key={b.bit} className="flex items-center gap-2">
                <code className="text-brand-300 font-mono text-lg font-bold w-6">{b.bit}</code>
                <code className="text-accent-amber font-mono text-sm">={b.val}</code>
                <span className="text-xs text-slate-500">{b.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <CodeBlock className="mt-4" title="chmod — both notations" language="bash"
          code={CODE_LINUXPERMISSIONS_1} />
      </section>

      <section>
        <h2>User & Group Management</h2>
        <CodeBlock title="Creating and managing users" language="bash"
          code={CODE_LINUXPERMISSIONS_2} />
      </section>

      <section>
        <h2>sudo — Controlled Privilege Escalation</h2>
        <Callout type="danger" icon="🚨" title="Always use visudo">
          Never edit /etc/sudoers directly with a text editor. A syntax error locks
          everyone out of sudo permanently. Always use
          <code className="font-mono text-xs ml-1">sudo visudo</code> — it validates
          syntax before saving.
        </Callout>
        <CodeBlock title="/etc/sudoers — production patterns" language="bash"
          code={CODE_LINUXPERMISSIONS_3} />
      </section>

      <section>
        <h2>Special Permission Bits</h2>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          {[
            {
              bit: 'SUID', octal: '4xxx', display: 's in owner x',
              color: 'border-accent-red/25 bg-accent-red/5', text: 'text-accent-red',
              desc: 'Program runs with FILE OWNER\'s privileges. Classic: /usr/bin/passwd (SUID root). Dangerous on root-owned binaries with vulnerabilities.',
              find: 'find / -perm -4000 -type f 2>/dev/null',
              example: 'chmod u+s /usr/bin/program  OR  chmod 4755 file',
            },
            {
              bit: 'SGID', octal: '2xxx', display: 's in group x',
              color: 'border-accent-amber/25 bg-accent-amber/5', text: 'text-accent-amber',
              desc: 'On files: runs with group\'s privileges. On directories: new files inherit the directory\'s group — perfect for shared work directories.',
              find: 'find / -perm -2000 -type f 2>/dev/null',
              example: 'chmod g+s /shared/project  OR  chmod 2775 dir',
            },
            {
              bit: 'Sticky Bit', octal: '1xxx', display: 't in others x',
              color: 'border-brand-500/25 bg-brand-500/5', text: 'text-brand-300',
              desc: 'On directories: users can only delete files they OWN, even if they have write permission on the directory. Classic use: /tmp.',
              find: 'find / -perm -1000 -type d 2>/dev/null',
              example: 'chmod +t /shared  OR  chmod 1777 /tmp',
            },
          ].map(b => (
            <div key={b.bit} className={`card p-5 border ${b.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <code className={`font-mono font-bold text-base ${b.text}`}>{b.bit}</code>
                <span className="tag text-[10px]">{b.octal}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{b.desc}</p>
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Find all:</p>
                <code className="text-[11px] font-mono text-slate-500 block leading-relaxed">{b.find}</code>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mt-2">Set with:</p>
                <code className="text-[11px] font-mono text-slate-500 block leading-relaxed">{b.example}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header">
            <span className="lab-badge">LAB LINUX-3</span>
            <span className="text-sm font-semibold text-white">Configure Users, Groups & Secure Permissions</span>
            <span className="ml-auto text-xs text-slate-500 font-mono">~20 min</span>
          </div>
          <div className="lab-body space-y-8">
            <LabStep number={1}
              description="Create users and groups for a simulated team environment."
              command={CODE_LINUXPERMISSIONS_4}
              output={CODE_LINUXPERMISSIONS_5}
            />
            <LabStep number={2}
              description="Create a shared project directory with SGID so all files inherit the group."
              command={CODE_LINUXPERMISSIONS_6}
              output={CODE_LINUXPERMISSIONS_7}
            />
            <LabStep number={3}
              description="Audit the system for dangerous SUID/SGID binaries — a key security check."
              command={CODE_LINUXPERMISSIONS_8}
              output={CODE_LINUXPERMISSIONS_9}
            />
          </div>
        </div>
      </section>

      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="linux-03" title="Users, Groups & Permissions Quiz"
              questions={QUIZ_QUESTIONS} passingScore={70} xpReward={35} />
      </section>
    </LessonLayout>
  )
}
