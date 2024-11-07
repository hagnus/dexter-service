import { AuthToken, AuthRole } from "@domains/auth";
import { Request, Response, NextFunction } from "express";
import { verify } from 'jsonwebtoken';

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

  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export function authorize(permission: AuthRole = AuthRole.USER) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { context } = req;

    if (!context.role) {
      res.status(403).json({ error: 'Access denied: No context' });
      return
    }

    if (permission > context.role) {
      res.status(403).json({ error: 'Access denied: No privilege' });
      return
    }

    if (context.role === AuthRole.USER && context.userId !== req.params.userId) {
      res.status(403).json({ error: 'Access denied: User without permission' });
      return
    }

    next();
  };
};
