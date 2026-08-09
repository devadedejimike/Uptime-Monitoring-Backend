import { Request, Response } from "express";
import { AuthService } from "./authServices";
import { AuthRequest } from "../../Middleware/authMiddleware";


export class AuthController {
    // Register user 
    static async register(req: Request, res: Response){
        try {
            const {email, password} = req.body;
            const data = await AuthService.register(email, password)
            res.status(201).json(data)
        } catch (error: any) {
            res.status(404).json({error: error.message})
        }
    }
    // User Login
    static async login(req: Request, res: Response){
        try{
            const {email, password} = req.body;
            const data = await AuthService.login(email, password)
            res.status(200).json(data)
        } catch(error: any) {
            res.status(404).json({error: error.message})
        }
    }
    // Get Logged in user
    static async getMe(req: AuthRequest, res: Response){
        try {
            const user = await AuthService.getMe(req.userId!);
            res.json({ id: user.id, email: user.email, isVerified: user.is_verified });
        } catch (error) {
            res.status(500).json({message: "failed to fetch user", error})
        }
    }
    // Verify email
    static async verifyEmail(req: Request, res: Response) {
        try {
            const { token } = req.query;

            if (typeof token !== "string" || !token) {
                return res.status(400).json({
                    message: "Verification token is required"
                });
            }

            const user = await AuthService.verifyEmail(token);

            return res.status(200).json({
                status: "success",
                message: "Email verified successfully",
                user
            });
        } catch (error: any) {
            return res.status(400).json({
                status: "fail",
                message: error.message
            });
        }
    }
}