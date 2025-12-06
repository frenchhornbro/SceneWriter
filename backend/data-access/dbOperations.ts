import fs from "fs";
import Database from "better-sqlite3";

const dbSchemaPath = "db/schema.sql";
const dbPath = "db/scenewriter.sqlite";
const db = new Database(dbPath);

export function createDB(): void {
  if (fs.existsSync(dbPath)) {
    process.stdout.write("\rDatabase already exists         ");
    return;
  }
  process.stdout.write("\rCreating database...         ");
  const schema = fs.readFileSync(dbSchemaPath, "utf-8");
  db.exec(schema);
  db.close();
  process.stdout.write("\rCreated database             ");
}

export function queryDB(query: string, params: any[] = []): any[] {
  return db.prepare(query).all(...params);
}

export function updateDB(query: string, params: any[] = []): any {
  return db.prepare(query).run(...params);
}