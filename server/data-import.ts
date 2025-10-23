import XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface ExcelCustomer {
  'Customer Name'?: string;
  'Company Name'?: string;
  'Email'?: string;
  'Phone'?: string;
  'Address'?: string;
  'City'?: string;
  'State'?: string;
  'Country'?: string;
  'Pincode'?: string;
  'GST Number'?: string;
  'PAN Number'?: string;
  'Credit Limit'?: string | number;
  'Payment Terms'?: string;
  'Status'?: string;
  'Notes'?: string;
}

interface ExcelStock {
  'Item Name'?: string;
  'SKU'?: string;
  'Description'?: string;
  'Category'?: string;
  'Unit'?: string;
  'Quantity'?: string | number;
  'Threshold'?: string | number;
  'Cost Price'?: string | number;
  'Selling Price'?: string | number;
  'Tax Rate'?: string | number;
  'Supplier'?: string;
  'Location'?: string;
  'Status'?: string;
}

class DataImporter {
  private dataPath: string;
  private biziverseDataPath: string;

  constructor() {
    this.dataPath = path.join(process.cwd(), 'data');
    this.biziverseDataPath = path.join(this.dataPath, 'Biziverse Data');
  }

  // Read Excel file and return worksheet data
  private readExcelFile(filePath: string, sheetName?: string): any[] {
    try {
      console.log(`Attempting to read file: ${filePath}`);
      console.log(`File exists: ${fs.existsSync(filePath)}`);
      
      const workbook = XLSX.readFile(filePath);
      console.log(`Workbook loaded successfully`);
      
      const sheetNames = workbook.SheetNames;
      console.log(`Available sheets: ${sheetNames.join(', ')}`);
      
      if (sheetNames.length === 0) {
        console.log('No sheets found in Excel file');
        return [];
      }

      const targetSheet = sheetName || sheetNames[0];
      console.log(`Reading sheet: ${targetSheet}`);
      
      const worksheet = workbook.Sheets[targetSheet];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      console.log(`Raw data rows: ${data.length}`);
      console.log(`First row (headers): ${JSON.stringify(data[0])}`);
      
      if (data.length < 2) {
        console.log('No data found in sheet');
        return [];
      }

      // Convert to objects with headers
      const headers = data[0] as string[];
      const rows = data.slice(1);
      
      console.log(`Processing ${rows.length} data rows`);
      
      const result = rows.map((row: any) => {
        const obj: any = {};
        headers.forEach((header, index) => {
          if (header && row[index] !== undefined) {
            obj[header] = row[index];
          }
        });
        return obj;
      });
      
      console.log(`Processed ${result.length} objects`);
      if (result.length > 0) {
        console.log(`Sample object: ${JSON.stringify(result[0], null, 2)}`);
      }
      
      return result;
    } catch (error) {
      console.error(`Error reading Excel file ${filePath}:`, error);
      return [];
    }
  }

  // Import customers from Excel
  private async importCustomers(): Promise<void> {
    const customerFile = path.join(this.biziverseDataPath, 'Customer Details.xls');
    
    if (!fs.existsSync(customerFile)) {
      console.log('Customer Details.xls not found');
      return;
    }

    console.log('Importing customers from Excel...');
    const excelData = this.readExcelFile(customerFile);
    
    if (excelData.length === 0) {
      console.log('No customer data found in Excel');
      return;
    }

    // Read existing customers
    const customersPath = path.join(this.dataPath, 'customers.json');
    let existingCustomers: any[] = [];
    
    if (fs.existsSync(customersPath)) {
      const fileContent = fs.readFileSync(customersPath, 'utf-8');
      existingCustomers = JSON.parse(fileContent);
    }

    let importedCount = 0;
    const newCustomers: any[] = [];

    for (const row of excelData) {
      const customer: ExcelCustomer = row;
      
      // Skip if essential fields are missing
      if (!customer['Customer Name'] && !customer['Company Name']) {
        continue;
      }

      // Check if customer already exists (by email or phone)
      const existingCustomer = existingCustomers.find(c => 
        c.email === customer['Email'] || c.phone === customer['Phone']
      );

      if (existingCustomer) {
        console.log(`Customer ${customer['Customer Name'] || customer['Company Name']} already exists, skipping...`);
        continue;
      }

      // Create new customer object
      const newCustomer = {
        id: existingCustomers.length + newCustomers.length + 1,
        name: customer['Customer Name'] || customer['Company Name'] || 'Unknown',
        company: customer['Company Name'] || customer['Customer Name'] || 'Unknown',
        email: customer['Email'] || `customer${existingCustomers.length + newCustomers.length + 1}@example.com`,
        phone: customer['Phone'] || '0000000000',
        address: customer['Address'] || '',
        city: customer['City'] || '',
        state: customer['State'] || 'Maharashtra',
        country: customer['Country'] || 'India',
        pincode: customer['Pincode'] || '',
        gstNumber: customer['GST Number'] || '',
        panNumber: customer['PAN Number'] || '',
        creditLimit: customer['Credit Limit'] ? String(customer['Credit Limit']) : '0',
        paymentTerms: customer['Payment Terms'] || '30 days',
        status: customer['Status'] || 'active',
        notes: customer['Notes'] || '',
        createdAt: new Date().toISOString()
      };

      newCustomers.push(newCustomer);
      importedCount++;
    }

    // Add new customers to existing ones
    const allCustomers = [...existingCustomers, ...newCustomers];
    
    // Write back to file
    fs.writeFileSync(customersPath, JSON.stringify(allCustomers, null, 2));
    
    console.log(`✅ Imported ${importedCount} new customers`);
    console.log(`📊 Total customers: ${allCustomers.length}`);
  }

  // Import stock/inventory from Excel
  private async importStock(): Promise<void> {
    const stockFile = path.join(this.biziverseDataPath, 'Stock (1).xls');
    
    if (!fs.existsSync(stockFile)) {
      console.log('Stock (1).xls not found');
      return;
    }

    console.log('Importing stock from Excel...');
    const excelData = this.readExcelFile(stockFile);
    
    if (excelData.length === 0) {
      console.log('No stock data found in Excel');
      return;
    }

    // Read existing inventory
    const inventoryPath = path.join(this.dataPath, 'inventory.json');
    let existingInventory: any[] = [];
    
    if (fs.existsSync(inventoryPath)) {
      const fileContent = fs.readFileSync(inventoryPath, 'utf-8');
      existingInventory = JSON.parse(fileContent);
    }

    let importedCount = 0;
    const newInventory: any[] = [];

    for (const row of excelData) {
      const stock: ExcelStock = row;
      
      // Skip if essential fields are missing
      if (!stock['Item Name'] && !stock['SKU']) {
        continue;
      }

      // Check if item already exists (by SKU)
      const existingItem = existingInventory.find(item => 
        item.sku === stock['SKU']
      );

      if (existingItem) {
        console.log(`Item ${stock['Item Name'] || stock['SKU']} already exists, skipping...`);
        continue;
      }

      // Create new inventory item
      const newItem = {
        id: existingInventory.length + newInventory.length + 1,
        name: stock['Item Name'] || stock['SKU'] || 'Unknown Item',
        sku: stock['SKU'] || `SKU${existingInventory.length + newInventory.length + 1}`,
        description: stock['Description'] || '',
        category: stock['Category'] || 'General',
        unit: stock['Unit'] || 'pcs',
        quantity: parseInt(String(stock['Quantity'] || '0')) || 0,
        threshold: parseInt(String(stock['Threshold'] || '5')) || 5,
        costPrice: String(stock['Cost Price'] || '0'),
        sellingPrice: String(stock['Selling Price'] || '0'),
        taxRate: String(stock['Tax Rate'] || '18'),
        supplierId: null, // Will be linked later if supplier exists
        location: stock['Location'] || '',
        isActive: stock['Status'] !== 'Inactive',
        createdAt: new Date().toISOString()
      };

      newInventory.push(newItem);
      importedCount++;
    }

    // Add new items to existing inventory
    const allInventory = [...existingInventory, ...newInventory];
    
    // Write back to file
    fs.writeFileSync(inventoryPath, JSON.stringify(allInventory, null, 2));
    
    console.log(`✅ Imported ${importedCount} new inventory items`);
    console.log(`📊 Total inventory items: ${allInventory.length}`);
  }

  // Main import function
  public async importAll(): Promise<void> {
    console.log('🚀 Starting data import from Excel files...');
    console.log(`📁 Data path: ${this.dataPath}`);
    console.log(`📁 Biziverse Data path: ${this.biziverseDataPath}`);
    
    try {
      // Import customers
      await this.importCustomers();
      
      // Import stock
      await this.importStock();
      
      console.log('✅ Data import completed successfully!');
    } catch (error) {
      console.error('❌ Error during data import:', error);
    }
  }
}

// Run import if this file is executed directly
if (require.main === module || import.meta.url === `file://${process.argv[1]}`) {
  const importer = new DataImporter();
  importer.importAll();
}

export default DataImporter;
