// API Testing Script for Reckonix CRM
// Run this in browser console to test all API endpoints

const API_BASE = 'https://crm-bhg1.onrender.com';

async function testAPIEndpoint(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = {
      endpoint,
      method,
      status: response.status,
      ok: response.ok,
      data: null,
      error: null
    };
    
    if (response.ok) {
      try {
        result.data = await response.json();
      } catch (e) {
        result.data = await response.text();
      }
    } else {
      result.error = response.statusText;
    }
    
    return result;
  } catch (error) {
    return {
      endpoint,
      method,
      status: 0,
      ok: false,
      data: null,
      error: error.message
    };
  }
}

async function runAPITests() {
  console.log('🧪 Starting API Tests for Reckonix CRM...');
  
  const tests = [
    // Authentication endpoints
    { endpoint: '/api/user', method: 'GET' },
    { endpoint: '/api/logout', method: 'POST' },
    
    // Data endpoints
    { endpoint: '/api/customers', method: 'GET' },
    { endpoint: '/api/leads', method: 'GET' },
    { endpoint: '/api/quotations', method: 'GET' },
    { endpoint: '/api/orders', method: 'GET' },
    { endpoint: '/api/invoices', method: 'GET' },
    { endpoint: '/api/payments', method: 'GET' },
    { endpoint: '/api/inventory', method: 'GET' },
    { endpoint: '/api/tasks', method: 'GET' },
    { endpoint: '/api/suppliers', method: 'GET' },
    { endpoint: '/api/users', method: 'GET' },
    
    // Specific resource endpoints
    { endpoint: '/api/quotations/1', method: 'GET' },
    { endpoint: '/api/customers/1', method: 'GET' },
    { endpoint: '/api/leads/1', method: 'GET' },
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`Testing ${test.method} ${test.endpoint}...`);
    const result = await testAPIEndpoint(test.endpoint, test.method);
    results.push(result);
    
    if (result.ok) {
      console.log(`✅ ${test.endpoint}: ${result.status} - OK`);
      if (Array.isArray(result.data)) {
        console.log(`   📊 Found ${result.data.length} records`);
      }
    } else {
      console.log(`❌ ${test.endpoint}: ${result.status} - ${result.error}`);
    }
  }
  
  // Summary
  const successful = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  
  console.log('\n📊 API Test Summary:');
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((successful / results.length) * 100).toFixed(1)}%`);
  
  // Show failed tests
  if (failed > 0) {
    console.log('\n❌ Failed Endpoints:');
    results.filter(r => !r.ok).forEach(r => {
      console.log(`   ${r.method} ${r.endpoint}: ${r.status} - ${r.error}`);
    });
  }
  
  return results;
}

// Run the tests
runAPITests().then(results => {
  console.log('\n🎉 API testing completed!');
  console.log('Results:', results);
});

// Export for manual testing
window.testAPIEndpoint = testAPIEndpoint;
window.runAPITests = runAPITests;
