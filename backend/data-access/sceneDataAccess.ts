import { errorHandlerWrapper, transactionWrapper } from "./dataAccessUtils";
import { queryDB, updateDB } from "./dbOperations";

export function getNextSceneOrder(storyId: number): number {
  return errorHandlerWrapper("getNextSceneOrder", () => {
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
        SELECT title, description FROM WritingStyleSample WHERE id = ?;
      `;
      const params = [sampleId];
      const result = queryDB(query, params);
      return result[0];
    });
    return writingStyleSamples;
  });
}

export function createNewScene(
  storyId: number,
  sceneIdParam: number | null,
  version: number,
  overview: string,
  sceneText: string,
  sceneOrder: number,
  title: string,
  pov: string,
  location: string,
  tone: string,
  additionalNotes: string,
  connectedCharacterIds: number[],
  connectedPlotPointIds: number[],
): any {
  return transactionWrapper("createNewScene", (container) => {
    // Create scene
    const createQuery = `
      INSERT INTO Scene (story_id, id, version, overview, scene_text, scene_order, title, pov, location, tone, additional_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const createParams = [storyId, sceneIdParam, version, overview, sceneText, sceneOrder, title, pov, location, tone, additionalNotes];
    const result = updateDB(createQuery, createParams);
    const sceneId = result.lastInsertRowid;
    container["sceneId"] = sceneId;
    // Connect characters
    connectedCharacterIds.forEach((characterId) => {
      const characterQuery = `
        INSERT INTO SceneCharacter (scene_id, character_id)
        VALUES (?, ?);
      `;
      const characterParams = [sceneId, characterId];
      updateDB(characterQuery, characterParams);
    });
    // Connect plot points
    connectedPlotPointIds.forEach((plotPointId) => {
      const plotPointQuery = `
        INSERT INTO ScenePlotPoint (scene_id, plot_point_id)
        VALUES (?, ?);
      `;
      const plotPointParams = [sceneId, plotPointId];
      updateDB(plotPointQuery, plotPointParams);
    });
  });
}