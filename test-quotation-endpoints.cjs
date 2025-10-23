// Comprehensive Quotation Endpoint Test
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

async function testQuotationEndpoints() {
  console.log('🧪 Testing Quotation Endpoints at https://crm-bhg1.onrender.com');
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
    
    console.log('\n📋 Testing Quotation Endpoints...');
    
    // Test GET /api/quotations (list all)
    console.log('\n1. Testing GET /api/quotations (list all)...');
    try {
      const quotationsResponse = await makeRequest(`${API_BASE}/api/quotations`, {
        headers: { 'Cookie': cookieHeader }
      });
      
      console.log(`   Status: ${quotationsResponse.status}`);
      if (quotationsResponse.status === 200) {
        console.log(`   📊 Found ${quotationsResponse.data.length} quotations`);
        
        // Test individual quotation access
        if (quotationsResponse.data.length > 0) {
          const firstQuotation = quotationsResponse.data[0];
          console.log(`   🔍 Testing individual quotation ID: ${firstQuotation.id}`);
          
          // Test GET /api/quotations/:id
          console.log('\n2. Testing GET /api/quotations/:id...');
          try {
            const singleQuotationResponse = await makeRequest(`${API_BASE}/api/quotations/${firstQuotation.id}`, {
              headers: { 'Cookie': cookieHeader }
            });
            
            console.log(`   Status: ${singleQuotationResponse.status}`);
            if (singleQuotationResponse.status === 200) {
              console.log(`   ✅ Successfully retrieved quotation ${firstQuotation.id}`);
              console.log(`   📄 Quotation Number: ${singleQuotationResponse.data.quotationNumber || 'N/A'}`);
              console.log(`   🏢 Customer ID: ${singleQuotationResponse.data.customerId || 'N/A'}`);
              console.log(`   💰 Total Amount: ${singleQuotationResponse.data.totalAmount || 'N/A'}`);
            } else {
              console.log(`   ❌ Failed to retrieve quotation ${firstQuotation.id}`);
              console.log(`   Error: ${JSON.stringify(singleQuotationResponse.data)}`);
            }
          } catch (error) {
            console.log(`   ❌ Error retrieving quotation ${firstQuotation.id}: ${error.message}`);
          }
          
          // Test PDF generation
          console.log('\n3. Testing GET /api/quotations/:id/download-pdf...');
          try {
            const pdfResponse = await makeRequest(`${API_BASE}/api/quotations/${firstQuotation.id}/download-pdf`, {
              headers: { 'Cookie': cookieHeader }
            });
            
            console.log(`   Status: ${pdfResponse.status}`);
            if (pdfResponse.status === 200) {
              console.log(`   ✅ PDF generation successful for quotation ${firstQuotation.id}`);
            } else {
              console.log(`   ❌ PDF generation failed for quotation ${firstQuotation.id}`);
              console.log(`   Error: ${JSON.stringify(pdfResponse.data)}`);
            }
          } catch (error) {
            console.log(`   ❌ Error generating PDF for quotation ${firstQuotation.id}: ${error.message}`);
          }
          
          // Test proforma invoice generation
          console.log('\n4. Testing GET /api/quotations/:id/proforma-invoice...');
          try {
            const proformaResponse = await makeRequest(`${API_BASE}/api/quotations/${firstQuotation.id}/proforma-invoice`, {
              headers: { 'Cookie': cookieHeader }
            });
            
            console.log(`   Status: ${proformaResponse.status}`);
            if (proformaResponse.status === 200) {
              console.log(`   ✅ Proforma invoice generation successful for quotation ${firstQuotation.id}`);
            } else {
              console.log(`   ❌ Proforma invoice generation failed for quotation ${firstQuotation.id}`);
              console.log(`   Error: ${JSON.stringify(proformaResponse.data)}`);
            }
          } catch (error) {
            console.log(`   ❌ Error generating proforma invoice for quotation ${firstQuotation.id}: ${error.message}`);
          }
          
          // Test delivery challan generation
          console.log('\n5. Testing GET /api/quotations/:id/delivery-challan...');
          try {
            const challanResponse = await makeRequest(`${API_BASE}/api/quotations/${firstQuotation.id}/delivery-challan`, {
              headers: { 'Cookie': cookieHeader }
            });
            
            console.log(`   Status: ${challanResponse.status}`);
            if (challanResponse.status === 200) {
              console.log(`   ✅ Delivery challan generation successful for quotation ${firstQuotation.id}`);
            } else {
              console.log(`   ❌ Delivery challan generation failed for quotation ${firstQuotation.id}`);
              console.log(`   Error: ${JSON.stringify(challanResponse.data)}`);
            }
          } catch (error) {
            console.log(`   ❌ Error generating delivery challan for quotation ${firstQuotation.id}: ${error.message}`);
          }
          
          // Test quotation update
          console.log('\n6. Testing PUT /api/quotations/:id...');
          try {
            const updateData = {
              status: 'sent',
              notes: 'Updated via API test'
            };
            
            const updateResponse = await makeRequest(`${API_BASE}/api/quotations/${firstQuotation.id}`, {
              method: 'PUT',
              headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(updateData)
            });
            
            console.log(`   Status: ${updateResponse.status}`);
            if (updateResponse.status === 200) {
              console.log(`   ✅ Quotation update successful for quotation ${firstQuotation.id}`);
            } else {
              console.log(`   ❌ Quotation update failed for quotation ${firstQuotation.id}`);
              console.log(`   Error: ${JSON.stringify(updateResponse.data)}`);
            }
          } catch (error) {
            console.log(`   ❌ Error updating quotation ${firstQuotation.id}: ${error.message}`);
          }
        }
      } else {
        console.log(`   ❌ Failed to retrieve quotations list`);
        console.log(`   Error: ${JSON.stringify(quotationsResponse.data)}`);
      }
    } catch (error) {
      console.log(`   ❌ Error retrieving quotations list: ${error.message}`);
    }
    
    // Test quotation creation
    console.log('\n7. Testing POST /api/quotations (create new)...');
    try {
      const newQuotationData = {
        quotationNumber: `TEST-${Date.now()}`,
        customerId: 1,
        quotationDate: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: [{
          description: 'Test Item',
          quantity: 1,
          unit: 'PCS',
          rate: 100,
          amount: 100
        }],
        subtotal: 100,
        taxRate: 18,
        taxAmount: 18,
        totalAmount: 118,
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
      
      console.log(`   Status: ${createResponse.status}`);
      if (createResponse.status === 201) {
        console.log(`   ✅ Quotation creation successful`);
        console.log(`   📄 New Quotation ID: ${createResponse.data.id}`);
        console.log(`   📄 New Quotation Number: ${createResponse.data.quotationNumber}`);
      } else {
        console.log(`   ❌ Quotation creation failed`);
        console.log(`   Error: ${JSON.stringify(createResponse.data)}`);
      }
    } catch (error) {
      console.log(`   ❌ Error creating quotation: ${error.message}`);
    }
    
    console.log('\n🎉 Quotation endpoint testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testQuotationEndpoints();
