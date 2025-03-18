const express = require("express");
const Trade = require("../models/Trade");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const trades = await Trade.find().populate("haveSkill wantSkill user", "name");
        res.json(trades);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/", async (req, res) => {
    try {
        const { userId, haveSkill, wantSkill } = req.body;

        if (!userId || !haveSkill || !wantSkill) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const newTrade = new Trade({
            user: userId,
            haveSkill,
            wantSkill
        });

        await newTrade.save();
        res.status(201).json(newTrade);
    } catch (error) {
        console.error("Error saving trade:", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/matches/:userId", async (req, res) => {
    try {

        const userId = String(req.params.userId);


        const userTrades = await Trade.find({ user: userId });

        if (!userTrades.length) return res.json([]);

        const haveSkills = userTrades.map(trade => trade.haveSkill);
        const wantSkills = userTrades.map(trade => trade.wantSkill);

        const matches = await Trade.find({
            haveSkill: wantSkills[0],
            wantSkill: haveSkills[0]
        })
        res.json(matches);
    } catch (error) {
        console.error("Error finding matches:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;