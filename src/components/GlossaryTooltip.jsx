import React, { useState, useRef, useEffect } from 'react'
import GLOSSARY from '../data/glossary.js'

/**
 * GlossaryTooltip — wraps a technical term and shows a definition on hover/tap.
 * Usage: <GlossaryTooltip term="Active Directory" />
 *   or:  <GlossaryTooltip term="DHCP">custom label</GlossaryTooltip>
 */
export default function GlossaryTooltip({ term, children }) {
  const [visible, setVisible] = useState(false)
  const [above,   setAbove]   = useState(false)
  const ref     = useRef(null)
  const timerRef = useRef(null)

  const definition = GLOSSARY[term]
  const label      = children || term

  // Position: check if near bottom of viewport → show above
  const updatePosition = () => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setAbove(rect.bottom > window.innerHeight - 160)
  }

  const show = () => {
    clearTimeout(timerRef.current)
    updatePosition()
    setVisible(true)
  }
  const hide = () => {
    timerRef.current = setTimeout(() => setVisible(false), 150)
  }

  // Close on outside click (mobile tap-away)
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setVisible(false)
    }
    if (visible) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [visible])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  if (!definition) {
    // Term not in glossary — render plain
    return <span className="font-medium text-white">{label}</span>
  }

  return (
    <span
      ref={ref}
      className="relative inline-block"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {/* The term itself */}
      <span
        className="text-brand-300 border-b border-brand-400/40 border-dashed cursor-help
                   hover:text-brand-200 hover:border-brand-300 transition-colors duration-150
                   font-medium"
        onClick={() => setVisible(v => !v)}
        tabIndex={0}
        role="button"
        aria-label={`Definition: ${term}`}
      >
        {label}
      </span>

      {/* Tooltip */}
      {visible && (
        <span
          className={`absolute z-50 w-72 px-4 py-3 rounded-xl bg-surface-800 border border-surface-600
                      shadow-card-lg text-xs text-slate-300 leading-relaxed
                      transition-all duration-150
                      ${above ? 'bottom-full mb-2' : 'top-full mt-2'}
                      left-0`}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          {/* Arrow */}
          <span
            className={`absolute left-3 w-2 h-2 bg-surface-800 border-surface-600 rotate-45
                        ${above
                          ? 'bottom-[-5px] border-b border-r'
                          : 'top-[-5px]  border-t border-l'}`}
          />
          <span className="block text-[10px] font-semibold text-brand-400 uppercase tracking-widest mb-1.5">
            {term}
          </span>
          {definition}
        </span>
      )}
    </span>
  )
}
