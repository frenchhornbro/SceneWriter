import { getEnvVar } from "../utils/envAccess";
import { SceneGenerationResult } from "./types";

const models = [
  "llama3.2:latest",
  "gemma3:4b",
  "gemma3:1b",
  "gemma3:270m"
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
  // TODO: Consider having a decoder timeout
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    const decoded = decoder.decode(value, { stream: true });
    result += JSON.parse(decoded).response;
  }
  return result;
}

export async function sendRequest(prompt: string, url: string): Promise<SceneGenerationResult> {
  // TODO: Allow the user to specify model preference
  const startTime = Date.now();
  let response: any;
  let model: string = "";
  for (let i = 0; i < models.length; i++) {
    model = models[i];
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
  const sceneText = await decodeResponse(response);
  const endTime = Date.now();
  if (getEnvVar("VERBOSE") === "true") {
    console.log(`Scene generated in ${endTime - startTime} ms using model ${model}.`);
  }
  return {sceneText: sceneText, timeTakenMs: endTime - startTime, modelUsed: model};
}