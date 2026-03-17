import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface AuthRequest extends Request{
    userId?: number;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Check for header
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer')){
            return res.status(401).json({message: 'No token provided'})
        }

        // Check Bearer token
        const token = authHeader.split(" ")[1];
        if(!token){
            return res.status(401).json({message: 'Invalid Token'})
        }

        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: number
        }
        // Attach UserId to request
        req.userId = decoded.userId
        next()
    } catch (error) {
        res.status(401).json({
            status: 'fail',
            message: 'Invalid or Expired Token'
        })
    }
}