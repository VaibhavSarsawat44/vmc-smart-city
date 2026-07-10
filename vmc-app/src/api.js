// Central API base URL — change this if backend runs on a different port
export const API_BASE = 'http://localhost:5000';

/**
 * Login a user
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{role, username, displayName}>}
 */
export const loginUser = async (username, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
};

/**
 * Submit a complaint (with optional photo as base64 or file)
 * @param {FormData} formData
 * @returns {Promise<object>}
 */
export const submitComplaint = async (formData) => {
    const res = await fetch(`${API_BASE}/api/complaints`, {
        method: 'POST',
        body: formData, // multipart/form-data (no Content-Type header needed)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Submission failed');
    return data;
};

/**
 * Fetch all complaints
 * @returns {Promise<Array>}
 */
export const getComplaints = async () => {
    const res = await fetch(`${API_BASE}/api/complaints`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch complaints');
    return data;
};

/**
 * Fetch complaint counts/stats
 * @returns {Promise<object>}
 */
export const getStats = async () => {
    const res = await fetch(`${API_BASE}/api/complaints/stats`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch stats');
    return data;
};

/**
 * Update complaint status
 * @param {string} id
 * @param {string} status  'pending' | 'in_progress' | 'resolved'
 * @param {string} [assignedTo]
 */
export const updateComplaintStatus = async (id, status, assignedTo) => {
    const res = await fetch(`${API_BASE}/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assignedTo }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update status');
    return data;
};
