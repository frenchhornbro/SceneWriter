import { errorHandlerWrapper } from "./dataAccessUtils";
import { queryDB, updateDB } from "./dbOperations";

export async function getWritingStyleSample(writingStyleId: number): Promise<any> {
  return await errorHandlerWrapper("getWritingStyleSample", async () => {
    const query = `
      SELECT * FROM WritingStyleSample WHERE id = ?;
    `;
    const params = [writingStyleId];
    const result = queryDB(query, params)[0];
    return result;
  });
}

export async function getAllWritingStyleSamples(): Promise<any[]> {
  return await errorHandlerWrapper("getAllWritingStyleSamples", async () => {
    const query = `
      SELECT * FROM WritingStyleSample ORDER BY edited_at DESC;
    `;
    const result = queryDB(query);
    return result;
  });
}

export async function createNewWritingStyleSample(title: string, prompt: string, content: string, wordCount: number): Promise<void> {
  return await errorHandlerWrapper("createNewWritingStyleSample", async () => {
    const query = `
      INSERT INTO WritingStyleSample (title, prompt, content, word_count)
      VALUES (?, ?, ?, ?);
    `;
    const params = [title, prompt, content, wordCount];
    const result = updateDB(query, params);
    const writingStyleId = result.lastInsertRowid;
    return writingStyleId;
  });
}

export async function deleteWritingStyleSample(writingStyleId: number): Promise<void> {
  return await errorHandlerWrapper("deleteWritingStyleSample", async () => {
    const query = `
      DELETE FROM WritingStyleSample WHERE id = ?;
    `;
    const params = [writingStyleId];
    updateDB(query, params);
  });
}