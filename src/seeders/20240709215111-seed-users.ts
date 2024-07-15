import { QueryInterface } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const saltRounds = 10;

    const users = [
      {
        id: uuidv4(),
        username: "johndoe",
        password: await bcrypt.hash("password1", saltRounds),
        email: "johndoe@gmail.com",
        role: "DOCTOR",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        username: "janesmith",
        password: await bcrypt.hash("password2", saltRounds),
        email: "janesmith@gmail.com",
        role: "DOCTOR",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        username: "emilyjohnson",
        password: await bcrypt.hash("password3", saltRounds),
        email: "emilyjohnson@gmail.com",
        role: "DOCTOR",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        username: "alicebrown",
        password: await bcrypt.hash("password4", saltRounds),
        email: "alicebrown@gmail.com",
        role: "PATIENT",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        username: "bobgreen",
        password: await bcrypt.hash("password5", saltRounds),
        email: "bobgreen@gmail.com",
        role: "PATIENT",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        username: "charlieblack",
        password: await bcrypt.hash("password6", saltRounds),
        email: "charlieblack@gmail.com",
        role: "PATIENT",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Users", users);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
