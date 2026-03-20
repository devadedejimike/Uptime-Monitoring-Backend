import { pool } from "../../Config/db";

export class WebsiteServices {
    static async createWebsite(userId: number, name: string, url: string) {
        const result = await pool.query(
            'INSERT INTO websites (user_id, name, url) VALUES ($1, $2, $3) RETURNING *',[userId, name, url]
        )
        return result.rows[0];
    }

    static async getUserWebsites(userId: number) {
        const result = await pool.query(
            'SELECT * FROM websites WHERE user_id = $1 ORDER BY created_at DESC',[userId]
        )
        return result.rows;
    }

    static async deleteWebsite(userId: number, websiteId: string){
        const result = await pool.query(
            'DELETE FROM websites WHERE id = $1 AND user_id = $2 RETURNING *',[websiteId, userId]
        )
        return result.rows[0];
    }

    static async getWebsiteStats(userId: number, websiteId: number){
        // Ensure website belongs to user
        const website = await pool.query(
            'SELECT * FROM websites WHERE id = $1 AND user_id = $2', [websiteId, userId]
        );

        if(website.rows.length === 0) return null;

        // Get stats
        const stats = await pool.query(
            `
            SELECT 
                COUNT(*) AS total_checks,
                COUNT(*) FILTER (WHERE status = 'UP') AS total_up,
                COUNT(*) FILTER (WHERE status = 'DOWN') AS total_down,
                AVG(response_time_ms) AS avg_response_time
            FROM checks
            WHERE website_id = $1
            `, [websiteId]
        );

        // Last Check
        const lastCheck = await pool.query(
            `
            SELECT status, checked_at
            FROM checks
            WHERE website_id = $1
            ORDER BY checked_at DESC
            LIMIT 1
            `, [websiteId]
        )
        const data = stats.rows[0];

        const totalChecks = Number(data.total_checks);
        const totalUp = Number(data.total_up);

        const upTimePercentage = totalChecks === 0 ? 0 : ((totalUp / totalChecks) * 100).toFixed(2)

        return{
            totalChecks,
            totalUp,
            totalDown: Number(data.total_down),
            upTimePercentage,
            avgResponseTime: Number(data.avg_response_time) || 0,
            lastCheck: lastCheck.rows[0] || null
        }
    }
    static async getChecks(userId: number, websiteId: number){
        // Ensure website belongs to user
        const website = await pool.query(
            'SELECT id FROM websites WHERE id = $1 AND user_id = $2', [websiteId, userId]
        )
        if(website.rows.length === 0) return null;

        // Fetch last 20 checks
        const checks = await pool.query(
            `
            SELECT status, response_time_ms, checked_at 
            FROM checks
            WHERE website_id = $1
            ORDER BY checked_at ASC
            LIMIT 20
            `,[websiteId]
        )
        return checks.rows;
    }
}