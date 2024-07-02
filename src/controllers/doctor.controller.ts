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
import ConsultationService from "../services/consultation.service";
import PrescriptionService from "../services/prescription.service";

class DoctorController {
  private doctorService: DoctorService;
  private userService: UserService;
  private timeSlotService: TimeSlotService;
  private appointmentService: AppointmentService;
  private vitalsignService: VitalSignService;
  private consultationService: ConsultationService;
  private prescriptionService: PrescriptionService;

  constructor() {
    this.doctorService = new DoctorService();
    this.userService = new UserService();
    this.timeSlotService = new TimeSlotService();
    this.appointmentService = new AppointmentService();
    this.vitalsignService = new VitalSignService();
    this.consultationService = new ConsultationService();
    this.prescriptionService = new PrescriptionService();
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

  async getVitalsById(req: Request, res: Response) {
    try {
      const vitalId = req.params.vitalId;
      const vital = await this.vitalsignService.getVitalSignsById(vitalId);
      if (!vital) {
        return Utility.handleError(
          res,
          "Vital signs not created yet",
          ResponseCode.NOT_FOUND
        );
      }
      return Utility.handleSuccess(
        res,
        "Post retrieved successfully",
        { vital },
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
      const vitalId = req.params.vitalId;
      const data = { ...req.body };
      const vitals = await this.vitalsignService.updateVitalSigns(
        vitalId,
        data
      );
      return Utility.handleSuccess(
        res,
        "Vitals updated successfully",
        { vitals },
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
      const vitalId = req.params.vitalId;
      await this.vitalsignService.deleteVitalSigns(vitalId);
      return Utility.handleSuccess(
        res,
        "Vitals deleted successfully",
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
      const params = { ...req.body };
      let vitals = await this.vitalsignService.getVitalSigns();
      return Utility.handleSuccess(
        res,
        "Account fetched successfully",
        { vitals },
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
      const newConsultation = {
        doctorId: params.user.id,
        patientId: params.patientId,
        appointmentId: params.appointmentId,
        presentingComplaints: params.presentingComplaints,
        pastHistory: params.pastHistory,
        diagnosticImpression: params.diagnosticImpression,
        investigations: params.investigations,
        treatment: params.treatment,
      };
      const post = await this.consultationService.createConsultation(
        newConsultation
      );
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

  async getConsultationById(req: Request, res: Response) {
    try {
      const consultationId = req.params.consultationId;
      const consultation = await this.consultationService.getConsultationById(
        consultationId
      );
      if (!consultation) {
        return Utility.handleError(
          res,
          "No existing consultation",
          ResponseCode.NOT_FOUND
        );
      }
      return Utility.handleSuccess(
        res,
        "Consultation retrieved successfully",
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
      const consultationId = req.params.consultationId;
      const data = { ...req.body };
      const consultations = await this.consultationService.updateConsultation(
        consultationId,
        data
      );
      return Utility.handleSuccess(
        res,
        "Vitals updated successfully",
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

  async destroyConsultation(req: Request, res: Response) {
    try {
      const consultationId = req.params.consultationId;
      await this.consultationService.deleteConsultation(consultationId);
      return Utility.handleSuccess(
        res,
        "Consulation deleted successfully",
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
      const params = { ...req.body };
      let consultations = await this.consultationService.getConsultations();
      return Utility.handleSuccess(
        res,
        "Account fetched successfully",
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
    const transaction = await sequelize.transaction();
    try {
      const { prescription, medications } = req.body;
      const newPrescription = await this.prescriptionService.createPrescription(
        prescription,
        medications
      );
      await transaction.commit();
      return Utility.handleSuccess(
        res,
        "Prescription created successfully",
        { newPrescription },
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

  async getPrescriptionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const prescription = await this.prescriptionService.getPrescriptionById(
        id
      );
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
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { prescription, medications } = req.body;
      await this.prescriptionService.updatePrescription(
        id,
        prescription,
        medications
      );
      await transaction.commit();
      return Utility.handleSuccess(
        res,
        "Prescription updated successfully",
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
      const prescriptionId = req.params.prescriptionId;
      await this.prescriptionService.deletePrescription;
      return Utility.handleSuccess(
        res,
        "Consulation deleted successfully",
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
}

export default DoctorController;
