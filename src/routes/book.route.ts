import { Router } from 'express';
import BookController from '../controllers/book.controller.js';

const bookRoutes = Router();

bookRoutes.get('/', BookController.index);
bookRoutes.get('/:id', BookController.show);
bookRoutes.post('/', BookController.create);
bookRoutes.put('/:id', BookController.update);
bookRoutes.delete('/:id', BookController.delete);

export default bookRoutes;
