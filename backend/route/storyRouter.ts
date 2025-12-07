import { Request, Response, Router } from "express";
import { createNewStory, getStory } from "../data-access/storyDataAccess";
import { validateId } from "./routerUtils";

const storyRouter = Router();

storyRouter.get("/", async (req: Request, res: Response) => {
  // TODO: Return actual data from the DB
  res.status(200).json({
    stories: [
      {
        id: 1,
        title: "Sample Story Title 1",
        subtitle: "Sample Story Subtitle 1",
        overview: "This is a sample overview of story 1. It has multiple sentences to give a better idea of the story content.",
        storyPage: "This is sample content for story 1. It has multiple sentences to simulate a real story content page.",
        editedAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Sample Story Title 2",
        subtitle: "Sample Story Subtitle 2",
        overview: "This is a sample overview of story 2. It has multiple sentences to give a better idea of the story content.",
        storyPage: "This is sample content for story 2. It has multiple sentences to simulate a real story content page.",
        editedAt: new Date().toISOString(),
      },
    ],
  });
});

storyRouter.get("/:storyId", async (req: Request, res: Response) => {
  const { storyId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const storyData = getStory(storyIdNum);
  if (!storyData) {
    res.status(404).json({error: "Story not found."});
    return;
  }
  res.status(200).json({
    id: storyId,
    title: storyData.title,
    subtitle: storyData.subtitle,
    overview: storyData.overview,
    createdAt: storyData.created_at,
    editedAt: storyData.edited_at,
  })
});

storyRouter.get("/:storyId/export", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

storyRouter.post("/", async (req: Request, res: Response) => {
  const { title, subtitle, overview } = req.body;
  if (!title) {
    res.status(400).json({ error: "Title is required." });
    return;
  }
  const titleString = title.toString();
  const subtitleString = `${subtitle ?? ""}`.toString();
  const overviewString = `${overview ?? ""}`.toString();
  const storyId = createNewStory(titleString, subtitleString, overviewString);
  res.status(201).json({ storyId });
});

storyRouter.put("/:storyId", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

storyRouter.delete("/:storyId", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

export default storyRouter;