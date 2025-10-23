// Live API Testing Script for https://crm-bhg1.onrender.com/quotations
// Tests all API endpoints on the live Render deployment

const API_BASE = 'https://crm-bhg1.onrender.com';

async function testLiveAPI() {
  console.log('🧪 Testing Live API at https://crm-bhg1.onrender.com/quotations');
  console.log('📍 Base URL:', API_BASE);
  console.log('🕐 Started at:', new Date().toLocaleString());
  
  const endpoints = [
    // Authentication & User Management
    { endpoint: '/api/user', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/logout', method: 'POST', expectedStatus: 200 },
    { endpoint: '/api/users', method: 'GET', expectedStatus: 200 },
    
    // Customer Management
    { endpoint: '/api/customers', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/customers/1', method: 'GET', expectedStatus: 200 },
    
    // Lead Management
    { endpoint: '/api/leads', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/leads/1', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/leads/1/discussions', method: 'GET', expectedStatus: 200 },
    
    // Lead Categories
    { endpoint: '/api/lead-categories', method: 'GET', expectedStatus: 200 },
    
    // Quotation Management
    { endpoint: '/api/quotations', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/quotations/1', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/quotations/1/download-pdf', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/quotations/1/proforma-invoice', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/quotations/1/delivery-challan', method: 'GET', expectedStatus: 200 },
    
    // Proforma Management
    { endpoint: '/api/proformas', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/proformas/1', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/proformas/1/download-pdf', method: 'GET', expectedStatus: 200 },
    
    // Quotation Templates
    { endpoint: '/api/quotation-templates', method: 'GET', expectedStatus: 200 },
    
    // Order Management
    { endpoint: '/api/orders', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/orders/1/print-internal', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/orders/1/delivery-challan', method: 'GET', expectedStatus: 200 },
    
    // Purchase Orders
    { endpoint: '/api/purchase-orders', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/purchase-orders/1', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/purchase-orders/1/download-pdf', method: 'GET', expectedStatus: 200 },
    
    // Inventory Management
    { endpoint: '/api/inventory', method: 'GET', expectedStatus: 200 },
    
    // Task Management
    { endpoint: '/api/tasks', method: 'GET', expectedStatus: 200 },
    
    // Dashboard & Analytics
    { endpoint: '/api/dashboard/stats', method: 'GET', expectedStatus: 200 },
    
    // Company Settings
    { endpoint: '/api/company-settings', method: 'GET', expectedStatus: 200 },
    
    // Import/Export
    { endpoint: '/api/import/template/customers', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/export/customers', method: 'GET', expectedStatus: 200 },
    
    // Data Import
    { endpoint: '/api/import-data', method: 'POST', data: { entity: 'customers' }, expectedStatus: 200 },
    
    // Integrations
    { endpoint: '/api/integrations/indiamart/sync', method: 'POST', expectedStatus: 200 },
  ];
  
  const results = [];
  let passed = 0;
  let failed = 0;
  let totalResponseTime = 0;
  
  console.log(`\n📋 Testing ${endpoints.length} API endpoints on live server...\n`);
  
  for (let i = 0; i < endpoints.length; i++) {
    const test = endpoints[i];
    const progress = `[${i + 1}/${endpoints.length}]`;
    
    console.log(`${progress} Testing ${test.method} ${test.endpoint}...`);
    
    try {
      const startTime = Date.now();
      
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      };
      
      if (test.data) {
        options.body = JSON.stringify(test.data);
      }
      
      const response = await fetch(`${API_BASE}${test.endpoint}`, options);
      const responseTime = Date.now() - startTime;
      totalResponseTime += responseTime;
      
      const result = {
        endpoint: test.endpoint,
        method: test.method,
        status: response.status,
        ok: response.ok,
        responseTime,
        data: null,
        error: null,
        passed: response.status === test.expectedStatus
      };
      
      if (response.ok) {
        try {
          result.data = await response.json();
        } catch (e) {
          result.data = await response.text();
        }
      } else {
        try {
          result.error = await response.json();
        } catch (e) {
          result.error = response.statusText;
        }
      }
      
      results.push(result);
      
      if (result.passed) {
        console.log(`✅ ${test.endpoint}: ${response.status} - PASSED (${responseTime}ms)`);
        passed++;
        
        // Show data count for GET requests
        if (test.method === 'GET' && Array.isArray(result.data)) {
          console.log(`   📊 Found ${result.data.length} records`);
        }
      } else {
        console.log(`❌ ${test.endpoint}: ${response.status} - FAILED (${responseTime}ms)`);
        if (result.error) {
          console.log(`   Error: ${JSON.stringify(result.error)}`);
        }
        failed++;
      }
      
    } catch (error) {
      const result = {
        endpoint: test.endpoint,
        method: test.method,
        status: 0,
        ok: false,
        responseTime: 0,
        data: null,
        error: error.message,
        passed: false
      };
      
      results.push(result);
      console.log(`❌ ${test.endpoint}: Network Error - ${error.message}`);
      failed++;
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Summary Report
  console.log('\n' + '='.repeat(70));
  console.log('📊 LIVE API TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  console.log(`🌐 Base URL: ${API_BASE}`);
  console.log(`🕐 Completed at: ${new Date().toLocaleString()}`);
  console.log(`⚡ Average Response Time: ${(totalResponseTime / results.length).toFixed(2)}ms`);
  console.log(`⚡ Total Response Time: ${totalResponseTime}ms`);
  
  // Performance Analysis
  const slowEndpoints = results.filter(r => r.responseTime > 5000);
  if (slowEndpoints.length > 0) {
    console.log('\n🐌 Slow Endpoints (>5000ms):');
    slowEndpoints.forEach(r => {
      console.log(`   ${r.method} ${r.endpoint}: ${r.responseTime}ms`);
    });
  }
  
  // Failed Tests Details
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS DETAILS:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`\n${r.method} ${r.endpoint}:`);
      console.log(`   Status: ${r.status}`);
      console.log(`   Response Time: ${r.responseTime}ms`);
      console.log(`   Error: ${JSON.stringify(r.error)}`);
    });
  }
  
  // Data Summary
  console.log('\n📊 DATA SUMMARY:');
  const dataEndpoints = results.filter(r => r.method === 'GET' && Array.isArray(r.data));
  dataEndpoints.forEach(r => {
    console.log(`   ${r.endpoint}: ${r.data.length} records`);
  });
  
  // Health Check
  console.log('\n🏥 HEALTH CHECK:');
  const criticalEndpoints = ['/api/user', '/api/customers', '/api/leads', '/api/quotations'];
  const criticalStatus = criticalEndpoints.map(endpoint => {
    const result = results.find(r => r.endpoint === endpoint);
    return result ? (result.passed ? '✅' : '❌') : '⚠️';
  });
  
  console.log(`   Authentication: ${criticalStatus[0]}`);
  console.log(`   Customers: ${criticalStatus[1]}`);
  console.log(`   Leads: ${criticalStatus[2]}`);
  console.log(`   Quotations: ${criticalStatus[3]}`);
  
  return results;
}

// Run the live API test
console.log('🚀 Starting Live API Testing...');
testLiveAPI().then(results => {
  console.log('\n🎉 Live API testing completed!');
  console.log('📊 Total endpoints tested:', results.length);
  
  // Export results for further analysis
  window.liveApiTestResults = results;
  console.log('💾 Results saved to window.liveApiTestResults');
});

// Export functions for manual testing
window.testLiveAPI = testLiveAPI;
