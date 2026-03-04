import { pool } from "../../Config/db";

export class WebsiteServices {
    static async createWebsite(userId: number, url: string) {
        const result = await pool.query(
            'INSERT INTO websites (user_id, url) VALUES ($1, $2) RETURNING *',[userId, url]
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
}