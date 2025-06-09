import { QueryInterface, DataTypes } from "sequelize";
import { UserTypes } from "../../enums/user.types";
import bcrypt from "bcrypt";

export async function up(queryInterface: QueryInterface) {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  await queryInterface.bulkInsert("users", [
    {
      id: "00000000-0000-0000-0000-000000000000",
      firstName: "Charles",
      lastName: "Bessong",
      email: "charlesbessongtabot@gmail.com",
      password: hashedPassword,
      userType: UserTypes.ADMIN,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.bulkDelete("users", {
    email: "charlesbessongtabot@gmail.com"
  });
} 