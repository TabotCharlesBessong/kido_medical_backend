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
    createKycVerificationRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = Object.assign({}, req.body);
                const file = req.file;
                const userId = req.params.userId || req.body.userId;
                const request = yield this.kycVerificationService.getKycVerificationByUserId(userId);
                if (request) {
                    return index_utils_1.default.handleError(res, "Kyc Verification request already exists, please wait for approval ", code_enum_1.ResponseCode.BAD_REQUEST);
                }
                if (file) {
                    const fileUrl = yield this.uploadService.uploadFile(file);
                    body.documentUrl = fileUrl;
                }
                const kycRequest = yield this.kycVerificationService.kycVerificationRequest(body);
                return index_utils_1.default.handleSuccess(res, "Kyc Verification request sent", { kycRequest }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return res
                    .status(code_enum_1.ResponseCode.SERVER_ERROR)
                    .json(error.message);
            }
        });
    }
    getKycVerificationByUserId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const request = yield this.kycVerificationService.getKycVerificationByUserId(userId);
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
        });
    }
    approveKycVerificationRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const searchBy = req.params.userId;
                const data = Object.assign({}, req.body);
                yield this.kycVerificationService.updateKycVerification({
                    where: { userId: searchBy },
                }, data);
                // Send email notification to the user
                const user = yield this.userService.getUserByField({ id: searchBy });
                if (user) {
                    if (data.status === 'approved') {
                        yield this.emailService.sendKycApprovalEmail({
                            doctorEmail: user.email,
                            doctorName: `${user.firstname} ${user.lastname}`
                        });
                    }
                    else if (data.status === 'rejected') {
                        yield this.emailService.sendKycRejectionEmail({
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
        });
    }
    getAllKycVerificationRequests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const requests = yield this.kycVerificationService.getAllKycVerificationRequests();
                return index_utils_1.default.handleSuccess(res, "All Kyc Verification requests fetched", { requests }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return res
                    .status(code_enum_1.ResponseCode.SERVER_ERROR)
                    .json(error.message);
            }
        });
    }
}
exports.KycVerificationController = KycVerificationController;
exports.default = KycVerificationController;
