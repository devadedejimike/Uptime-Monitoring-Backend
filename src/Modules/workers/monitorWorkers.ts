import cron from "node-cron";
import axios from "axios";
import { pool } from "../../Config/db";

export const startMonitoring = () => {
    // Run every 5 minutes
    cron.schedule("*/5 * * * *", async () => {
        console.log("Running every 5 minute")

        try {
            const websites = await pool.query("SELECT * FROM websites")

            for(const website of websites.rows){
                const start = Date.now();

                try {
                    await axios.get(website.url, {timeout: 10000});
                    const responseTime = Date.now() - start;

                    await pool.query(
                        "INSERT INTO checks (website_id, status, response_time_ms) VALUES ($1, $2, $3)", [website.id, "UP", responseTime]
                    )
                } catch (error) {
                    const responseTime = Date.now() - start;

                    await pool.query(
                        "INSERT INTO checks (website_id, status, response_time_ms) VALUES ($1, $2, $3)",[website.id, "DOWN", responseTime]
                    )
                }
            }
        } catch (error) {
            console.error("Cron worker error", error)
        }
    })
}