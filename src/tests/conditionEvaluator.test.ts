import { shouldShowQuestion, ConditionalRules } from '../utils/conditionEvaluator';

describe('shouldShowQuestion', () => {
    it('should return true if rules are null or undefined', () => {
        expect(shouldShowQuestion(null, {})).toBe(true);
        expect(shouldShowQuestion(undefined, {})).toBe(true);
    });

    it('should return true if rules array is empty', () => {
        expect(shouldShowQuestion({ logic: 'and', rules: [] }, {})).toBe(true);
    });

    describe('Operator: equals', () => {
        const rules: ConditionalRules = {
            logic: 'and',
            rules: [{ dependsOn: 'q1', operator: 'equals', value: 'yes' }]
        };

        it('should return true for matching values', () => {
            expect(shouldShowQuestion(rules, { q1: 'yes' })).toBe(true);
        });

        it('should return false for non-matching values', () => {
            expect(shouldShowQuestion(rules, { q1: 'no' })).toBe(false);
        });

        it('should handle type coercion (string/number)', () => {
            const rulesNum: ConditionalRules = {
                logic: 'and',
                rules: [{ dependsOn: 'q1', operator: 'equals', value: '10' }]
            };
            expect(shouldShowQuestion(rulesNum, { q1: 10 })).toBe(true);
        });
    });

    describe('Operator: not_equals', () => {
        const rules: ConditionalRules = {
            logic: 'and',
            rules: [{ dependsOn: 'q1', operator: 'not_equals', value: 'yes' }]
        };

        it('should return true for non-matching values', () => {
            expect(shouldShowQuestion(rules, { q1: 'no' })).toBe(true);
        });

        it('should return false for matching values', () => {
            expect(shouldShowQuestion(rules, { q1: 'yes' })).toBe(false);
        });

        it('should return true if keys are missing (implicit not equals)', () => {
            expect(shouldShowQuestion(rules, {})).toBe(true);
        });
    });

    describe('Operator: contains', () => {
        const rules: ConditionalRules = {
            logic: 'and',
            rules: [{ dependsOn: 'q1', operator: 'contains', value: 'apple' }]
        };

        it('should return true if string contains substring', () => {
            expect(shouldShowQuestion(rules, { q1: 'green apple' })).toBe(true);
        });

        it('should return false if string does not contain substring', () => {
            expect(shouldShowQuestion(rules, { q1: 'orange' })).toBe(false);
        });

        it('should work with arrays', () => {
            expect(shouldShowQuestion(rules, { q1: ['banana', 'apple'] })).toBe(true);
        });
    });

    describe('Operator: greater_than / less_than', () => {
        const rulesGT: ConditionalRules = {
            logic: 'and',
            rules: [{ dependsOn: 'q1', operator: 'greater_than', value: '10' }]
        };

        it('should return true if value > rule', () => {
            expect(shouldShowQuestion(rulesGT, { q1: 15 })).toBe(true);
        });

        it('should return false if value <= rule', () => {
            expect(shouldShowQuestion(rulesGT, { q1: 5 })).toBe(false);
        });

        const rulesLT: ConditionalRules = {
            logic: 'and',
            rules: [{ dependsOn: 'q1', operator: 'less_than', value: '10' }]
        };

        it('should return true if value < rule', () => {
            expect(shouldShowQuestion(rulesLT, { q1: 5 })).toBe(true);
        });
    });

    describe('Logic: AND', () => {
        const rules: ConditionalRules = {
            logic: 'and',
            rules: [
                { dependsOn: 'q1', operator: 'equals', value: 'yes' },
                { dependsOn: 'q2', operator: 'equals', value: 'active' }
            ]
        };

        it('should return true only if ALL rules match', () => {
            expect(shouldShowQuestion(rules, { q1: 'yes', q2: 'active' })).toBe(true);
        });

        it('should return false if any rule fails', () => {
            expect(shouldShowQuestion(rules, { q1: 'yes', q2: 'inactive' })).toBe(false);
            expect(shouldShowQuestion(rules, { q1: 'no', q2: 'active' })).toBe(false);
        });
    });

    describe('Logic: OR', () => {
        const rules: ConditionalRules = {
            logic: 'or',
            rules: [
                { dependsOn: 'q1', operator: 'equals', value: 'yes' },
                { dependsOn: 'q2', operator: 'equals', value: 'active' }
            ]
        };

        it('should return true if ANY rule matches', () => {
            expect(shouldShowQuestion(rules, { q1: 'yes', q2: 'inactive' })).toBe(true);
            expect(shouldShowQuestion(rules, { q1: 'no', q2: 'active' })).toBe(true);
        });

        it('should return false if ALL rules fail', () => {
            expect(shouldShowQuestion(rules, { q1: 'no', q2: 'inactive' })).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        const rules: ConditionalRules = {
            logic: 'and',
            rules: [{ dependsOn: 'q1', operator: 'equals', value: 'yes' }]
        };

        it('should return false if dependent answer is missing (for equality)', () => {
            expect(shouldShowQuestion(rules, {})).toBe(false);
        });
    });
});
