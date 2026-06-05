/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import net from "net";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" })); // Support base64 image uploads

const PORT = Number(process.env.PORT || 3000);

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini client successfully initialized server-side.");
  } catch (error) {
    console.error("Failed to initialize Gemini Client:", error);
  }
} else {
  console.warn("⚠️ GEMINI_API_KEY is not set or contains default placeholder. AI features will fallback to deterministic rules.");
}

// 1. API: Analyze Student Complaint using Gemini 3.5 Flash
app.post("/api/gemini/analyze-complaint", async (req, res) => {
  const { title, description, category } = req.body;

  if (!description) {
    return res.status(400).json({ error: "Description is required." });
  }

  // Fallback defaults if Gemini is not set up
  const fallback = {
    severity: description.toLowerCase().includes("urgent") || description.toLowerCase().includes("emergency") || description.toLowerCase().includes("shock") || description.toLowerCase().includes("fire") ? "Urgent" : "Normal",
    aiSummary: `Complaint about ${category || "issue"}: "${title || "No Title"}"`,
    suggestedAction: `Assign ticket to the ${category || "General"} department representative for priority review.`,
  };

  if (!aiClient) {
    console.log("No Gemini API connection. Returning local fallback analysis.");
    return res.json(fallback);
  }

  try {
    const prompt = `You are the CampusVoice AI Assistant for IMS Engineering College (IMSEC). Analyze the following student grievance and output a valid JSON.
    
    Category: ${category || "Other"}
    Complaint Title: ${title || "No Title"}
    Complaint Description: ${description}
    
    If the description indicates severe issues like electrical sparks, fire/water emergency, hostel security threats, canteen food safety, or student injury/health issues, classify severity as "Urgent".`;

    const geminiPromise = aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: {
              type: Type.STRING,
              enum: ["Urgent", "Normal", "Low"],
              description: "The calculated urgency of the complaint based on content.",
            },
            aiSummary: {
              type: Type.STRING,
              description: "A professional one-line summary in exactly 10 to 15 words. DO NOT exceed.",
            },
            suggestedAction: {
              type: Type.STRING,
              description: "A concrete, context-specific action for college administration.",
            },
          },
          required: ["severity", "aiSummary", "suggestedAction"],
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Gemini API call timed out after 6 seconds")), 6000)
    );

    const response = await Promise.race([geminiPromise, timeoutPromise]);

    let jsonText = response.text?.trim() || "";
    // Clean Markdown block wrapper if present
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.substring(7);
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.substring(3);
    }
    if (jsonText.endsWith("```")) {
      jsonText = jsonText.substring(0, jsonText.length - 3);
    }
    jsonText = jsonText.trim();

    const parsed = JSON.parse(jsonText);
    res.json(parsed);
  } catch (err: any) {
    console.error("Gemini analysis execution failed:", err);
    res.json(fallback);
  }
});

// 2. API: Simulated Push Notification Engine (FCM Server-side proxy)
app.post("/api/notifications/send", (req, res) => {
  const { userId, title, message, ticketId } = req.body;
  console.log(`[FCM Push Proxy] Sent push notification for User ${userId || "all"} regarding ticket ${ticketId || "N/A"}: "${title} - ${message}"`);
  res.json({ success: true, messageId: `msg-${Date.now()}` });
});

// 3. API: Self-escalation check triggered by Admin Dashboard or internal check
app.get("/api/admin/system-check", (req, res) => {
  res.json({
    status: "online",
    escalationCron: "Active - Every 1 Hour",
    currentServerTime: new Date().toISOString(),
  });
});

// Initialize Vite server or static production files
const BASE_PORT = Number(process.env.PORT || 3000);
const HOST = "0.0.0.0";

async function startServer(port = BASE_PORT) {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(port, HOST, () => {
    console.log(`🚀 CampusVoice Core Server listening on port ${port}`);
    console.log(`Dev Preview URL: http://localhost:${port}`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${port} is already in use. This server is configured to use port ${port} only and will exit.`);
      process.exit(1);
    }
    throw error;
  });
}

startServer();
