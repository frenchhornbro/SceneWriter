import fs from "fs";
import Database from "better-sqlite3";

export async function createDB() {
  if (fs.existsSync("db/scenewriter.sqlite")) {
    process.stdout.write("\rDatabase already exists         ");
    return;
  }
  process.stdout.write("\rCreating database...         ");
  const schema = fs.readFileSync("db/schema.sql", "utf-8");
  const db = new Database("db/scenewriter.sqlite");
  db.exec(schema);
  db.close();
  process.stdout.write("\rCreated database             ");
}