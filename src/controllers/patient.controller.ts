import { Request, Response } from "express";
import PatientService from "../services/patient.service";
import { ResponseCode } from "../interfaces/enum/code.enum";
import Utility from "../utils/index.utils";
import { IPatient } from "../interfaces/patient.interface";
import AppointmentService from "../services/appointment.service";

class PatientController {
  private patientService: PatientService;
  private appointmentService: AppointmentService;

  constructor(
    _patientService: PatientService,
    _appointmentService: AppointmentService
  ) {
    this.patientService = _patientService;
    this.appointmentService = _appointmentService;
  }

  async createPatient(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      const newPatient = {
        userId: params.user.id,
        age: params.age,
        gender: params.gender,
      };

      // checkign if the patient already exist
      let patientExists = await this.patientService.getPatientById(
        newPatient.userId
      );
      if (patientExists)
        return Utility.handleError(
          res,
          "We are sorry but you have already created a patient account",
          ResponseCode.ALREADY_EXIST
        );
      const patient = await this.patientService.createPatient(newPatient);
      return Utility.handleSuccess(
        res,
        "Patient Info created successfully",
        { patient },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      res
        .status(ResponseCode.SERVER_ERROR)
        .json({ message: (error as TypeError).message });
    }
  }

  async getPatientById(req: Request, res: Response) {
    try {
      const patient = await this.patientService.getPatientById(
        req.params.userId
      );
      if (!patient)
        return Utility.handleError(
          res,
          "Could not get patient",
          ResponseCode.NOT_FOUND
        );
      else
        return Utility.handleSuccess(
          res,
          "Account fetched successfully",
          { patient },
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

  async updatePatient(req: Request, res: Response) {
    try {
      const patientId = req.params.userId;
      const data = { ...req.body };
      const patient = await this.patientService.updatePatient(patientId, data);
      return Utility.handleSuccess(
        res,
        "Post updated successfully",
        { patient },
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

  async bookAppointment(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      const newAppointment = {
        patientId: params.user.id,
        doctorId: params.doctorId,
        timeslotId: params.timeslotId,
        date: params.date,
        reason: params.reason,
      };
      const appointment = await this.appointmentService.createAppointment(
        newAppointment
      );
      return Utility.handleSuccess(
        res,
        "Doctor created successfully",
        { appointment },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      res.status(ResponseCode.SERVER_ERROR).json((error as TypeError).message);
    }
  }

  async getAppointmentById(req: Request, res: Response) {
    try {
      const appointment = await this.appointmentService.getAppointmentById(
        req.params.appointmentId
      );
      if (!appointment)
        return Utility.handleError(
          res,
          "Could not get appointment",
          ResponseCode.NOT_FOUND
        );
      else
        return Utility.handleSuccess(
          res,
          "Account fetched successfully",
          { appointment },
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

  async getAllAppointments(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      let appointments = await this.appointmentService.getAppointments();
      return Utility.handleSuccess(
        res,
        "Account fetched successfully",
        { appointments },
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

  // async getAllAppointments(req: Request, res: Response) {
  //   try {
  //     const query = req.query;
  //     const appointments = await this.appointmentService.fetchAllAppointments(query);
  //     return Utility.handleSuccess(
  //       res,
  //       "Appointments fetched successfully",
  //       { appointments },
  //       ResponseCode.SUCCESS
  //     );
  //   } catch (error) {
  //     return Utility.handleError(
  //       res,
  //       (error as TypeError).message,
  //       ResponseCode.SERVER_ERROR
  //     );
  //   }
  // }

  async updateAppointment(req: Request, res: Response) {
    try {
      await this.appointmentService.updateAppointment(req.params.id, req.body);
      return Utility.handleSuccess(
        res,
        "Appointment updated successfully",
        {  },
        ResponseCode.SUCCESS
      );
    } catch (error) {
      res.status(ResponseCode.SERVER_ERROR).json((error as TypeError).message);
    }
  }
}

export default PatientController;
