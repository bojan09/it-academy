import React from "react";
import { Link } from "react-router-dom";

const FOOTER_LINKS = {
  "Learning Paths": [
    { label: "Windows Server 2025", href: "/windows-server-2025" },
    { label: "Linux Fundamentals", href: "/linux" },
    { label: "Networking", href: "/networking" },
    { label: "Cybersecurity", href: "/cybersecurity" },
    { label: "Python for SysAdmins", href: "/python" },
    { label: "PowerShell", href: "/powershell" },
    { label: "DevOps", href: "/devops" },
    { label: "Unix", href: "/unix" },
  ],
  "Tools & Reference": [
    { label: "Cheat Sheets", href: "/cheatsheets" },
    { label: "Port Lookup", href: "/port-lookup" },
    { label: "VMware Lab Setup", href: "/vmware-setup" },
    { label: "IT Models", href: "/it-models" },
    { label: "Troubleshooting", href: "/troubleshooting" },
  ],
  Platform: [
    { label: "Home", href: "/" },
    { label: "Progress Dashboard", href: "/" },
    { label: "Achievements", href: "/" },
    { label: "Windows Desktop", href: "/windows" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-surface-700 bg-surface-900 mt-20 no-print">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-12 lg:py-16">
        {/* Top section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <div
                className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center
                              group-hover:bg-brand-400 transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-[18px] h-[18px]"
                >
                  <path
                    d="M4 6h16M4 10h10M4 14h12"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="20" cy="14" r="2.5" fill="white" />
                </svg>
              </div>
              <span className="font-bold text-white text-[15px]">
                SysAdmin<span className="text-brand-400">Pro</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Production-quality IT training for sysadmins, DevOps engineers,
              and infrastructure professionals.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-accent-green">
              <span className="w-2 h-2 rounded-full bg-accent-green" />
              All lessons free during beta
            </div>

            {/* Keyboard hint */}
            <div
              className="mt-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800
                            border border-surface-700 text-xs text-slate-500 w-fit"
            >
              <kbd className="font-mono text-slate-400">⌘K</kbd>
              <span>to search anywhere</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                {heading}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="divider pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SysAdminPro. Built for IT
            professionals.
          </p>
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
            <span className="tag">
              Work in Progress by:
              <a
                className="footer_link"
                rel="stylesheet"
                href="https://b-web-solutions.vercel.app/"
              >
                B Web Solutions
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
