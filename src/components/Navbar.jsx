import React, { useState } from "react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="glass-nav px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-accent rounded flex items-center justify-center font-bold text-lg">
            IT
          </div>
          <span className="font-extrabold tracking-tighter text-xl uppercase">
            Academy
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-muted">
          <a href="#" className="hover:text-white transition-colors">
            Dashboard
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Learning Paths
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Labs
          </a>
          <button className="btn-primary">Sign In</button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isMobileMenuOpen
                  ? "M6 18L18 6M6 6l12 12"
                  : "M4 6h16M4 12h16m-7 6h7"
              }
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-brand-dark border-b border-brand-border p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          <a href="#" className="text-lg font-medium">
            Dashboard
          </a>
          <a href="#" className="text-lg font-medium">
            Learning Paths
          </a>
          <a href="#" className="text-lg font-medium">
            Labs
          </a>
          <button className="btn-primary w-full mt-2">Sign In</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
