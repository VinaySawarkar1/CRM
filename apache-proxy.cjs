const http = require('http');
const httpProxy = require('http-proxy');
const os = require('os');

// Create a proxy server
const proxy = httpProxy.createProxyServer({});

// Get the local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Create HTTP server
const server = http.createServer((req, res) => {
    // Set CORS headers for global access
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // Proxy to the Node.js application
    proxy.web(req, res, {
        target: 'http://localhost:3001',
        changeOrigin: true
    });
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err);
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });
    res.end('Proxy Error: ' + err.message);
});

// Start server on port 8080 (no admin privileges required)
const PORT = 8080;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
    const localIP = getLocalIP();
    console.log('🌐 Apache-like Proxy Server Started!');
    console.log(`📱 Local access: http://localhost:${PORT}`);
    console.log(`🌍 Global access: http://${localIP}:${PORT}`);
    console.log(`📊 Server running on all network interfaces (0.0.0.0:${PORT})`);
    console.log('\n🔗 Access URLs:');
    console.log(`   Local:  http://localhost:${PORT}`);
    console.log(`   Global: http://${localIP}:${PORT}`);
    console.log('\nPress Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down proxy server...');
    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down proxy server...');
    server.close(() => {
        process.exit(0);
    });
});
