import "dotenv/config"
import express from 'express'
import Mongo from './data/mongo.js';
import authRouter from "./routes/router.js"
import cors from "cors"
import chat from "./routes/chat.js";
import admin from "./routes/admin.js";


const app = express();
app.use(cors())
app.use(express.json());
app.use("/api/auth",authRouter) 
app.use("/api/chat",chat)
app.use("/api/admin", admin);

app.listen(process.env.PORT);
Mongo();

