import Groq from "groq-sdk";

require("dotenv").config();

let use_ai = true;
let client: Groq;

if (!process.env.GROQ_API_KEY) {
  console.warn("No Groq API key found! Not using AI.");
  use_ai = false;
} else {
  client = new Groq({
    apiKey: process.env.GROQ_API_KEY, // This is the default and can be omitted
  });
}
let system_prompt = "";
let savedETag: string | null = null;

async function GetSystemPrompt() {
  const url =
    "https://raw.githubusercontent.com/GoobApp/goobAI-system-prompt/refs/heads/main/prompt.txt";
  try {
    const headers: HeadersInit = {};
    if (savedETag) {
      headers["If-None-Match"] = savedETag;
    }

    const response = await fetch(url, { headers });

    if (response.status === 304) {
      return { updated: false };
    }

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    savedETag = response.headers.get("ETag");
    console.log("New system prompt! Updating old...");

    const result = await response.text();
    system_prompt = result;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
  }
}

const SendMessageToAI = async (username: string, prompt: string) => {
  if (!use_ai) return;

  await GetSystemPrompt();
  const chatCompletion = await client.chat.completions.create({
    messages: [
      { role: "system", content: system_prompt },
      {
        role: "system",
        content: `The user who messaged you is: ${username}`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "moonshotai/kimi-k2-instruct-0905",
    temperature: 0.6,
    max_completion_tokens: 4096,
    top_p: 1,
    stream: false,
  });
  return chatCompletion.choices[0].message.content;
};

export default SendMessageToAI;
