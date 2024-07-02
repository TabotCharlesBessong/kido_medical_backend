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
const doctor_datasource_1 = __importDefault(require("../datasources/doctor.datasource"));
class DoctorService {
    constructor() {
        this.doctorDatasource = new doctor_datasource_1.default();
    }
    createDoctor(record) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doctorDatasource.create(record);
        });
    }
    getDoctorByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { where: { userId }, raw: true, returning: true };
            return this.doctorDatasource.fetchOne(query);
        });
    }
    getDoctorByField(record) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                where: Object.assign({}, record),
                raw: true,
            };
            return this.doctorDatasource.fetchOne(query);
        });
    }
    getDoctors() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { where: {}, raw: true };
            return this.doctorDatasource.fetchAll(query);
        });
    }
}
exports.default = DoctorService;
