import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../../Config/db';

const JWT_SECRET = process.env.JWT_SECRET as string;

export class AuthService{
    // Register User
    static async register(email: string, password: string){
        // Check if user already exist
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1',[email]
        )
        if(existingUser.rows.length > 0) {
            throw new Error("User already exist")
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to database
        const result = await pool.query(
            'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',[email, hashedPassword]
        )

        const user = result.rows[0]

        // Create JWT
        const token = jwt.sign(
            {userId: user.id}, 
            JWT_SECRET, 
            {expiresIn: '1d'}
        )
        return {user, token};
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