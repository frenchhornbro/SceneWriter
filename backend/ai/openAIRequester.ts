import OpenAI from "openai";
import { getEnvVar } from "../utils/envAccess";
import { TextGenerationResult, ModelInfo } from "./types";

// Pricing: https://platform.openai.com/docs/pricing?latest-pricing=standard
export const models: ModelInfo[] = [
  { name: "gpt-5-mini", displayName: "GPT-5 Mini", description: "Very fast, higher context retention", contextWindowSize: 400_000, maxOutputTokens: 128_000, pricing: { inputPerMillion: "$0.25", cachedInputPerMillion: "$0.025", outputPerMillion: "$2.00" } },
  { name: "gpt-5-nano", displayName: "GPT-5 Nano", description: "Extremely fast, medium context retention", contextWindowSize: 400_000, maxOutputTokens: 128_000, pricing: { inputPerMillion: "$0.05", cachedInputPerMillion: "$0.005", outputPerMillion: "$0.40" } },
  { name: "gpt-4o-mini", displayName: "GPT-4o Mini", description: "Very fast, medium context retention", contextWindowSize: 128_000, maxOutputTokens: 16_384, pricing: { inputPerMillion: "$0.15", cachedInputPerMillion: "$0.075", outputPerMillion: "$0.60" } },
  { name: "gpt-5.1", displayName:"GPT-5.1", description:"Balanced speed and context retention", contextWindowSize: 400_000, maxOutputTokens: 128_000, pricing:{ inputPerMillion:"$1.25", cachedInputPerMillion:"$0.125", outputPerMillion:"$10.0" } },
  { name:"gpt-5.2", displayName:"GPT-5.2", description:"Fast, high context retention", contextWindowSize: 400_000, maxOutputTokens: 128_000, pricing:{ inputPerMillion:"$1.75", cachedInputPerMillion:"$0.175", outputPerMillion:"$14.0" } },
];
const modelNames = models.map(m => m.name);
const DEFAULT_MODEL = models.find(m => m.name === getEnvVar("DEFAULT_OPENAI_MODEL")) || models[0];
const MAX_OUTPUT_TOKENS = 30_000;
const client = new OpenAI({
  apiKey: getEnvVar("OPENAI_API_KEY"),
});

export async function sendOpenAIRequest(prompt: string, modelOverride?: string): Promise<TextGenerationResult> {
  const startTime = Date.now();
  if (modelOverride && !modelNames.includes(modelOverride)) {
    throw new Error(`Model override ${modelOverride} is not a valid model.`);
  }
  const model: ModelInfo = models.find(m => m.name === (modelOverride)) || DEFAULT_MODEL;
  if (getEnvVar("VERBOSE") === "true") {
    console.log(`Generating with model ${model.displayName}...`);
  }
  const response = await client.responses.create({
    model: model.name,
    input: prompt,
    max_output_tokens: Math.min(MAX_OUTPUT_TOKENS, model.maxOutputTokens),
  });
  const responseText = response.output_text;
  const usage = response.usage;
  if (!responseText) {
    throw new Error("No response from model API");
  }
  console.log("Generated text:", responseText);
  const endTime = Date.now();
  if (getEnvVar("VERBOSE") === "true") {
    console.log(`Scene generated in ${endTime - startTime} ms using model ${model.displayName} with usage: ${JSON.stringify(usage)}.`);
  }
  return {text: responseText, timeTakenMs: endTime - startTime, modelUsed: model.name};
}