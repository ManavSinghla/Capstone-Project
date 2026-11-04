import React from 'react';
import { AlertCircle, CheckCircle } from './Icons';

export default function QualityBanner({ quality = {} }) {
  const { blurScore = 150, isBlurry = false, glarePercentage = 2.0, isOverexposed = false } = quality;

  if (!isBlurry && !isOverexposed) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 flex items-center justify-between text-xs text-emerald-800">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>
            <strong className="font-semibold">OpenCV Image Quality Passed:</strong> Sharp focus (Laplacian Variance: {blurScore.toFixed(1)}), glare: {glarePercentage.toFixed(1)}%
          </span>
        </div>
        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
          Optimal for OCR
        </span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center justify-between text-xs text-amber-900">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <div>
          <span className="font-semibold block">Image Quality Warning Detected:</span>
          <span className="text-[11px] text-amber-800">
            {isBlurry && `Image is blurry (Laplacian Variance: ${blurScore.toFixed(1)} < 100). `}
            {isOverexposed && `Significant reflective glare (${glarePercentage.toFixed(1)}% overexposed pixels). `}
            Text extractions may require inspector verification.
          </span>
        </div>
      </div>
      <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded shrink-0">
        Low Image Fidelity
      </span>
    </div>
  );
}
