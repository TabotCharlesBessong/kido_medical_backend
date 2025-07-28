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
const express_1 = __importDefault(require("express"));
const doctor_controller_1 = __importDefault(require("../controllers/doctor.controller"));
const index_middlewares_1 = require("../middlewares/index.middlewares");
const doctor_validator_schema_1 = __importDefault(require("../validators/doctor.validator.schema"));
const upload_service_1 = __importDefault(require("../services/upload.service"));
const createDoctorRoute = () => {
    const router = express_1.default.Router();
    const doctorController = new doctor_controller_1.default();
    router.post("/create", upload_service_1.default.getUploadMiddleware(), (0, index_middlewares_1.validator)(doctor_validator_schema_1.default.doctorValidationSchema), (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.registerDoctor(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.get("/:userId", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.getDoctorById(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.get("/doctor/all", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.getDoctors(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.post("/create-time-slot", (0, index_middlewares_1.validator)(doctor_validator_schema_1.default.timeSlotSchema), (0, index_middlewares_1.DoctorMiddleware)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.createTimeSlot(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.get("/time/all", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.getAllTimeSlots(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.get("/time", (0, index_middlewares_1.DoctorMiddleware)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.getDoctorTimeSlots(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.put("/appointments/:id/cancel", (0, index_middlewares_1.DoctorMiddleware)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.cancelAppointment(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.put("/appointments/:id/approve", (0, index_middlewares_1.DoctorMiddleware)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.approveAppointment(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.post("/record/sign", (0, index_middlewares_1.DoctorMiddleware)(), (0, index_middlewares_1.validator)(doctor_validator_schema_1.default.vitalSignSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.createVitalSing(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.get("/record/sign/all", (0, index_middlewares_1.DoctorMiddleware)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.getAllVitals(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.get("/record/sign/:vitalId", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.getVitalsById(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.put("/record/sign/:vitalId", (0, index_middlewares_1.DoctorMiddleware)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.updateVitals(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.delete("/record/sign/:vitalId", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.destroyVitals(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.post("/record/consultation", (0, index_middlewares_1.DoctorMiddleware)(), (0, index_middlewares_1.validator)(doctor_validator_schema_1.default.consultationSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.createConsultation(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.get("/record/consultation/all", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.getAllConsultations(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.get("/record/consultation/:consultationId", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.getConsultationById(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.put("/record/consultation/:consultationId", (0, index_middlewares_1.DoctorMiddleware)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.updateConsultation(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.delete("/record/consultation/:consultationId", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.destroyConsultation(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.post("/record/prescription", (0, index_middlewares_1.DoctorMiddleware)(), (0, index_middlewares_1.validator)(doctor_validator_schema_1.default.PrescriptionSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.createPrescription(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.get("/record/prescription/all", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.getPrescriptions(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.get("/record/prescription/:id", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.getPrescriptionById(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.put("/record/prescription/:id", (0, index_middlewares_1.DoctorMiddleware)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.updatePrescription(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.delete("/record/prescription/:prescriptionId", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.destroyPrescription(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.put("/:doctorId", upload_service_1.default.getUploadMiddleware(), (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doctorController.updateDoctor(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    return router;
};
exports.default = createDoctorRoute();
