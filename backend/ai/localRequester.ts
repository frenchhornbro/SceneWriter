import { getEnvVar } from "../utils/envAccess";
import { TextGenerationResult } from "./types";

const models = [
  "llama3.2:latest",
  "gemma3:270m",
  "gemma3:1b",
  "gemma3:4b",
]

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
  let response: any;
  let model: string = "";
  for (let i = 0; i < models.length; i++) {
    model = models[i];
    if (modelOverride && model !== modelOverride) {
      continue;
    }
    if (getEnvVar("VERBOSE") === "true") {
      console.log(`Generating scene with model ${model}...`);
    }
    response = await sendRequestWithModel(prompt, url, models[i]);
    if (!response.ok) {
      const data = await response.json();
      if (data.error && data.error.includes("model requires more system memory than is currently available")) {
        console.warn(`Model ${models[i]} failed due to insufficient memory, trying next model.`);
        if (i === models.length - 1) {
          throw new Error(`All models failed: ${data.error}`);
        }
        continue;
      }
      throw new Error(`Model API request failed with status ${response.status}`);
    }
    break;
  }
  const text = await decodeResponse(response);
  console.log("Generated text:", text);
  const endTime = Date.now();
  if (getEnvVar("VERBOSE") === "true") {
    console.log(`Scene generated in ${endTime - startTime} ms using model ${model}.`);
  }
  return {text, timeTakenMs: endTime - startTime, modelUsed: model};
}