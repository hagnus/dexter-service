import { Router } from 'express';
import { create, findOne, update } from '@domains/user/users.control';

const userRouter = Router();

userRouter.get('/:userId', findOne);
userRouter.put('/:userId', update);
userRouter.post('/', create);

export default userRouter;