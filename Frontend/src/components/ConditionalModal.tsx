import React, { useState, useEffect } from 'react';

interface Rule {
    id: string; // Temporary ID for UI keying
    dependsOn: string;
    operator: string;
    value: string;
}

interface ConditionalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (rules: any[], logic: string) => void;
    availableQuestions: any[];
    initialRules?: any[];
    initialLogic?: string;
}

const ConditionalModal: React.FC<ConditionalModalProps> = ({
    isOpen, onClose, onSave, availableQuestions, initialRules = [], initialLogic = 'and'
}) => {
    const [rules, setRules] = useState<Rule[]>([]);
    const [logic, setLogic] = useState('and');

    // Load initial state when opening
    useEffect(() => {
        if (isOpen) {
            if (initialRules && initialRules.length > 0) {
                setRules(initialRules.map((r, idx) => ({ ...r, id: idx.toString() })));
            } else {
                setRules([]);
            }
            setLogic(initialLogic || 'and');
        }
    }, [isOpen, initialRules, initialLogic]);

    if (!isOpen) return null;

    const addRule = () => {
        setRules([...rules, {
            id: Math.random().toString(36).substr(2, 9),
            dependsOn: '',
            operator: 'equals',
            value: ''
        }]);
    };

    const removeRule = (id: string) => {
        setRules(rules.filter(r => r.id !== id));
    };

    const updateRule = (id: string, field: keyof Rule, val: string) => {
        setRules(rules.map(r => r.id === id ? { ...r, [field]: val } : r));
    };

    const handleSave = () => {
        // Validation: Ensure all rules are complete
        const validRules = rules.filter(r => r.dependsOn && r.value !== '');

        // Strip temporary IDs
        const cleanedRules = validRules.map(({ id, ...rest }) => rest);

        onSave(cleanedRules, logic);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', minWidth: '500px', maxWidth: '80%', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 style={{ marginTop: 0 }}>Configure Conditional Logic</h3>

                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>Show this question if</span>
                    <select
                        value={logic}
                        onChange={e => setLogic(e.target.value)}
                        style={{ padding: '5px', fontWeight: 'bold' }}
                    >
                        <option value="and">ALL</option>
                        <option value="or">ANY</option>
                    </select>
                    <span>of the following match:</span>
                </div>

                {rules.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#888', background: '#f5f5f5', borderRadius: '4px', marginBottom: '10px' }}>
                        No conditions set. This question will always be visible.
                    </div>
                )}

                {rules.map((rule) => (
                    <div key={rule.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                        {/* Question Select */}
                        <select
                            style={{ flex: 2, padding: '5px' }}
                            value={rule.dependsOn}
                            onChange={e => updateRule(rule.id, 'dependsOn', e.target.value)}
                        >
                            <option value="">Select Question</option>
                            {availableQuestions.map(q => (
                                <option key={q.questionKey} value={q.questionKey}>
                                    {q.label}
                                </option>
                            ))}
                        </select>

                        {/* Operator Select */}
                        <select
                            style={{ flex: 1, padding: '5px' }}
                            value={rule.operator}
                            onChange={e => updateRule(rule.id, 'operator', e.target.value)}
                        >
                            <option value="equals">Equals</option>
                            <option value="not_equals">Not Equals</option>
                            <option value="contains">Contains</option>
                            <option value="greater_than">&gt;</option>
                            <option value="less_than">&lt;</option>
                        </select>

                        {/* Value Input */}
                        <input
                            type="text"
                            style={{ flex: 2, padding: '5px' }}
                            value={rule.value}
                            placeholder="Value"
                            onChange={e => updateRule(rule.id, 'value', e.target.value)}
                        />

                        {/* Remove Button */}
                        <button
                            onClick={() => removeRule(rule.id)}
                            style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer', fontSize: '1.2em' }}
                            title="Remove Rule"
                        >
                            &times;
                        </button>
                    </div>
                ))}

                <button
                    onClick={addRule}
                    style={{
                        display: 'block', width: '100%', padding: '8px',
                        background: '#f0f0f0', border: '1px dashed #ccc', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px'
                    }}
                >
                    + Add Condition
                </button>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                    <button onClick={onClose} style={{ padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                    <button onClick={handleSave} style={{ padding: '8px 16px', background: '#2D7FF9', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save Logic</button>
                </div>
            </div>
        </div>
    );
};

export default ConditionalModal;
