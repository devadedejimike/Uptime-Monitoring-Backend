import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../../Config/db';
import crypto from 'crypto'
import { sendEmail } from '../../utils/mailer';

const JWT_SECRET = process.env.JWT_SECRET as string;

export class AuthService{
    // Register User
    static async register(email: string, password: string) {
        // Generate a secure verification token
        const verification_token = crypto.randomBytes(32).toString('hex');

        // Store only the hash of the token in the database
        const tokenHash = crypto
            .createHash('sha256')
            .update(verification_token)
            .digest('hex');

        // Check if the email is already registered
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            throw new Error("User already exist");
        }

        // Hash the user's password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const result = await pool.query(
            `
            INSERT INTO users (email, password_hash)
            VALUES ($1, $2)
            RETURNING id, email, is_verified
            `,
            [email, hashedPassword]
        );

        const user = result.rows[0];

        // Save the hashed verification token
        await pool.query(
            `
            INSERT INTO verification_tokens (
                user_id,
                token_hash,
                expires_at
            )
            VALUES ($1, $2, NOW() + INTERVAL '24 hours')
            `,
            [user.id, tokenHash]
        );

        // Build the verification link
        const verificationUrl =
            `${process.env.FRONTEND_URL}/verify-email?token=${verification_token}`;

        // Send verification email
        await sendEmail(
            email,
            "Verify your Uptime Watcher account",
            `Please verify your email by clicking this link: ${verificationUrl}`
        );

        // Create JWT
        const token = jwt.sign(
            { userId: user.id },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        return {
            user: {
                id: user.id,
                email: user.email,
                isVerified: user.is_verified
            },
            token
        };
    }
    
    static async login(email: string, password: string){
        // Find user by email
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1', [email]
        )
        if(result.rows.length === 0){
            throw new Error('Invalid Credentials')
        }
        const user = result.rows[0];

        // Compare Password
        const checkpwd = await bcrypt.compare(password, user.password_hash)
        if(!checkpwd){
            throw new Error('Invalid Credentials')
        }

        // Create JWT
        const token = jwt.sign(
            {userId: user.id},
            JWT_SECRET,
            {expiresIn: '1d'}
        )
        return {
            user:{id: user.id, email: user.email}, 
            token
        }
    }
    static async getMe(userId: number){
        try {
            const result = await pool.query(
            'SELECT id, email FROM users WHERE id = $1', [userId]
            );
            if(result.rows.length === 0){
                throw new Error("User not found")
            }
            return result.rows[0]
        } catch (error) {
            console.log("Error => ", error)
            throw error
        }
    }
}