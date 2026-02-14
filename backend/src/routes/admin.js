import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const pdfParse = require('pdf-parse');
import "dotenv/config";
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Knowledge from "../model/knowledge.js";
import protect from "../middleware/auth.js";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const admin = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "text/plain"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and TXT files are allowed"));
    }
  },
});


function generatePublicId(userId, title) {
  const safeTitle = (title || "doc").replace(/[^a-z0-9]/gi, "_").slice(0, 60);
  return `knowledge/${userId}/${Date.now()}_${safeTitle}`;
}

admin.post("/upload", protect, upload.single("file"), async (req, res) => {
  if (req.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }

  try {
    const title = (req.body.title?.trim() || "Untitled Document").slice(0, 250);
    let content = "";
    let fileUrl = null;
    let fileType = null;


    if (req.file) {
      fileType = req.file.mimetype;

      const publicId = generatePublicId(req.userId, title);

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "raw",
            public_id: publicId,
            folder: "knowledge",
            overwrite: false,         
          },
          (error, result) => (error ? reject(error) : resolve(result))
        );

        Readable.from(req.file.buffer).pipe(stream);
      });

      fileUrl = uploadResult.secure_url;

  
      if (req.file.mimetype === "application/pdf") {
       const pdfData = await pdfParse(req.file.buffer);
content = pdfData.text.trim();
      } else {
        content = req.file.buffer.toString("utf-8").trim();
      }
    }

   
    const extraText = req.body.text?.trim();
    if (extraText) {
      content = content ? content + "\n\n" + extraText : extraText;
    }

    if (!content && !fileUrl) {
      return res.status(400).json({ message: "Provide either a file or text content" });
    }

    
    if (content.length > 1_000_000) { 
      content = content.slice(0, 1_000_000) + "\n\n[Content truncated due to size limit]";
    }

    const knowledge = await Knowledge.create({
      title,
      content,
      fileUrl,
      fileType,
      createdBy: req.userId,
    });

    res.json({ success: true, knowledge });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ 
      message: "Upload failed", 
      error: err.message.includes("pdf-parse") ? "PDF parsing issue" : err.message 
    });
  }
});

admin.get("/my-posts", protect, async (req, res) => {
  if (req.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }

  try {
    const light = req.query.light === "true"; 

    const query = Knowledge.find({ createdBy: req.userId })
      .sort({ createdAt: -1 })
      .select("title fileUrl fileType createdAt" + (light ? "" : " content"))
      .lean();

    const posts = await query;

    res.json(posts);
  } catch (err) {
    console.error("Fetch posts error:", err);
    res.status(500).json({ message: "Failed to load posts" });
  }
});

admin.delete("/delete/:id", protect, async (req, res) => {
  if (req.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }

  try {
    const post = await Knowledge.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId,
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found or not yours" });
    }

    if (post.fileUrl) {
      const publicId = post.fileUrl.split("/").slice(-2).join("/").split(".")[0];
      await cloudinary.uploader.destroy(publicId, { resource_type: "raw" })
        .catch(e => console.warn("Cloudinary delete failed:", e.message));
    }

    res.json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
});

export default admin;