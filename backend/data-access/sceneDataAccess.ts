import { errorHandlerWrapper, transactionWrapper } from "./dataAccessUtils";
import { queryDB, updateDB } from "./dbOperations";
import type { scenePreview } from "@shared/templates/scene";

export function getScene(sceneId: number, sceneVersion: number): any {
  return transactionWrapper("getScene", (container) => {
    // Get scene
    const sceneQuery = `
      SELECT * FROM Scene WHERE id = ? AND version = ?;
    `;
    const sceneParams = [sceneId, sceneVersion];
    const scene = queryDB(sceneQuery, sceneParams)[0];
    container["scene"] = scene;
    // Get connected characters
    const characterQuery = `
      SELECT c.id, c.name
      FROM SceneCharacter sc
      JOIN Character c ON sc.character_id = c.id
      WHERE sc.scene_id = ? AND sc.scene_version = ?;
    `;
    const characterParams = [sceneId, sceneVersion];
    const connectedCharacters = queryDB(characterQuery, characterParams);
    container["connectedCharacters"] = connectedCharacters;
    // Get connected plot points
    const plotPointQuery = `
      SELECT pp.id, pp.title
      FROM ScenePlotPoint spp
      JOIN PlotPoint pp ON spp.plot_point_id = pp.id
      WHERE spp.scene_id = ? AND spp.scene_version = ?;
    `;
    const plotPointParams = [sceneId, sceneVersion];
    const connectedPlotPoints = queryDB(plotPointQuery, plotPointParams);
    container["connectedPlotPoints"] = connectedPlotPoints;
  });
}

export function getAllScenes(storyId: number): scenePreview[] {
  return errorHandlerWrapper("getAllScenes", () => {
    const query = `
      SELECT id, version, title, scene_text, overview, chapter_number, created_at, edited_at
      FROM Scene
      WHERE story_id = ?
      ORDER BY edited_at DESC;
    `;
    const params = [storyId];
    const result = queryDB(query, params);
    return result;
  });
}

export function getNextSceneOrder(storyId: number): number {
  return errorHandlerWrapper("getNextSceneOrder", () => {
    // TODO: Fix the logic in this query.
    const query = `
      SELECT COALESCE(MAX(scene_order), 0) + 1 AS sceneOrder FROM Scene WHERE story_id = ?;
    `;
    const params = [storyId];
    const result = queryDB(query, params);
    const sceneOrder = result[0]?.sceneOrder || 1;
    return sceneOrder;
  });
}

export function getPlotPointInfo(connectedPlotPointIds: number[]): any[] {
  return errorHandlerWrapper("getPlotPointInfo", () => {
    const plotPoints = connectedPlotPointIds.map((plotPointId) => {
      const query = `
        SELECT title, description FROM PlotPoint WHERE id = ?;
      `;
      const params = [plotPointId];
      const result = queryDB(query, params);
      return result[0];
    });
    return plotPoints;
  });
}

export function getCharacterInfo(connectedCharacterIds: number[]): any[] {
  return errorHandlerWrapper("getCharacterInfo", () => {
    const characters = connectedCharacterIds.map((characterId) => {
      const query = `
        SELECT name, role, physical_description, personality, backstory, additional_notes
        FROM Character
        WHERE id = ?;
      `;
      const params = [characterId];
      const result = queryDB(query, params);
      return result[0];
    });
    return characters;
  });
}

export function getWritingStyleSampleInfo(connectedWritingStyleSampleIds: number[]): any[] {
  return errorHandlerWrapper("getWritingStyleSampleInfo", () => {
    const writingStyleSamples = connectedWritingStyleSampleIds.map((sampleId) => {
      const query = `
        SELECT title, content FROM WritingStyleSample WHERE id = ?;
      `;
      const params = [sampleId];
      const result = queryDB(query, params);
      return result[0];
    });
    return writingStyleSamples;
  });
}

export function getLatestVersion(sceneId: number): number | null {
  return errorHandlerWrapper("getLatestVersion", () => {
    const query = `
      SELECT MAX(version) AS latestVersion FROM Scene WHERE id = ?;
    `;
    const params = [sceneId];
    const result = queryDB(query, params);
    return result[0]?.latestVersion || null;
  });
}

export function createNewScene(
  storyId: number,
  sceneIdParam: number | null,
  version: number,
  overview: string,
  sceneText: string,
  sceneOrder: number,
  chapterNumber: number,
  title: string,
  pov: string,
  location: string,
  tone: string,
  additionalNotes: string,
  connectedCharacterIds: number[],
  connectedPlotPointIds: number[],
): any {
  return transactionWrapper("createNewScene", (container) => {
    if (sceneIdParam === null) {
      // Get a new scene ID
      const idQuery = `
        SELECT COALESCE(MAX(id), 0) + 1 AS newId FROM Scene;
      `;
      const idResult = queryDB(idQuery, []);
      sceneIdParam = idResult[0]?.newId || 1;
    }
    const sceneId = sceneIdParam;
    // Create scene
    const createQuery = `
      INSERT INTO Scene (story_id, id, version, overview, scene_text, scene_order, chapter_number, title, pov, location, tone, additional_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const createParams = [storyId, sceneId, version, overview, sceneText, sceneOrder, chapterNumber, title, pov, location, tone, additionalNotes];
    updateDB(createQuery, createParams);
    container["sceneId"] = sceneId;
    // Connect characters
    const characterQuery = `
      INSERT INTO SceneCharacter (scene_id, scene_version, character_id)
      VALUES ${connectedCharacterIds.map(() => "(?, ?, ?)").join(", ")};
    `;
    const characterParams = connectedCharacterIds.flatMap((characterId) => [sceneId, version, characterId]);
    updateDB(characterQuery, characterParams);
    // Connect plot points
    const plotPointQuery = `
      INSERT INTO ScenePlotPoint (scene_id, scene_version, plot_point_id)
      VALUES ${connectedPlotPointIds.map(() => "(?, ?, ?)").join(", ")};
    `;
    const plotPointParams = connectedPlotPointIds.flatMap((plotPointId) => [sceneId, version, plotPointId]);
    updateDB(plotPointQuery, plotPointParams);
  });
}

export function deleteScene(sceneId: number, sceneVersion: number): void {
  return errorHandlerWrapper("deleteScene", () => {
    const deleteQuery = `
      DELETE FROM Scene WHERE id = ? AND version = ?;
    `;
    const params = [sceneId, sceneVersion];
    updateDB(deleteQuery, params);
  });
}