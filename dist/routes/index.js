"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const forms_routes_1 = __importDefault(require("./forms.routes"));
const webhooks_routes_1 = __importDefault(require("./webhooks.routes"));
const airtable_routes_1 = __importDefault(require("./airtable.routes"));
const submissions_routes_1 = __importDefault(require("./submissions.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/forms', forms_routes_1.default);
router.use('/webhooks', webhooks_routes_1.default);
router.use('/airtable', airtable_routes_1.default);
router.use('/submissions', submissions_routes_1.default);
exports.default = router;
