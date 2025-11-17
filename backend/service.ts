import express, { json, Request, Response, NextFunction, Router } from "express";
import cors from "cors";
import sceneRouter from "./route/sceneRouter";

const app = express();
app.use(json({limit: "10mb"}));
app.use(cors());

const apiRouter = Router();
app.use("/api", apiRouter);

apiRouter.use("/scene", sceneRouter);

app.use("*", (req: Request, res: Response) => {
  res.status(404).send("Route not found.");
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("A server error occurred.");
});

export default app;