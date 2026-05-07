import { Request, Response } from 'express';
import UserService from '../service/user.service.js';

class UserController {
    static async index(_req: Request, res: Response): Promise<void> {
        const users = await UserService.getAll();
        res.json(users);
    }

    static async show(req: Request, res: Response): Promise<void> {
        const user = await UserService.findById(req.params.id);
        res.json(user);
    }

    static async create(req: Request, res: Response): Promise<void> {
        const user = await UserService.create(req.body);
        res.status(201).json(user);
    }

    static async update(req: Request, res: Response): Promise<void> {
        const user = await UserService.update(req.params.id, req.body);
        res.json(user);
    }

    static async delete(req: Request, res: Response): Promise<void> {
        await UserService.delete(req.params.id);
        res.status(204).send();
    }
}

export default UserController;
