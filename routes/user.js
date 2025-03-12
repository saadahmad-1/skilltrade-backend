// backend/routes/user.js
const express = require('express');
const admin = require('../firebaseAdmin');
const User = require('../models/User');
const router = express.Router();

// Middleware to authenticate requests
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decodedUser = await admin.auth().verifyIdToken(token);
        req.user = decodedUser;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

router.post('/register', authenticate, async (req, res) => {
    const { fullName, email } = req.body;
    const { uid, firebase: { sign_in_provider } } = req.user;

    try {
        let user = await User.findOne({ uid });

        if (!user) {
            user = new User({
                uid,
                fullName,
                email,
                provider: sign_in_provider,
            });
            await user.save();
            res.status(201).json({ message: 'User created', user });
        } else {
            res.status(200).json({ message: 'User already exists', user });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
