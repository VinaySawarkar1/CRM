import * as puppeteer from 'puppeteer';
import {
  quotationTemplate,
  proformaTemplate,
  deliveryChallanTemplate,
  jobOrderTemplate,
  purchaseOrderTemplate,
  PrintConfig
} from './templates';
import { getStorage } from './storage-init';

class PDFGenerator {
  private browser: puppeteer.Browser | null = null;

  // Helper function to safely parse items from JSON
  private parseItems(items: any): any[] {
    if (Array.isArray(items)) {
      return items;
    }
    if (typeof items === 'string') {
      try {
        return JSON.parse(items);
      } catch {
        console.warn('Failed to parse items JSON:', items);
        return [];
      }
    }
    return [];
  }

  // Helper function to format date
  private formatDate(date: any): string {
    if (!date) return 'N/A';
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toLocaleDateString('en-GB');
    return 'N/A';
  }

  // Helper function to format valid until date
  private formatValidUntil(date: any): string {
    if (!date) return 'N/A';
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toLocaleDateString('en-GB');
    return 'N/A';
  }

  // Helper function to convert number to words
  private numberToWords(num: number): string {
    if (num === 0) return 'Zero';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
      if (num % 10 === 0) return tens[Math.floor(num / 10)];
      return tens[Math.floor(num / 10)] + ' ' + ones[num % 10];
    }
    if (num < 1000) {
      if (num % 100 === 0) return ones[Math.floor(num / 100)] + ' Hundred';
      return ones[Math.floor(num / 100)] + ' Hundred and ' + this.numberToWords(num % 100);
    }
    if (num < 100000) {
      if (num % 1000 === 0) return this.numberToWords(Math.floor(num / 1000)) + ' Thousand';
      return this.numberToWords(Math.floor(num / 1000)) + ' Thousand ' + this.numberToWords(num % 1000);
    }
    if (num < 10000000) {
      if (num % 100000 === 0) return this.numberToWords(Math.floor(num / 100000)) + ' Lakh';
      return this.numberToWords(Math.floor(num / 100000)) + ' Lakh ' + this.numberToWords(num % 100000);
    }
    if (num % 10000000 === 0) return this.numberToWords(Math.floor(num / 10000000)) + ' Crore';
    return this.numberToWords(Math.floor(num / 10000000)) + ' Crore ' + this.numberToWords(num % 10000000);
  }

  // Get Puppeteer launch options optimized for Render
  private getPuppeteerOptions(): puppeteer.LaunchOptions {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // Render-specific configuration
      return {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        timeout: 30000
      };
    } else {
      // Development configuration
      return {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 30000
      };
    }
  }

  // Simple, reliable PDF generation for quotations
    async generateQuotationPDF(quotation: any, printConfig?: PrintConfig): Promise<Buffer> {
    let tempBrowser: puppeteer.Browser | null = null;
    let page: puppeteer.Page | null = null;
    
    try {
      console.log('Starting simple quotation PDF generation...');

      // Get company settings
      const storage = getStorage();
      const companySettings = await storage.getCompanySettings();
      
      // Get customer details if customerId exists
      let customerDetails = null;
      if (quotation.customerId) {
        customerDetails = await storage.getCustomer(quotation.customerId);
      }

      // Generate HTML content using the template
      const html = quotationTemplate({
        company: {
          name: companySettings?.name || "Business AI",
          address: companySettings?.address || "",
          phone: companySettings?.phone || "",
          email: companySettings?.email || "",
          gstin: companySettings?.gstNumber || "",
          logo: companySettings?.logo || "",
          bankDetails: companySettings?.bankDetails || {
            bankName: "",
            accountNo: "",
            ifsc: "",
            branch: ""
          }
        },
        quoteNumber: quotation.quotationNumber || quotation.id,
        date: this.formatDate(quotation.quotationDate),
        validUntil: this.formatDate(quotation.validUntil),
        terms: quotation.terms,
        customer: {
          company: quotation.customerCompany || customerDetails?.company || quotation.customerName || quotation.customer?.name || "",
          name: quotation.contactPerson || quotation.customerName || quotation.customer?.name || "",
          contactPersonTitle: quotation.contactPersonTitle,
          contactPerson: quotation.contactPerson,
          address: quotation.addressLine1 || quotation.customerAddress || quotation.customer?.address || "",
          city: quotation.city || quotation.customerCity || quotation.customer?.city || "",
          gstin: quotation.customerGstin || customerDetails?.gstNumber || quotation.customer?.gstin || "",
          phone: quotation.customerPhone || customerDetails?.phone || quotation.customer?.phone || "",
          email: quotation.customerEmail || customerDetails?.email || quotation.customer?.email || ""
        },
        items: this.parseItems(quotation.items),
        subtotal: typeof quotation.subtotal === 'string' ? parseFloat(quotation.subtotal) : (quotation.subtotal || 0),
        cgst: typeof quotation.cgstTotal === 'string' ? parseFloat(quotation.cgstTotal) : (quotation.cgstTotal || 0),
        sgst: typeof quotation.sgstTotal === 'string' ? parseFloat(quotation.sgstTotal) : (quotation.sgstTotal || 0),
        igst: typeof quotation.igstTotal === 'string' ? parseFloat(quotation.igstTotal) : (quotation.igstTotal || 0),
        discount: typeof quotation.discount === 'string' ? parseFloat(quotation.discount) : (quotation.discount || 0),
        discountType: quotation.discountType || "percentage",
        totalAmount: typeof quotation.totalAmount === 'string' ? parseFloat(quotation.totalAmount) : (quotation.totalAmount || 0),
        amountInWords: quotation.amountInWords || this.numberToWords(typeof quotation.totalAmount === 'string' ? parseFloat(quotation.totalAmount) : (quotation.totalAmount || 0)),
        currency: "INR",
        printConfig: printConfig
      });
      
      // Create a simple, fresh browser instance
      tempBrowser = await puppeteer.launch(this.getPuppeteerOptions());
      
      // Create page
      page = await tempBrowser.newPage();
      
      // Set content directly
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      
      // Wait a bit for content to settle
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '5mm',
          right: '5mm',
          bottom: '5mm',
          left: '5mm'
        }
      });

      console.log('Quotation PDF generated successfully');
      return Buffer.from(pdfBuffer);
      
    } catch (error) {
      console.error('Quotation PDF generation failed:', error);
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Clean up
      if (page) {
        try {
          await page.close();
        } catch (error) {
          console.warn('Error closing page:', error);
        }
      }
      
      if (tempBrowser) {
        try {
          await tempBrowser.close();
        } catch (error) {
          console.warn('Error closing browser:', error);
        }
      }
    }
  }

  // Simple Proforma Invoice generation using same stable approach
  async generateProformaInvoicePDF(quotation: any, printConfig?: PrintConfig): Promise<Buffer> {
    let tempBrowser: puppeteer.Browser | null = null;
    let page: puppeteer.Page | null = null;
    try {
      // Company settings
      const storage = getStorage();
      const companySettings = await storage.getCompanySettings();
      
      // Customer details
      let customerDetails = null;
      if (quotation.customerId) {
        customerDetails = await storage.getCustomer(quotation.customerId);
      }

      const html = proformaTemplate({
        company: {
          name: companySettings?.name || "Business AI",
          address: companySettings?.address || "",
          phone: companySettings?.phone || "",
          email: companySettings?.email || "",
          gstin: companySettings?.gstNumber || "",
          logo: companySettings?.logo || "",
          bankDetails: companySettings?.bankDetails || {
            bankName: "",
            accountNo: "",
            ifsc: "",
            branch: ""
          }
        },
        invoiceNumber: quotation.quotationNumber || quotation.id,
        invoiceDate: this.formatDate(quotation.quotationDate),
        validUntil: this.formatDate(quotation.validUntil),
        terms: quotation.terms,
        notes: quotation.notes,
        customer: {
          company: quotation.customerCompany || customerDetails?.company || quotation.customerName || quotation.customer?.name || "",
          name: quotation.contactPerson || quotation.customerName || quotation.customer?.name || "",
          address: quotation.addressLine1 || quotation.customerAddress || quotation.customer?.address || "",
          city: quotation.city || quotation.customerCity || quotation.customer?.city || "",
          gstin: quotation.customerGstin || customerDetails?.gstNumber || quotation.customer?.gstin || "",
          phone: quotation.customerPhone || customerDetails?.phone || quotation.customer?.phone || "",
          email: quotation.customerEmail || customerDetails?.email || quotation.customer?.email || ""
        },
        shipping: {
          company: quotation.customerCompany || customerDetails?.company || "",
          name: quotation.contactPerson || customerDetails?.name || "",
          address: quotation.shippingAddressLine1 || quotation.addressLine1 || customerDetails?.address || "",
          city: quotation.shippingCity || quotation.city || customerDetails?.city || "",
          state: quotation.shippingState || quotation.state || customerDetails?.state || "",
          country: quotation.shippingCountry || quotation.country || customerDetails?.country || "India",
          pincode: quotation.shippingPincode || quotation.pincode || customerDetails?.pincode || "",
          phone: quotation.customerPhone || customerDetails?.phone || "",
          email: quotation.customerEmail || customerDetails?.email || ""
        },
        items: this.parseItems(quotation.items),
        subtotal: typeof quotation.subtotal === 'string' ? parseFloat(quotation.subtotal) : (quotation.subtotal || 0),
        cgst: typeof quotation.cgstTotal === 'string' ? parseFloat(quotation.cgstTotal) : (quotation.cgstTotal || 0),
        sgst: typeof quotation.sgstTotal === 'string' ? parseFloat(quotation.sgstTotal) : (quotation.sgstTotal || 0),
        igst: typeof quotation.igstTotal === 'string' ? parseFloat(quotation.igstTotal) : (quotation.igstTotal || 0),
        discount: typeof quotation.discount === 'string' ? parseFloat(quotation.discount) : (quotation.discount || 0),
        discountType: quotation.discountType || 'percentage',
        totalAmount: typeof quotation.totalAmount === 'string' ? parseFloat(quotation.totalAmount) : (quotation.totalAmount || 0)
      });

      tempBrowser = await puppeteer.launch(this.getPuppeteerOptions());
      page = await tempBrowser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' }
      });
      return Buffer.from(pdfBuffer);
    } catch (error) {
      throw new Error(`Proforma invoice generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (page) { try { await page.close(); } catch {} }
      if (tempBrowser) { try { await tempBrowser.close(); } catch {} }
    }
  }

  async generateInvoicePDF(invoice: any): Promise<Buffer> {
    // Minimal placeholder using quotation template-like layout is not defined here; keep disabled
    throw new Error('Invoice generation temporarily disabled');
  }

  async generateDeliveryChallanPDF(data: any): Promise<Buffer> {
    let tempBrowser: puppeteer.Browser | null = null;
    let page: puppeteer.Page | null = null;
    try {
      const storage = getStorage();
      const companySettings = await storage.getCompanySettings();
      const html = deliveryChallanTemplate({
        company: {
          name: companySettings?.name || "Business AI",
          address: companySettings?.address || "",
          phone: companySettings?.phone || "",
          email: companySettings?.email || "",
          gstin: companySettings?.gstNumber || "",
          logo: companySettings?.logo || "",
          bankDetails: companySettings?.bankDetails || {}
        },
        challanNumber: data.orderNumber || data.id,
        challanDate: this.formatDate(data.createdAt),
        customer: {
          company: data.customerCompany || data.customerName || "",
          name: data.customerName || "",
          address: data.address || "",
          city: data.city || "",
          gstin: data.gstNumber || "",
          phone: data.phone || "",
          email: data.email || ""
        },
        items: this.parseItems(data.items)
      });
      tempBrowser = await puppeteer.launch(this.getPuppeteerOptions());
      page = await tempBrowser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 500));
      const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' } });
      return Buffer.from(pdf);
    } finally {
      if (page) { try { await page.close(); } catch {} }
      if (tempBrowser) { try { await tempBrowser.close(); } catch {} }
    }
  }

  async generateInternalOrderPDF(order: any): Promise<Buffer> {
    let tempBrowser: puppeteer.Browser | null = null;
    let page: puppeteer.Page | null = null;
    try {
      const storage = getStorage();
      const companySettings = await storage.getCompanySettings();
      const html = jobOrderTemplate({
        company: {
          name: companySettings?.name || "Business AI",
          address: companySettings?.address || "",
          phone: companySettings?.phone || "",
          email: companySettings?.email || "",
          gstin: companySettings?.gstNumber || "",
          logo: companySettings?.logo || "",
          bankDetails: companySettings?.bankDetails || {}
        },
        orderNumber: order.orderNumber || order.id,
        orderDate: this.formatDate(order.createdAt),
        customer: {
          company: order.customerCompany || order.customerName || "",
          name: order.customerName || "",
          address: order.address || ""
        },
        items: this.parseItems(order.items)
      });
      tempBrowser = await puppeteer.launch(this.getPuppeteerOptions());
      page = await tempBrowser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 500));
      const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' } });
      return Buffer.from(pdf);
    } finally {
      if (page) { try { await page.close(); } catch {} }
      if (tempBrowser) { try { await tempBrowser.close(); } catch {} }
    }
  }

  async generatePurchaseOrderPDF(order: any, supplier?: any): Promise<Buffer> {
    let tempBrowser: puppeteer.Browser | null = null;
    let page: puppeteer.Page | null = null;
    
    try {
      console.log('Starting purchase order PDF generation...');

      // Get company settings
      const storage = getStorage();
      const companySettings = await storage.getCompanySettings();
      
      // Parse items from the order
      const items = this.parseItems(order.items);
      
      // Calculate totals
      const subtotal = parseFloat(order.subtotal || "0");
      const taxAmount = parseFloat(order.taxAmount || "0");
      const totalAmount = parseFloat(order.totalAmount || "0");
      
      // Generate HTML content using the template
      const html = purchaseOrderTemplate({
        company: {
          name: companySettings?.name || "Business AI",
          address: companySettings?.address || "",
          phone: companySettings?.phone || "",
          email: companySettings?.email || "",
          gstin: companySettings?.gstNumber || "",
          logo: companySettings?.logo || "",
          bankDetails: companySettings?.bankDetails || {}
        },
        poNumber: order.poNumber || `PO-${order.id}`,
        poDate: this.formatDate(order.orderDate),
        expectedDelivery: order.expectedDelivery ? this.formatDate(order.expectedDelivery) : undefined,
        vendor: {
          name: order.supplierName || supplier?.name || "Supplier",
          company: order.supplierCompany || supplier?.company || "",
          title: order.supplierTitle || "",
          address: order.supplierAddress || supplier?.address || "",
          city: order.supplierCity || supplier?.city || "",
          state: order.supplierState || supplier?.state || "",
          country: order.supplierCountry || supplier?.country || "",
          pincode: order.supplierPincode || supplier?.pincode || "",
          gstin: order.supplierGstin || supplier?.gstNumber || "",
          pan: order.supplierPan || supplier?.panNumber || "",
          phone: order.supplierPhone || supplier?.phone || "",
          email: order.supplierEmail || supplier?.email || ""
        },
        items: items.map(item => ({
          description: item.description || item.name || "",
          quantity: item.quantity || 1,
          unit: item.unit || "pcs",
          rate: parseFloat(item.unitPrice || item.rate || "0"),
          amount: (item.quantity || 1) * parseFloat(item.unitPrice || item.rate || "0")
        })),
        subtotal: subtotal,
        taxAmount: taxAmount,
        totalAmount: totalAmount,
        extraCharges: order.extraCharges || [],
        discounts: order.discounts || [],
        deliveryTerms: order.deliveryTerms || "As per vendor",
        paymentTerms: order.paymentTerms || "As per contract",
        terms: order.terms || [],
        notes: order.notes || "",
        currency: "INR"
      });

      // Launch browser and generate PDF
      tempBrowser = await puppeteer.launch(this.getPuppeteerOptions());
      page = await tempBrowser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 500));
      
      const pdf = await page.pdf({ 
        format: 'A4', 
        printBackground: true, 
        margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' } 
      });
      
      return Buffer.from(pdf);
    } catch (error) {
      console.error('Error generating purchase order PDF:', error);
      throw new Error(`Failed to generate purchase order PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (page) { try { await page.close(); } catch {} }
      if (tempBrowser) { try { await tempBrowser.close(); } catch {} }
    }
  }

  // Method to close the PDF generator (called on server shutdown)
  async close(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        this.browser = null;
        console.log('PDF Generator browser closed');
      } catch (error) {
        console.warn('Error closing PDF Generator browser:', error);
      }
    }
  }
}

export default PDFGenerator;

// Create and export a singleton instance
export const pdfGenerator = new PDFGenerator(); 