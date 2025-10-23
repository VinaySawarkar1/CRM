const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting ngrok tunnel...');

// Start ngrok
const ngrok = spawn('ngrok', ['http', '8080'], {
    stdio: ['pipe', 'pipe', 'pipe']
});

let ngrokStarted = false;

ngrok.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(output);
    
    // Look for the public URL in the output
    const urlMatch = output.match(/https:\/\/[a-z0-9-]+\.ngrok\.io/);
    if (urlMatch && !ngrokStarted) {
        ngrokStarted = true;
        const publicUrl = urlMatch[0];
        console.log('\n🌐 PUBLIC ACCESS URL FOUND!');
        console.log('================================');
        console.log(`🌍 Global URL: ${publicUrl}`);
        console.log('================================');
        console.log('✅ Your website is now accessible from ANYWHERE!');
        console.log('📱 Share this URL with anyone to access your website');
        console.log('\nPress Ctrl+C to stop the tunnel');
    }
});

ngrok.stderr.on('data', (data) => {
    console.error('ngrok error:', data.toString());
});

ngrok.on('close', (code) => {
    console.log(`ngrok process exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping ngrok tunnel...');
    ngrok.kill();
    process.exit(0);
});




