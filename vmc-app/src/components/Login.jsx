import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight } from 'lucide-react';
import { loginUser } from '../api';
import './Login.css';

const ROLE_ROUTES = {
    admin:        '/admin',
    field_worker: '/field-worker',
    ward_engineer:'/ward-engineer',
    zone_officer: '/zone-officer',
    citizen:      '/app',
};

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e, overrideUser, overridePass) => {
        if (e) e.preventDefault();

        const user = overrideUser || username;
        const pass = overridePass || password;

        if (!user || !pass) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await loginUser(user, pass);
            // Persist session
            localStorage.setItem('vmc_user', JSON.stringify({
                username: data.username,
                role: data.role,
                displayName: data.displayName,
            }));
            navigate(ROLE_ROUTES[data.role] || '/app');
        } catch (err) {
            setError(err.message || 'Login failed. Check credentials.');
        } finally {
            setLoading(false);
        }
    };

    const loginAsRole = (roleName, roleUsername) => {
        setUsername(roleUsername);
        setPassword('admin123');
        setError('');
        setTimeout(() => handleLogin(null, roleUsername, 'admin123'), 100);
    };

    return (
        <div className="login-container">
            <div className="login-bg">
                <div className="login-overlay"></div>
                <img src="/hero-bg.png" alt="Eco City Background" className="login-bg-img" />
            </div>

            <div className="login-box glass-panel animate-fade-in">
                <div className="login-header">
                    <img src="/logo.png" alt="VMC Logo" className="login-logo pulse" />
                    <h2>Welcome to <span className="text-gradient">VMC</span></h2>
                    <p className="text-muted">Smart City Portal</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form id="loginForm" onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <User className="input-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Username (e.g., 'admin', 'fieldworker')"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError('');
                            }}
                            className="glass-input"
                        />
                    </div>

                    <div className="input-group">
                        <Lock className="input-icon" size={20} />
                        <input
                            type="password"
                            placeholder="Password (admin123 for staff)"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            className="glass-input"
                        />
                    </div>

                    <button type="submit" className="login-btn btn-primary" disabled={loading}>
                        {loading ? 'Signing in...' : <> Sign In <ArrowRight size={18} /></>}
                    </button>
                </form>

                <div className="demo-roles-container">
                    <p className="demo-roles-title">Demo Access Roles</p>
                    <div className="demo-roles-grid">
                        <button type="button" onClick={() => loginAsRole('Field Worker', 'fieldworker')} className="demo-role-btn" title="Can update complaint status">
                            Field Worker
                        </button>
                        <button type="button" onClick={() => loginAsRole('Ward Engineer', 'wardengineer')} className="demo-role-btn" title="Can assign tasks">
                            Ward Engineer
                        </button>
                        <button type="button" onClick={() => loginAsRole('Zone Officer', 'zoneofficer')} className="demo-role-btn" title="Can monitor complaints in their zone">
                            Zone Officer
                        </button>
                        <button type="button" onClick={() => loginAsRole('Admin', 'admin')} className="demo-role-btn" title="Full system access">
                            Admin
                        </button>
                    </div>
                </div>

                <div className="login-footer">
                    <p className="text-muted text-small">
                        Vadodara Municipal Corporation &copy; {new Date().getFullYear()}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
