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

export async function createNewWritingStyleSample(title: string, prompt: string, content: string, wordCount: number): Promise<void> {
  await errorHandlerWrapper("createNewWritingStyleSample", async () => {
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