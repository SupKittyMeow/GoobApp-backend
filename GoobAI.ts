import Groq from "groq-sdk";
import ChatMessage from "./types/ChatMessageObject";

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
  const url = "https://ai.goobapp.org/prompt.txt";
  try {
    const headers: HeadersInit = {};
    if (savedETag) {
      headers["If-None-Match"] = savedETag;
      headers["Cache-Control"] = "no-cache";
    }

    const response = await fetch(url, { headers });

    if (response.status === 304) {
      return { updated: false };
    }

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    console.log("New system prompt! Updating old...");

    const result = await response.text();
    system_prompt = result;
    savedETag = response.headers.get("ETag");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
  }
}

const SendMessageToAI = async (
  username: string,
  prompt: string,
  custom_system_prompt: string | null,
  recentMessages: ChatMessage[]
) => {
  if (!use_ai) return;

  if (!custom_system_prompt) await GetSystemPrompt();

  try {
    const chatCompletion = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `${
            custom_system_prompt !== null ? custom_system_prompt : system_prompt
          }`,
        },
        ...recentMessages.map((message) => {
          return {
            role: "user" as const,
            content: `${message.userDisplayName}: ${message.messageContent}`,
          };
        }),
        {
          role: "user",
          content: `${username}: ${prompt}`,
        },
      ],
      model: "moonshotai/kimi-k2-instruct-0905",
      temperature: 0.6,
      max_completion_tokens: 4096,
      top_p: 1,
      stream: false,
    });
    return chatCompletion.choices[0].message.content;
  } catch (Error) {
    return "Sorry, an error occurred :goob:";
  }
};

export default SendMessageToAI;
