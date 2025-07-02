import { Request, Response } from "express";
import PatientService from "../services/patient.service";
import AppointmentService from "../services/appointment.service";
import TimeSlotService from "../services/timeslot.service";
import { IAppointmentCreationBody } from "../interfaces/appointment.interface";
import { ITimeSlot } from "../interfaces/timeslot.interface";
import { IUser } from "../interfaces/user.interfaces";
import { IAppointment } from "../interfaces/appointment.interface";
import { ResponseCode } from "../interfaces/enum/code.enum";
import Utility from "../utils/index.utils";
import { IPatient } from "../interfaces/patient.interface";
import PatientDataSource from "../datasources/patient.datasource";

const patientDataSource = new PatientDataSource();

class PatientController {
  private patientService: PatientService;
  private appointmentService: AppointmentService;
  private timeSlotService: TimeSlotService;

  constructor() {
    this.patientService = new PatientService(patientDataSource);
    this.appointmentService = new AppointmentService();
    this.timeSlotService = new TimeSlotService();
  }

  async createPatient(req: Request, res: Response): Promise<void> {
    try {
      const patient = await this.patientService.createPatient(req.body);
      res.status(201).json({
        status: true,
        message: "Patient created successfully",
        data: patient,
      });
    } catch (error: any) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  }

  async getPatientById(req: Request, res: Response): Promise<void> {
    try {
      const patient = await this.patientService.getPatientById(req.params.id);
      if (!patient) {
        res.status(404).json({
          status: false,
          message: "Patient not found",
        });
        return;
      }
      res.status(200).json({
        status: true,
        message: "Patient retrieved successfully",
        data: patient,
      });
    } catch (error: any) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  }

  async updatePatient(req: Request, res: Response): Promise<void> {
    try {
      const patient = await this.patientService.updatePatient(req.params.id, req.body);
      if (!patient) {
        res.status(404).json({
          status: false,
          message: "Patient not found",
        });
        return;
      }
      res.status(200).json({
        status: true,
        message: "Patient updated successfully",
        data: patient,
      });
    } catch (error: any) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  }

  async deletePatient(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const patient = await this.patientService.getPatientById(id);
      if (!patient) {
        return res.status(404).json({
          status: false,
          message: "Patient not found",
        });
      }
      await this.patientService.deletePatient(id);
      return res.status(200).json({
        status: true,
        message: "Patient deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: (error as Error).message,
      });
    }
  }

  async getAllPatients(req: Request, res: Response): Promise<void> {
    try {
      const patients = await this.patientService.getAllPatients();
      res.status(200).json({
        status: true,
        message: "Patients retrieved successfully",
        data: patients,
      });
    } catch (error: any) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  }

  async bookAppointment(req: Request & { user?: IUser }, res: Response): Promise<void> {
    try {
      const { doctorId, timeslotId, date, reason } = req.body;
      const patient = req.user;

      if (!patient) {
        res.status(401).json({
          status: false,
          message: "User not authenticated",
        });
        return;
      }

      // Check if timeslot is available
      const timeSlot = await this.timeSlotService.getTimeSlotById(timeslotId);
      if (!timeSlot) {
        res.status(404).json({
          status: false,
          message: "Time slot not found",
        });
        return;
      }

      if (!timeSlot.isAvailable) {
        res.status(400).json({
          status: false,
          message: "Time slot is not available",
        });
        return;
      }

      // Create appointment with required fields
      const newAppointment: IAppointmentCreationBody = {
        patientId: patient.id,
        doctorId,
        timeSlotId: timeslotId,
        status: "PENDING"
      };

      const appointment = await this.appointmentService.createAppointment(newAppointment);

      // Update timeslot availability
      await this.timeSlotService.updateTimeSlot(timeslotId, { isAvailable: false });

      res.status(201).json({
        status: true,
        message: "Appointment booked successfully",
        data: appointment,
      });
    } catch (error: any) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  }

  async getPatientAppointments(req: Request & { user?: IUser }, res: Response): Promise<void> {
    try {
      const patient = req.user;
      if (!patient) {
        res.status(401).json({
          status: false,
          message: "User not authenticated",
        });
        return;
      }

      const appointments = await this.appointmentService.getAppointmentsByPatientId(patient.id);
      res.status(200).json({
        status: true,
        message: "Appointments retrieved successfully",
        data: appointments,
      });
    } catch (error: any) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  }

  async getAllAppointments(req: Request, res: Response): Promise<void> {
    try {
      const appointments = await this.appointmentService.getAllAppointments();
      res.status(200).json({
        status: true,
        message: "Appointments retrieved successfully",
        data: appointments,
      });
    } catch (error: any) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  }

  async updateAppointment(req: Request, res: Response): Promise<void> {
    try {
      const appointment = await this.appointmentService.updateAppointment(req.params.id, req.body);
      if (!appointment) {
        res.status(404).json({
          status: false,
          message: "Appointment not found",
        });
        return;
      }
      res.status(200).json({
        status: true,
        message: "Appointment updated successfully",
        data: appointment,
      });
    } catch (error: any) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  }

  async getAppointmentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const appointment = await this.appointmentService.getAppointmentById(id);
      if (!appointment) {
        return res.status(404).json({
          status: false,
          message: "Appointment not found",
        });
      }
      return res.status(200).json({
        status: true,
        message: "Appointment retrieved successfully",
        data: appointment,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: (error as Error).message,
      });
    }
  }
}

export default PatientController;
