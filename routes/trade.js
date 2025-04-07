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

        // Get the user's trade
        const userTrade = await Trade.findOne({ user: userId });

        if (!userTrade) return res.json([]);

        const { haveSkill, wantSkill } = userTrade;

        // First, try to find matches where acceptedBy equals userId
        let matches = await Trade.find({
            haveSkill: wantSkill,
            wantSkill: haveSkill,
            user: { $ne: userId },
            acceptedBy: userId,
        });

        // If no matches found, then find matches where acceptedBy doesn't exist
        if (matches.length === 0) {
            matches = await Trade.find({
                haveSkill: wantSkill,
                wantSkill: haveSkill,
                user: { $ne: userId },
                acceptedBy: { $exists: false }
            });
        }

        res.json(matches);
    } catch (error) {
        console.error("Error finding matches:", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/user/:userId", async (req, res) => {
    try {
        const userId = String(req.params.userId);
        const trade = await Trade.find({ user: userId }).populate("haveSkill wantSkill");
        res.json(trade);
    } catch (error) {
        console.error("Error fetching trade for user:", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/accept", async (req, res) => {
    try {
        const { userId, tradeId } = req.body;

        const trade = await Trade.findById(tradeId);
        if (!trade) return res.status(404).json({ error: "Trade not found" });

        if (trade.acceptedBy) return res.status(400).json({ error: "Trade already accepted" });

        trade.acceptedBy = userId;
        await trade.save();

        res.json(trade);
    } catch (error) {
        console.error("Error accepting trade:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;