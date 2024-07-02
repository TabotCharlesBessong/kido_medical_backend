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
const appointment_datasource_1 = __importDefault(require("../datasources/appointment.datasource"));
const notification_datasource_1 = __importDefault(require("../datasources/notification.datasource"));
const notification_enum_1 = require("../interfaces/enum/notification.enum");
const patient_enum_1 = require("../interfaces/enum/patient.enum");
class AppointmentService {
    constructor() {
        this.appointmentDataSource = new appointment_datasource_1.default();
        this.notificationDataSource = new notification_datasource_1.default();
    }
    createAppointment(record) {
        return __awaiter(this, void 0, void 0, function* () {
            const appointment = Object.assign(Object.assign({}, record), { status: patient_enum_1.AppointmentStatus.PENDING });
            const createdAppointment = yield this.appointmentDataSource.create(appointment);
            // Notify the doctor
            yield this.notificationDataSource.create({
                userId: createdAppointment.patientId,
                appointmentId: createdAppointment.id,
                message: "Your appointment has been created",
                type: notification_enum_1.NotificationType.APPOINTMENT_SCHEDULED,
                read: false,
            });
            return createdAppointment;
        });
    }
    approveAppointment(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { where: { id: appointmentId } };
            const update = {
                staus: patient_enum_1.AppointmentStatus.APPROVED,
            };
            yield this.appointmentDataSource.updateOne(update, filter);
            const appointment = yield this.getAppointmentById(appointmentId);
            if (appointment) {
                yield this.notificationDataSource.create({
                    userId: appointment.patientId,
                    appointmentId: appointment.id,
                    message: "Your appointment has been approved",
                    type: notification_enum_1.NotificationType.APPOINTMENT_APPROVED,
                });
            }
        });
    }
    cancelAppointment(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { where: { id: appointmentId } };
            const update = {
                staus: patient_enum_1.AppointmentStatus.CANCELED,
            };
            yield this.appointmentDataSource.updateOne(update, filter);
            const appointment = yield this.getAppointmentById(appointmentId);
            if (appointment) {
                yield this.notificationDataSource.create({
                    userId: appointment.patientId,
                    appointmentId: appointment.id,
                    message: "Your appointment has been canceled",
                    type: notification_enum_1.NotificationType.APPOINTMENT_CANCELLED,
                });
            }
        });
    }
    getAppointmentById(appointmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.appointmentDataSource.fetchOne({
                where: { id: appointmentId },
            });
        });
    }
    updateAppointment(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { where: { id } };
            yield this.appointmentDataSource.updateOne(data, filter);
        });
    }
    getAppointments() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { where: {}, raw: true };
            return this.appointmentDataSource.fetchAll(query);
        });
    }
}
exports.default = AppointmentService;
