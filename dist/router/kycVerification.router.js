"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const kycverification_controller_1 = require("../controllers/kycverification.controller");
const index_middlewares_1 = require("../middlewares/index.middlewares");
const kyc_validator_schema_1 = require("../validators/kyc.validator.schema");
const upload_service_1 = __importDefault(require("../services/upload.service"));
const role_middleware_1 = require("../middleware/role.middleware");
const createKycVerificationRoute = () => {
    const router = express_1.default.Router();
    const kycVerificationController = new kycverification_controller_1.KycVerificationController();
    router.post("/create-kyc-verification-request", (0, index_middlewares_1.Auth)(), (0, index_middlewares_1.DoctorMiddleware)(), upload_service_1.default.getUploadMiddleware(), (0, index_middlewares_1.validator)(kyc_validator_schema_1.kycVerificationSchema), async (req, res, next) => {
        try {
            await kycVerificationController.createKycVerificationRequest(req, res);
        }
        catch (error) {
            next(error);
        }
    });
    router.get("/get-kyc-verification/:userId", (0, index_middlewares_1.Auth)(), (0, index_middlewares_1.DoctorMiddleware)(), async (req, res, next) => {
        try {
            await kycVerificationController.getKycVerificationByUserId(req, res);
        }
        catch (error) {
            next(error);
        }
    });
    router.get("/get-all-kyc-verifications", (0, index_middlewares_1.Auth)(), (0, index_middlewares_1.DoctorMiddleware)(), async (req, res, next) => {
        try {
            await kycVerificationController.getAllKycVerificationRequests(req, res);
        }
        catch (error) {
            next(error);
        }
    });
    router.patch("/update-kyc-verification/:userId", (0, index_middlewares_1.Auth)(), role_middleware_1.isAdmin, async (req, res, next) => {
        try {
            await kycVerificationController.approveKycVerificationRequest(req, res);
        }
        catch (error) {
            next(error);
        }
    });
    return router;
};
exports.default = createKycVerificationRoute();
