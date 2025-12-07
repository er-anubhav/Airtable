import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getForm, submitFormResponse } from '../services/api/forms';
import { shouldShowQuestion } from '../utils/conditionEvaluator';

const FormViewer: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [form, setForm] = useState<any>(null);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (id) {
            getForm(id)
                .then((data) => {
                    setForm(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Failed to load form', err);
                    setError('Failed to load form');
                    setLoading(false);
                });
        }
    }, [id]);

    const handleAnswerChange = (questionKey: string, value: any) => {
        setAnswers(prev => ({ ...prev, [questionKey]: value }));
        // Clear error when user types
        if (errors[questionKey]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[questionKey];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');

        // Validate
        const newErrors: Record<string, string> = {};
        let isValid = true;

        if (form && form.questions) {
            form.questions.forEach((q: any) => {
                const isVisible = shouldShowQuestion({
                    logic: q.conditionLogic,
                    rules: q.conditionalRules
                }, answers);

                if (isVisible && q.required) {
                    const val = answers[q.questionKey];
                    if (val === undefined || val === null || val === '') {
                        newErrors[q.questionKey] = 'This field is required';
                        isValid = false;
                    }
                }
            });
        }

        setErrors(newErrors);

        if (isValid) {
            try {
                await submitFormResponse(id!, answers);
                setSubmitted(true);
            } catch (err: any) {
                console.error(err);
                setSubmitError(err.response?.data?.message || err.message || 'Submission failed');
            }
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading form...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
    if (!form) return <div style={{ padding: '20px' }}>Form not found</div>;

    if (submitted) {
        return (
            <div style={{ maxWidth: '800px', margin: '40px auto', padding: '40px', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px' }}>
                <h1 style={{ color: '#2D7FF9' }}>Thank You!</h1>
                <p style={{ fontSize: '1.2em' }}>Your response has been successfully submitted.</p>
                <button
                    onClick={() => { setSubmitted(false); setAnswers({}); }}
                    style={{ marginTop: '20px', padding: '10px 20px', background: '#eee', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Submit another response
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
            <h1 style={{ marginBottom: '10px' }}>{form.title}</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>{form.description}</p>

            {submitError && (
                <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', marginBottom: '20px', borderRadius: '4px' }}>
                    <strong>Error:</strong> {submitError}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {form.questions.map((q: any) => {
                    const isVisible = shouldShowQuestion({
                        logic: q.conditionLogic,
                        rules: q.conditionalRules
                    }, answers);

                    if (!isVisible) return null;

                    return (
                        <div key={q.questionKey} style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                                {q.label} {q.required && <span style={{ color: 'red' }}>*</span>}
                            </label>

                            {/* Render Input based on type */}
                            {/* Currently supporting text, email, url, multiline */}
                            {(q.type === 'singleLineText' || q.type === 'email' || q.type === 'url') && (
                                <input
                                    type={q.type === 'email' ? 'email' : 'text'}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: errors[q.questionKey] ? '1px solid red' : '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                    value={answers[q.questionKey] || ''}
                                    onChange={e => handleAnswerChange(q.questionKey, e.target.value)}
                                />
                            )}

                            {q.type === 'multilineText' && (
                                <textarea
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: errors[q.questionKey] ? '1px solid red' : '1px solid #ddd',
                                        borderRadius: '4px',
                                        minHeight: '100px'
                                    }}
                                    value={answers[q.questionKey] || ''}
                                    onChange={e => handleAnswerChange(q.questionKey, e.target.value)}
                                />
                            )}

                            {(q.type === 'singleSelect' || q.type === 'multipleSelects') && (
                                <select
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: errors[q.questionKey] ? '1px solid red' : '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                    value={answers[q.questionKey] || ''}
                                    onChange={e => handleAnswerChange(q.questionKey, e.target.value)}
                                >
                                    <option value="">Select an option</option>
                                    {/* Options are not currently stored in DB schema for select, would need to fetch later, assuming manual input for now or string */}
                                    <option value="Option 1">Option 1</option>
                                    <option value="Option 2">Option 2</option>
                                </select>
                            )}

                            {errors[q.questionKey] && (
                                <div style={{ color: 'red', fontSize: '0.85em', marginTop: '5px' }}>
                                    {errors[q.questionKey]}
                                </div>
                            )}
                        </div>
                    );
                })}

                <button
                    type="submit"
                    style={{
                        padding: '12px 24px',
                        background: '#2D7FF9',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1em',
                        marginTop: '20px'
                    }}
                >
                    Submit Form
                </button>
            </form>
        </div>
    );
};

export default FormViewer;
