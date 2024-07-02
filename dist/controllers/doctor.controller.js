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
const database_1 = __importDefault(require("../database"));
const code_enum_1 = require("../interfaces/enum/code.enum");
const user_enum_1 = require("../interfaces/enum/user.enum");
const appointment_service_1 = __importDefault(require("../services/appointment.service"));
const doctor_service_1 = __importDefault(require("../services/doctor.service"));
const timeslot_service_1 = __importDefault(require("../services/timeslot.service"));
const user_services_1 = __importDefault(require("../services/user.services"));
const index_utils_1 = __importDefault(require("../utils/index.utils"));
const vitalsign_services_1 = __importDefault(require("../services/vitalsign.services"));
const consultation_service_1 = __importDefault(require("../services/consultation.service"));
const prescription_service_1 = __importDefault(require("../services/prescription.service"));
class DoctorController {
    constructor() {
        this.doctorService = new doctor_service_1.default();
        this.userService = new user_services_1.default();
        this.timeSlotService = new timeslot_service_1.default();
        this.appointmentService = new appointment_service_1.default();
        this.vitalsignService = new vitalsign_services_1.default();
        this.consultationService = new consultation_service_1.default();
        this.prescriptionService = new prescription_service_1.default();
    }
    registerDoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
                const newDoctor = {
                    userId: params.user.id,
                    specialization: params.specialization,
                    verificationStatus: params.verificationStatus,
                    documents: params.documents,
                };
                // checkign if the doctor already exist
                let doctorExists = yield this.doctorService.getDoctorByUserId(newDoctor.userId);
                if (doctorExists)
                    return index_utils_1.default.handleError(res, "We are sorry but you have already created a doctor account", code_enum_1.ResponseCode.ALREADY_EXIST);
                // creating a new doctor
                const doctor = yield this.doctorService.createDoctor(newDoctor);
                // Update the user's role to "doctor"
                yield this.userService.updateUserRole(params.user.id, user_enum_1.UserRoles.DOCTOR);
                return index_utils_1.default.handleSuccess(res, "Doctor created successfully", { doctor }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return res.status(500).json({ error: "Server error" });
            }
        });
    }
    getAllDoctors(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
                let doctors = yield this.doctorService.getDoctors();
                return index_utils_1.default.handleSuccess(res, "Account fetched successfully", { doctors }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    getAllTimeSlots(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
                let timeslots = yield this.timeSlotService.getTimeSlots();
                return index_utils_1.default.handleSuccess(res, "Account fetched successfully", { timeslots }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    createTimeSlot(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
                const newTimeSlot = {
                    doctorId: params.user.id,
                    startTime: params.startTime,
                    endTime: params.endTime,
                    isAvailable: params.isAvailable,
                };
                const timeSlot = yield this.timeSlotService.createTimeSlot(newTimeSlot);
                return index_utils_1.default.handleSuccess(res, "Doctor created successfully", { timeSlot }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                res.status(code_enum_1.ResponseCode.SERVER_ERROR).json(error.message);
            }
        });
    }
    approveAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield database_1.default.transaction();
            try {
                const { id } = req.params;
                yield this.appointmentService.approveAppointment(id);
                yield transaction.commit();
                return index_utils_1.default.handleSuccess(res, "Appointment approved successfully", {}, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                yield transaction.rollback();
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    cancelAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield database_1.default.transaction();
            try {
                const { id } = req.params;
                yield this.appointmentService.cancelAppointment(id);
                yield transaction.commit();
                return index_utils_1.default.handleSuccess(res, "Appointment canceled successfully", {}, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                yield transaction.rollback();
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    createVitalSing(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
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
                const post = yield this.vitalsignService.recordVitalSigns(newSigns);
                return index_utils_1.default.handleSuccess(res, "Vital signs created successfully", { post }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    getVitalsById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vitalId = req.params.vitalId;
                const vital = yield this.vitalsignService.getVitalSignsById(vitalId);
                if (!vital) {
                    return index_utils_1.default.handleError(res, "Vital signs not created yet", code_enum_1.ResponseCode.NOT_FOUND);
                }
                return index_utils_1.default.handleSuccess(res, "Post retrieved successfully", { vital }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    updateVitals(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vitalId = req.params.vitalId;
                const data = Object.assign({}, req.body);
                const vitals = yield this.vitalsignService.updateVitalSigns(vitalId, data);
                return index_utils_1.default.handleSuccess(res, "Vitals updated successfully", { vitals }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    destroyVitals(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vitalId = req.params.vitalId;
                yield this.vitalsignService.deleteVitalSigns(vitalId);
                return index_utils_1.default.handleSuccess(res, "Vitals deleted successfully", {}, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    getAllVitals(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
                let vitals = yield this.vitalsignService.getVitalSigns();
                return index_utils_1.default.handleSuccess(res, "Account fetched successfully", { vitals }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    createConsultation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
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
                const post = yield this.consultationService.createConsultation(newConsultation);
                return index_utils_1.default.handleSuccess(res, "Vital signs created successfully", { post }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    getConsultationById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const consultationId = req.params.consultationId;
                const consultation = yield this.consultationService.getConsultationById(consultationId);
                if (!consultation) {
                    return index_utils_1.default.handleError(res, "No existing consultation", code_enum_1.ResponseCode.NOT_FOUND);
                }
                return index_utils_1.default.handleSuccess(res, "Consultation retrieved successfully", { consultation }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    updateConsultation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const consultationId = req.params.consultationId;
                const data = Object.assign({}, req.body);
                const consultations = yield this.consultationService.updateConsultation(consultationId, data);
                return index_utils_1.default.handleSuccess(res, "Vitals updated successfully", { consultations }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    destroyConsultation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const consultationId = req.params.consultationId;
                yield this.consultationService.deleteConsultation(consultationId);
                return index_utils_1.default.handleSuccess(res, "Consulation deleted successfully", {}, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    getAllConsultations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
                let consultations = yield this.consultationService.getConsultations();
                return index_utils_1.default.handleSuccess(res, "Account fetched successfully", { consultations }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    createPrescription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield database_1.default.transaction();
            try {
                const { prescription, medications } = req.body;
                const newPrescription = yield this.prescriptionService.createPrescription(prescription, medications);
                yield transaction.commit();
                return index_utils_1.default.handleSuccess(res, "Prescription created successfully", { newPrescription }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                yield transaction.rollback();
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    getPrescriptionById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const prescription = yield this.prescriptionService.getPrescriptionById(id);
                if (!prescription) {
                    return index_utils_1.default.handleError(res, "Prescription not found", code_enum_1.ResponseCode.NOT_FOUND);
                }
                return index_utils_1.default.handleSuccess(res, "Prescription fetched successfully", { prescription }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    updatePrescription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield database_1.default.transaction();
            try {
                const { id } = req.params;
                const { prescription, medications } = req.body;
                yield this.prescriptionService.updatePrescription(id, prescription, medications);
                yield transaction.commit();
                return index_utils_1.default.handleSuccess(res, "Prescription updated successfully", {}, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                yield transaction.rollback();
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    getPrescriptions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prescriptions = yield this.prescriptionService.getPrescriptions();
                return index_utils_1.default.handleSuccess(res, "Prescriptions fetched successfully", { prescriptions }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    destroyPrescription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prescriptionId = req.params.prescriptionId;
                yield this.prescriptionService.deletePrescription;
                return index_utils_1.default.handleSuccess(res, "Consulation deleted successfully", {}, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
}
exports.default = DoctorController;
