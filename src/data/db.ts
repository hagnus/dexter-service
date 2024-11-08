import { Options } from "sequelize/types/sequelize";
import { Sequelize } from "sequelize";
import { Environment } from "@constants";

export const CONFIG: Options = {
  host: Environment.DB_HOST,
  username: Environment.DB_USER,
  password: Environment.DB_PASSWORD,
  database: Environment.DB_NAME,
  port: Number(Environment.DB_PORT),
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

export const database = new Sequelize(CONFIG);
