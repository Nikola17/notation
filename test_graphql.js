const axios = require('axios');

async function testSensCritique() {
    console.log('--- Testing SensCritique GraphQL ---');
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
            variables: { query: 'Inception', limit: 1 }
        }, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        console.log('SensCritique Response:', JSON.stringify(response.data, null, 2));
    } catch (e) {
        console.log('SensCritique Error:', e.message);
    }
}

async function testAllocine() {
    console.log('\n--- Testing Allocine Mobile API ---');
    try {
        const url = `https://api.allocine.fr/rest/v3/search?partner=100043125232&q=Inception&format=json`;
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 11; Pixel 5 Build/RD2A.211001.002)' }
        });
        console.log('Allocine Response Title:', response.data.feed.movie ? response.data.feed.movie[0].title : 'Not found');
        console.log('Allocine Response Ratings:', response.data.feed.movie ? response.data.feed.movie[0].statistics : 'Not found');
    } catch (e) {
        console.log('Allocine Error:', e.message);
    }
}

async function run() {
    await testSensCritique();
    await testAllocine();
}

run();
