import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import authRouter from "./routes/auth.routes.js"
import cors from "cors"
import cookieParser from "cookie-parser"
import userRouter from "./routes/user.routes.js"
import geminiResponse from "./gemini.js"
import axios from "axios"

// Startup Validation
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY missing or invalid in .env");
    process.exit(1);
}
if (!process.env.GEMINI_MODEL) {
    console.warn("⚠️ WARNING: GEMINI_MODEL missing, defaulting to gemini-1.5-flash");
}

const app=express()

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (origin.startsWith("http://localhost:")) {
            return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// app.options("*", cors());

const port=process.env.PORT || 5000
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.use("/api/user",userRouter)

// Test AI Route
app.get("/api/test-ai", async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
        const isGroq = apiKey && apiKey.startsWith("gsk_");
        
        let apiUrl;
        let headers = { 'Content-Type': 'application/json' };
        let data;

        if (isGroq) {
            apiUrl = "https://api.groq.com/openai/v1/chat/completions";
            headers['Authorization'] = `Bearer ${apiKey}`;
            data = {
                model: (model && !model.includes("gemini") && !model.includes("llama3-8b")) ? model : "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: "What is Python?" }]
            };
        } else {
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            data = {
                contents: [{ parts: [{ text: "What is Python?" }] }]
            };
        }
        
        console.log("Testing AI with URL:", apiUrl.replace(apiKey, "HIDDEN_KEY"));
        
        const result = await axios.post(apiUrl, data, { headers });
        
        console.log("AI Test Success:", JSON.stringify(result.data, null, 2));
        res.json({ success: true, provider: isGroq ? "Groq" : "Gemini", data: result.data });
    } catch (error) {
        console.error("AI Test Failure:", error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            error: error.response?.data || error.message,
            status: error.response?.status
        });
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
});

app.listen(port,()=>{
    connectDb()
    console.log(`Server started on port ${port}`)
})

