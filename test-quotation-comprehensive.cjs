#!/usr/bin/env node

/**
 * Comprehensive Quotation System Test Suite
 * Tests all quotation endpoints, database operations, and functionality
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const isHttps = BASE_URL.startsWith('https');
const httpModule = isHttps ? https : http;

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=' + (global.sessionId || ''),
        ...headers
      }
    };

    if (isHttps && BASE_URL.includes('onrender.com')) {
      options.rejectUnauthorized = false;
    }

    const req = httpModule.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    testResults.passed++;
    testResults.tests.push({ name, status: 'PASS', error: null });
    console.log(`✅ ${name}`);
  } catch (error) {
    testResults.failed++;
    testResults.tests.push({ name, status: 'FAIL', error: error.message });
    console.log(`❌ ${name}: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function runTests() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║     QUOTATION SYSTEM COMPREHENSIVE TEST SUITE                      ║
║     Testing: ${BASE_URL}
╚════════════════════════════════════════════════════════════════════╝
  `);

  let createdQuotationId = null;
  let createdQuotationNumber = null;
  let customerId = 1;

  // ============================================================================
  // SECTION 1: AUTHENTICATION
  // ============================================================================
  console.log('\n📋 SECTION 1: Authentication Tests\n');

  await test('Login with credentials', async () => {
    const res = await makeRequest('POST', '/api/login', {
      username: 'admin',
      password: 'admin123'
    });
    assert(res.status === 200 || res.status === 302, `Login failed with status ${res.status}`);
    // Extract session ID from Set-Cookie header
    const setCookie = res.headers['set-cookie'];
    if (setCookie) {
      global.sessionId = setCookie[0]?.split(';')[0]?.split('=')[1];
    }
  });

  // ============================================================================
  // SECTION 2: QUOTATION CREATION
  // ============================================================================
  console.log('\n📋 SECTION 2: Quotation Creation Tests\n');

  await test('Create quotation with valid data', async () => {
    const payload = {
      quotationNumber: `RX-VQ25-TEST-${Date.now()}`,
      customerId: customerId,
      quotationDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contactPerson: 'John Doe',
      addressLine1: '123 Business Street',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      pincode: '411001',
      items: [{
        description: 'Test Service',
        quantity: 1,
        unit: 'Service',
        rate: '10000',
        cgst: '9',
        sgst: '9',
        igst: '0'
      }],
      subtotal: '10000',
      cgstTotal: '900',
      sgstTotal: '900',
      igstTotal: '0',
      taxableTotal: '10000',
      totalAmount: '11800',
      sameAsBilling: true
    };

    const res = await makeRequest('POST', '/api/quotations', payload);
    assert(res.status === 201, `Expected 201, got ${res.status}: ${JSON.stringify(res.data)}`);
    assert(res.data.id, 'Response should contain quotation ID');
    assert(res.data.quotationNumber, 'Response should contain quotationNumber');
    
    createdQuotationId = res.data.id;
    createdQuotationNumber = res.data.quotationNumber;
  });

  await test('Auto-generate quotation number if not provided', async () => {
    const payload = {
      customerId: customerId,
      quotationDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contactPerson: 'Jane Doe',
      addressLine1: '456 Tech Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
      items: [{
        description: 'Test Product',
        quantity: 2,
        unit: 'Units',
        rate: '5000',
        cgst: '9',
        sgst: '9',
        igst: '0'
      }],
      subtotal: '10000',
      cgstTotal: '900',
      sgstTotal: '900',
      igstTotal: '0',
      taxableTotal: '10000',
      totalAmount: '11800',
      sameAsBilling: true
    };

    const res = await makeRequest('POST', '/api/quotations', payload);
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.quotationNumber, 'Should auto-generate quotation number');
    assert(res.data.quotationNumber.match(/RX-VQ\d{2}-\d{2}-\d{2}-\d{3}/), 
      'Quotation number should follow pattern RX-VQ##-##-##-###');
  });

  await test('Quotation number must be unique', async () => {
    const payload = {
      quotationNumber: createdQuotationNumber, // Use existing number
      customerId: customerId,
      quotationDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contactPerson: 'Test Person',
      addressLine1: '789 Test Lane',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      pincode: '560001',
      items: [{
        description: 'Duplicate Test',
        quantity: 1,
        unit: 'Unit',
        rate: '1000',
        cgst: '0',
        sgst: '0',
        igst: '0'
      }],
      subtotal: '1000',
      cgstTotal: '0',
      sgstTotal: '0',
      igstTotal: '0',
      taxableTotal: '1000',
      totalAmount: '1000',
      sameAsBilling: true
    };

    const res = await makeRequest('POST', '/api/quotations', payload);
    assert(res.status === 400, `Expected 400 for duplicate, got ${res.status}`);
  });

  // ============================================================================
  // SECTION 3: QUOTATION RETRIEVAL
  // ============================================================================
  console.log('\n📋 SECTION 3: Quotation Retrieval Tests\n');

  await test('List all quotations', async () => {
    const res = await makeRequest('GET', '/api/quotations');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data), 'Response should be an array');
    assert(res.data.length > 0, 'Should have at least one quotation');
  });

  await test('Get quotation by numeric ID', async () => {
    const res = await makeRequest('GET', `/api/quotations/${createdQuotationId}`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.id === createdQuotationId, 'Should return correct quotation');
    assert(res.data.quotationNumber === createdQuotationNumber, 'quotationNumber should match');
  });

  await test('Get quotation by quotation number', async () => {
    const res = await makeRequest('GET', `/api/quotations/${createdQuotationNumber}`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.id === createdQuotationId, 'Should return correct quotation');
  });

  await test('Return 404 for non-existent quotation', async () => {
    const res = await makeRequest('GET', '/api/quotations/99999');
    assert(res.status === 404, `Expected 404, got ${res.status}`);
  });

  // ============================================================================
  // SECTION 4: QUOTATION UPDATE
  // ============================================================================
  console.log('\n📋 SECTION 4: Quotation Update Tests\n');

  await test('Update quotation partial data', async () => {
    const updatePayload = {
      contactPerson: 'Updated Contact Name',
      totalAmount: '15000'
    };

    const res = await makeRequest('PUT', `/api/quotations/${createdQuotationId}`, updatePayload);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.contactPerson === 'Updated Contact Name', 'Should update contact person');
    assert(res.data.totalAmount === '15000' || res.data.totalAmount === 15000, 'Should update total amount');
  });

  await test('Verify quotation was updated', async () => {
    const res = await makeRequest('GET', `/api/quotations/${createdQuotationId}`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.contactPerson === 'Updated Contact Name', 'Contact person should be updated in database');
  });

  // ============================================================================
  // SECTION 5: DATA INTEGRITY
  // ============================================================================
  console.log('\n📋 SECTION 5: Data Integrity Tests\n');

  await test('Verify decimal fields stored correctly', async () => {
    const res = await makeRequest('GET', `/api/quotations/${createdQuotationId}`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    
    // Check numeric fields
    const fields = ['subtotal', 'cgstTotal', 'sgstTotal', 'igstTotal', 'taxableTotal', 'totalAmount'];
    fields.forEach(field => {
      const value = res.data[field];
      assert(value !== undefined, `Field ${field} should exist`);
      // Value can be string or number after retrieval
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      assert(!isNaN(numValue), `Field ${field} should be numeric`);
    });
  });

  await test('Verify items array stored correctly', async () => {
    const res = await makeRequest('GET', `/api/quotations/${createdQuotationId}`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(Array.isArray(res.data.items), 'items should be an array');
    assert(res.data.items.length > 0, 'items should have at least one item');
    
    const item = res.data.items[0];
    assert(item.description, 'Item should have description');
    assert(item.quantity, 'Item should have quantity');
    assert(item.unit, 'Item should have unit');
    assert(item.rate, 'Item should have rate');
  });

  // ============================================================================
  // SECTION 6: QUOTATION DELETION
  // ============================================================================
  console.log('\n📋 SECTION 6: Quotation Deletion Tests\n');

  let deleteQuotationId = null;

  await test('Create quotation for deletion test', async () => {
    const payload = {
      customerId: customerId,
      quotationDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contactPerson: 'Delete Test',
      addressLine1: '999 Delete Lane',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      pincode: '411001',
      items: [{
        description: 'Delete Test',
        quantity: 1,
        unit: 'Unit',
        rate: '1000',
        cgst: '0',
        sgst: '0',
        igst: '0'
      }],
      subtotal: '1000',
      cgstTotal: '0',
      sgstTotal: '0',
      igstTotal: '0',
      taxableTotal: '1000',
      totalAmount: '1000',
      sameAsBilling: true
    };

    const res = await makeRequest('POST', '/api/quotations', payload);
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    deleteQuotationId = res.data.id;
  });

  await test('Delete quotation by ID', async () => {
    const res = await makeRequest('DELETE', `/api/quotations/${deleteQuotationId}`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  await test('Verify quotation deleted', async () => {
    const res = await makeRequest('GET', `/api/quotations/${deleteQuotationId}`);
    assert(res.status === 404, `Expected 404 after deletion, got ${res.status}`);
  });

  // ============================================================================
  // SECTION 7: PDF GENERATION
  // ============================================================================
  console.log('\n📋 SECTION 7: PDF Generation Tests\n');

  await test('Download quotation PDF', async () => {
    const res = await makeRequest('GET', `/api/quotations/${createdQuotationId}/download-pdf`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.headers['content-type']?.includes('application/pdf'), 'Should return PDF content type');
  });

  // ============================================================================
  // RESULTS
  // ============================================================================
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                       TEST RESULTS SUMMARY                         ║
╚════════════════════════════════════════════════════════════════════╝
  `);

  console.log(`
✅ Passed: ${testResults.passed}
❌ Failed: ${testResults.failed}
📊 Total:  ${testResults.passed + testResults.failed}
  `);

  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests.filter(t => t.status === 'FAIL').forEach(t => {
      console.log(`  - ${t.name}: ${t.error}`);
    });
  }

  console.log('\n');
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
