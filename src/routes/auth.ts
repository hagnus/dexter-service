

import { Router } from 'express';
import { login, logout, refresh, register } from '@controllers/auth';

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/register', register);
authRouter.post('/refresh', refresh);


export default authRouter;