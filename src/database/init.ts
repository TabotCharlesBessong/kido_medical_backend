import DoctorModel from "../models/doctor.model";
import TokenModel from "../models/token.model";
import UserModel from "../models/user.model";
import Db from "./index";

const DbInitialize = async () => {
  try {
    await Db.authenticate();
    console.log("Connected to the database");
    UserModel.sync({ alter: false });
    TokenModel.sync({ alter: false });
    DoctorModel.sync({ alter: false });
  } catch (error) {
    console.log("Unable to connect our database", error);
  }
};

export default DbInitialize;
