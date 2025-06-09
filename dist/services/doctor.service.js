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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorService = void 0;
class DoctorService {
    constructor(doctorDataSource, emailService, userService) {
        this.doctorDataSource = doctorDataSource;
        this.emailService = emailService;
        this.userService = userService;
    }
    createDoctor(record) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Remove isVerified from record if present
            const _b = record, { isVerified } = _b, cleanRecord = __rest(_b, ["isVerified"]);
            const doctor = yield this.doctorDataSource.create(cleanRecord);
            // Get doctor's user details
            const doctorUser = yield this.userService.getUserByField({ id: record.userId });
            if (!doctorUser) {
                throw new Error("Doctor user not found");
            }
            // Get admin user
            const adminUser = yield this.userService.getUserByField({
                email: "charlesbessongtabot@gmail.com"
            });
            if (!adminUser) {
                throw new Error("Admin user not found");
            }
            // Send verification request to admin
            yield this.emailService.sendDoctorVerificationRequestEmail({
                adminEmail: adminUser.email,
                doctorName: `${doctorUser.firstname} ${doctorUser.lastname}`,
                doctorEmail: doctorUser.email,
                specialization: record.specialization,
                experience: record.experience || 0,
                documentUrl: record.documents || "",
                documentType: ((_a = record.documents) === null || _a === void 0 ? void 0 : _a.toLowerCase().endsWith('.pdf')) ? 'pdf' : 'image'
            });
            return doctor;
        });
    }
    getDoctorByUserId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { where: { userId: id }, raw: true, returning: true };
            return this.doctorDataSource.fetchOne(query);
        });
    }
    getDoctorByField(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doctorDataSource.fetchOne(query);
        });
    }
    getDoctors() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { where: {}, raw: true };
            return this.doctorDataSource.fetchAll(query);
        });
    }
    updateDoctorVerification(doctorId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { where: { id: doctorId } };
            yield this.doctorDataSource.updateOne(filter, {
                verificationStatus: updateData.verificationStatus,
                verificationNotes: updateData.verificationNotes,
                verifiedAt: updateData.verifiedAt
            });
            return this.getDoctorByField({ where: { id: doctorId } });
        });
    }
    updateDoctor(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.doctorDataSource.updateOne({ where: { id } }, data);
        });
    }
    verifyDoctor(email, status, notes) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get doctor by email
            const doctorUser = yield this.userService.getUserByField({ email });
            if (!doctorUser) {
                throw new Error("Doctor not found");
            }
            const doctor = yield this.getDoctorByField({ where: { userId: doctorUser.id } });
            if (!doctor) {
                throw new Error("Doctor profile not found");
            }
            // Update verification status
            yield this.updateDoctor(doctor.id, {
                verificationStatus: status,
                verificationNotes: notes,
                verifiedAt: status === 'APPROVED' ? new Date() : null
            });
            // Send verification status email to doctor
            yield this.emailService.sendVerificationStatusEmail({
                doctorEmail: doctorUser.email,
                doctorName: `${doctorUser.firstname} ${doctorUser.lastname}`,
                status,
                verificationNotes: notes
            });
        });
    }
    getDoctorByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userService.getUserByField({ email });
            if (!user) {
                return null;
            }
            return this.getDoctorByField({ where: { userId: user.id } });
        });
    }
    getDoctorsByVerificationStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                where: { verificationStatus: status },
                raw: true
            };
            return this.doctorDataSource.fetchAll(query);
        });
    }
}
exports.DoctorService = DoctorService;
