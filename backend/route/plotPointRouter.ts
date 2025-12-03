import { Request, Response, Router } from "express";

const plotPointRouter = Router({ mergeParams: true });

plotPointRouter.get("/", async (req: Request, res: Response) => {
  const { storyId } = req.params;
  res.status(501).json({error: "Not implemented."});
});

plotPointRouter.get("/:plotPointId", async (req: Request, res: Response) => {
  const { storyId, plotPointId } = req.params;
  res.status(501).json({error: "Not implemented."});
});

plotPointRouter.post("/", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

plotPointRouter.put("/:plotPointId", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

plotPointRouter.delete("/:plotPointId", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

export default plotPointRouter;