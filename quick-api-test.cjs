// Quick API Test to Check What's Being Returned
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

async function quickTest() {
  try {
    // Login
    const loginResponse = await makeRequest(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const cookies = loginResponse.headers['set-cookie'];
    const cookieHeader = cookies ? cookies.join('; ') : '';
    
    // Get quotations
    const quotationsResponse = await makeRequest(`${API_BASE}/api/quotations`, {
      headers: { 'Cookie': cookieHeader }
    });
    
    console.log('📊 Quotations Response:');
    console.log(`Status: ${quotationsResponse.status}`);
    console.log(`Count: ${quotationsResponse.data.length}`);
    
    if (quotationsResponse.data.length > 0) {
      const firstQuotation = quotationsResponse.data[0];
      console.log('\n🔍 First Quotation Details:');
      console.log(`ID: ${firstQuotation.id} (type: ${typeof firstQuotation.id})`);
      console.log(`_id: ${firstQuotation._id} (type: ${typeof firstQuotation._id})`);
      console.log(`Quotation Number: ${firstQuotation.quotationNumber}`);
      
      // Try to access by numeric ID
      if (typeof firstQuotation.id === 'number') {
        console.log(`\n🧪 Testing access by numeric ID: ${firstQuotation.id}`);
        const singleResponse = await makeRequest(`${API_BASE}/api/quotations/${firstQuotation.id}`, {
          headers: { 'Cookie': cookieHeader }
        });
        console.log(`Status: ${singleResponse.status}`);
        if (singleResponse.status === 200) {
          console.log('✅ Successfully accessed by numeric ID!');
        } else {
          console.log(`❌ Failed: ${JSON.stringify(singleResponse.data)}`);
        }
      }
      
      // Try to access by ObjectId
      if (firstQuotation._id) {
        console.log(`\n🧪 Testing access by ObjectId: ${firstQuotation._id}`);
        const objectIdResponse = await makeRequest(`${API_BASE}/api/quotations/${firstQuotation._id}`, {
          headers: { 'Cookie': cookieHeader }
        });
        console.log(`Status: ${objectIdResponse.status}`);
        if (objectIdResponse.status === 200) {
          console.log('✅ Successfully accessed by ObjectId!');
        } else {
          console.log(`❌ Failed: ${JSON.stringify(objectIdResponse.data)}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

quickTest();
