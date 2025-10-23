// Local API Testing Script for Reckonix CRM
// Tests ALL API endpoints locally at http://localhost:3001
// Run this in browser console at http://localhost:3001

const API_BASE = 'http://localhost:3001';

// Test data for POST/PUT requests
const testData = {
  customer: {
    name: "Local Test Customer",
    email: "localtest@example.com",
    phone: "1234567890",
    address: "Local Test Address",
    city: "Test City",
    state: "Test State",
    pincode: "123456",
    gstNumber: "12ABCDE1234F1Z5"
  },
  lead: {
    name: "Local Test Lead",
    email: "locallead@example.com",
    phone: "1234567890",
    company: "Local Test Company",
    source: "Website",
    status: "New",
    priority: "Medium"
  },
  quotation: {
    customerId: 1,
    quotationNumber: "LQ-001",
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{
      description: "Local Test Item",
      quantity: 1,
      unit: "PCS",
      rate: 100,
      amount: 100
    }],
    subtotal: 100,
    taxRate: 18,
    taxAmount: 18,
    totalAmount: 118
  },
  task: {
    title: "Local Test Task",
    description: "Local Test Description",
    priority: "Medium",
    status: "Pending",
    assignedTo: 1,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  },
  inventory: {
    name: "Local Test Item",
    description: "Local Test Description",
    category: "Test Category",
    quantity: 10,
    unitPrice: 100,
    supplierId: 1
  }
};

async function testAPIEndpoint(endpoint, method = 'GET', data = null, expectedStatus = null) {
  const startTime = Date.now();
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
    const responseTime = Date.now() - startTime;
    
    const result = {
      endpoint,
      method,
      status: response.status,
      ok: response.ok,
      data: null,
      error: null,
      expectedStatus,
      passed: expectedStatus ? response.status === expectedStatus : response.ok,
      responseTime
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
    
    return result;
  } catch (error) {
    return {
      endpoint,
      method,
      status: 0,
      ok: false,
      data: null,
      error: error.message,
      expectedStatus,
      passed: false,
      responseTime: Date.now() - startTime
    };
  }
}

async function runLocalAPITests() {
  console.log('🧪 Starting Local API Tests for Reckonix CRM...');
  console.log('📍 Testing at:', API_BASE);
  console.log('🕐 Started at:', new Date().toLocaleString());
  
  const tests = [
    // Authentication & User Management
    { endpoint: '/api/user', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/logout', method: 'POST', expectedStatus: 200 },
    { endpoint: '/api/users', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/users', method: 'POST', data: testData.customer, expectedStatus: 201 },
    { endpoint: '/api/users/1', method: 'PUT', data: testData.customer, expectedStatus: 200 },
    
    // Customer Management
    { endpoint: '/api/customers', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/customers', method: 'POST', data: testData.customer, expectedStatus: 201 },
    { endpoint: '/api/customers/1', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/customers/1', method: 'PUT', data: testData.customer, expectedStatus: 200 },
    { endpoint: '/api/customers/999', method: 'DELETE', expectedStatus: 404 },
    
    // Lead Management
    { endpoint: '/api/leads', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/leads', method: 'POST', data: testData.lead, expectedStatus: 201 },
    { endpoint: '/api/leads/1', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/leads/1', method: 'PUT', data: testData.lead, expectedStatus: 200 },
    { endpoint: '/api/leads/999', method: 'DELETE', expectedStatus: 404 },
    { endpoint: '/api/leads/1/convert-to-customer', method: 'POST', expectedStatus: 200 },
    { endpoint: '/api/leads/1/discussions', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/leads/1/discussions', method: 'POST', data: { message: "Local test discussion" }, expectedStatus: 201 },
    
    // Lead Categories
    { endpoint: '/api/lead-categories', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/lead-categories', method: 'POST', data: { name: "Local Test Category" }, expectedStatus: 201 },
    { endpoint: '/api/lead-categories/1', method: 'PUT', data: { name: "Updated Local Category" }, expectedStatus: 200 },
    { endpoint: '/api/lead-categories/999', method: 'DELETE', expectedStatus: 404 },
    
    // Inventory Management
    { endpoint: '/api/inventory', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/inventory', method: 'POST', data: testData.inventory, expectedStatus: 201 },
    
    // Task Management
    { endpoint: '/api/tasks', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/tasks', method: 'POST', data: testData.task, expectedStatus: 201 },
    
    // Quotation Management
    { endpoint: '/api/quotations', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/quotations', method: 'POST', data: testData.quotation, expectedStatus: 201 },
    { endpoint: '/api/quotations/1', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/quotations/1', method: 'PUT', data: testData.quotation, expectedStatus: 200 },
    { endpoint: '/api/quotations/1/download-pdf', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/quotations/1/proforma-invoice', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/quotations/1/delivery-challan', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/quotations/1/convert-to-invoice', method: 'POST', expectedStatus: 200 },
    { endpoint: '/api/quotations/1/convert-to-order', method: 'POST', expectedStatus: 200 },
    { endpoint: '/api/quotations/999', method: 'DELETE', expectedStatus: 404 },
    
    // Proforma Management
    { endpoint: '/api/proformas', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/proformas/1', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/proformas', method: 'POST', data: testData.quotation, expectedStatus: 201 },
    { endpoint: '/api/proformas/1', method: 'PUT', data: testData.quotation, expectedStatus: 200 },
    { endpoint: '/api/proformas/999', method: 'DELETE', expectedStatus: 404 },
    { endpoint: '/api/proformas/1/download-pdf', method: 'GET', expectedStatus: 200 },
    
    // Quotation Templates
    { endpoint: '/api/quotation-templates', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/quotation-templates', method: 'POST', data: { name: "Local Test Template" }, expectedStatus: 201 },
    
    // Order Management
    { endpoint: '/api/orders', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/orders', method: 'POST', data: testData.quotation, expectedStatus: 201 },
    { endpoint: '/api/orders/1', method: 'PUT', data: testData.quotation, expectedStatus: 200 },
    { endpoint: '/api/orders/999', method: 'DELETE', expectedStatus: 404 },
    { endpoint: '/api/orders/1/print-internal', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/orders/1/delivery-challan', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/orders/1/generate-invoice', method: 'POST', expectedStatus: 200 },
    
    // Purchase Orders
    { endpoint: '/api/purchase-orders', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/purchase-orders/1', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/purchase-orders', method: 'POST', data: testData.quotation, expectedStatus: 201 },
    { endpoint: '/api/purchase-orders/1', method: 'PUT', data: testData.quotation, expectedStatus: 200 },
    { endpoint: '/api/purchase-orders/999', method: 'DELETE', expectedStatus: 404 },
    { endpoint: '/api/purchase-orders/1/download-pdf', method: 'GET', expectedStatus: 200 },
    
    // Dashboard & Analytics
    { endpoint: '/api/dashboard/stats', method: 'GET', expectedStatus: 200 },
    
    // Import/Export
    { endpoint: '/api/import/template/customers', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/export/customers', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/import/customers', method: 'POST', data: { file: "test" }, expectedStatus: 400 },
    
    // Company Settings
    { endpoint: '/api/company-settings', method: 'GET', expectedStatus: 200 },
    { endpoint: '/api/company-settings', method: 'PUT', data: { name: "Local Test Company" }, expectedStatus: 200 },
    
    // Data Import
    { endpoint: '/api/import-data', method: 'POST', data: { entity: "customers" }, expectedStatus: 200 },
    
    // Integrations
    { endpoint: '/api/integrations/indiamart/sync', method: 'POST', expectedStatus: 200 },
  ];
  
  const results = [];
  let passed = 0;
  let failed = 0;
  let totalResponseTime = 0;
  
  console.log(`\n📋 Testing ${tests.length} API endpoints locally...\n`);
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    const progress = `[${i + 1}/${tests.length}]`;
    
    console.log(`${progress} Testing ${test.method} ${test.endpoint}...`);
    
    const result = await testAPIEndpoint(test.endpoint, test.method, test.data, test.expectedStatus);
    results.push(result);
    totalResponseTime += result.responseTime;
    
    if (result.passed) {
      console.log(`✅ ${test.endpoint}: ${result.status} - PASSED (${result.responseTime}ms)`);
      passed++;
      
      // Show data count for GET requests
      if (test.method === 'GET' && Array.isArray(result.data)) {
        console.log(`   📊 Found ${result.data.length} records`);
      }
    } else {
      console.log(`❌ ${test.endpoint}: ${result.status} - FAILED (${result.responseTime}ms)`);
      if (result.error) {
        console.log(`   Error: ${JSON.stringify(result.error)}`);
      }
      failed++;
    }
    
    // Small delay to avoid overwhelming the local server
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  // Summary Report
  console.log('\n' + '='.repeat(70));
  console.log('📊 LOCAL API TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
  console.log(`🌐 Base URL: ${API_BASE}`);
  console.log(`🕐 Completed at: ${new Date().toLocaleString()}`);
  console.log(`⚡ Average Response Time: ${(totalResponseTime / results.length).toFixed(2)}ms`);
  console.log(`⚡ Total Response Time: ${totalResponseTime}ms`);
  
  // Performance Analysis
  const slowEndpoints = results.filter(r => r.responseTime > 1000);
  if (slowEndpoints.length > 0) {
    console.log('\n🐌 Slow Endpoints (>1000ms):');
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
  
  return results;
}

// Run the local tests
console.log('🚀 Starting Local API Testing...');
runLocalAPITests().then(results => {
  console.log('\n🎉 Local API testing completed!');
  console.log('📊 Total endpoints tested:', results.length);
  
  // Export results for further analysis
  window.localApiTestResults = results;
  console.log('💾 Results saved to window.localApiTestResults');
});

// Export functions for manual testing
window.testAPIEndpoint = testAPIEndpoint;
window.runLocalAPITests = runLocalAPITests;
