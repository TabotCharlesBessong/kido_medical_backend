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
import seedDatabase from "./seeders";

const DbInitialize = async (shouldSeed: boolean = false) => {
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

    // Then sync all models without force
    await UserModel.sync();
    await TokenModel.sync();
    await DoctorModel.sync();
    await PatientModel.sync();
    await TimeSlotModel.sync();
    await AppointmentModel.sync();
    await PostModel.sync();
    await CommentModel.sync();
    await LikeModel.sync();
    await MessageModel.sync();
    await NotificationModel.sync();
    await VitalSignModel.sync();
    await ConsultationModel.sync();
    await PrescriptionModel.sync();
    await MedicationModel.sync();
    await CallModel.sync();

    console.log("All models synchronized successfully");

    // Seed the database if requested
    if (shouldSeed) {
      await seedDatabase();
    }
  } catch (error) {
    console.log("Unable to connect to database", error);
    throw error;
  }
};

export default DbInitialize;
