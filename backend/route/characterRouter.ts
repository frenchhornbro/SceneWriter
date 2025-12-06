import { Request, Response, Router } from "express";

const characterRouter = Router({ mergeParams: true });

characterRouter.get("/", async (req: Request, res: Response) => {
  // TODO: Return actual data from the DB
  res.status(200).json({
    characters: [
      {
        id: 1,
        name: "Sample Character 1",
        role: "Protagonist",
        editedAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Sample Character 2",
        role: "Antagonist",
        editedAt: new Date().toISOString(),
      },
      {
        id: 3,
        name: "Sample Character 3",
        editedAt: new Date().toISOString(),
      }
    ],
  });
});

characterRouter.get("/:characterId", async (req: Request, res: Response) => {
  const { storyId, characterId } = req.params;
  // TODO: Return actual data from the DB
  res.status(200).json({
    id: characterId,
    storyId: storyId,
    storyTitle: "Sample Story Title",
    name: "Sample Character",
    role: "Protagonist",
    physicalDescription: "This is a sample physical description of the character.",
    personality: "This is a sample personality description of the character.",
    backstory: "This is a sample background story of the character.",
    additionalNotes: "These are some sample notes about the character.",
    relationships: [
      {
        id: 1,
        name: "Bob",
        description: "Friendship",
        role: "Sidekick"
      },
      {
        id: 2,
        name: "Eve",
        description: "Rivalry",
        role: "Antagonist"
      }
    ],
    connectedPlotPointIds: [1, 2],
    connectedSceneIds: [1, 2],
    createdAt: new Date().toISOString(),
    editedAt: new Date().toISOString(),
  });
});

characterRouter.post("/", async (req: Request, res: Response) => {
  const { storyId } = req.params;
  const characterId = 1; //TODO: Create character in DB and return actual ID
  res.status(200).json({ characterId: characterId });
});

characterRouter.put("/:characterId", async (req: Request, res: Response) => {
  const { storyId, characterId } = req.params;
  res.status(501).json({error: "Not implemented."});
});

characterRouter.delete("/:characterId", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

export default characterRouter;