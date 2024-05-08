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
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const init_1 = __importDefault(require("./database/init"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = (process.env.PORT || 5001);
app.use((0, cors_1.default)({ origin: "*" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use((err, req, res, next) => {
    try {
        if (err) {
            return res
                .status(500)
                .json({ status: false, message: err.message });
        }
    }
    catch (e) { }
});
const Bootstrap = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, init_1.default)();
            app.listen(port, () => {
                console.log(`Our server is up and running at http://localhost:${port}`);
            });
        }
        catch (error) {
            console.log("unablle to connect to database: ", error);
        }
    });
};
Bootstrap();
