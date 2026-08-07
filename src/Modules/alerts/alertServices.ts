import { pool } from '../../Config/db';
import { HandleIncidentEventProps } from '../../Monitor/types';
import { sendEmail } from '../../utils/mailer';

// save the alert and notify the user
export const handleIncidentEvent = async ({
    userId,
    websiteId,
    websiteUrl,
    event,
}: HandleIncidentEventProps) => {
    // Build the alert message
    const message = event === "DOWN" ? `${websiteUrl} is DOWN` : `${websiteUrl} is back online`

    const subject = event === "DOWN" ? "Website Down" : "Website Recovered";

    // save the alert
    await pool.query(
        `INSERT INTO alerts(user_id, website_id, type, message) VALUES ($1, $2, $3, $4)`, [userId, websiteId, event, message ]
    );    
    // get the user's email address
    const userResult = await pool.query(
        `SELECT email FROM users WHERE id = $1`, [userId]
    );

    const userEmail = userResult.rows[0]?.email;
    if(!userEmail) return;

    await sendEmail(
        userEmail,
        subject,
        message
    )
}



