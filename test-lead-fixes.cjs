// Quick test for Lead API fixes
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

async function testLeadFixes() {
  console.log('🧪 Testing Lead API Fixes');
  console.log('🕐 Started at:', new Date().toLocaleString());
  
  try {
    // Login first
    const loginResponse = await makeRequest(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    if (loginResponse.status !== 200) {
      console.log('❌ Login failed');
      return;
    }
    
    const cookies = loginResponse.headers['set-cookie'];
    const cookieHeader = cookies ? cookies.join('; ') : '';
    
    console.log('✅ Login successful');
    
    // Test the previously failing endpoints
    const tests = [
      { path: '/api/leads/1', name: 'Get Lead by ID' },
      { path: '/api/lead-categories', name: 'Get Lead Categories' },
      { path: '/api/quotations/1/download-pdf', name: 'Download Quotation PDF' }
    ];
    
    for (const test of tests) {
      try {
        const response = await makeRequest(`${API_BASE}${test.path}`, {
          method: 'GET',
          headers: {
            'Cookie': cookieHeader,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status === 200) {
          console.log(`✅ ${test.name}: ${response.status}`);
          if (Array.isArray(response.data)) {
            console.log(`   📊 Records: ${response.data.length}`);
          }
        } else {
          console.log(`❌ ${test.name}: ${response.status}`);
          if (response.data && response.data.message) {
            console.log(`   Error: ${response.data.message}`);
          }
        }
      } catch (error) {
        console.log(`❌ ${test.name}: Network Error - ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n🎉 Lead API fixes test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLeadFixes();
