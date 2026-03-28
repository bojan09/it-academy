import React from 'react'
import LessonLayout from '../../components/LessonLayout.jsx'
import CodeBlock from '../../components/CodeBlock.jsx'
import Quiz from '../../components/Quiz.jsx'

// ── Code snippet constants (extracted from JSX props) ──
const CODE_UNIXPOSIXSHELL_1 = `#!/bin/sh
# POSIX-compliant script
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SCRIPT_NAME="$(basename "$0")"
LOG_FILE="/var/log/\${SCRIPT_NAME%.sh}.log"
LOCK_FILE="/tmp/\${SCRIPT_NAME%.sh}.lock"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }
die() { log "ERROR: $*" >&2; exit 1; }

# Cleanup on exit
cleanup() {
    rm -f "$LOCK_FILE"
    log 'Script finished'
}
trap cleanup EXIT INT TERM

# Prevent concurrent runs
[ -f "$LOCK_FILE" ] && die 'Already running'
echo $$ > "$LOCK_FILE"

# ── Main logic ────────────────────────────────────────────
log 'Script started'

[ -d /var/backup ] || mkdir -p /var/backup

for service in ssh nginx; do
    if command -v "$service" >/dev/null 2>&1; then
        log "Found: $service"
    else
        log "Not found: $service"
    fi
done`
const CODE_UNIXPOSIXSHELL_2 = `# Check which shell /bin/sh points to
ls -la /bin/sh

# Run a script under dash explicitly to test portability
dash myscript.sh

# Check for bashisms that break portability
shellcheck --shell=sh myscript.sh`


const QUIZ_QUESTIONS = [
  { id:'q1', question:'What is the key difference between $() and backtick command substitution?', options:['They are identical','"$() is POSIX-standard and supports nesting; backticks are legacy and cannot be nested — always use $() in new scripts"','$() works in bash only; backticks work in all shells','Backticks expand variables; $() does not'], correct:1, explanation:'Both capture command output. $() is POSIX-standard, clearly readable, and supports nesting: $(echo $(date)). Backtick substitution `cmd` is legacy, harder to read (confusable with single quotes), and cannot be nested. All modern POSIX shells support $(). Never use backticks in new scripts.' },
  { id:'q2', question:'What does "set -euo pipefail" at the top of a shell script do?', options:['Sets environment variables e, u, o, and pipefail','Makes the script exit on any unhandled error (-e), treat unset variables as errors (-u), and fail the whole pipeline if any command in a pipe fails (pipefail)','Sets the script to run with elevated privileges','Enables debugging mode that traces every command'], correct:1, explanation:'"set -e": exit immediately if any command returns non-zero. "set -u": treat unset variables as errors (catches typos like $USRE). "set -o pipefail": without this, "false | true" succeeds because the last command succeeded. Combined as "set -euo pipefail" at the script top, this is the de-facto safety belt for production shell scripts.' },
  { id:'q3', question:'In POSIX sh, how do you check if a file exists before processing it?', options:['if file_exists "/path/to/file"; then','if [ -f "/path/to/file" ]; then — using POSIX test syntax with square brackets','if test -exists "/path/to/file"; then','if (exists "/path/to/file"); then'], correct:1, explanation:'POSIX test operators: -f (regular file exists), -d (directory exists), -e (any file exists), -r (readable), -w (writable), -x (executable), -s (non-empty). Always quote the path: [ -f "$filepath" ] not [ -f $filepath ] — unquoted variables with spaces break the test. In bash you can use [[ ]] but [ ] is portable POSIX.' },
  { id:'q4', question:'What is the purpose of the "trap" command in shell scripts?', options:['It captures user input interactively','It defines cleanup actions to run when the script exits or receives a signal — essential for cleaning up temp files, releasing locks, and handling Ctrl+C gracefully','It traps errors and continues execution without exiting','It monitors system calls made by the script'], correct:1, explanation:'"trap \'cleanup\' EXIT" registers a function to run whenever the script exits for any reason — normal exit, error, or signal. "trap \'cleanup\' INT TERM EXIT" also catches Ctrl+C (INT) and kill (TERM). Use it to: remove temporary files (rm -f "$tmpfile"), release lock files, stop background processes, and log that the script ended. Without trap, Ctrl+C during a script can leave lock files and temp files behind.' },
  { id:'q5', question:'What does "<<\' EOF\'" (with single-quoted delimiter) vs "<<EOF" do in heredoc?', options:['They are identical — quoting the delimiter has no effect','Single-quoted delimiter (\'EOF\') prevents variable expansion and command substitution inside the heredoc — the content is literal; unquoted EOF expands $variables and $(commands)'], correct:1, explanation:'Heredoc: cat <<EOF outputs the block with variable expansion (like double-quoted string). cat <<\'EOF\' suppresses all expansion — dollar signs and backticks are literal. Use <<\'EOF\' when writing scripts or config files that contain shell syntax that should not be expanded. Use <<EOF when you want to embed values from the current environment.' },
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

export default function UnixPOSIXShell() {
  return (
    <LessonLayout
      lessonId="unix-02" courseId="unix"
      title="POSIX Shell Scripting" courseTitle="Unix"
      courseHref="/unix" xp={70} readTime="~30 min" icon="🖥️"
      breadcrumbs={[{label:'Home',href:'/'},{label:'Unix',href:'/unix'},{label:'POSIX Shell Scripting'}]}
      prev={{ title:'Unix Philosophy & History', href:'/unix/philosophy' }}
      next={{ title:'BSD Unix Systems',          href:'/unix/bsd' }}
      objectives={['Write POSIX-compliant sh scripts that run on any Unix system','Use set -euo pipefail for robust error handling','Handle signals and cleanup with trap','Write portable conditionals, loops, and functions','Use heredocs for embedded configuration','Test scripts for portability with dash']}
    >
      <section>
        <h2>Overview</h2>
        <p>POSIX shell scripting is the skill that makes your scripts work everywhere — Linux, macOS, FreeBSD, Solaris. A script written to the POSIX standard with #!/bin/sh runs on any certified system without modification.</p>
      </section>
      <section>
        <h2>POSIX Script Template</h2>
        <CodeBlock title="production-ready POSIX sh template" language="bash"
          code={CODE_UNIXPOSIXSHELL_1} />
      </section>
      <section>
        <h2>VMware Lab Exercise</h2>
        <div className="lab-block">
          <div className="lab-header"><span className="lab-badge">LAB UNIX-2</span><span className="text-sm font-semibold text-white">Write and Test a POSIX Script</span><span className="ml-auto text-xs text-slate-500 font-mono">~15 min</span></div>
          <div className="lab-body space-y-8">
            <LabStep number={1} description="Verify your script runs under dash (strict POSIX sh) not just bash."
              command={CODE_UNIXPOSIXSHELL_2}
              output="/bin/sh -> dash    <- Ubuntu uses POSIX dash, not bash" />
          </div>
        </div>
      </section>
      <section>
        <h2>Lesson Quiz</h2>
        <p className="mb-6 text-slate-400 text-sm">5 questions · Pass at 70% to unlock the next lesson.</p>
        <Quiz lessonId="unix-02" title="POSIX Shell Scripting Quiz" questions={QUIZ_QUESTIONS} passingScore={70} xpReward={35} />
      </section>
    </LessonLayout>
  )
}
