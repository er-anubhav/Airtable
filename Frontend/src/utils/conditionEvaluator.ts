export interface ConditionalRule {
    dependsOn: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
}

export interface ConditionalRules {
    logic: 'and' | 'or';
    rules: ConditionalRule[];
}

export const shouldShowQuestion = (
    rules: ConditionalRules | null | undefined,
    answersSoFar: Record<string, any>
): boolean => {
    // If no rules, show the question
    if (!rules || !rules.rules || rules.rules.length === 0) {
        return true;
    }

    const { logic, rules: distinctRules } = rules;

    const results = distinctRules.map(rule => {
        const answer = answersSoFar[rule.dependsOn];

        // Handle missing answer
        if (answer === undefined || answer === null) {
            // For 'not_equals', if the answer is missing, it's NOT equal to the value
            if (rule.operator === 'not_equals') return true;
            return false;
        }

        switch (rule.operator) {
            case 'equals':
                return String(answer) === String(rule.value);
            case 'not_equals':
                return String(answer) !== String(rule.value);
            case 'contains':
                if (Array.isArray(answer)) {
                    return answer.some(v => String(v).includes(String(rule.value)));
                }
                return String(answer).includes(String(rule.value));
            case 'greater_than':
                return Number(answer) > Number(rule.value);
            case 'less_than':
                return Number(answer) < Number(rule.value);
            default:
                return false;
        }
    });

    if (logic === 'or') {
        return results.some(r => r === true);
    }
    // Default to 'and'
    return results.every(r => r === true);
};
