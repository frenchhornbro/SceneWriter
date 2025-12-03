import { Router } from "express";

const plotPointRouter = Router();

plotPointRouter.post("/", async (req, res) => {
  res.status(501).json({error: "Not implemented."});
});

plotPointRouter.delete("/:plotPointId", async (req, res) => {
  res.status(501).json({error: "Not implemented."});
});

export default plotPointRouter;