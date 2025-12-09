# Quotation System Test Guide

## Overview
Complete testing guide for all quotation functionalities including API endpoints, database storage, PDF generation, and UI interactions.

## Prerequisites
1. Application running on http://localhost:5000
2. User logged in (admin/admin123 for development)
3. PostgreSQL/MongoDB database initialized
4. Test data created (customers, leads, inventory)

---

## 1. Quotation CRUD Operations

### 1.1 Create Quotation (POST /api/quotations)

**Test Case**: Create a new quotation
```
Method: POST
Endpoint: /api/quotations
Auth: Required
```

**Request Body**:
```json
{
  "quotationNumber": "RX-VQ25-01-15-001",
  "customerId": 1,
  "leadId": 1,
  "quotationDate": "2025-01-15",
  "validUntil": "2025-02-14",
  "contactPerson": "John Smith",
  "contactPersonTitle": "Mr.",
  "customerCompany": "ABC Corporation",
  "addressLine1": "123 Main Street",
  "addressLine2": "Suite 100",
  "city": "Pune",
  "state": "Maharashtra",
  "country": "India",
  "pincode": "411001",
  "shippingAddressLine1": "456 Shipping Lane",
  "shippingCity": "Pune",
  "shippingState": "Maharashtra",
  "shippingCountry": "India",
  "shippingPincode": "411002",
  "items": [
    {
      "description": "Software Development",
      "hsnSac": "9989",
      "quantity": 1,
      "unit": "Service",
      "rate": "50000",
      "discount": "0",
      "discountType": "amount",
      "cgst": "9",
      "sgst": "9",
      "igst": "0"
    }
  ],
  "subtotal": "50000",
  "cgstTotal": "4500",
  "sgstTotal": "4500",
  "igstTotal": "0",
  "taxableTotal": "50000",
  "totalAmount": "59000",
  "terms": ["Payment Terms: 50% Advance, 50% on delivery"],
  "status": "draft",
  "sameAsBilling": true
}
```

**Expected Response**:
- Status: 201 Created
- Returns quotation with auto-generated `id`
- `quotationNumber` follows pattern: `RX-VQ25-MM-DD-###`

**Issues to Check**:
- ✅ quotationNumber is unique and follows correct format
- ✅ All decimal fields stored as decimal(10,2)
- ✅ Items array properly stored as JSON
- ✅ companyId automatically set from user context
- ✅ createdAt timestamp set to current time
- ✅ status defaults to "draft" if not provided

---

### 1.2 List Quotations (GET /api/quotations)

**Test Case**: Retrieve all quotations for user's company
```
Method: GET
Endpoint: /api/quotations
Auth: Required
```

**Expected Response**:
- Status: 200 OK
- Returns array of quotations
- Filtered by user's company (superuser sees all)
- Each quotation includes all fields

**Issues to Check**:
- ✅ Only quotations from user's company returned (non-superuser)
- ✅ Superuser sees all quotations
- ✅ Empty array if no quotations exist

---

### 1.3 Get Single Quotation (GET /api/quotations/:id)

**Test Case 1**: Get by numeric ID
```
Method: GET
Endpoint: /api/quotations/1
Auth: Required
```

**Test Case 2**: Get by quotationNumber
```
Method: GET
Endpoint: /api/quotations/RX-VQ25-01-15-001
Auth: Required
```

**Expected Response**:
- Status: 200 OK
- Returns single quotation object
- All data types correct (numbers, arrays, dates)

**Issues to Check**:
- ✅ Can fetch by numeric ID
- ✅ Can fetch by quotationNumber string
- ✅ Correctly retrieves items array
- ✅ Returns 404 if not found
- ✅ Returns 403 if quotation belongs to different company

---

### 1.4 Update Quotation (PUT /api/quotations/:id)

**Test Case**: Update quotation details
```
Method: PUT
Endpoint: /api/quotations/1
Auth: Required
```

**Request Body** (partial update):
```json
{
  "contactPerson": "Jane Doe",
  "totalAmount": "65000",
  "status": "sent"
}
```

**Expected Response**:
- Status: 200 OK
- Returns updated quotation
- Only sent fields are updated
- createdAt remains unchanged

**Issues to Check**:
- ✅ Partial updates work correctly
- ✅ Non-sent fields preserve old values
- ✅ createdAt not changed during update
- ✅ updatedAt timestamp updated
- ✅ Cannot change companyId
- ✅ Quotation number remains unique

---

### 1.5 Delete Quotation (DELETE /api/quotations/:id)

**Test Case**: Delete a quotation
```
Method: DELETE
Endpoint: /api/quotations/1
Auth: Required
```

**Expected Response**:
- Status: 200 OK
- Message: "Quotation deleted successfully"

**Issues to Check**:
- ✅ Quotation completely removed from database
- ✅ Returns 404 if not found
- ✅ Returns 403 if quotation belongs to different company
- ✅ Handles both numeric and string IDs

---

## 2. Database Storage Tests

### 2.1 Data Type Validation

**Check all fields are stored with correct types**:

| Field | Expected Type | Database Type | Sample Value |
|-------|---------------|---------------|--------------|
| id | number | bigint | 1 |
| quotationNumber | string | text | "RX-VQ25-01-15-001" |
| customerId | number | bigint | 1 |
| leadId | number | bigint | 1 |
| quotationDate | string | date | "2025-01-15" |
| validUntil | string | date | "2025-02-14" |
| items | array | json | [...] |
| subtotal | number | decimal | 50000.00 |
| cgstTotal | number | decimal | 4500.00 |
| sgstTotal | number | decimal | 4500.00 |
| igstTotal | number | decimal | 0.00 |
| taxableTotal | number | decimal | 50000.00 |
| totalAmount | number | decimal | 59000.00 |
| status | string | text | "draft" |
| createdAt | timestamp | timestamp | 2025-01-15T10:30:00Z |

### 2.2 Referential Integrity

**Test** (if enabled):
- customerId references customers.id
- leadId references leads.id
- companyId references companies.id
- createdBy references users.id (if applicable)

---

## 3. Quotation Number Generation

### 3.1 Format Validation

**Pattern**: `RX-VQ{YY}-{MM}-{DD}-{###}`
- `RX` = Prefix (Reckonix)
- `VQ` = Quotation indicator
- `YY` = Year (last 2 digits)
- `MM` = Month (01-12)
- `DD` = Day (01-31)
- `###` = Sequential number (000-999) per day

**Examples**:
```
RX-VQ25-01-15-001  (First quotation on Jan 15, 2025)
RX-VQ25-01-15-002  (Second quotation on Jan 15, 2025)
RX-VQ25-01-16-001  (First quotation on Jan 16, 2025)
```

### 3.2 Uniqueness Test

**Test Case**: Create 5 quotations and verify:
```javascript
// All should be unique
const numbers = [
  "RX-VQ25-01-15-001",
  "RX-VQ25-01-15-002",
  "RX-VQ25-01-15-003",
  "RX-VQ25-01-15-004",
  "RX-VQ25-01-15-005"
];
const unique = new Set(numbers).size === numbers.length;
// Should be true
```

**Test**: Create quotations on different days
```
Day 1 (Jan 15): RX-VQ25-01-15-001, RX-VQ25-01-15-002
Day 2 (Jan 16): RX-VQ25-01-16-001, RX-VQ25-01-16-002
```

---

## 4. Advanced Features

### 4.1 Generate PDF (GET /api/quotations/:id/download-pdf)

**Test Case**: Download quotation as PDF
```
Method: GET
Endpoint: /api/quotations/1/download-pdf
Auth: Required
```

**Expected Response**:
- Status: 200 OK
- Content-Type: application/pdf
- Content includes:
  - Quotation number
  - Customer details
  - Items table with HSN, Qty, Rate, Tax
  - Tax calculation summary
  - Total amount
  - Terms and conditions
  - Bank details

**Issues to Check**:
- ✅ PDF generated successfully
- ✅ All data displayed correctly
- ✅ Currency formatting (₹ for India)
- ✅ Tax calculations correct
- ✅ Bank details included
- ✅ PDF filename: quotation-{quotationNumber}.pdf

---

### 4.2 Generate Proforma Invoice (GET /api/quotations/:id/proforma-invoice)

**Test Case**: Create proforma invoice from quotation
```
Method: GET
Endpoint: /api/quotations/1/proforma-invoice
Auth: Required
```

**Expected Response**:
- Status: 200 OK
- PDF with "Proforma Invoice" header
- Same data as quotation PDF
- Filename: proforma-invoice-{quotationNumber}.pdf

---

### 4.3 Generate Delivery Challan (GET /api/quotations/:id/delivery-challan)

**Test Case**: Create delivery challan from quotation
```
Method: GET
Endpoint: /api/quotations/1/delivery-challan
Auth: Required
```

**Expected Response**:
- Status: 200 OK
- PDF with delivery challan format
- Includes shipping address
- Filename: delivery-challan-{quotationNumber}.pdf

---

### 4.4 Convert to Invoice (POST /api/quotations/:id/convert-to-invoice)

**Test Case**: Convert quotation to invoice
```
Method: POST
Endpoint: /api/quotations/1/convert-to-invoice
Auth: Required
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Quotation converted to invoice successfully",
  "invoice": {
    "id": 1,
    "invoiceNumber": "INV-{timestamp}",
    "customerId": 1,
    "items": [...],
    "totalAmount": "59000",
    "status": "pending"
  }
}
```

**Issues to Check**:
- ✅ Invoice created with correct data
- ✅ Invoice status is "pending"
- ✅ Tax amounts transferred correctly
- ✅ Customer linked in invoice

---

### 4.5 Convert to Order (POST /api/quotations/:id/convert-to-order)

**Test Case**: Convert quotation to order
```
Method: POST
Endpoint: /api/quotations/1/convert-to-order
Auth: Required
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Quotation converted to order successfully",
  "order": {
    "id": 1,
    "orderNumber": "ORD-{timestamp}",
    "customerId": 1,
    "items": [...],
    "totalAmount": "59000",
    "status": "processing"
  }
}
```

---

## 5. UI/Form Testing

### 5.1 Create New Quotation Form

**Test Steps**:
1. Navigate to /quotations/new
2. Fill in form fields:
   - Quotation number (auto-filled or manual)
   - Select customer
   - Fill contact person details
   - Enter billing & shipping addresses
   - Add items (at least 1)
   - Set dates
3. Click "Save"

**Issues to Check**:
- ✅ Auto-fills quotation number in correct format
- ✅ Customer dropdown shows all customers
- ✅ Address fields properly populated
- ✅ Items can be added/removed
- ✅ Tax calculations update when rate changes
- ✅ Form validation prevents submission with empty required fields
- ✅ Quotation saved to database
- ✅ Redirects to quotations list on success

---

### 5.2 Edit Quotation Form

**Test Steps**:
1. Navigate to /quotations/edit/1
2. Verify all fields populated with existing data
3. Modify fields
4. Click "Save"

**Issues to Check**:
- ✅ Form loads with all existing data
- ✅ Quotation number cannot be changed
- ✅ Items properly loaded with correct data types
- ✅ Dates in correct format
- ✅ bankDetails populated correctly
- ✅ discountType enum properly set
- ✅ Changes saved to database
- ✅ No data loss on edit

---

### 5.3 Quotations List View

**Test Steps**:
1. Navigate to /quotations
2. View list of all quotations

**Display Checks**:
- ✅ All quotations displayed
- ✅ Columns: Number, Customer, Date, Status, Amount
- ✅ Status badge styling (draft, sent, accepted, rejected)
- ✅ Actions: View, Edit, Delete, Download PDF
- ✅ Sorting by date, amount, status
- ✅ Search functionality works

---

## 6. Permission & Security Tests

### 6.1 Company Isolation

**Test**: User from Company A cannot see Company B quotations

```javascript
// Login as Company A user
GET /api/quotations
// Should return only Company A quotations

// Try to access Company B quotation directly
GET /api/quotations/999  // ID belongs to Company B
// Should return 403 Forbidden
```

### 6.2 Permission Checks

**Test Permission Keys**:
- `quotations:view` - Can list and view quotations
- `quotations:create` - Can create new quotations
- `quotations:update` - Can edit quotations
- `quotations:delete` - Can delete quotations

---

## 7. Error Handling Tests

### 7.1 Validation Errors

**Test**: Submit incomplete quotation
```
Missing required fields: contactPerson, addressLine1, items
Expected: 400 Bad Request with validation errors
```

### 7.2 Not Found Errors

```
GET /api/quotations/9999
Expected: 404 Not Found
```

### 7.3 Forbidden Errors

```
PUT /api/quotations/1 (belongs to Company B)
From Company A user
Expected: 403 Forbidden
```

### 7.4 Conflict Errors

**Test**: Duplicate quotation number
```
POST /api/quotations with existing quotationNumber
Expected: 400 Validation Error (unique constraint)
```

---

## 8. Performance Tests

### 8.1 List Performance

**Test**: Retrieve 1000+ quotations
```
GET /api/quotations?limit=50&offset=0
Time: Should respond < 1 second
```

### 8.2 PDF Generation

**Test**: Generate PDF for quotation with 50 items
```
GET /api/quotations/1/download-pdf
Time: Should complete < 5 seconds
```

---

## 9. Integration Tests

### 9.1 Lead to Quotation

**Test**: Create quotation from lead
```
1. Navigate to Lead detail
2. Click "Create Quotation"
3. Form pre-fills with lead data
4. Save quotation
Expected: Quotation created with leadId linked
```

### 9.2 Customer to Quotation

**Test**: Create quotation from customer
```
1. Navigate to Customer detail
2. Click "Create Quotation"
3. Form pre-fills with customer data
4. Save quotation
Expected: Quotation created with customerId linked
```

---

## 10. Data Integrity Tests

### 10.1 Items Calculation

**Test**: Verify item amount calculation
```
Item:
- Quantity: 10
- Rate: 1000
- Discount: 10% (percentage)
- CGST: 9%
- SGST: 9%

Expected Calculation:
- Gross Amount: 10 × 1000 = 10,000
- Discount: 10,000 × 10% = 1,000
- Taxable Amount: 10,000 - 1,000 = 9,000
- CGST: 9,000 × 9% = 810
- SGST: 9,000 × 9% = 810
- Total: 9,000 + 810 + 810 = 10,620
```

### 10.2 Totals Calculation

**Test**: Verify quotation total calculation
```
Sum of all item amounts + extra charges - discounts = Total
```

---

## 11. Test SQL Queries

### 11.1 Verify Database Schema
```sql
SELECT * FROM quotations LIMIT 1;
-- Check all columns exist with correct types
```

### 11.2 Check Unique Constraint
```sql
SELECT quotation_number, COUNT(*) 
FROM quotations 
GROUP BY quotation_number 
HAVING COUNT(*) > 1;
-- Should return no rows
```

### 11.3 Check Foreign Keys
```sql
SELECT q.* FROM quotations q
WHERE q.customer_id IS NOT NULL
AND q.customer_id NOT IN (SELECT id FROM customers);
-- Should return no rows
```

---

## Test Result Summary Template

```
Date: _______________
Tester: _______________
Environment: _______________

✅ CRUD Operations
  ✓ Create Quotation
  ✓ Read Quotation
  ✓ Update Quotation
  ✓ Delete Quotation
  ✓ List Quotations

✅ Database Storage
  ✓ All data types correct
  ✓ Referential integrity
  ✓ Unique constraints

✅ Quotation Number Generation
  ✓ Format correct
  ✓ Sequential per day
  ✓ Unique values

✅ Advanced Features
  ✓ PDF Generation
  ✓ Proforma Invoice
  ✓ Convert to Invoice
  ✓ Convert to Order

✅ UI Forms
  ✓ Create Form
  ✓ Edit Form
  ✓ List View

✅ Security
  ✓ Company isolation
  ✓ Permissions checked

✅ Error Handling
  ✓ Validation errors
  ✓ 404 errors
  ✓ 403 errors

Issues Found: _______________
```

