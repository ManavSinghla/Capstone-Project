import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Scale,
  FileText,
} from './Icons';

export default function ComplianceScorecard({
  evaluations = [],
  overallStatus = 'COMPLIANT',
  pdpAreaSqCm = 120,
}) {
  const [filter, setFilter] = useState('ALL');
  const [expandedCode, setExpandedCode] = useState(null);

  const passedCount = evaluations.filter((e) => e.status === 'COMPLIANT').length;
  const failedCount = evaluations.filter((e) => e.status === 'NON_COMPLIANT').length;
  const reviewCount = evaluations.filter((e) => e.status === 'NEEDS_REVIEW').length;

  const filteredEvaluations = evaluations.filter((e) => {
    if (filter === 'ALL') return true;
    return e.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLIANT':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'NON_COMPLIANT':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'NEEDS_REVIEW':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <Scale className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLIANT':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
            COMPLIANT
          </span>
        );
      case 'NON_COMPLIANT':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
            NON-COMPLIANT
          </span>
        );
      case 'NEEDS_REVIEW':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
            NEEDS REVIEW
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            N/A
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Overall Scorecard Banner */}
      <div
        className={`px-5 py-4 border-b ${
          overallStatus === 'COMPLIANT'
            ? 'bg-emerald-500/10 border-emerald-200'
            : overallStatus === 'NON_COMPLIANT'
            ? 'bg-rose-500/10 border-rose-200'
            : 'bg-amber-500/10 border-amber-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
              Audit Verdict · Legal Metrology Rules 2011
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                {overallStatus === 'COMPLIANT' && 'Label Fully Compliant'}
                {overallStatus === 'NON_COMPLIANT' && 'Statutory Violation Identified'}
                {overallStatus === 'NEEDS_REVIEW' && 'Manual Review Recommended'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-md font-bold bg-white text-emerald-700 border border-emerald-200 shadow-xs">
              {passedCount} Passed
            </span>
            {failedCount > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-md font-bold bg-white text-rose-700 border border-rose-200 shadow-xs">
                {failedCount} Failed
              </span>
            )}
            {reviewCount > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-md font-bold bg-white text-amber-700 border border-amber-200 shadow-xs">
                {reviewCount} Review
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-blue-600" />
          Rule-by-Rule Compliance Ledger
        </span>
        <div className="flex items-center gap-1">
          {['ALL', 'COMPLIANT', 'NON_COMPLIANT', 'NEEDS_REVIEW'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                filter === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Evaluation List */}
      <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto p-2">
        {filteredEvaluations.map((item) => {
          const isExpanded = expandedCode === item.ruleCode;
          return (
            <div
              key={item.ruleCode}
              className="p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpandedCode(isExpanded ? null : item.ruleCode)}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">{getStatusIcon(item.status)}</div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 leading-tight">
                      {item.title || item.ruleCode}
                    </h3>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                      {item.explanation}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-3">
                  {getStatusBadge(item.status)}
                  <button className="text-slate-400 hover:text-slate-600">
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Expandable Statutory Details */}
              {isExpanded && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 text-[11px] space-y-1 bg-slate-50/70 p-2.5 rounded-md">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-semibold">Legal Citation:</span>
                    <span className="font-mono text-blue-700">{item.legalCitation}</span>
                  </div>
                  {item.evidenceSnippet && (
                    <div className="text-slate-600">
                      <span className="font-semibold block">Extracted Evidence:</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 block mt-0.5">
                        "{item.evidenceSnippet}"
                      </span>
                    </div>
                  )}
                  {item.isProvisional && (
                    <div className="text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200 text-[10px]">
                      Rule marked provisional. Requires administrator gazette confirmation before issuing non-compliance.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
