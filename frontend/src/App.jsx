import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Docket from "./pages/Docket";
import Trial from "./pages/Trial";
import CustomCursor from "./components/CustomCursor";
import { Plus } from "lucide-react";

function App() {
  return (
    <Router>
      {/* Custom lagging interactive cursor */}
      <CustomCursor />

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 w-full z-50 mix-blend-difference px-6 py-6 flex items-center justify-between pointer-events-none">
        <Link to="/" className="pointer-events-auto flex items-center gap-1 hover:opacity-80 transition-opacity">
          <span className="text-2xl font-bold tracking-tighter text-white lowercase">verdict</span>
        </Link>
        <button className="pointer-events-auto text-white hover:rotate-90 transition-transform duration-300">
          <Plus className="w-6 h-6" />
        </button>
      </header>

      {/* Page Content */}
      <main className="flex-grow flex flex-col bg-white text-black pt-24">
        <Routes>
          <Route path="/" element={<Docket />} />
          <Route path="/trial/:caseId" element={<Trial />} />
        </Routes>
      </main>

      {/* Editorial High-Contrast Footer */}
      <footer className="bg-[#0A0A0A] text-white pt-20 pb-10 px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 pb-16">
          {/* Column 1-2: Large Brand Name and Bio */}
          <div className="md:col-span-2 space-y-4">
            <span className="text-4xl font-bold tracking-tighter lowercase">verdict</span>
            <p className="text-[#888888] text-sm max-w-sm leading-relaxed">
              Securing integrity through adversarial reasoning. An automated AI courtroom for Sec-Ops and fraud alert triage. Three personas debate, one court decides.
            </p>
          </div>
          {/* Column 3: Socials */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase font-mono tracking-widest text-[#888888]">Socials</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-neutral-400 transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-neutral-400 transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-neutral-400 transition-colors">LinkedIn</a></li>
            </ul>
          </div>
          {/* Column 4: Contact */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase font-mono tracking-widest text-[#888888]">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-neutral-400 transition-colors">triage@verdict.ai</a></li>
              <li><span className="text-[#888888]">SOC Platform v1.0.0</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="max-w-6xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-[#666666] font-mono uppercase tracking-wider">
          <div>&copy; {new Date().getFullYear()} VERDICT. All Rights Reserved.</div>
          <div className="mt-4 md:mt-0">Operational Integrity Guaranteed</div>
        </div>
      </footer>
    </Router>
  );
}

export default App;

