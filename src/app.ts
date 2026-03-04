import express from 'express';
import authRoute from './Modules/auth/authRoutes'
import websiteRoutes from './Modules/website/websiteRoutes'

const app = express()
app.use(express.json());
app.use('/auth', authRoute)
app.use('/website', websiteRoutes)

export default app;
