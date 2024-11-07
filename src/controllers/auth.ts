import { Session, User } from "@data/models";
import { Request, Response } from "express";
import { verify, sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { AuthToken } from "@domains/auth";

function createToken(payload: AuthToken, expiration: string, secret?: string) {
  const { id, userName, role } = payload;

  if (secret) {
    return sign(
      { id, userName, role },
      secret,
      { expiresIn: expiration }
    );
  }

  throw Error('Not able to generate tokens');
}

export function generateAccessToken(payload: AuthToken) {
  return createToken(payload, '15min', process.env.TOKEN_SECRET);
}

export function generateRefreshToken(payload: AuthToken) {
  return createToken(payload, '30d', process.env.REFRESH_TOKEN_SECRET);
}

export async function refreshSession(req: Request, res: Response) {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token || !process.env.REFRESH_TOKEN_SECRET) {
    res.status(401).json({ error: 'Unauthorized' });
    return
  }

  try {
    const tokenData = verify(token, process.env.REFRESH_TOKEN_SECRET) as AuthToken;
    const accessToken = generateAccessToken(tokenData);

    res.status(200).json({ accessToken, refreshToken: token });
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await User.scope('auth').findOne({ where: { email: email } });

    if (!user) {
      res.status(401).json({ error: 'Authentication failed' }).send();
      return
    }

    const passwordMatch = await compare(password, user.dataValues.password);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Authentication failed' }).send();
      return
    }

    const accessToken = generateAccessToken({
      id: user.dataValues.id,
      userName: user.dataValues.userName,
      role: user.dataValues.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.dataValues.id,
      userName: user.dataValues.userName,
      role: user.dataValues.role,
    });

    Session.create({
      userId: user.dataValues.id,
      token: refreshToken
    });

    res.status(200).json({ accessToken, refreshToken }).send();
  } catch (error) {
    res.status(500).json({ error: 'Login failed' }).send();
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token || !process.env.REFRESH_TOKEN_SECRET) {
      res.status(401).json({ error: 'Unauthorized' });
      return
    }

    const { id } = verify(token, process.env.REFRESH_TOKEN_SECRET) as AuthToken;

    // Consider destroy session individually (where token == token)
    Session.destroy({
      where: { userId: id }
    });

    res.status(200).json().send();
  } catch (error) {
    res.status(500).json({ error: 'Login failed' }).send();
  }
}

export async function register(req: Request, res: Response) {
  try {
    const user = req.body;

    const passwordMatch = await compare(user.password, user.passwordConfirmation);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Authentication failed' }).send();
      return
    }

    const newUser = await User.create(user);

    const accessToken = generateAccessToken({
      id: newUser.dataValues.id,
      userName: newUser.dataValues.userName,
      role: newUser.dataValues.role,
    });

    const refreshToken = generateRefreshToken({
      id: newUser.dataValues.id,
      userName: newUser.dataValues.userName,
      role: newUser.dataValues.role,
    });

    Session.create({
      userId: newUser.dataValues.id,
      token: refreshToken
    });

    res.status(200).json({ accessToken, refreshToken }).send();
  } catch {
    res.status(500).json({ error: 'Registration failed' }).send();
  }
}