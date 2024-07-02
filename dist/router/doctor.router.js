"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const doctor_controller_1 = __importDefault(require("../controllers/doctor.controller"));
const index_middlewares_1 = require("../middlewares/index.middlewares");
const doctor_validator_schema_1 = __importDefault(require("../validators/doctor.validator.schema"));
const createDoctorRoute = () => {
    const router = express_1.default.Router();
    const doctorController = new doctor_controller_1.default();
    router.post("/create", (0, index_middlewares_1.validator)(doctor_validator_schema_1.default.doctorValidationSchema), (0, index_middlewares_1.Auth)(), (req, res) => {
        return doctorController.registerDoctor(req, res);
    });
    router.get("/all-doctor", (0, index_middlewares_1.Auth)(), (req, res) => {
        return doctorController.getAllDoctors(req, res);
    });
    router.post("/create-time-slot", (0, index_middlewares_1.validator)(doctor_validator_schema_1.default.timeSlotSchema), (0, index_middlewares_1.DoctorMiddleware)(), (req, res) => {
        return doctorController.createTimeSlot(req, res);
    });
    router.get("/all-time-slot", (0, index_middlewares_1.Auth)(), (req, res) => {
        return doctorController.getAllTimeSlots(req, res);
    });
    router.put("/cancel/:id", (0, index_middlewares_1.DoctorMiddleware)(), (req, res) => {
        doctorController.cancelAppointment(req, res);
    });
    router.put("/approve/:id", (0, index_middlewares_1.DoctorMiddleware)(), (req, res) => {
        doctorController.approveAppointment(req, res);
    });
    router.post("/record/sign", (0, index_middlewares_1.DoctorMiddleware)(), (0, index_middlewares_1.validator)(doctor_validator_schema_1.default.vitalSignSchema), (req, res) => {
        doctorController.createVitalSing(req, res);
    });
    router.get("/record/sign/all", (0, index_middlewares_1.DoctorMiddleware)(), (req, res) => {
        doctorController.getAllVitals(req, res);
    });
    router.get("/record/sign/:vitalId", (0, index_middlewares_1.Auth)(), (req, res) => {
        doctorController.getVitalsById(req, res);
    });
    router.put("/record/sign/:vitalId", (0, index_middlewares_1.DoctorMiddleware)(), (req, res) => {
        doctorController.updateVitals(req, res);
    });
    router.delete("/record/sign/:vitalId", (0, index_middlewares_1.Auth)(), (req, res) => {
        doctorController.destroyVitals(req, res);
    });
    router.post("/record/consultation", (0, index_middlewares_1.DoctorMiddleware)(), (0, index_middlewares_1.validator)(doctor_validator_schema_1.default.consultationSchema), (req, res) => {
        doctorController.createConsultation(req, res);
    });
    router.get("/record/consultation/all", (0, index_middlewares_1.Auth)(), (req, res) => {
        doctorController.getAllConsultations(req, res);
    });
    router.get("/record/consultation/:consultationId", (0, index_middlewares_1.Auth)(), (req, res) => {
        doctorController.getConsultationById(req, res);
    });
    router.put("/record/consultation/:consultationId", (0, index_middlewares_1.DoctorMiddleware)(), (req, res) => {
        doctorController.updateConsultation(req, res);
    });
    router.delete("/record/consultation/:consultationId", (0, index_middlewares_1.Auth)(), (req, res) => {
        doctorController.destroyConsultation(req, res);
    });
    router.post("/record/prescription", (0, index_middlewares_1.DoctorMiddleware)(), (0, index_middlewares_1.validator)(doctor_validator_schema_1.default.PrescriptionSchema), (req, res) => {
        doctorController.createPrescription(req, res);
    });
    router.get("/record/prescription/all", (0, index_middlewares_1.Auth)(), (req, res) => {
        doctorController.getPrescriptions(req, res);
    });
    router.get("/record/prescription/:id", (0, index_middlewares_1.Auth)(), (req, res) => {
        doctorController.getPrescriptionById(req, res);
    });
    router.put("/record/prescription/:id", (0, index_middlewares_1.DoctorMiddleware)(), (req, res) => {
        doctorController.updatePrescription(req, res);
    });
    router.delete("/record/prescription/:prescriptionId", (0, index_middlewares_1.Auth)(), (req, res) => {
        doctorController.destroyPrescription(req, res);
    });
    return router;
};
exports.default = createDoctorRoute();
