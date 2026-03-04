import { Router } from "express";
import { WebsiteController } from "./websiteController";
import { protect } from "../../Middleware/authMiddleware";

const router = Router();
router
    .post('/', protect, WebsiteController.create)
    .get('/', protect, WebsiteController.getAll)
    .delete('/:id', protect, WebsiteController.deleteWebsite)

export default router;