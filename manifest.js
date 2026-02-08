const manifest = {
    id: 'community.ratingsaddon',
    version: '1.0.0',
    name: 'Ratings Addon (Allociné, IMDB, SensCritique)',
    description: 'Affiche les notes Allociné, IMDB et SensCritique directement sur les posters.',
    resources: ['catalog', 'meta'],
    types: ['movie', 'series'],
    idPrefixes: ['tt'],
    catalogs: [
        {
            type: 'movie',
            id: 'top_rated_ratings',
            name: 'Top Rated with Ratings',
            extra: [{ name: 'search', isRequired: false }]
        },
        {
            type: 'series',
            id: 'top_rated_series_ratings',
            name: 'Series with Ratings',
            extra: [{ name: 'search', isRequired: false }]
        }
    ]
};

module.exports = manifest;
