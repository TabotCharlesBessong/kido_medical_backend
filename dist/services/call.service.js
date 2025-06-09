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
const twilio_service_1 = require("./twilio.service");
class CallService {
    constructor() {
        this.callDataSource = new call_datasource_1.default();
        this.patientDataSource = new patient_datasource_1.default();
    }
    createCall(record) {
        return __awaiter(this, void 0, void 0, function* () {
            const call = yield this.callDataSource.create(record);
            const patient = yield this.patientDataSource.fetchOne({
                where: { userId: record.patientId },
            });
            console.log(patient);
            // if (!patient || !patient.phoneNumber) {
            //   throw new Error("Patient does not have a phone number.");
            // }
            try {
                yield (0, twilio_service_1.makeCall)("+13149364610", record.appointmentId);
                yield this.callDataSource.updateOne({ where: { id: call.id } }, { status: "COMPLETED" });
            }
            catch (error) {
                yield this.callDataSource.updateOne({ where: { id: call.id } }, { status: "FAILED" });
                throw error;
            }
            return call;
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
    deleteCall(callId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.callDataSource.deleteOne({ where: { id: callId } });
        });
    }
}
exports.default = CallService;
