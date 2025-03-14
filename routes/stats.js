const express = require("express");
const User = require("../models/User");
const Skill = require("../models/Skill");

const router = express.Router();

router.get("/:id", async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        const skillCount = await Skill.countDocuments();
        const user = await User.findOne({ uid: req.params.id });
        res.json({
            users: userCount,
            skills: skillCount,
            user,
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
