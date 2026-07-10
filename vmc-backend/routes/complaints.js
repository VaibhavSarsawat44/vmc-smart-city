const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Complaint = require('../models/Complaint');

// ── Multer setup for photo uploads ──────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) cb(null, true);
        else cb(new Error('Only image files are allowed.'));
    },
});

// ── POST /api/complaints — Submit new complaint ──────────────────────────────
router.post('/', upload.single('photo'), async (req, res) => {
    try {
        const { category, description, locationText, lat, lng } = req.body;

        if (!category || !description) {
            return res.status(400).json({ message: 'Category and description are required.' });
        }

        const complaint = new Complaint({
            category,
            description,
            location: {
                text: locationText || '',
                lat:  lat  ? parseFloat(lat)  : null,
                lng:  lng  ? parseFloat(lng)  : null,
            },
            photoPath: req.file ? `/uploads/${req.file.filename}` : null,
        });

        await complaint.save();
        res.status(201).json({ message: 'Complaint submitted successfully.', complaint });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
});

// ── GET /api/complaints — Get all complaints ─────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// ── GET /api/complaints/stats — Count by category & status ──────────────────
router.get('/stats', async (req, res) => {
    try {
        const total         = await Complaint.countDocuments();
        const pending       = await Complaint.countDocuments({ status: 'pending' });
        const in_progress   = await Complaint.countDocuments({ status: 'in_progress' });
        const resolved      = await Complaint.countDocuments({ status: 'resolved' });
        const garbage       = await Complaint.countDocuments({ category: 'garbage' });
        const pothole       = await Complaint.countDocuments({ category: 'pothole' });
        const light         = await Complaint.countDocuments({ category: 'light' });
        const other         = await Complaint.countDocuments({ category: 'other' });

        res.json({ total, pending, in_progress, resolved, garbage, pothole, light, other });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// ── PATCH /api/complaints/:id/status — Update complaint status ───────────────
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, assignedTo } = req.body;
        const allowed = ['pending', 'in_progress', 'resolved'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value.' });
        }

        const complaint = await Complaint.findByIdAndUpdate(
            req.params.id,
            { status, ...(assignedTo && { assignedTo }) },
            { new: true }
        );

        if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });
        res.json({ message: 'Status updated.', complaint });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
