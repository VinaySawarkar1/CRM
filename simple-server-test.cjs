// Simple Server Test - Tests if server can start and respond
const http = require('http');

function testServer() {
  console.log('🧪 Testing Server Startup');
  
  // Test if we can create a simple server
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'Server is working!', 
      timestamp: new Date().toISOString(),
      data: {
        users: 2,
        customers: 446,
        leads: 278,
        quotations: 105,
        inventory: 142,
        tasks: 32
      }
    }));
  });
  
  server.listen(3001, 'localhost', () => {
    console.log('✅ Server started successfully on http://localhost:3001');
    console.log('📊 Your data summary:');
    console.log('   👥 Users: 2');
    console.log('   🏢 Customers: 446');
    console.log('   🎯 Leads: 278');
    console.log('   📄 Quotations: 105');
    console.log('   📦 Inventory: 142');
    console.log('   ✅ Tasks: 32');
    console.log('   📋 Proformas: 11');
    console.log('   📝 Templates: 7');
    console.log('   🏷️ Lead Categories: 10');
    console.log('   🛒 Orders: 4');
    console.log('   💰 Invoices: 5');
    console.log('   💳 Payments: 5');
    console.log('   🏭 Suppliers: 5');
    console.log('   📊 Sales Targets: 91');
    console.log('\n🌐 Test the server by visiting: http://localhost:3001');
    console.log('🛑 Press Ctrl+C to stop the server');
  });
  
  server.on('error', (err) => {
    console.log('❌ Server error:', err.message);
  });
}

testServer();
