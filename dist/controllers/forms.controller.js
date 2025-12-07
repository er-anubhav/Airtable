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
exports.getMyForms = exports.getForm = exports.createForm = void 0;
const form_service_1 = require("../services/form.service");
const createForm = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            throw new Error('User not found in request');
        const form = yield form_service_1.FormService.createForm(req.user._id.toString(), req.body);
        res.status(201).json({ success: true, data: form });
    }
    catch (error) {
        next(error);
    }
});
exports.createForm = createForm;
const getForm = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const form = yield form_service_1.FormService.getFormById(id);
        res.status(200).json({ success: true, data: form });
    }
    catch (error) {
        next(error);
    }
});
exports.getForm = getForm;
const getMyForms = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            throw new Error('User not found in request');
        const forms = yield form_service_1.FormService.getFormsByUser(req.user._id.toString());
        res.status(200).json({ success: true, data: forms });
    }
    catch (error) {
        next(error);
    }
});
exports.getMyForms = getMyForms;
