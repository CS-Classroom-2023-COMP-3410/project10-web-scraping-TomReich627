const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');

const URL = 'https://bulletin.du.edu/undergraduate/coursedescriptions/comp/';
const OUTPUT_FILE = 'results/bulletin.json';

async function scrapeCourses() {
    try {
        console.log('🔍 Fetching the DU Bulletin page...');
        
        // Fetch HTML content
        const { data } = await axios.get(URL);
        const $ = cheerio.load(data);

        const courses = [];

        // Iterate over each course block
        $('.courseblock').each((_, element) => {
            const titleElem = $(element).find('.courseblocktitle');
            const descElem = $(element).find('.courseblockdesc');

            if (titleElem.length > 0) {
                const titleText = titleElem.text().trim();
                const descText = descElem.text().trim() || '';

                // Extract course number using regex
                const match = titleText.match(/COMP(?:\s|&nbsp;)?(\d{4})/);

                if (match) {
                    const courseNumber = parseInt(match[1], 10);
                    const courseCode = `COMP-${match[1]}`;
                    const courseTitle = titleText.replace(/COMP(?:\s|&nbsp;)?\d{4}/, '').trim();

                    // Check if it's 3000+ level and has no prerequisites
                    if (courseNumber >= 3000 && !descText.includes('Prerequisite')) {
                        courses.push({ course: courseCode, title: courseTitle });
                    }
                }
            }
        });

        // Ensure the results directory exists
        await fs.ensureDir('results');

        // Save results to JSON file
        await fs.writeJson(OUTPUT_FILE, { courses }, { spaces: 2 });

        console.log(`✅ Successfully scraped ${courses.length} courses! Data saved to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error('❌ Error scraping courses:', error.message);
    }
}

// Run the scraper
scrapeCourses();
