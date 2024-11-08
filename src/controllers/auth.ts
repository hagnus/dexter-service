import { Environment } from "@constants";
import { Session, User } from "@data/models";
import { Request, Response } from "express";
import { verify, sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { AuthToken } from "@domains/auth";

function createToken(payload: AuthToken, expiration: string, secret: string) {
  const { id, userName, role } = payload;

  return sign(
    { id, userName, role },
    secret,
    { expiresIn: `${expiration}ms` }
  );
}

function setCookies(response: Response, refreshToken: string, accessToken: string) {
  const { SESSION_TOKEN_NAME, ACCESS_TOKEN_NAME, SESSION_DURATION, ACCESS_DURATION } = Environment;

  response.cookie(
    ACCESS_TOKEN_NAME,
    accessToken,
    {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: Number(ACCESS_DURATION)
    }
  );

  response.cookie(
    SESSION_TOKEN_NAME,
    refreshToken,
    {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      // path: '/refresh',
      maxAge: Number(SESSION_DURATION)
    }
  );

  return response;
}

export function generateAccessToken(payload: AuthToken) {
  return createToken(payload, Environment.ACCESS_DURATION, Environment.ACCESS_TOKEN_SECRET);
}

export function generateRefreshToken(payload: AuthToken) {
  return createToken(payload, Environment.SESSION_DURATION, Environment.SESSION_TOKEN_SECRET);
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies[Environment.SESSION_TOKEN_NAME];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return
  }

  try {
    const tokenData = verify(token, Environment.SESSION_TOKEN_SECRET) as AuthToken;
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

    setCookies(res, refreshToken, accessToken);

    res.status(200).json({ accessToken, refreshToken }).send();
  } catch (error) {
    res.status(500).json({ error: 'Login failed' }).send();
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const token = req.cookies[Environment.SESSION_TOKEN_NAME];

    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return
    }

    const { id } = verify(token, Environment.SESSION_TOKEN_SECRET) as AuthToken;

    // Consider destroy session individually (where token == token)
    Session.destroy({
      where: { userId: id }
    });

    res.clearCookie(Environment.ACCESS_TOKEN_NAME);
    res.clearCookie(Environment.SESSION_TOKEN_NAME);

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

    setCookies(res, accessToken, refreshToken);

    res.status(200).json({ accessToken, refreshToken }).send();
  } catch {
    res.status(500).json({ error: 'Registration failed' }).send();
  }
}