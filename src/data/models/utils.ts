import { sign } from 'jsonwebtoken';

export function generateAccessToken(id: string, userName: string, email: string) {
  if (process.env.TOKEN_SECRET) {
    return sign({ id, user: userName, email }, process.env.TOKEN_SECRET , {
      expiresIn: '360s',
    });
  }

  throw Error('Not able to generate tokens');
}
