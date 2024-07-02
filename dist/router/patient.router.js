"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const patient_controller_1 = __importDefault(require("../controllers/patient.controller"));
const index_middlewares_1 = require("../middlewares/index.middlewares");
const patient_validator_schema_1 = __importDefault(require("../validators/patient.validator.schema"));
const createPatientRoute = () => {
    const router = express_1.default.Router();
    const patientController = new patient_controller_1.default();
    router.post("/create", (0, index_middlewares_1.Auth)(), (0, index_middlewares_1.validator)(patient_validator_schema_1.default.createPatientSchema), (req, res) => {
        return patientController.createPatient(req, res);
    });
    router.get("/:userId", (0, index_middlewares_1.Auth)(), (req, res) => {
        return patientController.getPatientById(req, res);
    });
    router.put("/:userId", (0, index_middlewares_1.Auth)(), 
    // validator(validationSchema.createPatientSchema),
    (req, res) => {
        return patientController.updatePatient(req, res);
    });
    router.post("/appointment/create", (0, index_middlewares_1.Auth)(), (0, index_middlewares_1.validator)(patient_validator_schema_1.default.bookAppointmentSchema), (req, res) => {
        return patientController.bookAppointment(req, res);
    });
    router.put("/appointment/:appointmentId", (0, index_middlewares_1.Auth)(), (0, index_middlewares_1.validator)(patient_validator_schema_1.default.bookAppointmentSchema), (req, res) => {
        return patientController.updateAppointment(req, res);
    });
    router.get("/appointment/all", (0, index_middlewares_1.Auth)(), (req, res) => {
        return patientController.getAllAppointments(req, res);
    });
    router.get("/appointment/:appointmentId", (0, index_middlewares_1.Auth)(), (req, res) => {
        return patientController.getAppointmentById(req, res);
    });
    return router;
};
exports.default = createPatientRoute();
