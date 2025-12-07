import React from 'react';
import FieldCard from './FieldCard';
import '../../styles/FormBuilder.css';

interface FormConfigPanelProps {
    title: string;
    setTitle: (val: string) => void;
    description: string;
    setDescription: (val: string) => void;
    bases: any[];
    tables: any[];
    fields: any[];
    selectedBase: string;
    setSelectedBase: (val: string) => void;
    selectedTable: string;
    setSelectedTable: (val: string) => void;
    selectedFields: any[];
    onFieldToggle: (field: any) => void;
    onFieldUpdate: (key: string, prop: string, value: any) => void;
    onAddCondition: (key: string) => void;
}

const FormConfigPanel: React.FC<FormConfigPanelProps> = ({
    title, setTitle,
    description, setDescription,
    bases, tables, fields,
    selectedBase, setSelectedBase,
    selectedTable, setSelectedTable,
    selectedFields,
    onFieldToggle, onFieldUpdate, onAddCondition
}) => {
    return (
        <div className="fb-left-panel">
            <div className="fb-panel-header">
                <h2>Form Configuration</h2>
            </div>

            <div className="fb-panel-content">
                {/* 1. Form Details */}
                <div className="fb-section">
                    <div className="fb-section-header">Form Details</div>
                    <div className="fb-input-group">
                        <label className="fb-label">Form Title</label>
                        <input
                            className="fb-input"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Enter Form Title"
                        />
                    </div>
                    <div className="fb-input-group">
                        <label className="fb-label">Description</label>
                        <textarea
                            className="fb-textarea"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Enter Description"
                        />
                    </div>
                </div>

                <hr className="fb-divider" />

                {/* 2. Data Source */}
                <div className="fb-section">
                    <div className="fb-section-header">Data Source</div>
                    <div className="fb-input-group">
                        <label className="fb-label">Select Base</label>
                        <select
                            className="fb-select"
                            value={selectedBase}
                            onChange={e => setSelectedBase(e.target.value)}
                        >
                            <option value="">Select Base...</option>
                            {bases.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    <div className="fb-input-group">
                        <label className="fb-label">Select Table</label>
                        <select
                            className="fb-select"
                            value={selectedTable}
                            onChange={e => setSelectedTable(e.target.value)}
                            disabled={!selectedBase}
                        >
                            <option value="">Select Table...</option>
                            {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* 3. Fields */}
                {selectedTable && fields.length > 0 && (
                    <>
                        <hr className="fb-divider" />
                        <div className="fb-section">
                            <div className="fb-section-header">Form Fields</div>
                            <div className="fb-field-list">
                                {fields.map(field => (
                                    <FieldCard
                                        key={field.id}
                                        field={field}
                                        selectedField={selectedFields.find(f => f.airtableFieldId === field.id)}
                                        onToggle={onFieldToggle}
                                        onUpdate={onFieldUpdate}
                                        onAddCondition={onAddCondition}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default FormConfigPanel;
