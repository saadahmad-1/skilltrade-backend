const express = require('express');
const admin = require('../firebaseAdmin');
const User = require('../models/User');
const router = express.Router();

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

router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post("/activate/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/deactivate/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// router.login('/login', async (req, res) => {
//     const { uid } = req.user;

//     try {
//         const user = await User.findOne({
//             uid,
//         });
//         if (!user.isActive) {
//             return res.status(401).json({ error: 'User is not active' });
//         }
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }
//         res
//             .status(200)
//             .json({ message: 'User logged in', user });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

router.post('/register', authenticate, async (req, res) => {
    const { fullName, email } = req.body;
    const { uid, firebase: { sign_in_provider } } = req.user;

    try {
        let user = await User.findOne({ uid });
        if (user && !user.isActive) {
            return res.status(401).json({ error: 'User is not active' });
        }
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

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.params.id });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
