import { AuthRole } from '@middlewares/auth';
import { envVariables } from '@constants';
import { z } from 'zod';

const envVariables = z.object({
  SESSION_DURATION: z.string(),
  SESSION_TOKEN_NAME: z.string(),
  SESSION_TOKEN_SECRET: z.string(),
  ACCESS_DURATION: z.string(),
  ACCESS_TOKEN_NAME: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),

  DB_HOST: z.string().url(),
  DB_NAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_PORT: z.string(),
  DB_USER: z.string(),

  NODE_LOCAL_HOST: z.string().url(),
  NODE_LOCAL_PORT: z.string(),
  NODE_DOCKER_PORT: z.string(),
  ALLOWED_DOMAINS: z.string(),
});

envVariables.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
  namespace Express {
    export interface Request {
      context: {
        userId: string;
        role: AuthRole;
      }
    }
  }
}

