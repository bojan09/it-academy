import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_UNIXPERMISSIONS_1 = `# Octal notation: chmod ugo
chmod 755 script.sh   # rwxr-xr-x
chmod 644 file.txt    # rw-r--r--
chmod 600 key.pem     # rw-------
chmod 1777 /tmp       # sticky + world-writable
chmod 4755 program    # SUID + rwxr-xr-x
chmod 2775 /shared    # SGID + rwxrwxr-x

# POSIX ACLs
getfacl /project/data
setfacl -m u:alice:rwx /project/data
setfacl -m g:devteam:rx /project/data
setfacl -R -m u:bob:r-x /project/    # recursive
getfacl /project/data | setfacl --set-file=- /project/archive  # copy ACLs`
const CODE_UNIXPERMISSIONS_2 = `sudo apt install acl -y
mkdir -p ~/project-test

# Set base permissions
chmod 750 ~/project-test

# Add per-user ACLs
setfacl -m u:root:rwx ~/project-test
setfacl -m o::--- ~/project-test

getfacl ~/project-test`
const CODE_UNIXPERMISSIONS_3 = `# file: project-test
# owner: user
# group: user
user::rwx
user:root:rwx
group::r-x
mask::rwx
other::---`


const QUIZ_QUESTIONS = [
  { id:'q1', question:'On a BSD system, what does "chmod 4755 program" set?', options:['rwxr-xr-x with no special bits','rwsr-xr-x — SUID set (runs as file owner), full owner access, read/execute for group and others','r-xr-xr-x — read-only for everyone','rwxrwxr-x — write access for group'], correct:1, explanation:'Octal 4755: 4=SUID bit, 7=owner rwx, 5=group r-x, 5=others r-x. The SUID bit (4000) sets the effective UID to the file owner when executed. Combined as 4755: owner has full control (7=rwx), group and others have read/execute (5=r-x), and the SUID bit means the program runs as the file owner regardless of who executes it. Classic example: passwd utility runs as root to modify /etc/shadow.' },
  { id:'q2', question:'What are POSIX ACLs and when should you use them instead of standard Unix permissions?', options:['POSIX ACLs are the standard rwx permissions','Extended ACLs provide per-user and per-group permissions beyond the owner/group/others model — use when you need user A to have read-only, user B to have read-write, and others to have no access on the same file','POSIX ACLs are only available on BSD, not Linux','ACLs replace the standard permission bits entirely'], correct:1, explanation:'Standard Unix permissions have three subjects: owner, group, others. POSIX ACLs add arbitrary users and groups: setfacl -m u:alice:r-x,u:bob:rwx file allows alice read/execute and bob full access. View with getfacl. A file with ACLs shows a + at the end of its permission string in ls -l. ACLs are essential for shared project directories where different users need different access levels that cannot be expressed with a single group.' },
  { id:'q3', question:'What does the sticky bit on a directory (chmod +t /shared) prevent?', options:['Prevents the directory from being deleted by non-root users','Allows only the file owner (and root) to delete or rename files within the directory, even if others have write permission on the directory itself','Makes directory contents hidden from non-owners','Prevents new files from being created in the directory'], correct:2, explanation:'The sticky bit (chmod +t or chmod 1xxx) on a directory prevents users from deleting or renaming files they do not own, even if they have write permission on the directory. Classic example: /tmp has 1777 (sticky + world-writable). Any user can create files in /tmp, but can only delete their own files. Without sticky bit, a user with write permission on the directory could delete anyone\'s files in it.' },
  { id:'q4', question:'How do you view the ACLs on a file on a system that supports POSIX ACLs?', options:['ls -la filename','getfacl filename — shows owner, group, and all extended ACL entries with effective permissions','acl -show filename','cat /etc/acl/filename'], correct:1, explanation:'getfacl (get file ACL) displays all ACL entries: user:: (owner), group:: (owning group), other:: (others), user:alice:rwx (named user entry), group:devs:r-x (named group entry), and mask:: (maximum effective permissions for named users/groups). The mask limits even explicitly granted permissions. setfacl sets ACLs: setfacl -m u:alice:rw- file. Remove: setfacl -x u:alice file. Remove all ACLs: setfacl -b file.' },
  { id:'q5', question:'What does "umask 027" mean for newly created files and directories?', options:['All new files get permissions 027','Files get 640 (rw-r-----) and directories get 750 (rwxr-x---) — umask subtracts from defaults: 666-027=640 for files, 777-027=750 for dirs','All new files are hidden from other users','The umask value is added to file permissions'], correct:1, explanation:'umask works by subtraction. Default file permissions: 666. Default directory permissions: 777. umask 027: 666 minus 027 = 640 (rw-r-----); 777 minus 027 = 750 (rwxr-x---). Owner gets read/write; group gets read (files) or read/execute (dirs); others get nothing. This is stricter than the common 022 umask. Set permanently in ~/.bashrc, /etc/profile, or /etc/login.conf (BSD).' },
]

function LabStep({ number, description, command, language='bash', output }) {
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

export default function UnixPermissions() {
  return (
    <LessonLayout
      lessonId="unix-04" courseId="unix"
      title="Unix File Permissions & ACLs" courseTitle="Unix"
      courseHref="/unix" xp={70} readTime="~25 min" icon="🔒"
      breadcrumbs={[{label:'Home',href:'/'},{label:'Unix',href:'/unix'},{label:'Unix Permissions & ACLs'}]}
      prev={{ title:'BSD Unix Systems',     href:'/unix/bsd' }}
      next={{ title:'Process Management',   href:'/unix/processes' }}
      objectives={['Read octal and symbolic permission strings fluently','Set SUID, SGID, and sticky bits correctly','Use getfacl and setfacl for extended ACL management','Configure umask for appropriate default permissions','Audit a system for dangerous permission misconfigurations','Understand permission portability across Unix variants']}
    >
      <section>
        <h2>Overview</h2>
        <p>Unix permissions are the original access control model — defined by POSIX and implemented identically across Linux, macOS, FreeBSD, and all Unix systems. Understanding them deeply means you can work on any Unix-like system without re-learning permission concepts.</p>
      </section>
      <section>
        <h2>Permission Reference</h2>
        <CodeBlock title="Complete permission operations" language="bash"
          code={CODE_UNIXPERMISSIONS_1} />
      </section>
      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header"><span className="lab-badge">LAB UNIX-4</span><span className="text-sm font-semibold text-white">POSIX ACL Practice on Ubuntu</span><span className="ml-auto text-xs text-slate-500 font-mono">~15 min</span></div>
          <div className="lab-body space-y-8">
            <LabStep number={1} description="Create a shared project directory with per-user ACLs."
              command={CODE_UNIXPERMISSIONS_2}
              output={CODE_UNIXPERMISSIONS_3} />
          </div>
        </div>
      </section>
      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="unix-04" title="Unix Permissions & ACLs Quiz" questions={QUIZ_QUESTIONS} passingScore={70} xpReward={35} />
      </section>
    </LessonLayout>
  )
}
