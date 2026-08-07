import cron from "node-cron";
import { MonitorTarget } from "./types";
import { pool } from "../Config/db";
import { checkWebsite } from "./worker";
import { processResult } from "./processor";

// Number of websites to monitor at the same time
const BATCH_SIZE = 25;

export const startScheduler = () => {
    // Run the monitoring cycle every 5 minutes
    cron.schedule("*/5 * * * *", async ()=>{
        console.log("Running monitoring schedule....")
        try {
            // Load all websites that need to be monitored
            const result = await pool.query(
                `SELECT id, url
                FROM websites
                ORDER BY id ASC`
            );

            const websites: MonitorTarget[] = result.rows;
            // Split websites into smaller batches
            for (let i = 0; i < websites.length; i += BATCH_SIZE) {
                const batch = websites.slice(i, i + BATCH_SIZE);

                // Monitor every website in the current batch concurrently
                const monitorResults = await Promise.all(
                    batch.map(checkWebsite)
                );

                // Save all monitoring results without stopping on individual failures
                const processedResult = await Promise.allSettled(
                    monitorResults.map(processResult)
                );
                processedResult.forEach((result, index) => {
                    const website = batch[index];
                    if(!website){
                        return;
                    }
                    if (result.status === "rejected") {
                        console.error(`Failed to process website ${website.id}: `,result.reason)
                    }
                })
            }
            console.log(`Monitoring Completed. Checked ${websites.length} website(s).`)
        } catch (error) {
            console.error("Scheduler failed", error)
        }
    })
}