"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const conditionEvaluator_1 = require("../utils/conditionEvaluator");
describe('shouldShowQuestion', () => {
    it('should return true if rules are null or undefined', () => {
        expect((0, conditionEvaluator_1.shouldShowQuestion)(null, {})).toBe(true);
        expect((0, conditionEvaluator_1.shouldShowQuestion)(undefined, {})).toBe(true);
    });
    it('should return true if rules array is empty', () => {
        expect((0, conditionEvaluator_1.shouldShowQuestion)({ logic: 'and', rules: [] }, {})).toBe(true);
    });
    describe('Operator: equals', () => {
        const rules = {
            logic: 'and',
            rules: [{ dependsOn: 'q1', operator: 'equals', value: 'yes' }]
        };
        it('should return true for matching values', () => {
            expect((0, conditionEvaluator_1.shouldShowQuestion)(rules, { q1: 'yes' })).toBe(true);
        });
        it('should return false for non-matching values', () => {
            expect((0, conditionEvaluator_1.shouldShowQuestion)(rules, { q1: 'no' })).toBe(false);
        });
        it('should handle type coercion (string/number)', () => {
            const rulesNum = {
                logic: 'and',
                rules: [{ dependsOn: 'q1', operator: 'equals', value: '10' }]
            };
            expect((0, conditionEvaluator_1.shouldShowQuestion)(rulesNum, { q1: 10 })).toBe(true);
        });
    });
    describe('Operator: not_equals', () => {
        const rules = {
            logic: 'and',
            rules: [{ dependsOn: 'q1', operator: 'not_equals', value: 'yes' }]
        };
        it('should return true for non-matching values', () => {
            expect((0, conditionEvaluator_1.shouldShowQuestion)(rules, { q1: 'no' })).toBe(true);
        });
        it('should return false for matching values', () => {
            expect((0, conditionEvaluator_1.shouldShowQuestion)(rules, { q1: 'yes' })).toBe(false);
        });
        it('should return true if keys are missing (implicit not equals)', () => {
            expect((0, conditionEvaluator_1.shouldShowQuestion)(rules, {})).toBe(true);
        });
    });
    describe('Operator: contains', () => {
        const rules = {
            logic: 'and',
            rules: [{ dependsOn: 'q1', operator: 'contains', value: 'apple' }]
        };
        it('should return true if string contains substring', () => {
            expect((0, conditionEvaluator_1.shouldShowQuestion)(rules, { q1: 'green apple' })).toBe(true);
        });
        it('should return false if string does not contain substring', () => {
            expect((0, conditionEvaluator_1.shouldShowQuestion)(rules, { q1: 'orange' })).toBe(false);
        });
        it('should work with arrays', () => {
            expect((0, conditionEvaluator_1.shouldShowQuestion)(rules, { q1: ['banana', 'apple'] })).toBe(true);
        });
    });
    describe('Operator: greater_than / less_than', () => {
        const rulesGT = {
            logic: 'and',
            rules: [{ dependsOn: 'q1', operator: 'greater_than', value: '10' }]
        };
        it('should return true if value > rule', () => {
            expect((0, conditionEvaluator_1.shouldShowQuestion)(rulesGT, { q1: 15 })).toBe(true);
        });
        it('should return false if value <= rule', () => {
            expect((0, conditionEvaluator_1.shouldShowQuestion)(rulesGT, { q1: 5 })).toBe(false);
        });
        const rulesLT = {
            logic: 'and',
            rules: [{ dependsOn: 'q1', operator: 'less_than', value: '10' }]
        };
        it('should return true if value < rule', () => {
            expect((0, conditionEvaluator_1.shouldShowQuestion)(rulesLT, { q1: 5 })).toBe(true);
        });
    });
    describe('Logic: AND', () => {
        const rules = {
            logic: 'and',
            rules: [
                { dependsOn: 'q1', operator: 'equals', value: 'yes' },
                { dependsOn: 'q2', operator: 'equals', value: 'active' }
            ]
        };
        it('should return true only if ALL rules match', () => {
            expect((0, conditionEvaluator_1.shouldShowQuestion)(rules, { q1: 'yes', q2: 'active' })).toBe(true);
        });
        it('should return false if any rule fails', () => {
            expect((0, conditionEvaluator_1.shouldShowQuestion)(rules, { q1: 'yes', q2: 'inactive' })).toBe(false);
            expect((0, conditionEvaluator_1.shouldShowQuestion)(rules, { q1: 'no', q2: 'active' })).toBe(false);
        });
    });
    describe('Logic: OR', () => {
        const rules = {
            logic: 'or',
            rules: [
                { dependsOn: 'q1', operator: 'equals', value: 'yes' },
                { dependsOn: 'q2', operator: 'equals', value: 'active' }
            ]
        };
        it('should return true if ANY rule matches', () => {
            expect((0, conditionEvaluator_1.shouldShowQuestion)(rules, { q1: 'yes', q2: 'inactive' })).toBe(true);
            expect((0, conditionEvaluator_1.shouldShowQuestion)(rules, { q1: 'no', q2: 'active' })).toBe(true);
        });
        it('should return false if ALL rules fail', () => {
            expect((0, conditionEvaluator_1.shouldShowQuestion)(rules, { q1: 'no', q2: 'inactive' })).toBe(false);
        });
    });
    describe('Edge Cases', () => {
        const rules = {
            logic: 'and',
            rules: [{ dependsOn: 'q1', operator: 'equals', value: 'yes' }]
        };
        it('should return false if dependent answer is missing (for equality)', () => {
            expect((0, conditionEvaluator_1.shouldShowQuestion)(rules, {})).toBe(false);
        });
    });
});
