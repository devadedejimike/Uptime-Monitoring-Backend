import { Response } from "express";
import { AuthRequest } from "../../Middleware/authMiddleware";
import { WebsiteServices } from "./websiteServices";

export class WebsiteController{
    static async create(req: AuthRequest, res: Response){
        try {
            const { name, url } = req.body;
            if(!url) {
                return res.status(401).json({message: "URL is required"})
            }
            const website = await WebsiteServices.createWebsite(req.userId!, name, url)
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

    static async getWebsiteStats(req: AuthRequest, res: Response){
        try {
            const websiteId = Number(req.params.id);
            const stat = await WebsiteServices.getWebsiteStats(req.userId!, websiteId)

            if(!stat) {
                return res.json({message: "Website not found"})
            }
            res.status(200).json({
                status: "success",
                stat
            })
        } catch (error) {
            res.status(404).json({
                status: "fail",
                message: "Server Error", error
            })
        }
    }
    static async getChecks(req: AuthRequest, res: Response){
        try {
            const websiteId = Number(req.params.id)
            const checks = await WebsiteServices.getChecks(req.userId!, websiteId);

            if(!checks){
                return res.status(404).json({message: "Website not found"})
            }
            return res.status(200).json({
                status: 'success',
                checks
            })
        } catch (error) {
            return res.status(500).json({
                status: 'fail',
                message: 'Server Error', error
            })
        }
    }
}