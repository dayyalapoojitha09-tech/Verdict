import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Scale, ShieldAlert, ArrowLeft, Loader2, Sparkles, MessageSquareDot, HelpCircle, AlertTriangle } from "lucide-react";
import staticCases from "../data/cases.json";
import { getDomainStyle } from "./Docket";

function ConfidenceRing({ percentage }) {
  const radius = 36;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const ringColor = "stroke-black";
  const trackColor = "stroke-black/10";

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle
          className={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx="48"
          cy="48"
        />
        <circle
          className={`${ringColor} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="square"
          fill="transparent"
          r={radius}
          cx="48"
          cy="48"
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-xl font-bold text-black">{percentage}%</span>
        <span className="block text-[8px] uppercase tracking-wider text-neutral-400 font-mono">Confidence</span>
      </div>
    </div>
  );
}

export default function Trial() {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [trialLogs, setTrialLogs] = useState(null);
  
  const [fetchingCase, setFetchingCase] = useState(true);
  const [runningTrial, setRunningTrial] = useState(false);
  const [error, setError] = useState(null);
  
  // Staggered reveal states
  const [showProsecutor, setShowProsecutor] = useState(false);
  const [showDefense, setShowDefense] = useState(false);
  const [showVerdict, setShowVerdict] = useState(false);

  useEffect(() => {
    setFetchingCase(true);
    setError(null);
    
    const foundCase = staticCases.find(c => c.id === caseId);
    if (foundCase) {
      setCaseData(foundCase);
      // Fetch trial log if available on backend
      fetch(`http://localhost:8000/api/cases/${caseId}/trial`)
        .then((res) => {
          if (!res.ok) return null;
          return res.json();
        })
        .then((trialJson) => {
          if (trialJson) {
            setTrialLogs(trialJson);
            setShowProsecutor(true);
            setShowDefense(true);
            setShowVerdict(true);
          }
          setFetchingCase(false);
        })
        .catch((err) => {
          console.warn("Backend trial log fetch failed (offline mode):", err.message);
          setFetchingCase(false);
        });
    } else {
      // Fetch custom case details from backend
      fetch(`http://localhost:8000/api/cases/${caseId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Could not retrieve case details from the database.");
          return res.json();
        })
        .then((caseJson) => {
          setCaseData(caseJson);
          return fetch(`http://localhost:8000/api/cases/${caseId}/trial`);
        })
        .then((res) => {
          if (!res.ok) return null;
          return res.json();
        })
        .then((trialJson) => {
          if (trialJson) {
            setTrialLogs(trialJson);
            setShowProsecutor(true);
            setShowDefense(true);
            setShowVerdict(true);
          }
          setFetchingCase(false);
        })
        .catch((err) => {
          setError(err.message);
          setFetchingCase(false);
        });
    }
  }, [caseId]);

  const handleStartTrial = () => {
    if (runningTrial || trialLogs) return;
    
    setRunningTrial(true);
    setError(null);
    
    setShowProsecutor(false);
    setShowDefense(false);
    setShowVerdict(false);
    
    fetch(`http://localhost:8000/api/cases/${caseId}/trial`, {
      method: "POST"
    })
      .then((res) => {
        if (!res.ok) throw new Error("The AI Tribunal encountered a processing exception.");
        return res.json();
      })
      .then((data) => {
        setTrialLogs(data);
        setRunningTrial(false);
        
        setShowProsecutor(true);
        
        setTimeout(() => {
          setShowDefense(true);
        }, 1500);
        
        setTimeout(() => {
          setShowVerdict(true);
        }, 3000);
      })
      .catch((err) => {
        setError(err.message);
        setRunningTrial(false);
      });
  };

  if (fetchingCase) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-48 bg-white text-neutral-500">
        <Loader2 className="w-8 h-8 text-black animate-spin mb-4" />
        <p className="text-xs font-mono uppercase tracking-widest animate-pulse">Retrieving Dossier...</p>
      </div>
    );
  }

  if (error && !caseData) {
    return (
      <div className="max-w-md mx-auto my-24 p-8 text-center bg-white border border-black/10 rounded">
        <AlertTriangle className="w-8 h-8 text-black mx-auto mb-4" />
        <h2 className="text-lg font-bold uppercase tracking-tight mb-2">Docket Query Error</h2>
        <p className="text-neutral-500 text-sm mb-6">{error}</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-neutral-800 text-xs font-mono uppercase tracking-widest transition-all">
          <ArrowLeft className="w-4 h-4" /> Return to Docket
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 flex-grow bg-white text-black">
      {/* Back link */}
      <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-black transition-colors mb-12 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Docket
      </Link>

      {/* Case Header Card */}
      <div className="bg-white border border-black/10 p-8 mb-12 relative overflow-hidden rounded">
        <div className="absolute top-0 left-0 w-full h-[4px] bg-black" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-black/10 pb-4">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono border px-2 py-0.5 uppercase tracking-widest font-bold rounded ${getDomainStyle(caseData.domain)}`}>
              {caseData.domain}
            </span>
            <span className="text-xs font-mono text-neutral-400">ID: {caseData.id}</span>
          </div>
          {trialLogs && (
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-500">
              VERDICT RECORDED
            </span>
          )}
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-4 text-black">
          {caseData.title}
        </h1>
        
        <p className="text-neutral-600 text-base leading-relaxed font-light mb-8 max-w-4xl">
          {caseData.description}
        </p>

        {/* Evidence Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-black/10">
          <div className="p-6 rounded bg-neutral-50 border border-black/10">
            <h4 className="text-xs font-mono uppercase tracking-widest text-black font-bold mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-black" /> Incriminating Evidence
            </h4>
            <p className="text-sm text-neutral-600 leading-relaxed font-light">{caseData.evidence_notes}</p>
          </div>
          <div className="p-6 rounded bg-neutral-50 border border-black/10">
            <h4 className="text-xs font-mono uppercase tracking-widest text-black font-bold mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" /> Exculpatory Evidence
            </h4>
            <p className="text-sm text-neutral-600 leading-relaxed font-light">{caseData.counter_evidence_notes}</p>
          </div>
        </div>
      </div>

      {/* Action Center */}
      <div className="flex flex-col items-center justify-center mb-16">
        {error && (
          <div className="mb-6 text-xs font-mono text-black bg-neutral-100 border border-black/20 px-6 py-3 rounded">
            {error}
          </div>
        )}
        
        {!trialLogs && !runningTrial ? (
          <button
            onClick={handleStartTrial}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-black text-white hover:bg-neutral-800 text-sm font-mono uppercase tracking-widest transition-all duration-300 transform hover:scale-102 cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            Convene Tribunal
          </button>
        ) : runningTrial ? (
          <div className="flex flex-col items-center gap-3 bg-neutral-50 border border-black/10 px-8 py-4 rounded">
            <Loader2 className="w-6 h-6 text-black animate-spin" />
            <span className="text-xs font-mono text-black animate-pulse tracking-widest uppercase">Tribunal Convening...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-6 py-3 bg-neutral-100 border border-black/10 rounded text-black font-mono text-xs uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            Adjudication Documented & Persisted
          </div>
        )}
      </div>

      {/* Three-Panel Debate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Prosecutor Panel */}
        <div className={`relative bg-white border p-6 transition-all duration-700 rounded ${
          showProsecutor && trialLogs ? "border-black bg-neutral-50" : "border-black/10"
        }`}>
          <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-white border border-black/10 rounded-full text-black flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            Prosecution
          </div>
          
          <h3 className="text-md font-bold uppercase tracking-tight text-black mb-4 border-b border-black/10 pb-2">
            Threat Advocacy
          </h3>

          {runningTrial ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-400 animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin mb-3 text-black" />
              <p className="text-[10px] font-mono uppercase tracking-wider">Formulating Charges...</p>
            </div>
          ) : showProsecutor && trialLogs ? (
            <p className="text-sm text-neutral-700 leading-relaxed font-light">
              {trialLogs.prosecutor_argument}
            </p>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-300">
              <MessageSquareDot className="w-8 h-8 mb-2" />
              <p className="text-xs font-mono uppercase tracking-wider">Dossier Locked</p>
              <p className="text-xs text-neutral-400 mt-1 max-w-[180px]">Convene the tribunal to invoke AI advocacy.</p>
            </div>
          )}
        </div>

        {/* Defense Panel */}
        <div className={`relative bg-white border p-6 transition-all duration-700 rounded ${
          showDefense && trialLogs ? "border-black bg-neutral-50" : "border-black/10"
        }`}>
          <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-white border border-black/10 rounded-full text-black flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            Defense
          </div>

          <h3 className="text-md font-bold uppercase tracking-tight text-black mb-4 border-b border-black/10 pb-2">
            Exculpatory Defense
          </h3>

          {runningTrial ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-300">
              <p className="text-[10px] font-mono uppercase tracking-wider">Waiting for prosecution...</p>
            </div>
          ) : showDefense && trialLogs ? (
            <p className="text-sm text-neutral-700 leading-relaxed font-light">
              {trialLogs.defense_argument}
            </p>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-300">
              <MessageSquareDot className="w-8 h-8 mb-2" />
              <p className="text-xs font-mono uppercase tracking-wider">Rebuttal Pending</p>
              <p className="text-xs text-neutral-400 mt-1 max-w-[180px]">Counter arguments require tribunal convene.</p>
            </div>
          )}
        </div>

        {/* Judge Panel */}
        <div className={`relative bg-white border p-6 transition-all duration-700 rounded ${
          showVerdict && trialLogs ? "border-black bg-neutral-50" : "border-black/10"
        }`}>
          <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-white border border-black/10 rounded-full text-black flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5" />
            Judge
          </div>

          <h3 className="text-md font-bold uppercase tracking-tight text-black mb-4 border-b border-black/10 pb-2">
            Tribunal Judgment
          </h3>

          {runningTrial ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-300">
              <p className="text-[10px] font-mono uppercase tracking-wider">Deliberating Arguments...</p>
            </div>
          ) : showVerdict && trialLogs ? (
            <div className="space-y-6 flex flex-col items-center">
              {/* Verdict Indicator */}
              <div className="w-full flex items-center justify-between bg-white border border-black/10 px-4 py-3 rounded">
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">Verdict:</span>
                <span className="text-sm font-bold uppercase tracking-widest text-black">
                  {trialLogs.judge_verdict}
                </span>
              </div>
              
              {/* SVG Confidence ring */}
              <ConfidenceRing percentage={trialLogs.confidence_score} />
              
              {/* Action Badge */}
              <div className="w-full bg-white border border-black/10 p-4 rounded text-center">
                <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-2 text-left">Recommended Action:</div>
                <span className="text-[10px] font-mono uppercase tracking-widest font-bold bg-black text-white px-3 py-1.5 inline-block leading-normal">
                  {trialLogs.recommended_action}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-300">
              <HelpCircle className="w-8 h-8 mb-2" />
              <p className="text-xs font-mono uppercase tracking-wider">Decision Pending</p>
              <p className="text-xs text-neutral-400 mt-1 max-w-[180px]">Judicial ruling is pending deliberation completion.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
