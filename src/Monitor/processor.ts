import { pool } from "../Config/db";
import { handleIncidentEvent } from "../Modules/alerts/alertServices";
import { MonitorResult, WebsiteMonitoringState } from "./types";

const DOWN_THRESHOLD = 2;
const RECOVERY_THRESHOLD = 2;
export const processResult = async (result: MonitorResult): Promise<void> => {
    

    let shouldStartIncident = false;
    let shouldEndIncident = false;

    // Reserve a database connection for this transaction
    const client = await pool.connect();

    try {
        // Start a database transaction
        await client.query("BEGIN");
        // Save the monitoring result to the checks history
        await client.query(
            `INSERT INTO checks(
                website_id,
                status,
                response_time_ms,
                checked_at
            )
            VALUES ($1, $2, $3, $4)`,
            [
                result.websiteId,
                result.status,
                result.responseTime,
                result.checkedAt
            ]
        );

        //Get the website's current monitoring state
        const websiteResult = await client.query(
            `
            SELECT 
                user_id,
                url,
                consecutive_failures,
                consecutive_success,
                incident_active
            FROM websites
            WHERE id = $1
            `, [result.websiteId]
        )

        const website = websiteResult.rows[0] as WebsiteMonitoringState | undefined;
        if (!website) {
            throw new Error(`Website ${result.websiteId} not found`)
        }
        let consecutiveFailures = website.consecutive_failures;
        let consecutiveSuccess = website.consecutive_success;
        let incidentActive = website.incident_active;

        if (result.status === "DOWN") {
            consecutiveFailures++;
            consecutiveSuccess = 0;
        }else{
            consecutiveSuccess++;
            consecutiveFailures = 0
        }

        // Check if a new incident should start
        if(consecutiveFailures >= DOWN_THRESHOLD && !incidentActive){
            shouldStartIncident = true;
            incidentActive = true
        }

        // Check if the current incident has recovered
        if(consecutiveSuccess >= RECOVERY_THRESHOLD && incidentActive){
            shouldEndIncident = true;
            incidentActive = false;
        }

        await client.query(
            `UPDATE websites
            SET
                last_status = $1,
                last_checked_at = $2,
                last_response_time = $3,
                consecutive_failures = $4,
                consecutive_success = $5,
                incident_active = $6
            WHERE id = $7
            `,
            [
                result.status,
                result.checkedAt,
                result.responseTime,
                consecutiveFailures,
                consecutiveSuccess,
                incidentActive,
                result.websiteId
            ]
        );
        // Commit all database changes
        await client.query("COMMIT");

        // Alert
        try {
            if(shouldStartIncident){
                await handleIncidentEvent({
                    userId: website.user_id,
                    websiteId: result.websiteId,
                    websiteUrl: website.url,
                    event: "DOWN"
                })
            }
            if(shouldEndIncident){
                await handleIncidentEvent({
                    userId: website.user_id,
                    websiteId: result.websiteId,
                    websiteUrl: website.url,
                    event: "RECOVERY"
                })
            }
        } catch (error) {
            console.error("Failed to send incident notification:", error);
        }
    } catch (error) {
        // Roll back all changes if any query fails
        await client.query("ROLLBACK")
        throw new Error( `Failed to process monitoring result: ${
            error instanceof Error ? error.message : "Unknown error"
        }`);
        
    } finally{
        // Return the connection to the pool
        client.release();
    }
}