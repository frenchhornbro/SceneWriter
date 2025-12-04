import { Request, Response, Router } from "express";
import { generateScene } from "../model/model";

const sceneRouter = Router({ mergeParams: true });

sceneRouter.get("/", async (req: Request, res: Response) => {
  const { storyId } = req.params;
  res.status(501).json({error: "Not implemented."});
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
    characters: [
      {
        id: 1,
        name: "Alice",
      },
      {
        id: 2,
        name: "Bob"
      }
    ],
    plotPoints: [
      {
        id: 1,
        startingText: "A mysterious figure arrives",
      },
      {
        id: 2,
        startingText: "The villagers react to the newcomer"
      }
    ],
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
  // QQQ: Do I want to send the user the text, or save it in the DB and have them pull from there?
  if (!req.body) {
    return res.status(400).json({error: "Missing request body."});
  }
  const { storyId } = req.params;
  const {
    writingStyleSamples,
    description,
    characters,
    plotPoints,
    pointOfView,
    location
  } = req.body;
  if (!description) {
    return res.status(400).json({error: "Missing scene description."});
  }
  if (!plotPoints) {
    return res.status(400).json({error: "Missing plot points."});
  }
  // TODO: Pass in POV and location to influence generation
  const { sceneText } = await generateScene(writingStyleSamples, description, characters, plotPoints);
  // TODO: Create a new scene and return the sceneID (so the user can be routed to the created scene page)
  res.status(200).json({ scene: sceneText });
});

sceneRouter.post("/:sceneId/regenerate", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

sceneRouter.put("/:sceneId", async (req: Request, res: Response) => {
  const { storyId, sceneId } = req.params;
  res.status(501).json({error: "Not implemented."});
});

sceneRouter.delete("/:sceneId", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

export default sceneRouter;