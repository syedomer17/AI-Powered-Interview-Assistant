#!/usr/bin/env node
import { connectDB } from "./src/config/db.js";
import { createApp } from "./src/app.js";

async function testBackend() {
  try {
    console.log("🧪 Testing backend connections...");
    
    // Test database connection
    await connectDB();
    console.log("✅ Database connection successful");
    
    // Test app creation
    const app = createApp();
    console.log("✅ App creation successful");
    
    // Test AI service (if API key is available)
    try {
      const { generateQuestions } = await import("./src/services/aiService.js");
      const questions = await generateQuestions();
      console.log("✅ AI service working, generated", questions.length, "questions");
    } catch (aiError) {
      console.log("⚠️  AI service test failed:", aiError.message);
    }
    
    console.log("🎉 Backend test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Backend test failed:", error);
    process.exit(1);
  }
}

testBackend();