

import { Router } from 'express';
import { login, logout, refreshSession, register } from '@controllers/auth';

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/register', register);
authRouter.post('/refresh', refreshSession);


export default authRouter;