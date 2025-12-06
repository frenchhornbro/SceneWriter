import { errorHandlerWrapper } from "./dataAccessUtils";
import { updateDB } from "./dbOperations";

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