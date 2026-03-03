import express from 'express';
import authRoute from './Modules/auth/authRoutes'

const app = express()
app.use(express.json());
app.use('/auth', authRoute)

export default app;
