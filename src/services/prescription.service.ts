import PrescriptionDataSource from "../datasources/prescription.datasource";
import MedicationDataSource from "../datasources/medication.datasource";
import NotificationDataSource from "../datasources/notification.datasource";
import { DoctorService } from "./doctor.service";
import DoctorDataSource from "../datasources/doctor.datasource";
import PatientService from "./patient.service";
import EmailService from "./email.service";
import ConsultationService from "./consultation.service";
import UserService from "./user.services";
import AppointmentService from "./appointment.service";
import {
  IPrescription,
  IPrescriptionCreationBody,
  IPrescriptionDataSource,
} from "../interfaces/prescription.interface";
import { NotificationType } from "../interfaces/enum/notification.enum";
import { IMedication } from "../interfaces/medication.interface";
import sequelize from "../database";
import KycVerificationDataSource from "../datasources/kycVerification.datasource";
import { KycVerificationService } from "./kycVerfication.service";
import PatientDataSource from "../datasources/patient.datasource";
import UserDataSource from "../datasources/user.datasource";
import TokenDataSource from "../datasources/token.datasource";
import {appointmentService} from "../services/index"

const userDataSource = new UserDataSource();
const tokenDataSource = new TokenDataSource();
const userService = new UserService(userDataSource, tokenDataSource);
const kycVerificationService = new KycVerificationService(new KycVerificationDataSource(), userService);
const patientDataSource = new PatientDataSource();

class PrescriptionService {
  private prescriptionDataSource: PrescriptionDataSource;
  private medicationDataSource: MedicationDataSource;
  private notificationDataSource: NotificationDataSource;
  private doctorService: DoctorService;
  private patientService: PatientService;
  private consultationService: ConsultationService;
  private userService: UserService;
  private appointmentService: AppointmentService;
  private emailService: typeof EmailService;

  constructor() {
    this.prescriptionDataSource = new PrescriptionDataSource();
    this.medicationDataSource = new MedicationDataSource();
    this.notificationDataSource = new NotificationDataSource();
    this.doctorService = new DoctorService(
      new DoctorDataSource(),
      EmailService,
      userService,
      kycVerificationService
    );
    this.patientService = new PatientService(patientDataSource);
    this.consultationService = new ConsultationService();
    this.userService = userService;
    this.appointmentService = appointmentService;
    this.emailService = EmailService;
  }

  async createPrescription(
    record: Partial<IPrescription>,
    medications: IMedication[]
  ): Promise<IPrescription> {
    const transaction = await sequelize.transaction();

    try {
      // Create prescription
      const prescription = record as IPrescriptionCreationBody;
      const createdPrescription = await this.prescriptionDataSource.create(
        prescription,
        { transaction }
      );

      // Create medications
      const medicationsWithPrescriptionId = medications.map(medication => ({
        ...medication,
        prescriptionId: createdPrescription.id
      }));
      await this.medicationDataSource.bulkCreate(medicationsWithPrescriptionId, { transaction });

      // Get consultation to find appointment
      const consultation = await this.consultationService.getConsultationById(createdPrescription.consultationId);
      if (!consultation) {
        throw new Error("Consultation not found");
      }

      // Get appointment to find doctor and patient
      const appointment = await this.appointmentService.getAppointmentById(consultation.appointmentId);
      if (!appointment) {
        throw new Error("Appointment not found");
      }

      // Get doctor and patient records
      const doctor = await this.doctorService.getDoctorByField({ where: { id: appointment.doctorId } });
      const patient = await this.patientService.getPatientById(appointment.patientId);

      if (doctor && patient) {
        // Get user details for email
        const doctorUser = await this.userService.getUserByField({ id: doctor.userId });
        const patientUser = await this.userService.getUserByField({ id: patient.userId });

        if (doctorUser && patientUser) {
          // Send email to patient
          await this.emailService.sendPrescriptionEmail({
            patientEmail: patientUser.email,
            patientName: `${patientUser.firstname} ${patientUser.lastname}`,
            doctorName: `${doctorUser.firstname} ${doctorUser.lastname}`,
            date: new Date(createdPrescription.createdAt).toLocaleString(),
            instructions: createdPrescription.instructions || '',
            medications: medications.map(med => ({
              name: med.name,
              dosage: med.dosage,
              frequency: med.frequency,
              duration: med.duration.toString()
            }))
          });

          // Create notification
          await this.notificationDataSource.create({
            userId: patient.userId,
            message: "New prescription has been issued",
            type: NotificationType.PRESCRIPTION,
            referenceId: createdPrescription.id,
            read: false
          });
        }
      }

      await transaction.commit();
      return createdPrescription;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getPrescriptionById(prescriptionId: string): Promise<IPrescription | null> {
    return await this.prescriptionDataSource.fetchOne({
      where: { id: prescriptionId },
    });
  }

  async updatePrescription(
    id: string,
    data: Partial<IPrescription>,
    medications: IMedication[]
  ): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      // Update prescription
      const filter = { where: { id } };
      await this.prescriptionDataSource.updateOne(data, filter);

      // Delete existing medications
      await this.medicationDataSource.deleteMany({ where: { prescriptionId: id } });

      // Create new medications
      const medicationsWithPrescriptionId = medications.map(medication => ({
        ...medication,
        prescriptionId: id
      }));
      await this.medicationDataSource.bulkCreate(medicationsWithPrescriptionId, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getPrescriptions(): Promise<IPrescription[]> {
    const query = { where: {}, raw: true };
    return this.prescriptionDataSource.fetchAll(query);
  }

  async deletePrescription(prescriptionId: string): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      // Delete medications first
      await this.medicationDataSource.deleteMany({ where: { prescriptionId } });
      
      // Then delete prescription
      await this.prescriptionDataSource.deleteOne({ where: { id: prescriptionId } });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default PrescriptionService;