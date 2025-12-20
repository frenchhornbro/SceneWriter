import { Request, Response, Router } from "express";
import { generateScene } from "../ai/prompts";
import { validateId } from "./routerUtils";
import { createNewScene, deleteScene, getAllScenes, getCharacterInfo, getNextSceneOrder, getPlotPointInfo, getScene, getWritingStyleSampleInfo } from "../data-access/sceneDataAccess";
import { getStory } from "../data-access/storyDataAccess";

const sceneRouter = Router({ mergeParams: true });

sceneRouter.get("/", async (req: Request, res: Response) => {
  const { storyId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const scenes = getAllScenes(storyIdNum);
  const scenesWithTextPage = scenes.map((scene: any) => ({
    id: scene.id,
    title: scene.title,
    sceneTextPage: scene.sceneText.length > 200 ? scene.sceneText.substring(0, 200) + "..." : scene.sceneText,
    chapterNumber: scene.chapterNumber,
    editedAt: scene.editedAt,
    createdAt: scene.createdAt,
  }));

  res.status(200).json({ scenes: scenesWithTextPage });
});

sceneRouter.get("/:sceneId", async (req: Request, res: Response) => {
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
  const { title } = getStory(storyIdNum);
  const sceneData = getScene(sceneIdNum);
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
  const { text } = await generateScene(writingStyleSamples, overviewString, characters, plotPoints, povString, locationString, toneString);
  console.log("repsonse text = ", text);
  const { sceneId } = createNewScene(storyIdNum, null, 1, overviewString, text, sceneOrder, chapterNumber, titleString, povString, locationString, toneString, additionalNotesString, connectedCharacterIds, connectedPlotPointIds);
  res.status(201).json({ sceneId, version: 1 });
});

sceneRouter.post("/:sceneId/regenerate", async (req: Request, res: Response) => {
  // TODO: Keep the same scene ID but create a new version
  if (!req.body) {
    return res.status(400).json({error: "Missing request body."});
  }
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
  const { overview, connectedCharacterIds, connectedPlotPointIds, connectedWritingStyleSampleIds, pointOfView, location } = req.body;
  if (!overview && (!connectedPlotPointIds || !connectedPlotPointIds.length)) {
    res.status(400).json({error: "Scene overview or connected plot points are required."});
    return;
  }
  // const plotPoints = [];
  // const characters = [];
  // const writingStyleSamples = [];
  // TODO: Pass in POV and location to influence generation
  // const { text } = await generateScene(writingStyleSamples, overview, characters, plotPoints);
  // console.log(text);
  // TODO: Create a new scene and return the sceneID (so the user can be routed to the created scene page)
  res.status(201).json({ sceneId });
});

sceneRouter.put("/:sceneId", async (req: Request, res: Response) => {
  const { storyId, sceneId } = req.params;
  res.status(501).json({error: "Not implemented."});
});

sceneRouter.delete("/:sceneId", async (req: Request, res: Response) => {
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
  deleteScene(sceneIdNum);
  res.status(204).json({});
});

export default sceneRouter;