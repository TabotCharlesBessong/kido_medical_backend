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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbInitialize = void 0;
const sequelize_1 = require("sequelize");
const user_model_1 = __importDefault(require("../models/user.model"));
const token_model_1 = __importDefault(require("../models/token.model"));
const doctor_model_1 = __importDefault(require("../models/doctor.model"));
const patient_model_1 = __importDefault(require("../models/patient.model"));
const timeslot_model_1 = __importDefault(require("../models/timeslot.model"));
const appointment_model_1 = __importDefault(require("../models/appointment.model"));
const post_model_1 = __importDefault(require("../models/post.model"));
const comment_model_1 = __importDefault(require("../models/comment.model"));
const like_model_1 = __importDefault(require("../models/like.model"));
const message_model_1 = __importDefault(require("../models/message.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const vitalsign_model_1 = __importDefault(require("../models/vitalsign.model"));
const consultation_model_1 = __importDefault(require("../models/consultation.model"));
const prescription_model_1 = __importDefault(require("../models/prescription.model"));
const medication_model_1 = __importDefault(require("../models/medication.model"));
const call_model_1 = __importDefault(require("../models/call.model"));
const kycverification_model_1 = __importDefault(require("../models/kycverification.model"));
const reminder_model_1 = __importDefault(require("../models/reminder.model"));
const sequelize = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: (_a = process.env.DB_DIALECT) !== null && _a !== void 0 ? _a : "postgres",
    logging: false,
});
const DbInitialize = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Test the connection
        yield sequelize.authenticate();
        console.log("Database connection has been established successfully.");
        // Sync all models in the correct order to handle associations
        yield user_model_1.default.sync();
        yield token_model_1.default.sync();
        yield doctor_model_1.default.sync();
        yield patient_model_1.default.sync();
        yield timeslot_model_1.default.sync();
        yield appointment_model_1.default.sync();
        yield post_model_1.default.sync();
        yield comment_model_1.default.sync();
        yield like_model_1.default.sync();
        yield message_model_1.default.sync();
        yield notification_model_1.default.sync();
        yield vitalsign_model_1.default.sync();
        yield consultation_model_1.default.sync();
        yield prescription_model_1.default.sync();
        yield medication_model_1.default.sync();
        yield call_model_1.default.sync();
        yield kycverification_model_1.default.sync({ alter: true });
        yield reminder_model_1.default.sync();
        console.log("All models synchronized successfully.");
    }
    catch (error) {
        console.error("Unable to connect to the database:", error);
        throw error;
    }
});
exports.DbInitialize = DbInitialize;
exports.default = exports.DbInitialize;
