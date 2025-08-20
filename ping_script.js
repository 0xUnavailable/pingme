const express = require('express');
const https = require('https');
const { URL } = require('url');

// Initialize Express app
const app = express();
const port = process.env.PORT;

// Get environment variables
const pingUrl = process.env.PING_URL;
const timerSeconds = parseInt(process.env.PING_TIMER);

function pingUrl(url) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname,
            method: 'GET'
        };

        const req = https.request(options, (res) => {
            console.log(`Ping to ${parsedUrl.hostname} - Status: ${res.statusCode}`);
            resolve({ status: res.statusCode, hostname: parsedUrl.hostname });
        });

        req.on('error', (e) => {
            console.error(`Error pinging ${url}: ${e.message}`);
            reject(e);
        });

        req.end();
    });
}

// Endpoint to trigger ping
app.get('/ping', async (req, res) => {
    console.log(`Waiting for ${timerSeconds} seconds before pinging ${pingUrl}`);
    await new Promise(resolve => setTimeout(resolve, timerSeconds * 1000));
    try {
        const result = await pingUrl(pingUrl);
        res.json({
            message: `Ping to ${result.hostname} successful`,
            status: result.statusCode
        });
    } catch (error) {
        res.status(500).json({
            message: `Ping to ${pingUrl} failed`,
            error: error.message
        });
    }
});

// Start server
app.listen(port, () => {
});