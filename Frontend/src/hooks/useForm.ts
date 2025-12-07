import { useState } from 'react';

export const useForm = () => {
    const [formData, setFormData] = useState({});

    // Form logic

    return { formData, setFormData };
};
