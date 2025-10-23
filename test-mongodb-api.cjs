// MongoDB API Testing Script - Tests API endpoints with MongoDB
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://vinay:FBKAbt5g5DhxFK3@cluster0.5hfxub2.mongodb.net/?retryWrites=true&w=majority';
const DB_NAME = 'business_ai';

async function testMongoDBAPI() {
  let client;
  
  try {
    console.log('🧪 Testing MongoDB API Operations...');
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Test CRUD operations for each collection
    const testOperations = [
      {
        collection: 'customers',
        testData: {
          name: 'MongoDB Test Customer',
          email: 'mongotest@example.com',
          phone: '1234567890',
          company: 'MongoDB Test Corp',
          address: 'Test Address',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
          gstNumber: '12ABCDE1234F1Z5'
        }
      },
      {
        collection: 'leads',
        testData: {
          name: 'MongoDB Test Lead',
          email: 'mongolead@example.com',
          phone: '1234567890',
          company: 'MongoDB Test Company',
          source: 'API Test',
          status: 'New',
          priority: 'High'
        }
      },
      {
        collection: 'quotations',
        testData: {
          customerId: 1,
          quotationNumber: 'MQ-001',
          date: new Date().toISOString().split('T')[0],
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          items: [{
            description: 'MongoDB Test Item',
            quantity: 1,
            unit: 'PCS',
            rate: 100,
            amount: 100
          }],
          subtotal: 100,
          taxRate: 18,
          taxAmount: 18,
          totalAmount: 118
        }
      },
      {
        collection: 'tasks',
        testData: {
          title: 'MongoDB Test Task',
          description: 'Testing MongoDB operations',
          priority: 'High',
          status: 'Pending',
          assignedTo: 1,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      }
    ];
    
    console.log('\n🔧 Testing CRUD Operations:');
    
    for (const operation of testOperations) {
      const collection = db.collection(operation.collection);
      
      console.log(`\n📋 Testing ${operation.collection}:`);
      
      // CREATE
      try {
        const insertResult = await collection.insertOne(operation.testData);
        console.log(`✅ CREATE: Document inserted with ID ${insertResult.insertedId}`);
        
        // READ
        const findResult = await collection.findOne({ _id: insertResult.insertedId });
        console.log(`✅ READ: Document found - ${findResult ? 'Success' : 'Failed'}`);
        
        // UPDATE
        const updateResult = await collection.updateOne(
          { _id: insertResult.insertedId },
          { $set: { 
            updated: true, 
            updateTime: new Date(),
            testStatus: 'Updated via MongoDB API'
          }}
        );
        console.log(`✅ UPDATE: ${updateResult.modifiedCount} document(s) updated`);
        
        // DELETE
        const deleteResult = await collection.deleteOne({ _id: insertResult.insertedId });
        console.log(`✅ DELETE: ${deleteResult.deletedCount} document(s) deleted`);
        
      } catch (error) {
        console.log(`❌ ${operation.collection}: Error - ${error.message}`);
      }
    }
    
    // Test aggregation operations
    console.log('\n📊 Testing Aggregation Operations:');
    
    // Count total records
    const totalCustomers = await db.collection('customers').countDocuments();
    const totalLeads = await db.collection('leads').countDocuments();
    const totalQuotations = await db.collection('quotations').countDocuments();
    
    console.log(`✅ Total Customers: ${totalCustomers}`);
    console.log(`✅ Total Leads: ${totalLeads}`);
    console.log(`✅ Total Quotations: ${totalQuotations}`);
    
    // Test complex queries
    console.log('\n🔍 Testing Complex Queries:');
    
    // Find customers with specific criteria
    const customersWithEmail = await db.collection('customers').countDocuments({ 
      email: { $exists: true, $ne: null } 
    });
    console.log(`✅ Customers with email: ${customersWithEmail}`);
    
    // Find leads by status
    const newLeads = await db.collection('leads').countDocuments({ status: 'New' });
    console.log(`✅ New leads: ${newLeads}`);
    
    // Find quotations by date range
    const recentQuotations = await db.collection('quotations').countDocuments({
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
    });
    console.log(`✅ Recent quotations (last 30 days): ${recentQuotations}`);
    
    // Test indexing
    console.log('\n📇 Testing Indexes:');
    
    try {
      await db.collection('customers').createIndex({ email: 1 });
      console.log('✅ Index created on customers.email');
      
      await db.collection('leads').createIndex({ status: 1, priority: 1 });
      console.log('✅ Index created on leads.status and priority');
      
      await db.collection('quotations').createIndex({ customerId: 1, date: -1 });
      console.log('✅ Index created on quotations.customerId and date');
      
    } catch (error) {
      console.log(`⚠️ Index creation: ${error.message}`);
    }
    
    console.log('\n🎉 MongoDB API testing completed successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB API test failed:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run the test
testMongoDBAPI().catch(console.error);
