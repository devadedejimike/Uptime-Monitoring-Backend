import cron from "node-cron";
import axios from "axios";
import { pool } from "../../Config/db";
import { handleStatusChange } from "../alerts/alertServices";

type Status = 'UP' | 'DOWN';

export const startMonitoring = () => {
    // Run every 5 minutes
    cron.schedule("*/5 * * * *", async () => {
        console.log("Running every 5 minute")

        try {
            const websites = await pool.query("SELECT * FROM websites")

            for(const website of websites.rows){
                const start = Date.now();

                let currentStatus: Status = 'UP';
                try {
                    await axios.get(website.url, {timeout: 10000});
                } catch (error){
                    currentStatus = 'DOWN';
                }    
                const responseTime = Date.now() - start;

                await pool.query(
                    "INSERT INTO checks (website_id, status, response_time_ms) VALUES ($1, $2, $3)", [website.id, currentStatus, responseTime]
                )

                await handleStatusChange({
                    userId: website.user_id,
                    websiteId: website.id,
                    websiteUrl: website.url,
                    prevStatus: website.last_status,
                    currentStatus,
                })

                await pool.query(
                    "UPDATE websites SET last_status = $1 WHERE id = $2", [currentStatus, website.id]
                );
            }
        } catch (error) {
            console.error("Cron worker error", error)
        }
    })
}