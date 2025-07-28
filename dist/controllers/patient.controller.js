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
const patient_service_1 = __importDefault(require("../services/patient.service"));
const timeslot_service_1 = __importDefault(require("../services/timeslot.service"));
const patient_datasource_1 = __importDefault(require("../datasources/patient.datasource"));
const patientDataSource = new patient_datasource_1.default();
class PatientController {
    constructor() {
        this.patientService = new patient_service_1.default(patientDataSource);
        this.timeSlotService = new timeslot_service_1.default();
    }
    createPatient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const patient = yield this.patientService.createPatient(req.body);
                res.status(201).json({
                    status: true,
                    message: "Patient created successfully",
                    data: patient,
                });
            }
            catch (error) {
                res.status(400).json({
                    status: false,
                    message: error.message,
                });
            }
        });
    }
    getPatientById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const patient = yield this.patientService.getPatientById(req.params.id);
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
            }
            catch (error) {
                res.status(400).json({
                    status: false,
                    message: error.message,
                });
            }
        });
    }
    updatePatient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const patient = yield this.patientService.updatePatient(req.params.id, req.body);
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
            }
            catch (error) {
                res.status(400).json({
                    status: false,
                    message: error.message,
                });
            }
        });
    }
    deletePatient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const patient = yield this.patientService.getPatientById(id);
                if (!patient) {
                    return res.status(404).json({
                        status: false,
                        message: "Patient not found",
                    });
                }
                yield this.patientService.deletePatient(id);
                return res.status(200).json({
                    status: true,
                    message: "Patient deleted successfully",
                });
            }
            catch (error) {
                return res.status(500).json({
                    status: false,
                    message: error.message,
                });
            }
        });
    }
    getAllPatients(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const patients = yield this.patientService.getAllPatients();
                res.status(200).json({
                    status: true,
                    message: "Patients retrieved successfully",
                    data: patients,
                });
            }
            catch (error) {
                res.status(400).json({
                    status: false,
                    message: error.message,
                });
            }
        });
    }
    bookAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const timeSlot = yield this.timeSlotService.getTimeSlotById(timeslotId);
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
                const newAppointment = {
                    patientId: patient.id,
                    doctorId,
                    timeSlotId: timeslotId,
                    status: "PENDING"
                };
                const appointment = yield this.appointmentService.createAppointment(newAppointment);
                // Update timeslot availability
                yield this.timeSlotService.updateTimeSlot(timeslotId, { isAvailable: false });
                res.status(201).json({
                    status: true,
                    message: "Appointment booked successfully",
                    data: appointment,
                });
            }
            catch (error) {
                res.status(400).json({
                    status: false,
                    message: error.message,
                });
            }
        });
    }
    getPatientAppointments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const patient = req.user;
                if (!patient) {
                    res.status(401).json({
                        status: false,
                        message: "User not authenticated",
                    });
                    return;
                }
                const appointments = yield this.appointmentService.getAppointmentsByPatientId(patient.id);
                res.status(200).json({
                    status: true,
                    message: "Appointments retrieved successfully",
                    data: appointments,
                });
            }
            catch (error) {
                res.status(400).json({
                    status: false,
                    message: error.message,
                });
            }
        });
    }
    getAllAppointments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const appointments = yield this.appointmentService.getAllAppointments();
                res.status(200).json({
                    status: true,
                    message: "Appointments retrieved successfully",
                    data: appointments,
                });
            }
            catch (error) {
                res.status(400).json({
                    status: false,
                    message: error.message,
                });
            }
        });
    }
    updateAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const appointment = yield this.appointmentService.updateAppointment(req.params.id, req.body);
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
            }
            catch (error) {
                res.status(400).json({
                    status: false,
                    message: error.message,
                });
            }
        });
    }
    getAppointmentById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const appointment = yield this.appointmentService.getAppointmentById(id);
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
            }
            catch (error) {
                return res.status(500).json({
                    status: false,
                    message: error.message,
                });
            }
        });
    }
}
exports.default = PatientController;
