import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as htmlPdfNode from 'html-pdf-node';
import {
  quotationTemplate,
  proformaTemplate,
  invoiceTemplate,
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
      // Render-specific configuration with multiple fallback paths
      const possiblePaths = [
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/opt/google/chrome/chrome',
        '/opt/chromium/chromium'
      ];
      
      // Find the first available Chrome/Chromium executable
      let executablePath: string | undefined;
      try {
        for (const path of possiblePaths) {
          if (fs.existsSync(path)) {
            executablePath = path;
            console.log(`Found Chrome/Chromium at: ${path}`);
            break;
          }
        }
      } catch (error) {
        console.warn('Could not check Chrome/Chromium paths:', error);
      }
      
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
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-field-trial-config',
          '--disable-ipc-flooding-protection',
          '--memory-pressure-off',
          '--max_old_space_size=4096'
        ],
        executablePath: executablePath || process.env.PUPPETEER_EXECUTABLE_PATH,
        timeout: 60000,
        protocolTimeout: 60000
      };
    } else {
      // Development configuration - try to find Chrome in Puppeteer cache
      let executablePath: string | undefined;
      
      // Check for PUPPETEER_EXECUTABLE_PATH environment variable first
      if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      } else {
        // Try to find Chrome in common Puppeteer cache locations for Windows
        const homedir = os.homedir();
        const possibleCachePaths = [
          // Default Puppeteer cache location
          path.join(homedir, '.cache', 'puppeteer', 'chrome'),
          path.join(homedir, '.cache', 'puppeteer', 'chromium'),
          // Alternative locations
          process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'puppeteer', 'chrome') : null,
          process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'puppeteer', 'chromium') : null,
        ].filter((p): p is string => p !== null);
        
        // Search for chrome.exe in cache directories
        try {
          for (const cachePath of possibleCachePaths) {
            if (fs.existsSync(cachePath)) {
              // Look for chrome.exe or chromium.exe in subdirectories
              const findExecutable = (dir: string): string | null => {
                try {
                  const entries = fs.readdirSync(dir, { withFileTypes: true });
                  for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                      const found = findExecutable(fullPath);
                      if (found) return found;
                    } else if (entry.name === 'chrome.exe' || entry.name === 'chromium.exe') {
                      return fullPath;
                    }
                  }
                } catch (err) {
                  // Continue searching
                }
                return null;
              };
              
              const found = findExecutable(cachePath);
              if (found && fs.existsSync(found)) {
                executablePath = found;
                console.log(`Found Chrome at: ${executablePath}`);
                break;
              }
            }
          }
        } catch (error) {
          console.warn('Could not search for Chrome in cache:', error);
        }
        
        // If still not found, try using Puppeteer's default browser path
        if (!executablePath) {
          try {
            // Puppeteer might have Chrome installed via @puppeteer/browsers
            // Try to get it from the default cache location
            const puppeteerCache = path.join(os.homedir(), '.cache', 'puppeteer');
            if (fs.existsSync(puppeteerCache)) {
              console.log('Searching for Chrome in Puppeteer cache...');
              // Let Puppeteer try to find it automatically by not specifying executablePath
            }
          } catch (error) {
            console.warn('Could not check Puppeteer default cache:', error);
          }
        }
      }
      
      const options: puppeteer.LaunchOptions = {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 30000
      };
      
      // Only set executablePath if we found it, otherwise let Puppeteer find it automatically
      if (executablePath) {
        options.executablePath = executablePath;
      } else {
        console.log('Chrome executable path not specified, Puppeteer will attempt to find it automatically');
      }
      
      return options;
    }
  }

  // Fallback PDF generation using html-pdf-node (no Chrome required)
  private async generatePDFFallback(html: string): Promise<Buffer> {
    try {
      const options = {
        format: 'A4',
        margin: {
          top: '5mm',
          right: '5mm',
          bottom: '5mm',
          left: '5mm'
        },
        printBackground: true
      };
      
      const pdfBuffer = await htmlPdfNode.generatePdf({ content: html }, options);
      console.log('PDF generated using html-pdf-node fallback');
      return pdfBuffer;
    } catch (error) {
      console.error('Fallback PDF generation failed:', error);
      throw new Error('PDF generation failed: No Chrome/Chromium available and fallback failed');
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
          name: companySettings?.name || "BizSuite",
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
      
      // Try Puppeteer first, fallback to html-pdf-node if it fails
      try {
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

        console.log('Quotation PDF generated successfully with Puppeteer');
      return Buffer.from(pdfBuffer);
      } catch (puppeteerError) {
        console.warn('Puppeteer failed, trying fallback method:', puppeteerError);
        
        // Clean up Puppeteer resources
        if (page) {
          try { await page.close(); } catch {}
        }
        if (tempBrowser) {
          try { await tempBrowser.close(); } catch {}
        }
        
        // Use fallback method
        return await this.generatePDFFallback(html);
      }
      
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
          name: companySettings?.name || "BizSuite",
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
          state: quotation.state || customerDetails?.state || quotation.customer?.state || "",
          country: quotation.country || customerDetails?.country || quotation.customer?.country || "India",
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

      // Try Puppeteer first, fallback to html-pdf-node if it fails
      try {
        tempBrowser = await puppeteer.launch(this.getPuppeteerOptions());
        page = await tempBrowser.newPage();
        await page.setContent(html, { waitUntil: 'domcontentloaded' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' }
        });
        
        console.log('Proforma Invoice PDF generated successfully with Puppeteer');
        return Buffer.from(pdfBuffer);
      } catch (puppeteerError) {
        console.warn('Puppeteer failed for proforma invoice, trying fallback method:', puppeteerError);
        
        // Clean up Puppeteer resources
        if (page) {
          try { await page.close(); } catch {}
        }
        if (tempBrowser) {
          try { await tempBrowser.close(); } catch {}
        }
        
        // Use fallback method
        return await this.generatePDFFallback(html);
      }
    } catch (error) {
      console.error('Proforma Invoice PDF generation failed:', error);
      throw new Error(`Proforma invoice generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      if (page) { try { await page.close(); } catch {} }
      if (tempBrowser) { try { await tempBrowser.close(); } catch {} }
    }
  }

  async generateInvoicePDF(invoice: any, printConfig?: PrintConfig): Promise<Buffer> {
    let tempBrowser: puppeteer.Browser | null = null;
    let page: puppeteer.Page | null = null;
    try {
      // Company settings
      const storage = getStorage();
      const companySettings = await storage.getCompanySettings();
      
      // Customer details
      let customerDetails = null;
      if (invoice.customerId) {
        customerDetails = await storage.getCustomer(invoice.customerId);
      }

      const html = invoiceTemplate({
        company: {
          name: companySettings?.name || "BizSuite",
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
        invoiceNumber: invoice.invoiceNumber || invoice.id,
        invoiceDate: this.formatDate(invoice.invoiceDate),
        dueDate: this.formatDate(invoice.dueDate),
        terms: invoice.terms,
        notes: invoice.notes,
        customer: {
          company: invoice.customerCompany || customerDetails?.company || "",
          name: customerDetails?.name || invoice.customerName || "",
          address: invoice.addressLine1 || customerDetails?.address || "",
          city: invoice.city || customerDetails?.city || "",
          state: invoice.state || customerDetails?.state || "",
          country: invoice.country || customerDetails?.country || "India",
          gstin: invoice.customerGstin || customerDetails?.gstNumber || "",
          phone: customerDetails?.phone || "",
          email: customerDetails?.email || "",
        },
        shipping: {
          company: invoice.shippingCompany || invoice.customerCompany || "",
          name: invoice.shippingContactPerson || "",
          address: invoice.shippingAddressLine1 || invoice.addressLine1 || "",
          city: invoice.shippingCity || invoice.city || "",
          state: invoice.shippingState || invoice.state || "",
          country: invoice.shippingCountry || invoice.country || "India",
          pincode: invoice.shippingPincode || invoice.pincode || "",
          phone: customerDetails?.phone || "",
          email: customerDetails?.email || "",
        },
        items: this.parseItems(invoice.items),
        subtotal: typeof invoice.subtotal === 'string' ? parseFloat(invoice.subtotal) || 0 : (invoice.subtotal || 0),
        cgstTotal: typeof invoice.cgstTotal === 'string' ? parseFloat(invoice.cgstTotal) || 0 : (invoice.cgstTotal || 0),
        sgstTotal: typeof invoice.sgstTotal === 'string' ? parseFloat(invoice.sgstTotal) || 0 : (invoice.sgstTotal || 0),
        igstTotal: typeof invoice.igstTotal === 'string' ? parseFloat(invoice.igstTotal) || 0 : (invoice.igstTotal || 0),
        cgst: typeof invoice.cgstTotal === 'string' ? parseFloat(invoice.cgstTotal) || 0 : (invoice.cgstTotal || 0),
        sgst: typeof invoice.sgstTotal === 'string' ? parseFloat(invoice.sgstTotal) || 0 : (invoice.sgstTotal || 0),
        igst: typeof invoice.igstTotal === 'string' ? parseFloat(invoice.igstTotal) || 0 : (invoice.igstTotal || 0),
        totalAmount: typeof invoice.totalAmount === 'string' ? parseFloat(invoice.totalAmount) || 0 : (invoice.totalAmount || 0),
        paidAmount: typeof invoice.paidAmount === 'string' ? parseFloat(invoice.paidAmount) || 0 : (invoice.paidAmount || 0),
        discount: invoice.discount ? (typeof invoice.discount === 'string' ? parseFloat(invoice.discount) : invoice.discount) : 0,
        discountType: invoice.discountType || 'amount',
        printConfig: printConfig
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

  async generateDeliveryChallanPDF(data: any): Promise<Buffer> {
    let tempBrowser: puppeteer.Browser | null = null;
    let page: puppeteer.Page | null = null;
    try {
      const storage = getStorage();
      const companySettings = await storage.getCompanySettings();
      const html = deliveryChallanTemplate({
        company: {
          name: companySettings?.name || "BizSuite",
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
          name: companySettings?.name || "BizSuite",
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
        state: companySettings?.state || ""
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
        name: item.name || item.description || "",
        description: item.description || "",
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
      notes: (order.notes && typeof order.notes === 'string') ? order.notes : (order.notes ? String(order.notes) : ""),
      currency: "INR",
      printConfig: undefined // Can be passed from request if needed
    });
    
    console.log('Purchase Order PDF - Notes value:', order.notes, 'Type:', typeof order.notes);

    // Try Puppeteer first, fallback to html-pdf-node if it fails
    try {
      tempBrowser = await puppeteer.launch(this.getPuppeteerOptions());
      page = await tempBrowser.newPage();
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 500));
      
      const pdf = await page.pdf({ 
        format: 'A4', 
        printBackground: true, 
        margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' } 
      });
      
      // Clean up before returning
      if (page) { try { await page.close(); } catch {} }
      if (tempBrowser) { try { await tempBrowser.close(); } catch {} }
      
      return Buffer.from(pdf);
    } catch (puppeteerError: any) {
      console.warn('Puppeteer failed for purchase order PDF, trying fallback method:', puppeteerError?.message || puppeteerError);
      
      // Clean up Puppeteer resources
      if (page) { try { await page.close(); } catch {} }
      if (tempBrowser) { try { await tempBrowser.close(); } catch {} }
      
      // Use fallback method
      try {
        return await this.generatePDFFallback(html);
      } catch (fallbackError) {
        console.error('Both Puppeteer and fallback PDF generation failed:', fallbackError);
        throw new Error(`Failed to generate purchase order PDF: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
      }
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