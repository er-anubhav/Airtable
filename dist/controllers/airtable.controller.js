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
exports.getFields = exports.getTables = exports.getBases = void 0;
const airtable_service_1 = require("../services/airtable.service");
const getBases = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            throw new Error('User not found in request');
        const bases = yield airtable_service_1.AirtableService.getBases(req.user);
        res.status(200).json({ success: true, data: bases });
    }
    catch (error) {
        next(error);
    }
});
exports.getBases = getBases;
const getTables = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            throw new Error('User not found in request');
        const { baseId } = req.params;
        const tables = yield airtable_service_1.AirtableService.getTables(req.user, baseId);
        res.status(200).json({ success: true, data: tables });
    }
    catch (error) {
        next(error);
    }
});
exports.getTables = getTables;
const getFields = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            throw new Error('User not found in request');
        const { baseId, tableId } = req.params;
        const fields = yield airtable_service_1.AirtableService.getFields(req.user, baseId, tableId);
        res.status(200).json({ success: true, data: fields });
    }
    catch (error) {
        next(error);
    }
});
exports.getFields = getFields;
