import React from 'react'

/**
 * Skip-to-content link — appears only when focused (Tab from start of page).
 * Meets WCAG 2.1 SC 2.4.1 (Bypass Blocks).
 */
export default function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>
  )
}
