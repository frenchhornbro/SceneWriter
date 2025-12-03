import { Request, Response, Router } from "express";

const writingStyleRouter = Router();

writingStyleRouter.get("/", async (req: Request, res: Response) => {
  // TODO: Return just the titles, ids, first 50 chars / words of content, editedAt
  res.status(501).json({error: "Not implemented."});
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
  res.status(501).json({error: "Not implemented."});
});

writingStyleRouter.put("/:writingStyleId", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

writingStyleRouter.delete("/:writingStyleId", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

export default writingStyleRouter;