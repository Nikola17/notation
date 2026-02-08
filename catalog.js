const axios = require('axios');

const CINEMETA_URL = 'https://v3-cinemeta.strem.io';

async function getCatalog(type, id, baseUrl) {
    try {
        const cinemetaUrl = `${CINEMETA_URL}/catalog/${type}/top.json`;
        const response = await axios.get(cinemetaUrl);
        const metas = response.data.metas || [];

        return metas.map(meta => {
            const encodedTitle = encodeURIComponent(meta.name);
            const year = meta.year || (meta.releaseInfo ? meta.releaseInfo.substring(0, 4) : '0000');
            const imdbRating = meta.imdbRating || 'N/A';

            // Poster URL: /poster/:type/:id/:title/:year/:imdbRating/original_url.jpg
            const originalPoster = encodeURIComponent(meta.poster);
            const proxyPoster = `${baseUrl}/poster/${type}/${meta.id}/${encodedTitle}/${year}/${imdbRating}/${originalPoster}`;

            return {
                ...meta,
                poster: proxyPoster
            };
        });
    } catch (e) {
        console.error('Error fetching catalog:', e);
        return [];
    }
}

module.exports = { getCatalog };
