import { Request, Response, Router } from "express";
import { createNewCharacter, deleteCharacter, getAllCharacters, getCharacter, updateCharacter } from "../data-access/characterDataAccess";
import { validateId } from "./routerUtils";
import { getStory } from "../data-access/storyDataAccess";
import { scenePreview } from "@shared/templates/scene";

const characterRouter = Router({ mergeParams: true });

characterRouter.get("/", async (req: Request, res: Response) => {
  const { storyId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const characters = getAllCharacters(storyIdNum);
  res.status(200).json({ characters });
});

characterRouter.get("/:characterId", async (req: Request, res: Response) => {
  const { storyId, characterId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const characterIdNum = validateId(characterId);
  if (!characterIdNum) {
    res.status(400).json({error: "Missing or invalid characterId parameter."});
    return;
  }
  const { title } = getStory(storyIdNum);
  const characterData = getCharacter(characterIdNum);
  const character = characterData["character"];
  if (!character) {
    res.status(404).json({error: "Character not found."});
    return;
  }
  res.status(200).json({
    id: characterIdNum,
    storyId: storyIdNum,
    storyTitle: title,
    name: character.name,
    role: character.role,
    physicalDescription: character.physical_description,
    personality: character.personality,
    backstory: character.backstory,
    additionalNotes: character.additional_notes,
    relationships: characterData["relationships"],
    connectedPlotPointIds: characterData["connectedPlotPoints"].map((pp: any) => pp.id),
    connectedSceneIds: characterData["connectedScenes"].map((s: any) => s.id),
    connectedPlotPoints: characterData["connectedPlotPoints"],
    connectedScenes: characterData["connectedScenes"],
    createdAt: character.created_at,
    editedAt: character.edited_at,
  });
});

characterRouter.post("/", (req: Request, res: Response) => {
  const { storyId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const { name, role, physicalDescription, personality, backstory, additionalNotes, relationships, connectedPlotPointIds, connectedScenes } = req.body;
  if (!name) {
    res.status(400).json({error: "Missing required fields: name."});
    return;
  }
  if (!relationships || !Array.isArray(relationships)) {
    res.status(400).json({error: "Missing or invalid required fields: relationships."});
    return;
  }
  if (!connectedPlotPointIds || !Array.isArray(connectedPlotPointIds)) {
    res.status(400).json({error: "Missing or invalid required fields: connectedPlotPointIds."});
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
  const nameString = name.toString().trim();
  const roleString = `${role ?? ""}`.trim();
  const physicalDescriptionString = `${physicalDescription ?? ""}`.trim();
  const personalityString = `${personality ?? ""}`.trim();
  const backstoryString = `${backstory ?? ""}`.trim();
  const additionalNotesString = `${additionalNotes ?? ""}`.trim();
  const { characterId } = createNewCharacter(storyIdNum, nameString, roleString, physicalDescriptionString, personalityString, backstoryString, additionalNotesString, relationships, connectedPlotPointIds, connectedScenes);
  res.status(201).json({ characterId });
});

characterRouter.put("/:characterId", async (req: Request, res: Response) => {
  const { storyId, characterId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const characterIdNum = validateId(characterId);
  if (!characterIdNum) {
    res.status(400).json({error: "Missing or invalid characterId parameter."});
    return;
  }
  const { name, role, physicalDescription, personality, backstory, additionalNotes, relationships, connectedPlotPointIds, connectedScenes } = req.body;
  if (!name) {
    res.status(400).json({error: "Missing required fields: name."});
    return;
  }
  if (!relationships || !Array.isArray(relationships)) {
    res.status(400).json({error: "Missing or invalid required fields: relationships."});
    return;
  }
  if (!connectedPlotPointIds || !Array.isArray(connectedPlotPointIds)) {
    res.status(400).json({error: "Missing or invalid required fields: connectedPlotPointIds."});
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
  const nameString = name.toString().trim();
  const roleString = `${role ?? ""}`.trim();
  const physicalDescriptionString = `${physicalDescription ?? ""}`.trim();
  const personalityString = `${personality ?? ""}`.trim();
  const backstoryString = `${backstory ?? ""}`.trim();
  const additionalNotesString = `${additionalNotes ?? ""}`.trim();
  updateCharacter(characterIdNum, nameString, roleString, physicalDescriptionString, personalityString, backstoryString, additionalNotesString, relationships, connectedPlotPointIds, connectedScenes);
  res.status(200).json({});
});

characterRouter.delete("/:characterId", async (req: Request, res: Response) => {
  const { storyId, characterId } = req.params;
  const storyIdNum = validateId(storyId);
  if (!storyIdNum) {
    res.status(400).json({error: "Missing or invalid storyId parameter."});
    return;
  }
  const characterIdNum = validateId(characterId);
  if (!characterIdNum) {
    res.status(400).json({error: "Missing or invalid characterId parameter."});
    return;
  }
  deleteCharacter(characterIdNum);
  res.status(204).json({});
});

export default characterRouter;