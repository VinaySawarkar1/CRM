const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Excel data import...');

// Paths
const dataPath = path.join(__dirname, 'data');
const biziverseDataPath = path.join(dataPath, 'Biziverse Data');

console.log(`📁 Data path: ${dataPath}`);
console.log(`📁 Biziverse Data path: ${biziverseDataPath}`);

// Function to read Excel file
function readExcelFile(filePath) {
  try {
    console.log(`📖 Reading file: ${filePath}`);
    console.log(`📁 File exists: ${fs.existsSync(filePath)}`);
    
    const workbook = XLSX.readFile(filePath);
    console.log(`✅ Workbook loaded successfully`);
    
    const sheetNames = workbook.SheetNames;
    console.log(`📋 Available sheets: ${sheetNames.join(', ')}`);
    
    if (sheetNames.length === 0) {
      console.log('❌ No sheets found in Excel file');
      return [];
    }

    const targetSheet = sheetNames[0];
    console.log(`📄 Reading sheet: ${targetSheet}`);
    
    const worksheet = workbook.Sheets[targetSheet];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`📊 Raw data rows: ${data.length}`);
    
    if (data.length < 2) {
      console.log('❌ No data found in sheet');
      return [];
    }

    // Convert to objects with headers
    const headers = data[0];
    const rows = data.slice(1);
    
    console.log(`📝 Headers: ${JSON.stringify(headers)}`);
    console.log(`📊 Processing ${rows.length} data rows`);
    
    const result = rows.map((row, index) => {
      const obj = {};
      headers.forEach((header, colIndex) => {
        if (header && row[colIndex] !== undefined) {
          obj[header] = row[colIndex];
        }
      });
      return obj;
    });
    
    console.log(`✅ Processed ${result.length} objects`);
    if (result.length > 0) {
      console.log(`📋 Sample object: ${JSON.stringify(result[0], null, 2)}`);
    }
    
    return result;
  } catch (error) {
    console.error(`❌ Error reading Excel file ${filePath}:`, error);
    return [];
  }
}

// Import customers
function importCustomers() {
  console.log('\n👥 Importing customers...');
  
  const customerFile = path.join(biziverseDataPath, 'Customer Details.xls');
  const excelData = readExcelFile(customerFile);
  
  if (excelData.length === 0) {
    console.log('❌ No customer data found');
    return;
  }

  // Read existing customers
  const customersPath = path.join(dataPath, 'customers.json');
  let existingCustomers = [];
  
  if (fs.existsSync(customersPath)) {
    const fileContent = fs.readFileSync(customersPath, 'utf-8');
    existingCustomers = JSON.parse(fileContent);
    console.log(`📊 Existing customers: ${existingCustomers.length}`);
  }

  let importedCount = 0;
  const newCustomers = [];

  for (const row of excelData) {
    // Skip if essential fields are missing
    if (!row['Customer Name'] && !row['Company Name']) {
      continue;
    }

    // Check if customer already exists (by email or phone)
    const existingCustomer = existingCustomers.find(c => 
      c.email === row['Email'] || c.phone === row['Phone']
    );

    if (existingCustomer) {
      console.log(`⏭️  Customer ${row['Customer Name'] || row['Company Name']} already exists, skipping...`);
      continue;
    }

    // Create new customer object
    const newCustomer = {
      id: existingCustomers.length + newCustomers.length + 1,
      name: row['Customer Name'] || row['Company Name'] || 'Unknown',
      company: row['Company Name'] || row['Customer Name'] || 'Unknown',
      email: row['Email'] || `customer${existingCustomers.length + newCustomers.length + 1}@example.com`,
      phone: row['Phone'] || '0000000000',
      address: row['Address'] || '',
      city: row['City'] || '',
      state: row['State'] || 'Maharashtra',
      country: row['Country'] || 'India',
      pincode: row['Pincode'] || '',
      gstNumber: row['GST Number'] || '',
      panNumber: row['PAN Number'] || '',
      creditLimit: row['Credit Limit'] ? String(row['Credit Limit']) : '0',
      paymentTerms: row['Payment Terms'] || '30 days',
      status: row['Status'] || 'active',
      notes: row['Notes'] || '',
      createdAt: new Date().toISOString()
    };

    newCustomers.push(newCustomer);
    importedCount++;
    console.log(`✅ Added customer: ${newCustomer.name} (${newCustomer.company})`);
  }

  // Add new customers to existing ones
  const allCustomers = [...existingCustomers, ...newCustomers];
  
  // Write back to file
  fs.writeFileSync(customersPath, JSON.stringify(allCustomers, null, 2));
  
  console.log(`🎉 Imported ${importedCount} new customers`);
  console.log(`📊 Total customers: ${allCustomers.length}`);
}

// Import stock
function importStock() {
  console.log('\n📦 Importing stock...');
  
  const stockFile = path.join(biziverseDataPath, 'Stock (1).xls');
  const excelData = readExcelFile(stockFile);
  
  if (excelData.length === 0) {
    console.log('❌ No stock data found');
    return;
  }

  // Read existing inventory
  const inventoryPath = path.join(dataPath, 'inventory.json');
  let existingInventory = [];
  
  if (fs.existsSync(inventoryPath)) {
    const fileContent = fs.readFileSync(inventoryPath, 'utf-8');
    existingInventory = JSON.parse(fileContent);
    console.log(`📊 Existing inventory items: ${existingInventory.length}`);
  }

  let importedCount = 0;
  const newInventory = [];

  for (const row of excelData) {
    // Skip if essential fields are missing
    if (!row['Item Name'] && !row['SKU']) {
      continue;
    }

    // Check if item already exists (by SKU)
    const existingItem = existingInventory.find(item => 
      item.sku === row['SKU']
    );

    if (existingItem) {
      console.log(`⏭️  Item ${row['Item Name'] || row['SKU']} already exists, skipping...`);
      continue;
    }

    // Create new inventory item
    const newItem = {
      id: existingInventory.length + newInventory.length + 1,
      name: row['Item Name'] || row['SKU'] || 'Unknown Item',
      sku: row['SKU'] || `SKU${existingInventory.length + newInventory.length + 1}`,
      description: row['Description'] || '',
      category: row['Category'] || 'General',
      unit: row['Unit'] || 'pcs',
      quantity: parseInt(String(row['Quantity'] || '0')) || 0,
      threshold: parseInt(String(row['Threshold'] || '5')) || 5,
      costPrice: String(row['Cost Price'] || '0'),
      sellingPrice: String(row['Selling Price'] || '0'),
      taxRate: String(row['Tax Rate'] || '18'),
      supplierId: null,
      location: row['Location'] || '',
      isActive: row['Status'] !== 'Inactive',
      createdAt: new Date().toISOString()
    };

    newInventory.push(newItem);
    importedCount++;
    console.log(`✅ Added item: ${newItem.name} (SKU: ${newItem.sku})`);
  }

  // Add new items to existing inventory
  const allInventory = [...existingInventory, ...newInventory];
  
  // Write back to file
  fs.writeFileSync(inventoryPath, JSON.stringify(allInventory, null, 2));
  
  console.log(`🎉 Imported ${importedCount} new inventory items`);
  console.log(`📊 Total inventory items: ${allInventory.length}`);
}

// Main execution
try {
  importCustomers();
  importStock();
  console.log('\n🎉 Data import completed successfully!');
} catch (error) {
  console.error('\n❌ Error during data import:', error);
}
