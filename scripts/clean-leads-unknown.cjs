#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'data', 'leads.json');
if (!fs.existsSync(file)) {
  console.error('leads.json not found at', file);
  process.exit(1);
}

const raw = fs.readFileSync(file, 'utf8');
let data;
try {
  data = JSON.parse(raw);
} catch (e) {
  console.error('Failed to parse leads.json:', e.message);
  process.exit(1);
}

if (!Array.isArray(data)) {
  console.error('leads.json is not an array');
  process.exit(1);
}

const original = data.length;
const filtered = data.filter((l) => String(l?.name || '').trim().toLowerCase() !== 'unknown');
const removed = original - filtered.length;

fs.writeFileSync(file, JSON.stringify(filtered, null, 2));
console.log(`Removed ${removed} Unknown leads. Kept ${filtered.length} total.`);

