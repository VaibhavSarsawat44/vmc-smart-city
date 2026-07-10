import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Map, AlertCircle, Settings, LogOut, RefreshCw } from 'lucide-react';
import { getComplaints, updateComplaintStatus } from '../api';
import './Dashboard.css';

const statusClass = { pending: 'status-new', in_progress: 'status-progress', resolved: 'status-resolved' };

const WardEngineer = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('vmc_user') || '{}');
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading]       = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const all = await getComplaints();
            setComplaints(all);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAssign = async (id, worker) => {
        if (!worker) return;
        try {
            await updateComplaintStatus(id, 'in_progress', worker);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleLogout = () => {
        localStorage.removeItem('vmc_user');
        navigate('/');
    };

    const unassigned = complaints.filter(c => c.status === 'pending').length;
    const inProgress = complaints.filter(c => c.status === 'in_progress').length;

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar glass-panel">
                <div className="admin-brand">
                    <img src="/logo.png" alt="VMC Logo" className="admin-logo" />
                    <span>Ward Portal</span>
                </div>
                <nav className="admin-nav">
                    <a href="#" className="admin-nav-item active"><Map size={20} /> Ward Overview</a>
                    <a href="#" className="admin-nav-item"><UserPlus size={20} /> Assign Tasks</a>
                    <a href="#" className="admin-nav-item"><AlertCircle size={20} /> Pending Issues</a>
                    <a href="#" className="admin-nav-item"><Settings size={20} /> Settings</a>
                </nav>
                <div className="admin-logout">
                    <button onClick={handleLogout} className="logout-btn"><LogOut size={20} /> Sign Out</button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header glass-panel">
                    <h2>Ward Engineer Dashboard</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={fetchData} className="btn-action" title="Refresh"><RefreshCw size={16} /></button>
                        <div className="admin-profile">
                            <div className="profile-info">
                                <span className="profile-name">{user.displayName || 'Ward Engineer'}</span>
                                <span className="profile-role">Ward Engineer</span>
                            </div>
                            <div className="profile-avatar">{(user.displayName || 'W')[0].toUpperCase()}</div>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    <div className="stats-grid">
                        <div className="stat-card glass-panel" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
                            <div className="stat-icon" style={{ backgroundColor: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}>
                                <AlertCircle size={24} />
                            </div>
                            <div className="stat-details">
                                <h3>{unassigned}</h3>
                                <p>Unassigned Issues</p>
                            </div>
                        </div>
                        <div className="stat-card glass-panel" style={{ borderColor: 'rgba(59,130,246,0.3)' }}>
                            <div className="stat-icon" style={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#3B82F6' }}>
                                <UserPlus size={24} />
                            </div>
                            <div className="stat-details">
                                <h3>{inProgress}</h3>
                                <p>Active In-Progress</p>
                            </div>
                        </div>
                    </div>

                    <div className="recent-activity glass-panel">
                        <h3>All Complaints — Assign to Worker</h3>
                        <div className="activity-list">
                            {loading ? (
                                <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>Loading...</p>
                            ) : complaints.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No complaints yet.</p>
                            ) : complaints.map(c => (
                                <div className="activity-item" key={c._id}>
                                    <div className={`activity-status ${statusClass[c.status]}`}>
                                        {c.status === 'pending' ? 'New' : c.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                                    </div>
                                    <div className="activity-info">
                                        <h4>{c.category.charAt(0).toUpperCase() + c.category.slice(1)} — {c.description.slice(0, 50)}{c.description.length > 50 ? '…' : ''}</h4>
                                        <p>{c.location?.text || 'No location'} · {c.assignedTo ? `Assigned: ${c.assignedTo}` : 'Unassigned'}</p>
                                    </div>
                                    {c.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                            <select
                                                className="glass-input"
                                                style={{ width: '140px', padding: '0.35rem 0.6rem', fontSize: '0.82rem' }}
                                                defaultValue=""
                                                onChange={e => handleAssign(c._id, e.target.value)}
                                            >
                                                <option value="">Assign to…</option>
                                                <option value="Field Worker Team A">Team A</option>
                                                <option value="Field Worker Team B">Team B</option>
                                                <option value="Field Worker Team C">Team C</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default WardEngineer;
