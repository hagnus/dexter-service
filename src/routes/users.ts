import { Router } from 'express';
import { create, findById, signIn, update } from '@controllers/users';
import { authenticate, authorize } from '@middlewares/auth';

const userRouter = Router();

userRouter.post('/auth', signIn);
userRouter.get('/:userId', authenticate, authorize(), findById);
userRouter.put('/:userId', authenticate, authorize(), update);
userRouter.post('/', create);

export default userRouter;