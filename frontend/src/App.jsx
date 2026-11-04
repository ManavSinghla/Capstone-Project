import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            LM
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-none">
              Legal Metrology Compliance System
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              SIH Problem Statement 26034 · Packaged Commodities Rules 2011
            </p>
          </div>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Milestone 1 Active
        </span>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Architecture Scaffolding Complete
          </h2>
          <p className="text-slate-600 max-w-lg mx-auto mb-6 text-sm">
            Backend API, Compliance Engine (31/31 unit tests passing), PostgreSQL/Prisma Schema,
            FastAPI OCR Microservice, and React Frontend baseline are configured.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span className="font-semibold text-slate-700 block">Frontend</span>
              <span className="text-slate-500">React + Vite + Tailwind (5173)</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">Backend</span>
              <span className="text-slate-500">Express + Prisma (5000)</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block">OCR Service</span>
              <span className="text-slate-500">FastAPI + OpenCV + PaddleOCR (8000)</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-slate-400 border-t border-slate-200">
        Ministry of Consumer Affairs, Food & Public Distribution · Smart India Hackathon 2024
      </footer>
    </div>
  );
}

