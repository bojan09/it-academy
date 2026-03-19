import React, { useEffect, useState } from 'react'

/**
 * XPToast — floating notification that animates in when XP is earned.
 * Mount it once in Layout, trigger via the global event 'xp-earned'.
 *
 * Dispatch from anywhere:
 *   window.dispatchEvent(new CustomEvent('xp-earned', { detail: { amount: 50, reason: 'Lesson complete' } }))
 */
export default function XPToast() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handler = (e) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, ...e.detail }])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 3200)
    }
    window.addEventListener('xp-earned', handler)
    return () => window.removeEventListener('xp-earned', handler)
  }, [])

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-800
                     border border-accent-amber/30 shadow-card-lg
                     animate-fade-up"
        >
          <div className="w-9 h-9 rounded-xl bg-accent-amber/15 border border-accent-amber/25
                          flex items-center justify-center flex-shrink-0">
            <span className="text-lg">⚡</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-accent-amber font-mono">
              +{toast.amount} XP
            </p>
            {toast.reason && (
              <p className="text-[11px] text-slate-400 mt-0.5">{toast.reason}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Helper — dispatch from lesson/quiz components */
export function fireXPToast(amount, reason = '') {
  window.dispatchEvent(new CustomEvent('xp-earned', { detail: { amount, reason } }))
}
