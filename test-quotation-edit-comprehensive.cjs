#!/usr/bin/env node

/**
 * Comprehensive Test Script for Quotation Edit Functionality
 * This script tests the complete quotation edit workflow:
 * 1. Creating a quotation
 * 2. Loading it for editing
 * 3. Modifying data
 * 4. Saving changes
 * 5. Verifying the changes persist
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const isHttps = BASE_URL.startsWith('https');
const httpModule = isHttps ? https : http;

class QuotationEditTest {
  constructor() {
    this.testResults = [];
    this.createdQuotationId = null;
    this.originalQuotationData = null;
    this.sessionId = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': 'ℹ️',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'test': '🧪'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  addResult(testName, passed, details = '') {
    this.testResults.push({ testName, passed, details });
    this.log(`${testName}: ${passed ? 'PASSED' : 'FAILED'} ${details}`, passed ? 'success' : 'error');
  }

  makeRequest(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, BASE_URL);
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'connect.sid=' + (this.sessionId || ''),
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
  
  async authenticate() {
    this.log('Authenticating...', 'info');
    
    const res = await this.makeRequest('POST', '/api/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    if (res.status === 200 || res.status === 302) {
      // Extract session ID from response headers
      const setCookie = res.headers['set-cookie'];
      if (setCookie) {
        this.sessionId = setCookie[0]?.split(';')[0]?.split('=')[1];
        this.log('Authentication successful', 'success');
        return true;
      }
    }
    
    this.log('Authentication failed', 'error');
    return false;
  }

  async createTestQuotation() {
    this.log('Creating test quotation...', 'test');
    
    const quotationData = {
      quotationNumber: `TEST-EDIT-${Date.now()}`,
      quotationDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contactPerson: 'Test Contact Person',
      customerCompany: 'Test Customer Company',
      addressLine1: '123 Test Street',
      addressLine2: 'Test Building',
      city: 'Test City',
      state: 'Maharashtra',
      country: 'India',
      pincode: '411001',
      items: [
        {
          description: 'Test Product 1',
          hsnSac: '1234',
          quantity: 2,
          unit: 'no.s',
          rate: '1000',
          discount: '100',
          discountType: 'amount',
          leadTime: '7 days'
        },
        {
          description: 'Test Product 2',
          hsnSac: '5678',
          quantity: 1,
          unit: 'no.s',
          rate: '2500',
          discount: '0',
          discountType: 'amount',
          leadTime: '14 days'
        }
      ],
      terms: 'Test term 1\nTest term 2',
      notes: 'This is a test quotation for edit functionality testing',
      extraCharges: [
        {
          description: 'Test Charge',
          amount: '500'
        }
      ],
      discounts: [
        {
          description: 'Test Discount',
          amount: '200'
        }
      ],
      discount: '50',
      discountType: 'amount',
      subtotal: '3500',
      cgstTotal: '630',
      sgstTotal: '630',
      igstTotal: '0',
      taxableTotal: '3500',
      totalAmount: '4260'
    };

    const result = await this.makeRequest('POST', '/api/quotations', quotationData);

    if (result.status === 201 && result.data) {
      this.createdQuotationId = result.data.id;
      this.originalQuotationData = { ...quotationData, id: result.data.id };
      this.addResult('Create Test Quotation', true, `ID: ${this.createdQuotationId}`);
      return true;
    } else {
      this.addResult('Create Test Quotation', false, `Status: ${result.status}, Error: ${JSON.stringify(result.data)}`);
      return false;
    }
  }

  async verifyQuotationData(id, expectedData, testName) {
    this.log(`Verifying quotation data for ID: ${id}`, 'test');
    
    const result = await this.makeRequest('GET', `/api/quotations/${id}`);
    
    if (result.status !== 200) {
      this.addResult(testName, false, `Failed to fetch quotation: Status ${result.status}`);
      return false;
    }

    const quotation = result.data;
    let allFieldsMatch = true;
    const mismatches = [];

    // Check basic fields
    const basicFields = ['quotationNumber', 'contactPerson', 'customerCompany', 'addressLine1', 'city', 'state', 'country', 'pincode'];
    
    basicFields.forEach(field => {
      if (quotation[field] !== expectedData[field]) {
        allFieldsMatch = false;
        mismatches.push(`${field}: expected "${expectedData[field]}", got "${quotation[field]}"`);
      }
    });

    // Check items
    if (quotation.items?.length !== expectedData.items?.length) {
      allFieldsMatch = false;
      mismatches.push(`items length: expected ${expectedData.items?.length}, got ${quotation.items?.length}`);
    } else {
      quotation.items?.forEach((item, index) => {
        const expectedItem = expectedData.items[index];
        if (!expectedItem) return;
        
        const itemFields = ['description', 'quantity', 'rate', 'unit'];
        itemFields.forEach(field => {
          if (String(item[field]) !== String(expectedItem[field])) {
            allFieldsMatch = false;
            mismatches.push(`item ${index} ${field}: expected "${expectedItem[field]}", got "${item[field]}"`);
          }
        });
      });
    }

    // Check terms
    if (Array.isArray(quotation.terms) && Array.isArray(expectedData.terms)) {
      if (quotation.terms.length !== expectedData.terms.length) {
        allFieldsMatch = false;
        mismatches.push(`terms length: expected ${expectedData.terms.length}, got ${quotation.terms.length}`);
      }
    }

    // Check notes
    if (quotation.notes !== expectedData.notes) {
      allFieldsMatch = false;
      mismatches.push(`notes: expected "${expectedData.notes}", got "${quotation.notes}"`);
    }

    const resultDetails = allFieldsMatch ? 'All fields match' : `Mismatches: ${mismatches.join('; ')}`;
    this.addResult(testName, allFieldsMatch, resultDetails);
    
    return allFieldsMatch;
  }

  async testEditFunctionality() {
    this.log('Testing quotation edit functionality...', 'test');
    
    if (!this.createdQuotationId) {
      this.addResult('Edit Functionality Test', false, 'No quotation created to edit');
      return false;
    }

    // Step 1: Load quotation for editing (simulate GET /quotations/:id)
    this.log('Step 1: Loading quotation for editing...', 'info');
    const loadResult = await this.makeRequest('GET', `/api/quotations/${this.createdQuotationId}`);
    
    if (loadResult.status !== 200) {
      this.addResult('Load Quotation for Edit', false, `Status: ${loadResult.status}`);
      return false;
    }

    const loadedQuotation = loadResult.data;
    this.addResult('Load Quotation for Edit', true, `Loaded quotation ${this.createdQuotationId}`);

    // Step 2: Modify the quotation data
    this.log('Step 2: Modifying quotation data...', 'info');
    const modifiedData = {
      ...loadedQuotation,
      contactPerson: 'Modified Contact Person',
      customerCompany: 'Modified Customer Company',
      addressLine1: '456 Modified Street',
      city: 'Modified City',
      notes: 'This quotation has been modified during testing',
      items: loadedQuotation.items?.map((item, index) => {
        if (index === 0) {
          return {
            ...item,
            description: 'Modified Product 1',
            quantity: 3,
            rate: '1200'
          };
        }
        return item;
      }) || [],
      terms: 'Modified term 1\nModified term 2\nAdded new term'
    };

    // Remove fields that shouldn't be in the request
    delete modifiedData.id;
    delete modifiedData.createdAt;
    delete modifiedData.updatedAt;

    // Step 3: Save the modified quotation (simulate PUT /quotations/:id)
    this.log('Step 3: Saving modified quotation...', 'info');
    const saveResult = await this.makeRequest('PUT', `/api/quotations/${this.createdQuotationId}`, modifiedData);

    if (saveResult.status !== 200) {
      this.addResult('Save Modified Quotation', false, `Status: ${saveResult.status}`);
      return false;
    }

    this.addResult('Save Modified Quotation', true, 'Quotation saved successfully');

    // Step 4: Verify the changes persisted
    this.log('Step 4: Verifying changes persisted...', 'info');
    
    // Create expected data for verification
    const expectedData = {
      ...modifiedData,
      id: this.createdQuotationId
    };

    const verifyResult = await this.verifyQuotationData(this.createdQuotationId, expectedData, 'Verify Modified Data Persisted');
    
    return verifyResult;
  }

  async testFormPopulation() {
    this.log('Testing form data population...', 'test');
    
    if (!this.createdQuotationId) {
      this.addResult('Form Population Test', false, 'No quotation created to test');
      return false;
    }

    // Load the quotation
    const result = await this.makeRequest('GET', `/api/quotations/${this.createdQuotationId}`);
    
    if (result.status !== 200) {
      this.addResult('Form Population Test', false, `Failed to load quotation: Status ${result.status}`);
      return false;
    }

    const quotation = result.data;
    
    // Check if all required fields are present for form population
    const requiredFields = [
      'quotationNumber', 'quotationDate', 'validUntil', 'contactPerson',
      'customerCompany', 'addressLine1', 'city', 'state', 'country', 'pincode'
    ];

    let allRequiredFieldsPresent = true;
    const missingFields = [];

    requiredFields.forEach(field => {
      if (!quotation[field] && quotation[field] !== 0) {
        allRequiredFieldsPresent = false;
        missingFields.push(field);
      }
    });

    // Check if items are properly formatted
    let itemsProperlyFormatted = true;
    if (quotation.items && Array.isArray(quotation.items)) {
      quotation.items.forEach((item, index) => {
        const requiredItemFields = ['description', 'quantity', 'rate', 'unit'];
        requiredItemFields.forEach(field => {
          if (!item[field] && item[field] !== 0) {
            itemsProperlyFormatted = false;
            this.log(`Item ${index} missing field: ${field}`, 'warning');
          }
        });
      });
    } else {
      itemsProperlyFormatted = false;
      this.log('Items not properly formatted', 'warning');
    }

    const formPopulationResult = allRequiredFieldsPresent && itemsProperlyFormatted;
    const details = formPopulationResult 
      ? 'All required fields present for form population'
      : `Missing fields: ${missingFields.join(', ')}`;

    this.addResult('Form Data Population', formPopulationResult, details);
    return formPopulationResult;
  }

  async runAllTests() {
    this.log('Starting Comprehensive Quotation Edit Tests', 'test');
    this.log('================================================', 'test');

    try {
      // Step 0: Authenticate first
      const authSuccess = await this.authenticate();
      if (!authSuccess) {
        this.addResult('Authentication', false, 'Failed to authenticate with server');
        throw new Error('Authentication failed - cannot proceed with tests');
      }
      this.addResult('Authentication', true, 'Successfully authenticated');

      // Test 1: Create test quotation
      const createSuccess = await this.createTestQuotation();
      if (!createSuccess) {
        throw new Error('Failed to create test quotation');
      }

      // Test 2: Verify original data
      await this.verifyQuotationData(this.createdQuotationId, this.originalQuotationData, 'Verify Original Data');

      // Test 3: Test form population
      await this.testFormPopulation();

      // Test 4: Test edit functionality
      await this.testEditFunctionality();

      // Test 5: Clean up - delete test quotation
      if (this.createdQuotationId) {
        this.log('Cleaning up test quotation...', 'info');
        await this.makeRequest('DELETE', `/api/quotations/${this.createdQuotationId}`);
        this.log('Test quotation deleted', 'success');
      }

    } catch (error) {
      this.log(`Test execution failed: ${error.message}`, 'error');
    }

    this.printSummary();
  }

  printSummary() {
    this.log('================================================', 'test');
    this.log('TEST SUMMARY', 'test');
    this.log('================================================', 'test');

    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;

    this.log(`Total Tests: ${total}`, 'test');
    this.log(`Passed: ${passed}`, 'success');
    this.log(`Failed: ${total - passed}`, 'error');
    this.log(`Success Rate: ${total > 0 ? Math.round((passed / total) * 100) : 0}%`, total > 0 ? (passed > 0 ? 'success' : 'error') : 'info');

    if (total - passed > 0) {
      this.log('\nFailed Tests:', 'error');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => this.log(`❌ ${r.testName}: ${r.details}`, 'error'));
    }

    this.log('\nDetailed Results:', 'test');
    this.testResults.forEach(r => {
      const icon = r.passed ? '✅' : '❌';
      this.log(`${icon} ${r.testName}: ${r.details}`, r.passed ? 'success' : 'error');
    });
  }
}

// Run the tests
const tester = new QuotationEditTest();
tester.runAllTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});