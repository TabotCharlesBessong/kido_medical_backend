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
const patient_model_1 = __importDefault(require("../models/patient.model"));
class PatientDataSource {
    create(record) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield patient_model_1.default.create(record);
        });
    }
    fetchOne(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield patient_model_1.default.findOne(query);
        });
    }
    updateOne(searchBy, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield patient_model_1.default.update(data, searchBy);
        });
    }
    fetchAll(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield patient_model_1.default.findAll(query);
        });
    }
}
exports.default = PatientDataSource;
