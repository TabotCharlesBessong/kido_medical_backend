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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const index_middlewares_1 = require("../middlewares/index.middlewares");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
const adminController = new admin_controller_1.AdminController();
// Get all pending doctor verifications
router.get("/doctor-verifications/pending", (0, index_middlewares_1.Auth)(), role_middleware_1.isAdmin, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield adminController.getPendingDoctorVerifications(req, res);
    }
    catch (error) {
        next(error);
    }
}));
// Get all pending KYC verifications
router.get("/kyc-verifications/pending", (0, index_middlewares_1.Auth)(), role_middleware_1.isAdmin, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield adminController.getPendingKycVerifications(req, res);
    }
    catch (error) {
        next(error);
    }
}));
// Get doctor verification details
router.get("/doctor-verifications/:doctorId", (0, index_middlewares_1.Auth)(), role_middleware_1.isAdmin, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield adminController.getDoctorVerificationDetails(req, res);
    }
    catch (error) {
        next(error);
    }
}));
// Verify doctor (approve/reject)
router.post("/doctor-verifications/verify", (0, index_middlewares_1.Auth)(), role_middleware_1.isAdmin, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield adminController.verifyDoctor(req, res);
    }
    catch (error) {
        next(error);
    }
}));
// Verify KYC (approve/reject)
router.patch("/kyc-verifications/:userId/verify", (0, index_middlewares_1.Auth)(), role_middleware_1.isAdmin, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield adminController.verifyKyc(req, res);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
