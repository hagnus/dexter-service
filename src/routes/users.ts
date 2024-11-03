import { Router } from 'express';
import { create, findById, signIn, update } from '@controllers/users';
import { verifyToken } from '@middlewares/auth';

const userRouter = Router();

userRouter.get('/auth', signIn);
userRouter.get('/:id', verifyToken, findById);
userRouter.put('/:id', verifyToken, update);
userRouter.post('/', create);

export default userRouter;