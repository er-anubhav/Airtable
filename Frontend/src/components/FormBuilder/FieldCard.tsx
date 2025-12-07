import React from 'react';
import '../../styles/FormBuilder.css';

interface FieldCardProps {
    field: any;
    selectedField: any; // The configuration for this field in the form
    onToggle: (field: any) => void;
    onUpdate: (key: string, prop: string, value: any) => void;
    onAddCondition: (key: string) => void;
}

const FieldCard: React.FC<FieldCardProps> = ({ field, selectedField, onToggle, onUpdate, onAddCondition }) => {
    const isSelected = !!selectedField;

    return (
        <div className={`fb-field-card ${isSelected ? 'selected' : ''}`}>
            {/* Header / Toggle */}
            <div className="fb-field-header" onClick={() => onToggle(field)}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    style={{ cursor: 'pointer' }}
                />
                <span className="fb-field-name">{field.name}</span>
                <span className="fb-field-type">{field.type}</span>
            </div>

            {/* Expanded Config */}
            {isSelected && (
                <div className="fb-field-options">
                    {/* Label Input */}
                    <div className="fb-input-group">
                        <label className="fb-label">Label</label>
                        <input
                            className="fb-input"
                            value={selectedField.label || ''}
                            onChange={e => onUpdate(field.id, 'label', e.target.value)}
                            placeholder="Display Label"
                        />
                    </div>

                    {/* Toggles */}
                    <label className="fb-checkbox-label">
                        <input
                            type="checkbox"
                            checked={selectedField.required || false}
                            onChange={e => onUpdate(field.id, 'required', e.target.checked)}
                        />
                        Required Field
                    </label>

                    {/* Conditional Logic */}
                    <button
                        className="fb-btn-secondary"
                        onClick={() => onAddCondition(field.id)}
                    >
                        {selectedField.conditionalRules?.length > 0
                            ? `Edit Conditions (${selectedField.conditionalRules.length})`
                            : 'Add Condition Logic'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default FieldCard;
