import { Request, Response } from 'express';
import BookService from '../service/service.js';

class BookController {
    static async index(_req: Request, res: Response): Promise<void> {
        const books = await BookService.getAll();
        res.json(books);
    }

    static async show(req: Request, res: Response): Promise<void> {
        const book = await BookService.findById(req.params.id);
        res.json(book);
    }

    static async create(req: Request, res: Response): Promise<void> {
        const book = await BookService.create(req.body);
        res.status(201).json(book);
    }

    static async update(req: Request, res: Response): Promise<void> {
        const book = await BookService.update(req.params.id, req.body);
        res.json(book);
    }

    static async delete(req: Request, res: Response): Promise<void> {
        await BookService.delete(req.params.id);
        res.status(204).send();
    }
}

export default BookController;
