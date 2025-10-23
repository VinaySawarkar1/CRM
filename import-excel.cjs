const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
let MongoClient = null;
try { MongoClient = require('mongodb').MongoClient; } catch (_) { /* optional */ }

console.log('🚀 Starting Excel data import...');

// Paths
const dataPath = path.join(__dirname, 'data');
const biziverseDataPath = path.join(dataPath, 'Biziverse Data');

function getDownloadsPath() {
  try {
    const userProfile = process.env.USERPROFILE || process.env.HOME || '';
    if (!userProfile) return null;
    const dl = path.join(userProfile, 'Downloads');
    return dl;
  } catch {
    return null;
  }
}

function findSalesDataFile() {
  const candidates = [];
  const downloads = getDownloadsPath();
  if (downloads) {
    candidates.push(path.join(downloads, 'sales_data.xlsx'));
    candidates.push(path.join(downloads, 'sales_data.xls'));
  }
  candidates.push(path.join(__dirname, 'sales_data.xlsx'));
  candidates.push(path.join(__dirname, 'sales_data.xls'));
  for (const fp of candidates) {
    try {
      if (fs.existsSync(fp)) {
        return fp;
      }
    } catch {}
  }
  return null;
}

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

    // Try to find a sheet with data
    let targetSheet = null;
    let worksheet = null;
    let data = [];
    
    for (const sheetName of sheetNames) {
      console.log(`🔍 Checking sheet: ${sheetName}`);
      const currentWorksheet = workbook.Sheets[sheetName];
      const currentData = XLSX.utils.sheet_to_json(currentWorksheet, { header: 1 });
      
      console.log(`📊 Sheet ${sheetName}: ${currentData.length} rows`);
      if (currentData.length > 0) {
        console.log(`📝 First row: ${JSON.stringify(currentData[0])}`);
      }
      
      if (currentData.length > 1) {
        targetSheet = sheetName;
        worksheet = currentWorksheet;
        data = currentData;
        console.log(`✅ Found data in sheet: ${sheetName} (${currentData.length} rows)`);
        break;
      } else {
        console.log(`📭 Sheet ${sheetName} has ${currentData.length} rows (skipping)`);
      }
    }
    
    if (!targetSheet || data.length < 2) {
      console.log('❌ No sheet with data found');
      return [];
    }
    
    console.log(`📄 Using sheet: ${targetSheet}`);
    console.log(`📊 Raw data rows: ${data.length}`);

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

function normalizeHeaders(obj) {
  const out = {};
  Object.keys(obj).forEach(k => {
    const nk = String(k)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g,'_')
      .replace(/^_+|_+$/g,'');
    out[nk] = obj[k];
  });
  return out;
}

async function maybeUpsertMongo(collectionName, docs, uniqueKeys) {
  const uri = process.env.MONGODB_URI;
  if (!uri || !MongoClient) {
    console.log(`ℹ️ MongoDB not configured or driver missing. Skipping Mongo upsert for ${collectionName}.`);
    return { upserted: 0 };
  }
  const dbName = process.env.MONGODB_DB || 'reckonix';
  const client = new MongoClient(uri, { ignoreUndefined: true });
  try {
    await client.connect();
    const col = client.db(dbName).collection(collectionName);
    if (uniqueKeys && uniqueKeys.length) {
      const indexSpec = {};
      uniqueKeys.forEach(k => indexSpec[k] = 1);
      try { await col.createIndex(indexSpec, { unique: false }); } catch {}
    }
    let upserted = 0;
    for (const d of docs) {
      const filter = {};
      uniqueKeys.forEach(k => { if (d[k] !== undefined && d[k] !== null && d[k] !== '') filter[k] = d[k]; });
      if (Object.keys(filter).length === 0) {
        await col.insertOne(d);
      } else {
        await col.updateOne(filter, { $setOnInsert: d }, { upsert: true });
      }
      upserted++;
    }
    console.log(`✅ Mongo upserted ${upserted} docs into ${collectionName}`);
    return { upserted };
  } catch (e) {
    console.log(`❌ Mongo upsert failed for ${collectionName}:`, e.message || e);
    return { upserted: 0 };
  } finally {
    try { await client.close(); } catch {}
  }
}

// Import sales targets from 'plan' sheet and leads from 'leads' sheet in sales_data workbook
async function importSalesData() {
  console.log('\n📈 Importing sales targets and leads from sales_data workbook...');
  const file = findSalesDataFile();
  if (!file) {
    console.log('❌ sales_data file not found in Downloads or project directory. Skipping.');
    return { targets: 0, leads: 0 };
  }
  console.log(`📄 Using sales_data file: ${file}`);

  const workbook = XLSX.readFile(file);
  const sheetNames = workbook.SheetNames;
  const sheets = sheetNames.map(s => s.toLowerCase());
  console.log(`📋 sales_data sheets: ${sheetNames.join(', ')}`);
  const planIndex = sheets.findIndex(s => s.trim() === 'plan');
  let leadsIndex = sheets.findIndex(s => s.trim() === 'leads');
  if (leadsIndex < 0) {
    leadsIndex = sheets.findIndex(s => s.includes('lead'));
  }

  let targetsImported = 0;
  let leadsImported = 0;

  // Load existing JSON
  const leadsPath = path.join(dataPath, 'leads.json');
  const salesTargetsPath = path.join(dataPath, 'sales_targets.json');
  let existingLeads = [];
  let existingTargets = [];
  if (fs.existsSync(leadsPath)) existingLeads = JSON.parse(fs.readFileSync(leadsPath,'utf-8'));
  if (fs.existsSync(salesTargetsPath)) existingTargets = JSON.parse(fs.readFileSync(salesTargetsPath,'utf-8'));

  // PLAN -> sales targets
  if (planIndex >= 0) {
    const ws = workbook.Sheets[workbook.SheetNames[planIndex]];
    const rows = XLSX.utils.sheet_to_json(ws);
    console.log(`📊 plan rows: ${rows.length}`);
    const targetDocs = [];
    rows.forEach((r) => {
      const row = normalizeHeaders(r);
      // Try to map common header names
      const productName = row.product || row.product_name || row.item || row.productname || 'General';
      const targetMonth = String(row.month || row.target_month || '').trim() || new Date().toLocaleString('en-US',{month:'short'});
      const targetYear = String(row.year || row.target_year || new Date().getFullYear());
      const targetValue = parseInt(String(row.target || row.target_value || row.value || row.qty || '0')) || 0;
      const assignedTo = row.assigned_to || row.salesperson || row.owner || null;
      const newTarget = {
        id: existingTargets.length + targetsImported + 1,
        productName,
        targetMonth,
        targetYear,
        targetValue,
        actualValue: 0,
        assignedTo: assignedTo || null,
        notes: '',
        createdAt: new Date().toISOString()
      };
      existingTargets.push(newTarget);
      targetDocs.push({
        productName,
        targetMonth,
        targetYear,
        targetValue,
        actualValue: 0,
        assignedTo: assignedTo || null,
        notes: '',
        createdAt: new Date()
      });
      targetsImported++;
    });
    fs.writeFileSync(salesTargetsPath, JSON.stringify(existingTargets, null, 2));
    console.log(`✅ Imported ${targetsImported} sales targets`);
    await maybeUpsertMongo('sales_targets', targetDocs, ['productName','targetMonth','targetYear']);
  } else {
    console.log('ℹ️ plan sheet not found. Skipping targets.');
  }

  // LEADS -> leads
  if (leadsIndex < 0) {
    // Heuristic: find a sheet that looks like leads (has name/company/email/phone columns)
    for (let i = 0; i < sheetNames.length; i++) {
      if (i === planIndex) continue;
      const ws = workbook.Sheets[sheetNames[i]];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (!rows || rows.length < 1) continue;
      const headers = (rows[0] || []).map(h => String(h || '').trim().toLowerCase());
      const hasName = headers.some(h => ['name','contact','person'].includes(h));
      const hasCompany = headers.some(h => ['company','organization','org'].includes(h));
      const hasEmailOrPhone = headers.some(h => ['email','mail','phone','mobile','contact_no'].includes(h));
      if (hasName && hasCompany && hasEmailOrPhone) {
        leadsIndex = i;
        console.log(`🔎 Heuristic selected leads sheet: ${sheetNames[i]}`);
        break;
      }
    }
  }

  if (leadsIndex >= 0) {
    const ws = workbook.Sheets[workbook.SheetNames[leadsIndex]];
    const rawLeads = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (rawLeads && rawLeads.length > 0) {
      console.log(`📝 leads headers: ${JSON.stringify(rawLeads[0])}`);
    }
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
    console.log(`📊 leads rows: ${rows.length}`);
    // Debug: sample first 3 normalized rows
    const sample = rows.slice(0,3).map(r => normalizeHeaders(r));
    console.log(`🔬 sample leads: ${JSON.stringify(sample, null, 2)}`);
    const leadDocs = [];
    rows.forEach((r) => {
      const row = normalizeHeaders(r);
      // Map from plan/Leads sheet columns
      const name = row.contact || row.customer || row.name || r.Contact || r.Customer || 'Unknown';
      const company = row.customer || row.company || r.Customer || r.Company || 'Unknown';
      const email = row.email || row.mail || r.Email || '';
      const phone = String(row.mobile || row.phone || row.contact_no || r.Mobile || r.Phone || '');
      const city = row.location || row.city || r.Location || r.City || '';
      const address = row.address || '';
      const state = row.state || '';
      const status = (row.stage || row.status || 'new');
      const newLead = {
        id: existingLeads.length + leadsImported + 1,
        name,
        company,
        email: email || `lead${existingLeads.length + leadsImported + 1}@example.com`,
        phone: phone || '0000000000',
        address,
        city,
        state,
        country: 'India',
        pincode: '',
        gstNumber: '',
        panNumber: '',
        status,
        category: 'industry',
        source: 'import',
        assignedTo: null,
        priority: 'medium',
        expectedValue: null,
        nextFollowUp: null,
        notes: row.notes || r.Notes || '',
        createdAt: new Date().toISOString()
      };
      const exists = existingLeads.find(l => (l.email && email && l.email === email) || (l.phone && phone && l.phone === phone));
      if (!exists) {
        existingLeads.push(newLead);
        leadDocs.push({
          name,
          company,
          email,
          phone,
          address,
          city,
          state,
          country: 'India',
          status,
          source: 'import',
          notes: row.notes || r.Notes || '',
          createdAt: new Date()
        });
        leadsImported++;
      }
    });
    fs.writeFileSync(leadsPath, JSON.stringify(existingLeads, null, 2));
    console.log(`✅ Imported ${leadsImported} leads`);
    await maybeUpsertMongo('leads', leadDocs, ['email','phone']);
  } else {
    console.log('ℹ️ leads sheet not found. Skipping leads.');
  }

  return { targets: targetsImported, leads: leadsImported };
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
    if (!row['Company'] && !row['Contact']) {
      continue;
    }

    // Check if customer already exists (by email or mobile)
    const existingCustomer = existingCustomers.find(c => 
      c.email === row['Email'] || c.phone === String(row['Mobile'])
    );

    if (existingCustomer) {
      console.log(`⏭️  Customer ${row['Contact'] || row['Company']} already exists, skipping...`);
      continue;
    }

    // Create new customer object
    const newCustomer = {
      id: existingCustomers.length + newCustomers.length + 1,
      name: row['Contact'] || row['Company'] || 'Unknown',
      company: row['Company'] || row['Contact'] || 'Unknown',
      email: row['Email'] || `customer${existingCustomers.length + newCustomers.length + 1}@example.com`,
      phone: String(row['Mobile'] || '0000000000'),
      address: row['Address'] || '',
      city: row['City'] || '',
      state: row['State'] || 'Maharashtra',
      country: row['Country'] || 'India',
      pincode: '', // Extract from address if needed
      gstNumber: '', // Not available in Excel
      panNumber: '', // Not available in Excel
      creditLimit: row['Amount'] ? String(row['Amount']) : '0',
      paymentTerms: '30 days', // Default
      status: 'active',
      notes: row['Internal Notes'] || row['Last Talk'] || '',
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
    if (!row['Item'] && !row['Code']) {
      continue;
    }

    // Check if item already exists (by SKU)
    const existingItem = existingInventory.find(item => 
      item.sku === row['Code']
    );

    if (existingItem) {
      console.log(`⏭️  Item ${row['Item'] || row['Code']} already exists, skipping...`);
      continue;
    }

    // Create new inventory item
    const newItem = {
      id: existingInventory.length + newInventory.length + 1,
      name: row['Item'] || row['Code'] || 'Unknown Item',
      sku: row['Code'] || `SKU${existingInventory.length + newInventory.length + 1}`,
      description: row['Item'] || '', // Use item name as description
      category: row['Category'] || 'General',
      unit: row['Unit'] || 'pcs',
      quantity: parseInt(String(row['Qty'] || '0')) || 0,
      threshold: 5, // Default threshold
      costPrice: String(row['Rate'] || '0'), // Use Rate as cost price
      sellingPrice: String(row['Rate'] || '0'), // Use Rate as selling price
      taxRate: '18', // Default tax rate
      supplierId: null,
      location: '', // No location in Excel
      isActive: true,
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
(async () => {
  try {
    importCustomers();
    importStock();
    const sales = await importSalesData();
    console.log('\n🎉 Data import completed successfully!');
    console.log(`➡️  Totals from sales_data: ${sales.targets} targets, ${sales.leads} leads`);
  } catch (error) {
    console.error('\n❌ Error during data import:', error);
    process.exitCode = 1;
  }
})();
