import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  userId: String,
  role: { type: String, enum: ["user", "bot"] },
  content: String,
  time: String
}, { timestamps: true });


 const Message = mongoose.model("Message", MessageSchema);

 export default Message
