import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, Loader2 } from "lucide-react";
import { GradientCard } from "@/components/ui/gradient-card";
import securityBg from "../assets/security_card.png";
import fraudBg from "../assets/fraud_card.png";
import complianceBg from "../assets/compliance_card.png";
import cybercrimeBg from "../assets/cybercrime_card.png";
import forensicsBg from "../assets/forensics_card.png";
import aiEthicsBg from "../assets/ai_ethics_card.png";
import hrBg from "../assets/hr_card.png";
import operationsBg from "../assets/operations_card.png";
import healthcareBg from "../assets/healthcare_card.png";
import legalBg from "../assets/legal_card.png";
import staticCases from "../data/cases.json";

export const getDomainStyle = (domain) => {
  const styles = {
    Security: "bg-red-50 text-red-700 border-red-200",
    Fraud: "bg-orange-50 text-orange-700 border-orange-200",
    Cybercrime: "bg-purple-50 text-purple-700 border-purple-200",
    Compliance: "bg-green-50 text-green-700 border-green-200",
    HR: "bg-pink-50 text-pink-700 border-pink-200",
    Operations: "bg-blue-50 text-blue-700 border-blue-200",
    Healthcare: "bg-teal-50 text-teal-700 border-teal-200",
    Legal: "bg-slate-100 text-slate-700 border-slate-300",
    "AI Ethics": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "Digital Forensics": "bg-cyan-50 text-cyan-700 border-cyan-200"
  };
  return styles[domain] || "bg-neutral-50 text-neutral-700 border-neutral-200";
};

const domainImages = {
  Security: securityBg,
  Fraud: fraudBg,
  Compliance: complianceBg,
  Cybercrime: cybercrimeBg,
  "Digital Forensics": forensicsBg,
  "AI Ethics": aiEthicsBg,
  HR: hrBg,
  Operations: operationsBg,
  Healthcare: healthcareBg,
  Legal: legalBg,
};

const getDomainGradient = (domain) => {
  const gradients = {
    Security: "red",
    Fraud: "orange",
    Cybercrime: "purple",
    Compliance: "green",
    HR: "pink",
    Operations: "blue",
    Healthcare: "teal",
    Legal: "slate",
    "AI Ethics": "indigo",
    "Digital Forensics": "cyan",
  };
  return gradients[domain] || "gray";
};

const getDomainBadgeColor = (domain) => {
  const colors = {
    Security: "#EF4444",
    Fraud: "#F59E0B",
    Cybercrime: "#8B5CF6",
    Compliance: "#10B981",
    HR: "#EC4899",
    Operations: "#3B82F6",
    Healthcare: "#14B8A6",
    Legal: "#64748B",
    "AI Ethics": "#6366F1",
    "Digital Forensics": "#06B6D4",
  };
  return colors[domain] || "#4B5563";
};

export default function Docket() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Gather all local cases (seeded + custom cases from localStorage)
    let localCases = [...staticCases];
    let clearedCases = [];

    try {
      const clearedStr = localStorage.getItem("verdict_cleared_cases");
      clearedCases = clearedStr ? JSON.parse(clearedStr) : [];
    } catch (e) {
      console.warn("Failed to parse cleared cases:", e);
    }

    try {
      const storedCases = localStorage.getItem("verdict_custom_cases");
      const customCases = storedCases ? JSON.parse(storedCases) : [];
      customCases.forEach(customCase => {
        if (!localCases.some(c => c.id === customCase.id)) {
          localCases.push(customCase);
        }
      });
    } catch (err) {
      console.warn("Failed to load local storage cases:", err);
    }

    // Filter out cleared cases immediately
    localCases = localCases.filter(c => !clearedCases.includes(c.id));

    // 2. Fetch from backend to get updated case statuses (e.g. verdict_reached)
    fetch("http://localhost:8000/api/cases")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load cases from backend server.");
        return res.json();
      })
      .then((backendCases) => {
        // Merge backend cases with local baseline, prioritizing backend status
        const mergedCases = [...localCases];
        backendCases.forEach(bCase => {
          // If the case is cleared, do not include it
          if (clearedCases.includes(bCase.id)) return;

          const idx = mergedCases.findIndex(c => c.id === bCase.id);
          if (idx !== -1) {
            mergedCases[idx] = bCase;
          } else {
            mergedCases.push(bCase);
          }
        });
        setCases(mergedCases);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Backend connection offline, using local data storage:", err.message);
        setCases(localCases);
        setLoading(false);
      });
  }, []);

  const clearCaseLocally = (caseId) => {
    // 1. Add to cleared cases list in localStorage
    const clearedStr = localStorage.getItem("verdict_cleared_cases") || "[]";
    const cleared = JSON.parse(clearedStr);
    if (!cleared.includes(caseId)) {
      cleared.push(caseId);
      localStorage.setItem("verdict_cleared_cases", JSON.stringify(cleared));
    }

    // 2. Remove from custom cases in localStorage if present
    const customStr = localStorage.getItem("verdict_custom_cases") || "[]";
    const custom = JSON.parse(customStr);
    const updatedCustom = custom.filter(c => c.id !== caseId);
    localStorage.setItem("verdict_custom_cases", JSON.stringify(updatedCustom));

    // 3. Update react state to immediately remove from DOM
    setCases(prev => prev.filter(c => c.id !== caseId));
  };

  const handleClear = (caseId) => {
    if (window.confirm("Clear this case? This cannot be undone.")) {
      fetch(`http://localhost:8000/api/cases/${caseId}`, {
        method: "DELETE"
      })
        .then((res) => {
          if (res.status === 404) {
            // Case doesn't exist in backend DB (local-only case) — clear locally
            clearCaseLocally(caseId);
            return;
          }
          if (!res.ok) throw new Error("Failed to delete case from database.");
          return res.json();
        })
        .then((data) => {
          if (data) {
            // Successfully deleted from backend — now clear locally too
            clearCaseLocally(caseId);
          }
        })
        .catch((err) => {
          // If backend is offline, still allow local clearing
          if (err.message === "Failed to fetch" || err.name === "TypeError") {
            console.warn("Backend offline, clearing case locally:", caseId);
            clearCaseLocally(caseId);
          } else {
            console.error("Error clearing case:", err);
            alert("Error clearing case: " + err.message);
          }
        });
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-48 text-neutral-500 bg-white">
        <Loader2 className="w-8 h-8 text-black animate-spin mb-4" />
        <p className="text-xs font-mono uppercase tracking-widest animate-pulse">Loading Docket...</p>
      </div>
    );
  }

  // Set up marquee list
  const defaultMarqueeItems = [
    { id: "d7b5b5c1-1406-444f-836e-9896503c004a", title: "Suspicious Login — New Location, Off Hours", domain: "Security" },
    { id: "6f481c19-97ef-4613-883a-4de3670de8d2", title: "Unusual High-Value Transaction", domain: "Fraud" },
    { id: "f9ab2cd3-5b8d-4e92-a1f9-cf6e0cb708d7", title: "After-Hours Bulk Data Access", domain: "Security" },
  ];
  const displayMarquee = cases.length > 0 ? cases : defaultMarqueeItems;
  const marqueeLoop = [...displayMarquee, ...displayMarquee, ...displayMarquee, ...displayMarquee];

  // Helper to determine image based on domain
  const getCaseImage = (domain) => {
    return domainImages[domain] || securityBg;
  };

  // Helper to determine border radii style based on index
  const getAsymmetricRadius = (index) => {
    const mode = index % 3;
    if (mode === 0) return "rounded-tl-[100px] rounded-br-[40px]";
    if (mode === 1) return "rounded-tr-[100px] rounded-bl-[40px]";
    return "rounded-[40px]";
  };

  return (
    <div className="bg-white text-black min-h-screen">
      {/* 1. Hero Section */}
      <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6 border-b border-black/10">
        <div className="space-y-6">
          <span className="meta-mono text-neutral-400 text-xs tracking-[0.2em] uppercase">VERDICT TRIBUNAL</span>

          {/* Staggered text character reveal */}
          <h1 className="headline-huge uppercase tracking-tighter text-[12vw] leading-[0.8] mb-8 select-none">
            {"verdict".split("").map((char, idx) => (
              <span key={idx} className="letter-reveal-container">
                <span
                  className="letter-reveal-char"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  {char}
                </span>
              </span>
            ))}
          </h1>

          <p className="text-xl md:text-2xl text-neutral-500 max-w-3xl mx-auto font-light leading-relaxed tracking-tight mt-8">
            Securing operations through automated adversarial reasoning. Three AI personas debate critical alerts to unveil the ground truth.
          </p>
        </div>
      </section>

      {/* 2. Infinite Project Marquee */}
      <section className="py-16 overflow-hidden border-b border-black/10 bg-neutral-50">
        <div className="flex select-none">
          <div className="animate-marquee gap-8 pr-8 flex flex-row">
            {marqueeLoop.map((item, idx) => (
              <Link
                key={`${item.id}-${idx}`}
                to={`/trial/${item.id}`}
                className="group w-64 h-[358px] flex-shrink-0 relative overflow-hidden bg-black flex flex-col justify-end p-6 cursor-pointer"
                style={{ borderRadius: "0px" }}
              >
                {/* Image background with grayscale hover */}
                <img
                  src={getCaseImage(item.domain)}
                  alt={item.title}
                  className={`absolute inset-0 w-full h-full object-cover img-editorial opacity-60 group-hover:opacity-90 ${getAsymmetricRadius(idx)}`}
                />

                {/* Fallback styling/mask on card container */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent ${getAsymmetricRadius(idx)}`} />

                {/* Card Content */}
                <div className="relative z-10 space-y-2 text-white">
                  <span className="font-mono text-[10px] tracking-wider uppercase opacity-60">
                    {item.domain}
                  </span>
                  <h3 className="text-lg font-bold tracking-tight leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase text-white/50 group-hover:text-white transition-colors">
                    Explore Dossier <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Centered Introductory Statement */}
      <section className="max-w-4xl mx-auto text-center py-32 px-6 border-b border-black/10">
        <span className="meta-mono text-neutral-400 text-xs">Platform Operational Mandate</span>
        <h2 className="text-4xl font-light tracking-tight mt-6 leading-[1.4] text-neutral-800">
          Unifying automated advocacy, adversarial counter-intelligence, and judicial determination to triage corporate threat alerts.
        </h2>
      </section>

      {/* 4. Project Grid — Gradient Cards */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 border-b border-black/10 pb-6">
          <h2 className="headline-huge text-4xl uppercase tracking-tighter">Active Alerts</h2>
          <span className="meta-mono text-neutral-400 text-xs">{cases.length} alerts filed on docket</span>
        </div>

        {cases.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 border border-black/10">
            <p className="text-sm font-mono uppercase tracking-widest text-neutral-400">No active alerts currently filed</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {cases.map((item) => (
              <GradientCard
                key={item.id}
                badgeText={item.status === "verdict_reached" ? "Verdict Reached" : "Pending Review"}
                badgeColor={getDomainBadgeColor(item.domain)}
                title={item.title}
                description={item.description}
                ctaText="Explore Dossier"
                ctaHref={`/trial/${item.id}`}
                imageUrl={getCaseImage(item.domain)}
                gradient={getDomainGradient(item.domain)}
                onClear={item.status === "verdict_reached" ? () => handleClear(item.id) : undefined}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
