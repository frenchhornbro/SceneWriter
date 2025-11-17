import dotenv from "dotenv";

export function getEnvVar(key: string): string {
  const value = process.env[key];
  return value !== undefined ? value : "";
}

dotenv.config({
  path: process.env.NODE_ENV === "prod" ? ".env.prod" : ".env.dev"
});