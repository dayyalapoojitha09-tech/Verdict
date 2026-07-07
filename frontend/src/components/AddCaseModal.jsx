import React, { useState } from "react";
import { X, Hammer, AlertTriangle, ShieldCheck } from "lucide-react";

export default function AddCaseModal({ isOpen, onClose, onCaseAdded }) {
  if (!isOpen) return null;

  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("Security");
  const [description, setDescription] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [counterEvidenceNotes, setCounterEvidenceNotes] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim() || !description.trim() || !evidenceNotes.trim() || !counterEvidenceNotes.trim()) {
      setError("Please populate all case dossier fields before filing.");
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
        onCaseAdded(newCase);
        handleClose();
      })
      .catch((err) => {
        setError(err.message);
        setSubmitting(false);
      });
  };

  const handleClose = () => {
    // Reset fields
    setTitle("");
    setDomain("Security");
    setDescription("");
    setEvidenceNotes("");
    setCounterEvidenceNotes("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050608]/85 backdrop-blur-sm animate-fade-in-up">
      {/* Modal Card */}
      <div className="relative bg-courtroom-panel border border-courtroom-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Accent strip */}
        <div className="h-[4px] bg-gradient-to-r from-court-red via-court-gold to-court-blue" />
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-courtroom-border/40">
          <div className="flex items-center gap-2">
            <Hammer className="w-5 h-5 text-court-gold" />
            <h3 className="font-serif font-extrabold text-white text-lg tracking-wide">File New Court Case</h3>
          </div>
          <button
            onClick={handleClose}
            className="text-courtroom-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 bg-court-red/10 border border-court-red/25 p-3 rounded-lg text-court-red text-xs font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Title */}
            <div className="md:col-span-2 space-y-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-courtroom-muted">Case Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Unrecognized Token Generation"
                className="w-full bg-courtroom-bg border border-courtroom-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-court-gold focus:ring-1 focus:ring-court-gold"
              />
            </div>

            {/* Domain */}
            <div className="space-y-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-courtroom-muted">Domain</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-courtroom-bg border border-courtroom-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-court-gold focus:ring-1 focus:ring-court-gold"
              >
                <option value="Security">Security</option>
                <option value="Fraud">Fraud</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-courtroom-muted">Case Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a concise summary of the flagged threat or transaction anomaly..."
              rows="2"
              className="w-full bg-courtroom-bg border border-courtroom-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-court-gold focus:ring-1 focus:ring-court-gold resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Evidence Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-court-red font-semibold">Incriminating Evidence Notes</label>
              <textarea
                value={evidenceNotes}
                onChange={(e) => setEvidenceNotes(e.target.value)}
                placeholder="List logs, IP flagging, reset times, fingerprint discrepancies..."
                rows="4"
                className="w-full bg-courtroom-bg border border-courtroom-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-court-red/40 focus:ring-1 focus:ring-court-red resize-none font-light leading-relaxed"
              />
            </div>

            {/* Counter-Evidence Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-court-blue font-semibold">Exculpatory Counter-Evidence Notes</label>
              <textarea
                value={counterEvidenceNotes}
                onChange={(e) => setCounterEvidenceNotes(e.target.value)}
                placeholder="List employee calendar entries, travel itineraries, prior support tickets..."
                rows="4"
                className="w-full bg-courtroom-bg border border-courtroom-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-court-blue/40 focus:ring-1 focus:ring-court-blue resize-none font-light leading-relaxed"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-courtroom-border/40">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-courtroom-border/60 hover:bg-courtroom-border text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-court-gold hover:bg-court-gold/90 disabled:opacity-50 text-courtroom-bg text-sm font-serif font-bold rounded-lg transition-all cursor-pointer hover:shadow-lg hover:shadow-gold-500/10"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Filing...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  File Case
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
