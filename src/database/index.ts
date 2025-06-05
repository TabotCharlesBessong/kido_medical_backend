import { Dialect, Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USERNAME as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST as string,
    dialect: (process.env.DB_DIALECT as Dialect) ?? "postgres",
    logging: false,
  }
);

export default sequelize;
