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

export function getAllStories(): any[] {
  return errorHandlerWrapper("getAllStories", () => {
    const query = `
      SELECT id, title, subtitle, overview, created_at AS createdAt, edited_at AS editedAt FROM Story ORDER BY edited_at DESC;
    `;
    const params: any[] = [];
    const result = queryDB(query, params);
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

export function updateStory(storyId: number, title: string, subtitle: string, overview: string): void {
  return errorHandlerWrapper("updateStory", () => {
    const updateQuery = `
      UPDATE Story
      SET title = ?, subtitle = ?, overview = ?, edited_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `;
    const updateParams = [title, subtitle, overview, storyId];
    updateDB(updateQuery, updateParams);
  });
}

export function deleteStory(storyId: number): void {
  return errorHandlerWrapper("deleteStory", () => {
    const deleteQuery = `
      DELETE FROM Story WHERE id = ?;
    `;
    const deleteParams = [storyId];
    updateDB(deleteQuery, deleteParams);
  });
}