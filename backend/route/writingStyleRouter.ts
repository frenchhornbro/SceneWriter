import { Request, Response, Router } from "express";
import { createNewWritingStyleSample } from "../data-access/writingStyleDataAcess";

const writingStyleRouter = Router();

writingStyleRouter.get("/", async (req: Request, res: Response) => {
  // TODO: Return actual data from the DB (Stop at the first newline after content, or 500 characters, whichever comes first)
  res.status(200).json({
    writingStyles: [
      {
        id: 1,
        title: "Sample Writing Style 1",
        prompt: "This is a sample prompt for writing style 1.",
        contentPage: "This is the sample content of writing style 1.\nThis is the second paragraph.",
        wordCount: 321,
        editedAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Sample Writing Style 2",
        prompt: "This is a sample prompt for writing style 2.",
        contentPage: "This is the sample content of writing style 2.\nThis is the second paragraph.",
        wordCount: 654,
        editedAt: new Date().toISOString(),
      }
    ],
  });
});

writingStyleRouter.get("/prompt", async (req: Request, res: Response) => {
  // TODO: Generate a prompt with AI
  res.status(200).json({
    prompt: "Write a scene where your protagonist takes on a leadership role for the first time.",
  });
});

writingStyleRouter.get("/:writingStyleId", async (req: Request, res: Response) => {
  const { writingStyleId } = req.params;
  // TODO: Return actual data from the DB
  res.status(200).json({
    id: writingStyleId,
    title: "Sample Writing Style",
    prompt: "This is a sample prompt for the writing style.",
    content: "This is the sample content of the writing style.\nThis is the second paragraph.",
    wordCount: 12345,
    createdAt: new Date().toISOString(),
    editedAt: new Date().toISOString(),
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
  // TODO: Update the DB
  res.status(501).json({error: "Not implemented."});
});

writingStyleRouter.delete("/:writingStyleId", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

export default writingStyleRouter;