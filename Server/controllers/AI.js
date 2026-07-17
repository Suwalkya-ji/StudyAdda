const generateAIContent = async (prompt, isJsonMode = false) => {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  // 1. OPENROUTER FREE API (If OPENROUTER_API_KEY or sk-or- key is set)
  if (openRouterKey || (geminiKey && geminiKey.startsWith("sk-or-"))) {
    const apiKey = openRouterKey || geminiKey;
    const modelsToTry = [
      "openrouter/free",
      "google/gemma-4-31b-it:free",
      "meta-llama/llama-3.3-70b-instruct:free",
      "meta-llama/llama-3.2-3b-instruct:free",
      "qwen/qwen3-coder:free",
      "tencent/hy3:free"
    ];

    let lastError;

    for (const modelName of modelsToTry) {
      try {
        const payload = {
          model: modelName,
          messages: [{ role: "user", content: prompt }]
        };

        if (isJsonMode) {
          payload.response_format = { type: "json_object" };
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "https://studyadda.com",
            "X-Title": "StudyAdda"
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeout);
        const data = await res.json();

        if (!res.ok) {
          const errorMsg = data?.error?.message || `HTTP ${res.status}`;
          console.warn(`❌ OpenRouter ${modelName} error:`, errorMsg);
          lastError = new Error(errorMsg);
          continue;
        }

        const text = data?.choices?.[0]?.message?.content;
        if (text) {
          console.log(`✅ Success with OpenRouter model: ${modelName}`);
          return text;
        }
      } catch (err) {
        console.warn(`⚠️ OpenRouter ${modelName} exception:`, err.message);
        lastError = err;
      }
    }

    throw lastError || new Error("OpenRouter API failed");
  }

  // 2. FALLBACK TO GEMINI API
  if (!geminiKey) {
    throw new Error("Neither OPENROUTER_API_KEY nor GEMINI_API_KEY is configured in .env");
  }

  const modelsToTry = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
  ];

  let lastError;

  for (const modelName of modelsToTry) {
    try {
      const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`;

      const payload = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      };

      if (isJsonMode) {
        payload.generationConfig = {
          responseMimeType: "application/json",
        };
      }

      const headers = { "Content-Type": "application/json" };
      let url = baseUrl;

      if (geminiKey.startsWith("AQ.")) {
        headers["Authorization"] = `Bearer ${geminiKey}`;
      } else {
        headers["x-goog-api-key"] = geminiKey;
        url = `${baseUrl}?key=${encodeURIComponent(geminiKey)}`;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data?.error?.message || `HTTP ${res.status}`;
        console.warn(`❌ ${modelName} error:`, errorMsg);
        lastError = new Error(errorMsg);
        if (res.status === 429) {
          await new Promise((r) => setTimeout(r, 2000));
        }
        continue;
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Empty response from Gemini");
      }

      console.log(`✅ Success with Gemini model: ${modelName}`);
      return text;
    } catch (err) {
      console.warn(`⚠️ ${modelName} exception:`, err.message);
      lastError = err;
    }
  }

  if (
    lastError?.message?.includes("quota") ||
    lastError?.message?.includes("RESOURCE_EXHAUSTED")
  ) {
    throw new Error(
      "Gemini quota exceeded. Please wait a few seconds and try again."
    );
  }

  throw lastError || new Error("Gemini API failed");
};



const askDoubt = async (req, res) => {
  try {
    const { question, topicTitle, topicDescription, courseTitle, chatHistory } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    const systemPrompt = `
You are StudyAdda AI Tutor — friendly, patient, and encouraging.

Course: ${courseTitle || "General"}
Topic: ${topicTitle || "General"}
${topicDescription ? `Description: ${topicDescription}` : ""}

Instructions:
- Explain clearly
- Use bullet points
- Keep it simple and helpful
`;

    let userPrompt = question;

    if (chatHistory?.length > 0) {
      const history = chatHistory
        .map((msg) =>
          `${msg.sender === "user" ? "Student" : "Tutor"}: ${msg.text}`
        )
        .join("\n");

      userPrompt = `${history}\n\nStudent: ${question}`;
    }

    const reply = await generateAIContent(`${systemPrompt}\n\n${userPrompt}`);

    res.status(200).json({
      success: true,
      reply,
    });

  } catch (err) {
    console.error("askDoubt Error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const explainTopic = async (req, res) => {
  try {
    const { topicTitle, topicDescription, courseTitle } = req.body;

    if (!topicTitle) {
      return res.status(400).json({
        success: false,
        message: "Topic title is required",
      });
    }

    const prompt = `
Explain "${topicTitle}" for course "${courseTitle || "Programming"}".

${topicDescription || ""}

Return in markdown:

1. Core Concept
2. Real-world analogy
3. Code example
4. Key takeaways
`;

    const explanation = await generateAIContent(prompt);

    res.status(200).json({
      success: true,
      explanation,
    });

  } catch (err) {
    console.error("explainTopic Error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const generateQuiz = async (req, res) => {
  try {
    const { topicTitle, topicDescription, courseTitle, count = 5 } = req.body;

    if (!topicTitle) {
      return res.status(400).json({
        success: false,
        message: "Topic title is required",
      });
    }

    const prompt = `
Create ${count} MCQ questions on "${topicTitle}".

Return ONLY JSON array:

[
  {
    "id": 1,
    "question": "...",
    "options": ["A","B","C","D"],
    "correctIndex": 0,
    "explanation": "..."
  }
]
`;

    let raw = await generateAIContent(prompt, true);

    // clean markdown if present
    raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

    let quiz;

    try {
      quiz = JSON.parse(raw);
    } catch (err) {
      console.error("JSON Error:", raw);
      throw new Error("Invalid JSON from AI");
    }

    res.status(200).json({
      success: true,
      quiz,
    });

  } catch (err) {
    console.error("generateQuiz Error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  generateAIContent,
  askDoubt,
  explainTopic,
  generateQuiz,
};