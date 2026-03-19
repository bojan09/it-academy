import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-brand-border bg-brand-dark py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-brand-accent rounded flex items-center justify-center font-bold text-xs">
              IT
            </div>
            <span className="font-extrabold tracking-tighter text-lg uppercase">
              Academy
            </span>
          </div>
          <p className="text-brand-muted text-sm max-w-xs">
            Professional-grade IT infrastructure training. Scalable, hands-on,
            and industry-standard.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
            Platform
          </h4>
          <ul className="text-brand-muted text-sm space-y-2 font-medium">
            <li>
              <a href="#" className="hover:text-brand-accent">
                Courses
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-brand-accent">
                VMware Labs
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-brand-accent">
                XP Leaderboard
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
            Support
          </h4>
          <ul className="text-brand-muted text-sm space-y-2 font-medium">
            <li>
              <a href="#" className="hover:text-brand-accent">
                Glossary
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-brand-accent">
                Cheat Sheets
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-brand-accent">
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-brand-muted font-mono">
          © 2026 IT_ACADEMY_SYSTEMS.v1.0.4
        </p>
        <div className="flex gap-6">
          <span className="text-[10px] font-mono text-brand-accent">
            STATUS: SYSTEM_ONLINE
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
