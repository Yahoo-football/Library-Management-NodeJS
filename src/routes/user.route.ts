import { Router } from 'express';
import UserController from '../controllers/user.controller.js';

const userRoutes = Router();

userRoutes.get('/', UserController.index);
userRoutes.get('/:id', UserController.show);
userRoutes.post('/', UserController.create);
userRoutes.put('/:id', UserController.update);
userRoutes.delete('/:id', UserController.delete);

export default userRoutes;
