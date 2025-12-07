import api from './index';

export const saveForm = async (token: string, formData: any) => {
    const response = await api.post('/forms', formData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getForm = async (formId: string) => {
    const response = await api.get(`/forms/${formId}`);
    return response.data.data;
};

export const submitFormResponse = async (formId: string, answers: any) => {
    const response = await api.post(`/submissions/${formId}`, { answers });
    return response.data;
};

export const getFormResponses = async (formId: string) => {
    const response = await api.get(`/forms/${formId}/responses`);
    return response.data.data;
};
