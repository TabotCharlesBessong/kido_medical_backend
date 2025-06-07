import { Request, Response } from "express";
import sequelize from "../database";
import { ResponseCode } from "../interfaces/enum/code.enum";
import { UserRoles } from "../interfaces/enum/user.enum";
import AppointmentService from "../services/appointment.service";
import { DoctorService } from "../services/doctor.service";
import TimeSlotService from "../services/timeslot.service";
import UserService from "../services/user.services";
import Utility from "../utils/index.utils";
import VitalSignService from "../services/vitalsign.services";
import ConsultationService from "../services/consultation.service";
import PrescriptionService from "../services/prescription.service";
import EmailService from "../services/email.service";
import UploadService from "../services/upload.service";
import DoctorDataSource from '../datasources/doctor.datasource';
import { UserTypes } from '../enums/user.types';
import { IUserService } from '../interfaces/services.interface';
import { IEmailService } from '../interfaces/email.interface';
import { IUploadService } from '../interfaces/services.interface';

export class DoctorController {
  private doctorService: DoctorService;
  private userService: IUserService;
  private timeSlotService: TimeSlotService;
  private appointmentService: AppointmentService;
  private vitalsignService: VitalSignService;
  private consultationService: ConsultationService;
  private prescriptionService: PrescriptionService;
  private emailService: IEmailService;
  private uploadService: IUploadService;

  constructor() {
    const userService = new UserService();
    this.doctorService = new DoctorService(
      new DoctorDataSource(),
      EmailService,
      userService
    );
    this.timeSlotService = new TimeSlotService();
    this.appointmentService = new AppointmentService();
    this.vitalsignService = new VitalSignService();
    this.consultationService = new ConsultationService();
    this.prescriptionService = new PrescriptionService();
    this.userService = userService;
    this.emailService = EmailService;
    this.uploadService = UploadService;
  }

  async registerDoctor(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      const file = req.file;

      if (file) {
        const fileUrl = await this.uploadService.uploadFile(file);
        params.documents = fileUrl;
      }

      const newDoctor = {
        userId: params.user.id,
        specialization: params.specialization,
        verificationStatus: params.verificationStatus,
        documents: params.documents,
        fee: params.fee,
        language: params.language,
        experience: params.experience,
        isVerified: false // Default value for new doctors
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
      return res.status(ResponseCode.SERVER_ERROR).json((error as TypeError).message);
    }
  }

  async getDoctorById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const doctor = await this.doctorService.getDoctorByField({ where: { id } });
      if (!doctor) {
        return res.status(404).json({
          status: 'error',
          message: 'Doctor not found'
        });
      }
      return res.status(200).json({
        status: 'success',
        data: doctor
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: (error as Error).message
      });
    }
  }

  async getDoctors(req: Request, res: Response) {
    try {
      const doctors = await this.doctorService.getDoctors();
      return res.status(200).json({
        status: 'success',
        data: doctors
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: (error as Error).message
      });
    }
  }

  async getAllTimeSlots(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      let timeslots = await this.timeSlotService.getTimeSlots();
      return Utility.handleSuccess(
        res,
        "All time slots fetched successfully",
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

  async getDoctorTimeSlots(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      
      // First get the doctor using the user ID
      const doctor = await this.doctorService.getDoctorByUserId(params.user.id);
      
      if (!doctor) {
        return Utility.handleError(
          res,
          "Doctor not found",
          ResponseCode.NOT_FOUND
        );
      }

      const timeslots = await this.timeSlotService.getTimeSlotsByDoctor(doctor.id);
      return Utility.handleSuccess(
        res,
        "Doctor time slots fetched successfully",
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
      
      // First get the doctor using the user ID
      const doctor = await this.doctorService.getDoctorByUserId(params.user.id);
      
      if (!doctor) {
        return Utility.handleError(
          res,
          "Doctor not found",
          ResponseCode.NOT_FOUND
        );
      }

      const newTimeSlot = {
        doctorId: doctor.id, // Use the doctor's ID instead of user's ID
        startTime: params.startTime,
        endTime: params.endTime,
        isAvailable: params.isAvailable,
      };

      const timeSlot = await this.timeSlotService.createTimeSlot(newTimeSlot);
      return Utility.handleSuccess(
        res,
        "Time slot created successfully",
        { timeSlot },
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
      const vitalSign = await this.vitalsignService.recordVitalSigns(params);
      return Utility.handleSuccess(
        res,
        "Vital sign created successfully",
        { vitalSign },
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

  async getVitalsById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const vitalSign = await this.vitalsignService.getVitalSignsById(id);
      if (!vitalSign) {
        return Utility.handleError(
          res,
          "Vital sign not found",
          ResponseCode.NOT_FOUND
        );
      }
      return Utility.handleSuccess(
        res,
        "Vital sign fetched successfully",
        { vitalSign },
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

  async updateVitals(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const params = { ...req.body };
      await this.vitalsignService.updateVitalSigns(id, params);
      return Utility.handleSuccess(
        res,
        "Vital sign updated successfully",
        {},
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

  async destroyVitals(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.vitalsignService.deleteVitalSigns(id);
      return Utility.handleSuccess(
        res,
        "Vital sign deleted successfully",
        {},
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

  async getAllVitals(req: Request, res: Response) {
    try {
      const vitalSigns = await this.vitalsignService.getVitalSigns();
      return Utility.handleSuccess(
        res,
        "Vital signs fetched successfully",
        { vitalSigns },
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

  async createConsultation(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      const consultation = await this.consultationService.createConsultation(params);
      return Utility.handleSuccess(
        res,
        "Consultation created successfully",
        { consultation },
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

  async getConsultationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const consultation = await this.consultationService.getConsultationById(id);
      if (!consultation) {
        return Utility.handleError(
          res,
          "Consultation not found",
          ResponseCode.NOT_FOUND
        );
      }
      return Utility.handleSuccess(
        res,
        "Consultation fetched successfully",
        { consultation },
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

  async updateConsultation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const params = { ...req.body };
      await this.consultationService.updateConsultation(id, params);
      return Utility.handleSuccess(
        res,
        "Consultation updated successfully",
        {},
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

  async destroyConsultation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.consultationService.deleteConsultation(id);
      return Utility.handleSuccess(
        res,
        "Consultation deleted successfully",
        {},
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

  async getAllConsultations(req: Request, res: Response) {
    try {
      const consultations = await this.consultationService.getConsultations();
      return Utility.handleSuccess(
        res,
        "Consultations fetched successfully",
        { consultations },
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

  async createPrescription(req: Request, res: Response) {
    try {
      const params = { ...req.body };
      const { prescription, medications } = params;
      const newPrescription = await this.prescriptionService.createPrescription(prescription, medications);
      return Utility.handleSuccess(
        res,
        "Prescription created successfully",
        { prescription: newPrescription },
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

  async getPrescriptionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const prescription = await this.prescriptionService.getPrescriptionById(id);
      if (!prescription) {
        return Utility.handleError(
          res,
          "Prescription not found",
          ResponseCode.NOT_FOUND
        );
      }
      return Utility.handleSuccess(
        res,
        "Prescription fetched successfully",
        { prescription },
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

  async updatePrescription(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { prescription, medications } = req.body;
      await this.prescriptionService.updatePrescription(id, prescription, medications);
      return Utility.handleSuccess(
        res,
        "Prescription updated successfully",
        {},
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

  async getPrescriptions(req: Request, res: Response) {
    try {
      const prescriptions = await this.prescriptionService.getPrescriptions();
      return Utility.handleSuccess(
        res,
        "Prescriptions fetched successfully",
        { prescriptions },
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

  async destroyPrescription(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.prescriptionService.deletePrescription(id);
      return Utility.handleSuccess(
        res,
        "Prescription deleted successfully",
        {},
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

  async updateDoctor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.doctorService.updateDoctor(id, req.body);
      return res.status(200).json({
        status: 'success',
        message: 'Doctor updated successfully'
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: (error as Error).message
      });
    }
  }

  async approveDoctor(req: Request, res: Response) {
    try {
      const { email } = req.query;
      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          status: 'error',
          message: 'Doctor email is required'
        });
      }

      await this.doctorService.verifyDoctor(email, 'APPROVED');
      return res.status(200).json({
        status: 'success',
        message: 'Doctor approved successfully'
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: (error as Error).message
      });
    }
  }

  async declineDoctor(req: Request, res: Response) {
    try {
      const { email } = req.query;
      const { notes } = req.body;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          status: 'error',
          message: 'Doctor email is required'
        });
      }

      if (!notes) {
        return res.status(400).json({
          status: 'error',
          message: 'Decline reason is required'
        });
      }

      await this.doctorService.verifyDoctor(email, 'REJECTED', notes);
      return res.status(200).json({
        status: 'success',
        message: 'Doctor registration declined'
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: (error as Error).message
      });
    }
  }
}

export default DoctorController;
