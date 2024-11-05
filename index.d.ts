import { AuthRole } from '@middlewares/auth';

export { };
declare global {
  namespace Express {
    export interface Request {
      context: {
        userId: string;
        role: AuthRole;
      }
    }
  }
}