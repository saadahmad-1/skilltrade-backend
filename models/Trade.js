const mongoose = require("mongoose");

const TradeSchema = new mongoose.Schema({
    user: { type: String, ref: "User", required: true },
    haveSkill: { type: String, ref: "Skill" },
    wantSkill: { type: String, ref: "Skill" },
    acceptedBy: { type: String, ref: "User" },
    isCompleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Trade", TradeSchema);