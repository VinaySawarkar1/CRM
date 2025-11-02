// Comprehensive API Test for Leads, Terms & Conditions, and Quotations
const https = require('https');

const API_BASE = 'https://crm-bhg1.onrender.com';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function comprehensiveAPITest() {
  console.log('🧪 Comprehensive API Test for Leads, Terms & Conditions, and Quotations');
  console.log('🌐 Testing Live Render Website: https://crm-bhg1.onrender.com');
  console.log('🕐 Started at:', new Date().toLocaleString());
  
  try {
    // Test login first
    console.log('\n🔐 Testing Login...');
    const loginResponse = await makeRequest(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    console.log(`✅ Login: ${loginResponse.status}`);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login failed, cannot test protected endpoints');
      return;
    }
    
    // Extract cookies for session
    const cookies = loginResponse.headers['set-cookie'];
    const cookieHeader = cookies ? cookies.join('; ') : '';
    
    console.log('\n📋 Testing All API Endpoints...');
    
    // Test endpoints
    const endpoints = [
      // Leads API
      { path: '/api/leads', method: 'GET', name: 'Get All Leads' },
      { path: '/api/leads/1', method: 'GET', name: 'Get Lead by ID' },
      { path: '/api/leads/1/discussions', method: 'GET', name: 'Get Lead Discussions' },
      { path: '/api/lead-categories', method: 'GET', name: 'Get Lead Categories' },
      
      // Terms & Conditions API
      { path: '/api/terms', method: 'GET', name: 'Get Terms & Conditions' },
      { path: '/api/quotation-templates', method: 'GET', name: 'Get Quotation Templates' },
      
      // Quotations API
      { path: '/api/quotations', method: 'GET', name: 'Get All Quotations' },
      { path: '/api/quotations/1', method: 'GET', name: 'Get Quotation by ID' },
      { path: '/api/quotations/1/download-pdf', method: 'GET', name: 'Download Quotation PDF' },
      { path: '/api/quotations/1/proforma-invoice', method: 'GET', name: 'Generate Proforma Invoice' },
      { path: '/api/quotations/1/delivery-challan', method: 'GET', name: 'Generate Delivery Challan' },
      
      // Other related APIs
      { path: '/api/customers', method: 'GET', name: 'Get All Customers' },
      { path: '/api/inventory', method: 'GET', name: 'Get Inventory Items' },
      { path: '/api/dashboard/stats', method: 'GET', name: 'Get Dashboard Stats' },
      { path: '/api/company-settings', method: 'GET', name: 'Get Company Settings' },
      { path: '/api/proformas', method: 'GET', name: 'Get Proformas' },
      { path: '/api/orders', method: 'GET', name: 'Get Orders' },
      { path: '/api/tasks', method: 'GET', name: 'Get Tasks' }
    ];
    
    let passed = 0;
    let failed = 0;
    let totalRecords = 0;
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await makeRequest(`${API_BASE}${endpoint.path}`, {
          method: endpoint.method,
          headers: {
            'Cookie': cookieHeader,
            'Content-Type': 'application/json'
          }
        });
        const responseTime = Date.now() - startTime;
        
        const result = {
          endpoint: endpoint.path,
          method: endpoint.method,
          name: endpoint.name,
          status: response.status,
          ok: response.status === 200,
          responseTime,
          data: response.data,
          error: null
        };
        
        if (response.status === 200) {
          console.log(`✅ ${endpoint.name}: ${response.status} (${responseTime}ms)`);
          
          if (Array.isArray(response.data)) {
            console.log(`   📊 Records: ${response.data.length}`);
            totalRecords += response.data.length;
          } else if (response.data && typeof response.data === 'object') {
            console.log(`   📄 Object data received`);
          }
          
          passed++;
        } else {
          console.log(`❌ ${endpoint.name}: ${response.status} (${responseTime}ms)`);
          if (response.data && response.data.message) {
            console.log(`   Error: ${response.data.message}`);
          }
          failed++;
        }
        
        results.push(result);
        
      } catch (error) {
        console.log(`❌ ${endpoint.name}: Network Error - ${error.message}`);
        failed++;
        results.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          name: endpoint.name,
          status: 0,
          ok: false,
          responseTime: 0,
          data: null,
          error: error.message
        });
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Test CRUD operations for leads
    console.log('\n🔧 Testing Lead CRUD Operations...');
    
    // Test creating a new lead
    try {
      const newLeadData = {
        name: 'API Test Lead',
        email: 'apitest@example.com',
        phone: '1234567890',
        company: 'API Test Company',
        source: 'API Test',
        status: 'New',
        priority: 'High',
        description: 'Created via API test'
      };
      
      const createResponse = await makeRequest(`${API_BASE}/api/leads`, {
        method: 'POST',
        headers: {
          'Cookie': cookieHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newLeadData)
      });
      
      console.log(`✅ Create Lead: ${createResponse.status}`);
      if (createResponse.status === 201) {
        console.log(`   📄 New Lead ID: ${createResponse.data.id}`);
        
        // Test updating the lead
        const updateData = { status: 'Contacted', notes: 'Updated via API test' };
        const updateResponse = await makeRequest(`${API_BASE}/api/leads/${createResponse.data.id}`, {
          method: 'PUT',
          headers: {
            'Cookie': cookieHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });
        
        console.log(`✅ Update Lead: ${updateResponse.status}`);
        
        // Test deleting the lead
        const deleteResponse = await makeRequest(`${API_BASE}/api/leads/${createResponse.data.id}`, {
          method: 'DELETE',
          headers: {
            'Cookie': cookieHeader
          }
        });
        
        console.log(`✅ Delete Lead: ${deleteResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Lead CRUD Test Error: ${error.message}`);
    }
    
    // Test quotation operations
    console.log('\n🔧 Testing Quotation Operations...');
    
    try {
      // Test quotation update
      const updateData = { status: 'sent', notes: 'Updated via API test' };
      const updateResponse = await makeRequest(`${API_BASE}/api/quotations/1`, {
        method: 'PUT',
        headers: {
          'Cookie': cookieHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      console.log(`✅ Update Quotation: ${updateResponse.status}`);
      
      // Test quotation creation
      const newQuotationData = {
        quotationNumber: `TEST-${Date.now()}`,
        customerId: 1,
        quotationDate: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contactPerson: 'Test Contact',
        addressLine1: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        items: [{
          description: 'Test Item',
          quantity: 1,
          unit: 'PCS',
          rate: '100',
          amount: '100'
        }],
        subtotal: '100',
        taxRate: 18,
        taxAmount: '18',
        totalAmount: '118',
        status: 'draft'
      };
      
      const createResponse = await makeRequest(`${API_BASE}/api/quotations`, {
        method: 'POST',
        headers: {
          'Cookie': cookieHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newQuotationData)
      });
      
      console.log(`✅ Create Quotation: ${createResponse.status}`);
      if (createResponse.status === 201) {
        console.log(`   📄 New Quotation ID: ${createResponse.data.id}`);
      }
    } catch (error) {
      console.log(`❌ Quotation Operations Error: ${error.message}`);
    }
    
    // Summary Report
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE API TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / endpoints.length) * 100).toFixed(1)}%`);
    console.log(`📊 Total Records Retrieved: ${totalRecords}`);
    console.log(`🌐 Base URL: ${API_BASE}`);
    console.log(`🕐 Completed at: ${new Date().toLocaleString()}`);
    
    // Performance Analysis
    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
    console.log(`⚡ Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    
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
      results.filter(r => !r.ok).forEach(r => {
        console.log(`\n${r.method} ${r.endpoint} (${r.name}):`);
        console.log(`   Status: ${r.status}`);
        console.log(`   Response Time: ${r.responseTime}ms`);
        if (r.error) {
          console.log(`   Error: ${r.error}`);
        }
      });
    }
    
    // Data Summary by Category
    console.log('\n📊 DATA SUMMARY BY CATEGORY:');
    const leadsData = results.find(r => r.endpoint === '/api/leads');
    const quotationsData = results.find(r => r.endpoint === '/api/quotations');
    const customersData = results.find(r => r.endpoint === '/api/customers');
    const inventoryData = results.find(r => r.endpoint === '/api/inventory');
    
    if (leadsData && leadsData.ok) {
      console.log(`   🎯 Leads: ${leadsData.data.length} records`);
    }
    if (quotationsData && quotationsData.ok) {
      console.log(`   📄 Quotations: ${quotationsData.data.length} records`);
    }
    if (customersData && customersData.ok) {
      console.log(`   🏢 Customers: ${customersData.data.length} records`);
    }
    if (inventoryData && inventoryData.ok) {
      console.log(`   📦 Inventory: ${inventoryData.data.length} records`);
    }
    
    // Health Check
    console.log('\n🏥 HEALTH CHECK:');
    const criticalEndpoints = ['/api/leads', '/api/quotations', '/api/customers', '/api/dashboard/stats'];
    const criticalStatus = criticalEndpoints.map(endpoint => {
      const result = results.find(r => r.endpoint === endpoint);
      return result ? (result.ok ? '✅' : '❌') : '⚠️';
    });
    
    console.log(`   Leads: ${criticalStatus[0]}`);
    console.log(`   Quotations: ${criticalStatus[1]}`);
    console.log(`   Customers: ${criticalStatus[2]}`);
    console.log(`   Dashboard: ${criticalStatus[3]}`);
    
    console.log('\n🎉 Comprehensive API testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the comprehensive test
comprehensiveAPITest();

