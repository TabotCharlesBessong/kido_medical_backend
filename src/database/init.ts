import { Sequelize, Dialect } from "sequelize";
import config from "../../config/config.json";
import UserModel from "../models/user.model";
import TokenModel from "../models/token.model";
import DoctorModel from "../models/doctor.model";
import PatientModel from "../models/patient.model";
import TimeSlotModel from "../models/timeslot.model";
import AppointmentModel from "../models/appointment.model";
import PostModel from "../models/post.model";
import CommentModel from "../models/comment.model";
import LikeModel from "../models/like.model";
import MessageModel from "../models/message.model";
import NotificationModel from "../models/notification.model";
import VitalSignModel from "../models/vitalsign.model";
import ConsultationModel from "../models/consultation.model";
import PrescriptionModel from "../models/prescription.model";
import MedicationModel from "../models/medication.model";
import CallModel from "../models/call.model";

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

export const DbInitialize = async () => {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    // Sync all models in the correct order to handle associations
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

    console.log("All models synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
};

export default DbInitialize;
