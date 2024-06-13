import { Request, Response } from "express";
import { IDoctorCreationBody } from "../interfaces/doctor.interface";
import DoctorService from "../services/doctor.service";
import UserService from "../services/user.services";
import Utility from "../utils/index.utils";
import { ResponseCode } from "../interfaces/enum/code.enum";
import { UserRoles } from "../interfaces/enum/user.enum";
import TimeSlotService from "../services/timeslot.service";
import { ITimeSlotCreationBody } from "../interfaces/timeslot.interface";

class DoctorController {
  private doctorService: DoctorService;
  private userService: UserService;
  private timeSlotService: TimeSlotService;

  constructor(
    _doctorService: DoctorService,
    _userService: UserService,
    _timeSlotService: TimeSlotService
  ) {
    this.doctorService = _doctorService;
    this.userService = _userService;
    this.timeSlotService = _timeSlotService;
  }

  async registerDoctor(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      const newDoctor = {
        userId: params.user.id,
        specialization: params.specialization,
        verificationStatus: params.verificationStatus,
        documents: params.documents,
      };
      // checkign if the doctor already exist
      let doctorExists = await this.doctorService.getDoctorByUserId(
        newDoctor.userId
      );
      if (doctorExists)
        return Utility.handleError(
          res,
          "We are sorry but you have already created a doctor account",
          ResponseCode.ALREADY_EXIST
        );

      // creating a new doctor
      const doctor = await this.doctorService.createDoctor(newDoctor);

      // Update the user's role to "doctor"
      await this.userService.updateUserRole(params.user.id, UserRoles.DOCTOR);
      return Utility.handleSuccess(
        res,
        "Doctor created successfully",
        { doctor },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  }

  async createTimeSlot(req: Request, res: Response) {
    try {
      const params = {...req.body}
      const newTimeSlot = {
        doctorId: params.user.id,
        startTime:params.startTime,
        endTime:params.endTime,
        isAvailable:params.isAvailable
      }

      const timeSlot = await this.timeSlotService.createTimeSlot(newTimeSlot);
      return Utility.handleSuccess(
        res,
        "Doctor created successfully",
        { timeSlot },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      res.status(500).json({ message: "Error creating time slot", error });
    }
  }
}

export default DoctorController;
