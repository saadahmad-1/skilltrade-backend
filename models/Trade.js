const mongoose = require("mongoose");

const TradeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.String, ref: "User", required: true },
    haveSkill: { type: mongoose.Schema.Types.String, ref: "Skill" },
    wantSkill: { type: mongoose.Schema.Types.String, ref: "Skill" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Trade", TradeSchema);