import React, { useState, useCallback } from 'react'

// ─── Syntax highlighter — single-pass tokenizer ────────────────────────────
//
// CRITICAL: We use ONE combined regex pass so that tokens matched first
// (comments, strings) are never re-processed by later patterns.
// Multi-pass tokenizers corrupt span class attributes (e.g. "t-comment" gets
// wrapped inside a t-string span, breaking HTML and leaking class names as text).

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Language-specific keyword sets
const BASH_KW = new Set([
  'sudo','apt','apt-get','yum','dnf','pacman','systemctl','service',
  'chmod','chown','chgrp','ls','cd','pwd','mkdir','rmdir','rm','cp','mv',
  'cat','less','more','grep','find','awk','sed','cut','sort','uniq','wc',
  'head','tail','echo','export','source','ssh','scp','rsync','tar','zip',
  'unzip','curl','wget','netstat','ss','ip','ifconfig','ping','traceroute',
  'nmap','ufw','firewall-cmd','mount','umount','df','du','ps','top','htop',
  'kill','killall','useradd','usermod','userdel','groupadd','passwd','su',
  'visudo','cron','crontab','journalctl','dmesg','lsblk','fdisk','mkfs',
  'vim','nano','git','docker','kubectl','terraform','ansible','python3',
  'python','pip','pip3','node','npm','which','type','alias','unset','read',
])

function tokenize(raw, language) {
  const code = raw.trim()
  const isPS = language === 'powershell' || language === 'ps1'

  // Single combined regex — order matters: comments > strings > keywords > numbers > ops
  // Each alternative is captured in a numbered group so we know which matched.
  //
  // Group 1: line comment  (#...)
  // Group 2: double-quoted string
  // Group 3: single-quoted string
  // Group 4: PS cmdlet (Verb-Noun pattern)
  // Group 5: PS param (-Flag)  /  bash keyword
  // Group 6: success line start (✔/✓)
  // Group 7: error line start (✘/✗/ERROR)
  // Group 8: number literal
  // Group 9: operator / pipe / semicolon

  const COMBINED = /(#[^\n]*)|("""[\s\S]*?"""|"(?:[^"\\]|\\.)*")|('''[\s\S]*?'''|'(?:[^'\\]|\\.)*')|([A-Z][a-z]+-[A-Z]\w+)|((?:^|\s)-[A-Za-z][\w-]*|\b(?:sudo|apt|apt-get|yum|dnf|systemctl|chmod|chown|ls|cd|mkdir|rm|cp|mv|cat|grep|find|awk|sed|echo|export|ssh|curl|wget|ping|ip|ufw|df|ps|kill|useradd|passwd|su|journalctl|docker|kubectl|git|python3|python|pip|vim|nano|tar|unzip|rsync|netstat|ss|top|htop|mount|cron|ansible|terraform)\b)|^(✔[^\n]*|✓[^\n]*)|^(✘[^\n]*|✗[^\n]*|ERROR[^\n]*)|\b(\d+\.?\d*)\b|([|\\;&])/gm

  // Escape the code first — no HTML in the input
  const escaped = escapeHtml(code)

  const result = escaped.replace(COMBINED, (match, comment, dqStr, sqStr, psCmdlet, kwOrParam, successLine, errorLine, num, op) => {
    if (comment    !== undefined) return `<span class="t-comment">${comment}</span>`
    if (dqStr      !== undefined) return `<span class="t-string">${dqStr}</span>`
    if (sqStr      !== undefined) return `<span class="t-string">${sqStr}</span>`
    if (psCmdlet   !== undefined) return `<span class="t-fn">${psCmdlet}</span>`
    if (kwOrParam  !== undefined) {
      const trimmed = match.trim()
      // PS param (-Flag) vs bash keyword
      if (trimmed.startsWith('-') && isPS) return match.replace(trimmed, `<span class="t-param">${trimmed}</span>`)
      if (BASH_KW.has(trimmed)) return match.replace(trimmed, `<span class="t-fn">${trimmed}</span>`)
      return match
    }
    if (successLine !== undefined) return `<span class="t-success">${match}</span>`
    if (errorLine   !== undefined) return `<span class="t-error">${match}</span>`
    if (num        !== undefined) return `<span class="t-number">${num}</span>`
    if (op         !== undefined) return `<span class="t-op">${op}</span>`
    return match
  })

  return result
}

// ─── CodeBlock ────────────────────────────────────────────────────────────────
/**
 * @param {string}  code      — raw code string
 * @param {string}  language  — 'powershell' | 'bash' | 'text'
 * @param {string}  title     — optional label shown in title bar
 * @param {boolean} showCopy  — show copy button (default true)
 * @param {string}  className — extra classes on wrapper
 */
export default function CodeBlock({
  code = '',
  language = 'bash',
  title = '',
  showCopy = true,
  className = '',
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [code])

  // language='text' → no syntax highlighting, just escape
  const html = language === 'text'
    ? escapeHtml(code.trim())
    : tokenize(code.trim(), language)

  const langLabel = {
    powershell: 'PowerShell',
    ps1:        'PowerShell',
    bash:       'Bash',
    shell:      'Shell',
    python:     'Python',
    text:       'Output',
  }[language] || language.toUpperCase()

  return (
    <div className={`rounded-xl overflow-hidden border border-surface-600 bg-surface-900 ${className}`}>

      {/* ── Title bar ── */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5
                      bg-surface-800 border-b border-surface-700">
        <div className="flex items-center gap-2">
          {/* Traffic light dots */}
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-accent-red/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-accent-amber/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-accent-green/60" />
          </div>
          {title && (
            <span className="text-xs font-mono text-slate-500 ml-1">{title}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Language badge */}
          <span className="text-[10px] font-mono text-slate-600 bg-surface-700
                           px-2 py-0.5 rounded border border-surface-600">
            {langLabel}
          </span>

          {/* Copy button */}
          {showCopy && (
            <button
              onClick={handleCopy}
              className={[
                'flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1',
                'rounded-lg border transition-all duration-200',
                copied
                  ? 'bg-accent-green/10 border-accent-green/30 text-accent-green'
                  : 'bg-surface-700 border-surface-600 text-slate-400 hover:text-white hover:border-slate-500',
              ].join(' ')}
              aria-label="Copy code"
            >
              {copied ? (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24"
                       stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* ── Code body ── */}
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-6 text-slate-300">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>

    </div>
  )
}
