import { Request, Response } from "express";
import sequelize from "../database";
import { ResponseCode } from "../interfaces/enum/code.enum";
import { UserRoles } from "../interfaces/enum/user.enum";
import AppointmentService from "../services/appointment.service";
import DoctorService from "../services/doctor.service";
import TimeSlotService from "../services/timeslot.service";
import UserService from "../services/user.services";
import Utility from "../utils/index.utils";
import VitalSignService from "../services/vitalsign.services";

class DoctorController {
  private doctorService: DoctorService;
  private userService: UserService;
  private timeSlotService: TimeSlotService;
  private appointmentService: AppointmentService;
  private vitalsignService: VitalSignService;

  constructor() {
    this.doctorService = new DoctorService();
    this.userService = new UserService();
    this.timeSlotService = new TimeSlotService();
    this.appointmentService = new AppointmentService();
    this.vitalsignService = new VitalSignService();
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

  async getAllDoctors(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      let doctors = await this.doctorService.getDoctors();
      return Utility.handleSuccess(
        res,
        "Account fetched successfully",
        { doctors },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async getAllTimeSlots(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      let timeslots = await this.timeSlotService.getTimeSlots();
      return Utility.handleSuccess(
        res,
        "Account fetched successfully",
        { timeslots },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async createTimeSlot(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      const newTimeSlot = {
        doctorId: params.user.id,
        startTime: params.startTime,
        endTime: params.endTime,
        isAvailable: params.isAvailable,
      };

      const timeSlot = await this.timeSlotService.createTimeSlot(newTimeSlot);
      return Utility.handleSuccess(
        res,
        "Doctor created successfully",
        { timeSlot },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      res.status(ResponseCode.SERVER_ERROR).json((error as TypeError).message);
    }
  }

  async approveAppointment(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      await this.appointmentService.approveAppointment(id);
      await transaction.commit();
      return Utility.handleSuccess(
        res,
        "Appointment approved successfully",
        {},
        ResponseCode.SUCCESS
      );
    } catch (error) {
      await transaction.rollback();
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async cancelAppointment(req: Request, res: Response) {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      await this.appointmentService.cancelAppointment(id);
      await transaction.commit();
      return Utility.handleSuccess(
        res,
        "Appointment canceled successfully",
        {},
        ResponseCode.SUCCESS
      );
    } catch (error) {
      await transaction.rollback();
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }

  async createVitalSing(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      const newSigns = {
        doctorId: params.user.id,
        patientId: params.patientId,
        appointmentId: params.appointmentId,
        weight: params.weight,
        height: params.height,
        bloodPressure: params.bloodPressure,
        pulse: params.pulse,
        respiratoryRate: params.respiratoryRate,
        temperature: params.temperature,
      };
      const post = await this.vitalsignService.recordVitalSigns(newSigns);
      return Utility.handleSuccess(
        res,
        "Vital signs created successfully",
        { post },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      return Utility.handleError(
        res,
        (error as TypeError).message,
        ResponseCode.SERVER_ERROR
      );
    }
  }
}

export default DoctorController;
