import { pool } from "../Config/db";
import { MonitorResult } from "./types";


export const processResult = async (result: MonitorResult): Promise<void> => {
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

        await client.query(
            `UPDATE websites
            SET
                last_status = $1,
                last_checked_at = $2,
                last_response_time = $3
            WHERE id = $4
            `,
            [
                result.status,
                result.checkedAt,
                result.responseTime,
                result.websiteId
            ]
        );
        // Commit all database changes
        await client.query("COMMIT");
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