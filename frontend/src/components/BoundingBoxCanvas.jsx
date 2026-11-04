import React, { useState, useRef } from 'react';
import { Eye, EyeOff, ZoomIn, ZoomOut, Maximize2, Tag } from './Icons';

export default function BoundingBoxCanvas({
  imageUrl,
  textBlocks = [],
  selectedBlockId,
  onSelectBlock,
  hoveredFieldKey,
}) {
  const [showBoxes, setShowBoxes] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Determine standard coordinate scaling
  // Text block bounding boxes in mock/OCR are in 0-600px canvas coordinates
  const canvasWidth = 600;
  const canvasHeight = 600;

  const getBoxColor = (block) => {
    const isSelected = selectedBlockId === block.id || (hoveredFieldKey && block.fieldKey === hoveredFieldKey);
    if (isSelected) {
      return {
        border: 'border-blue-600 ring-2 ring-blue-400',
        bg: 'bg-blue-500/25',
        badge: 'bg-blue-700 text-white',
      };
    }
    if (block.confidence < 0.80) {
      return {
        border: 'border-amber-500 hover:border-amber-600',
        bg: 'bg-amber-400/20 hover:bg-amber-400/35',
        badge: 'bg-amber-600 text-white',
      };
    }
    return {
      border: 'border-emerald-500 hover:border-emerald-600',
      bg: 'bg-emerald-400/15 hover:bg-emerald-400/30',
      badge: 'bg-emerald-700 text-white',
    };
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-full">
      {/* Canvas Toolbar */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <Tag className="w-4 h-4 text-blue-600" />
          Interactive Bounding Box Canvas
          <span className="text-[11px] font-normal text-slate-500">
            ({textBlocks.length} text regions detected)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowBoxes(!showBoxes)}
            className={`p-1.5 rounded border transition-colors ${
              showBoxes
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title={showBoxes ? 'Hide Bounding Boxes' : 'Show Bounding Boxes'}
          >
            {showBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.0))}
            className="p-1.5 rounded bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
            className="p-1.5 rounded bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(1)}
            className="p-1.5 rounded bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Viewport Area */}
      <div className="relative flex-1 bg-slate-900/95 overflow-auto flex items-center justify-center p-4 min-h-[460px]">
        <div
          className="relative transition-transform duration-150 origin-center rounded-lg shadow-2xl overflow-hidden bg-slate-950"
          style={{
            transform: `scale(${zoomLevel})`,
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
          }}
        >
          {/* Packaging Image Backdrop */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Packaged Commodity Label"
              className="w-full h-full object-cover select-none pointer-events-none opacity-90"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
              No label photo loaded
            </div>
          )}

          {/* Interactive Bounding Box Overlay */}
          {showBoxes &&
            textBlocks.map((block) => {
              const bb = block.bounding_box || { x_min: 0, y_min: 0, x_max: 100, y_max: 20 };
              const left = (bb.x_min / canvasWidth) * 100;
              const top = (bb.y_min / canvasHeight) * 100;
              const width = ((bb.x_max - bb.x_min) / canvasWidth) * 100;
              const height = ((bb.y_max - bb.y_min) / canvasHeight) * 100;

              const styleClasses = getBoxColor(block);

              return (
                <div
                  key={block.id}
                  onClick={() => onSelectBlock && onSelectBlock(block)}
                  onMouseEnter={() => setActiveTooltip(block)}
                  onMouseLeave={() => setActiveTooltip(null)}
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${Math.max(width, 4)}%`,
                    height: `${Math.max(height, 3)}%`,
                  }}
                  className={`absolute border-2 rounded cursor-pointer transition-all ${styleClasses.border} ${styleClasses.bg}`}
                >
                  {/* Confidence Pill on hover / focus */}
                  <div
                    className={`absolute -top-4 left-0 px-1 py-0.2 rounded text-[9px] font-bold tracking-tight shadow-xs ${styleClasses.badge}`}
                  >
                    {(block.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              );
            })}

          {/* Active Hover Tooltip */}
          {activeTooltip && (
            <div
              className="absolute z-30 pointer-events-none bg-slate-900/95 text-white p-2.5 rounded-lg shadow-xl border border-slate-700 text-xs max-w-xs transition-opacity duration-150"
              style={{
                left: `${Math.min((activeTooltip.bounding_box.x_min / canvasWidth) * 100 + 4, 60)}%`,
                top: `${Math.min((activeTooltip.bounding_box.y_max / canvasHeight) * 100 + 2, 85)}%`,
              }}
            >
              <div className="flex items-center justify-between gap-2 pb-1 mb-1 border-b border-slate-800">
                <span className="font-bold text-blue-400 capitalize">
                  {activeTooltip.fieldKey || 'Text Block'}
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    activeTooltip.confidence >= 0.8
                      ? 'bg-emerald-950 text-emerald-400'
                      : 'bg-amber-950 text-amber-400'
                  }`}
                >
                  {(activeTooltip.confidence * 100).toFixed(1)}% Confidence
                </span>
              </div>
              <p className="font-mono text-slate-200 text-[11px] leading-relaxed">
                "{activeTooltip.text}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Legend Footer */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 border border-emerald-600 inline-block" />
            <span>High Confidence (≥80%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 border border-amber-600 inline-block" />
            <span>Low Confidence (Review)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 border border-blue-700 inline-block" />
            <span>Selected / Overridden</span>
          </div>
        </div>
        <span>Click box to edit field</span>
      </div>
    </div>
  );
}
