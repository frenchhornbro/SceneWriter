import app from "./service";
import { getEnvVar } from "./utils/envAccess";

const port = parseInt(getEnvVar("SERVER_PORT")) || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});