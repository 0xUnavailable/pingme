const express = require('express');
const https = require('https');
const { URL } = require('url');
require('dotenv').config();

// Initialize Express app
const app = express();
const port = process.env.PORT;

// Get environment variables
const pingUrl = process.env.PING_URL;
const timerSeconds = parseInt(process.env.PING_TIMER);

function ping(url) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname,
            method: 'GET'
        };

        const req = https.request(options, (res) => {
            resolve({ status: res.statusCode, hostname: parsedUrl.hostname });
        });

        req.on('error', (e) => {
            console.error(`Error pinging ${url}: ${e.message}`);
            reject(e);
        });

        req.end();
    });
}

// Function to continuously ping at intervals
async function continuousPing() {
    while (true) {
        console.log(`Waiting for ${timerSeconds} seconds before pinging ${pingUrl}`);
        await new Promise(resolve => setTimeout(resolve, timerSeconds * 1000));
        try {
            const result = await ping(pingUrl);
            console.log(`Ping successful - Status: ${result.statusCode}`);
        } catch (error) {
            console.error(`Ping failed: ${error.message}`);
        }
    }
}

// Endpoint to trigger a single ping
app.get('/ping', async (req, res) => {
    await new Promise(resolve => setTimeout(resolve, timerSeconds * 1000));
    try {
        const result = await ping(pingUrl);
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

// Start continuous ping when server starts
continuousPing().catch(err => console.error('Continuous ping error:', err));

// Start server
app.listen(port, () => {
});