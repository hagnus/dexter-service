import { database } from "@data/db";
import { UserModel } from "@data/models/user";
import { SessionModel } from '@data/models/session';

export const User = UserModel(database);
export const Session = SessionModel(database);

User.hasMany(
  Session, 
  { foreignKey: 'userId' }
);
