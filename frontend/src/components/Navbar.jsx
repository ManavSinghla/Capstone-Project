import React from 'react';
import { ShieldCheck, AlertCircle, FileText } from './Icons';

export default function Navbar({
  overallStatus,
  presets,
  activePresetId,
  onSelectPreset,
  isProcessing,
  onExportPdf,
  isExportingPdf,
}) {
  const getStatusBadge = () => {
    switch (overallStatus) {
      case 'COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            COMPLIANT
          </span>
        );
      case 'NON_COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            NON-COMPLIANT
          </span>
        );
      case 'NEEDS_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            NEEDS REVIEW (HITL)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            READY
          </span>
        );
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  Legal Metrology Compliance Inspector
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  SIH-26034
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Packaged Commodities Rules 2011 · Ministry of Consumer Affairs
              </p>
            </div>
          </div>

          {/* Controls: Preset Switcher & Status */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Preset Selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1">
              <span className="text-xs font-medium text-slate-500 pl-2 hidden md:inline">
                Test Case:
              </span>
              <select
                className="text-xs bg-white border border-slate-200 rounded-md px-2 py-1 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={activePresetId || ''}
                onChange={(e) => onSelectPreset(e.target.value)}
                disabled={isProcessing}
              >
                <option value="">Upload Custom Image</option>
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Overall Verdict Badge */}
            {getStatusBadge()}

            {/* Export Official PDF Memo Button */}
            {onExportPdf && (
              <button
                onClick={onExportPdf}
                disabled={isExportingPdf}
                title="Export official Government of India compliance memo PDF"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 shadow-xs transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                {isExportingPdf ? 'Exporting...' : 'Export Memo'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
