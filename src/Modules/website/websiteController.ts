import { Response } from "express";
import { AuthRequest } from "../../Middleware/authMiddleware";
import { WebsiteServices } from "./websiteServices";

export class WebsiteController{
    static async create(req: AuthRequest, res: Response){
        try {
            const { url } = req.body;
            if(!url) {
                return res.status(401).json({message: "URL is required"})
            }
            const website = await WebsiteServices.createWebsite(req.userId!, url)
            res.status(201).json(website)
        } catch (error) {
            res.status(401).json({
                status: 'fail',
                message: 'Server Error', error
            })
        }
    }
    static async getAll(req: AuthRequest, res: Response){
        try {
            const websites = await WebsiteServices.getUserWebsites(req.userId!)

            res.status(201).json(websites);
        } catch (error) {
            res.status(401).json({
                status: 'fail',
                message: 'Server Error', error
            })
        }
    }
    static async deleteWebsite(req: AuthRequest, res: Response){
        try {
            const websiteId = String(req.params.id);

            const deleted = await WebsiteServices.deleteWebsite(req.userId!, websiteId);

            if(!deleted){
                return res.status(401).json({message: 'Website not found'})
            }

            res.status(201).json({message: 'Website deleted successfully'})
        } catch (error) {
            res.status(401).json({
                status: 'fail',
                message: 'Server Error', error
            })
        }
    }
}