import { Request, Response, Router } from "express";

const storyRouter = Router();

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