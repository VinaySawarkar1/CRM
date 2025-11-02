// Simple connectivity test
const https = require('https');

function testConnectivity() {
  return new Promise((resolve, reject) => {
    const req = https.request('https://crm-bhg1.onrender.com', { method: 'GET' }, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers:`, res.headers);
      resolve(res.statusCode);
    });
    
    req.on('error', (error) => {
      console.log('Connection Error:', error.message);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      console.log('Request timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    req.end();
  });
}

async function checkDeployment() {
  console.log('🔍 Checking deployment status...');
  console.log('🕐 Time:', new Date().toLocaleString());
  
  try {
    const status = await testConnectivity();
    console.log(`✅ Site is responding with status: ${status}`);
    
    if (status === 200) {
      console.log('🎉 Deployment appears to be successful!');
    } else if (status === 502) {
      console.log('⏳ Still deploying or service restarting...');
    } else {
      console.log(`⚠️ Unexpected status: ${status}`);
    }
  } catch (error) {
    console.log('❌ Site is not responding:', error.message);
  }
}

checkDeployment();

