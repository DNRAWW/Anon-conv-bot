import mongoose from "mongoose";

const connectionsSchema = new mongoose.Schema({
  userId1: Number,
  userId2: Number,
});

export const ConnectionModel = mongoose.model("Connections", connectionsSchema);
