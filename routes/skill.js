const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Skill = require("../models/Skill");

const router = express.Router();

router.use(cors());
router.use(express.json());

router.get("/", async (req, res) => {
    try {
        const skills = await Skill.find();
        res.json(skills);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Skill name is required" });

        const existingSkill = await Skill.findOne({ name });
        if (existingSkill) return res.status(400).json({ error: "Skill already exists" });

        const newSkill = new Skill({ name });
        await newSkill.save();
        res.status(201).json(newSkill);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const skill = await Skill.findByIdAndDelete(req.params.id);
        if (!skill) return res.status(404).json({ error: "Skill not found" });
        res.json({ message: "Skill deleted" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
