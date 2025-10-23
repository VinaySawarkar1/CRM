// Direct Data File Test - Tests your local JSON data files
// This works without running the server

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');

function testDataFiles() {
  console.log('🧪 Testing Local Data Files');
  console.log('📁 Data Directory:', DATA_DIR);
  
  const dataFiles = [
    'users.json',
    'customers.json',
    'leads.json',
    'quotations.json',
    'inventory.json',
    'tasks.json',
    'proformas.json',
    'quotation-templates.json',
    'lead-categories.json',
    'orders.json',
    'invoices.json',
    'payments.json',
    'suppliers.json',
    'raw-materials.json',
    'products.json',
    'captured-leads.json',
    'company-settings.json',
    'contracts.json',
    'support_tickets.json',
    'manufacturing_forecasts.json',
    'sales_targets.json',
    'employee_activities.json',
    'manufacturing_jobs.json',
    'purchase_orders.json'
  ];
  
  let totalRecords = 0;
  let filesFound = 0;
  
  console.log('\n📋 Data File Analysis:');
  
  dataFiles.forEach(fileName => {
    const filePath = path.join(DATA_DIR, fileName);
    
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        
        if (Array.isArray(data)) {
          console.log(`✅ ${fileName}: ${data.length} records`);
          totalRecords += data.length;
        } else {
          console.log(`✅ ${fileName}: 1 object`);
          totalRecords += 1;
        }
        filesFound++;
      } else {
        console.log(`❌ ${fileName}: File not found`);
      }
    } catch (error) {
      console.log(`❌ ${fileName}: Error - ${error.message}`);
    }
  });
  
  console.log('\n📊 Summary:');
  console.log(`📁 Files found: ${filesFound}/${dataFiles.length}`);
  console.log(`📊 Total records: ${totalRecords}`);
  console.log(`📈 Data completeness: ${((filesFound / dataFiles.length) * 100).toFixed(1)}%`);
  
  return { filesFound, totalRecords, totalFiles: dataFiles.length };
}

// Run the test
testDataFiles();
