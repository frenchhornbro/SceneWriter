import { Request, Response, Router } from "express";
import { createNewWritingStyleSample, deleteWritingStyleSample, getAllWritingStyleSamples, getWritingStyleSample, updateWritingStyleSample } from "../data-access/writingStyleDataAcess";

const writingStyleRouter = Router();

writingStyleRouter.get("/", async (req: Request, res: Response) => {
  const writingStyleSamples = await getAllWritingStyleSamples();
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
  // TODO: Generate a prompt with AI
  res.status(200).json({
    prompt: "Write a scene where your protagonist takes on a leadership role for the first time.",
  });
});

writingStyleRouter.get("/:writingStyleId", async (req: Request, res: Response) => {
  const { writingStyleId } = req.params;
  const id = Number(writingStyleId);
  if (!id) {
    res.status(400).json({error: "Missing or invalid writingStyleId parameter."});
    return;
  }
  const writingStyleSample = await getWritingStyleSample(id);
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

writingStyleRouter.post("/", async (req: Request, res: Response) => {
  const { title, prompt, content } = req.body;
  if (!title || !prompt || !content) {
    res.status(400).json({error: "Missing required fields: title, prompt, content."});
    return;
  }
  const titleString = title.toString().trim();
  const promptString = prompt.toString().trim();
  const contentString = content.toString().trim();
  const wordCount = contentString.split(/\s+/).length;
  const writingStyleId = await createNewWritingStyleSample(titleString, promptString, contentString, wordCount);
  res.status(201).json({ writingStyleId });
});

writingStyleRouter.put("/:writingStyleId", async (req: Request, res: Response) => {
  const { writingStyleId } = req.params;
  const { title, content } = req.body;
  const id = Number(writingStyleId);
  if (!id) {
    res.status(400).json({error: "Missing or invalid writingStyleId parameter."});
    return;
  }
  if (!title || !content) {
    res.status(400).json({error: "Missing required fields: title, content."});
    return;
  }
  const titleString = title.toString().trim();
  const contentString = content.toString().trim();
  const wordCount = contentString.split(/\s+/).length;
  await updateWritingStyleSample(id, titleString, contentString, wordCount);
  res.status(200).json({});
});

writingStyleRouter.delete("/:writingStyleId", async (req: Request, res: Response) => {
  const { writingStyleId } = req.params;
  const id = Number(writingStyleId);
  if (!id) {
    res.status(400).json({error: "Missing or invalid writingStyleId parameter."});
    return;
  }
  await deleteWritingStyleSample(id);
  res.status(200).json({});
});

export default writingStyleRouter;