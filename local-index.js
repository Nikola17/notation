const express = require('express');
const { addonBuilder } = require('stremio-addon-sdk');
const manifest = require('./manifest');
const { getCatalog } = require('./catalog');
const { getAllocineRating, getSensCritiqueRating } = require('./ratings');
const { generatePosterWithRatings } = require('./image');

const app = express();
const builder = new addonBuilder(manifest);

// Stremio Catalog Handler
builder.defineCatalogHandler(async (args) => {
    let baseUrl = process.env.BASE_URL;
    if (!baseUrl && process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
    }
    baseUrl = baseUrl || 'http://localhost:7000';

    const metas = await getCatalog(args.type, args.id, baseUrl);
    return { metas };
});

const addonInterface = builder.getInterface();

// Poster Proxy Route
// /poster/:type/:id/:title/:year/:imdbRating/:originalUrl
app.get('/poster/:type/:id/:title/:year/:imdbRating/:originalUrl', async (req, res) => {
    const { type, id, title, year, imdbRating, originalUrl } = req.params;
    const decodedUrl = decodeURIComponent(originalUrl);

    console.log(`Processing poster for: ${title} (${year}) - IMDB:${imdbRating}`);

    try {
        // Fetch remaining ratings concurrently
        const [allocine, senscritique] = await Promise.all([
            getAllocineRating(title, year),
            getSensCritiqueRating(title, year)
        ]);

        const ratings = {
            imdb: imdbRating,
            allocine: allocine || { user: 'N/A' },
            senscritique: senscritique || 'N/A'
        };

        const modifiedPoster = await generatePosterWithRatings(decodedUrl, ratings);

        res.set('Content-Type', 'image/jpeg');
        // Cache for 24 hours
        res.set('Cache-Control', 'public, max-age=86400');
        res.send(modifiedPoster);
    } catch (e) {
        console.error('Error in poster proxy:', e);
        res.redirect(decodedUrl);
    }
});

app.use(addonInterface.getRouter());

const PORT = process.env.PORT || 7000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Addon listening on http://localhost:${PORT}`);
        console.log(`Addon URL for Stremio: http://localhost:${PORT}/manifest.json`);
    });
}

module.exports = app;
