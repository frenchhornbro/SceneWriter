import { Request, Response, Router } from "express";
import { createNewWritingStyleSample, deleteWritingStyleSample, getAllWritingStyleSamples, getWritingStyleSample, updateWritingStyleSample } from "../data-access/writingStyleDataAccess";
import { generatePrompt } from "../ai/model";
import { validateId } from "./routerUtils";

const writingStyleRouter = Router();

writingStyleRouter.get("/", (req: Request, res: Response) => {
  const writingStyleSamples = getAllWritingStyleSamples();
  const writingStyleSamplesWithContentPage = writingStyleSamples.map(sample => {
    return {
      id: sample.id,
      title: sample.title,
      prompt: sample.prompt,
      contentPage: sample.content.length > 200 ? sample.content.substring(0, 200) + "..." : sample.content,
      wordCount: sample.word_count,
      createdAt: sample.created_at,
      editedAt: sample.edited_at,
    };
  });
  res.status(200).json({ writingStyleSamples: writingStyleSamplesWithContentPage });
});

writingStyleRouter.get("/prompt", async (req: Request, res: Response) => {
  const { text } = await generatePrompt();
  res.status(200).json({ prompt: text });
});

writingStyleRouter.get("/:writingStyleId", (req: Request, res: Response) => {
  const { writingStyleId } = req.params;
  const id = validateId(writingStyleId);
  if (!id) {
    res.status(400).json({error: "Missing or invalid writingStyleId parameter."});
    return;
  }
  const writingStyleSample = getWritingStyleSample(id);
  if (!writingStyleSample) {
    res.status(404).json({error: "Writing style sample not found."});
    return;
  }
  res.status(200).json({
    id: writingStyleSample.id,
    title: writingStyleSample.title,
    prompt: writingStyleSample.prompt,
    content: writingStyleSample.content,
    wordCount: writingStyleSample.word_count,
    createdAt: writingStyleSample.created_at,
    editedAt: writingStyleSample.edited_at,
  });
});

writingStyleRouter.post("/", (req: Request, res: Response) => {
  const { title, prompt, content } = req.body;
  if (!prompt || !content) {
    res.status(400).json({error: "Missing required fields: prompt, content."});
    return;
  }
  const titleString = `${title ?? ""}`.trim();
  const promptString = prompt.toString().trim();
  const contentString = content.toString().trim();
  const wordCount = contentString.split(/\s+/).length;
  const writingStyleId = createNewWritingStyleSample(titleString, promptString, contentString, wordCount);
  res.status(201).json({ writingStyleId });
});

writingStyleRouter.put("/:writingStyleId", (req: Request, res: Response) => {
  const { writingStyleId } = req.params;
  const { title, content } = req.body;
  const id = validateId(writingStyleId);
  if (!id) {
    res.status(400).json({error: "Missing or invalid writingStyleId parameter."});
    return;
  }
  if (!content) {
    res.status(400).json({error: "Missing required fields: content."});
    return;
  }
  const titleString = `${title ?? ""}`.trim();
  const contentString = content.toString().trim();
  const wordCount = contentString.split(/\s+/).length;
  updateWritingStyleSample(id, titleString, contentString, wordCount);
  res.status(200).json({});
});

writingStyleRouter.delete("/:writingStyleId", (req: Request, res: Response) => {
  const { writingStyleId } = req.params;
  const id = validateId(writingStyleId);
  if (!id) {
    res.status(400).json({error: "Missing or invalid writingStyleId parameter."});
    return;
  }
  deleteWritingStyleSample(id);
  res.status(204).json({});
});

export default writingStyleRouter;