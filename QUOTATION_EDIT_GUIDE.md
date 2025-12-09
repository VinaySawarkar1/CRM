# Quotation Edit Functionality - Complete Guide

## Overview
When you click "Edit" on a quotation, all the original quotation data is loaded and displayed in the form, allowing you to modify any field and save the updated quotation.

## ✅ What Gets Loaded in Edit Mode

### 1. **Quotation Details**
- ✅ Quotation Number (auto-generated, displayed but not editable)
- ✅ Quotation Date
- ✅ Valid Until Date
- ✅ Reference

### 2. **Party Details (Customer Information)**
- ✅ Customer ID & Company Name
- ✅ Contact Person Title (Mr., Mrs., Ms.)
- ✅ Contact Person Full Name
- ✅ Sales Credit

### 3. **Address Information**
- ✅ Billing Address:
  - Address Line 1
  - Address Line 2
  - City
  - State
  - Country
  - Pincode
  
- ✅ Shipping Address:
  - All shipping address fields
  - "Same as Billing" checkbox auto-detected based on address values

### 4. **Line Items (Quotation Items)**
All quotation items are loaded with:
- ✅ Item Description
- ✅ HSN/SAC Code
- ✅ Quantity
- ✅ Unit
- ✅ Rate (₹)
- ✅ Discount & Discount Type
- ✅ GST Details (CGST, SGST, IGST)
- ✅ Taxable Amount
- ✅ Lead Time

### 5. **Terms & Conditions**
- ✅ All saved terms are loaded
- ✅ You can add/remove/modify terms

### 6. **Additional Charges & Discounts**
- ✅ Extra Charges (if any) are loaded
- ✅ Discount details are loaded
- ✅ Discount Type (Percentage or Amount)

### 7. **Financial Totals**
- ✅ Subtotal (auto-calculated based on items)
- ✅ CGST Total
- ✅ SGST Total
- ✅ IGST Total
- ✅ Taxable Total
- ✅ Total Amount

### 8. **Bank Details**
- ✅ Bank Name
- ✅ Branch
- ✅ Account Number
- ✅ IFSC Code

### 9. **Notes**
- ✅ Additional notes/comments

## 🔄 Data Flow in Edit Mode

```
1. User clicks "Edit" on quotation list
   ↓
2. Quotation ID is extracted from URL (/quotations/edit/{id})
   ↓
3. API call: GET /api/quotations/{id}
   ↓
4. Server returns complete quotation object with all fields
   ↓
5. quotation-form-page.tsx receives the quotation data
   ↓
6. Quotation data passed as defaultValues prop to QuotationForm component
   ↓
7. QuotationForm component loads data with useEffect hook:
   - Sets customer/lead if selected
   - Updates all form fields using setValue()
   - Updates component state (items, terms, discounts, etc.)
   - Sets quotationDataLoaded = true
   ↓
8. Green success banner shows: "✅ Quotation Data Loaded"
   - Shows quotation number
   - Shows quotation date
   - Shows contact person
   - Shows city
   - Shows item count
   - Shows terms count
   - Shows totals
   ↓
9. User can now edit any field
   ↓
10. User clicks "Save Quotation"
   ↓
11. Form validation runs
   ↓
12. API call: PUT /api/quotations/{id}
   ↓
13. Server updates quotation in database
   ↓
14. Success notification shown
   ↓
15. User redirected to quotation list
```

## 📋 Sections Displayed in Edit Mode

### ✅ **Basic Information**
- Customer search and selection
- Copy from (templates or previous quotations)
- Branch information

### ✅ **Party Details**
- Contact person title and name
- Customer company name
- Sales credit

### ✅ **Address Information**
- Billing address (5 fields)
- Shipping address (5 fields)
- Checkbox to use same address

### ✅ **Item List**
- Table displaying all quotation items
- Edit/Delete buttons for each item
- Add new items button

### ✅ **Terms & Conditions**
- TermsSelector component
- Add/remove terms functionality

### ✅ **Additional Charges & Discounts**
- Extra charges (with descriptions and amounts)
- Discounts (with descriptions and amounts)

### ✅ **Notes**
- Free-form notes field

### ✅ **Totals**
- Subtotal calculation
- GST breakdown (CGST, SGST, or IGST based on location)
- Total amount

### ✅ **Bank Details**
- Bank name, branch, account number, IFSC

## 🎯 How to Edit a Quotation

### Step 1: Navigate to Edit
```
1. Go to Quotations page
2. Find the quotation you want to edit
3. Click "Edit" button or icon
4. Wait for green success banner: "✅ Quotation Data Loaded"
```

### Step 2: Verify Data
The green banner at the top shows:
- Quotation number
- Date
- Contact person
- City
- Number of items
- Number of terms
- Totals (subtotal & total amount)

Example:
```
✅ Quotation Data Loaded
Quotation #: RX-VQ25-01-15-001
Date: 2025-01-15
Contact: John Smith
City: Mumbai
Items: 3 items
Terms: 2 terms
Total: ₹ 50,000.00
Subtotal: ₹ 45,000.00
```

### Step 3: Edit Fields
Make changes to any fields:
- Update party details
- Modify item quantities/rates
- Add/remove items
- Update terms
- Change totals (auto-calculated)

### Step 4: Save Changes
```
1. Review all changes
2. Click "Save Quotation" button
3. Wait for success notification
4. You'll be redirected to quotations list
```

## ✨ Key Features in Edit Mode

### Automatic Data Detection
- **Same Billing/Shipping Address**: Auto-detected based on address values
- **Item Count**: Displayed in success banner
- **Terms Count**: Displayed in success banner
- **Financial Totals**: Auto-calculated

### Validation
- All required fields are marked with red asterisk (*)
- Error messages show which fields need attention
- Form won't submit until all validations pass

### Smart Defaults
- If shipping address not provided, billing address is used
- GST calculation based on customer state
- Default tax rates applied

## 🔍 Troubleshooting

### Issue: Data not loading
**Solution**: 
- Check browser console for errors (F12 → Console tab)
- Ensure you have permission to edit quotations
- Verify quotation ID in URL is correct

### Issue: Changes not saving
**Solution**:
- Check for validation errors (red banner at top)
- Ensure all required fields are filled (marked with *)
- Check browser console for API errors

### Issue: Items not showing
**Solution**:
- Scroll down to "Item List" section
- Click "Add Item" to see the item editor
- Check that items were saved in original quotation

### Issue: Terms not loading
**Solution**:
- Scroll to "Terms & Conditions" section
- Click dropdown to see all available terms
- Previously saved terms should be checked

## 📊 Database Schema (What Gets Stored)

```typescript
{
  id: number,
  quotationNumber: string (UNIQUE),
  quotationDate: date,
  validUntil: date,
  reference: string,
  
  // Party details
  customerId: number (FK),
  leadId: number (FK),
  contactPersonTitle: string,
  contactPerson: string,
  customerCompany: string,
  
  // Billing address
  addressLine1: string,
  addressLine2: string,
  city: string,
  state: string,
  country: string,
  pincode: string,
  
  // Shipping address
  shippingAddressLine1: string,
  shippingAddressLine2: string,
  shippingCity: string,
  shippingState: string,
  shippingCountry: string,
  shippingPincode: string,
  
  // Items
  items: JSON (array of item objects),
  
  // Totals
  subtotal: decimal(10,2),
  cgstTotal: decimal(10,2),
  sgstTotal: decimal(10,2),
  igstTotal: decimal(10,2),
  taxableTotal: decimal(10,2),
  totalAmount: decimal(10,2),
  
  // Additional details
  terms: JSON (array of strings),
  notes: string,
  discount: decimal(10,2),
  discountType: enum (percentage, amount),
  extraCharges: JSON,
  discounts: JSON,
  bankDetails: JSON,
  
  // Metadata
  companyId: number,
  createdBy: number,
  createdAt: timestamp,
  updatedAt: timestamp,
  status: string
}
```

## 🔗 Related Files

| File | Purpose |
|------|---------|
| `client/src/pages/quotation-form-page.tsx` | Page component that loads quotation and passes to form |
| `client/src/components/quotations/quotation-form.tsx` | Main form component that displays all fields |
| `server/routes.ts` | API endpoints for GET/PUT quotations |
| `server/storage.ts` | Storage layer for quotation persistence |
| `shared/schema.ts` | Database schema and Zod validation |

## 🎓 Example: Edit Workflow

```
Scenario: Update quotation RX-VQ25-01-15-001

1. User navigates to /quotations/edit/5
2. Page shows loading indicator
3. API GET /api/quotations/5 returns:
   {
     id: 5,
     quotationNumber: "RX-VQ25-01-15-001",
     quotationDate: "2025-01-15",
     contactPerson: "John Smith",
     items: [
       { description: "Product A", quantity: 2, rate: 10000 },
       { description: "Product B", quantity: 1, rate: 15000 }
     ],
     terms: ["50% advance", "Net 30"],
     totalAmount: 50000,
     ...
   }

4. Form loads with all data
5. Green banner shows: "✅ Quotation Data Loaded"
6. User changes:
   - Product A quantity from 2 to 3
   - Adds a new term: "Free installation"
7. Form auto-calculates new total: ₹65000
8. User clicks "Save Quotation"
9. Form validates all fields
10. API PUT /api/quotations/5 with updated data
11. Success: "Quotation Updated"
12. Redirect to /quotations list
```

## 💡 Best Practices

1. **Verify all data is loaded** before making changes
2. **Check the green success banner** to confirm data loaded
3. **Review item calculations** especially for GST
4. **Use the same state/country** if address is the same
5. **Save frequently** to avoid losing work
6. **Check validation errors** (red banner) before submitting

## 🔐 Permissions

To edit a quotation, you need:
- Permission: `quotations:update`
- Or role: `admin` or `superuser`
- Quotation must belong to your company (company isolation enforced)

## 📞 Support

If you encounter issues:
1. Check browser console (F12 → Console)
2. Verify quotation data in database
3. Check API response in Network tab
4. Contact system administrator

---

**Last Updated**: January 15, 2025
**Version**: 1.0
