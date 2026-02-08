const { getAllocineRating, getSensCritiqueRating } = require('./ratings');

async function test() {
    console.log('--- Testing Ratings Fetching ---');

    const movie = {
        title: 'Inception',
        year: '2010'
    };

    console.log(`Testing with: ${movie.title} (${movie.year})`);

    const allocine = await getAllocineRating(movie.title, movie.year);
    console.log('Allocine Ratings:', allocine);

    const senscritique = await getSensCritiqueRating(movie.title, movie.year);
    console.log('SensCritique Rating:', senscritique);
}

test().catch(console.error);
