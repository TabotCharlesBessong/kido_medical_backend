"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycVerificationController = void 0;
const kycVerfication_service_1 = require("../services/kycVerfication.service");
const code_enum_1 = require("../interfaces/enum/code.enum");
const index_utils_1 = __importDefault(require("../utils/index.utils"));
const user_services_1 = __importDefault(require("../services/user.services"));
const kycVerification_datasource_1 = __importDefault(require("../datasources/kycVerification.datasource"));
const upload_service_1 = __importDefault(require("../services/upload.service"));
const email_service_1 = __importDefault(require("../services/email.service"));
const user_datasource_1 = __importDefault(require("../datasources/user.datasource"));
const token_datasource_1 = __importDefault(require("../datasources/token.datasource"));
const userDataSource = new user_datasource_1.default();
const tokenDataSource = new token_datasource_1.default();
const userService = new user_services_1.default(userDataSource, tokenDataSource);
class KycVerificationController {
    constructor() {
        this.kycVerificationService = new kycVerfication_service_1.KycVerificationService(new kycVerification_datasource_1.default(), userService);
        this.uploadService = upload_service_1.default;
        this.userService = userService;
        this.emailService = email_service_1.default;
    }
    async createKycVerificationRequest(req, res) {
        try {
            const body = { ...req.body };
            const file = req.file;
            const userId = req.params.userId || req.body.userId;
            const request = await this.kycVerificationService.getKycVerificationByUserId(userId);
            if (request) {
                return index_utils_1.default.handleError(res, "Kyc Verification request already exists, please wait for approval ", code_enum_1.ResponseCode.BAD_REQUEST);
            }
            if (file) {
                const fileUrl = await this.uploadService.uploadFile(file);
                body.documentUrl = fileUrl;
            }
            const kycRequest = await this.kycVerificationService.kycVerificationRequest(body);
            return index_utils_1.default.handleSuccess(res, "Kyc Verification request sent", { kycRequest }, code_enum_1.ResponseCode.SUCCESS);
        }
        catch (error) {
            return res
                .status(code_enum_1.ResponseCode.SERVER_ERROR)
                .json(error.message);
        }
    }
    async getKycVerificationByUserId(req, res) {
        try {
            const userId = req.params.userId;
            const request = await this.kycVerificationService.getKycVerificationByUserId(userId);
            if (request !== null) {
                return index_utils_1.default.handleSuccess(res, "Kyc Verification request found", { request }, code_enum_1.ResponseCode.SUCCESS);
            }
            else {
                return index_utils_1.default.handleError(res, "Kyc Verification request not found", code_enum_1.ResponseCode.NOT_FOUND);
            }
        }
        catch (error) {
            return res
                .status(code_enum_1.ResponseCode.SERVER_ERROR)
                .json(error.message);
        }
    }
    async approveKycVerificationRequest(req, res) {
        try {
            const searchBy = req.params.userId;
            const data = { ...req.body };
            await this.kycVerificationService.updateKycVerification({
                where: { userId: searchBy },
            }, data);
            const user = await this.userService.getUserByField({ id: searchBy });
            if (user) {
                if (data.status === 'approved') {
                    await this.emailService.sendKycApprovalEmail({
                        doctorEmail: user.email,
                        doctorName: `${user.firstname} ${user.lastname}`
                    });
                }
                else if (data.status === 'rejected') {
                    await this.emailService.sendKycRejectionEmail({
                        doctorEmail: user.email,
                        doctorName: `${user.firstname} ${user.lastname}`,
                        reason: data.reason || 'No reason provided'
                    });
                }
            }
            return index_utils_1.default.handleSuccess(res, `Kyc Verification request ${data.status}`, {}, code_enum_1.ResponseCode.SUCCESS);
        }
        catch (error) {
            return res
                .status(code_enum_1.ResponseCode.SERVER_ERROR)
                .json(error.message);
        }
    }
    async getAllKycVerificationRequests(req, res) {
        try {
            const requests = await this.kycVerificationService.getAllKycVerificationRequests();
            return index_utils_1.default.handleSuccess(res, "All Kyc Verification requests fetched", { requests }, code_enum_1.ResponseCode.SUCCESS);
        }
        catch (error) {
            return res
                .status(code_enum_1.ResponseCode.SERVER_ERROR)
                .json(error.message);
        }
    }
}
exports.KycVerificationController = KycVerificationController;
exports.default = KycVerificationController;
