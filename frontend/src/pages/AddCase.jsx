import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";

export default function AddCase() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("Security");
  const [description, setDescription] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [counterEvidenceNotes, setCounterEvidenceNotes] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const domains = [
    "Security",
    "Fraud",
    "Cybercrime",
    "Compliance",
    "HR",
    "Operations",
    "Healthcare",
    "Legal",
    "AI Ethics",
    "Digital Forensics"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim() || !description.trim()) {
      setError("Title and Description are required fields.");
      return;
    }

    setSubmitting(true);

    const newCase = {
      id: crypto.randomUUID(),
      title: title.trim(),
      domain: domain,
      description: description.trim(),
      evidence_notes: evidenceNotes.trim() || "No incriminating evidence provided.",
      counter_evidence_notes: counterEvidenceNotes.trim() || "No exculpatory evidence provided.",
      status: "pending",
    };

    try {
      const storedCases = localStorage.getItem("verdict_custom_cases");
      const customCases = storedCases ? JSON.parse(storedCases) : [];
      customCases.push(newCase);
      localStorage.setItem("verdict_custom_cases", JSON.stringify(customCases));
      setSubmitting(false);
      navigate("/");
    } catch (e) {
      setError("Failed to save case locally: " + e.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white text-black min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-black transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Docket
        </Link>

        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <span className="meta-mono text-neutral-400 text-xs">COURT DOSSIER INTAKE</span>
          <h2 className="headline-huge text-4xl uppercase tracking-tighter">Submit New Case</h2>
          <p className="text-neutral-500 text-sm max-w-md mx-auto">
            Input a threat intelligence alert, audit failure, or operational incident. The adversarial debate pipeline will process the logs.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8 bg-neutral-50 border border-black/10 p-8 rounded-lg">
          {error && (
            <div className="flex items-start gap-2.5 bg-neutral-100 border border-black/20 p-4 rounded text-black text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Title */}
            <div className="md:col-span-2 flex flex-col space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold">
                Case Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unrecognized API Key Generation"
                className="bg-transparent border-b border-black/20 focus:border-black py-2 px-1 text-sm text-black transition-colors focus:outline-none rounded-none"
                required
              />
            </div>

            {/* Domain */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold">
                Domain Category <span className="text-red-500">*</span>
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="bg-transparent border-b border-black/20 focus:border-black py-2 px-1 text-sm text-black transition-colors focus:outline-none rounded-none cursor-pointer"
              >
                {domains.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-neutral-500 font-bold">
              Dossier Summary / Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the detected threat vector, audit anomaly, or operational discrepancy..."
              rows="2"
              className="bg-transparent border-b border-black/20 focus:border-black py-2 px-1 text-sm text-black transition-colors focus:outline-none resize-none rounded-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Incriminating Evidence */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-black font-bold">
                Incriminating Logs / Evidence <span className="text-neutral-400 font-light">(Optional)</span>
              </label>
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
              <label className="text-xs font-mono uppercase tracking-wider text-black font-bold">
                Exculpatory Counter-Evidence <span className="text-neutral-400 font-light">(Optional)</span>
              </label>
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
      </div>
    </div>
  );
}
