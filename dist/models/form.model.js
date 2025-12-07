"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Form = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ConditionalRuleSchema = new mongoose_1.Schema({
    dependsOn: { type: String, required: true },
    operator: { type: String, required: true },
    value: { type: mongoose_1.Schema.Types.Mixed, required: true }
});
const QuestionSchema = new mongoose_1.Schema({
    questionKey: { type: String, required: true },
    airtableFieldId: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
    conditionalRules: [ConditionalRuleSchema],
    conditionLogic: { type: String, enum: ['and', 'or'], default: 'and' }
});
const FormSchema = new mongoose_1.Schema({
    ownerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    airtableBaseId: { type: String, required: true },
    airtableTableId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    questions: [QuestionSchema]
}, {
    timestamps: true
});
exports.Form = mongoose_1.default.model('Form', FormSchema);
