const express = require("express");

const router = express.Router();
const requestTimes = new Map();
const REQUEST_WINDOW_MS = 60 * 1000;
const AI_TIMEOUT_MS = 10 * 1000;

function fallbackResponse(message) {
    return {
        description: "",
        fallback: true,
        message
    };
}

router.post("/generate-description", async (req, res) => {
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";

    if (!title) {
        return res.status(400).json({
            message: "A task title is required to generate a description."
        });
    }

    const requestKey = `${req.user.id}:${title.toLowerCase()}`;
    const lastRequest = requestTimes.get(requestKey);
    if (lastRequest && Date.now() - lastRequest < REQUEST_WINDOW_MS) {
        return res.status(429).json({
            message: "Please wait a minute before generating another suggestion for this task."
        });
    }

    requestTimes.set(requestKey, Date.now());

    if (!process.env.GROQ_API_KEY) {
        return res.status(200).json(
            fallbackResponse("AI suggestions are not configured. You can write the description manually.")
        );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
                messages: [
                    {
                        role: "system",
                        content: "Write concise, practical task descriptions. Return only the description, with no heading or quotation marks."
                    },
                    {
                        role: "user",
                        content: `Write a short task description for: ${title}`
                    }
                ],
                max_tokens: 100
            }),
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`OpenAI request failed with status ${response.status}`);
        }

        const result = await response.json();
        const description = result.choices?.[0]?.message?.content?.trim();
        if (!description) {
            throw new Error("OpenAI returned an empty description");
        }

        return res.status(200).json({
            description,
            fallback: false,
            message: "AI-generated suggestion. Review it before saving."
        });
    } catch (error) {
        console.error("AI description generation failed:", error.message);
        return res.status(200).json(
            fallbackResponse("AI suggestions are temporarily unavailable. You can write the description manually.")
        );
    } finally {
        clearTimeout(timeout);
    }
});

module.exports = router;
