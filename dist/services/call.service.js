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
const call_datasource_1 = __importDefault(require("../datasources/call.datasource"));
const patient_datasource_1 = __importDefault(require("../datasources/patient.datasource"));
const stream_service_1 = __importDefault(require("./stream.service"));
class CallService {
    constructor() {
        this.callDataSource = new call_datasource_1.default();
        this.patientDataSource = new patient_datasource_1.default();
    }
    createCall(record) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Create the call record in the DB
                const call = yield this.callDataSource.create(record);
                // If streamCallId is provided, update Stream channel status
                if (record.streamCallId) {
                    yield stream_service_1.default.setCallStatus(record.streamCallId, "ACTIVE");
                }
                return call;
            }
            catch (error) {
                console.error('Error creating call:', error);
                throw new Error('Failed to create call record');
            }
        });
    }
    getCallByAppointmentId(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.callDataSource.fetchOne({
                    where: { appointmentId }
                });
            }
            catch (error) {
                console.error('Error fetching call by appointment ID:', error);
                throw new Error('Failed to fetch call record');
            }
        });
    }
    updateCallStatus(callId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const call = yield this.getCallById(callId);
                if (!call) {
                    throw new Error('Call not found');
                }
                yield this.callDataSource.updateOne({ where: { id: callId } }, { status });
                // If there's a Stream call ID, update its status
                if (call.streamCallId) {
                    yield stream_service_1.default.setCallStatus(call.streamCallId, status);
                }
            }
            catch (error) {
                console.error('Error updating call status:', error);
                throw new Error('Failed to update call status');
            }
        });
    }
    getCallById(callId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.callDataSource.fetchOne({
                where: { id: callId },
            });
        });
    }
    getCalls() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { where: {}, raw: true };
            return this.callDataSource.fetchAll(query);
        });
    }
    updateCall(callId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.callDataSource.updateOne({ where: { id: callId } }, data);
            const updatedCall = yield this.getCallById(callId);
            if (!updatedCall) {
                throw new Error("Call not found after update");
            }
            // If status is being updated and streamCallId exists, update Stream channel status
            if (data.status && updatedCall.streamCallId) {
                yield stream_service_1.default.setCallStatus(updatedCall.streamCallId, data.status);
            }
            return updatedCall;
        });
    }
    deleteCall(callId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.callDataSource.deleteOne({ where: { id: callId } });
        });
    }
}
exports.default = CallService;
