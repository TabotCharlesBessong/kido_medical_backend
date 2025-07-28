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
const express_1 = __importDefault(require("express"));
const call_controller_1 = __importDefault(require("../controllers/call.controller"));
const index_middlewares_1 = require("../middlewares/index.middlewares");
const createCallRoute = () => {
    const router = express_1.default.Router();
    const callController = new call_controller_1.default();
    // Create a new call
    router.post("/create", (0, index_middlewares_1.DoctorMiddleware)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield callController.callPatient(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    // End a call
    router.post("/:callId/end", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield callController.endCall(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    // Get all calls
    router.get("/", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield callController.getAllCalls(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    // Get call by ID
    router.get("/:callId", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield callController.getCallById(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    // Delete a call
    router.delete("/:callId", (0, index_middlewares_1.Auth)(), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield callController.deleteCall(req, res);
        }
        catch (error) {
            next(error);
        }
    }));
    return router;
};
exports.default = createCallRoute();
