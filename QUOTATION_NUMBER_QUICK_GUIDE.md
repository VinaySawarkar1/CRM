# Quotation Number Validation - Quick Start Guide

## What's New?

✅ **Automatic Uniqueness Check** - Form automatically validates quotation numbers
✅ **Real-time Feedback** - Shows validation status as you type
✅ **Smart Suggestions** - Offers alternative unique numbers automatically
✅ **Prevents Duplicates** - Won't save if number already exists
✅ **Easy Auto-Apply** - Click button to use suggested number instantly

## User Interface

### When Quotation Number is UNIQUE ✅
```
┌─────────────────────────────────────────────┐
│ Quotation No.  *                            │
├─────────────────────────────────────────────┤
│ [RX-VQ25-12-10-1000                     ]  │  ← Green border
├─────────────────────────────────────────────┤
│ ✅ Quotation number is unique!              │  ← Green text
└─────────────────────────────────────────────┘
```

### When Quotation Number is DUPLICATE ❌
```
┌─────────────────────────────────────────────┐
│ Quotation No.  *                            │
├─────────────────────────────────────────────┤
│ [RX-VQ25-12-10-1000                     ]  │  ← Red border
├─────────────────────────────────────────────┤
│ ❌ This quotation number already exists!     │
│    [Use RX-VQ25-12-10-1001]  ← Click button│
└─────────────────────────────────────────────┘
```

### During Validation
```
┌─────────────────────────────────────────────┐
│ Quotation No.  *                            │
├─────────────────────────────────────────────┤
│ [RX-VQ25-12-10-1000                     ]  │  ← Normal border
├─────────────────────────────────────────────┤
│ (No message - still checking)                │
└─────────────────────────────────────────────┘
```

## Workflow

### Creating New Quotation

```
Start Form
    ↓
Default number generated
    ↓
Number validates (800ms delay)
    ↓
❓ Is it unique?
    ├─→ YES → ✅ Green feedback
    │          ↓
    │      User can save
    │
    └─→ NO → ❌ Red feedback
                ↓
            Show suggestion
                ↓
            User choices:
            ├─→ Click "Use suggested"
            │   ↓
            │   Auto-apply new number
            │   ↓
            │   Shows ✅
            │
            └─→ Manual change
                ↓
                Re-validates
```

### Editing Existing Quotation

```
Open existing quotation
    ↓
Current number loaded (doesn't flag as duplicate)
    ↓
User changes number
    ↓
New number validates (excludes current ID)
    ↓
❓ Is it unique among others?
    ├─→ YES → ✅ Can save with new number
    └─→ NO → ❌ Can't save (gets suggestion)
```

### Submission Flow

```
User clicks "Save"
    ↓
Check: Is quotation number unique?
    ├─→ YES → ✅ Submit form
    └─→ NO → ❌ Block submission
              Show error message
              Prevent save
```

## Key Features

### 1. Real-time Validation
- Validates as you type (800ms after stopping)
- No manual "Check" button needed
- Immediate visual feedback

### 2. Smart Suggestions
- Automatically generates next unique number
- Click button to apply instantly
- Formatted correctly: RX-VQ25-12-10-1001

### 3. Company Isolation
- Only checks within your company
- Multi-tenant support
- Secure validation

### 4. Edit Mode Support
- When editing, allows keeping same number
- Validates against OTHER quotations
- Prevents changing to duplicate numbers

## Error Handling

### Cannot Save - Duplicate Number
```
❌ Error Message:
"The quotation number 'RX-VQ25-12-10-1000' 
 already exists. Please use a different number 
 or click the suggestion."
```

### What to Do
1. Click the suggested number button, OR
2. Manually enter different number, OR
3. Change quotation date (affects number)

## Technical Details

### Validation Timing
- **Debounce:** 800ms (prevents too many API calls)
- **Trigger:** When quotation number field changes
- **Scope:** Only validates existing numbers (performance)

### Auto-Generated Numbers
Format: `RX-VQ{YY}-{MM}-{DD}-{NNNN}`
- YY = Year (last 2 digits)
- MM = Month (01-12)
- DD = Day (01-31)
- NNNN = Sequence starting from 1000

Example: `RX-VQ25-12-10-1000`

### API Response Time
- Typical: < 100ms
- Includes: Check uniqueness + suggest alternative
- Cached: Within same session

## Troubleshooting

### "Can't save quotation"
1. Check error message
2. Use suggested number if available
3. Change number and try again
4. Contact support if issue persists

### "Suggested number not working"
1. Click the suggestion button
2. Verify number changed in input field
3. Try again

### "Says duplicate but it doesn't exist"
1. Try refreshing page
2. Check if another user created it
3. Try different number
4. Contact support

## Tips & Tricks

✅ **Pro Tip 1:** Click suggested number immediately after it appears
✅ **Pro Tip 2:** Press Tab to move to next field (validation triggers)
✅ **Pro Tip 3:** Change quotation date to get different sequence
✅ **Pro Tip 4:** Editing existing? Keep number or change it - both work!

## Console Logs (For Developers)

When working with forms, check console for:
```
🔍 Checking quotation number: RX-VQ25-12-10-1000
📊 Quotation number check result: {isDuplicate: false, isValid: true, ...}
❌ Quotation number is duplicate, blocking submission
✅ Quotation form fully populated with defaultValues ID: 8
```

## Summary

| Action | Before | After |
|--------|--------|-------|
| Create quotation | Manual number entry | Auto-generated + validated |
| Duplicate number | Saves (conflicts!) | Blocked + suggestion |
| Validation | Manual check | Real-time automatic |
| Edit quotation | Allow any number | Check uniqueness |
| Error recovery | User confused | Clear suggestion |

**Result:** Quotations always have unique, valid numbers! ✨
