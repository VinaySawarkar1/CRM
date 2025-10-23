// Fixed MongoDB Migration Script with Proper ID Handling
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

// MongoDB configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://vinay:FBKAbt5g5DhxFK3@cluster0.5hfxub2.mongodb.net/?retryWrites=true&w=majority';
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD || 'FBKAbt5g5DhxFK3';
const DB_NAME = 'business_ai';

// Data directory
const DATA_DIR = path.join(process.cwd(), 'data');

// Helper function to convert data with proper ID handling
function convertDataWithIds(data, collectionName) {
  if (!Array.isArray(data)) {
    return data;
  }
  
  return data.map((item, index) => {
    const convertedItem = { ...item };
    
    // Preserve the original numeric ID
    if (item.id !== undefined) {
      convertedItem.id = item.id;
    } else {
      // Generate numeric ID if not present
      convertedItem.id = index + 1;
    }
    
    // Add MongoDB ObjectId for internal use
    convertedItem._id = new ObjectId();
    
    return convertedItem;
  });
}

async function migrateDataToMongoDB() {
  let client;
  
  try {
    // Connect to MongoDB
    const uri = MONGODB_URI.replace('<db_password>', MONGODB_PASSWORD);
    client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB');
    
    // List of JSON files to migrate
    const jsonFiles = [
      'users.json',
      'customers.json', 
      'suppliers.json',
      'leads.json',
      'quotations.json',
      'orders.json',
      'invoices.json',
      'payments.json',
      'purchase_orders.json',
      'inventory.json',
      'manufacturing_jobs.json',
      'tasks.json',
      'employee_activities.json',
      'sales_targets.json',
      'manufacturing_forecasts.json',
      'support_tickets.json',
      'contracts.json',
      'company-settings.json',
      'lead-categories.json',
      'products.json',
      'raw-materials.json',
      'quotation-templates.json',
      'captured-leads.json',
      'proformas.json'
    ];
    
    for (const fileName of jsonFiles) {
      const filePath = path.join(DATA_DIR, fileName);
      
      try {
        // Check if file exists
        await fs.access(filePath);
        
        // Read JSON data
        const jsonData = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(jsonData);
        
        // Get collection name (remove .json extension)
        const collectionName = fileName.replace('.json', '');
        
        // Clear existing data and insert new data
        const collection = db.collection(collectionName);
        await collection.deleteMany({}); // Clear existing data
        
        if (Array.isArray(data) && data.length > 0) {
          // Convert data with proper ID handling
          const convertedData = convertDataWithIds(data, collectionName);
          
          await collection.insertMany(convertedData);
          console.log(`✅ Migrated ${convertedData.length} records to ${collectionName}`);
          
          // Show sample of converted data
          if (convertedData.length > 0) {
            const sample = convertedData[0];
            console.log(`   📄 Sample ID: ${sample.id} (numeric), _id: ${sample._id} (ObjectId)`);
          }
        } else {
          console.log(`⚠️  No data found in ${fileName}`);
        }
        
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log(`⚠️  File ${fileName} not found, skipping...`);
        } else {
          console.error(`❌ Error migrating ${fileName}:`, error.message);
        }
      }
    }
    
    console.log('🎉 Data migration completed successfully!');
    
    // Test the migration by querying some data
    console.log('\n🧪 Testing migrated data...');
    
    const quotationsCollection = db.collection('quotations');
    const quotations = await quotationsCollection.find({}).limit(3).toArray();
    
    console.log(`📊 Sample quotations:`);
    quotations.forEach((q, index) => {
      console.log(`   ${index + 1}. ID: ${q.id} (numeric), _id: ${q._id}, Number: ${q.quotationNumber || 'N/A'}`);
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run migration
migrateDataToMongoDB().catch(console.error);
