const axios = require('axios');
const cheerio = require('cheerio');

const cache = new Map();

const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
};

async function getAllocineRating(title, year) {
    const cacheKey = `allocine_${title}_${year}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {
        const searchUrl = `https://www.allocine.fr/recherche/movie/?q=${encodeURIComponent(title)}`;
        const response = await axios.get(searchUrl, { headers: HEADERS, timeout: 5000 });
        const $ = cheerio.load(response.data);

        const firstResult = $('.meta-title-link').first();
        if (!firstResult.length) return { user: 'N/A', press: 'N/A' };

        const movieUrl = `https://www.allocine.fr${firstResult.attr('href')}`;
        const movieResponse = await axios.get(movieUrl, { headers: HEADERS, timeout: 5000 });
        const $movie = cheerio.load(movieResponse.data);

        let pressRating = 'N/A';
        let userRating = 'N/A';

        $movie('.rating-item').each((i, el) => {
            const label = $movie(el).find('.rating-title').text().trim();
            const value = $movie(el).find('.stareval-note').text().trim().replace(',', '.');
            if (label.includes('Presse')) pressRating = value;
            if (label.includes('Spectateurs')) userRating = value;
        });

        const result = { press: pressRating, user: userRating };
        cache.set(cacheKey, result);
        return result;
    } catch (e) {
        console.log(`Allocine Error (${title}): ${e.message}`);
        return { user: 'N/A', press: 'N/A' };
    }
}

async function getSensCritiqueRating(title, year) {
    const cacheKey = `senscritique_${title}_${year}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {
        const query = `
        query searchProducts($query: String!, $limit: Int) {
            searchProducts(query: $query, limit: $limit) {
                products {
                    id
                    title
                    rating
                    year
                    url
                }
            }
        }`;

        const response = await axios.post('https://www.senscritique.com/graphql', {
            query,
            variables: { query: title, limit: 1 }
        }, {
            headers: { 'User-Agent': HEADERS['User-Agent'] },
            timeout: 5000
        });

        if (response.data && response.data.data && response.data.data.searchProducts) {
            const products = response.data.data.searchProducts.products;
            if (products && products.length > 0) {
                const rating = products[0].rating || 'N/A';
                cache.set(cacheKey, rating);
                return rating;
            }
        }
        return 'N/A';
    } catch (e) {
        console.log(`SensCritique Error (${title}): ${e.message}`);
        return 'N/A';
    }
}

module.exports = { getAllocineRating, getSensCritiqueRating };
