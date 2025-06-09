"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const yup = __importStar(require("yup"));
const patient_enum_1 = require("../interfaces/enum/patient.enum");
const createPatientSchema = yup.object({
    gender: yup.string().oneOf(["MALE", "FEMALE", "OTHER"]).required(),
    age: yup.number().min(0).required(),
    address1: yup.string().optional(),
    address2: yup.string().optional(),
    occupation: yup.string().optional(),
    phoneNumber: yup.string().optional(),
    tribe: yup.string().optional(),
    religion: yup.mixed()
        .oneOf(Object.values(patient_enum_1.Religion), "Invalid religion")
        .optional(),
});
const bookAppointmentSchema = yup.object({
    date: yup.date().required(),
    reason: yup.string().required(),
    // patientId: yup.string().uuid().required(),
    doctorId: yup.string().uuid().required(),
    timeslotId: yup.string().uuid().required(),
});
const validationSchema = {
    createPatientSchema,
    bookAppointmentSchema,
};
exports.default = validationSchema;
