import { pool } from '../../Config/db';

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

    if(prevStatus === 'UP' && currentStatus === 'DOWN'){
        await pool.query(
            `INSERT INTO alerts(user_id, website_id, type, message) VALUES ($1, $2, $3, $4)`, [userId, websiteId, 'DOWN', `${websiteUrl} is DOWN`]
        );
        return;
    }

    if (prevStatus === 'DOWN' && currentStatus === 'UP') {
        await pool.query(
            `INSERT INTO alerts(user_id, website_id, type, message) VALUES ($1, $2, $3, $4)`, [userId, websiteId, 'RECOVERY', `${websiteUrl} is back online`]
        );
        return;
    }
}



