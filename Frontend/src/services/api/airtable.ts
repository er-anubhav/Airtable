import api from './index';

export const getBases = async (token: string) => {
    const response = await api.get('/airtable/bases', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
};

export const getTables = async (token: string, baseId: string) => {
    const response = await api.get(`/airtable/bases/${baseId}/tables`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
};

export const getFields = async (token: string, baseId: string, tableId: string) => {
    const response = await api.get(`/airtable/bases/${baseId}/tables/${tableId}/fields`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
};
