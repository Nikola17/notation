const sharp = require('sharp');
const axios = require('axios');

async function generatePosterWithRatings(originalUrl, ratings) {
    try {
        const response = await axios.get(originalUrl, { responseType: 'arraybuffer' });
        const inputBuffer = Buffer.from(response.data);
        const metadata = await sharp(inputBuffer).metadata();
        const width = metadata.width || 300;
        const height = metadata.height || 450;

        const barHeight = Math.floor(height * 0.12);
        const fontSize = Math.floor(barHeight * 0.4);
        const padding = Math.floor(width * 0.05);

        const imdbText = `IMDB: ${ratings.imdb || 'N/A'}`;
        const allocineText = `Allo: ${ratings.allocine.user || 'N/A'}`;
        const sensText = `SC: ${ratings.senscritique || 'N/A'}`;

        const svgOverlay = `
        <svg width="${width}" height="${height}">
            <rect x="0" y="${height - barHeight}" width="${width}" height="${barHeight}" fill="rgba(0,0,0,0.7)" />
            <text x="${padding}" y="${height - (barHeight / 2) + (fontSize / 3)}" font-family="Arial" font-size="${fontSize}" fill="#FFD700" font-weight="bold">${imdbText}</text>
            <text x="${width / 2}" y="${height - (barHeight / 2) + (fontSize / 3)}" font-family="Arial" font-size="${fontSize}" fill="#FF4500" font-weight="bold" text-anchor="middle">${allocineText}</text>
            <text x="${width - padding}" y="${height - (barHeight / 2) + (fontSize / 3)}" font-family="Arial" font-size="${fontSize}" fill="#00BFFF" font-weight="bold" text-anchor="end">${sensText}</text>
        </svg>`;

        return await sharp(inputBuffer)
            .composite([{
                input: Buffer.from(svgOverlay),
                top: 0,
                left: 0
            }])
            .jpeg()
            .toBuffer();
    } catch (e) {
        console.error('Error generating poster:', e);
        // Fallback to original image
        const response = await axios.get(originalUrl, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
    }
}

module.exports = { generatePosterWithRatings };
