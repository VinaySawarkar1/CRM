import React, { useState } from 'react';
import { X, Settings, Check, Info } from 'lucide-react';

export interface PrintConfig {
  // Basic Elements
  header: boolean;
  orgDupTrip: boolean;
  gstSummary: boolean;
  branch: boolean;
  footer: boolean;
  partyInformation: boolean;
  gstInExport: boolean;
  bankDetails: boolean;
  digitalSignature: boolean;
  gstin: boolean;
  hsnInExport: boolean;
  disclaimer: boolean;
  
  // Party Information
  mobile: boolean;
  partyGstin: boolean;
  email: boolean;
  companyBeforePOC: boolean;
  contactPersonName: boolean;
  totalBeforeRoundOff: boolean;
  
  // Item List
  itemCode: boolean;
  discountAmt: boolean;
  gstAmounts: boolean;
  nonStockItemCode: boolean;
  notes: boolean;
  taxableAmount: boolean;
  leadTime: boolean;
  discountRate: boolean;
  hsnSac: boolean;
  qtyInServices: boolean;
}

interface PrintConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: PrintConfig) => void;
  documentType: 'quotation' | 'proforma' | 'invoice' | 'delivery-challan' | 'job-order' | 'purchase-order';
  currentConfig?: PrintConfig;
}

const defaultConfig: PrintConfig = {
  // Basic Elements
  header: true,
  orgDupTrip: false,
  gstSummary: false,
  branch: false,
  footer: true,
  partyInformation: true,
  gstInExport: false,
  bankDetails: true,
  digitalSignature: false,
  gstin: true,
  hsnInExport: false,
  disclaimer: true,
  
  // Party Information
  mobile: true,
  partyGstin: true,
  email: true,
  companyBeforePOC: true,
  contactPersonName: true,
  totalBeforeRoundOff: true,
  
  // Item List
  itemCode: false,
  discountAmt: true,
  gstAmounts: true,
  nonStockItemCode: true,
  notes: true,
  taxableAmount: true,
  leadTime: false,
  discountRate: false,
  hsnSac: false,
  qtyInServices: true,
};

const categories = [
  {
    id: 'basic',
    title: 'Basic Elements',
    description: 'Party Information, GSTIN, Bank Details and more.',
    icon: '⚙️',
    items: [
      { key: 'header', label: 'Header', default: true },
      { key: 'orgDupTrip', label: 'Org. / Dup. / Trip.', default: false },
      { key: 'gstSummary', label: 'GST Summary', default: false },
      { key: 'branch', label: 'Branch', default: false, hasInfo: true },
      { key: 'footer', label: 'Footer', default: true },
      { key: 'partyInformation', label: 'Party Information', default: true },
      { key: 'gstInExport', label: 'GST in export also', default: false },
      { key: 'bankDetails', label: 'Bank Details', default: true },
      { key: 'digitalSignature', label: 'Digital Signature', default: false },
      { key: 'gstin', label: 'GSTIN', default: true },
      { key: 'hsnInExport', label: 'HSN in export also', default: false },
      { key: 'disclaimer', label: 'Disclaimer', default: true },
    ]
  },
  {
    id: 'party',
    title: 'Party Information',
    description: 'Mobile, Email, POC Name, GSTIN and more.',
    icon: '👤',
    items: [
      { key: 'mobile', label: 'Mobile', default: true },
      { key: 'partyGstin', label: 'GSTIN', default: true },
      { key: 'email', label: 'Email', default: true },
      { key: 'companyBeforePOC', label: 'Company before POC', default: true },
      { key: 'contactPersonName', label: 'Contact Person Name', default: true },
      { key: 'totalBeforeRoundOff', label: 'Total before Round off', default: true },
    ]
  },
  {
    id: 'items',
    title: 'Item List',
    description: 'Item Code, Notes, HSN/SAC, Discount Rate, Discount Amount and more.',
    icon: '📋',
    items: [
      { key: 'itemCode', label: 'Item Code', default: false },
      { key: 'discountAmt', label: 'Discount Amt', default: true },
      { key: 'gstAmounts', label: 'GST Amounts / Tax', default: true },
      { key: 'nonStockItemCode', label: 'Non-Stock Item Code', default: true },
      { key: 'notes', label: 'Notes', default: true },
      { key: 'taxableAmount', label: 'Taxable Amount', default: true },
      { key: 'leadTime', label: 'Lead Time', default: false },
      { key: 'discountRate', label: 'Discount Rate', default: false },
      { key: 'hsnSac', label: 'HSN / SAC', default: false },
      { key: 'qtyInServices', label: 'Qty in Services', default: true },
    ]
  }
];

export function PrintConfigModal({ isOpen, onClose, onSave, documentType, currentConfig }: PrintConfigModalProps) {
  const [config, setConfig] = useState<PrintConfig>(currentConfig || defaultConfig);
  const [activeCategory, setActiveCategory] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);

  const handleToggle = (key: keyof PrintConfig) => {
    setConfig(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const handleReset = () => {
    setConfig(defaultConfig);
  };

  const handleSelectAll = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      const newConfig = { ...config };
      category.items.forEach(item => {
        newConfig[item.key as keyof PrintConfig] = true;
      });
      setConfig(newConfig);
    }
  };

  const handleDeselectAll = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      const newConfig = { ...config };
      category.items.forEach(item => {
        newConfig[item.key as keyof PrintConfig] = false;
      });
      setConfig(newConfig);
    }
  };

  const handleExportConfig = () => {
    const configData = {
      documentType,
      config,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentType}-print-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          if (importedData.config && importedData.documentType === documentType) {
            setConfig(importedData.config);
          }
        } catch (error) {
          console.error('Error importing configuration:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const getDocumentTypeTitle = () => {
    switch (documentType) {
      case 'quotation': return 'Quotation';
      case 'proforma': return 'Proforma Invoice';
      case 'invoice': return 'Invoice';
      case 'delivery-challan': return 'Delivery Challan';
      case 'job-order': return 'Job Order';
      case 'purchase-order': return 'Purchase Order';
      default: return 'Document';
    }
  };

  if (!isOpen) return null;

  const activeCategoryData = categories.find(cat => cat.id === activeCategory);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-4/5 h-4/5 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Print Configuration - {getDocumentTypeTitle()}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Tick the items you want to include in print.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <Settings className="w-4 h-4" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleExportConfig}
                className="px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
              >
                Export
              </button>
              <label className="px-3 py-2 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 cursor-pointer">
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportConfig}
                  className="hidden"
                />
              </label>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              <Settings className="w-4 h-4" />
              Sales Configuration
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-1/3 bg-gray-50 border-r">
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeCategory === category.id
                        ? 'bg-blue-50 border-blue-200 border'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{category.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{category.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{category.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeCategoryData && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {activeCategoryData.title}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSelectAll(activeCategoryData.id)}
                      className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => handleDeselectAll(activeCategoryData.id)}
                      className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {activeCategoryData.items.map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={config[item.key as keyof PrintConfig]}
                          onChange={() => handleToggle(item.key as keyof PrintConfig)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {item.label}
                        </span>
                        {item.hasInfo && (
                          <Info className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      {config[item.key as keyof PrintConfig] && (
                        <Check className="w-4 h-4 text-green-600" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="w-1/3 bg-gray-50 border-l p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Summary</h3>
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <div className="font-medium mb-2">Document: {getDocumentTypeTitle()}</div>
                  <div className="text-xs text-gray-500 mb-3">
                    Last modified: {new Date().toLocaleString()}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">{category.title}</span>
                        <span className="text-xs text-gray-500">
                          {category.items.filter(item => config[item.key as keyof PrintConfig]).length}/{category.items.length}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {category.items.map((item) => (
                          <div key={item.key} className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${config[item.key as keyof PrintConfig] ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <span className={`text-xs ${config[item.key as keyof PrintConfig] ? 'text-gray-900' : 'text-gray-400'}`}>
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Reset to Default
            </button>
            <span className="text-xs text-gray-500">
              {Object.values(config).filter(Boolean).length} of {Object.keys(config).length} options selected
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              <Check className="w-4 h-4" />
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 