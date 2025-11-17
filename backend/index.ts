import app from "./service";
import { getEnvVar } from "./utils/envAccess";

app.listen(getEnvVar("SERVER_PORT"), () => {
  console.log(`Server running on port ${process.env.PORT}`);
});