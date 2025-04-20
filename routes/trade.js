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

        // Check if user already has an active trade
        const existingTrade = await Trade.findOne({
            user: userId,
            isCompleted: { $ne: true }
        });

        if (existingTrade) {
            return res.status(400).json({ error: "User already has an active trade" });
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
        const userTrade = await Trade.findOne({
            user: userId,
            isCompleted: { $ne: true }
        });

        if (!userTrade) return res.json([]);

        const { haveSkill, wantSkill } = userTrade;

        // Find potential matches - other users who:
        // 1. Have the skill I want
        // 2. Want the skill I have
        // 3. Their trade is not completed
        const matches = await Trade.find({
            haveSkill: wantSkill,
            wantSkill: haveSkill,
            user: { $ne: userId },
            isCompleted: { $ne: true }
        });

        res.json(matches);
    } catch (error) {
        console.error("Error finding matches:", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/user/:userId", async (req, res) => {
    try {
        const userId = String(req.params.userId);
        const trade = await Trade.find({
            user: userId,
            isCompleted: { $ne: true }
        }).populate("haveSkill wantSkill");
        res.json(trade);
    } catch (error) {
        console.error("Error fetching trade for user:", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/completed/:userId", async (req, res) => {
    try {
        const userId = String(req.params.userId);

        // Find trades where:
        // 1. The user is either the creator or the acceptor
        // 2. The trade is completed
        const completedTrades = await Trade.find({
            $or: [
                { user: userId },
                { acceptedBy: userId }
            ],
            isCompleted: true
        }).populate("haveSkill wantSkill");

        res.json(completedTrades);
    } catch (error) {
        console.error("Error fetching completed trades:", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/accept", async (req, res) => {
    try {
        const { userId, tradeId } = req.body;

        if (!userId || !tradeId) {
            return res.status(400).json({ error: "Missing userId or tradeId" });
        }

        const trade = await Trade.findById(tradeId);
        if (!trade) return res.status(404).json({ error: "Trade not found" });

        if (trade.isCompleted) {
            return res.status(400).json({ error: "Cannot accept a completed trade" });
        }

        if (trade.acceptedBy) {
            return res.status(400).json({ error: "Trade already accepted" });
        }

        trade.acceptedBy = userId;
        await trade.save();

        res.json(trade);
    } catch (error) {
        console.error("Error accepting trade:", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/complete", async (req, res) => {
    try {
        const { tradeId } = req.body;

        if (!tradeId) {
            return res.status(400).json({ error: "Missing tradeId" });
        }

        const trade = await Trade.findById(tradeId);
        if (!trade) return res.status(404).json({ error: "Trade not found" });

        if (trade.isCompleted) {
            return res.status(400).json({ error: "Trade already completed" });
        }

        if (!trade.acceptedBy) {
            return res.status(400).json({ error: "Trade must be accepted before it can be completed" });
        }

        trade.isCompleted = true;
        await trade.save();

        res.json(trade);
    } catch (error) {
        console.error("Error completing trade:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;