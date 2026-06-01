import axios from "axios"
const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    
    let apiUrl;
    let headers = { 'Content-Type': 'application/json' };
    let data;

    const isGroq = apiKey && apiKey.startsWith("gsk_");

    console.log("Command received:", command, "Using:", isGroq ? "Groq" : "Gemini");

    const prompt = `
You are Jarvis AI, an advanced voice + text assistant.
You were created by chetan.

⚠️ CRITICAL RULE:
You MUST return ONLY valid JSON.
NO markdown, NO explanation outside JSON, NO extra text.

---

📦 OUTPUT FORMAT (STRICT):
{
  "type": "actual-intent-name (e.g., youtube-open, google-search, general-chat)",
  "userInput": "original user input",
  "response": "message shown to user",
  "verbosity": "short | normal | detailed",
  "data": {}
}

---

🧠 INTENT SYSTEM:

APP CONTROL:
- chatgpt-open
- instagram-open
- github-open
- gmail-open
- whatsapp-open
- spotify-open
- netflix-open
- youtube-open
- calculator-open
- notepad-open
- vscode-open

SEARCH:
- google-search → data: { "query": "extracted search term" }
- youtube-search → data: { "query": "extracted search term" }
- github-search → data: { "query": "extracted search term" }
- wikipedia-search → data: { "query": "extracted search term" }
- url-open → data: { "url": "extracted URL" }

UTILITY:
- get-time
- weather-show → data: { "city": "extracted city name" }

CHAT:
- general-chat

---

⚡ COMMAND EXECUTION:
When user says "open [app]" or "launch [app]", return the correct intent. 
NEVER treat app opening as general-chat.

---

🧠 RESPONSE LENGTH CONTROL:
1. If user asks "explain", "what is", "how does" → verbosity = "detailed"
2. If user says "short answer", "in brief" → verbosity = "short"
3. Default → verbosity = "normal"

---

📌 RESPONSE RULES:
- For commands: "Opening YouTube for you", "Launching Instagram now"
- For "who created you": MUST include "chetan created me"
- Keep responses short and voice-friendly unless detailed is requested.

---

USER INPUT:
${command}
`;

    if (isGroq) {
        apiUrl = "https://api.groq.com/openai/v1/chat/completions";
        headers['Authorization'] = `Bearer ${apiKey}`;
        data = {
            model: (model && !model.includes("gemini") && !model.includes("llama3-8b")) ? model : "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        };
    } else {
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        data = {
            contents: [{ parts: [{ text: prompt }] }]
        };
    }

    const result = await axios.post(apiUrl, data, { headers });

    let rawResponse;
    if (isGroq) {
        rawResponse = result.data.choices?.[0]?.message?.content;
    } else {
        rawResponse = result.data.candidates?.[0]?.content?.parts?.[0]?.text;
    }
    
    console.log("AI raw response:", rawResponse);

    if (!rawResponse) {
        throw new Error("Empty response from AI");
    }

    // ROBUST JSON PARSING FALLBACK PROTECTION
    try {
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return jsonMatch[0];
        }
        return JSON.stringify(JSON.parse(rawResponse));
    } catch (parseError) {
        console.error("JSON Parse Error:", rawResponse);
        return JSON.stringify({
            type: "general-chat",
            userInput: command,
            response: rawResponse.length < 150 ? rawResponse : "I encountered a formatting error, but here is my response: " + rawResponse.substring(0, 100),
            verbosity: "normal",
            data: {}
        });
    }

  } catch (error) {
    const detailedError = error.response?.data?.error?.message || error.message;
    console.error("AI API Error Detail:", detailedError);
    if (error.response?.status === 403) {
        console.error("CRITICAL: API key is forbidden/suspended.");
    }
    return JSON.stringify({
      type: "general",
      userInput: command,
      response: "I am having trouble connecting to my brain. Please check the API key."
    });
  }
};

export default geminiResponse;