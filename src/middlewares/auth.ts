import { Request, Response, NextFunction } from "express";
import { verify, sign } from 'jsonwebtoken';

export type AuthRoleStrings = keyof typeof AuthRole;
export enum AuthRole { 
  ADMIN = 3,
  MANAGER = 2,
  USER = 1
};

export type AuthToken = {
  id: string;
  username: string;
  role: AuthRoleStrings;
  iat: number;
  exp: number;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token || !process.env.TOKEN_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return
  }

  try {
    var decoded = verify(token, process.env.TOKEN_SECRET) as AuthToken;
    req.context = {
      userId: decoded.id,
      role: AuthRole[decoded.role]
    };
    next();

  } catch(err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export function generateAccessToken(id: string, userName: string, role: AuthRole) {
  if (process.env.TOKEN_SECRET) {
    return sign({ id, user: userName, role }, process.env.TOKEN_SECRET , {
      expiresIn: '15m', 
    });
  }

  throw Error('Not able to generate tokens');
}

export function authorize(permission: AuthRole = AuthRole.USER) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { context } = req;

    if(!context.role) {
      res.status(403).json({ error: 'Access denied: No permission context' });
      return
    }

    if (permission > context.role) {
      res.status(403).json({ error: 'Access denied' });
      return
    }

    if(context.role === AuthRole.USER && context.userId !== req.params.userId) {
      res.status(403).json({ error: 'Access denied: User without permission' });
      return
    }

    next();
  };
};