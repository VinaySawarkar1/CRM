// MongoDB Testing Script - Tests MongoDB connection and data
const { MongoClient } = require('mongodb');

// MongoDB configuration
const MONGODB_URI = 'mongodb+srv://vinay:FBKAbt5g5DhxFK3@cluster0.5hfxub2.mongodb.net/?retryWrites=true&w=majority';
const DB_NAME = 'business_ai';

async function testMongoDB() {
  let client;
  
  try {
    console.log('🧪 Testing MongoDB Connection...');
    console.log('📍 MongoDB URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
    console.log('🗄️ Database:', DB_NAME);
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB successfully');
    
    const db = client.db(DB_NAME);
    
    // Test collections and data
    const collections = [
      'users',
      'customers', 
      'leads',
      'quotations',
      'inventory',
      'tasks',
      'proformas',
      'quotation-templates',
      'lead-categories',
      'orders',
      'invoices',
      'payments',
      'suppliers',
      'raw-materials',
      'products',
      'captured-leads',
      'company-settings',
      'contracts',
      'support_tickets',
      'manufacturing_forecasts',
      'sales_targets',
      'employee_activities',
      'purchase_orders'
    ];
    
    console.log('\n📋 MongoDB Data Analysis:');
    
    let totalRecords = 0;
    let collectionsWithData = 0;
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const count = await collection.countDocuments();
        
        if (count > 0) {
          console.log(`✅ ${collectionName}: ${count} records`);
          totalRecords += count;
          collectionsWithData++;
          
          // Show sample data for first few collections
          if (collectionsWithData <= 3) {
            const sample = await collection.findOne();
            console.log(`   📄 Sample: ${JSON.stringify(sample, null, 2).substring(0, 100)}...`);
          }
        } else {
          console.log(`⚠️ ${collectionName}: 0 records`);
        }
      } catch (error) {
        console.log(`❌ ${collectionName}: Error - ${error.message}`);
      }
    }
    
    console.log('\n📊 MongoDB Summary:');
    console.log(`🗄️ Database: ${DB_NAME}`);
    console.log(`📁 Collections with data: ${collectionsWithData}/${collections.length}`);
    console.log(`📊 Total records: ${totalRecords}`);
    console.log(`📈 Data completeness: ${((collectionsWithData / collections.length) * 100).toFixed(1)}%`);
    
    // Test specific operations
    console.log('\n🔧 Testing MongoDB Operations:');
    
    // Test insert
    const testCollection = db.collection('test_operations');
    const testDoc = { 
      name: 'Test Document', 
      timestamp: new Date(),
      test: true 
    };
    
    const insertResult = await testCollection.insertOne(testDoc);
    console.log(`✅ Insert test: Document inserted with ID ${insertResult.insertedId}`);
    
    // Test find
    const findResult = await testCollection.findOne({ test: true });
    console.log(`✅ Find test: Document found - ${findResult ? 'Success' : 'Failed'}`);
    
    // Test update
    const updateResult = await testCollection.updateOne(
      { test: true }, 
      { $set: { updated: true, updateTime: new Date() } }
    );
    console.log(`✅ Update test: ${updateResult.modifiedCount} document(s) updated`);
    
    // Test delete
    const deleteResult = await testCollection.deleteOne({ test: true });
    console.log(`✅ Delete test: ${deleteResult.deletedCount} document(s) deleted`);
    
    console.log('\n🎉 MongoDB testing completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB test failed:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run the test
testMongoDB().catch(console.error);
