import { Request, Response, Router } from "express";
import { validateId } from "./routerUtils";
import { getHighlightsForScene, getHighlight, createHighlight, updateHighlight, deleteHighlight } from "../data-access/highlightDataAccess";
import type { CreateHighlightRequest, UpdateHighlightRequest } from "@shared/highlight";

const highlightRouter = Router({ mergeParams: true });

// GET /api/story/:storyId/scene/:sceneId/version/:sceneVersion/highlights
highlightRouter.get("/", async (req: Request, res: Response) => {
  const { sceneId, sceneVersion } = req.params;
  const sceneIdNum = validateId(sceneId);
  const sceneVersionNum = validateId(sceneVersion);
  if (!sceneIdNum || !sceneVersionNum) {
    res.status(400).json({ error: "Missing or invalid sceneId or sceneVersion parameter." });
    return;
  }
  const highlights = getHighlightsForScene(sceneIdNum, sceneVersionNum);
  res.status(200).json({ highlights });
});

// GET /api/story/:storyId/scene/:sceneId/version/:sceneVersion/highlights/:highlightId
highlightRouter.get("/:highlightId", async (req: Request, res: Response) => {
  const { highlightId } = req.params;
  const highlightIdNum = validateId(highlightId);
  if (!highlightIdNum) {
    res.status(400).json({ error: "Missing or invalid highlightId parameter." });
    return;
  }
  const highlight = getHighlight(highlightIdNum);
  if (!highlight) {
    res.status(404).json({ error: "Highlight not found." });
    return;
  }
  res.status(200).json({ highlight });
});

// POST /api/story/:storyId/scene/:sceneId/version/:sceneVersion/highlights
highlightRouter.post("/", async (req: Request, res: Response) => {
  const { sceneId, sceneVersion } = req.params;
  const sceneIdNum = validateId(sceneId);
  const sceneVersionNum = validateId(sceneVersion);
  if (!sceneIdNum || !sceneVersionNum) {
    res.status(400).json({ error: "Missing or invalid sceneId or sceneVersion parameter." });
    return;
  }
  const { startOffset, endOffset, exactText, prefixContext, suffixContext, color, note } = req.body;
  // Validate required fields
  if (typeof startOffset !== "number" || typeof endOffset !== "number" || typeof exactText !== "string" || typeof prefixContext !== "string" || typeof suffixContext !== "string" || typeof color !== "string") {
    res.status(400).json({
      error: "Missing or invalid required fields: startOffset, endOffset, exactText, prefixContext, suffixContext, color.",
    });
    return;
  }
  if (startOffset < 0 || endOffset <= startOffset) {
    res.status(400).json({ error: "Invalid offset range." });
    return;
  }
  const highlightData: CreateHighlightRequest = {
    sceneId: sceneIdNum,
    sceneVersion: sceneVersionNum,
    startOffset,
    endOffset,
    exactText,
    prefixContext,
    suffixContext,
    color,
    note: note || null,
  };
  const highlightId = createHighlight(highlightData);
  const newHighlight = getHighlight(highlightId);
  res.status(201).json({ highlight: newHighlight });
});

// PATCH /api/story/:storyId/scene/:sceneId/version/:sceneVersion/highlights/:highlightId
highlightRouter.patch("/:highlightId", async (req: Request, res: Response) => {
  const { highlightId } = req.params;
  const highlightIdNum = validateId(highlightId);
  if (!highlightIdNum) {
    res.status(400).json({ error: "Missing or invalid highlightId parameter." });
    return;
  }
  const { color, note, startOffset, endOffset, exactText, prefixContext, suffixContext } = req.body;
  // Validate at least one field is provided
  if (!color && !note && !startOffset && !endOffset && !exactText && !prefixContext && !suffixContext) {
    res.status(400).json({ error: "No fields provided for update." });
    return;
  }
  const updateData: UpdateHighlightRequest = { color, note, startOffset, endOffset, exactText, prefixContext, suffixContext };
  updateHighlight(highlightIdNum, updateData);
  const updatedHighlight = getHighlight(highlightIdNum);
  res.status(200).json({ highlight: updatedHighlight });
});

// DELETE /api/story/:storyId/scene/:sceneId/version/:sceneVersion/highlights/:highlightId
highlightRouter.delete("/:highlightId", async (req: Request, res: Response) => {
  const { highlightId } = req.params;
  const highlightIdNum = validateId(highlightId);
  if (!highlightIdNum) {
    res.status(400).json({ error: "Missing or invalid highlightId parameter." });
    return;
  }
  deleteHighlight(highlightIdNum);
  res.status(200).json({ message: "Highlight deleted successfully." });
});

export default highlightRouter;
