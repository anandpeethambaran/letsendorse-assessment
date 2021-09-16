'use-strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;
let modelName = "game";

const schema = Schema({
  gameId: { type: String },
  host: { type: String },
  challenger: { type: String },
  type: { type: String, enum: ["PLAYER", "COMPUTER"], default: "COMPUTER" },
  data: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model(modelName, schema);