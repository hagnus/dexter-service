import { Router } from 'express';
import { create, findById, update } from '@controllers/users';

const userRouter = Router();

userRouter.get('/:id', findById);
userRouter.post('/', create);
userRouter.put('/:id', update);

export default userRouter;