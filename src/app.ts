import express, { NextFunction, Request, Response } from 'express';
import bookRoutes from './routes/book.route.js';
import borrowRoutes from './routes/borrow.route.js';
import userRoutes from './routes/user.route.js';

const app = express();

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
    res.json({
        message: 'Library Management API is running'
    });
});

app.use('/books', bookRoutes);
app.use('/users', userRoutes);
app.use('/borrows', borrowRoutes);

app.use((err: Error & { statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);

    const statusCode = err.statusCode ?? 500;
    const message = err.statusCode ? err.message : 'Internal server error';

    res.status(statusCode).json({ message });
});

export default app;
