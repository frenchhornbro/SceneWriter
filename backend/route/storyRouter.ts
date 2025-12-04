import { Request, Response, Router } from "express";

const storyRouter = Router();

storyRouter.get("/", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

storyRouter.get("/:storyId", async (req: Request, res: Response) => {
  const { storyId } = req.params;
  res.status(200).json({
    id: storyId,
    title: "Sample Story Title",
    subtitle: "Sample Story Subtitle",
    overview: "This is a sample overview of the story.",
    editedAt: new Date().toISOString(),
  })
});

storyRouter.get("/:storyId/export", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

storyRouter.post("/", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

storyRouter.put("/:storyId", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

storyRouter.delete("/:storyId", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

export default storyRouter;