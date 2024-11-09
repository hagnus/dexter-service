import { AuthToken, AuthRole } from "@domains/auth/auth.types";
import { Environment } from "@constants";
import { Request, Response, NextFunction } from "express";
import { verify } from 'jsonwebtoken';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies[Environment.ACCESS_TOKEN_NAME];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return
  }

  try {
    var decoded = verify(token, Environment.ACCESS_TOKEN_SECRET) as AuthToken;
    req.context = {
      userId: decoded.id,
      role: AuthRole[decoded.role]
    };
    next();

  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' + err });
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
