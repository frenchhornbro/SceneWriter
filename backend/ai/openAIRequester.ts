import OpenAI from "openai";
import { getEnvVar } from "../utils/envAccess";
import { TextGenerationResult } from "./types";

// Pricing: https://platform.openai.com/docs/pricing?latest-pricing=standard
const models = [
  "gpt-5-mini",   // ($0.25/M input, $0.025/M cached input, $2.00/M output) Very fast, higher context retention
  "gpt-5-nano",   // ($0.05/M input, $0.005/M cached input, $0.40/M output) Extremely fast, medium context retention
  "gpt-4o-mini",  // ($0.15/M input, $0.075/M cached input, $0.60/M output) Very fast, medium context retention
  "gpt-5.2",      // ($1.75/M input, $0.175/M cached input, $14.00/M output) Fast, high context retention
];

const client = new OpenAI({
  apiKey: getEnvVar("OPENAI_API_KEY"),
});

export async function sendOpenAIRequest(prompt: string, modelOverride?: string): Promise<TextGenerationResult> {
  const startTime = Date.now();
  if (modelOverride && !models.includes(modelOverride)) {
    throw new Error(`Model override ${modelOverride} is not a valid model.`);
  }
  const model: string = modelOverride ? modelOverride : models[0];
  if (getEnvVar("VERBOSE") === "true") {
    console.log(`Generating with model ${model}...`);
  }
  const response = await client.responses.create({
    model: model,
    input: prompt,
  });
  const responseText = response.output_text;
  const usage = response.usage;
  if (!responseText) {
    throw new Error("No response from model API");
  }
  console.log("Generated text:", responseText);
  const endTime = Date.now();
  if (getEnvVar("VERBOSE") === "true") {
    console.log(`Scene generated in ${endTime - startTime} ms using model ${model} with usage: ${JSON.stringify(usage)}.`);
  }
  return {text: responseText, timeTakenMs: endTime - startTime, modelUsed: model};
}