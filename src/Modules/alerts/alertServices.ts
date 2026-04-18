import { pool } from '../../Config/db';
import { sendEmail } from '../../utils/mailer';

type Status = 'UP' | 'DOWN';

interface handleStatusChangeProps{
    userId: number;
    websiteId: number,
    websiteUrl: string,
    prevStatus: Status | null,
    currentStatus: Status
};

export const handleStatusChange = async ({
    userId,
    websiteId,
    websiteUrl,
    prevStatus,
    currentStatus
}: handleStatusChangeProps) => {

    if (prevStatus === currentStatus) return;

    let type: 'DOWN' | 'RECOVERY' | null = null;
    let message = '';

    if(prevStatus === 'UP' && currentStatus === 'DOWN'){
        type = 'DOWN';
        message = `${websiteUrl} is DOWN`
    }

    if (prevStatus === 'DOWN' && currentStatus === 'UP') {
        type = 'RECOVERY'
        message = `${websiteUrl} is back online`
    }
    await pool.query(
        `INSERT INTO alerts(user_id, website_id, type, message) VALUES ($1, $2, $3, $4)`, [userId, websiteId, type, message ]
    );    

    const userResult = await pool.query(
        `SELECT email FROM users WHERE id = $1`, [userId]
    );

    const userEmail = userResult.rows[0]?.email;
    if(!userEmail) return;

    await sendEmail(
        userEmail,
        type === 'DOWN' ? "Website Down" : "Website is Back Up",
        message
    )
}



