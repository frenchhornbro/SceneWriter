import { errorHandlerWrapper, transactionWrapper } from "./dataAccessUtils";
import { queryDB, updateDB } from "./dbOperations";
import type { SceneHighlight, CreateHighlightRequest, UpdateHighlightRequest, TextEdit } from "@shared/highlight";

// Helper to convert database row to SceneHighlight type
function dbRowToHighlight(row: any): SceneHighlight {
  return {
    id: row.id,
    sceneId: row.scene_id,
    sceneVersion: row.scene_version,
    startOffset: row.start_offset,
    endOffset: row.end_offset,
    exactText: row.exact_text,
    prefixContext: row.prefix_context,
    suffixContext: row.suffix_context,
    color: row.color,
    note: row.note,
    isValid: row.is_valid === 1,
    createdAt: row.created_at,
    editedAt: row.edited_at,
  };
}

export function getHighlightsForScene(sceneId: number, sceneVersion: number): SceneHighlight[] {
  return errorHandlerWrapper("getHighlightsForScene", () => {
    const query = `
      SELECT * FROM SceneHighlight
      WHERE scene_id = ? AND scene_version = ?
      ORDER BY start_offset ASC;
    `;
    const params = [sceneId, sceneVersion];
    const result = queryDB(query, params);
    return result.map(dbRowToHighlight);
  });
}

export function getHighlight(highlightId: number): SceneHighlight | null {
  return errorHandlerWrapper("getHighlight", () => {
    const query = `
      SELECT * FROM SceneHighlight
      WHERE id = ?;
    `;
    const params = [highlightId];
    const result = queryDB(query, params);
    return result.length > 0 ? dbRowToHighlight(result[0]) : null;
  });
}

export function createHighlight(data: CreateHighlightRequest): number {
  return errorHandlerWrapper("createHighlight", () => {
    const query = `
      INSERT INTO SceneHighlight (
        scene_id, scene_version, start_offset, end_offset,
        exact_text, prefix_context, suffix_context, color, note
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const params = [
      data.sceneId,
      data.sceneVersion,
      data.startOffset,
      data.endOffset,
      data.exactText,
      data.prefixContext,
      data.suffixContext,
      data.color,
      data.note || null,
    ];
    const result = updateDB(query, params);
    return result.lastInsertRowid as number;
  });
}

export function updateHighlight(highlightId: number, data: UpdateHighlightRequest): void {
  return errorHandlerWrapper("updateHighlight", () => {
    const updates: string[] = [];
    const params: any[] = [];

    if (data.color !== undefined) {
      updates.push("color = ?");
      params.push(data.color);
    }
    if (data.note !== undefined) {
      updates.push("note = ?");
      params.push(data.note);
    }
    if (data.startOffset !== undefined) {
      updates.push("start_offset = ?");
      params.push(data.startOffset);
    }
    if (data.endOffset !== undefined) {
      updates.push("end_offset = ?");
      params.push(data.endOffset);
    }
    if (data.exactText !== undefined) {
      updates.push("exact_text = ?");
      params.push(data.exactText);
    }
    if (data.prefixContext !== undefined) {
      updates.push("prefix_context = ?");
      params.push(data.prefixContext);
    }
    if (data.suffixContext !== undefined) {
      updates.push("suffix_context = ?");
      params.push(data.suffixContext);
    }

    if (updates.length === 0) {
      return;
    }

    updates.push("edited_at = CURRENT_TIMESTAMP");
    params.push(highlightId);

    const query = `
      UPDATE SceneHighlight
      SET ${updates.join(", ")}
      WHERE id = ?;
    `;
    updateDB(query, params);
  });
}

export function deleteHighlight(highlightId: number): void {
  return errorHandlerWrapper("deleteHighlight", () => {
    const query = `
      DELETE FROM SceneHighlight
      WHERE id = ?;
    `;
    const params = [highlightId];
    updateDB(query, params);
  });
}

export function markHighlightInvalid(highlightId: number): void {
  return errorHandlerWrapper("markHighlightInvalid", () => {
    const query = `
      UPDATE SceneHighlight
      SET is_valid = 0, edited_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `;
    const params = [highlightId];
    updateDB(query, params);
  });
}

export function markHighlightValid(highlightId: number): void {
  return errorHandlerWrapper("markHighlightValid", () => {
    const query = `
      UPDATE SceneHighlight
      SET is_valid = 1, edited_at = CURRENT_TIMESTAMP
      WHERE id = ?;
    `;
    const params = [highlightId];
    updateDB(query, params);
  });
}

export function recordTextEdit(
  sceneId: number,
  sceneVersion: number,
  editPosition: number,
  charsInserted: number,
  charsDeleted: number
): number {
  return errorHandlerWrapper("recordTextEdit", () => {
    const query = `
      INSERT INTO TextEdit (
        scene_id, scene_version, edit_position, chars_inserted, chars_deleted
      )
      VALUES (?, ?, ?, ?, ?);
    `;
    const params = [sceneId, sceneVersion, editPosition, charsInserted, charsDeleted];
    const result = updateDB(query, params);
    return result.lastInsertRowid as number;
  });
}

export function getTextEditsForScene(sceneId: number, sceneVersion: number): TextEdit[] {
  return errorHandlerWrapper("getTextEditsForScene", () => {
    const query = `
      SELECT * FROM TextEdit
      WHERE scene_id = ? AND scene_version = ?
      ORDER BY created_at ASC;
    `;
    const params = [sceneId, sceneVersion];
    const result = queryDB(query, params);
    return result.map((row: any) => ({
      id: row.id,
      sceneId: row.scene_id,
      sceneVersion: row.scene_version,
      editPosition: row.edit_position,
      charsInserted: row.chars_inserted,
      charsDeleted: row.chars_deleted,
      createdAt: row.created_at,
    }));
  });
}

export function bulkUpdateHighlights(highlights: Array<{ id: number; data: UpdateHighlightRequest }>): void {
  return errorHandlerWrapper("bulkUpdateHighlights", () => {
    highlights.forEach(({ id, data }) => {
      updateHighlight(id, data);
    });
  });
}
