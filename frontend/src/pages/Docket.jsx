import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import securityBg from "../assets/security_bg.png";
import fraudBg from "../assets/fraud_bg.png";
import staticCases from "../data/cases.json";

export default function Docket() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form States
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("Security");
  const [description, setDescription] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [counterEvidenceNotes, setCounterEvidenceNotes] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    setCases(staticCases);
    setLoading(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!title.trim() || !description.trim() || !evidenceNotes.trim() || !counterEvidenceNotes.trim()) {
      setFormError("Please populate all case dossier fields before filing.");
      return;
    }

    setSubmitting(true);

    const payload = {
      title: title.trim(),
      domain: domain,
      description: description.trim(),
      evidence_notes: evidenceNotes.trim(),
      counter_evidence_notes: counterEvidenceNotes.trim(),
    };

    fetch("http://localhost:8000/api/cases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((json) => {
            throw new Error(json.detail || "Failed to submit new case.");
          });
        }
        return res.json();
      })
      .then((newCase) => {
        setSubmitting(false);
        setCases((prev) => [...prev, newCase]);
        setTitle("");
        setDomain("Security");
        setDescription("");
        setEvidenceNotes("");
        setCounterEvidenceNotes("");
        setFormError(null);
      })
      .catch((err) => {
        setFormError("Failed to file dossier: connection to the courtroom database failed.");
        setSubmitting(false);
      });
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

  // Helper to determine image
  const getCaseImage = (domain) => {
    return domain === "Security" ? securityBg : fraudBg;
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

      {/* 4. Project Grid */}
      <section className="max-w-6xl mx-auto px-6 py-24 border-b border-black/10">
        <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 border-b border-black/10 pb-6">
          <h2 className="headline-huge text-4xl uppercase tracking-tighter">Active Alerts</h2>
          <span className="meta-mono text-neutral-400 text-xs">{cases.length} alerts filed on docket</span>
        </div>

        {error ? (
          <div className="p-8 text-center bg-neutral-50 border border-neutral-200 rounded-lg max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-black mx-auto mb-4" />
            <p className="text-sm font-mono uppercase tracking-widest text-black">Docket Connection Refused</p>
            <p className="text-xs text-neutral-500 mt-2">{error}</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 border border-black/10">
            <p className="text-sm font-mono uppercase tracking-widest text-neutral-400">No active alerts currently filed</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
            {cases.map((item) => (
              <Link
                key={item.id}
                to={`/trial/${item.id}`}
                className="group flex flex-col space-y-4 cursor-pointer"
              >
                {/* 4:3 Image container with slight rounding and hover overlay */}
                <div className="relative overflow-hidden aspect-[4/3] rounded bg-neutral-100 border border-black/10">
                  <img
                    src={getCaseImage(item.domain)}
                    alt={item.title}
                    className="w-full h-full object-cover img-editorial"
                  />
                  <div className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition-colors duration-500" />
                  
                  {/* Top-right arrow appearing on hover */}
                  <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-full border border-black/10 opacity-0 transform translate-x-2 -translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500 ease-out">
                    <ArrowUpRight className="w-5 h-5 text-black" />
                  </div>
                </div>

                {/* Metadata row */}
                <div className="pt-4 border-t border-black/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold tracking-tight group-hover:underline transition-all duration-300">
                      {item.title}
                    </h3>
                    <p className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
                      {item.domain} &mdash; ID: {item.id.slice(0, 8)}
                    </p>
                  </div>
                  <span className="meta-mono text-xs text-neutral-600 bg-neutral-100 border border-black/10 px-2.5 py-1 rounded">
                    {item.status === "verdict_reached" ? "CLOSED" : "PENDING"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 5. Inline Case Filing Dossier Section */}
      <section className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-center space-y-4 mb-16">
          <span className="meta-mono text-neutral-400 text-xs">ALERT FILING DOSSIER</span>
          <h2 className="headline-huge text-4xl uppercase tracking-tighter">Submit New Case</h2>
          <p className="text-neutral-500 text-sm max-w-md mx-auto">
            Input a threat intelligence alert dossier. The adversarial debate pipeline will process the logs and counter-arguments end-to-end.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-neutral-50 border border-black/10 p-8 rounded-lg">
          {formError && (
            <div className="flex items-start gap-2.5 bg-neutral-100 border border-black/20 p-4 rounded text-black text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Title */}
            <div className="md:col-span-2 flex flex-col space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-500">Case Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Host-Level Process Injection"
                className="bg-transparent border-b border-black/20 focus:border-black py-2 px-1 text-sm text-black transition-colors focus:outline-none rounded-none"
              />
            </div>

            {/* Domain */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-500">Domain Category</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="bg-transparent border-b border-black/20 focus:border-black py-2 px-1 text-sm text-black transition-colors focus:outline-none rounded-none cursor-pointer"
              >
                <option value="Security">Security</option>
                <option value="Fraud">Fraud</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-500">Dossier Summary / Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the detected threat vector or ledger anomaly details..."
              rows="2"
              className="bg-transparent border-b border-black/20 focus:border-black py-2 px-1 text-sm text-black transition-colors focus:outline-none resize-none rounded-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Incriminating Evidence */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-black font-bold">Incriminating Logs / Evidence</label>
              <textarea
                value={evidenceNotes}
                onChange={(e) => setEvidenceNotes(e.target.value)}
                placeholder="List IP details, network dumps, event logs, access tokens..."
                rows="4"
                className="bg-transparent border-b border-black/20 focus:border-black py-2 px-1 text-sm text-black font-light leading-relaxed transition-colors focus:outline-none resize-none rounded-none"
              />
            </div>

            {/* Exculpatory Counter Evidence */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-black font-bold">Exculpatory Counter-Evidence</label>
              <textarea
                value={counterEvidenceNotes}
                onChange={(e) => setCounterEvidenceNotes(e.target.value)}
                placeholder="List support ticket context, calendar entries, travel, explanations..."
                rows="4"
                className="bg-transparent border-b border-black/20 focus:border-black py-2 px-1 text-sm text-black font-light leading-relaxed transition-colors focus:outline-none resize-none rounded-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-4 bg-black text-white hover:bg-neutral-800 disabled:opacity-50 text-sm font-mono uppercase tracking-widest transition-all duration-300 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Filing Dossier...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                File Dossier to Courtroom
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
