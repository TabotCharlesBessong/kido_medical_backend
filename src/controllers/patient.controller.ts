import { Request, Response } from "express";
import PatientService from "../services/patient.service";
import { appointmentService } from '../services/index';
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
  private appointmentService!: typeof appointmentService;
  private timeSlotService: TimeSlotService;

  constructor() {
    this.patientService = new PatientService(patientDataSource);
    this.timeSlotService = new TimeSlotService();
  }

  async createPatient(req: Request & { user?: IUser }, res: Response): Promise<void> {
    try {
      // The Auth middleware sets user in req.body.user, not req.user
      const user = req.body.user;
      
      if (!user) {
        res.status(401).json({
          status: false,
          message: "User not authenticated",
        });
        return;
      }

      // Add userId to the request body
      const patientData = {
        ...req.body,
        userId: user.id
      };

      const patient = await this.patientService.createPatient(patientData);
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
      const patient = await this.patientService.getPatientById(req.params.userId);
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
      const patient = await this.patientService.updatePatient(req.params.userId, req.body);
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
      const patient = req.body.user;

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
      const patient = req.body.user;
      if (!patient) {
        res.status(401).json({
          status: false,
          message: "User not authenticated",
        });
        return;
      }

      // Get patient record to ensure we have the correct patient ID
      const patientRecord = await this.patientService.getPatientById(patient.id);
      if (!patientRecord) {
        res.status(404).json({
          status: false,
          message: "Patient record not found",
        });
        return;
      }

      const appointments = await this.appointmentService.getAppointmentsByPatientId(patientRecord.id);
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

  async getPatientPrescriptions(req: Request & { user?: IUser }, res: Response): Promise<void> {
    try {
      const patient = req.body.user;
      if (!patient) {
        res.status(401).json({
          status: false,
          message: "User not authenticated",
        });
        return;
      }

      // Get patient record to ensure we have the correct patient ID
      const patientRecord = await this.patientService.getPatientById(patient.id);
      if (!patientRecord) {
        res.status(404).json({
          status: false,
          message: "Patient record not found",
        });
        return;
      }

      // Get appointments for this patient
      const appointments = await this.appointmentService.getAppointmentsByPatientId(patientRecord.id);
      
      // Get consultations for those appointments
      const consultationService = new (await import("../services/consultation.service")).default();
      const consultationPromises = appointments.map(appointment => 
        consultationService.getConsultationById(appointment.id)
      );
      
      const consultations = await Promise.all(consultationPromises);
      const validConsultations = consultations.filter(consultation => consultation !== null);
      
      // Get prescriptions for those consultations
      const prescriptionService = new (await import("../services/prescription.service")).default();
      const prescriptionPromises = validConsultations.map(consultation => 
        prescriptionService.getPrescriptionById(consultation!.id)
      );
      
      const prescriptions = await Promise.all(prescriptionPromises);
      const validPrescriptions = prescriptions.filter(prescription => prescription !== null);

      res.status(200).json({
        status: true,
        message: "Patient prescriptions retrieved successfully",
        data: validPrescriptions,
      });
    } catch (error: any) {
      res.status(400).json({
        status: false,
        message: error.message,
      });
    }
  }

  async getPatientConsultations(req: Request & { user?: IUser }, res: Response): Promise<void> {
    try {
      const patient = req.body.user;
      if (!patient) {
        res.status(401).json({
          status: false,
          message: "User not authenticated",
        });
        return;
      }

      // Get patient record to ensure we have the correct patient ID
      const patientRecord = await this.patientService.getPatientById(patient.id);
      if (!patientRecord) {
        res.status(404).json({
          status: false,
          message: "Patient record not found",
        });
        return;
      }

      // Get appointments for this patient
      const appointments = await this.appointmentService.getAppointmentsByPatientId(patientRecord.id);
      
      // Get consultations for those appointments
      const consultationService = new (await import("../services/consultation.service")).default();
      const consultationPromises = appointments.map(appointment => 
        consultationService.getConsultationById(appointment.id)
      );
      
      const consultations = await Promise.all(consultationPromises);
      const validConsultations = consultations.filter(consultation => consultation !== null);

      res.status(200).json({
        status: true,
        message: "Patient consultations retrieved successfully",
        data: validConsultations,
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
