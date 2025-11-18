import { getEnvVar } from "../utils/envAccess";
import { sendRequest } from "./requester";
import { SceneGenerationResult } from "./types";

async function processPrompt(prompt: string): Promise<SceneGenerationResult> {
  if (getEnvVar("USE_LOCAL_MODEL") !== "true") {
    return { sceneText: "Placeholder, AI API not yet supported.", timeTakenMs: 0, modelUsed: "None" };
  }
  return sendRequest(prompt, getEnvVar("LOCAL_MODEL_URL"));
}

// TODO: Maybe each of these should be an object that I'm serializing from JSON with a toString() method
export async function generateScene(writingStyleExamples: string[], sceneDescription: string, characters: string[], plotPoints: string[]): Promise<SceneGenerationResult> {
  try {
    const prompt = `Generate a scene in a story given the following information. Do NOT output anything other than the text of the scene.
      Match the style found in these paragraphs, but not the content (these are NOT part of the story): "${writingStyleExamples.join('" "')}"
      This is the plot of the story: "${plotPoints.join(' ')}"
      These are the characters in the story: "${characters.join(', ')}"
      Here is the overview of the scene to create: "${sceneDescription}"`;
    return await processPrompt(prompt);
  } catch (error) {
    console.error("Error generating scene:", error);
    throw error;
  }
}