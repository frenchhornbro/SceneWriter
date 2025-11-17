import { Router } from "express";

const sceneRouter = Router();

sceneRouter.post("/", (req, res) => {
  // TODO: Expect auth token in headers
  // QQQ: Do I want to send the user the text, or save it in the DB and have them pull from there?

  const { writingStyleExamples, sceneDescription, characters, plotPoints } = req.body;
  if (!sceneDescription) {
    return res.status(400).send("Missing scene description.");
  }
  if (!plotPoints) {
    return res.status(400).send("Missing plot points.");
  }
  const sceneText = ""; // TODO: Talk to model
  res.status(200).json({scene: sceneText});
});

export default sceneRouter;