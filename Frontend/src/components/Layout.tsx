import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <header style={{ background: '#333', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '1.5em' }}>Airtable Forms</h1>
                <button
                    onClick={handleLogout}
                    style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Logout
                </button>
            </header>
            <main style={{ flex: 1 }}>
                <Outlet />
            </main>
            <footer style={{ padding: '20px', textAlign: 'center', background: '#f0f0f0', color: '#666' }}>
                Airtable Forms &copy; {new Date().getFullYear()}
            </footer>
        </div>
    );
};

export default Layout;
