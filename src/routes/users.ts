import { Router } from 'express';
import { create, findById, update } from '@controllers/users';

const userRouter = Router();

userRouter.get('/:userId', findById);
userRouter.put('/:userId', update);
userRouter.post('/', create);

export default userRouter;