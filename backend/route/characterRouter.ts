import { Request, Response, Router } from "express";

const characterRouter = Router({ mergeParams: true });

characterRouter.post("/", async (req: Request, res: Response) => {
  const { storyId } = req.params;
  res.status(501).json({error: "Not implemented."});
});

characterRouter.delete("/:characterId", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

export default characterRouter;