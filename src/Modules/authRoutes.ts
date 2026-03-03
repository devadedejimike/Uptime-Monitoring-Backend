import { Router } from "express";
import { AuthController } from "./authController";

const router = Router();
router
    .post('/register', AuthController.register)
    .post('/login', AuthController.login)

export default router;