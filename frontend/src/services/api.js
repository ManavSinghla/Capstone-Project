/**
 * api.js — API client for Express backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export async function fetchRules() {
  const res = await fetch(`${API_BASE_URL}/rules`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchPresets() {
  const res = await fetch(`${API_BASE_URL}/presets`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function processInspection(formData) {
  const res = await fetch(`${API_BASE_URL}/inspections/process`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to process inspection: ${text}`);
  }
  return await res.json();
}

export async function liveReEvaluate(payload) {
  const res = await fetch(`${API_BASE_URL}/compliance/re-evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to re-evaluate: ${text}`);
  }
  return await res.json();
}

export async function downloadInspectionPdf(inspectionId) {
  const res = await fetch(`${API_BASE_URL}/inspections/${inspectionId}/report.pdf`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.blob();
}

export async function generatePdfReport(payload) {
  const res = await fetch(`${API_BASE_URL}/report/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to generate PDF report: ${text}`);
  }
  return await res.blob();
}

