import { Dialect, Sequelize } from "sequelize";
import config from "../../config/config.json";

const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    dialect: config.development.dialect as Dialect,
    logging: false,
  }
);

export default sequelize;
