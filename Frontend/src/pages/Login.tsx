import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
    const [searchParams] = useSearchParams();
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            login(token);
            navigate('/dashboard');
        }
    }, [searchParams, login, navigate]);

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleLogin = () => {
        window.location.href = 'http://localhost:3000/api/auth/airtable';
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h2>Login to Form Builder</h2>
                <p>Connect with your Airtable account to get started.</p>
                <button
                    onClick={handleLogin}
                    style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#2D7FF9', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                    Login with Airtable
                </button>
            </div>
        </div>
    );
};

export default Login;
