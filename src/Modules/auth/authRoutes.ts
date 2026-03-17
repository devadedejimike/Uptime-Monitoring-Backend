import { Router } from "express";
import { AuthController } from "./authController";
import { protect } from "../../Middleware/authMiddleware";

const router = Router();
router
    .post('/register', AuthController.register)
    .post('/login', AuthController.login)
    .get('/me',protect, AuthController.getMe)

export default router;