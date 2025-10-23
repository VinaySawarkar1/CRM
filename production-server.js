const express = require('express');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 80;

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

// Serve static files from the dist/public directory
app.use(express.static(path.join(__dirname, 'dist', 'public')));

// Handle client-side routing - serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log('🚀 Production server is running!');
    console.log(`📱 Local access: http://localhost:${PORT}`);
    console.log(`🌐 Network access: http://${localIP}:${PORT}`);
    console.log(`📊 Server running on all network interfaces (0.0.0.0:${PORT})`);
    console.log('\nTo access from other devices on your network:');
    console.log(`   http://${localIP}:${PORT}`);
    console.log('\nPress Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});
