import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Docket from "./pages/Docket";
import Trial from "./pages/Trial";
import AddCase from "./pages/AddCase";
import CustomCursor from "./components/CustomCursor";
import ScrollToTop from "./components/ScrollToTop";
import { Plus } from "lucide-react";

function App() {
  return (
    <Router>
      {/* Reset scroll position on route change */}
      <ScrollToTop />

      {/* Custom lagging interactive cursor */}
      <CustomCursor />

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 w-full z-50 mix-blend-difference px-6 py-6 flex items-center justify-between pointer-events-none">
        <Link to="/" className="pointer-events-auto flex items-center gap-1 hover:opacity-80 transition-opacity">
          <span className="text-2xl font-bold tracking-tighter text-white lowercase">verdict</span>
        </Link>
        <Link to="/add" className="pointer-events-auto text-white hover:rotate-90 transition-transform duration-300">
          <Plus className="w-6 h-6" />
        </Link>
      </header>

      {/* Page Content */}
      <main className="flex-grow flex flex-col bg-white text-black pt-24">
        <Routes>
          <Route path="/" element={<Docket />} />
          <Route path="/trial/:caseId" element={<Trial />} />
          <Route path="/add" element={<AddCase />} />
        </Routes>
      </main>

      {/* Editorial High-Contrast Footer */}
      <footer className="bg-[#0A0A0A] text-white pt-20 pb-10 px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 pb-16">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <span className="text-4xl font-bold tracking-tighter uppercase">VERDICT</span>
            <p className="text-[#888888] text-sm max-w-sm leading-relaxed">
              AI-powered courtroom for security, fraud, compliance, and forensic investigations.
            </p>
            <p className="text-[#888888] text-sm max-w-sm leading-relaxed">
              Three personas debate.<br />
              One verdict is delivered.
            </p>
          </div>
          {/* Column 2: Investigation Flow */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase font-mono tracking-widest text-[#888888]">Investigation Flow</h4>
            <ul className="space-y-2 text-sm">
              {["Alert Created", "Evidence Submitted", "Arguments Generated", "Verdict Reached", "Case Archived"].map((item) => (
                <li key={item} className="text-white/70 hover:text-white hover:translate-x-1 transition-all duration-300 cursor-default">{item}</li>
              ))}
            </ul>
          </div>
          {/* Column 3: Supported Domains */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase font-mono tracking-widest text-[#888888]">Supported Domains</h4>
            <ul className="space-y-2 text-sm">
              {["Security", "Fraud", "Compliance", "Cybercrime", "Digital Forensics", "AI Ethics"].map((item) => (
                <li key={item} className="text-white/70 hover:text-white hover:translate-x-1 transition-all duration-300 cursor-default">{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-6xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-[#666666] font-mono uppercase tracking-wider">
          <div>&copy; 2026 VERDICT</div>
          <div className="mt-4 md:mt-0">Evidence &bull; Debate &bull; Judgment</div>
        </div>
      </footer>
    </Router>
  );
}

export default App;

