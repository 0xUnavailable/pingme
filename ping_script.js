const https = require('https');
const { URL } = require('url');

// Get environment variables
const pingUrl = process.env.PING_URL;
const timerSeconds = parseInt(process.env.PING_TIMER) || 60;

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
            resolve(res.statusCode);
        });

        req.on('error', (e) => {
            console.error(`Error pinging ${url}: ${e.message}`);
            reject(e);
        });

        req.end();
    });
}

async function main() {
    console.log(`Waiting for ${timerSeconds} seconds before pinging ${pingUrl}`);
    await new Promise(resolve => setTimeout(resolve, timerSeconds * 1000));
    try {
        await pingUrl(pingUrl);
    } catch (error) {
        console.error('Ping failed:', error.message);
    }
}

main();