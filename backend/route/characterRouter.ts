import { Request, Response, Router } from "express";

const characterRouter = Router({ mergeParams: true });

characterRouter.get("/", async (req: Request, res: Response) => {
  const { storyId } = req.params;
  res.status(501).json({error: "Not implemented."});
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
    connectedPlotPoints: [
      {
        id: 1,
        title: "Sample Plot Point 1",
        description: "This is a sample description of plot point 1."
      },
      {
        id: 2,
        title: "Sample Plot Point 2",
        description: "This is a sample description of plot point 2."
      }
    ],
    connectedScenes: [
      {
        id: 1,
        title: "Sample Scene 1",
        description: "This is a sample description of scene 1."
      },
      {
        id: 2,
        title: "Sample Scene 2",
        description: "This is a sample description of scene 2."
      },
    ],
    createdAt: new Date().toISOString(),
    editedAt: new Date().toISOString(),
  });
});

characterRouter.post("/", async (req: Request, res: Response) => {
  const { storyId } = req.params;
  res.status(501).json({error: "Not implemented."});
});

characterRouter.put("/:characterId", async (req: Request, res: Response) => {
  const { storyId, characterId } = req.params;
  res.status(501).json({error: "Not implemented."});
});

characterRouter.delete("/:characterId", async (req: Request, res: Response) => {
  res.status(501).json({error: "Not implemented."});
});

export default characterRouter;