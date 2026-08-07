import dotenv from 'dotenv';
dotenv.config()
import app from "./app";
import { startScheduler } from './Monitor/scheduler';

startScheduler();

const PORT = process.env.PORT||500;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})