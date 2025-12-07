import { transactionWrapper } from "./dataAccessUtils";
import { updateDB } from "./dbOperations";

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