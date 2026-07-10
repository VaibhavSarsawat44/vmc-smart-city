import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, AlertTriangle, Settings, LogOut, RefreshCw } from 'lucide-react';
import { getStats, getComplaints, updateComplaintStatus } from '../api';
import './Dashboard.css';

const statusLabel = { pending: 'New', in_progress: 'In Progress', resolved: 'Resolved' };
const statusClass  = { pending: 'status-new', in_progress: 'status-progress', resolved: 'status-resolved' };

const Admin = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('vmc_user') || '{}');
    const [stats, setStats]         = useState(null);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading]     = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [s, c] = await Promise.all([getStats(), getComplaints()]);
            setStats(s);
            setComplaints(c.slice(0, 5));
        } catch (err) {
            console.error('Failed to load data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await updateComplaintStatus(id, newStatus);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleLogout = () => {
        localStorage.removeItem('vmc_user');
        navigate('/');
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar glass-panel">
                <div className="admin-brand">
                    <img src="/logo.png" alt="VMC Logo" className="admin-logo" />
                    <span>Admin Portal</span>
                </div>
                <nav className="admin-nav">
                    <a href="#" className="admin-nav-item active"><LayoutDashboard size={20} /> Overview</a>
                    <a href="#" className="admin-nav-item"><AlertTriangle size={20} /> Reported Issues</a>
                    <a href="#" className="admin-nav-item"><Users size={20} /> Citizens</a>
                    <a href="#" className="admin-nav-item"><Settings size={20} /> Settings</a>
                </nav>
                <div className="admin-logout">
                    <button onClick={handleLogout} className="logout-btn"><LogOut size={20} /> Sign Out</button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header glass-panel">
                    <h2>Dashboard Overview</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={fetchData} className="btn-action" title="Refresh"><RefreshCw size={16} /></button>
                        <div className="admin-profile">
                            <div className="profile-info">
                                <span className="profile-name">{user.displayName || 'System Admin'}</span>
                                <span className="profile-role">VMC Authority</span>
                            </div>
                            <div className="profile-avatar">{(user.displayName || 'A')[0].toUpperCase()}</div>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {loading ? (
                        <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading live data...</p>
                    ) : (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card glass-panel">
                                    <div className="stat-icon" style={{ backgroundColor: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}>
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div className="stat-details">
                                        <h3>{stats?.garbage ?? 0}</h3>
                                        <p>Garbage Issues</p>
                                    </div>
                                </div>
                                <div className="stat-card glass-panel">
                                    <div className="stat-icon" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#EF4444' }}>
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div className="stat-details">
                                        <h3>{stats?.pothole ?? 0}</h3>
                                        <p>Pothole Reports</p>
                                    </div>
                                </div>
                                <div className="stat-card glass-panel">
                                    <div className="stat-icon" style={{ backgroundColor: 'rgba(14,165,233,0.2)', color: '#0EA5E9' }}>
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div className="stat-details">
                                        <h3>{stats?.light ?? 0}</h3>
                                        <p>Street Light Outages</p>
                                    </div>
                                </div>
                                <div className="stat-card glass-panel" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
                                    <div className="stat-icon" style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: '#10B981' }}>
                                        <Users size={24} />
                                    </div>
                                    <div className="stat-details">
                                        <h3>{stats?.resolved ?? 0}</h3>
                                        <p>Total Resolved</p>
                                    </div>
                                </div>
                            </div>

                            <div className="recent-activity glass-panel">
                                <h3>Recent Reports {stats?.total !== undefined && (
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>({stats.total} total)</span>
                                )}</h3>
                                <div className="activity-list">
                                    {complaints.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No complaints submitted yet.</p>
                                    ) : complaints.map(c => (
                                        <div className="activity-item" key={c._id}>
                                            <div className={`activity-status ${statusClass[c.status]}`}>
                                                {statusLabel[c.status]}
                                            </div>
                                            <div className="activity-info">
                                                <h4>{c.category.charAt(0).toUpperCase() + c.category.slice(1)} — {c.description.slice(0, 60)}{c.description.length > 60 ? '…' : ''}</h4>
                                                <p>{c.location?.text || 'No location'} · {new Date(c.createdAt).toLocaleString()}</p>
                                            </div>
                                            <select
                                                value={c.status}
                                                onChange={e => handleStatusChange(c._id, e.target.value)}
                                                className="btn-action"
                                                style={{ cursor: 'pointer', fontSize: '0.8rem' }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Admin;
