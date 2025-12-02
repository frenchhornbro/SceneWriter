import { Router } from "express";

const writingStyleRouter = Router();

writingStyleRouter.post("/", async (req, res) => {
  res.status(501).send("Not implemented.");
})

export default writingStyleRouter;