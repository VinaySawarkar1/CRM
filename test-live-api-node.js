// Live API Test Script for https://crm-bhg1.onrender.com/quotations
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

async function testLiveAPI() {
  console.log('🧪 Testing Live API at https://crm-bhg1.onrender.com/quotations');
  console.log('🕐 Started at:', new Date().toLocaleString());
  
  try {
    // Test login
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
    
    console.log('\n📋 Testing Protected Endpoints...');
    
    const endpoints = [
      { path: '/api/user', name: 'User Info' },
      { path: '/api/customers', name: 'Customers' },
      { path: '/api/leads', name: 'Leads' },
      { path: '/api/quotations', name: 'Quotations' },
      { path: '/api/inventory', name: 'Inventory' },
      { path: '/api/tasks', name: 'Tasks' },
      { path: '/api/dashboard/stats', name: 'Dashboard Stats' },
      { path: '/api/lead-categories', name: 'Lead Categories' },
      { path: '/api/proformas', name: 'Proformas' },
      { path: '/api/orders', name: 'Orders' },
      { path: '/api/purchase-orders', name: 'Purchase Orders' },
      { path: '/api/quotation-templates', name: 'Quotation Templates' },
      { path: '/api/company-settings', name: 'Company Settings' }
    ];
    
    let passed = 0;
    let failed = 0;
    let totalRecords = 0;
    
    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await makeRequest(`${API_BASE}${endpoint.path}`, {
          headers: {
            'Cookie': cookieHeader
          }
        });
        const responseTime = Date.now() - startTime;
        
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
          failed++;
        }
        
      } catch (error) {
        console.log(`❌ ${endpoint.name}: Error - ${error.message}`);
        failed++;
      }
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 LIVE API TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / endpoints.length) * 100).toFixed(1)}%`);
    console.log(`📊 Total Records Retrieved: ${totalRecords}`);
    console.log(`🌐 Base URL: ${API_BASE}`);
    console.log(`🕐 Completed at: ${new Date().toLocaleString()}`);
    
    // Health Check
    console.log('\n🏥 HEALTH CHECK:');
    const criticalEndpoints = ['/api/user', '/api/customers', '/api/leads', '/api/quotations'];
    const criticalResults = [];
    
    for (const critical of criticalEndpoints) {
      try {
        const response = await makeRequest(`${API_BASE}${critical}`, {
          headers: { 'Cookie': cookieHeader }
        });
        criticalResults.push(response.status === 200 ? '✅' : '❌');
      } catch {
        criticalResults.push('❌');
      }
    }
    
    console.log(`   Authentication: ${criticalResults[0]}`);
    console.log(`   Customers: ${criticalResults[1]}`);
    console.log(`   Leads: ${criticalResults[2]}`);
    console.log(`   Quotations: ${criticalResults[3]}`);
    
    console.log('\n🎉 Live API testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testLiveAPI();
