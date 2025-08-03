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
const code_enum_1 = require("../interfaces/enum/code.enum");
const call_service_1 = __importDefault(require("../services/call.service"));
const stream_service_1 = __importDefault(require("../services/stream.service"));
const index_utils_1 = __importDefault(require("../utils/index.utils"));
const appointment_model_1 = __importDefault(require("../models/appointment.model"));
const timeslot_model_1 = __importDefault(require("../models/timeslot.model"));
class CallController {
    constructor() {
        this.callPatient = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
            if (!userId || !userRole) {
                return index_utils_1.default.handleError(res, "Unauthorized access", code_enum_1.ResponseCode.UNAUTHORIZED);
            }
            try {
                const { appointmentId } = req.body;
                if (!appointmentId) {
                    return index_utils_1.default.handleError(res, "Missing required fields", code_enum_1.ResponseCode.BAD_REQUEST);
                }
                // Get appointment and time slot
                const appointment = yield appointment_model_1.default.findByPk(appointmentId, {
                    include: [{
                            model: timeslot_model_1.default,
                            as: 'timeSlot'
                        }],
                });
                if (!appointment) {
                    return index_utils_1.default.handleError(res, "Appointment not found", code_enum_1.ResponseCode.NOT_FOUND);
                }
                if (appointment.status !== "CONFIRMED") {
                    return index_utils_1.default.handleError(res, "Appointment must be confirmed to start a call", code_enum_1.ResponseCode.BAD_REQUEST);
                }
                const timeSlot = appointment.timeSlot;
                if (!timeSlot) {
                    return index_utils_1.default.handleError(res, "Time slot not found", code_enum_1.ResponseCode.NOT_FOUND);
                }
                // Create Stream channel for the call
                const channel = yield stream_service_1.default.createCallChannel(appointmentId, userId, appointment.patientId, timeSlot.startTime);
                if (!channel || !channel.id) {
                    return index_utils_1.default.handleError(res, "Failed to create call channel", code_enum_1.ResponseCode.SERVER_ERROR);
                }
                // Create or update call record
                const existingCall = yield this.callService.getCallByAppointmentId(appointmentId);
                let call;
                if (existingCall) {
                    call = yield this.callService.updateCall(existingCall.id, {
                        status: "ACTIVE",
                        streamCallId: channel.id
                    });
                }
                else {
                    call = yield this.callService.createCall({
                        appointmentId,
                        doctorId: userId,
                        patientId: appointment.patientId,
                        status: "ACTIVE",
                        streamCallId: channel.id
                    });
                }
                // Generate Stream token for real-time communication
                const streamToken = yield stream_service_1.default.generateStreamToken(userId);
                return index_utils_1.default.handleSuccess(res, "Call initiated successfully", {
                    call,
                    streamToken,
                    channelId: channel.id
                }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                console.error("Error initiating call:", error);
                return index_utils_1.default.handleError(res, "Failed to initiate call", code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
        this.getAllCalls = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const calls = yield this.callService.getCalls();
                return index_utils_1.default.handleSuccess(res, "Calls retrieved successfully", { calls }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message);
            }
        });
        this.getCallById = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { callId } = req.params;
                const call = yield this.callService.getCallById(callId);
                if (!call) {
                    return index_utils_1.default.handleError(res, "Call not found", code_enum_1.ResponseCode.NOT_FOUND);
                }
                return index_utils_1.default.handleSuccess(res, "Call retrieved successfully", { call }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message);
            }
        });
        this.endCall = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { callId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return index_utils_1.default.handleError(res, "Unauthorized access", code_enum_1.ResponseCode.UNAUTHORIZED);
                }
                const call = yield this.callService.getCallById(callId);
                if (!call) {
                    return index_utils_1.default.handleError(res, "Call not found", code_enum_1.ResponseCode.NOT_FOUND);
                }
                // Verify user is part of the call
                if (call.doctorId !== userId && call.patientId !== userId) {
                    return index_utils_1.default.handleError(res, "Unauthorized to end this call", code_enum_1.ResponseCode.UNAUTHORIZED);
                }
                // End the Stream channel if it exists
                if (call.streamCallId) {
                    yield stream_service_1.default.endCallChannel(call.streamCallId);
                }
                // Update call status
                const updatedCall = yield this.callService.updateCall(callId, {
                    status: "COMPLETED",
                    updatedAt: new Date()
                });
                return index_utils_1.default.handleSuccess(res, "Call ended successfully", { call: updatedCall }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                console.error("Error ending call:", error);
                return index_utils_1.default.handleError(res, "Failed to end call", code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
        this.deleteCall = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { callId } = req.params;
                const call = yield this.callService.getCallById(callId);
                if (!call) {
                    return index_utils_1.default.handleError(res, "Call not found", code_enum_1.ResponseCode.NOT_FOUND);
                }
                yield this.callService.deleteCall(callId);
                return index_utils_1.default.handleSuccess(res, "Call deleted successfully", {}, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message);
            }
        });
        this.callService = new call_service_1.default();
    }
}
exports.default = CallController;
