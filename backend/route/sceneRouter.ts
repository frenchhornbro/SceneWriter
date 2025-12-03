import { Router } from "express";
import { generateScene } from "../model/model";

const sceneRouter = Router();

/*
curl -X POST http://localhost:3000/api/scene \
-H "Content-Type: application/json" \
-d '{"storyId":"123","writingStyleSamples":["It was a dark and stormy night.","The quick brown fox jumps over the lazy dog."],"description":"A mysterious figure appears in the village.","characters":["Alice","Bob"],"plotPoints":["A mysterious figure arrives","The villagers react to the newcomer"], "pointOfView":"Third Person","location":"Village"}'
*/
sceneRouter.post("/", async (req, res) => {
  // QQQ: Do I want to send the user the text, or save it in the DB and have them pull from there?
  if (!req.body) {
    return res.status(400).json({error: "Missing request body."});
  }
  const {
    storyId,
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

sceneRouter.delete("/:sceneId", async (req, res) => {
  res.status(501).json({error: "Not implemented."});
});

export default sceneRouter;