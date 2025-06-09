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
exports.DoctorController = void 0;
const database_1 = __importDefault(require("../database"));
const code_enum_1 = require("../interfaces/enum/code.enum");
const user_enum_1 = require("../interfaces/enum/user.enum");
const appointment_service_1 = __importDefault(require("../services/appointment.service"));
const doctor_service_1 = require("../services/doctor.service");
const timeslot_service_1 = __importDefault(require("../services/timeslot.service"));
const user_services_1 = __importDefault(require("../services/user.services"));
const index_utils_1 = __importDefault(require("../utils/index.utils"));
const vitalsign_services_1 = __importDefault(require("../services/vitalsign.services"));
const consultation_service_1 = __importDefault(require("../services/consultation.service"));
const prescription_service_1 = __importDefault(require("../services/prescription.service"));
const email_service_1 = __importDefault(require("../services/email.service"));
const upload_service_1 = __importDefault(require("../services/upload.service"));
const doctor_datasource_1 = __importDefault(require("../datasources/doctor.datasource"));
class DoctorController {
    constructor() {
        const userService = new user_services_1.default();
        this.doctorService = new doctor_service_1.DoctorService(new doctor_datasource_1.default(), email_service_1.default, userService);
        this.timeSlotService = new timeslot_service_1.default();
        this.appointmentService = new appointment_service_1.default();
        this.vitalsignService = new vitalsign_services_1.default();
        this.consultationService = new consultation_service_1.default();
        this.prescriptionService = new prescription_service_1.default();
        this.userService = userService;
        this.emailService = email_service_1.default;
        this.uploadService = upload_service_1.default;
    }
    registerDoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
                const file = req.file;
                if (file) {
                    const fileUrl = yield this.uploadService.uploadFile(file);
                    params.documents = fileUrl;
                }
                const newDoctor = {
                    userId: params.user.id,
                    specialization: params.specialization,
                    verificationStatus: params.verificationStatus,
                    documents: params.documents,
                    fee: params.fee,
                    language: params.language,
                    experience: params.experience
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
                return res.status(code_enum_1.ResponseCode.SERVER_ERROR).json(error.message);
            }
        });
    }
    getDoctorById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const doctor = yield this.doctorService.getDoctorByField({ where: { id } });
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
            }
            catch (error) {
                return res.status(500).json({
                    status: 'error',
                    message: error.message
                });
            }
        });
    }
    getDoctors(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const doctors = yield this.doctorService.getDoctors();
                return res.status(200).json({
                    status: 'success',
                    data: doctors
                });
            }
            catch (error) {
                return res.status(500).json({
                    status: 'error',
                    message: error.message
                });
            }
        });
    }
    getAllTimeSlots(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
                let timeslots = yield this.timeSlotService.getTimeSlots();
                return index_utils_1.default.handleSuccess(res, "All time slots fetched successfully", { timeslots }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    getDoctorTimeSlots(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
                // First get the doctor using the user ID
                const doctor = yield this.doctorService.getDoctorByUserId(params.user.id);
                if (!doctor) {
                    return index_utils_1.default.handleError(res, "Doctor not found", code_enum_1.ResponseCode.NOT_FOUND);
                }
                const timeslots = yield this.timeSlotService.getTimeSlotsByDoctor(doctor.id);
                return index_utils_1.default.handleSuccess(res, "Doctor time slots fetched successfully", { timeslots }, code_enum_1.ResponseCode.SUCCESS);
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
                // First get the doctor using the user ID
                const doctor = yield this.doctorService.getDoctorByUserId(params.user.id);
                if (!doctor) {
                    return index_utils_1.default.handleError(res, "Doctor not found", code_enum_1.ResponseCode.NOT_FOUND);
                }
                const newTimeSlot = {
                    doctorId: doctor.id, // Use the doctor's ID instead of user's ID
                    startTime: params.startTime,
                    endTime: params.endTime,
                    isAvailable: params.isAvailable,
                };
                const timeSlot = yield this.timeSlotService.createTimeSlot(newTimeSlot);
                return index_utils_1.default.handleSuccess(res, "Time slot created successfully", { timeSlot }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
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
                const vitalSign = yield this.vitalsignService.recordVitalSigns(params);
                return index_utils_1.default.handleSuccess(res, "Vital sign created successfully", { vitalSign }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    getVitalsById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const vitalSign = yield this.vitalsignService.getVitalSignsById(id);
                if (!vitalSign) {
                    return index_utils_1.default.handleError(res, "Vital sign not found", code_enum_1.ResponseCode.NOT_FOUND);
                }
                return index_utils_1.default.handleSuccess(res, "Vital sign fetched successfully", { vitalSign }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    updateVitals(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const params = Object.assign({}, req.body);
                yield this.vitalsignService.updateVitalSigns(id, params);
                return index_utils_1.default.handleSuccess(res, "Vital sign updated successfully", {}, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    destroyVitals(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield this.vitalsignService.deleteVitalSigns(id);
                return index_utils_1.default.handleSuccess(res, "Vital sign deleted successfully", {}, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    getAllVitals(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vitalSigns = yield this.vitalsignService.getVitalSigns();
                return index_utils_1.default.handleSuccess(res, "Vital signs fetched successfully", { vitalSigns }, code_enum_1.ResponseCode.SUCCESS);
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
                const consultation = yield this.consultationService.createConsultation(params);
                return index_utils_1.default.handleSuccess(res, "Consultation created successfully", { consultation }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    getConsultationById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const consultation = yield this.consultationService.getConsultationById(id);
                if (!consultation) {
                    return index_utils_1.default.handleError(res, "Consultation not found", code_enum_1.ResponseCode.NOT_FOUND);
                }
                return index_utils_1.default.handleSuccess(res, "Consultation fetched successfully", { consultation }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    updateConsultation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const params = Object.assign({}, req.body);
                yield this.consultationService.updateConsultation(id, params);
                return index_utils_1.default.handleSuccess(res, "Consultation updated successfully", {}, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    destroyConsultation(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield this.consultationService.deleteConsultation(id);
                return index_utils_1.default.handleSuccess(res, "Consultation deleted successfully", {}, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    getAllConsultations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const consultations = yield this.consultationService.getConsultations();
                return index_utils_1.default.handleSuccess(res, "Consultations fetched successfully", { consultations }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    createPrescription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
                const { prescription, medications } = params;
                const newPrescription = yield this.prescriptionService.createPrescription(prescription, medications);
                return index_utils_1.default.handleSuccess(res, "Prescription created successfully", { prescription: newPrescription }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
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
            try {
                const { id } = req.params;
                const { prescription, medications } = req.body;
                yield this.prescriptionService.updatePrescription(id, prescription, medications);
                return index_utils_1.default.handleSuccess(res, "Prescription updated successfully", {}, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
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
                const { id } = req.params;
                yield this.prescriptionService.deletePrescription(id);
                return index_utils_1.default.handleSuccess(res, "Prescription deleted successfully", {}, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    updateDoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                yield this.doctorService.updateDoctor(id, req.body);
                return res.status(200).json({
                    status: 'success',
                    message: 'Doctor updated successfully'
                });
            }
            catch (error) {
                return res.status(500).json({
                    status: 'error',
                    message: error.message
                });
            }
        });
    }
    approveDoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.query;
                if (!email || typeof email !== 'string') {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Doctor email is required'
                    });
                }
                yield this.doctorService.verifyDoctor(email, 'APPROVED');
                return res.status(200).json({
                    status: 'success',
                    message: 'Doctor approved successfully'
                });
            }
            catch (error) {
                return res.status(500).json({
                    status: 'error',
                    message: error.message
                });
            }
        });
    }
    declineDoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                yield this.doctorService.verifyDoctor(email, 'REJECTED', notes);
                return res.status(200).json({
                    status: 'success',
                    message: 'Doctor registration declined'
                });
            }
            catch (error) {
                return res.status(500).json({
                    status: 'error',
                    message: error.message
                });
            }
        });
    }
}
exports.DoctorController = DoctorController;
exports.default = DoctorController;
