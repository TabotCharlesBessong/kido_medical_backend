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
exports.AdminController = void 0;
const admin_service_1 = __importDefault(require("../services/admin.service"));
const code_enum_1 = require("../interfaces/enum/code.enum");
const index_utils_1 = __importDefault(require("../utils/index.utils"));
const doctor_enum_1 = require("../interfaces/enum/doctor.enum");
class AdminController {
    constructor() {
        this.adminService = new admin_service_1.default();
    }
    getPendingDoctorVerifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pendingDoctors = yield this.adminService.getPendingDoctorVerifications();
                return index_utils_1.default.handleSuccess(res, "Pending doctor verifications fetched successfully", { doctors: pendingDoctors }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    getPendingKycVerifications(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const pendingKycRequests = yield this.adminService.getPendingKycVerifications();
                return index_utils_1.default.handleSuccess(res, "Pending KYC verifications fetched successfully", { kycRequests: pendingKycRequests }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    verifyDoctor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.query;
                const { status, notes } = req.body;
                if (!email || typeof email !== 'string') {
                    return index_utils_1.default.handleError(res, "Doctor email is required", code_enum_1.ResponseCode.BAD_REQUEST);
                }
                if (!status || !Object.values(doctor_enum_1.DoctorVerificationStatus).includes(status)) {
                    return index_utils_1.default.handleError(res, "Invalid verification status", code_enum_1.ResponseCode.BAD_REQUEST);
                }
                if (status === doctor_enum_1.DoctorVerificationStatus.REJECTED && !notes) {
                    return index_utils_1.default.handleError(res, "Rejection reason is required", code_enum_1.ResponseCode.BAD_REQUEST);
                }
                const doctor = yield this.adminService.verifyDoctor(email, status, notes);
                return index_utils_1.default.handleSuccess(res, `Doctor verification ${status.toLowerCase()} successfully`, { doctor }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    verifyKyc(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                const { status, reason } = req.body;
                if (!userId) {
                    return index_utils_1.default.handleError(res, "User ID is required", code_enum_1.ResponseCode.BAD_REQUEST);
                }
                if (!status || !['approved', 'rejected'].includes(status)) {
                    return index_utils_1.default.handleError(res, "Invalid KYC status. Must be 'approved' or 'rejected'", code_enum_1.ResponseCode.BAD_REQUEST);
                }
                if (status === 'rejected' && !reason) {
                    return index_utils_1.default.handleError(res, "Rejection reason is required", code_enum_1.ResponseCode.BAD_REQUEST);
                }
                const kycVerification = yield this.adminService.verifyKyc(userId, status, reason);
                return index_utils_1.default.handleSuccess(res, `KYC verification ${status} successfully`, { kycVerification }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    getDoctorVerificationDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { doctorId } = req.params;
                const doctorDetails = yield this.adminService.getDoctorVerificationDetails(doctorId);
                return index_utils_1.default.handleSuccess(res, "Doctor verification details fetched successfully", { doctor: doctorDetails }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
}
exports.AdminController = AdminController;
