"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycDocumentType = exports.KycStatus = void 0;
var KycStatus;
(function (KycStatus) {
    KycStatus["Pending"] = "pending";
    KycStatus["Approved"] = "approved";
    KycStatus["Rejected"] = "rejected";
})(KycStatus || (exports.KycStatus = KycStatus = {}));
var KycDocumentType;
(function (KycDocumentType) {
    KycDocumentType["License"] = "license";
    KycDocumentType["ID"] = "id";
    KycDocumentType["Certificate"] = "certificate";
    KycDocumentType["Other"] = "other";
})(KycDocumentType || (exports.KycDocumentType = KycDocumentType = {}));
