import { database } from "@data/db";
import { UserModel } from "@data/models/user";

export const User = UserModel(database);