import React from 'react';
import {
  Edit3,
  RotateCcw,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Scale,
  Calendar,
  Building,
  Globe,
  PhoneCall,
  Tag,
} from './Icons';

export default function HITLDeclarationEditor({
  declarations = {},
  onFieldChange,
  onResetField,
  onFieldHover,
  selectedFieldKey,
}) {
  const fields = [
    {
      key: 'mrp',
      label: 'Maximum Retail Price (MRP)',
      icon: DollarSign,
      ruleCode: 'Rule 6(1)(e)',
      renderEditor: (decl) => {
        const val = decl.normalizedValue || {};
        return (
          <div className="space-y-2 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">₹</span>
              <input
                type="number"
                step="0.5"
                min="0"
                value={val.amount ?? ''}
                onChange={(e) =>
                  onFieldChange('mrp', {
                    ...val,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-32 text-xs px-2 py-1.5 border border-slate-200 rounded-md font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="Amount"
              />
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer ml-2">
                <input
                  type="checkbox"
                  checked={Boolean(val.inclTaxes)}
                  onChange={(e) =>
                    onFieldChange('mrp', {
                      ...val,
                      inclTaxes: e.target.checked,
                    })
                  }
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-[11px]">
                  Includes all taxes (Mandatory)
                </span>
              </label>
            </div>
          </div>
        );
      },
    },
    {
      key: 'unit_sale_price',
      label: 'Unit Sale Price (USP)',
      icon: Scale,
      ruleCode: 'Rule 6(11)',
      renderEditor: (decl) => {
        const val = decl.normalizedValue || {};
        return (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-slate-500 font-semibold">₹</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={val.amount ?? ''}
              onChange={(e) =>
                onFieldChange('unit_sale_price', {
                  ...val,
                  amount: parseFloat(e.target.value) || 0,
                })
              }
              className="w-24 text-xs px-2 py-1.5 border border-slate-200 rounded-md font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="0.00"
            />
            <span className="text-xs text-slate-500">per</span>
            <select
              value={val.baseUnit || 'g'}
              onChange={(e) =>
                onFieldChange('unit_sale_price', {
                  ...val,
                  baseUnit: e.target.value,
                })
              }
              className="text-xs px-2 py-1.5 border border-slate-200 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="g">1 g (gram)</option>
              <option value="kg">1 kg (kilogram)</option>
              <option value="ml">1 ml (millilitre)</option>
              <option value="l">1 L (litre)</option>
              <option value="number">1 number (unit)</option>
            </select>
          </div>
        );
      },
    },
    {
      key: 'net_quantity',
      label: 'Net Quantity',
      icon: Scale,
      ruleCode: 'Rule 6(1)(c)',
      renderEditor: (decl) => {
        const val = decl.normalizedValue || {};
        return (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="number"
              step="0.1"
              min="0"
              value={val.magnitude ?? ''}
              onChange={(e) =>
                onFieldChange('net_quantity', {
                  ...val,
                  magnitude: parseFloat(e.target.value) || 0,
                })
              }
              className="w-24 text-xs px-2 py-1.5 border border-slate-200 rounded-md font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="Quantity"
            />
            <select
              value={val.unit || 'g'}
              onChange={(e) =>
                onFieldChange('net_quantity', {
                  ...val,
                  unit: e.target.value,
                  isStandardUnit: true,
                })
              }
              className="text-xs px-2 py-1.5 border border-slate-200 rounded-md bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              <option value="g">g (grams)</option>
              <option value="kg">kg (kilograms)</option>
              <option value="ml">ml (millilitres)</option>
              <option value="l">L (litres)</option>
              <option value="number">number / count</option>
            </select>
          </div>
        );
      },
    },
    {
      key: 'mfg_date',
      label: 'Month & Year of Manufacture / Packing',
      icon: Calendar,
      ruleCode: 'Rule 6(1)(d)',
      renderEditor: (decl) => {
        const val = decl.normalizedValue || {};
        return (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-slate-500">Month:</span>
            <input
              type="number"
              min="1"
              max="12"
              value={val.month ?? ''}
              onChange={(e) => {
                const m = parseInt(e.target.value, 10) || 1;
                onFieldChange('mfg_date', {
                  ...val,
                  month: m,
                  formatted: `${String(m).padStart(2, '0')}/${val.year || 2026}`,
                });
              }}
              className="w-16 text-xs px-2 py-1.5 border border-slate-200 rounded-md font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="MM"
            />
            <span className="text-xs text-slate-500">Year:</span>
            <input
              type="number"
              min="2020"
              max="2035"
              value={val.year ?? ''}
              onChange={(e) => {
                const y = parseInt(e.target.value, 10) || 2026;
                onFieldChange('mfg_date', {
                  ...val,
                  year: y,
                  formatted: `${String(val.month || 1).padStart(2, '0')}/${y}`,
                });
              }}
              className="w-20 text-xs px-2 py-1.5 border border-slate-200 rounded-md font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="YYYY"
            />
          </div>
        );
      },
    },
    {
      key: 'expiry_date',
      label: 'Expiry Date / Best Before',
      icon: Calendar,
      ruleCode: 'Rule 6(1)(da)',
      renderEditor: (decl) => {
        const val = decl.normalizedValue || {};
        return (
          <div className="mt-2">
            <input
              type="text"
              value={val.formatted || ''}
              onChange={(e) =>
                onFieldChange('expiry_date', {
                  ...val,
                  formatted: e.target.value,
                })
              }
              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. Best Before 6 Months from Mfg, or 10/2026"
            />
          </div>
        );
      },
    },
    {
      key: 'manufacturer',
      label: 'Manufacturer / Packer Name & Postal Address',
      icon: Building,
      ruleCode: 'Rule 6(1)(a)',
      renderEditor: (decl) => {
        const val = decl.normalizedValue || {};
        return (
          <div className="space-y-2 mt-2">
            <div>
              <span className="block text-[10px] text-slate-500 mb-0.5">
                Entity / Company Name:
              </span>
              <input
                type="text"
                value={val.name || ''}
                onChange={(e) =>
                  onFieldChange('manufacturer', {
                    ...val,
                    name: e.target.value,
                  })
                }
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. Parle Products Pvt Ltd"
              />
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 mb-0.5">
                Complete Postal Address:
              </span>
              <textarea
                rows="2"
                value={val.address || ''}
                onChange={(e) =>
                  onFieldChange('manufacturer', {
                    ...val,
                    address: e.target.value,
                  })
                }
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="Factory address, street, city..."
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-600 font-medium">
                PIN Code (Mandatory):
              </span>
              <input
                type="text"
                maxLength="6"
                value={val.pincode || ''}
                onChange={(e) => {
                  const p = e.target.value.trim();
                  onFieldChange('manufacturer', {
                    ...val,
                    pincode: p,
                    hasPincode: Boolean(p.length === 6),
                  });
                }}
                className={`w-24 text-xs px-2 py-1 border rounded-md font-mono ${
                  val.pincode && val.pincode.length === 6
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-amber-300 bg-amber-50 text-amber-800'
                }`}
                placeholder="6 digits"
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'country_of_origin',
      label: 'Country of Origin',
      icon: Globe,
      ruleCode: 'Rule 6(1)(aa)',
      renderEditor: (decl) => {
        const val = decl.normalizedValue || {};
        return (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="text"
              value={val.country || ''}
              onChange={(e) =>
                onFieldChange('country_of_origin', {
                  ...val,
                  country: e.target.value,
                  isDomestic: /^india$/i.test(e.target.value.trim()),
                })
              }
              className="w-40 text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:outline-none"
              placeholder="e.g. India, Germany"
            />
            {val.country && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                  val.isDomestic
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}
              >
                {val.isDomestic ? 'Domestic Commodity' : 'Imported Commodity'}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'customer_care',
      label: 'Consumer Care Contact Details',
      icon: PhoneCall,
      ruleCode: 'Rule 6(2)',
      renderEditor: (decl) => {
        const val = decl.normalizedValue || {};
        return (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <span className="block text-[10px] text-slate-500 mb-0.5">
                Helpline / Mobile:
              </span>
              <input
                type="text"
                value={val.phone || ''}
                onChange={(e) =>
                  onFieldChange('customer_care', {
                    ...val,
                    phone: e.target.value,
                  })
                }
                className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-md font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="1800 22 7700"
              />
            </div>
            <div>
              <span className="block text-[10px] text-slate-500 mb-0.5">
                Support Email:
              </span>
              <input
                type="email"
                value={val.email || ''}
                onChange={(e) =>
                  onFieldChange('customer_care', {
                    ...val,
                    email: e.target.value,
                  })
                }
                className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-md font-mono focus:ring-1 focus:ring-blue-500 focus:outline-none"
                placeholder="care@brand.com"
              />
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-blue-600" />
            2. Human-In-The-Loop (HITL) Verification
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Review OCR extractions, correct errors, and observe instant re-evaluation
          </p>
        </div>
        <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
          Live Sync Active
        </span>
      </div>

      {/* Field Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
        {fields.map(({ key, label, icon: Icon, ruleCode, renderEditor }) => {
          const decl = declarations[key] || {
            rawText: '',
            confidence: 0,
            normalizedValue: {},
          };
          const isOverridden = Boolean(decl.isUserOverridden);
          const isSelected = selectedFieldKey === key;
          const isLowConfidence = !isOverridden && decl.confidence > 0 && decl.confidence < 0.8;

          return (
            <div
              key={key}
              onMouseEnter={() => onFieldHover && onFieldHover(key)}
              onMouseLeave={() => onFieldHover && onFieldHover(null)}
              className={`pt-3 first:pt-0 transition-all rounded-lg p-2.5 ${
                isSelected
                  ? 'bg-blue-50/70 ring-1 ring-blue-300'
                  : 'hover:bg-slate-50/70'
              }`}
            >
              {/* Field Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {label}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {ruleCode}
                    </span>
                  </div>
                </div>

                {/* Badges & Actions */}
                <div className="flex items-center gap-1.5">
                  {isOverridden ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300">
                      <Edit3 className="w-2.5 h-2.5" />
                      Inspector Overridden
                    </span>
                  ) : decl.confidence > 0 ? (
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        isLowConfidence
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <Sparkles className="w-2.5 h-2.5" />
                      {(decl.confidence * 100).toFixed(0)}% AI
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">
                      Not Detected
                    </span>
                  )}

                  {isOverridden && (
                    <button
                      type="button"
                      onClick={() => onResetField && onResetField(key)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                      title="Reset to Original AI Detection"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Raw OCR Snippet preview */}
              {decl.rawText && (
                <div className="mt-1.5 px-2 py-1 bg-slate-50 rounded text-[11px] font-mono text-slate-600 border border-slate-150 flex items-center justify-between">
                  <span className="truncate max-w-[340px]">
                    OCR: "{decl.rawText}"
                  </span>
                  {isLowConfidence && (
                    <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Needs Review
                    </span>
                  )}
                </div>
              )}

              {/* Dynamic Form Editor */}
              {renderEditor(decl)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
