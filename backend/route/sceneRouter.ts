import { Request, Response, Router } from "express";
import { generateScene } from "../ai/model";
import { validateId } from "./routerUtils";
import { createNewScene, getCharacterInfo, getNextSceneOrder, getPlotPointInfo, getWritingStyleSampleInfo } from "../data-access/sceneDataAccess";

const sceneRouter = Router({ mergeParams: true });

sceneRouter.get("/", async (req: Request, res: Response) => {
  // TODO: Return actual data from the DB
  res.status(200).json({
    scenes: [
      {
        id: 1,
        title: "Sample Scene 1",
        sceneTextPage: "This is sample scene text of scene 1.",
        chapterNumber: 1,
        editedAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Sample Scene 2",
        sceneTextPage: "This is sample scene text of scene 2.",
        chapterNumber: 1,
        editedAt: new Date().toISOString(),
      },
    ],
  });
});

sceneRouter.get("/:sceneId", async (req: Request, res: Response) => {
  const { storyId, sceneId } = req.params;
  // TODO: Return actual data from the DB
  res.status(200).json({
    id: sceneId,
    storyId: storyId,
    storyTitle: "Sample Story Title",
    sceneId: sceneId,
    version: 1,
    sceneText: "This is the sample text of the scene.\nThis is the second paragraph of the scene.",
    overview: "This is a sample overview of the scene.",
    order: 1,
    chapterNumber: 1,
    title: "Sample Scene Title",
    pov: "Third Person",
    location: "Sample Location",
    connectedCharacterIds: [1, 2],
    connectedPlotPointIds: [1, 2],
    connectedWritingStyleSampleIds: [1, 2],
    tone: "Suspenseful",
    additionalNotes: "These are some sample additional notes about the scene.",
    createdAt: new Date().toISOString(),
    editedAt: new Date().toISOString(),
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
  const { sceneId } = createNewScene(storyIdNum, null, 1, overviewString, text, sceneOrder, titleString, povString, locationString, toneString, additionalNotesString, connectedCharacterIds, connectedPlotPointIds);
  res.status(201).json({ sceneId, version: 1 });
});

sceneRouter.post("/:sceneId/regenerate", async (req: Request, res: Response) => {
  // QQQ: Do I want to send the user the text, or save it in the DB and have them pull from there?
  if (!req.body) {
    return res.status(400).json({error: "Missing request body."});
  }
  const { storyId, sceneId } = req.params;
  const {
    overview,
    connectedCharacterIds,
    connectedPlotPointIds,
    connectedWritingStyleSampleIds,
    pointOfView,
    location
  } = req.body;
  if (!overview && (!connectedPlotPointIds || !connectedPlotPointIds.length)) {
    return res.status(400).json({error: "Scene overview or connected plot points are required."});
  }
  const plotPoints = ["TODO: Get from DB based on connectedPlotPointIds"];
  const characters = ["TODO: Get from DB based on connectedCharacterIds"];
  const writingStyleSamples = ["TODO: Get from DB based on connectedWritingStyleSampleIds"];
  // TODO: Pass in POV and location to influence generation
  const { text } = await generateScene(writingStyleSamples, overview, characters, plotPoints);
  console.log(text);
  // TODO: Create a new scene and return the sceneID (so the user can be routed to the created scene page)
  res.status(201).json({ sceneId });
});

sceneRouter.put("/:sceneId", async (req: Request, res: Response) => {
  const { storyId, sceneId } = req.params;
  res.status(501).json({error: "Not implemented."});
});

sceneRouter.delete("/:sceneId", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

export default sceneRouter;