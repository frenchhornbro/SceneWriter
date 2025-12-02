import { Router } from "express";

const storyRouter = Router();

storyRouter.post("/", async (req, res) => {
  res.status(501).json({error: "Not implemented."});
})

export default storyRouter;