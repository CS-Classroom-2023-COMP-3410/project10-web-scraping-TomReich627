const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs-extra");

const BASE_URL = "https://www.du.edu";
const CALENDAR_URL = "https://www.du.edu/calendar";

// Function to scrape the DU Calendar page
async function scrapeDUCalendar() {
    try {
        console.log("⏳ Fetching DU Calendar...");
        const { data } = await axios.get(CALENDAR_URL);
        const $ = cheerio.load(data);
        let events = [];

        // Extract event details from the listing page
        $("a.event-card").each((index, element) => {
            const title = $(element).find("h3").text().trim(); // Description is actually the title inside <h3>
            const date = $(element).find("p").first().text().trim(); // First <p> = Date
            const time = $(element).find("p").eq(1).text().trim(); // Second <p> = Time
            const url = $(element).attr("href"); // Event page URL

            let event = { title, date, url };
            if (time) event.time = time;
            if (title) event.description = title; // Correcting the description to use <h3>

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
