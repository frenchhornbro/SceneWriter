import { Router } from "express";

const characterRouter = Router();

characterRouter.post("/", async (req, res) => {
  res.status(501).json({error: "Not implemented."});
});

characterRouter.delete("/:characterId", async (req, res) => {
  res.status(501).json({error: "Not implemented."});
});

export default characterRouter;