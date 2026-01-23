import express, { json, Request, Response, NextFunction, Router } from "express";
import cors from "cors";
import { getEnvVar } from "./utils/envAccess";
import sceneRouter from "./route/sceneRouter";
import storyRouter from "./route/storyRouter";
import characterRouter from "./route/characterRouter";
import writingStyleRouter from "./route/writingStyleRouter";
import plotPointRouter from "./route/plotPointRouter";
import highlightRouter from "./route/highlightRouter";

const app = express();

app.use((req: Request, res: Response, next: NextFunction) => {
  if (getEnvVar("VERBOSE") === "true") {
    console.log(`${req.method} ${req.path}`);
  }
  next();
});

app.use(json({limit: "10mb"}));
app.use(cors());

const apiRouter = Router();
app.use("/api", apiRouter);

apiRouter.use("/story", storyRouter);
apiRouter.use("/writingstyle", writingStyleRouter);
storyRouter.use("/:storyId/scene", sceneRouter);
storyRouter.use("/:storyId/character", characterRouter);
storyRouter.use("/:storyId/plotpoint", plotPointRouter);
sceneRouter.use("/:sceneId/version/:sceneVersion/highlights", highlightRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({error: "Route not found."});
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({error: "A server error occurred."});
});

export default app;