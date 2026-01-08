import { Request, Response, Router } from "express";
import { generateScene } from "../ai/prompts";
import { models as openAIModels } from "../ai/openAIRequester";
import { models as localModels } from "../ai/localRequester";
import { validateId } from "./routerUtils";
import { createNewScene, deleteScene, getAllScenes, getCharacterInfo, getLatestVersion, getNextScene, getNextSceneOrder, getNextVersion, getPlotPointInfo, getPreviousScene, getPreviousVersion, getScene, getWritingStyleSampleInfo, updateScene, updateSceneOrders } from "../data-access/sceneDataAccess";
import { getStory } from "../data-access/storyDataAccess";
import type { scenePreview } from "@shared/templates/scene";
import { getEnvVar } from "../utils/envAccess";

const sceneRouter = Router({ mergeParams: true });

sceneRouter.get("/models", async (req: Request, res: Response) => {
  const models = getEnvVar("USE_LOCAL_MODEL") === "true" ? localModels : openAIModels;
  res.status(200).json({ models });
});

sceneRouter.get("/", async (req: Request, res: Response) => {
  const { storyId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const scenes: scenePreview[] = getAllScenes(storyIdNum);
  const scenesPreview: scenePreview[] = scenes.map((scene: scenePreview) => ({
    id: scene.id,
    version: scene.version,
    title: scene.title,
    scene_text: scene.scene_text.length > 200 ? scene.scene_text.substring(0, 200) + "..." : scene.scene_text,
    scene_order: scene.scene_order,
    created_at: scene.created_at,
    edited_at: scene.edited_at,
  }));

  res.status(200).json({ scenes: scenesPreview });
});

sceneRouter.get("/:sceneId/version/:sceneVersion", async (req: Request, res: Response) => {
  const { storyId, sceneId, sceneVersion } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const sceneIdNum = validateId(sceneId);
  if (!sceneIdNum) {
    res.status(400).json({error: "Missing or invalid sceneId parameter."});
    return;
  }
  const sceneVersionNum = validateId(sceneVersion);
  if (!sceneVersionNum) {
    res.status(400).json({error: "Missing or invalid sceneVersion parameter."});
    return;
  }
  const { title } = getStory(storyIdNum);
  const sceneData = getScene(sceneIdNum, sceneVersionNum);
  const scene = sceneData["scene"];
  if (!scene) {
    res.status(404).json({error: "Scene not found."});
    return;
  }
  res.status(200).json({
    id: sceneId,
    storyId: storyId,
    storyTitle: title,
    sceneId: sceneId,
    version: scene.version,
    sceneText: scene.scene_text,
    overview: scene.overview,
    order: scene.scene_order,
    title: scene.title,
    pov: scene.pov,
    tone: scene.tone,
    location: scene.location,
    connectedCharacterIds: sceneData["connectedCharacters"].map((char: any) => char.id),
    connectedPlotPointIds: sceneData["connectedPlotPoints"].map((pp: any) => pp.id),
    connectedCharacters: sceneData["connectedCharacters"],
    connectedPlotPoints: sceneData["connectedPlotPoints"],
    additionalNotes: scene.additional_notes,
    createdAt: scene.created_at,
    editedAt: scene.edited_at,
  });
});

sceneRouter.get("/:sceneId/version/:sceneVersion/adjacent", async (req: Request, res: Response) => {
  const { storyId, sceneId, sceneVersion } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const sceneIdNum = validateId(sceneId);
  if (!sceneIdNum) {
    res.status(400).json({error: "Missing or invalid sceneId parameter."});
    return;
  }
  const sceneVersionNum = validateId(sceneVersion);
  if (!sceneVersionNum) {
    res.status(400).json({error: "Missing or invalid sceneVersion parameter."});
    return;
  }
  const sceneData = getScene(sceneIdNum, sceneVersionNum);
  const scene = sceneData["scene"];
  if (!scene) {
    res.status(404).json({error: "Scene not found."});
    return;
  }
  const sceneOrder = scene.scene_order;
  const previousScene = getPreviousScene(storyIdNum, sceneOrder);
  const nextScene = getNextScene(storyIdNum, sceneOrder);
  res.status(200).json({
    previousScene: previousScene ? {
      id: previousScene.id,
      version: previousScene.version,
      title: previousScene.title,
      sceneText: previousScene.scene_text,
    } : null,
    nextScene: nextScene ? {
      id: nextScene.id,
      version: nextScene.version,
      title: nextScene.title,
      sceneText: nextScene.scene_text,
    } : null,
  });
});

sceneRouter.get("/:sceneId/version/:sceneVersion/previous", async (req: Request, res: Response) => {
  const { storyId, sceneId, sceneVersion } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const sceneIdNum = validateId(sceneId);
  if (!sceneIdNum) {
    res.status(400).json({error: "Missing or invalid sceneId parameter."});
    return;
  }
  const sceneVersionNum = validateId(sceneVersion);
  if (!sceneVersionNum) {
    res.status(400).json({error: "Missing or invalid sceneVersion parameter."});
    return;
  }
  const previousVersion = getPreviousVersion(sceneIdNum, sceneVersionNum) || sceneVersionNum;
  res.status(200).json({ previousVersion });
});

sceneRouter.get("/:sceneId/version/:sceneVersion/next", async (req: Request, res: Response) => {
  const { storyId, sceneId, sceneVersion } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const sceneIdNum = validateId(sceneId);
  if (!sceneIdNum) {
    res.status(400).json({error: "Missing or invalid sceneId parameter."});
    return;
  }
  const sceneVersionNum = validateId(sceneVersion);
  if (!sceneVersionNum) {
    res.status(400).json({error: "Missing or invalid sceneVersion parameter."});
    return;
  }
  const nextVersion = getNextVersion(sceneIdNum, sceneVersionNum) || sceneVersionNum;
  res.status(200).json({ nextVersion });
});

sceneRouter.get("/:sceneId/latestVersion", async (req: Request, res: Response) => {
  const { storyId, sceneId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const sceneIdNum = validateId(sceneId);
  if (!sceneIdNum) {
    res.status(400).json({error: "Missing or invalid sceneId parameter."});
    return;
  }
  const latestVersion = getLatestVersion(sceneIdNum);
  if (latestVersion === null) {
    res.status(404).json({error: "Scene not found."});
    return;
  }
  res.status(200).json({ latestVersion });
});

sceneRouter.get("/adjacent", async (req: Request, res: Response) => {
  const { storyId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const sceneOrder = getNextSceneOrder(storyIdNum);
  const previousScene = getPreviousScene(storyIdNum, sceneOrder);
  const nextScene = getNextScene(storyIdNum, sceneOrder);
  res.status(200).json({
    previousScene: previousScene ? {
      id: previousScene.id,
      version: previousScene.version,
      title: previousScene.title,
      sceneText: previousScene.scene_text,
    } : null,
    nextScene: nextScene ? {
      id: nextScene.id,
      version: nextScene.version,
      title: nextScene.title,
      sceneText: nextScene.scene_text,
    } : null,
  });
});

/*
curl -X POST http://localhost:3000/api/story/123/scene \
-H "Content-Type: application/json" \
-d '{"storyId":"123","writingStyleSamples":["It was a dark and stormy night.","The quick brown fox jumps over the lazy dog."],"description":"A mysterious figure appears in the village.","characters":["Alice","Bob"],"plotPoints":["A mysterious figure arrives","The villagers react to the newcomer"], "pointOfView":"Third Person","location":"Village"}'
*/
sceneRouter.post("/", async (req: Request, res: Response) => {
  if (!req.body) {
    return res.status(400).json({error: "Missing request body."});
  }
  const { storyId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return
  }
  const {
    overview,
    title,
    pov,
    location,
    tone,
    additionalNotes,
    connectedCharacterIds,
    connectedPlotPointIds,
    connectedWritingStyleSampleIds,
    includePreviousScene,
    includeNextScene,
    model,
  } = req.body;
  if (!title) {
    res.status(400).json({error: "Scene title is required."});
    return;
  }
  if (!overview && (!connectedPlotPointIds || !connectedPlotPointIds.length)) {
    res.status(400).json({error: "Scene overview or connected plot points are required."});
    return;
  }
  const overviewString = `${overview ?? ""}`.toString();
  const titleString = `${title ?? ""}`.toString();
  const povString = `${pov ?? ""}`.toString();
  const locationString = `${location ?? ""}`.toString();
  const toneString = `${tone ?? ""}`.toString();
  const additionalNotesString = `${additionalNotes ?? ""}`.toString();
  const sceneOrder = getNextSceneOrder(storyIdNum);
  const plotPoints = getPlotPointInfo(connectedPlotPointIds).map((pp) => Object.entries(pp).map(([key, value]) => `${key}: ${value}`).join(", ")).join("; ");
  const characters = getCharacterInfo(connectedCharacterIds).map((char) => Object.entries(char).map(([key, value]) => `${key}: ${value}`).join(", ")).join("; ");
  const writingStyleSamples = getWritingStyleSampleInfo(connectedWritingStyleSampleIds).map((sample) => Object.entries(sample).map(([key, value]) => `${key}: ${value}`).join(", ")).join("; ");
  const previousSceneText = !!includePreviousScene ? getPreviousScene(storyIdNum, sceneOrder)?.scene_text || "" : "";
  const nextSceneText = !!includeNextScene ? getNextScene(storyIdNum, sceneOrder)?.scene_text || "" : "";
  const { text } = await generateScene(writingStyleSamples, overviewString, characters, plotPoints, povString, locationString, toneString, previousSceneText, nextSceneText, model);
  const { sceneId } = createNewScene(storyIdNum, null, 1, overviewString, text, sceneOrder, titleString, povString, locationString, toneString, additionalNotesString, connectedCharacterIds, connectedPlotPointIds);
  res.status(201).json({ sceneId, version: 1 });
});

sceneRouter.post("/:sceneId/version/:sceneVersion/regenerate", async (req: Request, res: Response) => {
  if (!req.body) {
    return res.status(400).json({error: "Missing request body."});
  }
  const { storyId, sceneId, sceneVersion } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return
  }
  const sceneIdNum = validateId(sceneId);
  if (!sceneIdNum) {
    res.status(400).json({error: "Missing or invalid sceneId parameter."});
    return;
  }
  const sceneVersionNum = validateId(sceneVersion);
  if (!sceneVersionNum) {
    res.status(400).json({error: "Missing or invalid sceneVersion parameter."});
    return;
  }
  const {
    overview,
    title,
    pov,
    location,
    tone,
    includePreviousScene,
    includeNextScene,
    additionalNotes,
    connectedCharacterIds,
    connectedPlotPointIds,
    connectedWritingStyleSampleIds,
    model,
  } = req.body;
  if (!title) {
    res.status(400).json({error: "Scene title is required."});
    return;
  }
  if (!overview && (!connectedPlotPointIds?.length)) {
    res.status(400).json({error: "Scene overview or connected plot points are required."});
    return;
  }
  const overviewString = `${overview ?? ""}`.toString();
  const titleString = `${title ?? ""}`.toString();
  const povString = `${pov ?? ""}`.toString();
  const locationString = `${location ?? ""}`.toString();
  const toneString = `${tone ?? ""}`.toString();
  const additionalNotesString = `${additionalNotes ?? ""}`.toString();
  const sceneData = getScene(sceneIdNum, sceneVersionNum)["scene"];
  if (!sceneData) {
    res.status(404).json({error: "Scene or version not found."});
    return;
  }
  const sceneOrder = sceneData.scene_order;
  const plotPoints = getPlotPointInfo(connectedPlotPointIds).map((pp) => Object.entries(pp).map(([key, value]) => `${key}: ${value}`).join(", ")).join("; ");
  const characters = getCharacterInfo(connectedCharacterIds).map((char) => Object.entries(char).map(([key, value]) => `${key}: ${value}`).join(", ")).join("; ");
  const writingStyleSamples = getWritingStyleSampleInfo(connectedWritingStyleSampleIds).map((sample) => Object.entries(sample).map(([key, value]) => `${key}: ${value}`).join(", ")).join("; ");
  const previousSceneText = !!includePreviousScene ? getPreviousScene(storyIdNum, sceneOrder)?.scene_text || "" : "";
  const nextSceneText = !!includeNextScene ? getNextScene(storyIdNum, sceneOrder)?.scene_text || "" : "";
  const { text } = await generateScene(writingStyleSamples, overviewString, characters, plotPoints, povString, locationString, toneString, previousSceneText, nextSceneText, model);
  const latestVersion = getLatestVersion(sceneIdNum);
  if (latestVersion === null) {
    res.status(404).json({error: "Scene not found."});
    return;
  }
  const newVersion = latestVersion + 1;
  createNewScene(storyIdNum, sceneIdNum, newVersion, overviewString, text, sceneOrder, titleString, povString, locationString, toneString, additionalNotesString, connectedCharacterIds, connectedPlotPointIds);
  res.status(201).json({ sceneId, version: newVersion });
});

sceneRouter.put("/:sceneId/version/:sceneVersion", async (req: Request, res: Response) => {
  const { storyId, sceneId, sceneVersion } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const sceneIdNum = validateId(sceneId);
  if (!sceneIdNum) {
    res.status(400).json({error: "Missing or invalid sceneId parameter."});
    return;
  }
  const sceneVersionNum = validateId(sceneVersion);
  if (!sceneVersionNum) {
    res.status(400).json({error: "Missing or invalid sceneVersion parameter."});
    return;
  }
  const { generatedText, overview, title, pov, location, tone, additionalNotes, connectedCharacterIds, connectedPlotPointIds} = req.body;
  if (!generatedText) {
    res.status(400).json({error: "Missing required fields: generatedText."});
    return;
  }
  if (!connectedCharacterIds || !Array.isArray(connectedCharacterIds)) {
    res.status(400).json({error: "connectedScenes must be an array of numbers."});
    return;
  }
  if (!connectedPlotPointIds || !Array.isArray(connectedPlotPointIds)) {
    res.status(400).json({error: "connectedScenes must be an array of numbers."});
    return;
  }
  const sceneTextString = generatedText.toString().trim();
  const overviewString = `${overview ?? ""}`.toString().trim();
  const titleString = `${title ?? ""}`.toString().trim();
  const povString = `${pov ?? ""}`.toString().trim();
  const locationString = `${location ?? ""}`.toString().trim();
  const toneString = `${tone ?? ""}`.toString().trim();
  const additionalNotesString = `${additionalNotes ?? ""}`.toString().trim();
  updateScene(sceneIdNum, sceneVersionNum, overviewString, sceneTextString, titleString, povString, locationString, toneString, additionalNotesString, connectedCharacterIds, connectedPlotPointIds);
  res.status(200).json({});
});

sceneRouter.delete("/:sceneId/version/:sceneVersion", async (req: Request, res: Response) => {
  const { storyId, sceneId, sceneVersion } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const sceneIdNum = validateId(sceneId);
  if (!sceneIdNum) {
    res.status(400).json({error: "Missing or invalid sceneId parameter."});
    return;
  }
  const sceneVersionNum = validateId(sceneVersion);
  if (!sceneVersionNum) {
    res.status(400).json({error: "Missing or invalid sceneVersion parameter."});
    return;
  }
  deleteScene(sceneIdNum, sceneVersionNum);
  res.status(204).json({});
});

sceneRouter.patch("/reorder", async (req: Request, res: Response) => {
  const { storyId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({ error: "Missing or invalid storyId parameter." });
    return;
  }
  const { scenes } = req.body;
  if (!scenes || !Array.isArray(scenes)) {
    res.status(400).json({ error: "scenes must be an array." });
    return;
  }
  for (const scene of scenes) {
    if (typeof scene.sceneId !== "number" || typeof scene.newOrder !== "number") {
      res.status(400).json({
        error: "Each scene must have sceneId (number) and newOrder (number).",
      });
      return;
    }
    if (scene.newOrder < 1) {
      res.status(400).json({ error: "newOrder must be at least 1." });
      return;
    }
  }
  updateSceneOrders(storyIdNum, scenes);
  res.status(200).json({});
});

export default sceneRouter;