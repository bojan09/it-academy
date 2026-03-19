import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Breadcrumb
 * @param {Array} crumbs - [{ label, href }] — last item is current page (no href needed)
 */
export default function Breadcrumb({ crumbs = [] }) {
  if (!crumbs.length) return null

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 flex-wrap">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <React.Fragment key={crumb.label}>
            {isLast ? (
              <span className="text-slate-300 font-medium">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.href}
                className="hover:text-white transition-colors duration-150"
              >
                {crumb.label}
              </Link>
            )}
            {!isLast && (
              <svg className="w-3 h-3 text-slate-700 flex-shrink-0" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
