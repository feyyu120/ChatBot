
import "dotenv/config";
import express from "express";
import User from "../model/user.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const authRouter = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


authRouter.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existEmail = await User.findOne({ email });
    if (existEmail) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password length must be at least 6 characters" });
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SEC,
      { expiresIn: "4d" }
    );

    res.status(201).json({
      message: "Successfully created an account",
      token,
      user: {
        id: user._id,
        role: user.role,
        name,
        email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SEC,
      { expiresIn: "4d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


authRouter.post("/google", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Google credential missing" });
    }

   
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const { email, name, sub: googleId, picture } = payload;

   
    let user = await User.findOne({ email });

    if (!user) {
     
      user = await User.create({
        name: name || "Google User",
        email,
        googleId,          
        profilePic: picture || "", 
        password: null,     
        role: "user",       
      });
    } else {

      if (picture && user.profilePic !== picture) {
        user.profilePic = picture;
        await user.save();
      }
    }

   
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SEC,
      { expiresIn: "4d" }
    );

    res.status(200).json({
      message: user.wasNew ? "Google signup successful" : "Google login successful",
      token,
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error.message);
    res.status(401).json({ message: "Google authentication failed" });
  }
});

export default authRouter;