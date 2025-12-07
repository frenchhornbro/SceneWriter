import { Request, Response, Router } from "express";
import { validateId } from "./routerUtils";
import { createNewPlotPoint } from "../data-access/plotPointDataAccess";

const plotPointRouter = Router({ mergeParams: true });

plotPointRouter.get("/", async (req: Request, res: Response) => {
  // TODO: Return actual data from the DB
  res.status(200).json({
    plotPoints: [
      {
        id: 1,
        title: "Sample Plot Point 1",
        descriptionPage: "This is a sample description of plot point 1.",
        editedAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Sample Plot Point 2",
        descriptionPage: "This is a sample description of plot point 2.",
        editedAt: new Date().toISOString(),
      },
    ],
  });
});

plotPointRouter.get("/:plotPointId", async (req: Request, res: Response) => {
  const { storyId, plotPointId } = req.params;
  // TODO: Return actual data from the DB
  res.status(200).json({
    id: plotPointId,
    storyId: storyId,
    storyTitle: "Sample Story Title",
    title: "Sample Plot Point",
    description: "This is a sample description of the plot point.",
    connectedSceneIds: [1, 2],
    connectedCharacterIds: [1, 2],
    createdAt: new Date().toISOString(),
    editedAt: new Date().toISOString(),
  });
});

plotPointRouter.post("/", async (req: Request, res: Response) => {
  const { storyId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const { title, description, connectedSceneIds, connectedCharacterIds } = req.body;
  if (!description) {
    res.status(400).json({error: "Missing required fields: description."});
    return;
  }
  if (!connectedSceneIds || !Array.isArray(connectedSceneIds)) {
    res.status(400).json({error: "connectedSceneIds must be an array of numbers."});
    return;
  }
  if (!connectedCharacterIds || !Array.isArray(connectedCharacterIds)) {
    res.status(400).json({error: "connectedCharacterIds must be an array of numbers."});
    return;
  }
  const titleString = `${title ?? ""}`.trim();
  const descriptionString = description.toString().trim();
  const { plotPointId } = createNewPlotPoint(storyIdNum, titleString, descriptionString, connectedSceneIds, connectedCharacterIds);
  res.status(201).json({ plotPointId });
});

plotPointRouter.put("/:plotPointId", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

plotPointRouter.delete("/:plotPointId", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

export default plotPointRouter;