import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBases, getTables, getFields } from '../services/api/airtable';
import { saveForm } from '../services/api/forms';
import ConditionalModal from '../components/ConditionalModal';
import { useNavigate } from 'react-router-dom';

// New Components
import FormConfigPanel from '../components/FormBuilder/FormConfigPanel';
import PreviewPanel from '../components/FormBuilder/PreviewPanel';
import '../styles/FormBuilder.css';

const FormBuilder: React.FC = () => {
    const { token } = useAuth();
    const navigate = useNavigate();

    // Data Selection State
    const [bases, setBases] = useState<any[]>([]);
    const [tables, setTables] = useState<any[]>([]);
    const [fields, setFields] = useState<any[]>([]);

    const [selectedBase, setSelectedBase] = useState('');
    const [selectedTable, setSelectedTable] = useState('');

    // Form Definition State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFields, setSelectedFields] = useState<any[]>([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFieldKey, setCurrentFieldKey] = useState<string | null>(null);

    // Fetch Bases on Mount
    useEffect(() => {
        if (token) {
            getBases(token).then(setBases).catch(console.error);
        }
    }, [token]);

    // Fetch Tables when Base selected
    useEffect(() => {
        if (selectedBase && token) {
            getTables(token, selectedBase).then(setTables).catch(console.error);
            setFields([]);
            setSelectedFields([]);
        }
    }, [selectedBase, token]);

    // Fetch Fields when Table selected
    useEffect(() => {
        if (selectedTable && selectedBase && token) {
            getFields(token, selectedBase, selectedTable).then(setFields).catch(console.error);
            setSelectedFields([]);
        }
    }, [selectedTable, selectedBase, token]);

    const handleFieldToggle = (field: any) => {
        const existingIndex = selectedFields.findIndex(f => f.airtableFieldId === field.id);
        if (existingIndex >= 0) {
            // Remove
            const updated = [...selectedFields];
            updated.splice(existingIndex, 1);
            setSelectedFields(updated);
        } else {
            // Add
            setSelectedFields([...selectedFields, {
                questionKey: field.id,
                airtableFieldId: field.id,
                label: field.name,
                type: field.type,
                required: false,
                conditionalRules: [],
                conditionLogic: 'and'
            }]);
        }
    };

    const updateFieldProperty = (key: string, prop: string, value: any) => {
        setSelectedFields(fields =>
            fields.map(f => f.airtableFieldId === key ? { ...f, [prop]: value } : f)
        );
    };

    const openConditionModal = (key: string) => {
        setCurrentFieldKey(key);
        setIsModalOpen(true);
    };

    const saveConditions = (rules: any[], logic: string) => {
        if (currentFieldKey) {
            setSelectedFields(fields =>
                fields.map(f => f.airtableFieldId === currentFieldKey ? {
                    ...f,
                    conditionalRules: rules,
                    conditionLogic: logic
                } : f)
            );
        }
    };

    const handleSave = async () => {
        if (!title || !selectedBase || !selectedTable || selectedFields.length === 0) {
            alert('Please fill out all required fields and select at least one question.');
            return;
        }

        try {
            const formData = {
                title,
                description,
                airtableBaseId: selectedBase,
                airtableTableId: selectedTable,
                questions: selectedFields
            };

            if (token) {
                await saveForm(token, formData);
                alert('Form Saved Successfully!');
                navigate('/dashboard');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to save form');
        }
    };

    // Get current field logic for Modal
    const currentField = selectedFields.find(f => f.airtableFieldId === currentFieldKey);

    return (
        <div className="fb-container">
            <FormConfigPanel
                title={title} setTitle={setTitle}
                description={description} setDescription={setDescription}
                bases={bases}
                tables={tables}
                fields={fields}
                selectedBase={selectedBase} setSelectedBase={setSelectedBase}
                selectedTable={selectedTable} setSelectedTable={setSelectedTable}
                selectedFields={selectedFields}
                onFieldToggle={handleFieldToggle}
                onFieldUpdate={updateFieldProperty}
                onAddCondition={openConditionModal}
            />

            <PreviewPanel
                title={title}
                description={description}
                selectedFields={selectedFields}
                onSave={handleSave}
            />

            <ConditionalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={saveConditions}
                availableQuestions={selectedFields.filter(f => f.airtableFieldId !== currentFieldKey)}
                initialRules={currentField?.conditionalRules}
                initialLogic={currentField?.conditionLogic}
            />
        </div>
    );
};

export default FormBuilder;
