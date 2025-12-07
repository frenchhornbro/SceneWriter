import { errorHandlerWrapper } from "./dataAccessUtils";
import { updateDB } from "./dbOperations";

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