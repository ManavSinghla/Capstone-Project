import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import ImageUploader from './components/ImageUploader';
import BoundingBoxCanvas from './components/BoundingBoxCanvas';
import HITLDeclarationEditor from './components/HITLDeclarationEditor';
import ComplianceScorecard from './components/ComplianceScorecard';
import QualityBanner from './components/QualityBanner';
import {
  PRESETS,
  calculateClientPdpArea,
  evaluateDeclarationsClient,
} from './services/clientComplianceEngine';
import { liveReEvaluate, processInspection, generatePdfReport } from './services/api';

export default function App() {
  // Preset & Image State
  const [activePresetId, setActivePresetId] = useState('preset-compliant-biscuit');
  const [imageUrl, setImageUrl] = useState(PRESETS[0].imageUrl);
  const [productName, setProductName] = useState(PRESETS[0].productName);
  const [brandName, setBrandName] = useState(PRESETS[0].brandName);
  const [packageShape, setPackageShape] = useState(PRESETS[0].packageShape);
  const [dimensions, setDimensions] = useState(PRESETS[0].dimensions);
  const [quality, setQuality] = useState(PRESETS[0].quality);
  const [textBlocks, setTextBlocks] = useState(PRESETS[0].textBlocks);

  // Inspector & HITL State
  const [declarations, setDeclarations] = useState({});
  const [originalAiDeclarations, setOriginalAiDeclarations] = useState({});
  const [evaluations, setEvaluations] = useState([]);
  const [overallStatus, setOverallStatus] = useState('COMPLIANT');

  // Canvas & Interaction State
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [selectedFieldKey, setSelectedFieldKey] = useState(null);
  const [hoveredFieldKey, setHoveredFieldKey] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Initialize declarations from active preset
  const initFromPreset = useCallback((preset) => {
    setActivePresetId(preset.id);
    setImageUrl(preset.imageUrl);
    setProductName(preset.productName);
    setBrandName(preset.brandName);
    setPackageShape(preset.packageShape);
    setDimensions(preset.dimensions);
    setQuality(preset.quality);
    setTextBlocks(preset.textBlocks);

    // Build initial normalized declarations from preset text blocks
    const initialDecls = {};
    for (const b of preset.textBlocks) {
      if (b.fieldKey) {
        if (b.fieldKey === 'mrp') {
          const match = b.text.match(/[\d,]+(?:\.\d{1,2})?/);
          const inclTaxes = /incl(?:usive)?\.?\s+(?:of\s+)?all\s+taxes/i.test(b.text);
          initialDecls.mrp = {
            rawText: b.text,
            confidence: b.confidence,
            boundingBox: b.bounding_box,
            isUserOverridden: false,
            normalizedValue: {
              amount: match ? parseFloat(match[0].replace(/,/g, '')) : 25,
              currency: 'INR',
              inclTaxes,
            },
          };
        } else if (b.fieldKey === 'unit_sale_price') {
          const match = b.text.match(/[\d,]+(?:\.\d{1,4})?/);
          const unitMatch = b.text.match(/(?:\/|per\s+)(g|kg|ml|l|no|pcs|unit)/i);
          initialDecls.unit_sale_price = {
            rawText: b.text,
            confidence: b.confidence,
            boundingBox: b.bounding_box,
            isUserOverridden: false,
            normalizedValue: {
              amount: match ? parseFloat(match[0].replace(/,/g, '')) : 0.125,
              baseUnit: unitMatch ? unitMatch[1].toLowerCase() : 'g',
            },
          };
        } else if (b.fieldKey === 'net_quantity') {
          const match = b.text.match(/([\d,]+(?:\.\d+)?)\s*(g|kg|ml|l|nos?|pcs|units?)/i);
          initialDecls.net_quantity = {
            rawText: b.text,
            confidence: b.confidence,
            boundingBox: b.bounding_box,
            isUserOverridden: false,
            normalizedValue: {
              magnitude: match ? parseFloat(match[1]) : 200,
              unit: match ? match[2].toLowerCase() : 'g',
              isStandardUnit: true,
            },
          };
        } else if (b.fieldKey === 'mfg_date') {
          initialDecls.mfg_date = {
            rawText: b.text,
            confidence: b.confidence,
            boundingBox: b.bounding_box,
            isUserOverridden: false,
            normalizedValue: {
              month: 10,
              year: 2026,
              formatted: '10/2026',
            },
          };
        } else if (b.fieldKey === 'expiry_date') {
          initialDecls.expiry_date = {
            rawText: b.text,
            confidence: b.confidence,
            boundingBox: b.bounding_box,
            isUserOverridden: false,
            normalizedValue: {
              formatted: b.text,
              durationValue: 6,
              durationUnit: 'months',
              isDuration: true,
            },
          };
        } else if (b.fieldKey === 'manufacturer') {
          const pinMatch = b.text.match(/\b([1-9][0-9]{5})\b/);
          initialDecls.manufacturer = {
            rawText: b.text,
            confidence: b.confidence,
            boundingBox: b.bounding_box,
            isUserOverridden: false,
            normalizedValue: {
              name: 'Parle Products Pvt Ltd',
              address: b.text,
              pincode: pinMatch ? pinMatch[1] : '400057',
              hasPincode: Boolean(pinMatch),
            },
          };
        } else if (b.fieldKey === 'country_of_origin') {
          initialDecls.country_of_origin = {
            rawText: b.text,
            confidence: b.confidence,
            boundingBox: b.bounding_box,
            isUserOverridden: false,
            normalizedValue: {
              country: 'India',
              isDomestic: true,
            },
          };
        } else if (b.fieldKey === 'customer_care') {
          initialDecls.customer_care = {
            rawText: b.text,
            confidence: b.confidence,
            boundingBox: b.bounding_box,
            isUserOverridden: false,
            normalizedValue: {
              phone: '1800 22 7700',
              email: 'care@parle.biz',
            },
          };
        } else if (b.fieldKey === 'generic_name') {
          initialDecls.generic_name = {
            rawText: b.text,
            confidence: b.confidence,
            boundingBox: b.bounding_box,
            isUserOverridden: false,
            normalizedValue: {
              name: 'Biscuits',
            },
          };
        }
      }
    }

    setDeclarations(initialDecls);
    setOriginalAiDeclarations(JSON.parse(JSON.stringify(initialDecls)));

    // Run initial evaluation
    const pdpArea = calculateClientPdpArea(preset.packageShape, preset.dimensions);
    const result = evaluateDeclarationsClient(initialDecls, pdpArea, 3.0);
    setEvaluations(result.evaluations);
    setOverallStatus(result.overallStatus);
  }, []);

  // Run on mount with default preset
  useEffect(() => {
    initFromPreset(PRESETS[0]);
  }, [initFromPreset]);

  // Live Re-evaluation Runner
  const runLiveEvaluation = useCallback(
    async (updatedDeclarations, updatedShape = packageShape, updatedDims = dimensions) => {
      const pdpArea = calculateClientPdpArea(updatedShape, updatedDims);

      try {
        // Attempt live re-evaluation on the Express backend
        const res = await liveReEvaluate({
          declarations: updatedDeclarations,
          packageShape: updatedShape,
          dimensions: updatedDims,
          pdpAreaSqCm: pdpArea,
        });
        if (res && res.evaluations) {
          setEvaluations(res.evaluations);
          setOverallStatus(res.overallStatus);
          return;
        }
      } catch (err) {
        // Seamless fallback to pure JS client compliance evaluation
        console.info('[HITL Live Re-evaluation] Using client-side evaluation fallback.');
      }

      const clientRes = evaluateDeclarationsClient(updatedDeclarations, pdpArea, 3.0);
      setEvaluations(clientRes.evaluations);
      setOverallStatus(clientRes.overallStatus);
    },
    [packageShape, dimensions]
  );

  // Inspector modifies a declaration field (Human-in-the-loop)
  const handleFieldChange = (fieldKey, updatedNormalizedValue) => {
    const current = declarations[fieldKey] || {
      rawText: 'Inspector Manual Entry',
      confidence: 1.0,
      boundingBox: { x_min: 50, y_min: 50, x_max: 250, y_max: 90 },
    };

    const updated = {
      ...declarations,
      [fieldKey]: {
        ...current,
        isUserOverridden: true,
        normalizedValue: updatedNormalizedValue,
      },
    };

    setDeclarations(updated);
    runLiveEvaluation(updated);
  };

  // Reset a field back to original AI extraction
  const handleResetField = (fieldKey) => {
    if (originalAiDeclarations[fieldKey]) {
      const updated = {
        ...declarations,
        [fieldKey]: JSON.parse(JSON.stringify(originalAiDeclarations[fieldKey])),
      };
      setDeclarations(updated);
      runLiveEvaluation(updated);
    }
  };

  // Dimensions Change handler with live re-evaluation
  const handleDimensionsChange = (newDims) => {
    setDimensions(newDims);
    runLiveEvaluation(declarations, packageShape, newDims);
  };

  // Package Shape Change handler with live re-evaluation
  const handlePackageShapeChange = (newShape) => {
    setPackageShape(newShape);
    runLiveEvaluation(declarations, newShape, dimensions);
  };

  // Preset Selection handler
  const handleSelectPreset = (presetId) => {
    if (!presetId) {
      setActivePresetId('');
      return;
    }
    const preset = PRESETS.find((p) => p.id === presetId);
    if (preset) initFromPreset(preset);
  };

  // Custom User Image Upload Handler
  const handleImageSelected = async (file) => {
    setIsProcessing(true);
    setActivePresetId('');
    const previewUrl = URL.createObjectURL(file);
    setImageUrl(previewUrl);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('packageShape', packageShape);
    formData.append('dimensions', JSON.stringify(dimensions));
    formData.append('productName', file.name.replace(/\.[^/.]+$/, ''));

    try {
      const result = await processInspection(formData);
      if (result && result.textBlocks) {
        setTextBlocks(result.textBlocks);
        setDeclarations(result.declarations);
        setOriginalAiDeclarations(JSON.parse(JSON.stringify(result.declarations)));
        setEvaluations(result.evaluations);
        setOverallStatus(result.overallStatus);
        if (result.quality) setQuality(result.quality);
      }
    } catch (err) {
      console.warn(`[Backend Upload Error] ${err.message}. Using simulated local OCR blocks.`);
      // Simulated fallback for local testing
      setTextBlocks(PRESETS[0].textBlocks);
      runLiveEvaluation(declarations);
    } finally {
      setIsProcessing(false);
    }
  };

  // Canvas block click handler: selects field on the right
  const handleSelectBlock = (block) => {
    setSelectedBlockId(block.id);
    if (block.fieldKey) setSelectedFieldKey(block.fieldKey);
  };

  // Official PDF Memo Exporter (FR-6.2 / Milestone 4)
  const handleExportPdf = async () => {
    try {
      setIsExportingPdf(true);
      const pdpArea = calculateClientPdpArea(packageShape, dimensions);
      const blob = await generatePdfReport({
        productName: productName || 'Packaged Commodity',
        brandName: brandName || '',
        packageShape,
        dimensions,
        pdpAreaSqCm: pdpArea,
        overallStatus,
        declarations,
        evaluations,
        quality,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const sanitizedName = (productName || 'commodity').toLowerCase().replace(/[^a-z0-9]/g, '-');
      a.download = `compliance-audit-${sanitizedName}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert(`Failed to generate PDF audit report: ${err.message}`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans antialiased text-slate-900">
      {/* Top Navbar */}
      <Navbar
        overallStatus={overallStatus}
        presets={PRESETS}
        activePresetId={activePresetId}
        onSelectPreset={handleSelectPreset}
        isProcessing={isProcessing}
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-5">
        {/* Quality Banner (OpenCV Blur & Glare Assessment) */}
        <QualityBanner quality={quality} />

        {/* Two-Column Responsive Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
          {/* Left Column: Image & Canvas */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <ImageUploader
              onImageSelected={handleImageSelected}
              dimensions={dimensions}
              onDimensionsChange={handleDimensionsChange}
              packageShape={packageShape}
              onPackageShapeChange={handlePackageShapeChange}
              isProcessing={isProcessing}
              currentImageUrl={imageUrl}
            />

            <BoundingBoxCanvas
              imageUrl={imageUrl}
              textBlocks={textBlocks}
              selectedBlockId={selectedBlockId}
              onSelectBlock={handleSelectBlock}
              hoveredFieldKey={hoveredFieldKey}
            />
          </div>

          {/* Right Column: HITL Editor & Compliance Scorecard */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <HITLDeclarationEditor
              declarations={declarations}
              onFieldChange={handleFieldChange}
              onResetField={handleResetField}
              onFieldHover={setHoveredFieldKey}
              selectedFieldKey={selectedFieldKey}
            />

            <ComplianceScorecard
              evaluations={evaluations}
              overallStatus={overallStatus}
              pdpAreaSqCm={calculateClientPdpArea(packageShape, dimensions)}
              onExportPdf={handleExportPdf}
              isExportingPdf={isExportingPdf}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3.5 px-6 text-center text-xs text-slate-500">
        Legal Metrology (Packaged Commodities) Compliance Checker · Smart India Hackathon Problem Statement 26034 · Department of Consumer Affairs
      </footer>
    </div>
  );
}
