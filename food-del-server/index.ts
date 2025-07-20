import express from 'express';
import type { Express, Request, Response } from 'express';
import cors from 'cors';
import foodRouter from './src/routes/foodRouter';
import userRouter from './src/routes/userRouter';
import 'dotenv/config';

// app config
const app: Express = express();

// middlewares
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('public/uploads'));

// api endpoints
app.use('/api/food', foodRouter);
app.use('/api/user', userRouter);

// test router
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to Food Delivery API' });
});

// start server
const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;