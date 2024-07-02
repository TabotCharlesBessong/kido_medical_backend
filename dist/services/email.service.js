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
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const emailTemplate = path.join(`${__dirname}`, "..", "template/email.html");
const template = fs.readFileSync(emailTemplate, "utf8");
class EmailService {
    constructor() { }
    static sendForgotPasswordMail(to, code) {
        return __awaiter(this, void 0, void 0, function* () {
            const subject = "Forgot Password";
            const message = `Your email verification code is <b>${code}</b>`;
            return this.sendMail(to, subject, message);
        });
    }
    static replaceTemplateConstant(_template, key, data) {
        const regex = new RegExp(key, "g");
        return _template.replace(regex, data);
    }
    static sendMail(to, subject, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const appName = process.env.APPNAME;
            const supportMail = process.env.VERIFICATION_EMAIL;
            const name = to.split("@")[0];
            let html = this.replaceTemplateConstant(template, "#APP_NAME#", appName);
            html = this.replaceTemplateConstant(html, "#NAME#", name);
            html = this.replaceTemplateConstant(html, "#MESSAGE#", message);
            html = this.replaceTemplateConstant(html, "#SUPPORT_MAIL#", supportMail);
            const transport = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.MAILTRAP_USER,
                    pass: process.env.MAILTRAP_PASS,
                },
            });
            const mailOptions = {
                from: process.env.MAILTRAP_USER,
                to,
                subject,
                text: message,
                html: html,
            };
            const infoMail = yield transport.sendMail(mailOptions);
            return infoMail;
        });
    }
}
exports.default = EmailService;
