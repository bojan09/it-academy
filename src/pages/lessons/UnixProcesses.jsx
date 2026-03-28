import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_UNIXPROCESSES_1 = `# ── Inspect processes ────────────────────────────────────
ps aux                    # All processes, all users
ps aux | grep nginx        # Filter by name
ps -ef                    # Full format (PPID visible)
pgrep nginx               # Get PIDs by name
pgrep -u root             # Get PIDs owned by root

# ── Signals ──────────────────────────────────────────────
kill PID                  # SIGTERM (15) — graceful
kill -9 PID               # SIGKILL — force
kill -HUP PID             # SIGHUP — reload config
pkill nginx               # Kill by process name
pkill -u alice            # Kill all of alice's processes
killall -HUP sshd         # Signal all matching processes

# ── Job control ──────────────────────────────────────────
long_command &            # Run in background
Ctrl+Z                    # Suspend current process
jobs                      # List background/suspended jobs
fg %1                     # Bring job 1 to foreground
bg %1                     # Resume job 1 in background
nohup command &           # Run immune to hangup (survives logout)
disown %1                 # Remove from job table (survives shell exit)`
const CODE_UNIXPROCESSES_2 = `# Start two background jobs
sleep 60 &
sleep 60 &

# List them
jobs

# Check their PIDs
ps aux | grep sleep | grep -v grep

# Bring first to foreground and cancel it
fg %1
# Press Ctrl+C to kill it

# Kill the remaining job by PID
kill %2
echo 'Both jobs cleaned up'`
const CODE_UNIXPROCESSES_3 = `[1] 1234
[2] 1235
[1]-  Running    sleep 60 &
[2]+  Running    sleep 60 &
Both jobs cleaned up`


const QUIZ_QUESTIONS = [
  { id:'q1', question:'What is the difference between SIGTERM and SIGKILL?', options:['They are identical signals','SIGTERM (15) politely requests the process to terminate — the process can catch it, clean up, and exit gracefully; SIGKILL (9) is sent directly to the kernel and cannot be caught, blocked, or ignored — the process is immediately destroyed without cleanup','SIGTERM kills the process group; SIGKILL kills only the named process','SIGKILL requires root; SIGTERM can be sent by any user'], correct:1, explanation:'Always try SIGTERM first: kill PID (default is SIGTERM). The well-behaved process closes files, releases locks, flushes buffers, and exits. Give it 5-10 seconds. Only use SIGKILL (kill -9 PID or kill -KILL PID) if the process is stuck and not responding to SIGTERM. SIGKILL-ing a process can leave: temporary files, lock files, open database transactions, and incomplete I/O. It is a last resort.' },
  { id:'q2', question:'What does "jobs" show in a shell session and how do you bring a background job to the foreground?', options:['It lists all system processes','jobs lists processes started in the current shell session that are running in the background (with &) or have been suspended (Ctrl+Z); fg %N brings job N to the foreground, bg %N resumes a suspended job in the background','jobs lists scheduled cron tasks','It shows CPU usage for each running program'], correct:1, explanation:'Unix job control: command & runs it in background. Ctrl+Z suspends a running process (SIGTSTP). jobs shows all background/suspended jobs with their job numbers. fg %1 brings job 1 to the foreground. bg %1 resumes job 1 in the background. The job number (%N) is shell-local — different from the PID. disown %N removes a job from the shell\'s job table so it survives shell exit (unlike plain backgrounding).' },
  { id:'q3', question:'What does "wait" do in a shell script?', options:['Pauses execution for a fixed number of seconds','Waits for all background processes started in the current script to complete before continuing — essential for parallel execution patterns','Waits for a file to appear on disk','Blocks until a specific user connects to the system'], correct:1, explanation:'"wait" without arguments waits for ALL background processes. "wait PID" waits for a specific PID. "wait $!" waits for the last background command. Use pattern: start_job1 & start_job2 & wait — runs both jobs in parallel then waits for both to finish. Check exit status: wait $pid1; status=$?. Essential for parallel processing in shell scripts where you want to run N tasks simultaneously then collect results.' },
  { id:'q4', question:'What information does "ps aux" show that "ps" alone does not?', options:['ps aux shows only user processes; plain ps shows all processes','ps aux shows all processes (a=all users, u=user-oriented format with CPU/MEM%, x=include processes not attached to a terminal) — plain ps shows only processes in the current terminal session','ps aux filters out system processes','They show identical information in different formats'], correct:1, explanation:'"ps" shows only processes associated with your current terminal. "ps aux": a=show processes for all users, u=show user/CPU/MEM columns, x=include daemon processes with no controlling terminal. Output includes: USER, PID, %CPU, %MEM, VSZ (virtual size), RSS (physical RAM), STAT (process state: S=sleeping, R=running, Z=zombie, D=uninterruptible disk wait), and COMMAND.' },
  { id:'q5', question:'What is a zombie process and why is it harmless but a symptom of a bug?', options:['A zombie process is consuming excessive CPU and memory','A zombie (Z state in ps) is a process that has finished but whose exit status has not been collected by its parent — it takes no CPU or memory but its PID slot is held until the parent calls wait()', 'A zombie is a process running as the wrong user','A zombie has been isolated from the network for security'], correct:1, explanation:'When a process exits, it becomes a zombie until its parent calls wait() to collect the exit status. Zombies consume: no CPU, no memory — just a PID entry in the process table. They appear as Z in ps output. If a parent creates many zombies and never reaps them, eventually the PID table fills. Root cause: a bug in the parent process that ignores SIGCHLD or never calls wait(). Killing the parent process causes PID 1 (init/systemd) to adopt and reap the zombies.' },
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

export default function UnixProcesses() {
  return (
    <LessonLayout
      lessonId="unix-05" courseId="unix"
      title="Process & Signal Management" courseTitle="Unix"
      courseHref="/unix" xp={70} readTime="~25 min" icon="⚡"
      breadcrumbs={[{label:'Home',href:'/'},{label:'Unix',href:'/unix'},{label:'Process & Signal Management'}]}
      prev={{ title:'Unix File Permissions', href:'/unix/permissions' }}
      next={null}
      objectives={['Use ps, top, and htop to inspect processes','Send signals with kill, pkill, and killall','Use job control: bg, fg, jobs, nohup, disown','Write parallel shell scripts with & and wait','Understand zombie processes and the process lifecycle','Use pgrep and pkill for process management by name']}
    >
      <section><h2>Overview</h2><p>Unix process management is a POSIX-standard model: every process has a PID, parent PID, owner, and state. Signals are the inter-process communication mechanism. Understanding this model lets you manage processes, write parallel scripts, and diagnose runaway or stuck processes on any Unix system.</p></section>
      <section>
        <h2>Process & Signal Reference</h2>
        <CodeBlock title="Complete process management toolkit" language="bash"
          code={CODE_UNIXPROCESSES_1} />
      </section>
      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header"><span className="lab-badge">LAB UNIX-5</span><span className="text-sm font-semibold text-white">Process Management on Ubuntu</span><span className="ml-auto text-xs text-slate-500 font-mono">~15 min</span></div>
          <div className="lab-body space-y-8">
            <LabStep number={1} description="Practice job control and parallel execution."
              command={CODE_UNIXPROCESSES_2}
              output={CODE_UNIXPROCESSES_3} />
          </div>
        </div>
      </section>
      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to complete the Unix course.</p>
        <Quiz lessonId="unix-05" title="Process & Signal Management Quiz" questions={QUIZ_QUESTIONS} passingScore={70} xpReward={35} />
      </section>
    </LessonLayout>
  )
}
