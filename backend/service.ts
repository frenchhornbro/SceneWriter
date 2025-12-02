import express, { json, Request, Response, NextFunction, Router } from "express";
import cors from "cors";
import sceneRouter from "./route/sceneRouter";
import { getEnvVar } from "./utils/envAccess";
import storyRouter from "./route/storyRouter";

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
apiRouter.use("/scene", sceneRouter);

app.use((req: Request, res: Response) => {
  res.status(404).send("Route not found.");
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("A server error occurred.");
});

export default app;