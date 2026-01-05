import Groq from "groq-sdk";
import { readFileSync } from "node:fs";

const filePath: string = "./goofy-goober-system-prompt.txt";
let system_prompt: string = "";

try {
  system_prompt = readFileSync(filePath, "utf-8");
} catch (err) {
  console.error(err);
}

require("dotenv").config();
const client = new Groq({
  apiKey: process.env.GROQ_API_KEY, // This is the default and can be omitted
});

const SendMessageToAI = async (username: string, prompt: string) => {
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
