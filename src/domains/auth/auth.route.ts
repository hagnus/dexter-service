

import { Router } from 'express';
import { login, logout, refresh, register } from '@domains/auth/auth.control';

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/register', register);
authRouter.post('/refresh', refresh);


export default authRouter;