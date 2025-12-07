import { transactionWrapper } from "./dataAccessUtils";
import { queryDB, updateDB } from "./dbOperations";

export function getPlotPoint(plotPointId: number): any {
  return transactionWrapper("getPlotPoint", (container) => {
    // Get plot point
    const plotPointQuery = `
      SELECT * FROM PlotPoint WHERE id = ?;
    `;
    const plotPointParams = [plotPointId];
    const plotPoint = queryDB(plotPointQuery, plotPointParams)[0];
    container["plotPoint"] = plotPoint;
    // Get connected scenes
    const sceneQuery = `
      SELECT s.id, s.title
      FROM ScenePlotPoint spp
      JOIN Scene s ON spp.scene_id = s.id
      WHERE spp.plot_point_id = ?;
    `;
    const sceneParams = [plotPointId];
    const connectedScenes = queryDB(sceneQuery, sceneParams);
    container["connectedScenes"] = connectedScenes;
    // Get connected characters
    const characterQuery = `
      SELECT c.id, c.name
      FROM CharacterPlotPoint cpp
      JOIN Character c ON cpp.character_id = c.id
      WHERE cpp.plot_point_id = ?;
    `;
    const characterParams = [plotPointId];
    const connectedCharacters = queryDB(characterQuery, characterParams);
    container["connectedCharacters"] = connectedCharacters;
  });
}

export function createNewPlotPoint(storyId: number, title: string, description: string, connectedSceneIds: number[], connectedCharacterIds: number[]): any {
  return transactionWrapper("createNewPlotPoint", (container) => {
    // Create plot point
    const createQuery = `
      INSERT INTO PlotPoint (story_id, title, description)
      VALUES (?, ?, ?);
    `;
    const createParams = [storyId, title, description];
    const result = updateDB(createQuery, createParams);
    const plotPointId = result.lastInsertRowid;
    container["plotPointId"] = plotPointId;
    // Connect scenes
    connectedSceneIds.forEach((sceneId) => {
      const sceneQuery = `
        INSERT INTO ScenePlotPoint (plot_point_id, scene_id)
        VALUES (?, ?);
      `;
      const sceneParams = [plotPointId, sceneId];
      updateDB(sceneQuery, sceneParams);
    });
    // Connect characters
    connectedCharacterIds.forEach((characterId) => {
      const characterQuery = `
        INSERT INTO CharacterPlotPoint (plot_point_id, character_id)
        VALUES (?, ?);
      `;
      const characterParams = [plotPointId, characterId];
      updateDB(characterQuery, characterParams);
    });
  });
}