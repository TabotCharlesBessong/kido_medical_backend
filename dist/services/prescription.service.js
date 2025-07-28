"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prescription_datasource_1 = __importDefault(require("../datasources/prescription.datasource"));
const medication_datasource_1 = __importDefault(require("../datasources/medication.datasource"));
const notification_datasource_1 = __importDefault(require("../datasources/notification.datasource"));
const doctor_service_1 = require("./doctor.service");
const doctor_datasource_1 = __importDefault(require("../datasources/doctor.datasource"));
const patient_service_1 = __importDefault(require("./patient.service"));
const email_service_1 = __importDefault(require("./email.service"));
const consultation_service_1 = __importDefault(require("./consultation.service"));
const user_services_1 = __importDefault(require("./user.services"));
const notification_enum_1 = require("../interfaces/enum/notification.enum");
const database_1 = __importDefault(require("../database"));
const kycVerification_datasource_1 = __importDefault(require("../datasources/kycVerification.datasource"));
const kycVerfication_service_1 = require("./kycVerfication.service");
const patient_datasource_1 = __importDefault(require("../datasources/patient.datasource"));
const user_datasource_1 = __importDefault(require("../datasources/user.datasource"));
const token_datasource_1 = __importDefault(require("../datasources/token.datasource"));
const index_1 = require("../services/index");
const userDataSource = new user_datasource_1.default();
const tokenDataSource = new token_datasource_1.default();
const userService = new user_services_1.default(userDataSource, tokenDataSource);
const kycVerificationService = new kycVerfication_service_1.KycVerificationService(new kycVerification_datasource_1.default(), userService);
const patientDataSource = new patient_datasource_1.default();
class PrescriptionService {
    constructor() {
        this.prescriptionDataSource = new prescription_datasource_1.default();
        this.medicationDataSource = new medication_datasource_1.default();
        this.notificationDataSource = new notification_datasource_1.default();
        this.doctorService = new doctor_service_1.DoctorService(new doctor_datasource_1.default(), email_service_1.default, userService, kycVerificationService);
        this.patientService = new patient_service_1.default(patientDataSource);
        this.consultationService = new consultation_service_1.default();
        this.userService = userService;
        this.appointmentService = index_1.appointmentService;
        this.emailService = email_service_1.default;
    }
    createPrescription(record, medications) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield database_1.default.transaction();
            try {
                // Create prescription
                const prescription = record;
                const createdPrescription = yield this.prescriptionDataSource.create(prescription, { transaction });
                // Create medications
                const medicationsWithPrescriptionId = medications.map(medication => (Object.assign(Object.assign({}, medication), { prescriptionId: createdPrescription.id })));
                yield this.medicationDataSource.bulkCreate(medicationsWithPrescriptionId, { transaction });
                // Get consultation to find appointment
                const consultation = yield this.consultationService.getConsultationById(createdPrescription.consultationId);
                if (!consultation) {
                    throw new Error("Consultation not found");
                }
                // Get appointment to find doctor and patient
                const appointment = yield this.appointmentService.getAppointmentById(consultation.appointmentId);
                if (!appointment) {
                    throw new Error("Appointment not found");
                }
                // Get doctor and patient records
                const doctor = yield this.doctorService.getDoctorByField({ where: { id: appointment.doctorId } });
                const patient = yield this.patientService.getPatientById(appointment.patientId);
                if (doctor && patient) {
                    // Get user details for email
                    const doctorUser = yield this.userService.getUserByField({ id: doctor.userId });
                    const patientUser = yield this.userService.getUserByField({ id: patient.userId });
                    if (doctorUser && patientUser) {
                        // Send email to patient
                        yield this.emailService.sendPrescriptionEmail({
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
                        yield this.notificationDataSource.create({
                            userId: patient.userId,
                            message: "New prescription has been issued",
                            type: notification_enum_1.NotificationType.PRESCRIPTION,
                            referenceId: createdPrescription.id,
                            read: false
                        });
                    }
                }
                yield transaction.commit();
                return createdPrescription;
            }
            catch (error) {
                yield transaction.rollback();
                throw error;
            }
        });
    }
    getPrescriptionById(prescriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prescriptionDataSource.fetchOne({
                where: { id: prescriptionId },
            });
        });
    }
    updatePrescription(id, data, medications) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield database_1.default.transaction();
            try {
                // Update prescription
                const filter = { where: { id } };
                yield this.prescriptionDataSource.updateOne(data, filter);
                // Delete existing medications
                yield this.medicationDataSource.deleteMany({ where: { prescriptionId: id } });
                // Create new medications
                const medicationsWithPrescriptionId = medications.map(medication => (Object.assign(Object.assign({}, medication), { prescriptionId: id })));
                yield this.medicationDataSource.bulkCreate(medicationsWithPrescriptionId, { transaction });
                yield transaction.commit();
            }
            catch (error) {
                yield transaction.rollback();
                throw error;
            }
        });
    }
    getPrescriptions() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { where: {}, raw: true };
            return this.prescriptionDataSource.fetchAll(query);
        });
    }
    deletePrescription(prescriptionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield database_1.default.transaction();
            try {
                // Delete medications first
                yield this.medicationDataSource.deleteMany({ where: { prescriptionId } });
                // Then delete prescription
                yield this.prescriptionDataSource.deleteOne({ where: { id: prescriptionId } });
                yield transaction.commit();
            }
            catch (error) {
                yield transaction.rollback();
                throw error;
            }
        });
    }
}
exports.default = PrescriptionService;
