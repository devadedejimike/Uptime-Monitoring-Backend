import { Request, Response } from "express";
import { AuthService } from "./authServices";

// Register user 
export class AuthController {
    static async register(req: Request, res: Response){
        try {
            const {email, password} = req.body;
            const data = await AuthService.register(email, password)
            res.status(201).json(data)
        } catch (error: any) {
            res.status(404).json({error: error.message})
        }
    }
    static async login(req: Request, res: Response){
        try{
            const {email, password} = req.body;
            const data = await AuthService.login(email, password)
            res.status(200).json(data)
        } catch(error: any) {
            res.status(404).json({error: error.message})
        }
    }
}