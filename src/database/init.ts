import AppointmentModel from "../models/appointment.model";
import CommentModel from "../models/comment.model";
import DoctorModel from "../models/doctor.model";
import LikeModel from "../models/like.model";
import MessageModel from "../models/message.model";
import NotificationModel from "../models/notification.model";
import PatientModel from "../models/patient.model";
import PostModel from "../models/post.model";
import TimeSlotModel from "../models/timeslot.model";
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
    TimeSlotModel.sync({ alter: false });
    PostModel.sync({ alter: false });
    CommentModel.sync({ alter: false });
    LikeModel.sync({ alter: false });
    // PatientModel.sync({ alter: false });
    // AppointmentModel.sync({ alter: false });
    // MessageModel.sync({ alter: false });
    // NotificationModel.sync({ alter: false });
  } catch (error) {
    console.log("Unable to connect our database", error);
  }
};

export default DbInitialize;
