import { Request, Response, NextFunction } from "express";
import { verify } from 'jsonwebtoken';

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token || !process.env.TOKEN_SECRET) {
    res.status(401).json({ error: 'Access denied' });
    return
  }

  verify(token, process.env.TOKEN_SECRET, (error, decoded) => {
    if (error) {
      res.status(401).json({ error: 'Invalid token' });
      return
    }
    // req.id = decoded.id;
    next();
  });
};
