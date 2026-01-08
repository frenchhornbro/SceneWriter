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
  previousSceneText?: string,
  nextSceneText?: string,
  modelOverride?: string,
): Promise<TextGenerationResult> {
  try {
    const prompt = `\
Generate a scene in a story given the following information.
${writingStyleExamples ? `Match the style found in these paragraphs, but not the content (these are NOT part of the story): "${writingStyleExamples}"\n\n` : ""}\
${plotPoints ? `These are the relevant plot points for this scene: "${plotPoints}"\n` : ""}\
${characters ? `These are the relevant characters in this scene: "${characters}"\n` : ""}\
${sceneDescription ? `Here is the overview of the scene to create: "${sceneDescription}"\n` : ""}\
${pointOfView ? `The point of view for this scene is: "${pointOfView}"\n` : ""}\
${location ? `The location of this scene is: "${location}"\n` : ""}\
${tone ? `The tone of this scene is: "${tone}"\n` : ""}\
${previousSceneText ? `Here is the previous scene in the story: "${previousSceneText}"\n` : ""}\
${nextSceneText ? `Here is the next scene in the story: "${nextSceneText}"\n` : ""}\
Generate the text of this scene. This is one of many scene generations, so include in your writing mentions of only some, not all, of the provided context.
Do not overuse metaphors${writingStyleExamples ? ", unless doing so to match the writing style samples provided" : ""}.
Do NOT output anything other than the text of the scene.`;
    if (getEnvVar("VERBOSE") === "true") {
      console.log(prompt);
    }
    return await processPrompt(prompt, modelOverride);
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