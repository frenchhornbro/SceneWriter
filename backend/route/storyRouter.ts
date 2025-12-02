import { Router } from "express";

const storyRouter = Router();

storyRouter.post("/", async (req, res) => {
  res.status(501).send("Not implemented.");
})

export default storyRouter;