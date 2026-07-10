const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        let user = await User.findOne({ username: username.toLowerCase().trim() });
        const staffRoles = ['admin', 'fieldworker', 'wardengineer', 'zoneofficer'];
        const userLower = username.toLowerCase().trim();

        if (staffRoles.includes(userLower)) {
            // Strict password check for staff
            if (!user) {
                return res.status(401).json({ message: 'Invalid staff credentials.' });
            }
            const isMatch = await user.matchPassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid staff credentials.' });
            }
        } else {
            // Citizen check: bypass passwords completely.
            // Create user if they don't exist, otherwise log them in directly.
            if (!user) {
                const bcrypt = require('bcryptjs');
                const passwordHash = await bcrypt.hash(password || 'citizen123', 10);
                user = await User.create({
                    username: userLower,
                    passwordHash,
                    role: 'citizen',
                    displayName: username.trim(),
                });
            }
        }

        res.json({
            message: 'Login successful',
            role: user.role,
            username: user.username,
            displayName: user.displayName,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
