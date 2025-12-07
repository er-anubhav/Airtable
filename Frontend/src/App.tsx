import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import FormBuilder from './pages/FormBuilder';
import FormViewer from './pages/FormViewer';
import ResponsesList from './pages/ResponsesList';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forms/:id" element={<FormViewer />} />

          <Route path="/dashboard" element={<Layout />}>
            <Route index element={<FormBuilder />} />
            <Route path="builder" element={<FormBuilder />} />
            <Route path="viewer/:formId" element={<FormViewer />} />
            <Route path="responses/:formId" element={<ResponsesList />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
