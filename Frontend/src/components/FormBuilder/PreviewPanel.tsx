import React from 'react';
import '../../styles/FormBuilder.css';

interface PreviewPanelProps {
    title: string;
    description: string;
    selectedFields: any[];
    onSave: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ title, description, selectedFields, onSave }) => {
    return (
        <div className="fb-right-panel">
            <div className="fb-preview-header">
                <button className="fb-btn-primary" onClick={onSave}>Save Form</button>
            </div>

            <div className="fb-preview-content">
                <div className="fb-preview-card">
                    <div>
                        <h1 className="fb-preview-title">{title || 'Untitled Form'}</h1>
                        <p className="fb-preview-desc">{description || 'No description provided.'}</p>
                    </div>

                    <hr className="fb-divider" />

                    {selectedFields.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                            Select fields from the left panel to preview your form.
                        </div>
                    )}

                    {selectedFields.map(field => (
                        <div key={field.questionKey} className="fb-preview-field">
                            <label className="fb-preview-label">
                                {field.label}
                                {field.required && <span className="fb-required-star">*</span>}
                            </label>

                            {/* Visual Placeholder based on type */}
                            {['singleLineText', 'url', 'email', 'phoneNumber', 'number'].includes(field.type) && (
                                <input type="text" className="fb-preview-input" disabled value="Short answer text" />
                            )}

                            {field.type === 'multilineText' && (
                                <textarea className="fb-preview-input" disabled style={{ minHeight: '80px' }}>Long answer text</textarea>
                            )}

                            {['singleSelect', 'multipleSelects'].includes(field.type) && (
                                <select className="fb-preview-input" disabled>
                                    <option>Select an option...</option>
                                </select>
                            )}
                            {/* Fallback for other types */}
                            {!['singleLineText', 'url', 'email', 'phoneNumber', 'number', 'multilineText', 'singleSelect', 'multipleSelects'].includes(field.type) && (
                                <input type="text" className="fb-preview-input" disabled value={`[${field.type}] input`} />
                            )}


                            {field.conditionalRules && field.conditionalRules.length > 0 && (
                                <div className="fb-condition-badge">
                                    Logic: Shows if rules match
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PreviewPanel;
