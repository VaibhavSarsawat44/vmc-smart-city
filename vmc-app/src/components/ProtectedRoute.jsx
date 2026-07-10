import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute — redirects to login if no vmc_user in localStorage
 * Optionally restrict by role: allowedRoles={['admin', 'field_worker']}
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const user = JSON.parse(localStorage.getItem('vmc_user') || 'null');

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Wrong role — send back to their correct page
        const roleRoutes = {
            admin:         '/admin',
            field_worker:  '/field-worker',
            ward_engineer: '/ward-engineer',
            zone_officer:  '/zone-officer',
            citizen:       '/app',
        };
        return <Navigate to={roleRoutes[user.role] || '/'} replace />;
    }

    return children;
};

export default ProtectedRoute;
