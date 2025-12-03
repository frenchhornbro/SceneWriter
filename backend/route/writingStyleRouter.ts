import { Request, Response, Router } from "express";

const writingStyleRouter = Router();

writingStyleRouter.get("/", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

writingStyleRouter.get("/:writingStyleId", async (req: Request, res: Response) => {
  const { writingStyleId } = req.params;
  res.status(501).json({error: "Not implemented."});
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