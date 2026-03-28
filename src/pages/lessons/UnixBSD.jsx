import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_UNIXBSD_1 = `# Bootstrap pkg if first run
pkg bootstrap

# Update package catalogue
pkg update

# Install packages
pkg install nginx python39 vim

# Upgrade all installed packages
pkg upgrade

# Search for packages
pkg search webserver

# Show package info
pkg info nginx

# List installed packages
pkg list

# Remove a package
pkg delete nginx

# Audit for known vulnerabilities
pkg audit -F`
const CODE_UNIXBSD_2 = `uname -a           # Linux kernel info
uname -s           # OS name: Linux (vs FreeBSD, Darwin)

# On Linux, check if any BSD tools are installed
which pkg 2>/dev/null || echo 'pkg not available (Linux system)'

# macOS/BSD users have 'sw_vers' for version info
# sw_vers          # on macOS only`


const QUIZ_QUESTIONS = [
  { id:'q1', question:'What is the main licensing difference between BSD and Linux?', options:['There is no licensing difference','BSD uses the permissive BSD/MIT license allowing use in proprietary products without source disclosure; Linux uses the GPL which requires derivative works to be open source','BSD requires commercial licenses; Linux is free','GPL allows commercial use; BSD does not'], correct:1, explanation:'The BSD license (2-clause or 3-clause) allows anyone to use, modify, and redistribute the code — even in closed-source commercial products — with minimal requirements (attribution). The GPL (Linux kernel) requires that derivative works also be GPL-licensed. Apple used BSD networking code in macOS without open-sourcing all of macOS. Sony uses FreeBSD in PlayStation OS. This licensing flexibility drives BSD adoption in commercial products.' },
  { id:'q2', question:'What is the FreeBSD Ports system?', options:['A package manager for downloading pre-compiled binaries','A collection of build scripts and patches for compiling third-party software from source on FreeBSD, with automatic dependency handling — produces locally optimised binaries','A repository of FreeBSD kernel modules','A system for managing network ports and firewall rules'], correct:1, explanation:'The FreeBSD Ports Collection contains build recipes (Makefiles + patches) for thousands of applications. "cd /usr/ports/www/nginx && make install clean" downloads the source, applies BSD-specific patches, compiles with local optimisations, and installs. pkg is the binary package manager (like apt) that installs pre-compiled versions. Ports give you customisation (compile with specific options); pkg gives you speed. Both share the same dependency graph.' },
  { id:'q3', question:'What distinguishes OpenBSD from FreeBSD and NetBSD?', options:['OpenBSD is faster; the others prioritise security','OpenBSD prioritises security and correctness above all else — its default install is the most hardened out-of-the-box Unix system, with exploit mitigations, randomised memory layout, and mandatory code auditing. It is the origin of OpenSSH and LibreSSL','OpenBSD is a commercial product; the others are free','OpenBSD only runs on x86; the others support ARM'], correct:1, explanation:'OpenBSD\'s motto: "Only two remote holes in the default install, in a heck of a long time." It ships with ASLR, W^X (writable XOR executable memory), stack canaries, and pledge/unveil system call restrictions by default. The team audits all code for security flaws. Major contributions: OpenSSH (the SSH implementation used everywhere), OpenBGPD, LibreSSL (a fork of OpenSSL with security improvements). Used as firewalls, routers, and for applications requiring very high security assurance.' },
  { id:'q4', question:'What does pkg(8) do on FreeBSD?', options:['Manages kernel modules','The binary package manager for FreeBSD — equivalent to apt on Ubuntu: pkg install nginx, pkg upgrade, pkg search, pkg info, pkg delete', 'Manages user accounts','Configures network packages'], correct:1, explanation:'pkg (pkgng) is the modern FreeBSD binary package manager. Commands mirror apt/dnf: pkg install nginx (install), pkg upgrade (upgrade all), pkg delete nginx (remove), pkg info nginx (show info), pkg search webserver (find packages), pkg autoremove (remove orphan dependencies), pkg audit (check installed packages against vulnerability database). Packages come from the official FreeBSD repository and are built against the matching FreeBSD version.' },
  { id:'q5', question:'How does the FreeBSD base system differ from the ports/packages in terms of releases?', options:['They always release together on the same schedule','The FreeBSD base system (kernel + core userland) has its own release cycle (~18 months major, ~3 months minor); ports/packages are updated continuously and independently — you can have FreeBSD 14.0 base with the latest nginx package','The base system is never updated; only ports can be upgraded','Ports are part of the base system on all BSD variants'], correct:1, explanation:'FreeBSD has a clean separation: the base system (freebsd-update) contains the kernel, libc, and core utilities — updated with security patches via freebsd-update fetch install. Third-party software (nginx, Python, databases) is managed entirely through pkg or ports, updated independently. This separation means a security patch to the base system does not require rebuilding all applications, and application updates don\'t require a kernel update.' },
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

export default function UnixBSD() {
  return (
    <LessonLayout
      lessonId="unix-03" courseId="unix"
      title="BSD Unix Systems" courseTitle="Unix"
      courseHref="/unix" xp={60} readTime="~25 min" icon="🗄️"
      breadcrumbs={[{label:'Home',href:'/'},{label:'Unix',href:'/unix'},{label:'BSD Unix Systems'}]}
      prev={{ title:'POSIX Shell Scripting', href:'/unix/posix-shell' }}
      next={{ title:'Unix File Permissions', href:'/unix/permissions' }}
      objectives={['Distinguish FreeBSD, OpenBSD, and NetBSD use cases','Understand BSD licensing vs GPL','Use pkg to manage packages on FreeBSD','Understand the base system vs ports separation','Know why OpenBSD is the gold standard for security','Recognise BSD-derived systems in enterprise environments']}
    >
      <section>
        <h2>Overview</h2>
        <p>BSD Unix systems power some of the world's most critical infrastructure: Netflix uses FreeBSD for CDN servers, Apple's macOS is BSD-derived, and OpenBSD is the security gold standard. Understanding BSD is essential context for any serious Unix/Linux professional.</p>
      </section>
      <section>
        <h2>BSD Comparison</h2>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          {[
            { name:'FreeBSD', icon:'🟠', tagline:'Performance & Features', color:'border-accent-amber/25 bg-accent-amber/5', text:'text-accent-amber', uses:['Netflix CDN','PlayStation OS','WhatsApp servers','High-performance networking','ZFS storage systems'] },
            { name:'OpenBSD', icon:'🔴', tagline:'Security First', color:'border-accent-red/25 bg-accent-red/5', text:'text-accent-red', uses:['Firewall/router platforms','Origin of OpenSSH','High-assurance systems','Security research','Embedded security devices'] },
            { name:'NetBSD', icon:'🔵', tagline:'Maximum Portability', color:'border-brand-500/25 bg-brand-500/5', text:'text-brand-300', uses:['Embedded systems','Exotic hardware (toasters!!)','Research platforms','Legacy hardware support','IoT devices'] },
          ].map(b=>(
            <div key={b.name} className={`card p-5 border ${b.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{b.icon}</span>
                <div><p className={`font-bold ${b.text}`}>{b.name}</p><p className="text-[11px] text-slate-500">{b.tagline}</p></div>
              </div>
              {b.uses.map(u=>(<div key={u} className="flex gap-2 text-xs text-slate-400 mb-1"><span className={`flex-shrink-0 ${b.text}`}>▸</span>{u}</div>))}
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2>FreeBSD Package Management</h2>
        <CodeBlock title="pkg — FreeBSD binary package manager" language="bash"
          code={CODE_UNIXBSD_1} />
      </section>
      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header"><span className="lab-badge">LAB UNIX-3</span><span className="text-sm font-semibold text-white">Explore BSD Concepts on Ubuntu</span><span className="ml-auto text-xs text-slate-500 font-mono">~10 min</span></div>
          <div className="lab-body space-y-8">
            <LabStep number={1} description="Compare Linux and BSD uname output to understand system identification."
              command={CODE_UNIXBSD_2}
              output={"Linux srv01 5.15.0 #1 SMP x86_64 GNU/Linux\nLinux\npkg not available (Linux system)"} />
          </div>
        </div>
      </section>
      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="unix-03" title="BSD Unix Systems Quiz" questions={QUIZ_QUESTIONS} passingScore={70} xpReward={30} />
      </section>
    </LessonLayout>
  )
}
