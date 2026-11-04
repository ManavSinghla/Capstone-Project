import React, { useRef, useState } from 'react';
import { UploadCloud, ImageIcon, Box } from './Icons';
import { calculateClientPdpArea } from '../services/clientComplianceEngine';

export default function ImageUploader({
  onImageSelected,
  dimensions,
  onDimensionsChange,
  packageShape,
  onPackageShapeChange,
  isProcessing,
  currentImageUrl,
}) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const pdpArea = calculateClientPdpArea(packageShape, dimensions);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onImageSelected(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-blue-600" />
          1. Packaging Image & Geometry
        </h2>
        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          JPEG, PNG, WebP (≤15MB)
        </span>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/50'
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
          <ImageIcon className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-slate-700">
          Drop package photo here or <span className="text-blue-600 underline">browse</span>
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          Capture Principal Display Panel (PDP) flat & well-lit
        </p>
      </div>

      {/* Package Geometry & Dimensions Inputs */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-slate-500" />
            Package Shape & Dimensions
          </label>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <span>PDP Area:</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              {pdpArea} cm²
            </span>
          </div>
        </div>

        {/* Shape Toggle */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={() => onPackageShapeChange('RECTANGULAR')}
            className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
              packageShape === 'RECTANGULAR'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Rectangular Box / Pouch
          </button>
          <button
            type="button"
            onClick={() => onPackageShapeChange('CYLINDRICAL')}
            className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
              packageShape === 'CYLINDRICAL'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Cylindrical Can / Bottle
          </button>
        </div>

        {/* Dynamic Dimension Fields */}
        {packageShape === 'RECTANGULAR' ? (
          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="block text-[10px] text-slate-500 mb-0.5">Height (cm)</span>
              <input
                type="number"
                min="1"
                step="0.5"
                value={dimensions.height_cm || ''}
                onChange={(e) =>
                  onDimensionsChange({
                    ...dimensions,
                    height_cm: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 mb-0.5">Width (cm)</span>
              <input
                type="number"
                min="1"
                step="0.5"
                value={dimensions.width_cm || ''}
                onChange={(e) =>
                  onDimensionsChange({
                    ...dimensions,
                    width_cm: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 mb-0.5">Depth (cm)</span>
              <input
                type="number"
                min="0"
                step="0.5"
                value={dimensions.depth_cm || ''}
                onChange={(e) =>
                  onDimensionsChange({
                    ...dimensions,
                    depth_cm: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[10px] text-slate-500 mb-0.5">Height (cm)</span>
              <input
                type="number"
                min="1"
                step="0.5"
                value={dimensions.height_cm || ''}
                onChange={(e) =>
                  onDimensionsChange({
                    ...dimensions,
                    height_cm: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 mb-0.5">Circumference (cm)</span>
              <input
                type="number"
                min="1"
                step="0.5"
                value={dimensions.circumference_cm || ''}
                onChange={(e) =>
                  onDimensionsChange({
                    ...dimensions,
                    circumference_cm: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
