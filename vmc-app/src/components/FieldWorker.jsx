import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, ListTodo, MapPin, Settings, LogOut, RefreshCw } from 'lucide-react';
import { getComplaints, updateComplaintStatus } from '../api';
import './Dashboard.css';

const statusLabel = { pending: 'Pending', in_progress: 'In Progress', resolved: 'Resolved' };
const statusClass = { pending: 'status-new', in_progress: 'status-progress', resolved: 'status-resolved' };

const FieldWorker = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('vmc_user') || '{}');
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading]       = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const all = await getComplaints();
            // Field worker sees pending + in_progress complaints
            setComplaints(all.filter(c => c.status !== 'resolved'));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleStatus = async (id, status) => {
        try {
            await updateComplaintStatus(id, status, user.displayName || 'Field Worker');
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleLogout = () => {
        localStorage.removeItem('vmc_user');
        navigate('/');
    };

    const pending     = complaints.filter(c => c.status === 'pending').length;
    const inProgress  = complaints.filter(c => c.status === 'in_progress').length;

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar glass-panel">
                <div className="admin-brand">
                    <img src="/logo.png" alt="VMC Logo" className="admin-logo" />
                    <span>Field Portal</span>
                </div>
                <nav className="admin-nav">
                    <a href="#" className="admin-nav-item active"><ListTodo size={20} /> My Tasks</a>
                    <a href="#" className="admin-nav-item"><CheckSquare size={20} /> Completed</a>
                    <a href="#" className="admin-nav-item"><MapPin size={20} /> Map View</a>
                    <a href="#" className="admin-nav-item"><Settings size={20} /> Settings</a>
                </nav>
                <div className="admin-logout">
                    <button onClick={handleLogout} className="logout-btn"><LogOut size={20} /> Sign Out</button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header glass-panel">
                    <h2>Task Dashboard</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={fetchData} className="btn-action" title="Refresh"><RefreshCw size={16} /></button>
                        <div className="admin-profile">
                            <div className="profile-info">
                                <span className="profile-name">{user.displayName || 'Field Worker'}</span>
                                <span className="profile-role">Field Worker</span>
                            </div>
                            <div className="profile-avatar">{(user.displayName || 'F')[0].toUpperCase()}</div>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    <div className="stats-grid">
                        <div className="stat-card glass-panel" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
                            <div className="stat-icon" style={{ backgroundColor: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}>
                                <ListTodo size={24} />
                            </div>
                            <div className="stat-details">
                                <h3>{pending}</h3>
                                <p>Pending Tasks</p>
                            </div>
                        </div>
                        <div className="stat-card glass-panel" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
                            <div className="stat-icon" style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: '#10B981' }}>
                                <CheckSquare size={24} />
                            </div>
                            <div className="stat-details">
                                <h3>{inProgress}</h3>
                                <p>In Progress</p>
                            </div>
                        </div>
                    </div>

                    <div className="recent-activity glass-panel">
                        <h3>Assigned Complaints <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>({complaints.length} active)</span></h3>
                        <div className="activity-list">
                            {loading ? (
                                <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>Loading tasks...</p>
                            ) : complaints.length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No active tasks. All clear! ✅</p>
                            ) : complaints.map(c => (
                                <div className="activity-item" key={c._id}>
                                    <div className={`activity-status ${statusClass[c.status]}`}>{statusLabel[c.status]}</div>
                                    <div className="activity-info">
                                        <h4>{c.category.charAt(0).toUpperCase() + c.category.slice(1)} — {c.description.slice(0, 55)}{c.description.length > 55 ? '…' : ''}</h4>
                                        <p>{c.location?.text || 'No location'} · {new Date(c.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                        {c.status === 'pending' && (
                                            <button className="btn-action" onClick={() => handleStatus(c._id, 'in_progress')}>
                                                Start Work
                                            </button>
                                        )}
                                        {c.status === 'in_progress' && (
                                            <button className="btn-action" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981' }} onClick={() => handleStatus(c._id, 'resolved')}>
                                                Mark Resolved
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FieldWorker;
