import { errorHandlerWrapper } from "./dataAccessUtils";
import { queryDB, updateDB } from "./dbOperations";

export function getWritingStyleSample(writingStyleId: number): any {
  return errorHandlerWrapper("getWritingStyleSample", () => {
    const query = `
      SELECT * FROM WritingStyleSample WHERE id = ?;
    `;
    const params = [writingStyleId];
    const result = queryDB(query, params)[0];
    return result;
  });
}

export function getAllWritingStyleSamples(): any[] {
  return errorHandlerWrapper("getAllWritingStyleSamples", () => {
    const query = `
      SELECT * FROM WritingStyleSample ORDER BY edited_at DESC;
    `;
    const result = queryDB(query);
    return result;
  });
}

export function createNewWritingStyleSample(title: string, prompt: string, content: string, wordCount: number): void {
  return errorHandlerWrapper("createNewWritingStyleSample", () => {
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

export function updateWritingStyleSample(writingStyleId: number, title: string, content: string, wordCount: number): void {
  return errorHandlerWrapper("updateWritingStyleSample", () => {
    const query = `
      UPDATE WritingStyleSample
      SET title = ?, content = ?, word_count = ?, edited_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `;
    const params = [title, content, wordCount, writingStyleId];
    updateDB(query, params);
  });
}

export function deleteWritingStyleSample(writingStyleId: number): void {
  return errorHandlerWrapper("deleteWritingStyleSample", () => {
    const query = `
      DELETE FROM WritingStyleSample WHERE id = ?;
    `;
    const params = [writingStyleId];
    updateDB(query, params);
  });
}