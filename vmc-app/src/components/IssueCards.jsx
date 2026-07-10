import React from 'react';
import { useNavigate } from 'react-router-dom';
import './IssueCards.css';
import { Trash2, AlertOctagon, LightbulbOff } from 'lucide-react';

const issues = [
    {
        id: 1,
        title: 'Garbage Collection',
        description: 'Report uncollected garbage, overflowing bins, or illegal dumping in your area.',
        icon: <Trash2 size={24} />,
        image: '/garbage.png',
        color: '#F59E0B'
    },
    {
        id: 2,
        title: 'Pothole Detection',
        description: 'Help us identify and fix dangerous potholes to ensure safe and smooth roads.',
        icon: <AlertOctagon size={24} />,
        image: '/pothole.png',
        color: '#EF4444'
    },
    {
        id: 3,
        title: 'Street Light Issue',
        description: 'Report broken or non-functioning street lights to improve neighborhood safety.',
        icon: <LightbulbOff size={24} />,
        image: '/light.png',
        color: '#0EA5E9'
    }
];

const IssueCards = () => {
    const navigate = useNavigate();

    return (
        <section id="report-issue" className="issues-section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Report an <span className="text-gradient">Issue</span></h2>
                    <p className="section-subtitle">
                        Your vigilance makes Vadodara better. Select a category below to report an issue directly to the concerned department.
                    </p>
                </div>

                <div className="cards-grid">
                    {issues.map((issue) => (
                        <div key={issue.id} className="issue-card glass-panel">
                            <div className="card-image-wrapper">
                                <img src={issue.image} alt={issue.title} className="card-image" />
                                <div className="card-overlay" style={{ backgroundColor: `${issue.color}40` }}>
                                    <div className="icon-badge" style={{ backgroundColor: issue.color }}>
                                        {issue.icon}
                                    </div>
                                </div>
                            </div>

                            <div className="card-content">
                                <h3 className="card-title">{issue.title}</h3>
                                <p className="card-description">{issue.description}</p>

                                <button
                                    className="btn-report"
                                    style={{ borderColor: issue.color, color: issue.color }}
                                    onClick={() => navigate('/app/report')}
                                >
                                    Report Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default IssueCards;
