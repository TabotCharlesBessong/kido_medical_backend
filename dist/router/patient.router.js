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
const patient_controller_1 = __importDefault(require("../controllers/patient.controller"));
const index_middlewares_1 = require("../middlewares/index.middlewares");
const patient_validator_schema_1 = __importDefault(require("../validators/patient.validator.schema"));
const createPatientRoute = () => {
    const router = express_1.default.Router();
    const patientController = new patient_controller_1.default();
    router.post("/create", (0, index_middlewares_1.Auth)(), (0, index_middlewares_1.validator)(patient_validator_schema_1.default.createPatientSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield patientController.createPatient(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.get("/:userId", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield patientController.getPatientById(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.put("/:userId", (0, index_middlewares_1.Auth)(), 
    // validator(validationSchema.createPatientSchema),
    (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield patientController.updatePatient(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.post("/appointment/create", (0, index_middlewares_1.Auth)(), (0, index_middlewares_1.validator)(patient_validator_schema_1.default.bookAppointmentSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield patientController.bookAppointment(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.put("/appointment/:appointmentId", (0, index_middlewares_1.Auth)(), (0, index_middlewares_1.validator)(patient_validator_schema_1.default.bookAppointmentSchema), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield patientController.updateAppointment(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.get("/appointment/all", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield patientController.getAllAppointments(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.get("/appointment/:appointmentId", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield patientController.getAppointmentById(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.get("/appointments/all", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield patientController.getAllAppointments(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    router.get("/appointments", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield patientController.getPatientAppointments(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    return router;
};
exports.default = createPatientRoute();
