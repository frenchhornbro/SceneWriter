import { Request, Response, Router } from "express";
import { validateId } from "./routerUtils";
import { createNewPlotPoint, deletePlotPoint, getAllPlotPoints, getPlotPoint, updatePlotPoint } from "../data-access/plotPointDataAccess";
import { getStory } from "../data-access/storyDataAccess";
import { scenePreview } from "@shared/templates/scene";

const plotPointRouter = Router({ mergeParams: true });

plotPointRouter.get("/", async (req: Request, res: Response) => {
  const { storyId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const plotPoints = getAllPlotPoints(storyIdNum);
  const plotPointsWithDescriptionPage = plotPoints.map((pp: any) => ({
    id: pp.id,
    title: pp.title,
    descriptionPage: pp.description.length > 50 ? pp.description.split(/\s+/).slice(0, 50).join(" ") + (pp.description.split(/\s+/).length > 50 ? "..." : "") : pp.description,
    editedAt: pp.editedAt,
    createdAt: pp.createdAt,
  }));
  res.status(200).json({ plotPoints: plotPointsWithDescriptionPage });
});

plotPointRouter.get("/:plotPointId", async (req: Request, res: Response) => {
  const { storyId, plotPointId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const plotPointIdNum = validateId(plotPointId);
  if (!plotPointIdNum) {
    res.status(400).json({error: "Missing or invalid plotPointId parameter."});
    return;
  }
  const { title } = getStory(storyIdNum);
  const plotPointData = getPlotPoint(plotPointIdNum);
  const plotPoint = plotPointData["plotPoint"];
  if (!plotPoint) {
    res.status(404).json({error: "Plot point not found."});
    return;
  }
  res.status(200).json({
    id: plotPointId,
    storyId: storyId,
    storyTitle: title,
    title: plotPoint.title,
    description: plotPoint.description,
    connectedCharacterIds: plotPointData["connectedCharacters"].map((character: any) => character.id),
    connectedScenes: plotPointData["connectedScenes"],
    connectedCharacters: plotPointData["connectedCharacters"],
    createdAt: plotPoint.created_at,
    editedAt: plotPoint.edited_at,
  });
});

plotPointRouter.post("/", async (req: Request, res: Response) => {
  const { storyId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const { title, description, connectedScenes, connectedCharacterIds } = req.body;
  if (!title || !description) {
    res.status(400).json({error: "Missing required fields: title or description."});
    return;
  }
  if (!connectedScenes || !Array.isArray(connectedScenes)) {
    res.status(400).json({error: "Missing or invalid required fields: connectedScenes."});
    return;
  }
  connectedScenes.forEach((scene: scenePreview) => {
    const { id, version } = scene;
    if (!validateId(id) || !validateId(version)) {
      res.status(400).json({error: "Each connected scene must have a valid id and version field."});
      return;
    }
  });
  if (!connectedCharacterIds || !Array.isArray(connectedCharacterIds)) {
    res.status(400).json({error: "connectedCharacterIds must be an array of numbers."});
    return;
  }
  const titleString = `${title ?? ""}`.trim();
  const descriptionString = description.toString().trim();
  const { plotPointId } = createNewPlotPoint(storyIdNum, titleString, descriptionString, connectedScenes, connectedCharacterIds);
  res.status(201).json({ plotPointId });
});

plotPointRouter.put("/:plotPointId", async (req: Request, res: Response) => {
  const { storyId, plotPointId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const plotPointIdNum = validateId(plotPointId);
  if (!plotPointIdNum) {
    res.status(400).json({error: "Missing or invalid plotPointId parameter."});
    return;
  }
  const { title, description, connectedScenes, connectedCharacterIds } = req.body;
  if (!title || !description) {
    res.status(400).json({error: "Missing required fields: title or description."});
    return;
  }
  if (!connectedScenes || !Array.isArray(connectedScenes)) {
    res.status(400).json({error: "connectedScenes must be an array of numbers."});
    return;
  }
  connectedScenes.forEach((scene: scenePreview) => {
    const { id, version } = scene;
    if (!validateId(id) || !validateId(version)) {
      res.status(400).json({error: "Each connected scene must have a valid id and version field."});
      return;
    }
  });
  if (!connectedCharacterIds || !Array.isArray(connectedCharacterIds)) {
    res.status(400).json({error: "connectedCharacterIds must be an array of numbers."});
    return;
  }
  const titleString = `${title ?? ""}`.trim();
  const descriptionString = description.toString().trim();
  updatePlotPoint(plotPointIdNum, titleString, descriptionString, connectedScenes, connectedCharacterIds);
  res.status(200).json({});
});

plotPointRouter.delete("/:plotPointId", async (req: Request, res: Response) => {
  const { storyId, plotPointId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const plotPointIdNum = validateId(plotPointId);
  if (!plotPointIdNum) {
    res.status(400).json({error: "Missing or invalid plotPointId parameter."});
    return;
  }
  deletePlotPoint(plotPointIdNum);
  res.status(204).json({});
});

export default plotPointRouter;