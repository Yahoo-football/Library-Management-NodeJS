import { Router } from 'express';
import BorrowController from '../controllers/borrow.controller.js';

const borrowRoutes = Router();

borrowRoutes.get('/', BorrowController.index);
borrowRoutes.get('/:id', BorrowController.show);
borrowRoutes.post('/', BorrowController.create);
borrowRoutes.put('/:id', BorrowController.update);
borrowRoutes.delete('/:id', BorrowController.delete);

export default borrowRoutes;
