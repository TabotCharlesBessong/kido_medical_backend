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
const appointment_model_1 = __importDefault(require("../models/appointment.model"));
const comment_model_1 = __importDefault(require("../models/comment.model"));
const consultation_model_1 = __importDefault(require("../models/consultation.model"));
const doctor_model_1 = __importDefault(require("../models/doctor.model"));
const like_model_1 = __importDefault(require("../models/like.model"));
const medication_model_1 = __importDefault(require("../models/medication.model"));
const message_model_1 = __importDefault(require("../models/message.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const patient_model_1 = __importDefault(require("../models/patient.model"));
const post_model_1 = __importDefault(require("../models/post.model"));
const prescription_model_1 = __importDefault(require("../models/prescription.model"));
const timeslot_model_1 = __importDefault(require("../models/timeslot.model"));
const token_model_1 = __importDefault(require("../models/token.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const vitalsign_model_1 = __importDefault(require("../models/vitalsign.model"));
const index_1 = __importDefault(require("./index"));
const DbInitialize = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield index_1.default.authenticate();
        console.log("Connected to the database");
        user_model_1.default.sync({ alter: false });
        token_model_1.default.sync({ alter: false });
        doctor_model_1.default.sync({ alter: false });
        timeslot_model_1.default.sync({ alter: false });
        post_model_1.default.sync({ alter: false });
        comment_model_1.default.sync({ alter: false });
        like_model_1.default.sync({ alter: false });
        patient_model_1.default.sync({ alter: false });
        appointment_model_1.default.sync({ alter: false });
        message_model_1.default.sync({ alter: false });
        notification_model_1.default.sync({ alter: false });
        vitalsign_model_1.default.sync({ alter: false });
        consultation_model_1.default.sync({ alter: false });
        prescription_model_1.default.sync({ alter: false });
        medication_model_1.default.sync({ alter: false });
    }
    catch (error) {
        console.log("Unable to connect our database", error);
    }
});
exports.default = DbInitialize;
