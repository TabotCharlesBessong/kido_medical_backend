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
const kycVerfication_service_1 = require("./kycVerfication.service");
const kycVerification_datasource_1 = __importDefault(require("../datasources/kycVerification.datasource"));
const user_datasource_1 = __importDefault(require("../datasources/user.datasource"));
const token_datasource_1 = __importDefault(require("../datasources/token.datasource"));
const userDataSource = new user_datasource_1.default();
const tokenDataSource = new token_datasource_1.default();
const userService = new user_services_1.default(userDataSource, tokenDataSource);
const kycVerificationService = new kycVerfication_service_1.KycVerificationService(new kycVerification_datasource_1.default(), userService);
class AdminService {
    constructor() {
        this.doctorService = new doctor_service_1.DoctorService(new doctor_datasource_1.default(), email_service_1.default, userService, kycVerificationService);
        this.emailService = email_service_1.default;
        this.userService = userService;
        this.kycVerificationService = kycVerificationService;
    }
    getPendingDoctorVerifications() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doctorService.getDoctorsByVerificationStatus(doctor_enum_1.DoctorVerificationStatus.PENDING);
        });
    }
    getPendingKycVerifications() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.kycVerificationService.getAllKycVerificationRequests();
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
            // Get KYC verification for this doctor
            const kycVerification = yield this.kycVerificationService.getKycVerificationByUserId(doctor.userId);
            // If KYC is not approved, doctor cannot be approved
            if (status === doctor_enum_1.DoctorVerificationStatus.APPROVED && kycVerification && kycVerification.status !== 'approved') {
                throw new Error('Doctor cannot be approved until KYC verification is completed');
            }
            yield this.doctorService.verifyDoctor(email, status, notes);
            // If doctor is approved and KYC exists, also approve KYC
            if (status === doctor_enum_1.DoctorVerificationStatus.APPROVED && kycVerification) {
                yield this.kycVerificationService.updateKycVerification({ where: { userId: doctor.userId } }, { status: 'approved' });
            }
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
    verifyKyc(userId, status, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const kycVerification = yield this.kycVerificationService.getKycVerificationByUserId(userId);
            if (!kycVerification) {
                throw new Error('KYC verification request not found');
            }
            yield this.kycVerificationService.updateKycVerification({ where: { userId } }, { status, reason });
            // Get doctor and user details for email
            const doctor = yield this.doctorService.getDoctorByUserId(userId);
            const user = yield this.userService.getUserByField({ id: userId });
            if (user) {
                if (status === 'approved') {
                    // Send KYC approval email
                    yield this.emailService.sendKycApprovalEmail({
                        doctorEmail: user.email,
                        doctorName: `${user.firstname} ${user.lastname}`
                    });
                }
                else {
                    // Send KYC rejection email
                    yield this.emailService.sendKycRejectionEmail({
                        doctorEmail: user.email,
                        doctorName: `${user.firstname} ${user.lastname}`,
                        reason: reason || 'No reason provided'
                    });
                }
            }
            return kycVerification;
        });
    }
    getDoctorVerificationDetails(doctorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const doctor = yield this.doctorService.getDoctorByField({ where: { id: doctorId } });
            if (!doctor) {
                throw new Error('Doctor not found');
            }
            // Get KYC verification details
            const kycVerification = yield this.kycVerificationService.getKycVerificationByUserId(doctor.userId);
            return Object.assign(Object.assign({}, doctor), { documents: doctor.documents, verificationStatus: doctor.verificationStatus, verificationNotes: doctor.verificationNotes, verifiedAt: doctor.verifiedAt, kycVerification });
        });
    }
}
exports.default = AdminService;
