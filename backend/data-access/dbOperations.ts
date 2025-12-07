import fs from "fs";
import Database from "better-sqlite3";

const dbSchemaPath = "db/schema.sql";
const dbPath = "db/scenewriter.sqlite";
const db = new Database(dbPath);

export function createDB(): void {
  console.log("Initializing database...");
  const schema = fs.readFileSync(dbSchemaPath, "utf-8");
  db.exec(schema);
  console.log("Database initialized");
}

export function queryDB(query: string, params: any[] = []): any[] {
  return db.prepare(query).all(...params);
}

export function updateDB(query: string, params: any[] = []): any {
  return db.prepare(query).run(...params);
}

export function transactionDB(func: (container: any) => any, container: any): any {
  return db.transaction(() => func(container))();
}