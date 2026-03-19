import React, { useState, useCallback } from 'react'

// ─── Simple token-based syntax highlighter ────────────────────────────────────
// Supports: PowerShell, Bash, and generic command output.
// No external dependencies — pure CSS classes.

const PS_KEYWORDS   = /\b(Install-WindowsFeature|Install-ADDSForest|Get-ADUser|Set-ADUser|New-ADUser|Remove-ADUser|Get-Service|Start-Service|Stop-Service|Restart-Service|Get-Process|Get-Item|Set-Item|New-Item|Remove-Item|Get-Content|Set-Content|Add-Content|Copy-Item|Move-Item|Rename-Item|Test-Path|Get-ChildItem|Select-Object|Where-Object|ForEach-Object|Import-Module|Export-Csv|ConvertTo-Json|ConvertFrom-Json|Write-Host|Write-Output|Write-Error|Invoke-Command|Enter-PSSession|New-PSSession|Get-WindowsFeature|Enable-WindowsOptionalFeature|Disable-WindowsOptionalFeature|netsh|ipconfig|ping|nslookup|tracert|whoami|hostname)\b/g
const PS_PARAMS     = /(-\w+)/g
const PS_STRINGS    = /("([^"\\]|\\.)*"|'([^'\\]|\\.)*')/g
const PS_COMMENTS   = /(#.*)$/gm
const PS_NUMBERS    = /\b(\d+)\b/g
const PS_OPERATORS  = /(\||\\|;|&&|\|\|)/g

const BASH_KEYWORDS = /\b(sudo|apt|apt-get|yum|dnf|pacman|systemctl|service|chmod|chown|chgrp|ls|cd|pwd|mkdir|rmdir|rm|cp|mv|cat|less|more|grep|find|awk|sed|cut|sort|uniq|wc|head|tail|echo|export|source|ssh|scp|rsync|tar|zip|unzip|curl|wget|netstat|ss|ip|ifconfig|ping|traceroute|nmap|ufw|firewall-cmd|mount|umount|df|du|ps|top|htop|kill|killall|useradd|usermod|userdel|groupadd|passwd|su|visudo|cron|crontab|journalctl|dmesg|lsblk|fdisk|mkfs|vim|nano|git|docker|kubectl|terraform|ansible)\b/g

function tokenize(code, language) {
  // Escape HTML
  const esc = (s) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  let html = esc(code)

  // Comments first (highest priority, covers rest of line)
  html = html.replace(/(#.*)$/gm, '<span class="t-comment">$1</span>')

  // Strings
  html = html.replace(/("([^"<\\]|\\.)*"|'([^'<\\]|\\.)*')/g, '<span class="t-string">$1</span>')

  if (language === 'powershell' || language === 'ps1') {
    html = html.replace(/\b(Install-\w+|Get-\w+|Set-\w+|New-\w+|Remove-\w+|Add-\w+|Enable-\w+|Disable-\w+|Start-\w+|Stop-\w+|Restart-\w+|Test-\w+|Import-\w+|Export-\w+|Write-\w+|Invoke-\w+|Enter-\w+|ConvertTo-\w+|ConvertFrom-\w+)\b/g,
      '<span class="t-fn">$1</span>')
    html = html.replace(/(?<!["\w])(-[A-Za-z]+)\b/g, '<span class="t-param">$1</span>')
  } else {
    // Bash / shell
    html = html.replace(/\b(sudo|apt|apt-get|yum|dnf|systemctl|chmod|chown|ls|cd|mkdir|rm|cp|mv|cat|grep|find|awk|sed|echo|export|ssh|curl|wget|netstat|ip|ping|ufw|mount|df|ps|top|kill|useradd|passwd|docker|kubectl|terraform|git)\b/g,
      '<span class="t-fn">$1</span>')
  }

  // Numbers
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="t-number">$1</span>')

  // Operators / pipe / backslash
  html = html.replace(/([|\\;&])/g, '<span class="t-op">$1</span>')

  // Output lines starting with ✔ ✓ → success
  html = html.replace(/^(✔.*|✓.*)$/gm, '<span class="t-success">$1</span>')

  // Output lines starting with ✘ ✗ ERROR → error
  html = html.replace(/^(✘.*|✗.*|ERROR.*)$/gm, '<span class="t-error">$1</span>')

  return html
}

// ─── CodeBlock ────────────────────────────────────────────────────────────────
/**
 * @param {string}   code       — raw code string
 * @param {string}   language   — 'powershell' | 'bash' | 'text'
 * @param {string}   title      — optional label shown in title bar
 * @param {boolean}  showCopy   — show copy button (default true)
 * @param {string}   readTime   — optional e.g. "~2 min"
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

  const html = tokenize(code.trim(), language)

  const langLabel = {
    powershell: 'PowerShell',
    ps1:        'PowerShell',
    bash:       'Bash',
    shell:      'Shell',
    text:       'Output',
  }[language] || language.toUpperCase()

  return (
    <div className={`rounded-xl overflow-hidden border border-surface-600 bg-surface-900 ${className}`}>
      {/* Title bar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5
                      bg-surface-800 border-b border-surface-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-accent-red/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-accent-amber/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-accent-green/60" />
          </div>
          {title && <span className="text-xs font-mono text-slate-500 ml-1">{title}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-600 bg-surface-700
                           px-2 py-0.5 rounded border border-surface-600">
            {langLabel}
          </span>
          {showCopy && (
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg
                          border transition-all duration-200
                          ${copied
                            ? 'bg-accent-green/10 border-accent-green/30 text-accent-green'
                            : 'bg-surface-700 border-surface-600 text-slate-400 hover:text-white hover:border-slate-500'}`}
              aria-label="Copy code"
            >
              {copied ? (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

      {/* Code body */}
      <pre className="p-4 overflow-x-auto text-sm font-mono leading-6">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}
