import { Request, Response, Router } from "express";

const plotPointRouter = Router({ mergeParams: true });

plotPointRouter.get("/", async (req: Request, res: Response) => {
  const { storyId } = req.params;
  res.status(501).json({error: "Not implemented."});
});

plotPointRouter.get("/:plotPointId", async (req: Request, res: Response) => {
  const { storyId, plotPointId } = req.params;
  res.status(200).json({
    id: plotPointId,
    storyId: storyId,
    storyTitle: "Sample Story Title",
    title: "Sample Plot Point",
    description: "This is a sample description of the plot point.",
    connectedScenes: [
      { id: 1, title: "Sample Scene 1" },
      { id: 2, title: "Sample Scene 2" },
    ],
    connectedCharacters: [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ],
    createdAt: new Date().toISOString(),
    editedAt: new Date().toISOString(),
  });
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