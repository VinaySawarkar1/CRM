import { PrintConfig } from '../components/print-config-modal';

export type DocumentType = 'quotation' | 'proforma' | 'invoice' | 'delivery-challan' | 'job-order' | 'purchase-order';

const STORAGE_KEY = 'print_configurations';

export interface PrintConfigurations {
  [key: string]: PrintConfig;
}

class PrintConfigService {
  private getStorageKey(documentType: DocumentType): string {
    return `${STORAGE_KEY}_${documentType}`;
  }

  private getDefaultConfig(): PrintConfig {
    return {
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
  }

  getConfig(documentType: DocumentType): PrintConfig {
    try {
      const stored = localStorage.getItem(this.getStorageKey(documentType));
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading print configuration:', error);
    }
    return this.getDefaultConfig();
  }

  saveConfig(documentType: DocumentType, config: PrintConfig): void {
    try {
      localStorage.setItem(this.getStorageKey(documentType), JSON.stringify(config));
    } catch (error) {
      console.error('Error saving print configuration:', error);
    }
  }

  resetConfig(documentType: DocumentType): void {
    try {
      localStorage.removeItem(this.getStorageKey(documentType));
    } catch (error) {
      console.error('Error resetting print configuration:', error);
    }
  }

  getAllConfigs(): PrintConfigurations {
    const configs: PrintConfigurations = {};
    const documentTypes: DocumentType[] = [
      'quotation',
      'proforma', 
      'invoice',
      'delivery-challan',
      'job-order',
      'purchase-order'
    ];

    documentTypes.forEach(type => {
      configs[type] = this.getConfig(type);
    });

    return configs;
  }

  // Helper method to check if a specific element should be included
  shouldInclude(documentType: DocumentType, element: keyof PrintConfig): boolean {
    const config = this.getConfig(documentType);
    return config[element] || false;
  }

  // Get document-specific configurations
  getQuotationConfig(): PrintConfig {
    return this.getConfig('quotation');
  }

  getProformaConfig(): PrintConfig {
    return this.getConfig('proforma');
  }

  getInvoiceConfig(): PrintConfig {
    return this.getConfig('invoice');
  }

  getDeliveryChallanConfig(): PrintConfig {
    return this.getConfig('delivery-challan');
  }

  getJobOrderConfig(): PrintConfig {
    return this.getConfig('job-order');
  }

  getPurchaseOrderConfig(): PrintConfig {
    return this.getConfig('purchase-order');
  }
}

export const printConfigService = new PrintConfigService(); 