import "dotenv/config";
import express from "express";
import multer from "multer";
import Message from "../model/message.js";
import Knowledge from "../model/knowledge.js";
import protect from "../middleware/auth.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { pipeline } from "@xenova/transformers";

const chat = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const MODEL_NAME = "gemini-2.5-flash"; 
let embedder = null;

async function getEmbedder() {
  if (!embedder) {
    console.log("Loading embedding model...");
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("Embedding model loaded.");
  }
  return embedder;
}

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] ** 2;
    magB += b[i] ** 2;
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
}

chat.post("/send", protect, upload.single("image"), async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "Gemini API key missing" });
    }

    const userId = req.userId;
    const question = typeof req.body?.message === "string" ? req.body.message.trim() : "";

    if (!question && !req.file) {
      return res.status(400).json({ message: "Message or image required" });
    }

    const userMessage = await Message.create({
      userId,
      role: "user",
      content: question || "[Image uploaded]",
      time: new Date().toLocaleTimeString(),
    });

    let reply = "";

 
    if (!question && req.file) {
      reply = "I currently only answer text questions based on admin-uploaded knowledge. Please send a text question along with the image.";
    }
   
    else if (question) {
      const embedder = await getEmbedder();
      const qEmbedding = await embedder(question, { pooling: "mean", normalize: true });
      const qVec = Array.from(qEmbedding.data);

      const allDocs = await Knowledge.find().lean();
      let bestMatches = [];

      for (const doc of allDocs) {
        if (!doc.content || doc.content.length < 30) continue;

      
        const textToEmbed = doc.content.slice(0, 1800);
        const dEmbedding = await embedder(textToEmbed, { pooling: "mean", normalize: true });
        const dVec = Array.from(dEmbedding.data);

        const sim = cosineSimilarity(qVec, dVec);

        if (sim > 0.48) {  
          bestMatches.push({ doc, similarity: sim });
        }
      }

      bestMatches.sort((a, b) => b.similarity - a.similarity);
      bestMatches = bestMatches.slice(0, 4); 
      if (bestMatches.length === 0) {
        reply = "I don't have information about that.";
      } else {
        const context = bestMatches
          .map(m => m.doc.content.trim())
          .join("\n\n────────────────────────────\n\n");

        const systemInstruction = `You are a helpful assistant that answers questions **only** using the provided knowledge base content.
You must NEVER use general knowledge, internet information, assumptions or common sense that is not explicitly written in the provided context.
If the answer is not clearly supported by the context, or if the question is unrelated, reply **only** with this exact sentence:

"I don't have information about that."

Knowledge base content:
${context}

Now answer the following question based **only** on the text above:`;

        const model = genAI.getGenerativeModel({
          model: MODEL_NAME,
          generationConfig: {
            temperature: 0.25,         
            maxOutputTokens: 900,
            topP: 0.92,
          },
          systemInstruction: systemInstruction,
        });

        const parts = [{ text: question }];

        if (req.file) {
          parts.push({
            inlineData: {
              mimeType: req.file.mimetype,
              data: req.file.buffer.toString("base64"),
            },
          });
        }

        const result = await model.generateContent(parts);
        reply = result?.response?.text()?.trim() || "Sorry, I couldn’t generate a response.";

       
        if (
          !context.toLowerCase().includes(question.toLowerCase().slice(0, 30)) &&
          reply.toLowerCase().includes("don't have") === false &&
          reply.length > 80
        ) {
          reply = "I don't have information about that.";
        }
      }
    }


    const botMessage = await Message.create({
      userId,
      role: "bot",
      content: reply,
      time: new Date().toLocaleTimeString(),
    });

    res.json({ userMessage, botMessage });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ message: "AI error – check server logs" });
  }
});

chat.get("/history", protect, async (req, res) => {
  try {
    const history = await Message.find({ userId: req.userId })
      .sort({ createdAt: 1 })
      .lean();
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Cannot load history" });
  }
});



chat.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("firstName email name");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default chat;