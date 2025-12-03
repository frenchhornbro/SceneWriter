import { Router } from "express";

const writingStyleRouter = Router();

writingStyleRouter.post("/", async (req, res) => {
  res.status(501).json({error: "Not implemented."});
});

writingStyleRouter.put("/:writingStyleId", async (req, res) => {
  res.status(501).json({error: "Not implemented."});
});

writingStyleRouter.delete("/:writingStyleId", async (req, res) => {
  res.status(501).json({error: "Not implemented."});
});

export default writingStyleRouter;