const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs-extra");

// URL of the DU Main Calendar
const URL = "https://www.du.edu/calendar";

async function scrapeDUCalendar() {
    try {
        // Fetch the page
        const { data } = await axios.get(URL);
        const $ = cheerio.load(data);
        let events = [];

        // Select all event cards
        $("a.event-card").each((index, element) => {
            const title = $(element).find("h3").text().trim();
            const date = $(element).find("p").first().text().trim();
            const time = $(element).find("p:contains('icon-du-clock')").text().trim();
            const url = $(element).attr("href");

            let event = { title, date, url };
            if (time) event.time = time;
            
            events.push(event);
        });

        // Ensure results directory exists
        await fs.ensureDir("results");

        // Save events to JSON file
        await fs.writeJson("results/calendar_events.json", { events }, { spaces: 4 });

        console.log("✅ Events successfully scraped and saved in results/calendar_events.json");
    } catch (error) {
        console.error("❌ Error scraping DU Calendar:", error.message);
    }
}

// Run the scraper
scrapeDUCalendar();
