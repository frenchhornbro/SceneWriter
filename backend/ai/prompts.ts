import { getEnvVar } from "../utils/envAccess";
import { sendLocalRequest } from "./localRequester";
import { sendOpenAIRequest } from "./openAIRequester";
import { TextGenerationResult } from "./types";

async function processPrompt(prompt: string, modelOverride?: string): Promise<TextGenerationResult> {
  if (getEnvVar("USE_LOCAL_MODEL") !== "true") {
    return sendOpenAIRequest(prompt, modelOverride);
  }
  return sendLocalRequest(prompt, getEnvVar("LOCAL_MODEL_URL"), modelOverride);
}

export async function generateScene(
  writingStyleExamples: string,
  sceneDescription: string,
  characters: string,
  plotPoints: string,
  pointOfView: string,
  location: string,
  tone: string,
): Promise<TextGenerationResult> {
  try {
    const prompt = `Generate a scene in a story given the following information.
      ${writingStyleExamples ? `Match the style found in these paragraphs, but not the content (these are NOT part of the story): "${writingStyleExamples}"` : ""}
      ${plotPoints ? `This is the plot of the story: "${plotPoints}"` : ""}
      ${characters ? `These are the characters in the story: "${characters}"` : ""}
      ${sceneDescription ? `Here is the overview of the scene to create: "${sceneDescription}"` : ""}
      ${pointOfView ? `The point of view is: "${pointOfView}"` : ""}
      ${location ? `The location is: "${location}"` : ""}
      ${tone ? `The tone is: "${tone}"` : ""}
      Generate the text of this scene. Do NOT output anything other than the text of the scene.`;
    console.log(prompt);
    return await processPrompt(prompt);
  } catch (error) {
    console.error("Error generating scene:", error);
    throw error;
  }
}

export async function generatePrompt(): Promise<TextGenerationResult> {
  try {
    const prompt = `Generate a creative writing prompt, one or two sentences long.
    The prompt should be open-ended and simple.
    The responder should be able to use this prompt to write a single short scene, one or two paragraphs long, to demonstrate their writing style.
    Do NOT output anything other than the text of the prompt.`;
    const modelOverride = (getEnvVar("USE_LOCAL_MODEL") === "true") ? "gemma3:270m" : "gpt-5-nano";
    return await processPrompt(prompt, modelOverride);
  } catch (error) {
    console.error("Error generating prompt:", error);
    throw error;
  }
}