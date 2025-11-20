const fs = require('fs');
const path = require('path');

// Data directory
const DATA_DIR = path.join(__dirname, 'data');

// Files to migrate
const filesToMigrate = [
  'leads.json',
  'customers.json',
  'quotations.json',
  'orders.json',
  'invoices.json',
  'payments.json',
  'inventory.json',
  'tasks.json',
  'purchase_orders.json',
  'proformas.json'
];

console.log('Starting company data migration...');

// Function to migrate a single file
function migrateFile(filePath, companyId) {
  try {
    const fullPath = path.join(DATA_DIR, filePath);

    if (!fs.existsSync(fullPath)) {
      console.log(`File ${filePath} does not exist, skipping...`);
      return;
    }

    const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));

    if (!Array.isArray(data)) {
      console.log(`File ${filePath} is not an array, skipping...`);
      return;
    }

    let updated = 0;
    const migratedData = data.map(item => {
      if (!item.companyId) {
        updated++;
        return { ...item, companyId };
      }
      return item;
    });

    if (updated > 0) {
      fs.writeFileSync(fullPath, JSON.stringify(migratedData, null, 2));
      console.log(`Migrated ${filePath}: ${updated} records updated with companyId ${companyId}`);
    } else {
      console.log(`File ${filePath}: No records needed migration`);
    }

  } catch (error) {
    console.error(`Error migrating ${filePath}:`, error.message);
  }
}

// Migrate all files to company ID 1 (original Reckonix company)
filesToMigrate.forEach(file => {
  migrateFile(file, 1);
});

console.log('Company data migration completed!');
console.log('All existing data has been assigned to company ID 1 (Reckonix).');
console.log('New companies will have their own separate data.');