"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Frequency = exports.PostStatus = exports.TimeSlotStatus = void 0;
exports.TimeSlotStatus = {
    AVAILABLE: "AVAILABLE",
    UNAVAILABLE: "UNAVAILABLE",
};
exports.PostStatus = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    DELETED: "DELETED",
};
var Frequency;
(function (Frequency) {
    Frequency["ONCE_A_DAY"] = "ONCE_A_DAY";
    Frequency["TWICE_A_DAY"] = "TWICE_A_DAY";
    Frequency["THRICE_A_DAY"] = "THRICE_A_DAY";
})(Frequency || (exports.Frequency = Frequency = {}));
