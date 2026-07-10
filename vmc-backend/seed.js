require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

const users = [
    { username: 'admin',        password: 'admin123', role: 'admin',        displayName: 'System Admin' },
    { username: 'fieldworker',  password: 'admin123', role: 'field_worker', displayName: 'Field Worker' },
    { username: 'wardengineer', password: 'admin123', role: 'ward_engineer',displayName: 'Ward Engineer' },
    { username: 'zoneofficer',  password: 'admin123', role: 'zone_officer', displayName: 'Zone Officer' },
];

const seed = async () => {
    await connectDB();

    for (const u of users) {
        const exists = await User.findOne({ username: u.username });
        if (exists) {
            console.log(`⚠️  User "${u.username}" already exists, skipping.`);
            continue;
        }
        const passwordHash = await bcrypt.hash(u.password, 10);
        await User.create({ username: u.username, passwordHash, role: u.role, displayName: u.displayName });
        console.log(`✅ Created user: ${u.username} (${u.role})`);
    }

    console.log('\n🎉 Seeding complete! Default credentials: password = admin123');
    process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
