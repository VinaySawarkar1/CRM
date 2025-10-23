// Simple Local API Test - Run this in browser console
// Make sure your local server is running on http://localhost:3001

const API_BASE = 'http://localhost:3001';

async function quickTest() {
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
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint}: ${response.status} - ${Array.isArray(data) ? data.length + ' records' : 'OK'}`);
      } else {
        console.log(`❌ ${endpoint}: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: Error - ${error.message}`);
    }
  }
}

// Run the quick test
quickTest();
