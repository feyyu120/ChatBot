import mongoose from "mongoose";

const KnowledgeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Untitled Document",
      maxlength: [250, "Title cannot exceed 250 characters"],
      trim: true,
    },
    content: {
      type: String,
      required: false,
     
    },
    embedding: {
      type: [Number],           
      required: false,
    },
    fileUrl: {
      type: String,
      required: false,
    },
    fileType: {
      type: String,
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,              
    },
  },
  { 
    timestamps: true,
   
  }
);


export default mongoose.model("Knowledge", KnowledgeSchema);