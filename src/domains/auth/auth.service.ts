import { Environment } from "@constants";
import { CookieOptions } from "express";
import { verify, sign } from 'jsonwebtoken';
import { AuthToken } from "@domains/auth/auth.types";
import { Session } from "@data/models";

function createToken(payload: AuthToken, expiration: string, secret: string) {
  const { id, userName, role } = payload;

  return sign(
    { id, userName, role },
    secret,
    { expiresIn: `${expiration}ms` }
  );
}

function createAccessToken(payload: AuthToken) {
  return createToken(payload, Environment.ACCESS_DURATION, Environment.ACCESS_TOKEN_SECRET);
}

function createSessionToken(payload: AuthToken) {
  return createToken(payload, Environment.SESSION_DURATION, Environment.SESSION_TOKEN_SECRET);
}

export async function destroySession(sessionToken: string) {
  try {
    const { id } = verify(sessionToken, Environment.SESSION_TOKEN_SECRET) as AuthToken;

    await Session.destroy({
      where: { userId: id }
    });

  } catch (error) {
    throw Error('Not able to clear user session');
  }
}

export async function createSession({ id, userName, role }: AuthToken) {
  try {
    const accessToken = createAccessToken({
      id, userName, role
    });

    const sessionToken = createSessionToken({
      id, userName, role
    });

    await Session.create({
      userId: id,
      token: sessionToken
    });

    return { accessToken, sessionToken }
  } catch (error) {
    throw Error('Not able to create user session');
  }
}

export function generateAccessToken(sessionToken: string) {
  try {
    const tokenData = verify(sessionToken, Environment.SESSION_TOKEN_SECRET) as AuthToken;

    return createAccessToken(tokenData);
  } catch (error) {
    throw Error('Unable to refresh token: ' + error)
  }
}