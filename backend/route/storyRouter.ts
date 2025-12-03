import { Router } from "express";

const storyRouter = Router();

storyRouter.post("/:storyId", async (req, res) => {
  res.status(501).json({error: "Not implemented."});
});

storyRouter.put("/:storyId", async (req, res) => {
  res.status(501).json({error: "Not implemented."});
});

storyRouter.delete("/:storyId", async (req, res) => {
  res.status(501).json({error: "Not implemented."});
});

export default storyRouter;