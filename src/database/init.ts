import AppointmentModel from "../models/appointment.model";
import CallModel from "../models/call.model";
import CommentModel from "../models/comment.model";
import ConsultationModel from "../models/consultation.model";
import DoctorModel from "../models/doctor.model";
import LikeModel from "../models/like.model";
import MedicationModel from "../models/medication.model";
import MessageModel from "../models/message.model";
import NotificationModel from "../models/notification.model";
import PatientModel from "../models/patient.model";
import PostModel from "../models/post.model";
import PrescriptionModel from "../models/prescription.model";
import TimeSlotModel from "../models/timeslot.model";
import TokenModel from "../models/token.model";
import UserModel from "../models/user.model";
import VitalSignModel from "../models/vitalsign.model";
import Db from "./index";
import { QueryTypes } from "sequelize";

const DbInitialize = async () => {
  try {
    await Db.authenticate();
    console.log("Connected to the database");

    // First handle the UserModel enum migration
    try {
      // Check if enum types exist
      const emailStatusEnumExists = await Db.query(
        "SELECT 1 FROM pg_type WHERE typname = 'enum_users_isEmailVerified'",
        { type: QueryTypes.SELECT }
      );
      
      const accountStatusEnumExists = await Db.query(
        "SELECT 1 FROM pg_type WHERE typname = 'enum_users_accountStatus'",
        { type: QueryTypes.SELECT }
      );

      // Drop the existing columns
      await Db.query('ALTER TABLE users DROP COLUMN IF EXISTS "isEmailVerified"', { type: QueryTypes.RAW });
      await Db.query('ALTER TABLE users DROP COLUMN IF EXISTS "accountStatus"', { type: QueryTypes.RAW });
      
      // Create the enum types if they don't exist
      if (!emailStatusEnumExists.length) {
        await Db.query('CREATE TYPE "enum_users_isEmailVerified" AS ENUM (\'VERIFIED\', \'NOT_VERIFIED\')', { type: QueryTypes.RAW });
      }
      
      if (!accountStatusEnumExists.length) {
        await Db.query('CREATE TYPE "enum_users_accountStatus" AS ENUM (\'ACTIVE\', \'INACTIVE\', \'SUSPENDED\')', { type: QueryTypes.RAW });
      }
      
      // Add the columns back with the correct types
      await Db.query('ALTER TABLE users ADD COLUMN "isEmailVerified" "enum_users_isEmailVerified" NOT NULL DEFAULT \'NOT_VERIFIED\'', { type: QueryTypes.RAW });
      await Db.query('ALTER TABLE users ADD COLUMN "accountStatus" "enum_users_accountStatus" NOT NULL DEFAULT \'ACTIVE\'', { type: QueryTypes.RAW });
    } catch (error) {
      console.log('Error during enum migration:', error);
    }

    // Then sync all models
    await UserModel.sync({ alter: false });
    await TokenModel.sync({ alter: false });
    await DoctorModel.sync({ alter: false });
    await PatientModel.sync({ alter: false });
    await TimeSlotModel.sync({ alter: false });
    await AppointmentModel.sync({ alter: false });
    await PostModel.sync({ alter: false });
    await CommentModel.sync({ alter: false });
    await LikeModel.sync({ alter: false });
    await MessageModel.sync({ alter: false });
    await NotificationModel.sync({ alter: false });
    await VitalSignModel.sync({ alter: false });
    await ConsultationModel.sync({ alter: false });
    await PrescriptionModel.sync({ alter: false });
    await MedicationModel.sync({ alter: false });
    await CallModel.sync({ alter: false });

    console.log("All models synchronized successfully");
  } catch (error) {
    console.log("Unable to connect to database", error);
    throw error;
  }
};

export default DbInitialize;
