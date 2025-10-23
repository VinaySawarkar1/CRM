// MongoDB Performance Testing Script
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://vinay:FBKAbt5g5DhxFK3@cluster0.5hfxub2.mongodb.net/?retryWrites=true&w=majority';
const DB_NAME = 'business_ai';

async function testMongoDBPerformance() {
  let client;
  
  try {
    console.log('⚡ MongoDB Performance Testing...');
    
    // Connect to MongoDB
    const startConnect = Date.now();
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const connectTime = Date.now() - startConnect;
    console.log(`✅ Connected to MongoDB in ${connectTime}ms`);
    
    const db = client.db(DB_NAME);
    
    // Performance tests
    const performanceTests = [
      {
        name: 'Single Document Read',
        test: async () => {
          const start = Date.now();
          await db.collection('customers').findOne({});
          return Date.now() - start;
        }
      },
      {
        name: 'Bulk Document Read (100 docs)',
        test: async () => {
          const start = Date.now();
          await db.collection('customers').find({}).limit(100).toArray();
          return Date.now() - start;
        }
      },
      {
        name: 'Count Documents',
        test: async () => {
          const start = Date.now();
          await db.collection('customers').countDocuments();
          return Date.now() - start;
        }
      },
      {
        name: 'Aggregation Pipeline',
        test: async () => {
          const start = Date.now();
          await db.collection('customers').aggregate([
            { $group: { _id: '$city', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]).toArray();
          return Date.now() - start;
        }
      },
      {
        name: 'Text Search',
        test: async () => {
          const start = Date.now();
          await db.collection('customers').find({ 
            $text: { $search: 'tech' } 
          }).limit(10).toArray();
          return Date.now() - start;
        }
      },
      {
        name: 'Range Query',
        test: async () => {
          const start = Date.now();
          await db.collection('quotations').find({
            totalAmount: { $gte: 1000, $lte: 10000 }
          }).limit(50).toArray();
          return Date.now() - start;
        }
      },
      {
        name: 'Join-like Operation',
        test: async () => {
          const start = Date.now();
          await db.collection('quotations').aggregate([
            { $lookup: {
              from: 'customers',
              localField: 'customerId',
              foreignField: 'id',
              as: 'customer'
            }},
            { $limit: 10 }
          ]).toArray();
          return Date.now() - start;
        }
      }
    ];
    
    console.log('\n⚡ Performance Test Results:');
    
    const results = [];
    
    for (const test of performanceTests) {
      try {
        const time = await test.test();
        results.push({ name: test.name, time });
        
        let status = '✅';
        if (time > 1000) status = '🐌';
        else if (time > 500) status = '⚠️';
        
        console.log(`${status} ${test.name}: ${time}ms`);
      } catch (error) {
        console.log(`❌ ${test.name}: Error - ${error.message}`);
      }
    }
    
    // Calculate statistics
    const times = results.map(r => r.time);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log('\n📊 Performance Statistics:');
    console.log(`⚡ Average Response Time: ${avgTime.toFixed(2)}ms`);
    console.log(`🚀 Fastest Operation: ${minTime}ms`);
    console.log(`🐌 Slowest Operation: ${maxTime}ms`);
    
    // Test concurrent operations
    console.log('\n🔄 Testing Concurrent Operations:');
    
    const concurrentStart = Date.now();
    const concurrentPromises = Array(10).fill().map(async (_, i) => {
      return db.collection('customers').findOne({ id: i + 1 });
    });
    
    await Promise.all(concurrentPromises);
    const concurrentTime = Date.now() - concurrentStart;
    
    console.log(`✅ 10 Concurrent Reads: ${concurrentTime}ms`);
    console.log(`⚡ Average per operation: ${(concurrentTime / 10).toFixed(2)}ms`);
    
    // Test bulk operations
    console.log('\n📦 Testing Bulk Operations:');
    
    const bulkStart = Date.now();
    const bulkOps = Array(100).fill().map((_, i) => ({
      insertOne: {
        document: {
          name: `Bulk Test ${i}`,
          email: `bulk${i}@test.com`,
          timestamp: new Date()
        }
      }
    }));
    
    const bulkResult = await db.collection('bulk_test').bulkWrite(bulkOps);
    const bulkTime = Date.now() - bulkStart;
    
    console.log(`✅ Bulk Insert (100 docs): ${bulkTime}ms`);
    console.log(`⚡ Average per document: ${(bulkTime / 100).toFixed(2)}ms`);
    
    // Cleanup bulk test data
    await db.collection('bulk_test').deleteMany({});
    console.log('🧹 Cleaned up bulk test data');
    
    console.log('\n🎉 MongoDB Performance testing completed!');
    
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Disconnected from MongoDB');
    }
  }
}

// Run the performance test
testMongoDBPerformance().catch(console.error);
