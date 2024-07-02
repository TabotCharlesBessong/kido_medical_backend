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
const code_enum_1 = require("../interfaces/enum/code.enum");
const index_utils_1 = __importDefault(require("../utils/index.utils"));
const appointment_service_1 = __importDefault(require("../services/appointment.service"));
class PatientController {
    constructor() {
        this.patientService = new patient_service_1.default();
        this.appointmentService = new appointment_service_1.default();
    }
    createPatient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
                const newPatient = {
                    userId: params.user.id,
                    age: params.age,
                    gender: params.gender,
                };
                // checkign if the patient already exist
                let patientExists = yield this.patientService.getPatientById(newPatient.userId);
                if (patientExists)
                    return index_utils_1.default.handleError(res, "We are sorry but you have already created a patient account", code_enum_1.ResponseCode.ALREADY_EXIST);
                const patient = yield this.patientService.createPatient(newPatient);
                return index_utils_1.default.handleSuccess(res, "Patient Info created successfully", { patient }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                res
                    .status(code_enum_1.ResponseCode.SERVER_ERROR)
                    .json({ message: error.message });
            }
        });
    }
    getPatientById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const patient = yield this.patientService.getPatientById(req.params.userId);
                if (!patient)
                    return index_utils_1.default.handleError(res, "Could not get patient", code_enum_1.ResponseCode.NOT_FOUND);
                else
                    return index_utils_1.default.handleSuccess(res, "Account fetched successfully", { patient }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    updatePatient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const patientId = req.params.userId;
                const data = Object.assign({}, req.body);
                const patient = yield this.patientService.updatePatient(patientId, data);
                return index_utils_1.default.handleSuccess(res, "Post updated successfully", { patient }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    bookAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
                const newAppointment = {
                    patientId: params.user.id,
                    doctorId: params.doctorId,
                    timeslotId: params.timeslotId,
                    date: params.date,
                    reason: params.reason,
                };
                const appointment = yield this.appointmentService.createAppointment(newAppointment);
                return index_utils_1.default.handleSuccess(res, "Doctor created successfully", { appointment }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                res.status(code_enum_1.ResponseCode.SERVER_ERROR).json(error.message);
            }
        });
    }
    getAppointmentById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const appointment = yield this.appointmentService.getAppointmentById(req.params.appointmentId);
                if (!appointment)
                    return index_utils_1.default.handleError(res, "Could not get appointment", code_enum_1.ResponseCode.NOT_FOUND);
                else
                    return index_utils_1.default.handleSuccess(res, "Account fetched successfully", { appointment }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    getAllAppointments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
                let appointments = yield this.appointmentService.getAppointments();
                return index_utils_1.default.handleSuccess(res, "Account fetched successfully", { appointments }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
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
    updateAppointment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.appointmentService.updateAppointment(req.params.id, req.body);
                return index_utils_1.default.handleSuccess(res, "Appointment updated successfully", {}, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                res.status(code_enum_1.ResponseCode.SERVER_ERROR).json(error.message);
            }
        });
    }
}
exports.default = PatientController;
