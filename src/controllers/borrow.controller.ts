import { Request, Response } from 'express';
import BorrowService from '../service/borrow.service.js';

class BorrowController {
    static async index(_req: Request, res: Response): Promise<void> {
        const borrows = await BorrowService.getAll();
        res.json(borrows);
    }

    static async show(req: Request, res: Response): Promise<void> {
        const borrow = await BorrowService.findById(req.params.id);
        res.json(borrow);
    }

    static async create(req: Request, res: Response): Promise<void> {
        const borrow = await BorrowService.create(req.body);
        res.status(201).json(borrow);
    }

    static async update(req: Request, res: Response): Promise<void> {
        const borrow = await BorrowService.update(req.params.id, req.body);
        res.json(borrow);
    }

    static async delete(req: Request, res: Response): Promise<void> {
        await BorrowService.delete(req.params.id);
        res.status(204).send();
    }
}

export default BorrowController;
