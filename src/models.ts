import mongoose from "mongoose";

const connectionsSchema = new mongoose.Schema({
  userId1: { type: Number, required: true },
  userId2: { type: Number, required: true },
});

export const ConnectionModel = mongoose.model("Connections", connectionsSchema);

const userInfoSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  bio: { type: String, required: true },
});

export const UserInfoModel = mongoose.model("User_Info", userInfoSchema);
