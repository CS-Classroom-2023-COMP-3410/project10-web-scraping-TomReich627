const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');

const URL = 'https://denverpioneers.com/index.aspx';
const OUTPUT_FILE = 'results/athletic_events.json';

async function scrapeAthleticEvents() {
    try {
        console.log('Fetching the DU Athletics page...');

        // Fetch HTML content
        const { data } = await axios.get(URL);
        const $ = cheerio.load(data);

        const events = [];

        // Iterate over event blocks (Update the selectors based on the actual HTML structure)
        $('.carousel-event').each((_, element) => {
            const duTeam = $(element).find('.du-team-name').text().trim();
            const opponent = $(element).find('.opponent-team-name').text().trim();
            const eventDate = $(element).find('.event-date').text().trim();

            if (duTeam && opponent && eventDate) {
                events.push({ duTeam, opponent, date: eventDate });
            }
        });

        // Ensure the results directory exists
        await fs.ensureDir('results');

        // Save results to JSON file
        await fs.writeJson(OUTPUT_FILE, { events }, { spaces: 2 });

        console.log(`✅ Successfully scraped ${events.length} events! Data saved to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error('❌ Error scraping events:', error.message);
    }
}

// Run the scraper
scrapeAthleticEvents();
