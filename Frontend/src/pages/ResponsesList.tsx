import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFormResponses } from '../services/api/forms';

interface Submission {
    _id: string;
    createdAt: string;
    answers: Record<string, any>;
    airtableRecordId: string;
}

const ResponsesList: React.FC = () => {
    const { formId } = useParams<{ formId: string }>(); // Assuming route is responses/:formId
    const [responses, setResponses] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (formId) {
            getFormResponses(formId)
                .then(data => {
                    setResponses(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to load responses', err);
                    setError('Failed to load responses');
                    setLoading(false);
                });
        }
    }, [formId]);

    if (loading) return <div style={{ padding: '20px' }}>Loading responses...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '20px' }}>Form Responses</h1>
            <p style={{ color: '#666', marginBottom: '20px' }}>Showing {responses.length} submissions</p>

            {responses.length === 0 ? (
                <div>No responses yet.</div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                        <thead>
                            <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Submission ID</th>
                                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Date</th>
                                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Data Preview</th>
                                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Airtable ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {responses.map(response => (
                                <tr key={response._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>{response._id.substring(0, 8)}...</td>
                                    <td style={{ padding: '12px' }}>{new Date(response.createdAt).toLocaleString()}</td>
                                    <td style={{ padding: '12px' }}>
                                        <pre style={{
                                            margin: 0,
                                            fontSize: '0.85em',
                                            maxWidth: '400px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {JSON.stringify(response.answers)}
                                        </pre>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            background: '#eee',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            fontSize: '0.9em'
                                        }}>
                                            {response.airtableRecordId}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ResponsesList;
