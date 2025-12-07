import { createDB } from "./data-access/dbOperations";
import app from "./service";
import { getEnvVar } from "./utils/envAccess";
import { green } from "./utils/textColor";

console.log("Initializing server...");

const port = parseInt(getEnvVar("SERVER_PORT")) || 7458;

createDB();
app.listen(port, () => {
  console.log(green(`\rServer running on port ${port}`));
});