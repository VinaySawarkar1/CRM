// Quick Local API Test - Copy this to browser console
// Make sure to start server first: npm run dev

const API_BASE = 'http://localhost:3001';

async function quickLocalTest() {
  console.log('🧪 Quick Local API Test');
  console.log('📍 Testing:', API_BASE);
  
  const endpoints = [
    '/api/user',
    '/api/customers',
    '/api/leads', 
    '/api/quotations',
    '/api/inventory',
    '/api/tasks',
    '/api/dashboard/stats'
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const endpoint of endpoints) {
    try {
      const startTime = Date.now();
      const response = await fetch(`${API_BASE}${endpoint}`, {
        credentials: 'include'
      });
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint}: ${response.status} - ${Array.isArray(data) ? data.length + ' records' : 'OK'} (${responseTime}ms)`);
        passed++;
      } else {
        console.log(`❌ ${endpoint}: ${response.status} - ${response.statusText} (${responseTime}ms)`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Error - ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Results: ✅ ${passed} passed, ❌ ${failed} failed`);
}

// Run the test
quickLocalTest();
