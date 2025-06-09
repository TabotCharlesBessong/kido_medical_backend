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
const index_utils_1 = __importDefault(require("../utils/index.utils"));
class CallController {
    constructor() {
        this.callService = new call_service_1.default();
    }
    callPatient(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const params = Object.assign({}, req.body);
                const newCall = {
                    doctorId: params.user.id,
                    patientId: params.patientId,
                    appointmentId: params.appointmentId,
                    status: "PENDING",
                };
                const call = yield this.callService.createCall(newCall);
                return index_utils_1.default.handleSuccess(res, "Call started successfully", { call }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    getAllCalls(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const calls = yield this.callService.getCalls();
                return index_utils_1.default.handleSuccess(res, "Calls retrieved successfully", { calls }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    deleteCall(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const callId = req.params.callId;
                yield this.callService.deleteCall(callId);
                return index_utils_1.default.handleSuccess(res, "Call deleted successfully", {}, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
    getCallById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const postId = req.params.postId;
                const call = yield this.callService.getCallById(postId);
                if (!call) {
                    return index_utils_1.default.handleError(res, "Call not found", code_enum_1.ResponseCode.NOT_FOUND);
                }
                return index_utils_1.default.handleSuccess(res, "Call retrieved successfully", { call }, code_enum_1.ResponseCode.SUCCESS);
            }
            catch (error) {
                return index_utils_1.default.handleError(res, error.message, code_enum_1.ResponseCode.SERVER_ERROR);
            }
        });
    }
}
exports.default = CallController;
