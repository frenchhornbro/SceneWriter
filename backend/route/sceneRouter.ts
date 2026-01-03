import { Request, Response, Router } from "express";
import { generateScene } from "../ai/prompts";
import { validateId } from "./routerUtils";
import { createNewScene, deleteScene, getAllScenes, getCharacterInfo, getLatestVersion, getNextScene, getNextSceneOrder, getNextVersion, getPlotPointInfo, getPreviousScene, getPreviousVersion, getScene, getWritingStyleSampleInfo, updateScene } from "../data-access/sceneDataAccess";
import { getStory } from "../data-access/storyDataAccess";
import type { scenePreview } from "@shared/templates/scene";

const sceneRouter = Router({ mergeParams: true });

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
    chapter_number: scene.chapter_number,
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
    chapterNumber: scene.chapter_number,
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
    chapterNumber,
    pov,
    location,
    tone,
    additionalNotes,
    connectedCharacterIds,
    connectedPlotPointIds,
    connectedWritingStyleSampleIds,
  } = req.body;
  if (!overview && (!connectedPlotPointIds || !connectedPlotPointIds.length)) {
    return res.status(400).json({error: "Scene overview or connected plot points are required."});
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
  const previousSceneText = getPreviousScene(storyIdNum, sceneOrder)?.scene_text || "";
  const nextSceneText = getNextScene(storyIdNum, sceneOrder)?.scene_text || "";
  const { text } = await generateScene(writingStyleSamples, overviewString, characters, plotPoints, povString, locationString, toneString, previousSceneText, nextSceneText);
  const { sceneId } = createNewScene(storyIdNum, null, 1, overviewString, text, sceneOrder, chapterNumber, titleString, povString, locationString, toneString, additionalNotesString, connectedCharacterIds, connectedPlotPointIds);
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
    chapterNumber,
    pov,
    location,
    tone,
    additionalNotes,
    connectedCharacterIds,
    connectedPlotPointIds,
    connectedWritingStyleSampleIds,
  } = req.body;
  if (!overview && (!connectedPlotPointIds?.length)) {
    return res.status(400).json({error: "Scene overview or connected plot points are required."});
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
  const previousSceneText = getPreviousScene(storyIdNum, sceneOrder)?.scene_text || "";
  const nextSceneText = getNextScene(storyIdNum, sceneOrder)?.scene_text || "";
  const { text } = await generateScene(writingStyleSamples, overviewString, characters, plotPoints, povString, locationString, toneString, previousSceneText, nextSceneText);
  const latestVersion = getLatestVersion(sceneIdNum);
  if (latestVersion === null) {
    res.status(404).json({error: "Scene not found."});
    return;
  }
  const newVersion = latestVersion + 1;
  createNewScene(storyIdNum, sceneIdNum, newVersion, overviewString, text, sceneOrder, chapterNumber, titleString, povString, locationString, toneString, additionalNotesString, connectedCharacterIds, connectedPlotPointIds);
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

export default sceneRouter;