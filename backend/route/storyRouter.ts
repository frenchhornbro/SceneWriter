import { Request, Response, Router } from "express";
import { createNewStory, deleteStory, getAllStories, getStory, updateStory } from "../data-access/storyDataAccess";
import { validateId } from "./routerUtils";

const storyRouter = Router();

storyRouter.get("/", async (req: Request, res: Response) => {
  const stories = getAllStories();
  const storiesWithPages = stories.map((story: any) => ({
    id: story.id,
    title: story.title,
    subtitle: story.subtitle,
    overview: story.overview,
    storyPage: story.overview.length > 200 ? story.overview.substring(0, 200) + "..." : story.overview, //TODO: Compile this from scene text, according to order
    editedAt: story.editedAt,
    createdAt: story.createdAt,
  }));
  res.status(200).json({ stories: storiesWithPages });
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
  const { storyId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const { title, subtitle, overview } = req.body;
  if (!title) {
    res.status(400).json({ error: "Title is required." });
    return;
  }
  const titleString = title.toString().trim();
  const subtitleString = `${subtitle ?? ""}`.toString().trim();
  const overviewString = `${overview ?? ""}`.toString().trim();
  updateStory(storyIdNum, titleString, subtitleString, overviewString);
  res.status(200).json({});
});

storyRouter.delete("/:storyId", async (req: Request, res: Response) => {
  const { storyId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  deleteStory(storyIdNum);
  res.status(204).json({});
});

export default storyRouter;