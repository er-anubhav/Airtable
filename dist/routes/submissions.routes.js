"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const submissions_controller_1 = require("../controllers/submissions.controller");
const router = (0, express_1.Router)();
// Public route for form submission
router.post('/:formId', submissions_controller_1.submitForm);
exports.default = router;
