import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, MapPin, Eye, Settings, LogOut, RefreshCw } from 'lucide-react';
import { getStats, getComplaints } from '../api';
import './Dashboard.css';

const ZoneOfficer = () => {
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
            // Zone officer sees all complaints for monitoring
            setComplaints(c.slice(0, 8));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleLogout = () => {
        localStorage.removeItem('vmc_user');
        navigate('/');
    };

    // SLA breach = pending for more than 24 hours
    const slaBreaches = complaints.filter(c => {
        if (c.status === 'resolved') return false;
        const hrs = (Date.now() - new Date(c.createdAt)) / 36e5;
        return hrs > 24;
    }).length;

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar glass-panel">
                <div className="admin-brand">
                    <img src="/logo.png" alt="VMC Logo" className="admin-logo" />
                    <span>Zone Portal</span>
                </div>
                <nav className="admin-nav">
                    <a href="#" className="admin-nav-item active"><Eye size={20} /> Zone Monitor</a>
                    <a href="#" className="admin-nav-item"><BarChart3 size={20} /> Analytics</a>
                    <a href="#" className="admin-nav-item"><MapPin size={20} /> Ward Map</a>
                    <a href="#" className="admin-nav-item"><Settings size={20} /> Settings</a>
                </nav>
                <div className="admin-logout">
                    <button onClick={handleLogout} className="logout-btn"><LogOut size={20} /> Sign Out</button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header glass-panel">
                    <h2>Zone Monitoring Dashboard</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={fetchData} className="btn-action" title="Refresh"><RefreshCw size={16} /></button>
                        <div className="admin-profile">
                            <div className="profile-info">
                                <span className="profile-name">{user.displayName || 'Zone Officer'}</span>
                                <span className="profile-role">Zone Officer</span>
                            </div>
                            <div className="profile-avatar">{(user.displayName || 'Z')[0].toUpperCase()}</div>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {loading ? (
                        <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading zone data...</p>
                    ) : (
                        <>
                            <div className="stats-grid">
                                <div className="stat-card glass-panel" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
                                    <div className="stat-icon" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#EF4444' }}>
                                        <BarChart3 size={24} />
                                    </div>
                                    <div className="stat-details">
                                        <h3>{slaBreaches}</h3>
                                        <p>SLA Breaches (&gt;24h)</p>
                                    </div>
                                </div>
                                <div className="stat-card glass-panel" style={{ borderColor: 'rgba(245,158,11,0.3)' }}>
                                    <div className="stat-icon" style={{ backgroundColor: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}>
                                        <Eye size={24} />
                                    </div>
                                    <div className="stat-details">
                                        <h3>{stats?.pending ?? 0}</h3>
                                        <p>Pending Zone-wide</p>
                                    </div>
                                </div>
                                <div className="stat-card glass-panel" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
                                    <div className="stat-icon" style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: '#10B981' }}>
                                        <MapPin size={24} />
                                    </div>
                                    <div className="stat-details">
                                        <h3>{stats?.resolved ?? 0}</h3>
                                        <p>Resolved Total</p>
                                    </div>
                                </div>
                            </div>

                            <div className="recent-activity glass-panel">
                                <h3>Live Zone Complaints <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>({stats?.total ?? 0} total)</span></h3>
                                <div className="activity-list">
                                    {complaints.length === 0 ? (
                                        <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>No complaints in the zone.</p>
                                    ) : complaints.map(c => {
                                        const hoursOld = Math.floor((Date.now() - new Date(c.createdAt)) / 36e5);
                                        const isBreach = c.status !== 'resolved' && hoursOld > 24;
                                        return (
                                            <div className="activity-item" key={c._id}>
                                                <div
                                                    className={`activity-status ${isBreach ? '' : c.status === 'pending' ? 'status-new' : c.status === 'in_progress' ? 'status-progress' : 'status-resolved'}`}
                                                    style={isBreach ? { background: 'rgba(239,68,68,0.2)', color: '#ef4444' } : {}}
                                                >
                                                    {isBreach ? 'SLA Breach' : c.status === 'pending' ? 'Pending' : c.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                                                </div>
                                                <div className="activity-info">
                                                    <h4>{c.category.charAt(0).toUpperCase() + c.category.slice(1)} — {c.description.slice(0, 55)}{c.description.length > 55 ? '…' : ''}</h4>
                                                    <p>{c.location?.text || 'No location'} · {hoursOld}h ago{c.assignedTo ? ` · ${c.assignedTo}` : ''}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ZoneOfficer;
