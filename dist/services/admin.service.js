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
const doctor_service_1 = require("./doctor.service");
const email_service_1 = __importDefault(require("./email.service"));
const doctor_enum_1 = require("../interfaces/enum/doctor.enum");
const doctor_datasource_1 = __importDefault(require("../datasources/doctor.datasource"));
const user_services_1 = __importDefault(require("./user.services"));
class AdminService {
    constructor() {
        this.doctorService = new doctor_service_1.DoctorService(new doctor_datasource_1.default(), email_service_1.default, new user_services_1.default());
        this.emailService = email_service_1.default;
        this.userService = new user_services_1.default();
    }
    getPendingDoctorVerifications() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doctorService.getDoctorsByVerificationStatus(doctor_enum_1.DoctorVerificationStatus.PENDING);
        });
    }
    verifyDoctor(email, status, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = yield this.doctorService.getDoctorByEmail(email);
            if (!doctor) {
                throw new Error('Doctor not found');
            }
            const doctorUser = yield this.userService.getUserByField({ id: doctor.userId });
            if (!doctorUser) {
                throw new Error('Doctor user not found');
            }
            yield this.doctorService.verifyDoctor(email, status, notes);
            // Send verification status email
            if (status === doctor_enum_1.DoctorVerificationStatus.APPROVED) {
                yield this.emailService.sendDoctorVerificationApprovedEmail({
                    doctorEmail: email,
                    doctorName: `${doctorUser.firstname} ${doctorUser.lastname}`
                });
            }
            else if (status === doctor_enum_1.DoctorVerificationStatus.REJECTED) {
                yield this.emailService.sendDoctorVerificationRejectedEmail({
                    doctorEmail: email,
                    doctorName: `${doctorUser.firstname} ${doctorUser.lastname}`,
                    reason: notes || 'No reason provided'
                });
            }
            return doctor;
        });
    }
    getDoctorVerificationDetails(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = yield this.doctorService.getDoctorByField({ where: { id: doctorId } });
            if (!doctor) {
                throw new Error('Doctor not found');
            }
            return Object.assign(Object.assign({}, doctor), { documents: doctor.documents, verificationStatus: doctor.verificationStatus, verificationNotes: doctor.verificationNotes, verifiedAt: doctor.verifiedAt });
        });
    }
}
exports.default = AdminService;
