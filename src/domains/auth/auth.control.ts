import { CookieOptions, Request, Response } from "express";
import { Environment } from "@constants";
import { createSession, destroySession, generateAccessToken } from "@domains/auth/auth.service";
import * as userService from "@domains/user/users.service";

const AccessOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: Number(Environment.ACCESS_DURATION)
}

const SessionOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/auth',
  maxAge: Number(Environment.SESSION_DURATION)
}

export async function refresh(req: Request, res: Response) {
  const sessionToken = req.cookies[Environment.SESSION_TOKEN_NAME];

  if (!sessionToken) {
    res.status(401).json({ error: 'Unauthorized' });
    return
  }

  try {
    const accessToken = generateAccessToken(sessionToken);

    res.cookie(Environment.ACCESS_TOKEN_NAME, accessToken, AccessOptions);
    res.status(200).json();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const {SESSION_TOKEN_NAME, ACCESS_TOKEN_NAME} = Environment;
  
  try {
    const user = await userService.verify(email, password);
    const { accessToken, sessionToken } = await createSession(user);

    res.cookie(SESSION_TOKEN_NAME, sessionToken, SessionOptions);
    res.cookie(ACCESS_TOKEN_NAME, accessToken, AccessOptions);
    res.status(200).json().send();
  } catch (error ) {
    res.status(401).json({ error: 'Authentication failed' }).send();
  }
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies[Environment.SESSION_TOKEN_NAME];

  if (!token) {
    res.status(401).json({ error: 'Invalid token' });
    return
  }

  try {
    res.clearCookie(Environment.ACCESS_TOKEN_NAME);
    res.clearCookie(Environment.SESSION_TOKEN_NAME);

    destroySession(token);

    res.status(200).json().send();
  } catch (error) {
    res.status(204).json({ error: 'Logout failed' }).send();
  }
}

export async function register(req: Request, res: Response) {
  try {
    const {SESSION_TOKEN_NAME, ACCESS_TOKEN_NAME} = Environment;
    const newUser = await userService.create(req.body);

    const { accessToken, sessionToken } = await createSession({
      id: newUser.id,
      userName: newUser.userName,
      role: newUser.role,
    });

    res.cookie(SESSION_TOKEN_NAME, sessionToken, SessionOptions);
    res.cookie(ACCESS_TOKEN_NAME, accessToken, AccessOptions);

    res.status(200).json({ accessToken, sessionToken }).send();
  } catch {
    res.status(400).json({ error: 'Registration failed' }).send();
  }
}
