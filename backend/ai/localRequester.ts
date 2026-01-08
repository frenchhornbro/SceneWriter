import { getEnvVar } from "../utils/envAccess";
import { TextGenerationResult } from "./types";

export const models = {
  "llama3.2:latest": "Llama 3.2 Latest",
  "gemma3:270m": "Gemma 3 (270M)",
  "gemma3:1b": "Gemma 3 (1B)",
  "gemma3:4b": "Gemma 3 (4B)",
}

const DEFAULT_MODEL = getEnvVar("DEFAULT_LOCAL_MODEL") || "llama3.2:latest";

async function sendRequestWithModel(prompt: string, url: string, model: string): Promise<Response> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "model": model,
      "prompt": prompt
    }),
  });
  return response;
}

async function decodeResponse(response: Response): Promise<string> {
  if (getEnvVar("VERBOSE") === "true") {
    console.log("Decoding response...");
  }
  if (!response.body) {
    throw new Error("No response body from model API");
  }
  const reader = response.body?.getReader();
  const decoder = new TextDecoder("utf-8");
  let result = "";
  try {
    // TODO: Consider having a decoder timeout
    while (true) {
      const chunk = await reader.read();
      const { done, value } = chunk;
      if (done) {
        break;
      }
      const decoded = decoder.decode(value, { stream: true });
      console.log(JSON.stringify(decoded));
      try {
        result += JSON.parse(decoded)?.response;
      }
      catch (e) {
        console.log("Error parsing chunk, skipping");
        result += "<ERROR>";
      }
    }
    return result;
  } catch (error) {
    console.error("Error decoding response:", error);
    console.log("Result:", result);
    throw error;
  }
}

export async function sendLocalRequest(prompt: string, url: string, modelOverride?: string): Promise<TextGenerationResult> {
  const startTime = Date.now();
  let response: Response | undefined;
  let model: string = "";
  const modelKeys = Object.keys(models) as Array<keyof typeof models>;
  const triedModels = new Set<string>();
  // Determine the initial model to try
  let initialModel: string;
  if (modelOverride && modelOverride in models) {
    initialModel = modelOverride;
  } else {
    initialModel = DEFAULT_MODEL;
  }
  // Build ordered list: initial model first, then remaining models in order
  const modelsToTry: string[] = [initialModel];
  for (const modelKey of modelKeys) {
    if (modelKey !== initialModel) {
      modelsToTry.push(modelKey);
    }
  }
  for (const modelKey of modelsToTry) {
    if (triedModels.has(modelKey)) {
      continue;
    }
    triedModels.add(modelKey);
    model = modelKey;
    if (getEnvVar("VERBOSE") === "true") {
      console.log(`Generating with model ${modelKey} (${models[modelKey as keyof typeof models]})...`);
    }
    response = await sendRequestWithModel(prompt, url, modelKey);
    if (!response.ok) {
      const data = await response.json();
      if (data.error && data.error.includes("model requires more system memory than is currently available")) {
        console.warn(`Model ${modelKey} failed due to insufficient memory, trying next model.`);
        continue;
      }
      throw new Error(`Model API request failed with status ${response.status}`);
    }
    break;
  }
  if (!response || !response.ok) {
    throw new Error("All models failed due to insufficient system memory");
  }
  const text = await decodeResponse(response);
  const endTime = Date.now();
  if (getEnvVar("VERBOSE") === "true") {
    console.log("Generated text:", text);
    console.log(`Scene generated in ${endTime - startTime} ms using model ${model}.`);
  }
  return {text, timeTakenMs: endTime - startTime, modelUsed: model};
}