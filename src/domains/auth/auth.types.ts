import type { JwtPayload } from "jsonwebtoken";

export type AuthRoleStrings = keyof typeof AuthRole;
export enum AuthRole {
  ADMIN = 3,
  MANAGER = 2,
  USER = 1
};

export interface AuthToken extends JwtPayload {
  id: string;
  userName: string;
  role: AuthRoleStrings;
}
