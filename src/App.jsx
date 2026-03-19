import React from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto">
          <div className="text-center md:text-left max-w-3xl">
            <div className="inline-block py-1 px-3 rounded-full border border-brand-accent/30 bg-brand-accent/10 text-brand-accent text-[10px] font-bold uppercase tracking-widest mb-6">
              Platform v2.0 is live
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-tight">
              Master the{" "}
              <span className="text-brand-accent">Infrastructure</span> Stack.
            </h1>
            <p className="text-brand-muted text-lg md:text-xl font-medium mb-10 leading-relaxed">
              Real-world IT labs, automated learning paths, and enterprise-level
              certifications. Built for the modern SysAdmin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="btn-primary py-4 px-10 text-base">
                Start Learning
              </button>
              <button className="border border-brand-border hover:bg-brand-border text-white font-semibold py-4 px-10 rounded-lg transition-all text-base">
                View Learning Paths
              </button>
            </div>
          </div>
        </section>

        {/* Featured Paths Preview */}
        <section className="px-6 py-12 bg-brand-dark/50 border-y border-brand-border">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Featured Learning Paths
                </h2>
                <p className="text-brand-muted font-medium">
                  Curated paths for career progression
                </p>
              </div>
              <a
                href="#"
                className="text-brand-accent text-sm font-bold hover:underline hidden md:block"
              >
                View all paths →
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {["Windows Server 2025", "Enterprise Linux", "Cybersecurity"].map(
                (course) => (
                  <div
                    key={course}
                    className="card-gradient p-6 rounded-xl group cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-brand-dark rounded-lg border border-brand-border mb-4 flex items-center justify-center group-hover:bg-brand-accent transition-colors">
                      <svg
                        className="w-6 h-6 text-brand-accent group-hover:text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 tracking-tight">
                      {course}
                    </h3>
                    <p className="text-brand-muted text-sm font-medium mb-6">
                      Master the core concepts of {course} in a hands-on
                      environment.
                    </p>
                    <div className="flex justify-between items-center text-xs font-bold font-mono text-brand-accent uppercase">
                      <span>12 Lessons</span>
                      <span>5000 XP</span>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default App;
