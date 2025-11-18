import { Router } from "express";
import { generateScene } from "../model/model";

const sceneRouter = Router();

/*
curl -X POST http://localhost:3000/api/scene \
-H "Content-Type: application/json" \
-d '{"writingStyleExamples":["It was a dark and stormy night.","The quick brown fox jumps over the lazy dog."],"sceneDescription":"A mysterious figure appears in the village.","characters":["Alice","Bob"],"plotPoints":["A mysterious figure arrives","The villagers react to the newcomer"]}'
*/
sceneRouter.post("/", async (req, res) => {
  // TODO: Expect auth token in headers
  // QQQ: Do I want to send the user the text, or save it in the DB and have them pull from there?
  if (!req.body) {
    return res.status(400).send("Missing request body.");
  }
  const { writingStyleExamples, sceneDescription, characters, plotPoints } = req.body;
  if (!sceneDescription) {
    return res.status(400).send("Missing scene description.");
  }
  if (!plotPoints) {
    return res.status(400).send("Missing plot points.");
  }
  const { sceneText } = await generateScene(writingStyleExamples, sceneDescription, characters, plotPoints);
  res.status(200).json({ scene: sceneText });
});

export default sceneRouter;