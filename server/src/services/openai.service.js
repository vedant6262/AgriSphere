import OpenAI from "openai";
import { env } from "../config/env.js";

const containsAny = (text, terms) => terms.some((term) => text.includes(term));

const buildLocalAdvisory = (message, settings) => {
  const text = String(message || "").toLowerCase();
  const crop = settings?.cropType || "your crop";
  const location = settings?.location || "your farm";

  if (containsAny(text, ["irrig", "water", "moisture", "soil"])) {
    return `Local advisory for ${crop} in ${location}: irrigate early morning in short pulses, then re-check soil moisture after 4-6 hours. If rainfall probability is above 60%, reduce the next cycle by 20-30%.`;
  }

  if (containsAny(text, ["disease", "fung", "blight", "pest", "insect"])) {
    return `Local advisory for ${crop} in ${location}: scout lower leaves and field edges first, remove visibly infected material, and spray only after confirming symptoms in at least 5-10 random plants.`;
  }

  if (containsAny(text, ["market", "price", "sell", "mandi"])) {
    return `Local advisory for ${crop} in ${location}: compare two nearby markets, track 3-day trend before selling bulk produce, and split harvest lots to reduce price-risk from one-day dips.`;
  }

  return `Local advisory for ${crop} in ${location}: use a daily routine of soil moisture check, 5-day rainfall review, crop-stage planning, and weekly pest scouting before major farm actions.`;
};

const fallbackAnswer = (message, settings, reason = "") => {
  const advisory = buildLocalAdvisory(message, settings);

  if (String(reason).includes("429")) {
    return `Gemini is temporarily rate-limited (quota hit). ${advisory}`;
  }

  return `AI provider is temporarily unavailable. ${advisory}`;
};

const getProviderConfig = () => {
  const key = String(env.GEMINI_API_KEY || "").trim();

  // Groq keys start with gsk_; route to Groq OpenAI-compatible endpoint.
  if (key.startsWith("gsk_")) {
    return {
      apiKey: key,
      baseURL: "https://api.groq.com/openai/v1",
      model: env.GEMINI_MODEL || "llama-3.1-8b-instant"
    };
  }

  // Default to Gemini OpenAI-compatible endpoint.
  return {
    apiKey: key,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    model: env.GEMINI_MODEL || "gemini-2.0-flash"
  };
};

export const generateAgricultureReply = async (messages, settings) => {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content || "";
  const useGemini = Boolean(env.GEMINI_API_KEY);

  if (!useGemini) {
    return fallbackAnswer(latestUserMessage, settings, "missing-key");
  }

  const providerConfig = getProviderConfig();

  const client = new OpenAI({
    apiKey: providerConfig.apiKey,
    baseURL: providerConfig.baseURL
  });

  const systemPrompt = `
You are AgriSphere Copilot, an agriculture assistant for climate-smart farming.
Answer with concise, practical recommendations.
Use the farm context when present:
- Farm location: ${settings?.location || "Unknown"}
- Crop type: ${settings?.cropType || "Mixed crops"}
- Region: ${settings?.region || "Unknown"}
- Season: ${settings?.season || "Unknown"}
Include cautions when weather, disease, or irrigation decisions depend on local field inspection.
`;

  const normalizedMessages = messages
    .filter((message) => message?.role && message?.content)
    .map((message) => ({ role: message.role, content: String(message.content) }));

  try {
    const completion = await client.chat.completions.create({
      model: providerConfig.model,
      messages: [
        { role: "system", content: systemPrompt.trim() },
        ...normalizedMessages
      ]
    });

    return completion.choices?.[0]?.message?.content?.trim() || fallbackAnswer(latestUserMessage, settings, "empty-response");
  } catch (error) {
    console.warn("AI provider request failed, using fallback response", error.message);
    return fallbackAnswer(latestUserMessage, settings, error?.message || "unknown-error");
  }
};
