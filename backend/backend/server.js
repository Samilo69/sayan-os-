import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();

// Exemple : OpenAI (tu peux changer plus tard)
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// Client OpenAI
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Route IA
app.post("/api/ai", async (req, res) => {
    const { prompt, memory } = req.body;

    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                ...(memory || []).map(m => ({ role: m.role, content: m.content })),
                { role: "user", content: prompt }
            ],
            max_tokens: 200
        });

        const reply = response.choices[0].message.content;

        res.json({ reply });
    } catch (err) {
        console.error("AI error:", err);
        res.status(500).json({ error: "AI backend error" });
    }
});

app.listen(PORT, () => {
    console.log("AI backend running on port", PORT);
});
