"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Religion = exports.AppointmentStatus = exports.Gender = void 0;
exports.Gender = {
    MALE: "MALE",
    FEMALE: "FEMALE",
    OTHER: "OTHER",
};
exports.AppointmentStatus = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    CANCELED: "CANCELED"
};
var Religion;
(function (Religion) {
    Religion["CHRISTIAN"] = "christian";
    Religion["MUSLIM"] = "muslim";
    Religion["BUDDHIST"] = "buddhist";
    Religion["HINDU"] = "hindu";
})(Religion || (exports.Religion = Religion = {}));
