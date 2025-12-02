import app from "./service";
import { getEnvVar } from "./utils/envAccess";
import { green } from "./utils/textColor";

process.stdout.write("Initializing server...");

const port = parseInt(getEnvVar("SERVER_PORT")) || 7458;

app.listen(port, () => {
  console.log(green(`\rServer running on port ${port}`));
});