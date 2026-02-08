const results = {};

function safeRequire(name) {
    try {
        const mod = require(name);
        results[name] = 'OK';
        return mod;
    } catch (e) {
        results[name] = `ERROR: ${e.message}`;
        return null;
    }
}

const express = safeRequire('express');
const sdk = safeRequire('stremio-addon-sdk');
const axios = safeRequire('axios');
const cheerio = safeRequire('cheerio');

module.exports = (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    let sdkStatus = 'Not loaded';
    if (sdk && sdk.addonBuilder) {
        try {
            const builder = new sdk.addonBuilder({ id: 'test', version: '1.0.0', name: 'test' });
            sdkStatus = 'Builder OK';
        } catch (e) {
            sdkStatus = `Builder ERROR: ${e.message}`;
        }
    }

    res.end(JSON.stringify({
        status: 'debug-root',
        node: process.version,
        results,
        sdkStatus,
        url: req.url,
        env: {
            NODE_ENV: process.env.NODE_ENV,
            VERCEL_URL: process.env.VERCEL_URL
        }
    }));
};
