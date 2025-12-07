import { errorHandlerWrapper } from "./dataAccessUtils";
import { queryDB, updateDB } from "./dbOperations";

export function getStory(storyId: number): any {
  return errorHandlerWrapper("getStory", () => {
    const query = `
      SELECT * FROM Story WHERE id = ?;
    `;
    const params = [storyId];
    const result = queryDB(query, params)[0];
    return result;
  });
}

export function createNewStory(title: string, subtitle: string, overview: string): any {
  return errorHandlerWrapper("createNewStory", () => {
    const createQuery = `
      INSERT INTO Story (title, subtitle, overview)
      VALUES (?, ?, ?);
    `;
    const createParams = [title, subtitle, overview];
    const result = updateDB(createQuery, createParams);
    const storyId = result.lastInsertRowid;
    return storyId;
  });
}